import { useEffect, useRef, useState } from "react";

export interface RecorderState {
  status: "idle" | "recording" | "stopped";
  seconds: number;
  levels: number[];
  audioUrl: string | null;
  blob: Blob | null;
  error: string | null;
}

export function useRecorder() {
  const [state, setState] = useState<RecorderState>({
    status: "idle",
    seconds: 0,
    levels: Array(32).fill(0.1),
    audioUrl: null,
    blob: null,
    error: null,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => cleanup();
  }, []);

  function cleanup() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioCtxRef.current?.close().catch(() => {});
    mediaRecorderRef.current = null;
    streamRef.current = null;
    audioCtxRef.current = null;
    analyserRef.current = null;
  }

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      source.connect(analyser);
      analyserRef.current = analyser;

      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setState((s) => ({ ...s, status: "stopped", blob, audioUrl: url }));
      };
      rec.start();
      mediaRecorderRef.current = rec;
      startTimeRef.current = Date.now();

      setState({
        status: "recording",
        seconds: 0,
        levels: Array(32).fill(0.1),
        audioUrl: null,
        blob: null,
        error: null,
      });

      const buf = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(buf);
        const levels: number[] = [];
        const step = Math.floor(buf.length / 32);
        for (let i = 0; i < 32; i++) {
          let sum = 0;
          for (let j = 0; j < step; j++) sum += buf[i * step + j];
          levels.push(Math.max(0.08, sum / step / 255));
        }
        const seconds = (Date.now() - startTimeRef.current) / 1000;
        setState((s) => ({ ...s, seconds, levels }));
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch (err) {
      setState((s) => ({
        ...s,
        error:
          err instanceof Error && err.name === "NotAllowedError"
            ? "Microphone permission denied. Enable access to record."
            : "Unable to access the microphone.",
      }));
    }
  }

  function stop() {
    mediaRecorderRef.current?.stop();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }

  function reset() {
    cleanup();
    if (state.audioUrl) URL.revokeObjectURL(state.audioUrl);
    setState({
      status: "idle",
      seconds: 0,
      levels: Array(32).fill(0.1),
      audioUrl: null,
      blob: null,
      error: null,
    });
  }

  return { state, start, stop, reset };
}
