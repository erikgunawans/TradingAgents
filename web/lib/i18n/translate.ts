// Tiny dictionary-driven translator. A message is either a plain string with
// {placeholder} tokens, or a function (for plurals / computed copy). Keys are
// resolved by dot-path: t("history.emptyTitleFiltered", { ticker: "NVDA" }).

type Primitive = string | number;

// The function form uses a permissive param type so catalog entries can declare
// their own specific shapes (e.g. `({ ticker }: { ticker: string })`) while
// still being assignable to the generic MessageTree. Param safety is enforced
// at each call site against the `en` catalog's inferred types, not here.
export type MessageValue =
  | string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | ((params: any) => string);

export type MessageTree = { [key: string]: MessageValue | MessageTree };

export type TFunction = (
  key: string,
  params?: Record<string, Primitive>,
) => string;

export function createT(tree: MessageTree): TFunction {
  return (key, params) => {
    const node = key.split(".").reduce<unknown>((acc, part) => {
      if (acc && typeof acc === "object") {
        return (acc as Record<string, unknown>)[part];
      }
      return undefined;
    }, tree);

    if (typeof node === "function") {
      return (node as (p: Record<string, Primitive>) => string)(params ?? {});
    }
    if (typeof node !== "string") return key; // missing key → surface the key
    if (!params) return node;
    return node.replace(/\{(\w+)\}/g, (_, name: string) =>
      name in params ? String(params[name]) : `{${name}}`,
    );
  };
}
