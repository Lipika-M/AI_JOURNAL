import api from "./axios";
import type { ApiResponse } from "../types/apiResponse.type";

export type MoodTrendPoint = {
	date: string;
	averageScore: number;
};

export type SentimentBucket = {
	sentiment: "positive" | "negative" | "neutral";
	count: number;
};

export type TagBucket = {
	tag: string;
	count: number;
};


export type AverageMoodByTag = {
	tag: string;
	averageMood: number;
};

type MoodTrendsResponse = ApiResponse<MoodTrendPoint[]>;
type SentimentDistributionResponse = ApiResponse<SentimentBucket[]>;
type TagsDistributionResponse = ApiResponse<TagBucket[]>;
type AverageMoodByTagResponse = ApiResponse<AverageMoodByTag[]>;

const analyticsApi = {
	getMoodTrends: async (): Promise<MoodTrendsResponse> => {
		const res = await api.get<MoodTrendsResponse>("/analytics/mood-trends");
		return res.data;
	},

	getSentimentDistribution: async (): Promise<SentimentDistributionResponse> => {
		const res = await api.get<SentimentDistributionResponse>(
			"/analytics/sentiment-distribution"
		);
		return res.data;
	},

	getTagsDistribution: async (): Promise<TagsDistributionResponse> => {
		const res = await api.get<TagsDistributionResponse>(
			"/analytics/tags-distribution"
		);
		return res.data;
	},

	getAverageMoodByTag: async (): Promise<AverageMoodByTagResponse> => {
		const res = await api.get<AverageMoodByTagResponse>(
			"/analytics/average-mood-by-tag"
		);
		return res.data;
	},
};

export default analyticsApi;
