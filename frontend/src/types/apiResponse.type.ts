 export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  success: boolean;
  data: T | null;
  error?: string[];
}
