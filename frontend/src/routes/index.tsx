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
import { analyzeAudio } from "@/lib/livo/api";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [state, setState] = useState<AppState>({ kind: "idle" });
  const fileRef = useRef<File | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const analysisActiveRef = useRef(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const onReady = useCallback((source: "upload" | "record", file: File) => {
    if (analysisActiveRef.current) return;
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

    const timeout = setTimeout(() => controller.abort(), 120_000);

    try {
      const data = await analyzeAudio(file, controller.signal);
      clearTimeout(timeout);

      if (analysisActiveRef.current) {
        setState({ kind: "results", data });
      }
    } catch (err: unknown) {
      clearTimeout(timeout);
      if (!analysisActiveRef.current) return;

      const message = getErrorMessage(err);
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
  if (err instanceof TypeError) {
    return "Unable to reach the server. Check your internet connection and try again.";
  }
  if (err instanceof DOMException && err.name === "AbortError") {
    return "The server took too long to respond. This can happen while the AI model is starting.";
  }
  const msg = err instanceof Error ? err.message : "Analysis failed.";
  if (/timed?\s*out|timeout/i.test(msg)) {
    return "The server took too long to respond. This can happen while the AI model is starting.";
  }
  return msg;
}
