import api from "./axios";
import type { Journal } from "../types/journal.type";
import type { ApiResponse } from "../types/apiResponse.type";

type JournalResponse = ApiResponse<Journal>;
type JournalsResponse = ApiResponse<Journal[]>;
type MessageResponse = ApiResponse<null>;

interface CreateJournalPayload {
  title: string;
  content: string;
  tags?: string[];
  images?: File[];
}

interface UpdateJournalPayload {
  title?: string;
  content?: string;
  tags?: string[];
  images?: File[];
  removeImagePublicIds?: string[];
  appendImages?: boolean;
}

const journalApi = {
  createJournal: async (data: CreateJournalPayload): Promise<JournalResponse> => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("content", data.content);

    if (Array.isArray(data.tags)) {
      formData.append("tags", JSON.stringify(data.tags));
    }

    if (Array.isArray(data.images)) {
      if (data.images.length > 2) {
        throw new Error("You can upload a maximum of 2 images");
      }
      data.images.forEach((image) => formData.append("images", image));
    }

    const res = await api.post<JournalResponse>("/journals", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  updateJournal: async (
    id: string,
    data: UpdateJournalPayload
  ): Promise<JournalResponse> => {
    const formData = new FormData();

    if (typeof data.title === "string") {
      formData.append("title", data.title);
    }

    if (typeof data.content === "string") {
      formData.append("content", data.content);
    }

    if (Array.isArray(data.tags)) {
      formData.append("tags", JSON.stringify(data.tags));
    }

    if (Array.isArray(data.images)) {
      if (data.images.length > 2) {
        throw new Error("You can upload a maximum of 2 images");
      }
      data.images.forEach((image) => formData.append("images", image));
    }

    if (Array.isArray(data.removeImagePublicIds) && data.removeImagePublicIds.length > 0) {
      formData.append("removeImagePublicIds", JSON.stringify(data.removeImagePublicIds));
    }

    if (typeof data.appendImages === "boolean") {
      formData.append("appendImages", String(data.appendImages));
    }

    const res = await api.put<JournalResponse>(`/journals/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  getAllJournals: async (): Promise<JournalsResponse> => {
    const res = await api.get<JournalsResponse>("/journals");
    return res.data;
  },

  getJournalById: async (id: string): Promise<JournalResponse> => {
    const res = await api.get<JournalResponse>(`/journals/${id}`);
    return res.data;
  },

  deleteJournal: async (id: string): Promise<MessageResponse> => {
    const res = await api.delete<MessageResponse>(`/journals/${id}`);
    return res.data;
  },
};

export default journalApi;
