import api from "./axios";
import type{ User } from "../types/user.type.ts";
import type{ ApiResponse } from "../types/apiResponse.type.ts";

type AuthResponse = ApiResponse<User>;
type MessageResponse = ApiResponse<null>;
type RefreshResponse = ApiResponse<{
  accessToken: string;
  refreshToken: string;
}>;
type loginPayload = {
  email?: string;
  userName?: string;
  password: string;
};


const authApi = {
  registerUser: async (data: {
    fullName: string;
    password: string;
    email: string;
    userName: string;
  }): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>("/users/register", data);
    return res.data;
  },

  loginUser: async (data: loginPayload): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>("/users/login", data);
    return res.data;
  },

  logoutUser: async (): Promise<MessageResponse> => {
    const res = await api.post<MessageResponse>("/users/logout");
    return res.data;
  },

  refreshAccessToken: async (): Promise<RefreshResponse> => {
    const res = await api.post<RefreshResponse>("/users/refresh-token");
    return res.data;
  },

  getCurrentUser: async (): Promise<AuthResponse> => {
    const res = await api.get<AuthResponse>("/users/me");
    return res.data;
  },

  updateCurrentPassword: async (data: {
    oldPassword: string;
    newPassword: string;
  }): Promise<MessageResponse> => {
    const res = await api.patch<MessageResponse>("/users/change-password", data);
    return res.data;
  },

  updateAccountDetails: async (data: {
    fullName?: string;
    email?: string;
  }): Promise<AuthResponse> => {
    const res = await api.patch<AuthResponse>("/users/update-account", data);
    return res.data;
  },
};

export default authApi;
