type AxiosLikeError = {
  response?: { status?: number; data?: { message?: string } };
  message?: string;
};

const isUnsafeMessage = (message: string) =>
  /(axios|request failed|status code\s*\d+|error:\s|\bat\s+\w+\s*\(|mongodb|mongoose|stack|<!doctype|<html)/i.test(
    message
  );

export const getSafeErrorMessage = (err: unknown, fallback: string): string => {
  const error = err as AxiosLikeError;
  const statusCode = error?.response?.status;
  const backendMessage = error?.response?.data?.message?.trim();
  const rawMessage = error?.message?.trim();

  if (statusCode === 400) return "Please check your input and try again.";
  if (statusCode === 401) return "Authentication failed. Please sign in again.";
  if (statusCode === 403) return "You are not allowed to perform this action.";
  if (statusCode === 404) return "The requested resource was not found.";
  if (statusCode === 409) return "This action conflicts with existing data.";
  if (statusCode === 413) return "Uploaded file is too large.";
  if (statusCode === 415) return "Unsupported file format.";
  if (statusCode === 422) return "Submitted data is not valid.";
  if (statusCode === 429) return "Too many requests. Please try again shortly.";
  if (statusCode && statusCode >= 500)
    return "Server error. Please try again in a moment.";

  if (backendMessage && backendMessage.length <= 110 && !isUnsafeMessage(backendMessage)) {
    return backendMessage;
  }

  if (rawMessage && rawMessage.length <= 110 && !isUnsafeMessage(rawMessage)) {
    return rawMessage;
  }

  return fallback;
};
