import type { AnalysisResponse } from "./types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function analyzeAudio(
  file: File,
  onProgress?: (stage: number) => void,
): Promise<AnalysisResponse> {
  const formData = new FormData();
  formData.append("file", file);

  onProgress?.(0);

  const response = await fetch(`${API_BASE}/api/v1/analyze`, {
    method: "POST",
    body: formData,
  });

  onProgress?.(4);

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: "Failed to analyze audio." }));
    throw new Error(err.detail || "Failed to analyze audio.");
  }

  onProgress?.(7);

  return response.json();
}
