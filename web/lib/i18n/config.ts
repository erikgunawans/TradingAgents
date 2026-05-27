import { en } from "./messages/en";
import { id } from "./messages/id";
import type { MessageTree } from "./translate";

export const LOCALES = ["en", "id"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

// Cookie the toggle writes and both server + client read. One year, lax — it's
// a UI preference, not a credential.
export const LOCALE_COOKIE = "lang";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "id";
}

const DICTS: Record<Locale, MessageTree> = { en, id };

export function messagesFor(locale: Locale): MessageTree {
  return DICTS[locale] ?? DICTS[DEFAULT_LOCALE];
}
