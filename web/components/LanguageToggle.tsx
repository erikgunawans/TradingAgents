"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useT } from "@/lib/i18n/client";
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, LOCALES, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/cn";

const SHORT: Record<Locale, string> = { en: "EN", id: "ID" };
const NAME: Record<Locale, "english" | "indonesian"> = {
  en: "english",
  id: "indonesian",
};

export default function LanguageToggle() {
  const locale = useLocale();
  const t = useT();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function setLocale(next: Locale) {
    if (next === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;
    // Re-render server components (and the layout that seeds LocaleProvider)
    // so both server- and client-rendered copy switch together.
    startTransition(() => router.refresh());
  }

  return (
    <div
      role="group"
      aria-label={t("lang.label")}
      className={cn(
        "inline-flex items-center rounded-full border border-border/60 bg-surface/50 p-0.5 text-[11px] font-medium",
        isPending && "opacity-60",
      )}
    >
      {LOCALES.map((loc) => {
        const active = loc === locale;
        return (
          <button
            key={loc}
            type="button"
            onClick={() => setLocale(loc)}
            aria-pressed={active}
            aria-label={t("lang.switchTo", { name: t(`lang.${NAME[loc]}`) })}
            className={cn(
              "rounded-full px-2 py-0.5 transition-colors",
              active ? "bg-elevated text-fg" : "text-fg-subtle hover:text-fg",
            )}
          >
            {SHORT[loc]}
          </button>
        );
      })}
    </div>
  );
}
