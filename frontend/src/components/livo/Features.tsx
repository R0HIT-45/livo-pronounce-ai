import { motion } from "framer-motion";
import {
  Sparkles,
  Waves,
  Gauge,
  ShieldCheck,
  MessageSquareQuote,
  ActivitySquare,
  UploadCloud,
  Brain,
  BarChart3,
  Repeat,
} from "lucide-react";
import type { ReactNode } from "react";

const FEATURES: { icon: ReactNode; title: string; desc: string }[] = [
  {
    icon: <Sparkles className="h-5 w-5" />,
    title: "Pronunciation analysis",
    desc: "Per-word confidence scoring with practical, targeted improvement tips.",
  },
  {
    icon: <MessageSquareQuote className="h-5 w-5" />,
    title: "Speech clarity",
    desc: "Measure how clearly each syllable and consonant lands for the listener.",
  },
  {
    icon: <Waves className="h-5 w-5" />,
    title: "Fluency measurement",
    desc: "Detects hesitation, filler patterns, and rhythm across the recording.",
  },
  {
    icon: <ActivitySquare className="h-5 w-5" />,
    title: "Speaking confidence",
    desc: "Evaluates steadiness of tone, projection, and delivery consistency.",
  },
  {
    icon: <Gauge className="h-5 w-5" />,
    title: "Speaking pace (WPM)",
    desc: "Compares your speed to the ideal 110–160 WPM range for spoken English.",
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: "Actionable feedback",
    desc: "A concise report highlighting strengths and the words to practice next.",
  },
];

export function Features() {
  return (
    <section id="features" className="section-y">
      <div className="mx-auto max-w-[1180px] px-6">
        <SectionHeader
          eyebrow="Capabilities"
          title="Everything you need to speak with clarity"
          subtitle="Six focused signals — no noise, no vanity metrics — that map directly to how listeners perceive your speech."
        />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, delay: i * 0.05 }}
              className="group surface-card p-6 transition-transform hover:-translate-y-1"
            >
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-700 transition-colors group-hover:bg-primary-600 group-hover:text-white">
                {f.icon}
              </div>
              <h3 className="mt-5 text-lg font-semibold tracking-tight text-foreground">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  const steps = [
    {
      icon: <UploadCloud className="h-5 w-5" />,
      title: "Upload or record",
      desc: "Drop an audio file or record directly in the browser.",
    },
    {
      icon: <Brain className="h-5 w-5" />,
      title: "AI processing",
      desc: "The engine transcribes and evaluates your speech in seconds.",
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: "Speech analysis",
      desc: "Receive an executive-style report with scores and word feedback.",
    },
    {
      icon: <Repeat className="h-5 w-5" />,
      title: "Improve & practice",
      desc: "Act on focus areas and rerun to measure your progress.",
    },
  ];

  return (
    <section id="how" className="section-y bg-white">
      <div className="mx-auto max-w-[1180px] px-6">
        <SectionHeader
          eyebrow="How it works"
          title="Four steps from voice to insight"
          subtitle="A calm workflow designed so the AI does the heavy lifting while you stay focused on speaking."
        />

        <div className="relative mt-12 grid gap-8 sm:grid-cols-2 md:mt-16 md:grid-cols-4">
          <div
            aria-hidden
            className="absolute left-0 right-0 top-6 hidden h-px md:block"
            style={{
              background:
                "linear-gradient(to right, transparent, var(--color-primary-200) 12%, var(--color-primary-200) 88%, transparent)",
            }}
          />
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="relative flex flex-col items-start sm:items-center sm:text-center"
            >
              <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-primary-200 bg-surface text-primary-700 shadow-[var(--shadow-elev-2)]">
                <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 text-[11px] font-bold text-white">
                  {i + 1}
                </span>
                {s.icon}
              </div>
              <h4 className="mt-4 text-base font-semibold tracking-tight text-foreground">
                {s.title}
              </h4>
              <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <span className="inline-block rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-700">
        {eyebrow}
      </span>
      <h2 className="mt-4 text-3xl font-bold tracking-[-0.02em] text-foreground md:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">{subtitle}</p>
    </div>
  );
}
