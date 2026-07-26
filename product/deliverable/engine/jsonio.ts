// Small shared I/O helpers.
export function stripBom(s: string): string {
  return s.charCodeAt(0) === 0xfeff ? s.slice(1) : s;
}

/** Cap a value's JSON form for logging — raw payloads live with their tool. */
export function capJson(v: unknown, max = 500): string {
  const s = typeof v === "string" ? v : JSON.stringify(v);
  if (s === undefined) return "";
  return s.length <= max ? s : `${s.slice(0, max)}…[+${s.length - max} chars]`;
}
