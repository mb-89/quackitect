// Typed rejections (§7 Errors). A rejection cannot be constructed without
// clause, expected, got, remedy, source. The remedy is an executable payload —
// the corrected call, ready to retry — never a description.
//
// Failure kinds are never conflated (§6):
//   Rejected — illegal, contract violation. Never retry. Corrected call.
//   Failed   — legal, attempted, didn't work. Opens fallback edges.
//   Errored  — infrastructure. Retry same edge with backoff.

export interface Remedy {
  /** The tool to call instead, e.g. "se.set.apply". */
  tool: string;
  /** Ready-to-send arguments for the corrected call. */
  args: Record<string, unknown>;
  /** One line telling the caller why this call is the fix. */
  note: string;
}

export interface RejectionShape {
  kind: "rejected";
  /** Stable clause id, e.g. "SE-C-001". Clauses live in the ledger as nodes. */
  clause: string;
  expected: string;
  got: string;
  remedy: Remedy;
  /** Where the rejection was raised, e.g. "engine/git.ts assertOperable". */
  source: string;
}

export class Rejection extends Error implements RejectionShape {
  readonly kind = "rejected" as const;
  readonly clause: string;
  readonly expected: string;
  readonly got: string;
  readonly remedy: Remedy;
  readonly source: string;

  constructor(shape: Omit<RejectionShape, "kind">) {
    for (const field of ["clause", "expected", "got", "remedy", "source"] as const) {
      if (!shape[field]) throw new Error(`rejection missing required field: ${field}`);
    }
    super(`[${shape.clause}] expected ${shape.expected}, got ${shape.got}`);
    this.name = "Rejection";
    this.clause = shape.clause;
    this.expected = shape.expected;
    this.got = shape.got;
    this.remedy = shape.remedy;
    this.source = shape.source;
  }

  toJSON(): RejectionShape {
    return {
      kind: this.kind,
      clause: this.clause,
      expected: this.expected,
      got: this.got,
      remedy: this.remedy,
      source: this.source,
    };
  }
}
