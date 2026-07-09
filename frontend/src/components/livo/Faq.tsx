import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Waves } from "lucide-react";

const FAQ = [
  {
    q: "What does the AI actually analyze?",
    a: "Livo evaluates pronunciation confidence per word, overall clarity, fluency (rhythm and hesitation), delivery confidence, and your speaking speed in words per minute — then packages the signals into a short executive-style report.",
  },
  {
    q: "Which file formats are supported?",
    a: "MP3, WAV, OGG, WEBM, M4A, and MP4 audio tracks. Maximum file size is 25 MB. For best results, upload a clean recording with minimal background noise.",
  },
  {
    q: "Is my audio stored anywhere?",
    a: "No. Audio is processed in-session and never persisted to our servers in Version 1.0. Nothing is shared with third parties.",
  },
  {
    q: "How long does an analysis take?",
    a: "Typically a few seconds for recordings under a minute. Longer files scale roughly linearly.",
  },
  {
    q: "Can I record directly in the browser?",
    a: "Yes. Click Record in the workspace and grant microphone access — the waveform confirms your voice is being captured.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="section-y bg-white">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center">
          <span className="inline-block rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-700">
            FAQ
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-[-0.02em] md:text-4xl">
            Answers to common questions
          </h2>
        </div>

        <div className="mt-12 space-y-3">
          {FAQ.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} className="surface-card overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="text-base font-semibold text-foreground">{item.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 flex-shrink-0 text-primary-600 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto max-w-[1180px] px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
                style={{ background: "var(--gradient-primary)" }}
              >
                <Waves className="h-4 w-4" />
              </span>
              <span className="text-base font-semibold tracking-tight">Livo Pronounce AI</span>
            </div>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              Speak clearly. Improve confidently. AI-powered speech intelligence for students,
              professionals, and public speakers.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Product
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a
                  href="#features"
                  className="text-foreground transition-colors hover:text-primary-700"
                >
                  Features
                </a>
              </li>
              <li>
                <a href="#how" className="text-foreground transition-colors hover:text-primary-700">
                  How it works
                </a>
              </li>
              <li>
                <a
                  href="#analyze"
                  className="text-foreground transition-colors hover:text-primary-700"
                >
                  Analyze
                </a>
              </li>
              <li>
                <a href="#faq" className="text-foreground transition-colors hover:text-primary-700">
                  FAQ
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              About
            </p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Version 1.0</li>
              <li>Built with React, TypeScript & Tailwind CSS</li>
              <li>Privacy-first by default</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} Livo Pronounce AI. All rights reserved.</span>
          <span>Speak Clearly. Improve Confidently.</span>
        </div>
      </div>
    </footer>
  );
}
