import type { User } from "./user.type";

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  register: (data: {
    fullName: string;
    email: string;
    userName: string;
    password: string;
  }) => Promise<void>;
  login: (data: {
    email?: string;
    userName?: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
}
