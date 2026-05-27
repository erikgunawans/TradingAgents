// Tolerant boolean env-flag parsing.
//
// Docker's `env_file` does NOT strip quotes the way a shell does, so a line
// like `ALLOW_GUEST_LOGIN="1"` reaches the process as the literal value `"1"`
// (quotes included). A strict `=== "1"` check then silently fails. This helper
// accepts `1`/`true`/`yes`/`on` (any case), tolerating surrounding quotes and
// whitespace, so a flag set in any reasonable way behaves the same.
export function envFlag(value: string | undefined | null): boolean {
  if (!value) return false;
  const v = value
    .trim()
    .replace(/^["']|["']$/g, "")
    .trim()
    .toLowerCase();
  return v === "1" || v === "true" || v === "yes" || v === "on";
}
