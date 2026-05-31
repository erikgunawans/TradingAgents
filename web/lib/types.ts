import type { components } from "@/lib/openapi-types";

// --- Narrow string unions (TS-only ergonomics; no Pydantic counterpart) ---

export type RunStatus = "queued" | "running" | "succeeded" | "failed";
export type AnalystKey = "market" | "social" | "news" | "fundamentals";

// --- Run schemas (re-exported from openapi-types, narrowed where useful) ---
//
// All schemas in this section mirror Pydantic models in server/app/schemas/.
// After a Pydantic schema change, run `npm run codegen` to regenerate
// web/lib/openapi-types.ts; the re-exports below pick up field additions
// and removals automatically. `npm run codegen:check` fails CI if the
// committed openapi-types.ts is stale.
//
// Two narrowings worth knowing about (server quirks the auto-gen can't fix):
//
// 1. `status` on RunOut / RunDetailOut — Pydantic types these as `str` but
//    semantically they're always one of the four RunStatus values.
//    `WithRunStatus<T>` restores the narrow union on the TS side until the
//    server schemas are unified to use the RunStatus enum (RunTailOut
//    already does, hence no narrowing for it).
//
// 2. `asset_type` on RunCreate — Pydantic gives it a default ("stock"),
//    but openapi-typescript still marks fields-with-defaults as required.
//    Callers that omit it would type-error against the generated form.
//    The narrowing here restores `?:` so omission stays valid, matching
//    server runtime behavior. Drop the narrowing once the Pydantic field
//    is declared as `Optional[Literal[...]] = "stock"`.

type WithRunStatus<T extends { status: string }> = Omit<T, "status"> & {
  status: RunStatus;
};

export type RunOut = WithRunStatus<components["schemas"]["RunOut"]>;
export type RunDetailOut = WithRunStatus<components["schemas"]["RunDetailOut"]>;
export type RunListOut = { items: RunOut[] };

type _RunCreate = components["schemas"]["RunCreate"];
export type RunCreate = Omit<_RunCreate, "asset_type"> & {
  asset_type?: "stock" | "crypto";
};

export type RunTailOut = components["schemas"]["RunTailOut"];
export type UserOut = components["schemas"]["UserOut"];
export type ReportSections = components["schemas"]["ReportSections"];

// --- Portfolio / Watchlist / Monitor / Signals / Notifications ---
//
// No narrowing needed — these don't have the str-vs-enum or default-field
// issues that the Run schemas have.

export type MemoryEntryStatus = components["schemas"]["MemoryEntryStatus"];
export type PortfolioSummaryOut = components["schemas"]["PortfolioSummaryOut"];
export type PnLPoint = components["schemas"]["PnLPoint"];
export type PortfolioCurveOut = components["schemas"]["PortfolioCurveOut"];
export type OHLCVBar = components["schemas"]["OHLCVBar"];
export type DecisionPin = components["schemas"]["DecisionPin"];
export type TickerDetailOut = components["schemas"]["TickerDetailOut"];
export type WatchlistItemOut = components["schemas"]["WatchlistItemOut"];
export type MonitorOut = components["schemas"]["MonitorOut"];
export type MonitorUpdate = components["schemas"]["MonitorUpdate"];
export type SignalOut = components["schemas"]["SignalOut"];
export type SignalListOut = components["schemas"]["SignalListOut"];
export type NotifyOut = components["schemas"]["NotifyOut"];
export type NotifyUpdate = components["schemas"]["NotifyUpdate"];
