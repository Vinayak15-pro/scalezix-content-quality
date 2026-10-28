import { ContentReviewRequest, ContentReviewResponse } from "@/types/api";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export class ApiError extends Error {
  status: number;
  details?: any;

  constructor(message: string, status: number, details?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export async function checkBackendHealth(): Promise<{ status: string; gemini_configured: boolean; model?: string }> {
  const url = BASE_URL ? `${BASE_URL}/health` : `/api/py/health`;
  try {
    const res = await fetch(url, { method: "GET" });
    if (!res.ok) {
      throw new Error(`Health check responded with status ${res.status}`);
    }
    return await res.json();
  } catch (err: any) {
    // If rewrite failed and BASE_URL wasn't set, try localhost:8000 as fallback in dev
    if (!BASE_URL && typeof window !== "undefined") {
      try {
        const directRes = await fetch("http://127.0.0.1:8000/health");
        if (directRes.ok) return await directRes.json();
      } catch {}
    }
    throw new ApiError(err.message || "Failed to connect to backend service", 503);
  }
}

export async function submitContentReview(payload: ContentReviewRequest): Promise<ContentReviewResponse> {
  const primaryUrl = BASE_URL ? `${BASE_URL}/api/content/review` : `/api/py/content/review`;
  
  let lastError: any = null;
  const urlsToTry = [primaryUrl];
  
  // In local browser environment, add direct localhost:8000 if different
  if (typeof window !== "undefined" && !primaryUrl.includes("127.0.0.1:8000")) {
    urlsToTry.push("http://127.0.0.1:8000/api/content/review");
  }

  for (const url of urlsToTry) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let errorData: any = {};
        try {
          errorData = await res.json();
        } catch {}
        const errorMsg = errorData.detail || `Server responded with status ${res.status}: ${res.statusText}`;
        throw new ApiError(errorMsg, res.status, errorData);
      }

      const data: ContentReviewResponse = await res.json();
      return data;
    } catch (err: any) {
      lastError = err;
      // If it's a 4xx validation error, do not retry other endpoints
      if (err instanceof ApiError && err.status >= 400 && err.status < 500) {
        throw err;
      }
    }
  }

  throw new ApiError(
    lastError?.message || "Failed to reach content review API after multiple attempts.",
    lastError?.status || 500,
    lastError?.details
  );
}
