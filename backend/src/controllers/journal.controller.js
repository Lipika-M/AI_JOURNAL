import { asyncHandler } from "../utils/asyncHandler.js";
import { Journal } from "../models/journal.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose, { Schema } from "mongoose";
import { analyzeJournal } from "../services/ai.service.js";
const createJournal = asyncHandler(async (req, res) => {
       
  const { title, content, tags } = req.body;
  if (!title || title.trim() === "") {
    throw new ApiError(400, "Title is required");
  }
  if (!content || content.trim() === "") {
    throw new ApiError(400, "Content is required");
  }
     

  const normalizedTags = Array.isArray(tags)
    ? tags.map((tag) => tag.trim().toLowerCase())
    : [];
  

  const journal = await Journal.create({
    owner: req.user._id,
    title: title.trim(),
    content: content.trim(),
    tags: normalizedTags,
  });
   

  try {
    

    const aiResult = await analyzeJournal(journal.content);

    journal.sentiment = aiResult.sentiment;
    journal.moodScore = aiResult.moodScore;
    journal.summary = aiResult.summary;

    await journal.save({ validateBeforeSave: false });
  } catch (error) {
    console.error("AI Analysis Error:", error.message);
    console.error("Full Error:", error);
  }
  res
    .status(201)
    .json(new ApiResponse(201, "Journal created successfully", journal));
});

const updateJournal = asyncHandler(async (req, res) => {
  const journalId = req.params.id;
  if (!journalId) {
    throw new ApiError(400, "No Journal found");
  }
  const { title, content, tags } = req.body;

  const updateFields = {};
  if (title) updateFields.title = title.trim();
  if (content) updateFields.content = content.trim();
  if (Array.isArray(tags)) {
    updateFields.tags = tags.map((tag) => tag.trim().toLowerCase());
  }
  const updatedJournal = await Journal.findOneAndUpdate(
    { _id: journalId, owner: req.user._id, isDeleted: false },
    updateFields,
    { new: true, runValidators: true }
  );
  if (!updatedJournal) {
    throw new ApiError(
      404,
      "Journal not found or you are not authorized to update it"
    );
  }
  res
    .status(200)
    .json(new ApiResponse(200, "Journal updated successfully", updatedJournal));
});

const getAllJournals = asyncHandler(async (req, res) => {
  const journals = await Journal.find({ owner: req.user._id, isDeleted: false })
    .sort({ createdAt: -1 });
  res
    .status(200)
    .json(new ApiResponse(200, "Journals retrieved successfully", journals));
});

const getJournalById = asyncHandler(async (req, res) => {
  const journalId = req.params.id;

  if (!journalId) {
    throw new ApiError(400, "Journal ID is required");
  }
  if (!mongoose.Types.ObjectId.isValid(new mongoose.Types.ObjectId(journalId))) {
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
 const journalId=req.params.id;
 if(!journalId) {
    throw new ApiError(400, "Journal ID is required");
  }
  if (!mongoose.Types.ObjectId.isValid(new mongoose.Types.ObjectId(journalId))) {
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
res
  .status(200)
  .json(new ApiResponse(200, "Journal deleted successfully"));
});

export { createJournal, updateJournal, getAllJournals, getJournalById, deleteJournal };