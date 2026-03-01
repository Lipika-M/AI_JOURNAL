import { useState, useEffect, type ReactNode } from "react";
import authApi from "../api/auth.api";
import type { User } from "../types/user.type";
import { AuthContext } from "./authContext";
import type { AuthContextType } from "../types/auth.type";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
 
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAuthErrorMessage = (err: unknown, fallback: string) => {
    const axiosLikeError = err as {
      response?: { status?: number; data?: { message?: string } };
      message?: string;
    };

    const statusCode = axiosLikeError?.response?.status;
    const serverMessage = axiosLikeError?.response?.data?.message?.trim();
    const rawMessage = axiosLikeError?.message?.trim();

    if (serverMessage && !/status code\s*\d+/i.test(serverMessage)) {
      return serverMessage;
    }

    if (statusCode === 400) return "Please check your input and try again.";
    if (statusCode === 401) return "Invalid credentials. Please try again.";
    if (statusCode === 403) return "You are not allowed to perform this action.";
    if (statusCode === 404) return "Account not found.";
    if (statusCode === 409) return "This account information is already in use.";
    if (statusCode === 429) return "Too many attempts. Please wait and try again.";
    if (statusCode && statusCode >= 500)
      return "Server error. Please try again in a moment.";

    if (rawMessage && !/status code\s*\d+/i.test(rawMessage)) {
      return rawMessage;
    }

    return fallback;
  };

   useEffect(() => {
    const checkAuth = async () => {
       try {
        const response = await authApi.getCurrentUser();
         if (response.success && response.data) {
           setUser(response.data);
          setIsAuthenticated(true);
        } else {
           setUser(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.log("Error checking auth:", err);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const register = async (data: {
    fullName: string;
    email: string;
    userName: string;
    password: string;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.registerUser(data);
      if (response.success && response.data) {
        setUser(response.data);
        setIsAuthenticated(true);
      } else {
        throw new Error(response.message || "Registration failed");
      }
    } catch (err) {
      const errorMessage = getAuthErrorMessage(
        err,
        "Registration failed. Please try again."
      );
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: {
    email?: string;
    userName?: string;
    password: string;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.loginUser(data);
      if (response.success && response.data) {
        setUser(response.data);
        setIsAuthenticated(true);
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (err) {
      const errorMessage = getAuthErrorMessage(
        err,
        "Login failed. Please try again."
      );
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authApi.logoutUser();
      setUser(null);
      setIsAuthenticated(false);
    } catch (err) {
      const errorMessage = getAuthErrorMessage(
        err,
        "Logout failed. Please try again."
      );
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      const response = await authApi.refreshAccessToken();
      if (response.success) {
         
        const userResponse = await authApi.getCurrentUser();
        if (userResponse.success && userResponse.data) {
          setUser(userResponse.data);
          setIsAuthenticated(true);
        }
      }
    } catch (err) {
      console.error("Token refresh failed:", err);
      setUser(null);
      setIsAuthenticated(false);
      throw err;
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    register,
    login,
    logout,
    refreshToken,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};
