import { asyncHandler } from "../utils/asyncHandler.js";
import { Journal } from "../models/journal.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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
  res
    .status(201)
    .json(new ApiResponse(201, "Journal created successfully", journal));
});

export { createJournal };
