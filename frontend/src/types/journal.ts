export interface Journal {
    _id: string,
    owner: string,
    title: string,
    content: string,
    sentiment?: "positive" | "negative" | "neutral",
    moodScore?: number,
    summary?: string,
    tags?: string[],
    isDeleted?: boolean,
    createdAt?: string,
    updatedAt?: string,
}