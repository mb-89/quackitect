// Typed rejections — harvested from v2 (clause / expected / got / executable
// remedy / source). The contract: a weak model given ONLY this payload, cold,
// must recover in one turn. Rejections are results, not protocol errors.
export interface RejectionPayload {
  kind: "rejected";
  clause: string;
  expected: string;
  got: string;
  /** Executable: the exact call to make instead. */
  remedy: { tool: string; args: Record<string, unknown>; note?: string };
  source: string;
}

export class Rejection extends Error {
  readonly clause: string;
  readonly expected: string;
  readonly got: string;
  readonly remedy: RejectionPayload["remedy"];
  readonly source: string;

  constructor(p: Omit<RejectionPayload, "kind">) {
    super(`${p.clause}: expected ${p.expected}, got ${p.got}`);
    this.clause = p.clause;
    this.expected = p.expected;
    this.got = p.got;
    this.remedy = p.remedy;
    this.source = p.source;
  }

  toJSON(): RejectionPayload {
    return {
      kind: "rejected",
      clause: this.clause,
      expected: this.expected,
      got: this.got,
      remedy: this.remedy,
      source: this.source,
    };
  }
}

// Clause registry (v3). Numbers continue v2's SE-C series where the meaning
// carries; new clauses get fresh numbers in the 1xx block.
export const CLAUSES = {
  REQUIRED_ARGS: "SE-C-046", // carried from v2 — the String(undefined) incident
  UNKNOWN_ARGS: "SE-C-101", // wrong arg name refused, never silently coerced
  PATH_ESCAPE: "SE-C-102", // path resolves outside the project root
  OVERSIZE_READ: "SE-C-103", // whole-file read beyond budget: use offset/limit
  CAS_MISMATCH: "SE-C-104", // base_hash does not match disk
  PATCH_AMBIGUOUS: "SE-C-105", // old_string not found or not unique
  NOT_CONFIGURED: "SE-C-106", // lane exists but needs owner configuration
  RUN_TIMEOUT: "SE-C-107", // command exceeded its time budget
  NOT_LEGAL_IN_STATE: "SE-C-110", // the state gate: tool not legal in the active state
} as const;
