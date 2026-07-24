// The default detail renderer: structured data as a native collapsible
// tree. Plain text is never the fallback for JSON; purpose-built renderers
// override this one.
const esc = (s: string): string => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function leaf(v: unknown): string {
  if (v === null) return '<span class="jt-null">null</span>';
  if (typeof v === "string") return `<span class="jt-str">${esc(v)}</span>`;
  if (typeof v === "number" || typeof v === "boolean") return `<span class="jt-lit">${String(v)}</span>`;
  return `<span class="jt-lit">${esc(String(v))}</span>`;
}

function entry(key: string | null, v: unknown, depth: number): string {
  const label = key === null ? "" : `${esc(key)}: `;
  if (v !== null && typeof v === "object") {
    const items = Array.isArray(v)
      ? v.map((x, i) => entry(String(i), x, depth + 1)).join("")
      : Object.entries(v as Record<string, unknown>).map(([k, x]) => entry(k, x, depth + 1)).join("");
    const keys = Object.keys(v as object);
    const preview = Array.isArray(v)
      ? `[${keys.length}]`
      : `{${keys.slice(0, 4).map(esc).join(", ")}${keys.length > 4 ? ", …" : ""}}`;
    const open = depth < 2 ? " open" : "";
    return `<details class="jt"${open}><summary>${label}${preview}</summary><div class="jt-kids">${items}</div></details>`;
  }
  return `<div class="jt-leaf">${label}${leaf(v)}</div>`;
}

/** Render any JSON-shaped value as nested collapsible elements. */
export function renderJsonTree(value: unknown): string {
  return `<div class="jsontree">${entry(null, value, 0)}</div>`;
}
