// The edge vocabulary — p4-edge-vocabulary.md rev 2 (owner-adjudicated
// 2026-07-22). Direction = the word: `a KIND b` is stored in a's frontmatter
// naming b. Ripple is declared per kind, never inferred from direction.
//
// Remaining owner items were named-only with defaults; the defaults are taken
// here and recorded as such in bootstrap/B-log.md:
//   exemplifies (story→value_prop) · fulfills (function→requirement) ·
//   off-spine kinds lint-exempt.

export type SuspectDirection = "source" | "target" | "none";

export interface EdgeKindDecl {
  kind: string;
  /** Who goes suspect when the other end's content changes. */
  suspects: SuspectDirection;
  /** One-line reading, source → target. */
  reads: string;
  breaks_if_removed: string;
}

export const EDGE_KINDS: readonly EdgeKindDecl[] = [
  { kind: "derives_from", suspects: "source", reads: "value_prop derives from vision", breaks_if_removed: "value_props float free of vision; scope creep has no anchor" },
  { kind: "realizes", suspects: "source", reads: "realization_artifact realizes design_element", breaks_if_removed: "artifacts stop tracing to the design they embody" },
  { kind: "exemplifies", suspects: "source", reads: "user_story exemplifies value_prop", breaks_if_removed: "stories stop being the concrete proof of a value_prop" },
  { kind: "generalizes", suspects: "source", reads: "use_case generalizes user_story", breaks_if_removed: "use cases lose their evidence of being needed" },
  { kind: "refines", suspects: "source", reads: "requirement refines use_case; X refines X", breaks_if_removed: "requirement provenance dies; decomposition trees flatten into bags" },
  { kind: "fulfills", suspects: "source", reads: "function fulfills requirement", breaks_if_removed: "coverage matrix uncomputable both ways" },
  { kind: "allocated_to", suspects: "source", reads: "function allocated to architecture_element", breaks_if_removed: "'every function allocated exactly once' uncheckable" },
  { kind: "chosen", suspects: "source", reads: "decision chose candidate", breaks_if_removed: "decisions lose their alternatives" },
  { kind: "rejected", suspects: "source", reads: "decision rejected candidate; rejected preserved as history", breaks_if_removed: "'why not X' re-derived forever; graveyard structureless" },
  { kind: "supersedes", suspects: "none", reads: "new node supersedes old node", breaks_if_removed: "immutable decisions could never retire" },
  { kind: "addresses", suspects: "source", reads: "decision/arch_element addresses quality_req/risk/concern", breaks_if_removed: "closed risks look identical to ignored ones" },
  { kind: "constrains", suspects: "target", reads: "quality_req constrains architecture_element", breaks_if_removed: "architecture evaluation has no input list" },
  { kind: "verifies", suspects: "source", reads: "check/test verifies requirement (also design/arch per level)", breaks_if_removed: "verification coverage uncomputable" },
  { kind: "validates", suspects: "source", reads: "validation evidence validates user_story/value_prop, never requirements", breaks_if_removed: "validation collapses into verification" },
  { kind: "evaluates", suspects: "source", reads: "architecture_evaluation evaluates architecture", breaks_if_removed: "evaluation miscounted as proof" },
] as const;

export const EDGE_KIND_NAMES: ReadonlySet<string> = new Set(EDGE_KINDS.map((e) => e.kind));

export function edgeKind(kind: string): EdgeKindDecl | undefined {
  return EDGE_KINDS.find((e) => e.kind === kind);
}

// The intent chain is computed over the spine kinds, never authored (`serves`
// is not an edge — ruled). Kinds 1–7 of the vocabulary.
export const SPINE_KINDS: readonly string[] = [
  "derives_from",
  "realizes",
  "exemplifies",
  "generalizes",
  "refines",
  "fulfills",
  "allocated_to",
] as const;

// Off-spine machinery kinds are lint-exempt from the intent-chain rule.
export const CHAIN_EXEMPT_NODE_KINDS: ReadonlySet<string> = new Set([
  "guidance", "method", "glossary", "rule", "reference", "fundamental",
  "anti_decision", "question", "raid", "clause", "policy", "machine",
]);
