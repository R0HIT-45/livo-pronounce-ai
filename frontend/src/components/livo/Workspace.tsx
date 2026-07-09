import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  Mic,
  Square,
  Trash2,
  Play,
  AlertCircle,
  FileAudio,
  Sparkles,
  X,
  Loader2,
} from "lucide-react";
import { useRecorder } from "@/lib/livo/useRecorder";
import type { AppState } from "@/lib/livo/types";

const ACCEPTED_EXT = ["mp3", "wav", "ogg", "webm", "m4a", "mp4"];
const ACCEPTED_MIMES = "audio/mpeg,audio/wav,audio/ogg,audio/webm,audio/mp4,audio/x-m4a,video/mp4";
const MAX_SIZE = 5 * 1024 * 1024;

interface Props {
  state: AppState;
  onReady: (source: "upload" | "record", file: File) => void;
  onAnalyze: () => void;
  onClear: () => void;
  onCancel: () => void;
}

export function Workspace({ state, onReady, onAnalyze, onClear, onCancel }: Props) {
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploadedName, setUploadedName] = useState<string | null>(null);
  const [uploadedSize, setUploadedSize] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const recorder = useRecorder();

  const clearUpload = useCallback(() => {
    setUploadedName(null);
    setUploadedSize(0);
    setUploadError(null);
    if (inputRef.current) inputRef.current.value = "";
    onClear();
  }, [onClear]);

  const validateAndSet = useCallback(
    (file: File) => {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
      if (!ACCEPTED_EXT.includes(ext)) {
        setUploadError(
          `Unsupported format. Upload an ${ACCEPTED_EXT.join(", ").toUpperCase()} file.`,
        );
        return;
      }
      if (file.size > MAX_SIZE) {
        setUploadError("File is too large. Maximum size is 5 MB.");
        return;
      }
      setUploadError(null);
      setUploadedName(file.name);
      setUploadedSize(file.size);
      recorder.reset();
      onReady("upload", file);
    },
    [onReady, recorder],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (state.kind === "analyzing") return;
      const file = e.dataTransfer.files?.[0];
      if (file) validateAndSet(file);
    },
    [state.kind, validateAndSet],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (state.kind === "analyzing") return;
      const file = e.target.files?.[0];
      if (file) validateAndSet(file);
    },
    [state.kind, validateAndSet],
  );

  const handleStopRecording = useCallback(() => {
    recorder.stop();
    setTimeout(() => {
      const blob = recorder.state.blob;
      if (blob) {
        const est = Math.max(1, Math.floor(recorder.state.seconds));
        const file = new File([blob], `recording-${est}s.webm`, { type: "audio/webm" });
        onReady("record", file);
      }
    }, 100);
  }, [recorder, onReady]);

  const isAnalyzing = state.kind === "analyzing";
  const isError = state.kind === "error";
  const hasFile = state.kind === "ready" || isError;
  const errorMessage = isError ? state.message : null;

  return (
    <section id="analyze" className="section-y">
      <div className="mx-auto max-w-[1180px] px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-700">
            Workspace
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-[-0.02em] md:text-4xl">
            Upload a file or record your voice
          </h2>
          <p className="mt-4 text-muted-foreground">
            Choose either side — the AI produces the same executive-style report in seconds.
          </p>
        </div>

        <div className="surface-card mt-12 overflow-hidden">
          <div className="grid divide-border md:grid-cols-2 md:divide-x">
            {/* Upload */}
            <div className="p-6 md:p-8">
              <PanelHeader
                icon={<UploadCloud className="h-4 w-4" />}
                title="Upload audio"
                hint="Drag & drop or browse"
              />

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => {
                  if (!isAnalyzing) inputRef.current?.click();
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " ") && !isAnalyzing)
                    inputRef.current?.click();
                }}
                aria-label="Upload audio file"
                className={`group mt-5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
                  isAnalyzing
                    ? "pointer-events-none opacity-50"
                    : dragging
                      ? "border-primary-500 bg-primary-50/70"
                      : "border-border bg-secondary/40 hover:border-primary-300 hover:bg-primary-50/40"
                }`}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-[var(--shadow-elev-2)]">
                  <UploadCloud className="h-6 w-6 text-primary-600" />
                </div>
                <p className="mt-4 text-sm font-semibold text-foreground">
                  Drop your audio file here
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  or click to browse — MP3, WAV, OGG, WEBM, M4A · up to 5 MB
                </p>
                <input
                  ref={inputRef}
                  type="file"
                  accept={ACCEPTED_MIMES}
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              <AnimatePresence>
                {uploadedName && !uploadError && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 flex items-center justify-between rounded-xl border border-border bg-white px-4 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                        <FileAudio className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {uploadedName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(uploadedSize / 1024 / 1024).toFixed(2)} MB · ready to analyze
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isAnalyzing) clearUpload();
                      }}
                      disabled={isAnalyzing}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-30 disabled:pointer-events-none"
                      aria-label="Remove file"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Inline error banner */}
              <AnimatePresence>
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    role="alert"
                    className="mt-4 rounded-xl border border-[color:oklch(0.88_0.09_25)] bg-[color:oklch(0.97_0.03_25)] p-4"
                  >
                    <div className="flex items-start gap-3">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">Analysis failed</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{errorMessage}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={onAnalyze}
                        className="btn-primary h-9 px-4 text-xs"
                      >
                        Retry
                      </button>
                      <button
                        type="button"
                        onClick={clearUpload}
                        className="btn-secondary h-9 px-4 text-xs"
                      >
                        Clear
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {uploadError && !errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    role="alert"
                    className="mt-4 flex items-start gap-3 rounded-xl border border-[color:oklch(0.88_0.09_25)] bg-[color:oklch(0.97_0.03_25)] p-4"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 text-destructive" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        We couldn't accept that file
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{uploadError}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Record */}
            <div className="p-6 md:p-8">
              <PanelHeader
                icon={<Mic className="h-4 w-4" />}
                title="Record audio"
                hint="Speak for 10 – 60 seconds"
              />

              <div className="mt-5 flex flex-col items-center rounded-2xl border border-border bg-secondary/40 p-8">
                <button
                  type="button"
                  onClick={
                    recorder.state.status === "recording" ? handleStopRecording : recorder.start
                  }
                  disabled={isAnalyzing}
                  aria-label={
                    recorder.state.status === "recording" ? "Stop recording" : "Start recording"
                  }
                  className={`flex h-20 w-20 items-center justify-center rounded-full text-white shadow-[var(--shadow-elev-3)] transition-transform hover:scale-105 disabled:pointer-events-none disabled:opacity-40 ${
                    recorder.state.status === "recording"
                      ? "bg-destructive pulse-record"
                      : "bg-primary-600"
                  }`}
                >
                  {recorder.state.status === "recording" ? (
                    <Square className="h-7 w-7 fill-current" />
                  ) : (
                    <Mic className="h-8 w-8" />
                  )}
                </button>

                <p className="mt-4 font-mono text-2xl font-semibold tabular-nums text-foreground">
                  {formatTime(recorder.state.seconds)}
                </p>

                <div className="mt-4 flex h-14 w-full items-center justify-center gap-[3px]">
                  {recorder.state.levels.map((l, i) => (
                    <span
                      key={i}
                      className="w-1 rounded-full bg-primary-500 transition-[height] duration-75"
                      style={{
                        height: `${Math.max(4, l * 56)}px`,
                        opacity: recorder.state.status === "idle" ? 0.25 : 1,
                      }}
                    />
                  ))}
                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                  {isAnalyzing
                    ? "Recording disabled during analysis"
                    : recorder.state.status === "recording"
                      ? "Recording — click to stop"
                      : recorder.state.status === "stopped"
                        ? "Recording ready"
                        : "Tap to start recording"}
                </p>
              </div>

              {recorder.state.audioUrl && (
                <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-white px-4 py-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const audio = new Audio(recorder.state.audioUrl!);
                        audio.play();
                      }}
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100"
                      aria-label="Replay recording"
                    >
                      <Play className="h-4 w-4" />
                    </button>
                    <div>
                      <p className="text-sm font-medium">Recording</p>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(recorder.state.seconds)} · ready to analyze
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!isAnalyzing) {
                        recorder.reset();
                        onClear();
                      }
                    }}
                    disabled={isAnalyzing}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-destructive disabled:opacity-30 disabled:pointer-events-none"
                    aria-label="Delete recording"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}

              {recorder.state.error && !errorMessage && (
                <div
                  role="alert"
                  className="mt-4 flex items-start gap-3 rounded-xl border border-[color:oklch(0.88_0.09_25)] bg-[color:oklch(0.97_0.03_25)] p-4"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 text-destructive" />
                  <p className="text-xs text-muted-foreground">{recorder.state.error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 border-t border-border bg-secondary/30 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <p className="text-center text-xs text-muted-foreground sm:text-left">
              Your audio is processed in-session only. Nothing is stored on our servers.
            </p>
            <div className="flex items-center justify-center gap-3">
              {isAnalyzing ? (
                <button
                  type="button"
                  onClick={onCancel}
                  className="btn-secondary h-11 flex-1 px-5 sm:flex-none border-destructive text-destructive hover:bg-destructive/10"
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cancel Analysis
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      clearUpload();
                      recorder.reset();
                    }}
                    disabled={!hasFile}
                    className="btn-secondary h-11 flex-1 px-5 sm:flex-none"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={onAnalyze}
                    disabled={!hasFile}
                    className="btn-primary h-11 flex-1 px-6 sm:flex-none"
                  >
                    <Sparkles className="h-4 w-4" />
                    {isError ? "Retry" : "Analyze speech"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PanelHeader({
  icon,
  title,
  hint,
}: {
  icon: React.ReactNode;
  title: string;
  hint: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
          {icon}
        </span>
        <h3 className="text-sm font-semibold tracking-tight text-foreground">{title}</h3>
      </div>
      <span className="text-xs text-muted-foreground">{hint}</span>
    </div>
  );
}

function formatTime(seconds: number): string {
  const s = Math.floor(seconds);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m.toString().padStart(2, "0")}:${r.toString().padStart(2, "0")}`;
}
