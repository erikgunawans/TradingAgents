// Pure copy/logic helpers for NotificationSection, split out so vitest can
// transform them without the JSX-bearing component (Next.js requires
// jsx: preserve, which vitest can't transform — same pattern as signals/ranking.ts).

/** "BUY,SELL" → "BUY or SELL"; "BUY" → "BUY"; "" → "actionable".
 * `joiner`/`actionable` default to English so existing call sites + the unit
 * test stay valid; callers pass localized values for non-English locales. */
export function thresholdLabel(
  threshold: string,
  opts?: { actionable?: string; joiner?: string },
): string {
  const actionable = opts?.actionable ?? "actionable";
  const joiner = opts?.joiner ?? "or";
  const parts = threshold.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return actionable;
  if (parts.length === 1) return parts[0];
  return parts.slice(0, -1).join(", ") + ` ${joiner} ` + parts[parts.length - 1];
}

/** Reason the Enable button is blocked, or null if it can be enabled.
 * `reason` defaults to English; callers pass a localized string. */
export function enableDisabledReason(
  hasEmail: boolean,
  reason = "Add an email to your account to enable alerts.",
): string | null {
  return hasEmail ? null : reason;
}
