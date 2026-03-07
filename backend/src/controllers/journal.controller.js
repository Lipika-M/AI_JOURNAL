import { asyncHandler } from "../utils/asyncHandler.js";
import { Journal } from "../models/journal.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose, { Schema } from "mongoose";
import { analyzeJournal } from "../services/ai.service.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

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

  res
    .status(201)
    .json(new ApiResponse(201, "Journal created successfully", journal));

  // Run AI analysis asynchronously in the background
  analyzeJournal(journal.content)
    .then(async (aiResult) => {
      await Journal.findByIdAndUpdate(journal._id, {
        sentiment: aiResult.sentiment,
        moodScore: aiResult.moodScore,
        summary: aiResult.summary,
        aiStatus: "completed",
      });
       
    })
    .catch(async (error) => {
      await Journal.findByIdAndUpdate(journal._id, {
        aiStatus: "failed",
      });
      
    });
});

const updateJournal = asyncHandler(async (req, res) => {
  const journalId = req.params.id;
  if (!journalId) {
    throw new ApiError(400, "No Journal found");
  }
  const { title, content, tags } = req.body;

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

  if (files.length > 0) {
    const uploadedImages = [];
    for (const file of files) {
      const image = await uploadOnCloudinary(file.path);
      if (!image?.secure_url || !image?.public_id) {
        throw new ApiError(500, "Image upload failed");
      }
      uploadedImages.push({ url: image.secure_url, publicId: image.public_id });
    }

    updateFields.images = uploadedImages;
  }

  Object.assign(existingJournal, updateFields);
  const updatedJournal = await existingJournal.save({ validateBeforeSave: true });

  res
    .status(200)
    .json(new ApiResponse(200, "Journal updated successfully", updatedJournal));

  if (hasContentUpdate) {
    analyzeJournal(updateFields.content)
      .then(async (aiResult) => {
        await Journal.findByIdAndUpdate(updatedJournal._id, {
          sentiment: aiResult.sentiment,
          moodScore: aiResult.moodScore,
          summary: aiResult.summary,
          aiStatus: "completed",
        });
      })
      .catch(async (error) => {
        await Journal.findByIdAndUpdate(updatedJournal._id, {
          aiStatus: "failed",
        });
      });
  }
});

const getAllJournals = asyncHandler(async (req, res) => {
  const journals = await Journal.find({
    owner: req.user._id,
    isDeleted: false,
  }).sort({ createdAt: -1 });
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
  const deletedJournal = await Journal.findOneAndUpdate(
    { _id: journalId, owner: req.user._id, isDeleted: false },
    { isDeleted: true },
    { new: true }
  );

  if (!deletedJournal) {
    throw new ApiError(404, "Journal not found or unauthorized");
  }
  res.status(200).json(new ApiResponse(200, "Journal deleted successfully"));
});

export {
  createJournal,
  updateJournal,
  getAllJournals,
  getJournalById,
  deleteJournal,
};
