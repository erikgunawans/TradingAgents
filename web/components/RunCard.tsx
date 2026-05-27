import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";
import type { RunOut } from "@/lib/types";
import RatingBadge from "./RatingBadge";
import StatusBadge from "./StatusBadge";
import { getT } from "@/lib/i18n/server";

function relativeParts(iso: string): { value: number; unitKey: "s" | "m" | "h" | "d" } {
  const ts = new Date(iso).getTime();
  const diff = Date.now() - ts;
  const sec = Math.round(diff / 1000);
  if (sec < 60) return { value: sec, unitKey: "s" };
  if (sec < 3600) return { value: Math.round(sec / 60), unitKey: "m" };
  if (sec < 86400) return { value: Math.round(sec / 3600), unitKey: "h" };
  return { value: Math.round(sec / 86400), unitKey: "d" };
}

export default async function RunCard({
  run,
  href,
}: {
  run: RunOut;
  /** Override the default `/history/{id}` target. Used by `/live/page.tsx`
   * to send active-run cards to `/live/{id}` without wrapping the card in
   * an outer Link (which would produce invalid nested-anchor HTML). */
  href?: string;
}) {
  const t = await getT();
  const rel = relativeParts(run.created_at);
  return (
    <Link
      href={href ?? `/history/${run.id}`}
      className="group relative flex items-center gap-4 overflow-hidden rounded-xl border border-border/60 bg-surface/40 px-5 py-4 backdrop-blur-sm transition-all duration-200 hover:border-border hover:bg-surface/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
    >
      {/* Hover wash — brand-tinted */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-px bg-brand opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        aria-hidden
      />

      <div className="flex min-w-0 flex-1 items-center gap-5">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2.5">
            <span className="font-mono text-[15px] font-semibold tracking-tight text-fg">
              {run.ticker}
            </span>
            <span className="font-mono text-[11px] text-fg-subtle tabular-nums">
              {run.trade_date}
            </span>
            {run.triggered_by === "monitor" && (
              <span
                className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-brand"
                title={t("runCard.monitorTitle")}
              >
                <Sparkles className="h-2.5 w-2.5" aria-hidden />
                {t("runCard.monitor")}
              </span>
            )}
          </div>
          <div className="mt-1 text-[11px] text-fg-subtle tabular-nums">
            {t("runCard.relative", { value: rel.value, unit: t(`runCard.units.${rel.unitKey}`) })}
          </div>
        </div>

        <div className="hidden sm:block">
          <StatusBadge status={run.status} />
        </div>

        <div className="w-32 text-right">
          <RatingBadge rating={run.final_rating} />
        </div>
      </div>

      <ChevronRight
        className="h-4 w-4 text-fg-subtle transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-fg-muted"
        aria-hidden
      />
    </Link>
  );
}
