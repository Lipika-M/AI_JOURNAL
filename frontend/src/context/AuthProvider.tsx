import { useState, useEffect, type ReactNode } from "react";
import authApi from "../api/auth.api";
import type { User } from "../types/user.type";
import { AuthContext, type AuthContextType } from "./authContext";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  console.log("AuthProvider mounted !!");

  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      console.log("Checking authentication on mount...");
      try {
        const response = await authApi.getCurrentUser();
        console.log("getCurrentUser response:", response);
        if (response.success && response.data) {
          console.log("User found, setting authenticated state");
          setUser(response.data);
          setIsAuthenticated(true);
        } else {
          console.log("getCurrentUser not successful");
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        // 401 means user not authenticated - this is expected
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
      const errorMessage =
        err instanceof Error ? err.message : "Registration failed";
      setError(errorMessage);
      throw err;
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
      const errorMessage =
        err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
      throw err;
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
      const errorMessage =
        err instanceof Error ? err.message : "Logout failed";
      setError(errorMessage);
      throw err;
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
