"use client";

import { TrendingDown, TrendingUp, Minus, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/client";

// Rating taxonomy → outlined chip with icon. Outline rather than fill keeps
// the page reading "calm" — the data is the focus, not the badge. The label
// itself comes from the i18n catalog (rating.{Buy,Overweight,Hold,Underweight,Sell})
// so the locale toggle flips this everywhere it renders (RunCard, /history,
// /live, /portfolio detail pages).
const RATING_MAP: Record<
  string,
  { ring: string; text: string; Icon: typeof TrendingUp }
> = {
  Buy: {
    ring: "ring-success/30",
    text: "text-success",
    Icon: TrendingUp,
  },
  Overweight: {
    ring: "ring-success/25",
    text: "text-success/90",
    Icon: ArrowUp,
  },
  Hold: {
    ring: "ring-border",
    text: "text-fg-muted",
    Icon: Minus,
  },
  Underweight: {
    ring: "ring-warning/30",
    text: "text-warning",
    Icon: ArrowDown,
  },
  Sell: {
    ring: "ring-danger/30",
    text: "text-danger",
    Icon: TrendingDown,
  },
};

export default function RatingBadge({ rating }: { rating: string | null }) {
  const t = useT();
  if (!rating) {
    return <span className="text-fg-subtle tabular-nums">—</span>;
  }
  const r = RATING_MAP[rating];
  if (!r) {
    return (
      <span className="inline-flex items-center rounded-full bg-surface px-2.5 py-1 text-[11px] font-medium text-fg-muted ring-1 ring-inset ring-border">
        {rating}
      </span>
    );
  }
  const Icon = r.Icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-surface/60 px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset backdrop-blur-sm",
        r.ring,
        r.text
      )}
    >
      <Icon className="h-3 w-3" strokeWidth={2.25} aria-hidden />
      {t(`rating.${rating}`)}
    </span>
  );
}
