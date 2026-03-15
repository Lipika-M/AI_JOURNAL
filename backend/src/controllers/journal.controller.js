import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Journal } from "../models/journal.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose, { Schema } from "mongoose";
import { analyzeJournal } from "../services/ai.service.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { getCache, setCache, invalidateJournalCache } from "../utils/cache.js";

const sqsClient = new SQSClient({ region: process.env.AWS_REGION });
const QUEUE_URL = process.env.SQS_QUEUE_URL;

const JOURNAL_LIST_TTL = 120;
const JOURNAL_DETAIL_TTL = 300;

const normalizeTags = (tags) => {
  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag || "").trim().toLowerCase()).filter(Boolean);
  }

  if (typeof tags === "string") {
    try {
      const parsed = JSON.parse(tags);
      if (Array.isArray(parsed)) {
        return parsed.map((tag) => String(tag || "").trim().toLowerCase()).filter(Boolean);
      }
    } catch {
      return tags.split(",").map((tag) => tag.trim().toLowerCase()).filter(Boolean);
    }
  }

  return [];
};

const normalizePublicIds = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item || "").trim()).filter(Boolean);
      }
    } catch {
      return value.split(",").map((item) => item.trim()).filter(Boolean);
    }
  }

  return [];
};

const normalizeBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  return false;
};

const createJournal = asyncHandler(async (req, res) => {
  const { title, content, tags } = req.body;
  if (!title || title.trim() === "") {
    throw new ApiError(400, "Title is required");
  }
  if (!content || content.trim() === "") {
    throw new ApiError(400, "Content is required");
  }

  const normalizedTags = normalizeTags(tags);
  const files = req.files || [];

  if (files.length > 2) {
    throw new ApiError(400, "You can upload a maximum of 2 images");
  }

  const uploadedImages = [];
  for (const file of files) {
    const image = await uploadOnCloudinary(file.path);
    if (!image?.secure_url || !image?.public_id) {
      throw new ApiError(500, "Image upload failed");
    }
    uploadedImages.push({ url: image.secure_url, publicId: image.public_id });
  }

  const journal = await Journal.create({
    owner: req.user._id,
    title: title.trim(),
    content: content.trim(),
    tags: normalizedTags,
    images: uploadedImages,
    aiStatus: "pending",
  });

  await invalidateJournalCache(String(req.user._id), String(journal._id));

  const command = new SendMessageCommand({
    QueueUrl: QUEUE_URL,
    MessageBody: JSON.stringify({ journalId: journal._id, userId: req.user._id }),
  });
  await sqsClient.send(command);

  res
    .status(201)
    .json(new ApiResponse(201, "Journal saved! AI summary will be processed shortly.", journal));
});

const updateJournal = asyncHandler(async (req, res) => {
  const journalId = req.params.id;
  if (!journalId) {
    throw new ApiError(400, "No Journal found");
  }
  const { title, content, tags, removeImagePublicIds, appendImages } = req.body;

  const existingJournal = await Journal.findOne({
    _id: journalId,
    owner: req.user._id,
    isDeleted: false,
  });

  if (!existingJournal) {
    throw new ApiError(
      404,
      "Journal not found or you are not authorized to update it"
    );
  }

  const updateFields = {};
  if (typeof title === "string") {
    if (!title.trim()) {
      throw new ApiError(400, "Title cannot be empty");
    }
    updateFields.title = title.trim();
  }

  const hasContentUpdate = typeof content === "string";
  if (hasContentUpdate) {
    if (!content.trim()) {
      throw new ApiError(400, "Content cannot be empty");
    }
    updateFields.content = content.trim();
    updateFields.aiStatus = "pending";
  }
  if (typeof tags !== "undefined") {
    updateFields.tags = normalizeTags(tags);
  }

  const files = req.files || [];
  if (files.length > 2) {
    throw new ApiError(400, "You can upload a maximum of 2 images");
  }

  const shouldAppendImages = normalizeBoolean(appendImages);
  const imageIdsToRemove = normalizePublicIds(removeImagePublicIds);
  let currentImages = Array.isArray(existingJournal.images)
    ? [...existingJournal.images]
    : [];

  if (imageIdsToRemove.length > 0) {
    const removedImages = currentImages.filter((image) =>
      imageIdsToRemove.includes(image.publicId)
    );

    currentImages = currentImages.filter(
      (image) => !imageIdsToRemove.includes(image.publicId)
    );

    if (removedImages.length > 0) {
      await Promise.all(
        removedImages.map((image) => deleteFromCloudinary(image.publicId))
      );
    }
  }

  if (files.length > 0) {
    const uploadedImages = [];
    for (const file of files) {
      const image = await uploadOnCloudinary(file.path);
      if (!image?.secure_url || !image?.public_id) {
        throw new ApiError(500, "Image upload failed");
      }
      uploadedImages.push({ url: image.secure_url, publicId: image.public_id });
    }

    if (shouldAppendImages) {
      if (currentImages.length + uploadedImages.length > 2) {
        throw new ApiError(400, "You can upload a maximum of 2 images");
      }
      updateFields.images = [...currentImages, ...uploadedImages];
    } else {
      if (currentImages.length > 0) {
        await Promise.all(
          currentImages.map((image) => deleteFromCloudinary(image.publicId))
        );
      }
      updateFields.images = uploadedImages;
    }
  } else if (imageIdsToRemove.length > 0) {
    updateFields.images = currentImages;
  }

  Object.assign(existingJournal, updateFields);
  const updatedJournal = await existingJournal.save({ validateBeforeSave: true });

  await invalidateJournalCache(String(req.user._id), String(updatedJournal._id));

  res
    .status(200)
    .json(new ApiResponse(200, "Journal updated successfully", updatedJournal));

  if (hasContentUpdate) {
    analyzeJournal(updateFields.content, String(updatedJournal._id))
      .then(async (aiResult) => {
        await Journal.findByIdAndUpdate(updatedJournal._id, {
          sentiment: aiResult.sentiment,
          moodScore: aiResult.moodScore,
          summary: aiResult.summary,
          aiStatus: "completed",
        });
        await invalidateJournalCache(
          String(req.user._id),
          String(updatedJournal._id)
        );
      })
      .catch(async (error) => {
        await Journal.findByIdAndUpdate(updatedJournal._id, {
          aiStatus: "failed",
        });
        await invalidateJournalCache(
          String(req.user._id),
          String(updatedJournal._id)
        );
      });
  }
});

const getAllJournals = asyncHandler(async (req, res) => {
  const userId = String(req.user._id);
  const cacheKey = `journals:${userId}:list`;
  const cachedJournals = await getCache(cacheKey);

  if (cachedJournals !== null) {
    return res
      .status(200)
      .json(
        new ApiResponse(200, "Journals retrieved successfully", cachedJournals)
      );
  }

  const journals = await Journal.find({
    owner: req.user._id,
    isDeleted: false,
  }).sort({ createdAt: -1 });
  await setCache(cacheKey, journals, JOURNAL_LIST_TTL);
  res
    .status(200)
    .json(new ApiResponse(200, "Journals retrieved successfully", journals));
});

const getJournalById = asyncHandler(async (req, res) => {
  const journalId = req.params.id;

  if (!journalId) {
    throw new ApiError(400, "Journal ID is required");
  }
  if (
    !mongoose.Types.ObjectId.isValid(new mongoose.Types.ObjectId(journalId))
  ) {
    throw new ApiError(400, "Invalid journal ID");
  }

  const userId = String(req.user._id);
  const cacheKey = `journals:${userId}:detail:${journalId}`;
  const cachedJournal = await getCache(cacheKey);

  if (cachedJournal !== null) {
    return res
      .status(200)
      .json(new ApiResponse(200, "Journal retrieved successfully", cachedJournal));
  }

  const journal = await Journal.findOne({
    _id: journalId,
    owner: req.user._id,
    isDeleted: false,
  });
  if (!journal) {
    throw new ApiError(
      404,
      "Journal not found or you are not authorized to view it"
    );
  }

  await setCache(cacheKey, journal, JOURNAL_DETAIL_TTL);

  res
    .status(200)
    .json(new ApiResponse(200, "Journal retrieved successfully", journal));
});

const deleteJournal = asyncHandler(async (req, res) => {
  const journalId = req.params.id;
  if (!journalId) {
    throw new ApiError(400, "Journal ID is required");
  }
  if (
    !mongoose.Types.ObjectId.isValid(new mongoose.Types.ObjectId(journalId))
  ) {
    throw new ApiError(400, "Invalid journal ID");
  }
  const existingJournal = await Journal.findOne({
    _id: journalId,
    owner: req.user._id,
    isDeleted: false,
  });

  if (!existingJournal) {
    throw new ApiError(404, "Journal not found or unauthorized");
  }

  if (Array.isArray(existingJournal.images) && existingJournal.images.length > 0) {
    await Promise.all(
      existingJournal.images.map((image) => deleteFromCloudinary(image.publicId))
    );
  }

  existingJournal.isDeleted = true;
  const deletedJournal = await existingJournal.save({ validateBeforeSave: false });

  if (!deletedJournal) {
    throw new ApiError(404, "Journal not found or unauthorized");
  }

  await invalidateJournalCache(String(req.user._id), String(journalId));

  res.status(200).json(new ApiResponse(200, "Journal deleted successfully"));
});

export {
  createJournal,
  updateJournal,
  getAllJournals,
  getJournalById,
  deleteJournal,
};
