export type Grade =
  | "Outstanding"
  | "Excellent"
  | "Very Good"
  | "Good"
  | "Average"
  | "Needs Improvement"
  | "Poor";

export type WordStatus = "Excellent" | "Good" | "Fair" | "Needs Practice";

export interface WordFeedback {
  word: string;
  confidence: number;
  status: WordStatus;
  suggestion: string;
}

export interface Assessment {
  overall_score: number;
  clarity: number;
  fluency: number;
  confidence: number;
  grade: Grade;
  wpm: number;
  strengths: string[];
  focus_areas: string[];
  word_feedback: WordFeedback[];
}

export interface AnalysisResponse {
  success: true;
  transcription: string;
  language: string;
  duration: number;
  assessment: Assessment;
}

export type AppState =
  | { kind: "idle" }
  | { kind: "ready"; source: "upload" | "record"; fileName: string; sizeBytes: number }
  | { kind: "processing"; stage: number }
  | { kind: "results"; data: AnalysisResponse }
  | { kind: "error"; message: string };
