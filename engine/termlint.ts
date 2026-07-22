// Term-link law (owner ruling 2026-07-22, p4-day-one-schemas §11) — the
// lint half. Two findings: a known term rendered unlinked (renderer bug —
// deferred to the render era) and a term/abbreviation with no glossary
// entry (missing definition). This is the second one: the definition
// worklist, computed from the ledger.
import type { Ledger } from "./store.ts";

/** Tokens that read as abbreviations but are not domain terms. */
const NOISE = new Set([
  "TODO", "NOTE", "OK", "YES", "NO", "AND", "OR", "NOT", "THE", "PASS", "FAIL",
  "README", "AGENTS", "RUNME", "II", "III", "IV", "VI", "VII", "UTF", "ASCII",
]);

export interface TermWorklist {
  /** Abbreviation -> node ids it appears in (capped). */
  missing: Record<string, string[]>;
  glossaryTerms: number;
}

export function termWorklist(ledger: Ledger): TermWorklist {
  const known = new Set<string>();
  for (const n of ledger.nodes.values()) {
    if (n.kind !== "glossary") continue;
    const term = n.extra.v1_term ?? n.extra.term;
    if (typeof term === "string") known.add(term.toUpperCase());
    const aliases = n.extra.v1_aliases ?? n.extra.aliases;
    if (Array.isArray(aliases)) for (const a of aliases) known.add(a.toUpperCase());
    known.add(n.localId.replace(/^gloss-/, "").toUpperCase());
  }

  const missing = new Map<string, Set<string>>();
  for (const n of ledger.nodes.values()) {
    const text = `${n.statement}\n${n.body}`;
    for (const m of text.matchAll(/\b[A-Z][A-Z0-9]{1,7}\b/g)) {
      const token = m[0];
      if (NOISE.has(token) || known.has(token)) continue;
      if (/^\d+$/.test(token)) continue;
      if (!missing.has(token)) missing.set(token, new Set());
      const set = missing.get(token)!;
      if (set.size < 5) set.add(n.id);
    }
  }

  const out: Record<string, string[]> = {};
  for (const [term, nodes] of [...missing.entries()].sort((a, b) => b[1].size - a[1].size || a[0].localeCompare(b[0]))) {
    out[term] = [...nodes];
  }
  return { missing: out, glossaryTerms: known.size };
}
