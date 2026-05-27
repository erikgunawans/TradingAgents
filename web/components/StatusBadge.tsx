"use client";

import { Loader2 } from "lucide-react";
import type { RunStatus } from "@/lib/types";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/client";

const VARIANTS: Record<
  RunStatus,
  { dot: string; text: string; animate?: boolean }
> = {
  queued: {
    dot: "bg-info",
    text: "text-info",
  },
  running: {
    dot: "bg-warning",
    text: "text-warning",
    animate: true,
  },
  succeeded: {
    dot: "bg-success",
    text: "text-success",
  },
  failed: {
    dot: "bg-danger",
    text: "text-danger",
  },
};

export default function StatusBadge({ status }: { status: RunStatus }) {
  const t = useT();
  const v = VARIANTS[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-surface/60 px-2.5 py-1 text-[11px] font-medium backdrop-blur-sm",
        v.text
      )}
    >
      {v.animate ? (
        <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
      ) : (
        <span
          className={cn("h-1.5 w-1.5 rounded-full", v.dot, v.animate && "animate-pulse-soft")}
          aria-hidden
        />
      )}
      {t(`status.${status}`)}
    </span>
  );
}
