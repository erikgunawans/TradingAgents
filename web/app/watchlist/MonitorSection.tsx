"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { updateMonitorAction } from "@/app/actions";
import { useT } from "@/lib/i18n/client";

type MonitorState = {
  enabled: boolean;
  briefingTimeLocal: string | null;
  briefingTz: string | null;
  nextBriefingAt: string | null;
};

function browserTz(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC";
  } catch {
    return "UTC";
  }
}

function formatCountdown(targetIso: string | null, dueNow: string): string {
  if (!targetIso) return "";
  const ms = new Date(targetIso).getTime() - Date.now();
  if (ms <= 0) return dueNow;
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

export default function MonitorSection({
  initial,
  tickerCount,
  tickers,
}: {
  initial: MonitorState;
  tickerCount: number;
  tickers: string[];
}) {
  const t = useT();
  const router = useRouter();
  const [state, setState] = useState<MonitorState>(initial);
  const [countdown, setCountdown] = useState(() =>
    formatCountdown(initial.nextBriefingAt, t("monitor.dueNow")),
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const tick = () => setCountdown(formatCountdown(state.nextBriefingAt, t("monitor.dueNow")));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [state.nextBriefingAt, t]);

  async function apply(next: Partial<MonitorState>) {
    const merged = { ...state, ...next };
    setState(merged);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const r = await updateMonitorAction({
          enabled: merged.enabled,
          briefing_time_local: merged.briefingTimeLocal,
          briefing_tz: merged.briefingTz,
        });
        if (!r.ok) throw new Error(r.message);
        const res = r.data;
        setState({
          enabled: res.enabled,
          briefingTimeLocal: res.briefing_time_local,
          briefingTz: res.briefing_tz,
          nextBriefingAt: res.next_briefing_at,
        });
      } catch (e) {
        console.error("monitor save failed", e);
      }
    }, 800);
  }

  async function onEnable() {
    const tz = state.briefingTz ?? browserTz();
    const time = state.briefingTimeLocal ?? "07:00";
    // Immediate POST so the user is "on" right away — bypass the 800ms debounce.
    try {
      const r = await updateMonitorAction({
        enabled: true, briefing_time_local: time, briefing_tz: tz,
      });
      if (!r.ok) throw new Error(r.message);
      const res = r.data;
      setState({
        enabled: true,
        briefingTimeLocal: res.briefing_time_local,
        briefingTz: res.briefing_tz,
        nextBriefingAt: res.next_briefing_at,
      });
    } catch (e) {
      console.error("monitor enable failed", e);
    }
  }

  async function onDisable() {
    try {
      const r = await updateMonitorAction({ enabled: false });
      if (!r.ok) throw new Error(r.message);
      const res = r.data;
      setState((s) => ({
        ...s,
        enabled: false,
        briefingTimeLocal: res.briefing_time_local,
        briefingTz: res.briefing_tz,
        nextBriefingAt: null,
      }));
    } catch (e) {
      console.error("monitor disable failed", e);
    }
  }

  // STATE A — monitor off
  if (!state.enabled) {
    const subtitle = tickerCount > 0
      ? t("monitor.subtitleOff", { count: tickerCount })
      : t("monitor.subtitleNoTickers");
    return (
      <div className="rounded-xl border border-border/60 bg-surface/40 p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-4 w-4 text-fg-subtle" aria-hidden />
            <span className="text-sm font-medium text-fg">{t("monitor.title")}</span>
          </div>
          <button
            type="button"
            onClick={onEnable}
            disabled={tickerCount === 0}
            className="inline-flex h-8 items-center rounded-lg border border-brand/60 bg-brand/10 px-3 text-xs font-medium text-brand transition-colors hover:bg-brand/15 disabled:opacity-50"
          >
            {t("monitor.enable")}
          </button>
        </div>
        <p className="mt-1.5 text-xs text-fg-muted">{subtitle}</p>
      </div>
    );
  }

  // STATE B — monitor on
  const sample =
    tickers.length > 0
      ? ` (${tickers.slice(0, 3).join(", ")}${tickerCount > 3 ? ", …" : ""})`
      : "";
  const tickerSummary = tickers.length
    ? t("monitor.tickerSummary", { count: tickerCount, sample })
    : t("monitor.noTickersSummary");
  return (
    <div className="rounded-xl border border-brand/40 bg-surface/40 p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Sparkles className="h-4 w-4 text-brand" aria-hidden />
          <span className="text-sm font-medium text-fg">{t("monitor.title")}</span>
        </div>
        <span className="font-mono text-[11px] text-fg-subtle">
          {t("monitor.nextBriefing", { countdown })}
        </span>
      </div>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex flex-col gap-1 text-xs text-fg-subtle">
          {t("monitor.time")}
          <input
            type="time"
            value={state.briefingTimeLocal ?? "07:00"}
            onChange={(e) => apply({ briefingTimeLocal: e.target.value })}
            aria-label={t("monitor.timeAria")}
            className="h-9 w-32 rounded-lg border border-border/60 bg-surface/40 px-2 font-mono text-sm text-fg focus:border-brand/60 focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-fg-subtle">
          {t("monitor.timezone")}
          <input
            type="text"
            list="iana-tz-list"
            value={state.briefingTz ?? browserTz()}
            onChange={(e) => apply({ briefingTz: e.target.value })}
            aria-label={t("monitor.timezoneAria")}
            className="h-9 w-56 rounded-lg border border-border/60 bg-surface/40 px-2 font-mono text-sm text-fg focus:border-brand/60 focus:outline-none"
          />
        </label>
        <button
          type="button"
          onClick={onDisable}
          className="h-9 rounded-lg border border-border/60 bg-surface/40 px-3 text-xs text-fg-muted hover:text-fg sm:ml-auto"
        >
          {t("monitor.disable")}
        </button>
      </div>
      <p className="mt-2 text-xs text-fg-muted">
        {t("monitor.summary", {
          time: state.briefingTimeLocal ?? "",
          tz: state.briefingTz ?? "",
          tickers: tickerSummary,
        })}
      </p>
    </div>
  );
}
