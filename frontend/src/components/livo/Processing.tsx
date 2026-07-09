import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { PROCESSING_STAGES } from "@/lib/livo/analysis";

export function Processing({ stage }: { stage: number }) {
  const progress = Math.min(100, ((stage + 1) / PROCESSING_STAGES.length) * 100);
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
            <p className="mt-2 text-sm text-muted-foreground">
              Usually takes just a few seconds. Please keep this tab open.
            </p>
          </div>

          <div className="mt-8">
            <div className="h-2 overflow-hidden rounded-full bg-primary-50">
              <motion.div
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ background: "var(--gradient-primary)" }}
              />
            </div>
            <p className="mt-2 text-right text-xs font-semibold tabular-nums text-primary-700">
              {Math.round(progress)}%
            </p>
          </div>

          <ul className="mt-6 grid gap-2 sm:grid-cols-2">
            {PROCESSING_STAGES.map((label, i) => {
              const done = i < stage;
              const active = i === stage;
              return (
                <li
                  key={label}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                    done
                      ? "border-primary-100 bg-primary-50/60 text-foreground"
                      : active
                        ? "border-primary-200 bg-white text-foreground shadow-[var(--shadow-elev-1)]"
                        : "border-border bg-white/50 text-muted-foreground"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full ${
                      done
                        ? "bg-primary-600 text-white"
                        : active
                          ? "bg-primary-100 text-primary-700"
                          : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {done ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : active ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <span className="text-[10px] font-bold">{i + 1}</span>
                    )}
                  </span>
                  <span className="text-xs font-medium">{label}</span>
                </li>
              );
            })}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
