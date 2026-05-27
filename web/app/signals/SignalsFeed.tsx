"use client";
import Link from "next/link";
import { Zap } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import type { SignalListOut } from "@/lib/types";
import SignalCard from "./SignalCard";
import { isActionable } from "./ranking";
import { useT } from "@/lib/i18n/client";

// Re-export so existing call-sites (and external tests) can import from
// SignalsFeed; the pure helper lives in ./ranking.ts because vitest can't
// transform .tsx under Next's `jsx: preserve` tsconfig.
export { isActionable };

export default function SignalsFeed({
  initial, monitorEnabled, tz,
}: {
  initial: SignalListOut;
  monitorEnabled: boolean;
  tz: string | null;
}) {
  const t = useT();
  if (!monitorEnabled) {
    return (
      <EmptyState
        icon={Zap}
        title={t("signals.monitorOffTitle")}
        description={t("signals.monitorOffDesc")}
        action={
          <Link
            href="/watchlist"
            className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-brand/60 bg-brand/10 px-4 text-sm font-medium text-brand hover:bg-brand/15"
          >
            {t("signals.goToWatchlist")}
          </Link>
        }
      />
    );
  }

  if (initial.items.length === 0) {
    return (
      <EmptyState
        icon={Zap}
        title={t("signals.noSignalsTitle", { date: initial.trade_date ?? t("signals.today") })}
        description={
          tz
            ? t("signals.noSignalsDescTz", { tz })
            : t("signals.noSignalsDescNoTz")
        }
        action={
          <Link
            href="/watchlist"
            className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-border/60 bg-surface/40 px-4 text-sm text-fg-muted hover:text-fg"
          >
            {t("signals.manageMonitor")}
          </Link>
        }
      />
    );
  }

  const actionable = initial.items.filter(isActionable);
  const neutral = initial.items.filter((s) => !isActionable(s));

  return (
    <div className="space-y-6">
      {actionable.length > 0 && (
        <section aria-label={t("signals.actionable")}>
          <h2 className="mb-2 font-mono text-[11px] uppercase tracking-[0.14em] text-fg-subtle">
            {t("signals.actionable")} · {actionable.length}
          </h2>
          <div className="flex flex-col gap-2">
            {actionable.map((s) => (
              <SignalCard key={s.run_id} signal={s} />
            ))}
          </div>
        </section>
      )}
      {neutral.length > 0 && (
        <section aria-label={t("signals.holdingPattern")}>
          <h2 className="mb-2 font-mono text-[11px] uppercase tracking-[0.14em] text-fg-subtle">
            {t("signals.holdingPattern")} · {neutral.length}
          </h2>
          <div className="flex flex-col gap-2 opacity-60">
            {neutral.map((s) => (
              <SignalCard key={s.run_id} signal={s} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
