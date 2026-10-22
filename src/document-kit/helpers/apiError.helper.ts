import { isAxiosError } from "axios";

/**
 * Reads `message` from the standard `{errorCode, message}` error response of the backend; falls back to the
 * given text when it cannot be read (network error, timeout, unexpected shape). Never use axios' own
 * `error.message`: it is only a generic "Request failed with status code 400".
 */
export function extractApiErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError<{ message?: string }>(error) && typeof error.response?.data?.message === "string") {
    return error.response.data.message;
  }
  return fallback;
}
