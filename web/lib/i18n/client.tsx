"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { createT, type TFunction } from "./translate";
import { messagesFor, type Locale } from "./config";

interface LocaleContextValue {
  locale: Locale;
  t: TFunction;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

// Seeded from the server-read locale in the root layout, so client components
// render in the right language from first paint. The toggle changes the cookie
// + calls router.refresh(), which re-renders the layout and flows a new
// `locale` prop down here.
export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const value = useMemo<LocaleContextValue>(
    () => ({ locale, t: createT(messagesFor(locale)) }),
    [locale],
  );
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

function useLocaleContext(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useT/useLocale must be used within <LocaleProvider>");
  return ctx;
}

export function useT(): TFunction {
  return useLocaleContext().t;
}

export function useLocale(): Locale {
  return useLocaleContext().locale;
}
