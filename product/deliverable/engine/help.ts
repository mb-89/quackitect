// se.help (§5) — keyword search over tool descriptions + guidance slices.
// Returns closest-match AFFORDANCES (never recommendations), or the honest,
// permissive refusal: "no such tool — do it yourself." Every call is logged
// with stated intent: misses are the live missing-tool demand signal.
import type { ToolDef } from "./mcp.ts";
import type { MachineDecl } from "./machine.ts";

export interface HelpResult {
  hits: { tool: string; title: string; description: string }[];
  guidance_hits: { state: string; guidance: string }[];
  refusal?: string;
}

export function help(query: string, intent: string, tools: ToolDef[], machine: MachineDecl | null): HelpResult {
  const terms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 1);
  const score = (text: string): number => {
    const lower = text.toLowerCase();
    return terms.reduce((n, t) => n + (lower.includes(t) ? 1 : 0), 0);
  };
  const hits = tools
    .map((t) => ({ t, s: score(`${t.name} ${t.title} ${t.description}`) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 5)
    .map((x) => ({ tool: x.t.name, title: x.t.title, description: x.t.description }));
  const guidanceHits = (machine === null ? [] : machine.states)
    .map((s) => ({ s, n: score(`${s.id} ${s.statement} ${s.guidance}`) }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n)
    .slice(0, 3)
    .map((x) => ({ state: x.s.id, guidance: x.s.guidance }));

  // One line per dispatch: the observer logs this call; the miss is
  // recoverable from the logged response summary.
  const miss = hits.length === 0;
  return {
    hits,
    guidance_hits: guidanceHits,
    ...(miss
      ? { refusal: "no such tool — do it yourself. This miss is logged as tool demand; recurring misses become tools." }
      : {}),
  };
}
