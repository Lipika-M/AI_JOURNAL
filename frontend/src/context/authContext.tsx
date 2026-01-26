import { createContext } from "react";
import type { AuthContextType } from "../types/auth.type";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
