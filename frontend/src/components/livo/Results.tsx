import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Copy,
  Download,
  Gauge,
  Mic,
  Sparkles,
  Target,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  ArrowUpRight,
} from "lucide-react";
import type { AnalysisResponse, WordStatus } from "@/lib/livo/types";

interface Props {
  data: AnalysisResponse;
  onPracticeAgain: () => void;
}

export function Results({ data, onPracticeAgain }: Props) {
  const a = data.assessment;
  return (
    <section className="section-y">
      <div className="mx-auto max-w-[1180px] px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mx-auto flex max-w-max items-center gap-2 rounded-full border border-[color:oklch(0.9_0.08_150)] bg-[color:oklch(0.97_0.04_150)] px-4 py-1.5 text-sm font-medium text-[color:oklch(0.45_0.14_150)]"
        >
          <CheckCircle2 className="h-4 w-4" />
          Analysis complete — your speech has been evaluated by AI.
        </motion.div>

        {/* Hero score */}
        <Stagger delay={0.1}>
          <div className="surface-card mt-8 overflow-hidden">
            <div className="grid gap-8 p-8 md:grid-cols-[auto_1fr] md:p-12">
              <div className="flex flex-col items-center justify-center">
                <BigScoreRing value={a.overall_score} />
                <GradeBadge grade={a.grade} />
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary-700">
                  Overall speech score
                </p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
                  {summaryLine(a.overall_score)}
                </h2>
                <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">
                  {aiSummary(a)}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <StatChip
                    label="Transcript length"
                    value={`${data.transcription.split(" ").length} words`}
                  />
                  <StatChip label="Duration" value={`${Math.round(data.duration)}s`} />
                  <StatChip label="Language" value={data.language.toUpperCase()} />
                </div>
              </div>
            </div>
          </div>
        </Stagger>

        {/* Metrics */}
        <Stagger delay={0.2}>
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <MetricCard
              icon={<Sparkles className="h-4 w-4" />}
              title="Clarity"
              value={a.clarity}
              desc="Words were pronounced clearly."
            />
            <MetricCard
              icon={<TrendingUp className="h-4 w-4" />}
              title="Fluency"
              value={a.fluency}
              desc="Smooth flow with minimal hesitation."
            />
            <MetricCard
              icon={<Target className="h-4 w-4" />}
              title="Confidence"
              value={a.confidence}
              desc="Steady tone and delivery."
            />
            <SpeedCard wpm={a.wpm} />
          </div>
        </Stagger>

        {/* Transcript + AI summary */}
        <Stagger delay={0.3}>
          <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div className="surface-card p-5 sm:p-7">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold tracking-tight">Transcript</h3>
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(data.transcription)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary"
                >
                  <Copy className="h-3.5 w-3.5" /> Copy
                </button>
              </div>
              <p className="mt-4 text-[15px] leading-relaxed text-foreground">
                {data.transcription}
              </p>
              <button
                type="button"
                disabled
                className="mt-5 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-1.5 text-xs text-muted-foreground"
              >
                <Download className="h-3.5 w-3.5" /> Download (coming soon)
              </button>
            </div>

            <div
              className="surface-card p-5 sm:p-7"
              style={{ background: "linear-gradient(180deg, #EFF6FF, #FFFFFF 60%)" }}
            >
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white">
                  <Sparkles className="h-4 w-4" />
                </span>
                <h3 className="text-lg font-semibold tracking-tight">AI Summary</h3>
              </div>
              <p className="mt-4 text-[15px] leading-relaxed text-foreground">{aiSummary(a)}</p>
            </div>
          </div>
        </Stagger>

        {/* Strengths + Focus */}
        <Stagger delay={0.4}>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <ListCard
              title="Strengths"
              accent="success"
              icon={<CheckCircle2 className="h-4 w-4" />}
              items={a.strengths}
            />
            <ListCard
              title="Areas to improve"
              accent="warning"
              icon={<AlertTriangle className="h-4 w-4" />}
              items={a.focus_areas}
            />
          </div>
        </Stagger>

        {/* Word analysis */}
        <Stagger delay={0.5}>
          <div className="surface-card mt-8">
            <div className="flex flex-col gap-2 border-b border-border p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold tracking-tight">Word analysis</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Per-word pronunciation confidence with targeted suggestions.
                </p>
              </div>
              <span className="inline-flex w-fit rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
                {a.word_feedback.length} words
              </span>
            </div>

            {/* Desktop table */}
            <div className="hidden max-h-[420px] overflow-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-secondary/60 backdrop-blur">
                  <tr className="text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-6 py-3 font-semibold">Word</th>
                    <th className="px-6 py-3 font-semibold">Confidence</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                    <th className="px-6 py-3 font-semibold">Suggestion</th>
                  </tr>
                </thead>
                <tbody>
                  {a.word_feedback.map((w) => (
                    <tr key={w.word} className="border-t border-border/70">
                      <td className="px-6 py-4 font-medium text-foreground">{w.word}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-32 overflow-hidden rounded-full bg-secondary">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${w.confidence}%`,
                                background: confidenceColor(w.confidence),
                              }}
                            />
                          </div>
                          <span className="w-10 text-xs font-semibold tabular-nums text-foreground">
                            {w.confidence}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={w.status} />
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{w.suggestion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="max-h-[420px] space-y-3 overflow-auto p-4 md:hidden">
              {a.word_feedback.map((w) => (
                <div key={w.word} className="rounded-xl border border-border bg-white p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">{w.word}</span>
                    <StatusBadge status={w.status} />
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Confidence</span>
                      <span className="font-semibold tabular-nums text-foreground">
                        {w.confidence}%
                      </span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${w.confidence}%`,
                          background: confidenceColor(w.confidence),
                        }}
                      />
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{w.suggestion}</p>
                </div>
              ))}
            </div>
          </div>
        </Stagger>

        {/* Practice again */}
        <Stagger delay={0.6}>
          <div className="mt-10 grid gap-6 md:grid-cols-[1.4fr_1fr]">
            <div className="surface-card flex flex-col items-start justify-between gap-5 p-6 sm:flex-row sm:items-center sm:p-8">
              <div>
                <h3 className="text-lg font-semibold tracking-tight sm:text-xl">
                  Ready for another round?
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Practice the highlighted words, then record again to measure your improvement.
                </p>
              </div>
              <button
                type="button"
                onClick={onPracticeAgain}
                className="btn-primary w-full sm:w-auto"
              >
                <RotateCcw className="h-4 w-4" />
                Practice again
              </button>
            </div>

            <div className="surface-card flex flex-col justify-between p-6 sm:p-8 opacity-80">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Coming soon
                </span>
                <h3 className="mt-3 text-lg font-semibold tracking-tight">Share results</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Share your AI report with teachers or mentors for structured feedback.
                </p>
              </div>
              <button
                type="button"
                disabled
                className="mt-4 inline-flex items-center gap-1.5 self-start rounded-lg border border-dashed border-border px-3 py-1.5 text-xs text-muted-foreground"
              >
                Notify me <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </Stagger>
      </div>
    </section>
  );
}

function Stagger({ delay, children }: { delay: number; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
}

function summaryLine(score: number) {
  if (score >= 90) return "Outstanding delivery.";
  if (score >= 80) return "Strong, well-controlled speech.";
  if (score >= 70) return "Solid foundation with room to sharpen.";
  return "A great starting point to build from.";
}

function aiSummary(a: AnalysisResponse["assessment"]) {
  const paceNote =
    a.wpm >= 110 && a.wpm <= 160
      ? "your speaking pace sits inside the recommended range"
      : a.wpm > 160
        ? "you're speaking a touch faster than the ideal range"
        : "you're speaking slightly slower than the ideal range";
  return `Your pronunciation was generally clear with strong articulation across most of the recording, and ${paceNote}. A few words showed lower pronunciation confidence — focus on those to raise your overall score.`;
}

function BigScoreRing({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const dur = 1100;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  const r = 78;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;

  return (
    <div className="relative h-52 w-52">
      <svg viewBox="0 0 180 180" className="h-full w-full -rotate-90">
        <circle
          cx="90"
          cy="90"
          r={r}
          fill="none"
          stroke="var(--color-primary-100)"
          strokeWidth="14"
        />
        <motion.circle
          cx="90"
          cy="90"
          r={r}
          fill="none"
          stroke="url(#big)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="big" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold tracking-tight text-foreground">{display}</span>
        <span className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          / 100
        </span>
      </div>
    </div>
  );
}

function GradeBadge({ grade }: { grade: string }) {
  return (
    <span
      className="mt-4 rounded-full px-4 py-1.5 text-sm font-semibold"
      style={{ background: "var(--gradient-primary)", color: "white" }}
    >
      {grade}
    </span>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </span>
  );
}

function MetricCard({
  icon,
  title,
  value,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  desc: string;
}) {
  return (
    <div className="surface-card p-6">
      <div className="flex items-center justify-between">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
          {icon}
        </span>
        <span className="text-2xl font-bold tabular-nums text-foreground">{value}%</span>
      </div>
      <h4 className="mt-4 text-sm font-semibold tracking-tight">{title}</h4>
      <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-primary-50">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: "var(--gradient-primary)" }}
        />
      </div>
    </div>
  );
}

function SpeedCard({ wpm }: { wpm: number }) {
  const min = 60;
  const max = 220;
  const clamped = Math.max(min, Math.min(max, wpm));
  const pos = ((clamped - min) / (max - min)) * 100;
  const idealLeft = ((110 - min) / (max - min)) * 100;
  const idealWidth = ((160 - 110) / (max - min)) * 100;
  const inRange = wpm >= 110 && wpm <= 160;

  return (
    <div className="surface-card p-6">
      <div className="flex items-center justify-between">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
          <Gauge className="h-4 w-4" />
        </span>
        <span className="text-2xl font-bold tabular-nums text-foreground">{wpm}</span>
      </div>
      <h4 className="mt-4 text-sm font-semibold tracking-tight">Speaking speed</h4>
      <p className="mt-1 text-xs text-muted-foreground">
        {inRange ? "Inside the ideal 110–160 WPM range." : "Slightly outside the ideal range."}
      </p>
      <div className="relative mt-4 h-2 rounded-full bg-primary-50">
        <div
          className="absolute inset-y-0 rounded-full bg-primary-200"
          style={{ left: `${idealLeft}%`, width: `${idealWidth}%` }}
        />
        <motion.div
          initial={{ left: "0%" }}
          animate={{ left: `${pos}%` }}
          transition={{ duration: 1 }}
          className="absolute -top-1 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-white bg-primary-700 shadow-[var(--shadow-elev-2)]"
        />
      </div>
      <div className="mt-2 flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
        <span>Too slow</span>
        <span>Ideal</span>
        <span>Too fast</span>
      </div>
    </div>
  );
}

function ListCard({
  title,
  icon,
  items,
  accent,
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
  accent: "success" | "warning";
}) {
  const styles =
    accent === "success"
      ? {
          chip: "bg-[color:oklch(0.95_0.06_150)] text-[color:oklch(0.42_0.14_150)]",
          dot: "oklch(0.65 0.16 150)",
        }
      : {
          chip: "bg-[color:oklch(0.96_0.09_75)] text-[color:oklch(0.5_0.17_60)]",
          dot: "oklch(0.72 0.16 60)",
        };

  return (
    <div className="surface-card p-7">
      <div className="flex items-center gap-2">
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${styles.chip}`}>
          {icon}
        </span>
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      </div>
      <ul className="mt-5 space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-foreground">
            <span
              className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full"
              style={{ background: styles.dot }}
            />
            <span className="leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StatusBadge({ status }: { status: WordStatus }) {
  const map: Record<WordStatus, string> = {
    Excellent: "bg-[color:oklch(0.95_0.06_150)] text-[color:oklch(0.42_0.14_150)]",
    Good: "bg-primary-50 text-primary-700",
    Fair: "bg-[color:oklch(0.96_0.09_75)] text-[color:oklch(0.5_0.17_60)]",
    "Needs Practice": "bg-[color:oklch(0.96_0.07_25)] text-[color:oklch(0.5_0.18_25)]",
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${map[status]}`}>
      {status}
    </span>
  );
}

function confidenceColor(v: number): string {
  if (v >= 88) return "oklch(0.65 0.16 150)";
  if (v >= 75) return "var(--color-primary-600)";
  if (v >= 65) return "oklch(0.72 0.16 60)";
  return "oklch(0.62 0.2 25)";
}

// Unused import silencer for icons kept for future use
void [Mic];
