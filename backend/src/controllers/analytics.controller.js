import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Journal } from "../models/journal.model.js";

const getMoodTrends = asyncHandler(async (req, res) => {
  const moodTrend = await Journal.aggregate([
    {
      $match: {
        owner: req.user._id,
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt",
          },
        },
        averageScore: {
          $avg: "$moodScore",
        },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
    {
      $project: {
        _id: 0,
        date: "$_id",
        averageScore: { $round: ["$averageScore", 2] },
      },
    },
  ]);

  res
    .status(200)
    .json(
      new ApiResponse(200, "Mood trends retrieved successfully", moodTrend)
    );
});

const getSentimentDistribution = asyncHandler(async (req, res) => {
  const sentiment = await Journal.aggregate([
    {
      $match: {
        owner: req.user._id,
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: "$sentiment",
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        sentiment: "$_id",
        count: 1,
      },
    },
  ]);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Sentiment distribution retrieved successfully",
        sentiment
      )
    );
});

const getTagsDistribution=asyncHandler(async (req, res) => {
    const tagsDistribution=await Journal.aggregate([
        {$match: {
            owner: req.user._id,
            isDeleted: false,
        }},
        {$unwind: "$tags"},
        {
            $group:{
                _id:"$tags",
                count: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 0,
                tag: "$_id",
                count: 1,
            }
        }
    ]);
    res.status(200).json(
      new ApiResponse(200, "Tags distribution retrieved successfully", tagsDistribution)
    );
});

const getAverageMoodByTag = asyncHandler(async (req, res) => {
  const moodByTag = await Journal.aggregate([
    {
      $match: {
        owner: req.user._id,
        isDeleted: false,
      },
    },
    { $unwind: "$tags" },
    {
      $group: {
        _id: "$tags",
        averageMood: { $avg: "$moodScore" },
      },
    },
    { $sort: { averageMood: -1 } },
    {
      $project: {
        _id: 0,
        tag: "$_id",
        averageMood: { $round: ["$averageMood", 2] },
      },
    },
  ]);

  res.status(200).json(
    new ApiResponse(200, "Average mood by tag fetched", moodByTag)
  );
});

export { getMoodTrends, getSentimentDistribution, getTagsDistribution, getAverageMoodByTag };