import type { AnalysisResponse, Grade, WordStatus } from "./types";

// Deterministic mock analysis based on a simple hash of the file name/size.
// Replace this with a real POST /api/v1/analyze call when the backend is available.
export function mockAnalyze(fileName: string, sizeBytes: number): AnalysisResponse {
  const seed = hash(`${fileName}:${sizeBytes}`);
  const rand = mulberry32(seed);

  const clarity = 78 + Math.floor(rand() * 20);
  const fluency = 74 + Math.floor(rand() * 22);
  const confidence = 76 + Math.floor(rand() * 22);
  const overall = Math.round((clarity + fluency + confidence) / 3);
  const wpm = 118 + Math.floor(rand() * 44);
  const duration = 18 + Math.floor(rand() * 40);

  const words = [
    "development",
    "opportunity",
    "communication",
    "particularly",
    "innovation",
    "collaboration",
    "specifically",
    "extraordinary",
    "authentic",
    "significantly",
  ];

  const word_feedback = words.slice(0, 6 + Math.floor(rand() * 3)).map((word) => {
    const c = 55 + Math.floor(rand() * 45);
    return {
      word,
      confidence: c,
      status: statusFor(c),
      suggestion:
        c >= 88
          ? "Pronunciation is clear and consistent."
          : c >= 75
            ? "Slight softening on the middle syllable — enunciate each part."
            : c >= 65
              ? "Slow down and separate the syllables when practicing."
              : "Break the word into syllables and repeat aloud five times.",
    };
  });

  const transcription =
    "Hello everyone, welcome to Livo Pronounce AI. I am recording this sample to demonstrate how our platform evaluates spoken English. The system measures pronunciation, clarity, fluency, and speaking confidence, then produces a report you can act on immediately.";

  return {
    success: true,
    transcription,
    language: "en",
    duration,
    assessment: {
      overall_score: overall,
      clarity,
      fluency,
      confidence,
      grade: gradeFor(overall),
      wpm,
      strengths: pickStrengths(clarity, fluency, confidence, wpm),
      focus_areas: pickFocus(clarity, fluency, confidence, wpm),
      word_feedback,
    },
  };
}

function pickStrengths(c: number, f: number, cf: number, wpm: number): string[] {
  const out: string[] = [];
  if (c >= 88) out.push("Excellent articulation across the recording.");
  if (f >= 85) out.push("Natural, unhurried speaking rhythm.");
  if (cf >= 85) out.push("Confident, steady delivery throughout.");
  if (wpm >= 110 && wpm <= 160) out.push("Speaking pace sits inside the ideal range.");
  if (out.length === 0) out.push("Consistent effort — a strong foundation to build on.");
  return out.slice(0, 4);
}

function pickFocus(c: number, f: number, cf: number, wpm: number): string[] {
  const out: string[] = [];
  if (c < 88) out.push("Sharpen articulation on longer, multi-syllable words.");
  if (f < 85) out.push("Reduce hesitation pauses between phrases.");
  if (cf < 85) out.push("Project the voice more steadily to raise confidence.");
  if (wpm > 160) out.push("Slow down slightly for better listener comprehension.");
  if (wpm < 110) out.push("Aim for a slightly faster, more natural pace.");
  return out.slice(0, 4);
}

function statusFor(c: number): WordStatus {
  if (c >= 88) return "Excellent";
  if (c >= 75) return "Good";
  if (c >= 65) return "Fair";
  return "Needs Practice";
}

function gradeFor(score: number): Grade {
  if (score >= 95) return "Outstanding";
  if (score >= 88) return "Excellent";
  if (score >= 82) return "Very Good";
  if (score >= 75) return "Good";
  if (score >= 65) return "Average";
  if (score >= 55) return "Needs Improvement";
  return "Poor";
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const PROCESSING_STAGES = [
  "Uploading audio",
  "Extracting speech",
  "Understanding language",
  "Evaluating pronunciation",
  "Measuring fluency",
  "Calculating scores",
  "Generating feedback",
  "Preparing results",
] as const;
