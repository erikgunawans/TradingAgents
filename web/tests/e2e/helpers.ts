import { type Page, expect } from "@playwright/test";

// Shared e2e sign-in via the E2E_TEST_MODE credentials provider. Each spec
// passes its own per-run unique githubId so specs don't pollute each other's
// state (a fresh githubId resolves to a fresh user — empty watchlist, monitor
// + notifications OFF), and re-runs don't inherit stale DB state.
//
// We land on /login with an explicit callbackUrl rather than going through
// /api/auth/signin. The /api/auth/signin path depends on the request referer
// to build callbackUrl: from Playwright's about:blank starting page the
// referer is empty, so auth.js falls back to the bare base URL — after
// sign-in the redirect lands at "/" instead of /history, the toHaveURL
// assertion times out, and the test fails flakily depending on worker
// scheduling. Forcing callbackUrl on the URL up front removes the race.
export async function signInAs(page: Page, githubId: string): Promise<void> {
  await page.goto("/login?callbackUrl=%2Fhistory");
  await page.getByLabel("GitHub ID").fill(githubId);
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/history/);
}
