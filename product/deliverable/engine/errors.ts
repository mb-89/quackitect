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
  CONDITION_UNMET: "SE-C-112", // enter/leave condition not met — evidence required
  ABOVE_THRESHOLD: "SE-C-113", // the state's priority exceeds the session threshold — the human advances
  STALE_POSITION: "SE-C-114", // the tick's `from` is not where the walk stands — the human's hand moved it
  GIT_REWRITE: "SE-C-002", // carried from v2 — no rebase; superseded content lives in history
  GIT_PUSH: "SE-C-003", // carried from v2 — the agent never pushes; the owner does
  GIT_NOT_ALLOWLISTED: "SE-C-004", // carried from v2 — git beyond the allowlist stays engine-internal
  TOLL_DUE: "SE-C-040", // carried from v2 — update overdue; pay by resending the same call with the update field
  NOTE_UNKNOWN: "SE-C-073", // carried from v2 — draining an unknown note ref is refused
  UPDATE_MALFORMED: "SE-C-120", // the update field failed to parse as a decision-graph op
  DECISION_NODE: "SE-C-121", // update names an unknown or already-resolved node
  DECISION_UNRESOLVED: "SE-C-122", // done over open children — everything started gets resolved
  DEAD_END: "SE-C-123", // completing the state would leave the machine open with nothing active — a starved join in the drawing
  CANVAS_BROKEN: "SE-C-124", // a canvas fails to compile mid-walk — the walk stands; fix the drawing
  PROSE_WALL: "SE-C-125", // long prose without a line break renders as a wall — break it into lines
  UNREADABLE_BYTES: "SE-C-126", // a binary the lane cannot show a model — images travel, arbitrary bytes do not
  UNDECLARED_ROOT: "SE-C-127", // @name addresses a root the owner has not declared — declared, never arbitrary
  JOB_UNKNOWN: "SE-C-128", // a background job ref this session never started
} as const;
