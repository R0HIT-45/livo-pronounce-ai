# Livo Pronounce AI — Stabilization Implementation (v2.0)

## Overview

This document contains every code change needed to stabilize the application. See the conversation history for the rationale behind each change.

---

## A. Backend Changes

### A1. `backend/app/core/config.py` — Add CORS_ORIGINS

Add to the `Settings` class:

```python
CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"
```

Full file:

```python
from typing import ClassVar
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "Livo Pronounce AI"
    VERSION: str = "1.0.0"
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"
    MODEL_NAME: str = "base"
    DEVICE: str = "cpu"
    COMPUTE_TYPE: str = "int8"
    BEAM_SIZE: int = 5
    MAX_AUDIO_SIZE_MB: int = 5
    MIN_DURATION: int = 30
    MAX_DURATION: int = 45
    SUPPORTED_LANGUAGES: ClassVar[list[str]] = ["en"]
    LOG_LEVEL: str = "INFO"

    class Config:
        env_file = ".env"

settings = Settings()
```

Set in `backend/.env` or Render env vars:
```
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,https://livo-pronounce-ai.vercel.app
```

---

### A2. `backend/app/main.py` — Configurable CORS + health endpoint

Replace lines 15–25:

```python
app.middleware("http")(log_requests)

# CORS Configuration
origins = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

The `/health` and `/` endpoints already exist and require no changes.

---

### A3. `backend/app/api/v1/analyze.py` — Threadpool + timeout

Replace the entire file:

```python
import asyncio
import logging

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.concurrency import run_in_threadpool

from app.core.security import validate_audio
from app.services.speech_service import transcribe_audio
from app.services.scoring_service import scoring_service

logger = logging.getLogger(__name__)
router = APIRouter()

ANALYSIS_TIMEOUT = 120


@router.post("/analyze")
async def analyze_audio(file: UploadFile = File(...)):

    try:
        logger.info(f"Received file: {file.filename}")
        audio_bytes = await file.read()

        validate_audio(audio_bytes, file.content_type)

        # Offload blocking Whisper work to thread pool with timeout
        transcription = await asyncio.wait_for(
            run_in_threadpool(transcribe_audio, audio_bytes),
            timeout=ANALYSIS_TIMEOUT,
        )

        assessment = await run_in_threadpool(
            scoring_service.calculate_metrics, transcription
        )

        logger.info("Speech analysis completed successfully.")

        return {
            "success": True,
            "transcription": transcription["transcript"],
            "language": transcription["language"],
            "duration": transcription["duration"],
            "assessment": assessment,
        }

    except asyncio.TimeoutError:
        logger.error("Analysis timed out after %ss", ANALYSIS_TIMEOUT)
        raise HTTPException(status_code=504, detail="Analysis timed out. Please try again.")

    except HTTPException:
        raise

    except Exception:
        logger.exception("Unexpected error during analysis.")
        raise HTTPException(status_code=500, detail="Failed to analyze audio.")
```

The `transcribe_audio` function in `speech_service.py` already cleans up temp files in a `try/finally` block. No additional cleanup needed.

---

## B. Frontend Changes

### B1. `frontend/src/lib/livo/types.ts` — Keep explicit error state

```ts
export type Grade =
  | "Outstanding" | "Excellent" | "Very Good" | "Good"
  | "Average" | "Needs Improvement" | "Poor";

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
  | { kind: "analyzing" }
  | { kind: "error"; message: string }
  | { kind: "results"; data: AnalysisResponse };
```

---

### B2. `frontend/src/lib/livo/api.ts` — Add health check + cancellable upload

```ts
import type { AnalysisResponse } from "./types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

/** Quick HEAD to wake Render before the real upload. */
export async function wakeServer(signal?: AbortSignal): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`, {
      method: "GET",
      signal,
      // short timeout — if sleeping, this will fail fast
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function analyzeAudio(
  file: File,
  signal?: AbortSignal,
): Promise<AnalysisResponse> {
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
```

---

### B3. `frontend/src/lib/livo/analysis.ts` — Remove unused code

Replace the entire file with:

```ts
// Reserved for future analysis helpers.
export {};
```

Or delete the file.

---

### B4. `frontend/src/routes/index.tsx` — State machine + health check + scroll

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { Navbar } from "@/components/livo/Navbar";
import { Hero } from "@/components/livo/Hero";
import { Features, HowItWorks } from "@/components/livo/Features";
import { Workspace } from "@/components/livo/Workspace";
import { Processing } from "@/components/livo/Processing";
import { Results } from "@/components/livo/Results";
import { Faq, Footer } from "@/components/livo/Faq";

import type { AppState } from "@/lib/livo/types";
import { analyzeAudio, wakeServer } from "@/lib/livo/api";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [state, setState] = useState<AppState>({ kind: "idle" });
  const fileRef = useRef<File | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const analysisActiveRef = useRef(false);

  // ---- Callbacks ----

  const onReady = useCallback((source: "upload" | "record", file: File) => {
    fileRef.current = file;
    setState({ kind: "ready", source, fileName: file.name, sizeBytes: file.size });
  }, []);

  const onClear = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    analysisActiveRef.current = false;
    fileRef.current = null;
    setState({ kind: "idle" });
  }, []);

  const onCancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    analysisActiveRef.current = false;
    const file = fileRef.current;
    if (file) {
      setState({ kind: "ready", source: "upload", fileName: file.name, sizeBytes: file.size });
    } else {
      setState({ kind: "idle" });
    }
  }, []);

  const onAnalyze = useCallback(async () => {
    const file = fileRef.current;
    if (!file || analysisActiveRef.current) return;

    analysisActiveRef.current = true;
    const controller = new AbortController();
    abortRef.current = controller;
    setState({ kind: "analyzing" });

    // Frontend timeout: 120s
    const timeout = setTimeout(() => controller.abort(), 120_000);

    try {
      // Step 1: Wake the server (if Render is sleeping)
      await wakeServer(controller.signal);

      // Step 2: Upload + analyze
      const data = await analyzeAudio(file, controller.signal);
      clearTimeout(timeout);

      if (analysisActiveRef.current) {
        setState({ kind: "results", data });
      }
    } catch (err: unknown) {
      clearTimeout(timeout);
      if (!analysisActiveRef.current) return;

      const message = getErrorMessage(err);
      // Empty message = user cancelled (AbortError) — stay in analyzing
      if (message) {
        setState({ kind: "error", message });
      }
    } finally {
      analysisActiveRef.current = false;
      abortRef.current = null;
    }
  }, []);

  const onPracticeAgain = useCallback(() => {
    fileRef.current = null;
    setState({ kind: "idle" });
  }, []);

  // ---- Auto-scroll — runs after React paints ----

  const resultsRef = useRef<HTMLDivElement>(null);

  const scrollToResults = useCallback(() => {
    requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  useEffect(() => {
    if (state.kind === "analyzing" || state.kind === "results" || state.kind === "error") {
      const el = resultsRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.bottom > window.innerHeight) {
          scrollToResults();
        }
      }
    }
  }, [state.kind, scrollToResults]);

  // ---- Render ----

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
        <div ref={resultsRef}>
          <Workspace
            state={state}
            onReady={onReady}
            onAnalyze={onAnalyze}
            onClear={onClear}
            onCancel={onCancel}
          />

          <AnimatePresence mode="wait">
            {state.kind === "analyzing" && (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Processing onCancel={onCancel} />
              </motion.div>
            )}

            {state.kind === "results" && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Results data={state.data} onPracticeAgain={onPracticeAgain} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Faq />
      </main>
      <Footer />
    </div>
  );
}

function getErrorMessage(err: unknown): string {
  if (err instanceof DOMException && err.name === "AbortError") {
    return ""; // user cancelled
  }
  if (err instanceof TypeError) {
    return "Unable to reach the server. Check your internet connection and try again.";
  }
  const msg = err instanceof Error ? err.message : "Analysis failed.";
  if (/timed?\s*out|timeout/i.test(msg)) {
    return "The server took too long to respond. This can happen while the AI model is starting.";
  }
  return msg;
}
```

---

### B5. `frontend/src/components/livo/Workspace.tsx` — Inline error + client-side validation

Key changes from current file:

1. **Client-side file validation** in `validateAndSet` — match backend limits exactly:
   - Size: max 5 MB (from `settings.MAX_AUDIO_SIZE_MB`)
   - Duration: reject files >= 5 MB before uploading
   - Extension/MIME: already validated

2. **Disable controls** during `analyzing` state (already in v1 plan)

3. **Inline error banner** with Retry + Clear buttons (already in v1 plan)

4. **Cancel Analysis** button replaces action bar during `analyzing` (already in v1 plan)

The frontend `MAX_SIZE` constant should change from `25 * 1024 * 1024` to `5 * 1024 * 1024` to match the backend's 5 MB limit:

```ts
const MAX_SIZE = 5 * 1024 * 1024;
```

The rest of the Workspace.tsx changes are identical to the v1 plan — see `.opencode/plans/livo-stabilization.md` (v1) for the full component code.

---

### B6. `frontend/src/components/livo/Processing.tsx` — Honest elapsed-time messages

Replace the entire file:

```tsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, XCircle } from "lucide-react";

const MESSAGES = [
  { after: 0, text: "Uploading audio…" },
  { after: 4, text: "Waiting for server…" },
  { after: 15, text: "Analyzing pronunciation…" },
  { after: 45, text: "Still working…" },
];

export function Processing({ onCancel }: { onCancel: () => void }) {
  const [elapsed, setElapsed] = useState(0);
  const [message, setMessage] = useState(MESSAGES[0].text);

  useEffect(() => {
    const start = Date.now();
    const tick = setInterval(() => {
      const s = Math.floor((Date.now() - start) / 1000);
      setElapsed(s);

      // Find the best message for current elapsed time
      let m = MESSAGES[0].text;
      for (const entry of MESSAGES) {
        if (s >= entry.after) m = entry.text;
      }
      setMessage(m);
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  return (
    <section className="section-y">
      <div className="mx-auto max-w-2xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="surface-card overflow-hidden p-8 md:p-10"
        >
          <div className="flex flex-col items-center text-center">
            <div className="relative flex h-24 w-24 items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-primary-100 blur-xl" />
              <span
                className="absolute inset-2 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600"
                style={{ animationDuration: "1.6s" }}
              />
              <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-white shadow-[var(--shadow-elev-3)]">
                <Loader2 className="h-6 w-6 animate-spin" />
              </span>
            </div>
            <h3 className="mt-6 text-2xl font-bold tracking-tight">Analyzing your speech…</h3>
            <p className="mt-3 text-sm text-muted-foreground">{message}</p>
            <p className="mt-1 text-xs tabular-nums text-muted-foreground">
              Elapsed: {elapsed}s
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              Usually 5–15s · First request up to 60s
            </p>
          </div>

          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-5 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
            >
              <XCircle className="h-4 w-4 text-destructive" />
              Cancel Analysis
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
```

Messages cycle based on elapsed time only — no fake backend progress:
- 0s: "Uploading audio…"
- 4s: "Waiting for server…"
- 15s: "Analyzing pronunciation…"
- 45s: "Still working…"

No percentages, no stage list.

---

## C. Production Cleanup

### C1. Remove all `console.log`

| File | Action |
|---|---|
| `frontend/src/routes/__root.tsx` | KEEP `console.error(error)` — React error boundary logging is intentional |
| All other source files | Check for accidental `console.log` / debug statements, remove them |

### C2. Remove dead code

| File | Action |
|---|---|
| `frontend/src/lib/livo/analysis.ts` | Delete or replace with `export {}` — `PROCESSING_STAGES` and `mockAnalyze` are no longer used anywhere |
| Any file importing `PROCESSING_STAGES` | Remove that import |

### C3. Run formatter + linter

```bash
cd frontend
npm run format
npm run lint
# Fix any lint errors
```

### C4. Verify TypeScript

```bash
cd frontend
npx tsc --noEmit
# Fix any type errors
```

### C5. Verify production build

```bash
cd frontend
npm run build
# Confirm zero errors
```

---

## D. Testing Checklist

### Core flows
- [ ] Upload audio → Analyze → Results
- [ ] Record audio → Analyze → Results
- [ ] Cancel during analysis → returns to Ready, file preserved
- [ ] Clear from Ready → returns to Idle
- [ ] Clear from Error → returns to Idle

### Error handling
- [ ] Retry after timeout (error state → reuses same file)
- [ ] Retry after server error (error state → reuses same file)
- [ ] Invalid/unsupported audio file → validation error shown inline
- [ ] Audio > 5 MB → rejection before upload (client-side)
- [ ] Audio > 5 MB → 400 error from backend if bypassed
- [ ] Network failure → "Unable to reach the server" message
- [ ] Backend 500 error → "An unexpected error occurred" message

### UX
- [ ] Rapid double-click on Analyze → only one request sent
- [ ] Upload button disabled during analysis
- [ ] Record button disabled during analysis
- [ ] Delete/Remove buttons disabled during analysis
- [ ] Drag-and-drop rejected during analysis
- [ ] Cancel Analysis visible during analysis
- [ ] Elapsed timer increments during analysis
- [ ] Auto-scroll only when results section is below viewport

### Production
- [ ] `npm run format` passes
- [ ] `npm run lint` passes with zero errors
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] `npm run build` succeeds with zero errors
- [ ] Zero `console.log` statements in source (except error boundary)
- [ ] Mobile at 320px — Workspace renders correctly
- [ ] Desktop — full layout works

### Backend verification
- [ ] First request logs "Loading Whisper model…" only once
- [ ] Subsequent requests do NOT log model loading
- [ ] CORS origins are the configured list, not `["*"]`
- [ ] `/health` returns 200
- [ ] `POST /api/v1/analyze` times out after 120s with 504
- [ ] Temp files are deleted in `finally` block
