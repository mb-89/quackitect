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
  /** FEED-FORWARD (owner ruling 2026-08-06): where the rule is stated ahead
   *  of the refusal. Computed from the clause, never passed by a caller.
   *  refusals.test.ts enforces that the section exists. */
  guidance: string;
}

/** The feed-forward pointer for a clause: its section in the refusals page.
 *  One page, one section per clause — the pairing refusals.test.ts enforces. */
export function clauseGuidance(clause: string): string {
  return `project/guidance/refusals.md § ${clause}`;
}

export class Rejection extends Error {
  readonly clause: string;
  readonly expected: string;
  readonly got: string;
  readonly remedy: RejectionPayload["remedy"];
  readonly source: string;
  readonly guidance: string;

  constructor(p: Omit<RejectionPayload, "kind" | "guidance">) {
    super(`${p.clause}: expected ${p.expected}, got ${p.got}`);
    this.clause = p.clause;
    this.expected = p.expected;
    this.got = p.got;
    this.remedy = p.remedy;
    this.source = p.source;
    this.guidance = clauseGuidance(p.clause);
  }

  toJSON(): RejectionPayload {
    return {
      kind: "rejected",
      clause: this.clause,
      expected: this.expected,
      got: this.got,
      remedy: this.remedy,
      source: this.source,
      guidance: this.guidance,
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
  STALE_POSITION: "SE-C-114", // reserved, never issued — old logs carry it
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
  RUN_LANE_JOB: "SE-C-129", // se_run asked to do a lane tool's job — the lane covers it; the ladder blocks after one warned run
  // SE-C-130 AND SE-C-131 ARE RETIRED (owner ruling 2026-08-16). One refused a
  // re-run over an unchanged tree; the other refused the wrong test scope. On
  // 2026-08-16 they closed on each other — each remedy was the other refusal,
  // and no test call was legal at all for four milestones.
  //
  // THE CAUSE WAS THE AGENT CHOOSING AND THE ENGINE GRADING THE CHOICE. Now
  // `decideScope` reads what changed and decides, so there is nothing to grade:
  // an unchanged tree is answered with scope "nothing", and a scope the agent
  // cannot name is a scope the agent cannot get wrong.
  // SE-C-134 IS RETIRED (owner ruling 2026-08-14). Shared method resolves to
  // the machine root whatever tree is bound, so a method write can no longer
  // land in a tree that does not own it. The number is not reused.
  NARRATION_STALLED: "SE-C-133", // updates keep coming while the checklist never moves — warned once, then refused
  RAW_NUL: "SE-C-132", // a raw NUL byte in text — it makes the whole file unsearchable; in code it is corrected to the escape, elsewhere the intent is not knowable
  WRITE_TRANSFORMED: "SE-C-135", // the applied text does not contain the payload — something transformed it on the way in; refused rather than silently corrupted
  TEST_NO_QUESTION: "SE-C-136", // a scoped run with no question — the scope says which tests ran, only the question says why
  OUTPUT_SHAPED: "SE-C-137", // a truncating pipe would cut the output BEFORE the engine sees it — refused at the boundary, because what it drops exists nowhere
  CORPUS_UNREADABLE: "SE-C-138", // a write would leave a corpus node the engine's own reader cannot parse — refused before it lands, because the break surfaces later at a reader that cannot name it
  REF_UNRESOLVED: "SE-C-139", // a ref that git cannot resolve — typed rather than raw, because a raw git error reads as "the file is missing" when the BRANCH is missing
  PRODUCE_REFUSED: "SE-C-142", // a producing act stopped BEFORE writing anything — an occupied destination, a missing name, or a tree it cannot read its own identity from
  OUTSIDE_ACT_BOUND: "SE-C-141", // a write left the tree the running act is producing — a DIFFERENT fault from leaving the project root, and told apart on purpose so the mechanism can be debugged
  WRITE_TARGET_IS_SOURCE: "SE-C-140", // a writable declared root is the tree this system was produced from — or the guard cannot prove it is not; it fails CLOSED, because the isolation law is the one thing a vehicle may never breach
} as const;
