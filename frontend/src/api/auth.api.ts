// auth.api.ts
import api from "./axios.ts"; // your centralized Axios instance
import type{ User } from "../types/user.ts";

type AuthResponse = User;
type MessageResponse = { message: string };
type AccessTokenResponse = { accessToken: string };

const authApi = {
  registerUser: async (data: {
    fullName: string;
    password: string;
    email: string;
    userName: string;
  }): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>("/register", data);
    return res.data;
  },

   loginUser: async (data: {
    password: string;
    email?: string;
    userName?: string;
  }): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>("/login", data);
    return res.data;
  },

   logoutUser: async (): Promise<MessageResponse> => {
    const res = await api.post("/logout");
    return res.data;
  },

  // Refresh access token
  refreshAccessToken: async (): Promise<AccessTokenResponse> => {
    const res = await api.get("/refresh-token");
    return res.data;
  },

  // Get current logged-in user
  getCurrentUser: async (): Promise<AuthResponse> => {
    const res = await api.get<AuthResponse>("/me");
    return res.data;
  },

  // Update current password
  updateCurrentPassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<MessageResponse> => {
    const res = await api.patch("/update-password", data);
    return res.data;
  },

  // Update account details
  updateAccountDetails: async (data: {
    fullName?: string;
    email?: string;
  }): Promise<AuthResponse> => {
    const res = await api.patch<AuthResponse>("/update-details", data);
    return res.data;
  },
};

export default authApi;
