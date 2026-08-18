// Small shared I/O helpers.
export function stripBom(s: string): string {
  return s.charCodeAt(0) === 0xfeff ? s.slice(1) : s;
}

/** see dsp-file-lane.md#cut-the-middle */
export function capMiddle(s: string, max: number): string {
  if (s.length <= max) return s;
  const headBudget = Math.floor(max * 0.8);
  const tailBudget = max - headBudget;
  let headEnd = headBudget;
  const ws = s.lastIndexOf(" ", headBudget);
  if (ws > headBudget - 80) headEnd = ws; // back off, but never far
  let tailStart = s.length - tailBudget;
  const tws = s.indexOf(" ", tailStart);
  if (tws !== -1 && tws < tailStart + 80) tailStart = tws + 1;
  return `${s.slice(0, headEnd)}\n…[${tailStart - headEnd} chars cut — the whole lives in the call log]…\n${s.slice(tailStart)}`;
}

/** Cap a value's JSON form for logging — raw payloads live with their tool.
 *  Middle-cut, so a log miner reading capped responses still sees how the
 *  payload ENDED. */
export function capJson(v: unknown, max = 500): string {
  const s = typeof v === "string" ? v : JSON.stringify(v);
  if (s === undefined) return "";
  return capMiddle(s, max);
}
