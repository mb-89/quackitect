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
  /** FEED-FORWARD: where the rule is stated ahead
   *  of the refusal. Computed from the clause, never passed by a caller.
   *  refusals.test.ts enforces that the section exists. */
  guidance: string;
}

/** The feed-forward pointer for a clause: its section in the refusals page.
 *  One page, one section per clause — the pairing refusals.test.ts enforces. */
export function clauseGuidance(clause: string): string {
  return `guidance/refusals.md § ${clause}`;
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
  // RETIRED and never raised. The number stays in the registry because the
  // refusals page pairs a section to every clause here, and the section for
  // this one says why it is gone. see guidance/refusals.md
  TOLL_DUE: "SE-C-040",
  NOTE_UNKNOWN: "SE-C-073", // carried from v2 — draining an unknown note ref is refused
  // SE-C-120, SE-C-121 and SE-C-122 are RETIRED with the decision graph they
  // guarded, and none of the three numbers is reused. guidance/refusals.md says
  // what each was for and what replaced it.
  DEAD_END: "SE-C-123", // completing the state would leave the machine open with nothing active — a starved join in the drawing
  CANVAS_BROKEN: "SE-C-124", // a canvas fails to compile mid-walk — the walk stands; fix the drawing
  PROSE_WALL: "SE-C-125", // long prose without a line break renders as a wall — break it into lines
  UNREADABLE_BYTES: "SE-C-126", // a binary the lane cannot show a model — images travel, arbitrary bytes do not
  UNDECLARED_ROOT: "SE-C-127", // @name addresses a root the owner has not declared — declared, never arbitrary
  JOB_UNKNOWN: "SE-C-128", // a background job ref this session never started
  RUN_LANE_JOB: "SE-C-129", // se_run asked to do a lane tool's job — the lane covers it; the ladder blocks after one warned run
  // see dsp-lane-door.md#se-c-130-and-se-c-131-are-retired
  // SE-C-133 is RETIRED with the checklist it counted. The leaving guard over a
  // state's work tokens is what holds a state shut now, and it cannot be
  // satisfied by narrating.
  RAW_NUL: "SE-C-132", // a raw NUL byte in text — it makes the whole file unsearchable; in code it is corrected to the escape, elsewhere the intent is not knowable
  WRITE_TRANSFORMED: "SE-C-135", // the applied text does not contain the payload — something transformed it on the way in; refused rather than silently corrupted
  TEST_NO_QUESTION: "SE-C-136", // a scoped run with no question — the scope says which tests ran, only the question says why
  OUTPUT_SHAPED: "SE-C-137", // a truncating pipe would cut the output BEFORE the engine sees it — refused at the boundary, because what it drops exists nowhere
  CORPUS_UNREADABLE: "SE-C-138", // a write would leave a corpus node the engine's own reader cannot parse — refused before it lands, because the break surfaces later at a reader that cannot name it
  REF_UNRESOLVED: "SE-C-139", // a ref that git cannot resolve — typed rather than raw, because a raw git error reads as "the file is missing" when the BRANCH is missing
  NOTE_TEXT_CARRIED: "SE-C-140", // a mint offered the raw note's own text as the option's statement — the rewrite IS the privacy boundary, so a paste is refused rather than corrected
  OUTSIDE_ACT_BOUND: "SE-C-141", // a write left the tree the running act is producing — a DIFFERENT fault from leaving the project root, and told apart on purpose so the mechanism can be debugged
  PRODUCE_REFUSED: "SE-C-142", // a producing act stopped BEFORE writing anything — an occupied destination, a missing name, or a tree it cannot read its own identity from
  // SE-C-143 was minted as SE-C-140 on the i16 branch and renumbered at the merge:
  // i17 shipped SE-C-140 first, and a number in a shipped log is never reused.
  WRITE_TARGET_IS_SOURCE: "SE-C-143", // a writable declared root is the tree this system was produced from — or the guard cannot prove it is not; it fails CLOSED, because the isolation law is the one thing a vehicle may never breach
  QUERY_UNKNOWN_FIELD: "SE-C-144",
  // A SEARCH PATTERN THAT IS NOT A REGEX. rg is a regex engine, and an
  // ordinary source fragment — "function route(", "aimAt()" — is a regex with
  // an unclosed group in it. It came back as raw rg stderr with no clause and
  // no remedy, which is the one thing every other refusal in this lane is not.
  SEARCH_PATTERN: "SE-C-145", // the search pattern does not parse as a regex — the escaped literal rides the refusal // a structured query names a field the matched kind does not carry — refused by name, listing the fields that ARE legal, rather than silently returning an empty column
  // A WRITE THAT ADDS A SECOND SURFACE. An engine module that emits widget
  // markup while the editor registry does not name it and the exemption list
  // does not declare it. A second surface accreted once over months and
  // nothing objected, because nothing could.
  UNREGISTERED_EMITTER: "SE-C-146",
  // A SECOND RECORD OPENED WHILE ONE IS ALREADY HELD. One engine walks one
  // record; wanting two at once means a second checkout. The refusal names
  // what is held and the verb that sets it aside, so it has an exit that is
  // neither finishing nor abandoning the work.
  PARK_NOWHERE: "SE-C-148", // a point parked for a name the walk never reaches — nothing could ever deliver it
  SECOND_RECORD_OPEN: "SE-C-147",
  // THE END OF A PIECE OF WORK, and the three ways it goes wrong. Each is a
  // different fault with a different remedy, which is why they are three
  // clauses rather than one about work.
  WORK_REASON_OWED: "SE-C-149", // a close at anything other than done, with no reason on the item
  WORK_PERSON_ONLY: "SE-C-150", // an agent settling an item whose face says a person must
  WORK_ALREADY_TAKEN: "SE-C-152", // a second hand taking work the first is already on
  WORK_TITLE_TOO_LONG: "SE-C-153", // a hand-written token title past four words
} as const;

/** A WALL OF PROSE IS REFUSED. Paragraphs are the author's job, and no renderer
 *  can invent them.
 *
 *  IT LIVES HERE BECAUSE TWO DOORS NEED IT. A guard held by one caller is a
 *  guard the other door walks past: the same text was refused from the lane and
 *  accepted from the panel. */
export function refuseProseWall(tool: string, field: string, text: string): void {
  if (text.length <= 300 || text.includes("\n")) return;
  throw new Rejection({
    clause: CLAUSES.PROSE_WALL,
    expected: `${field} broken into lines — paragraphs and list lines survive every render`,
    got: `${text.length} chars without a single line break — renders as a wall`,
    remedy: {
      tool,
      args: { [field]: "<the same text with real line breaks>" },
      note: "shape it like prose: short paragraphs, one list item per line",
    },
    source: "engine/errors.ts prose-wall",
  });
}
