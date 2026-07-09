import { motion } from "framer-motion";
import { Waves, Sparkles, ShieldCheck, Gauge, ArrowRight, Mic } from "lucide-react";

export function Hero() {
  return (
    <section id="home" className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: "var(--gradient-hero)" }}
      />
      <div className="mx-auto max-w-[1180px] px-6 pt-24 pb-20 sm:pt-28 sm:pb-24 md:pt-36 md:pb-32">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-700"
            >
              <Sparkles className="h-3.5 w-3.5" />
              AI Speech Intelligence · v1.0
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="mt-5 text-3xl font-bold leading-[1.08] tracking-[-0.03em] text-foreground sm:text-4xl md:text-6xl"
            >
              AI-powered speech intelligence
              <span
                className="block bg-clip-text text-transparent"
                style={{ backgroundImage: "var(--gradient-primary)" }}
              >
                that helps you speak with confidence.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
            >
              Livo Pronounce AI evaluates pronunciation, clarity, fluency, confidence, and speaking
              speed — then returns a clear, actionable report in seconds.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-7 flex flex-wrap items-center gap-3"
            >
              <a href="#analyze" className="btn-primary w-full sm:w-auto">
                Analyze your speech
                <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#how" className="btn-secondary w-full sm:w-auto">
                How it works
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2.5 text-sm text-muted-foreground"
            >
              <Badge icon={<Sparkles className="h-3.5 w-3.5" />} label="AI Powered" />
              <Badge icon={<Gauge className="h-3.5 w-3.5" />} label="Fast Analysis" />
              <Badge icon={<ShieldCheck className="h-3.5 w-3.5" />} label="Privacy Focused" />
              <Badge icon={<Waves className="h-3.5 w-3.5" />} label="Professional Feedback" />
            </motion.div>
          </div>

          <HeroPreview />
        </div>
      </div>
    </section>
  );
}

function Badge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-foreground">
      <span className="text-primary-600">{icon}</span>
      {label}
    </span>
  );
}

function HeroPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.2 }}
      className="relative"
    >
      <div className="absolute -inset-6 -z-10 rounded-[36px] bg-primary-100/60 blur-3xl" />
      <div className="surface-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-[oklch(0.75_0.16_140)]" />
            <span className="text-sm font-semibold text-foreground">Live report</span>
          </div>
          <span className="rounded-full bg-primary-50 px-2.5 py-1 text-[11px] font-semibold text-primary-700">
            Excellent
          </span>
        </div>

        <div className="grid gap-6 p-6 sm:grid-cols-[auto_1fr]">
          <div className="flex items-center justify-center">
            <ScoreRing value={92} />
          </div>
          <div className="space-y-3">
            <MetricRow label="Clarity" value={94} />
            <MetricRow label="Fluency" value={90} />
            <MetricRow label="Confidence" value={88} />
            <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
              <Mic className="h-3.5 w-3.5 text-primary-600" />
              145 WPM · ideal range
            </div>
          </div>
        </div>

        <div className="border-t border-border px-6 py-4">
          <div className="flex items-end gap-[3px]">
            {Array.from({ length: 48 }).map((_, i) => {
              const h = 8 + Math.abs(Math.sin(i * 0.6)) * 28 + (i % 5) * 2;
              return (
                <motion.span
                  key={i}
                  initial={{ scaleY: 0.2 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.6, delay: i * 0.01 }}
                  className="w-1 origin-bottom rounded-full bg-primary-500/70"
                  style={{ height: h }}
                />
              );
            })}
          </div>
          <p className="mt-3 line-clamp-1 text-xs text-muted-foreground">
            "Hello everyone, welcome to Livo Pronounce AI…"
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function ScoreRing({ value }: { value: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative h-32 w-32">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="var(--color-primary-100)"
          strokeWidth="10"
        />
        <motion.circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="url(#g)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tracking-tight text-foreground">{value}</span>
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Overall
        </span>
      </div>
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium text-foreground">{label}</span>
        <span className="font-semibold text-primary-700">{value}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-primary-50">
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
