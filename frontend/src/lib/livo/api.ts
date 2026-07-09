import type { AnalysisResponse } from "./types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function analyzeAudio(file: File, signal?: AbortSignal): Promise<AnalysisResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE}/api/v1/analyze`, {
    method: "POST",
    body: formData,
    signal,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: "Analysis failed." }));
    throw new Error(err.detail || "Analysis failed.");
  }

  return response.json();
}
