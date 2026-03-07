export interface Journal {
    _id: string,
    owner: string,
    title: string,
    content: string,
    sentiment?: "positive" | "negative" | "neutral",
    moodScore?: number,
    summary?: string,
    images?: Array<{
        url: string,
        publicId: string,
    }>,
    tags?: string[],
    aiStatus?: "pending" | "completed" | "failed",
    isDeleted?: boolean,
    createdAt?: string,
    updatedAt?: string,
}