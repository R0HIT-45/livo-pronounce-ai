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
            <p className="mt-1 text-xs tabular-nums text-muted-foreground">Elapsed: {elapsed}s</p>
            <p className="mt-4 text-xs text-muted-foreground">
              Processing your speech. This may take a moment.
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
