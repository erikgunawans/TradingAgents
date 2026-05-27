import { cookies } from "next/headers";
import { createT, type TFunction } from "./translate";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, messagesFor, type Locale } from "./config";

// Server components read the locale from the cookie. cookies() is async in
// Next 15.
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export async function getT(): Promise<TFunction> {
  const locale = await getLocale();
  return createT(messagesFor(locale));
}
