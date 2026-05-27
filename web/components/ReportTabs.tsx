"use client";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ReportSections } from "@/lib/types";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/client";

const ORDER: { key: keyof ReportSections; labelKey: string }[] = [
  { key: "market", labelKey: "market" },
  { key: "sentiment", labelKey: "sentiment" },
  { key: "news", labelKey: "news" },
  { key: "fundamentals", labelKey: "fundamentals" },
  { key: "investment_plan", labelKey: "research" },
  { key: "trader_plan", labelKey: "trader" },
  { key: "final", labelKey: "final" },
];

// remark-gfm is stateless; hoisting prevents a new array identity per render
// (the original Wave 1 review caught this).
const REMARK_PLUGINS = [remarkGfm];

export default function ReportTabs({ sections }: { sections: ReportSections }) {
  const t = useT();
  const available = ORDER.filter((tab) => sections[tab.key]);
  const [active, setActive] = useState<keyof ReportSections | null>(
    available[0]?.key ?? null
  );
  if (!active) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-surface/40 px-6 py-12 text-center text-sm text-fg-muted">
        {t("reportTabs.empty")}
      </div>
    );
  }
  return (
    <div>
      <div
        role="tablist"
        className="mb-6 flex flex-wrap gap-1 border-b border-border"
      >
        {available.map((tab) => (
          <button
            key={tab.key}
            id={`report-tab-${tab.key}`}
            role="tab"
            aria-selected={active === tab.key}
            aria-controls={`report-tabpanel-${tab.key}`}
            tabIndex={active === tab.key ? 0 : -1}
            onClick={() => setActive(tab.key)}
            className={cn(
              "relative h-10 px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
              active === tab.key
                ? "text-fg"
                : "text-fg-muted hover:text-fg"
            )}
          >
            {t(`reportTabs.${tab.labelKey}`)}
            {active === tab.key && (
              <span
                className="absolute inset-x-0 -bottom-px h-0.5 bg-brand"
                aria-hidden
              />
            )}
          </button>
        ))}
      </div>
      <article
        role="tabpanel"
        id={`report-tabpanel-${active}`}
        aria-labelledby={`report-tab-${active}`}
        className="prose-report"
      >
        <ReactMarkdown remarkPlugins={REMARK_PLUGINS}>
          {sections[active] ?? ""}
        </ReactMarkdown>
      </article>
    </div>
  );
}
