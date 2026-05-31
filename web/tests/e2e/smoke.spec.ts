import { test, expect } from "@playwright/test";
import { signInAs } from "./helpers";

// Matches E2E_NVDA_RUN_ID in server/app/scripts/seed_e2e.py — the seeded
// NVDA/2024-05-10 run for the e2e-user fixture. Hardcoding the UUID lets
// this test navigate directly to the run-detail URL instead of clicking
// through /history, which is shared mutable state racing with launch-opt-in.
const SEEDED_NVDA_RUN_ID = "e2e0e2e0-0000-4000-8000-000000000002";

test("sign in via credentials provider and read a seeded run", async ({ page }) => {
  await signInAs(page, "e2e-user"); // seeded fixture user; waits for /history

  // Navigate directly to the seeded run rather than clicking through the
  // /history list. Four specs share e2e-user, and the two that launch new
  // runs (smoke test 2, launch-opt-in.spec.ts) can be mid-flight in the
  // other Playwright worker — their server-action redirects re-render
  // /history while this test's click is in flight, producing 'navigated
  // to /history' click races. Direct navigation is immune.
  await page.goto(`/history/${SEEDED_NVDA_RUN_ID}`);

  await expect(page.getByRole("heading", { name: "NVDA", exact: true })).toBeVisible();
  await expect(page.getByText("2024-05-10")).toBeVisible();
  await expect(page.getByText("Market Analysis — NVDA")).toBeVisible();
});

test("launch a run and observe queued status on live monitor", async ({ page }) => {
  await signInAs(page, "e2e-user"); // waits for /history before navigating

  await page.goto("/launch");
  await page.getByRole("textbox", { name: /ticker/i }).fill("TSLA");
  await page.getByLabel("Trade date").fill("2024-05-10");
  // Opt into the live monitor — otherwise launch redirects to /history (the
  // Wave 4 realtime opt-in default), not /live.
  await page.getByRole("checkbox", { name: /watch live/i }).check();
  await page.getByRole("button", { name: /launch analysis/i }).click();

  // We should be redirected to /live/<run_id>
  await page.waitForURL(/\/live\/[a-f0-9-]+/);
  await expect(page.getByRole("heading", { name: "TSLA", exact: true })).toBeVisible();
  // Status badge renders one of the expected states (case-insensitive — the
  // StatusBadge label is title-case, e.g. "Queued").
  await expect(page.getByText(/queued|running|succeeded|failed/i).first()).toBeVisible();
});
