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
}

interface UpdateJournalPayload {
  title?: string;
  content?: string;
  tags?: string[];
}

const journalApi = {
  createJournal: async (data: CreateJournalPayload): Promise<JournalResponse> => {
    const res = await api.post<JournalResponse>("/journals", data);
    return res.data;
  },

  updateJournal: async (
    id: string,
    data: UpdateJournalPayload
  ): Promise<JournalResponse> => {
    const res = await api.put<JournalResponse>(`/journals/${id}`, data);
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
