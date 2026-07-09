import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

import { Navbar } from "@/components/livo/Navbar";
import { Hero } from "@/components/livo/Hero";
import { Features, HowItWorks } from "@/components/livo/Features";
import { Workspace } from "@/components/livo/Workspace";
import { Processing } from "@/components/livo/Processing";
import { Results } from "@/components/livo/Results";
import { Faq, Footer } from "@/components/livo/Faq";

import type { AppState } from "@/lib/livo/types";
import { PROCESSING_STAGES } from "@/lib/livo/analysis";
import { analyzeAudio } from "@/lib/livo/api";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [state, setState] = useState<AppState>({ kind: "idle" });
  const fileRef = useRef<File | null>(null);

  const onReady = useCallback((source: "upload" | "record", file: File) => {
    fileRef.current = file;
    setState({ kind: "ready", source, fileName: file.name, sizeBytes: file.size });
  }, []);

  const onClear = useCallback(() => {
    fileRef.current = null;
    setState({ kind: "idle" });
  }, []);

  const onAnalyze = useCallback(async () => {
    const file = fileRef.current;
    if (!file) return;
    setState({ kind: "processing", stage: 0 });

    try {
      const data = await analyzeAudio(file, (stage) => {
        setState({ kind: "processing", stage });
      });

      setState({ kind: "results", data });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Analysis failed.";
      setState({ kind: "error", message });
    }
  }, []);

  // Scroll to processing / results when they appear
  useEffect(() => {
    if (state.kind === "processing" || state.kind === "results") {
      const el = document.getElementById("analyze");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [state.kind]);

  const onPracticeAgain = useCallback(() => {
    fileRef.current = null;
    setState({ kind: "idle" });
    setTimeout(() => {
      document.getElementById("analyze")?.scrollIntoView({ behavior: "smooth" });
    }, 40);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
        <Workspace state={state} onReady={onReady} onAnalyze={onAnalyze} onClear={onClear} />

        <AnimatePresence mode="wait">
          {state.kind === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Processing stage={state.stage} />
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

          {state.kind === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="section-y"
            >
              <div className="mx-auto max-w-lg px-6">
                <div className="surface-card flex flex-col items-center p-10 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
                    <AlertCircle className="h-6 w-6 text-destructive" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold">Analysis failed</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{state.message}</p>
                  <button type="button" onClick={onPracticeAgain} className="btn-primary mt-6">
                    Try again
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Faq />
      </main>
      <Footer />
    </div>
  );
}
