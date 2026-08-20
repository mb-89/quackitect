// RULES DECLARED ON CORPUS NODES, loaded and enforced with no engine list.
//
// THIS FILE IS WHERE req-a-check-binds-without-engine-code LIVES OR FAILS.
// The constraint is not about elegance: the cost of adding a check decides how
// many exist. A rule is one line long, and if enforcing it costs an engine
// change, a review and a release, the rational move is another sentence of
// guidance — which is what was already tried, and did not hold.
//
// THE FALSIFYING TEST IS THE SECOND CHECK, NOT THE FIRST. Anybody can build one
// check by writing engine code for it. `boundrules.test.ts` writes a rule from
// a fixture and takes `git status` over the engine folder before and after.
//
// req-a-check-binds-without-engine-code · req-an-unbound-rule-is-reported

/** One rule as a node declares it. */
export interface BoundRule {
  /** The frontmatter key it governs. */
  key: string;
  /** The words that key admits. */
  allows: string[];
  /** How a walk gets past it — one of the three that work. */
  onBreak: WayForward;
  /** The node id this rule governs, where it is not the declaring node. */
  binds?: string;
}

/** WHAT A DECLARED RULE MUST CARRY TO ARM.
 *
 *  `on_break` IS REQUIRED AND THAT IS THE POINT. A check that does not say how
 *  a walk gets past it can refuse the very write that repairs the rule it
 *  enforces, and the walk stands with no legal move. That has already happened
 *  once, at i11's observe-red, and the fix was reasoned out from inside the
 *  block (raid-risk-a-bound-check-refuses-the-write-that-fixes-it).
 *
 *  req-a-check-names-its-way-forward */
export const WAYS_FORWARD = ["report", "signed", "carry"] as const;

export type WayForward = (typeof WAYS_FORWARD)[number];

/** WHAT EACH ONE MEANS, and each is a shape already proven in this engine
 *  rather than a name invented for the schema.
 *
 *  - `report` — the rule never blocks. The break rides the write's result and
 *    the author reads it. This is the shape `req-a-standing-break-reports-and
 *    -lands` demands of every corpus-wide subject.
 *  - `signed` — the rule blocks until evidence already stamped answers it.
 *    This is the shape observe-red ended up with at i11, after its own exit
 *    script blocked its own iteration on re-entry.
 *  - `carry` — the rule blocks until the item travels forward, counted, on the
 *    record. This is the shape the close ended up with after the same failure.
 *
 *  `refuse` IS NOT ON THE LIST, deliberately. Refusing is what `signed` and
 *  `carry` DO until their escape is taken; naming it separately would let a
 *  rule declare a block with no way out, which is the whole thing this
 *  prevents. */
function isWayForward(v: unknown): v is WayForward {
  return typeof v === "string" && (WAYS_FORWARD as readonly string[]).includes(v);
}

export interface RuleProblem {
  /** The rule as written, for the refusal to quote back. */
  said: string;
  /** Why it does not arm. */
  says: string;
}

/** Read a node's `rules:` list. Returns what armed and what did not.
 *
 *  A MALFORMED ENTRY IS A PROBLEM, NOT A SILENCE. A rule the engine skipped
 *  because it could not read it is a rule that passes forever without ever
 *  running, which is `req-an-unbound-rule-is-reported`'s whole subject one
 *  step earlier. */
export function rulesOf(frontmatter: Record<string, unknown>): {
  armed: BoundRule[];
  problems: RuleProblem[];
} {
  const armed: BoundRule[] = [];
  const problems: RuleProblem[] = [];
  const raw = frontmatter.rules;
  if (!Array.isArray(raw)) return { armed, problems };
  for (const r of raw) {
    if (typeof r !== "object" || r === null) {
      problems.push({ said: String(r), says: "a rule is a mapping with key, allows and on_break" });
      continue;
    }
    const e = r as { key?: unknown; allows?: unknown; on_break?: unknown; binds?: unknown };
    const said = JSON.stringify(r);
    if (typeof e.key !== "string" || e.key === "") {
      problems.push({ said, says: "no key — a rule that governs nothing cannot fire" });
      continue;
    }
    if (!Array.isArray(e.allows) || e.allows.length === 0) {
      problems.push({ said, says: `no allows — ${e.key} would admit everything` });
      continue;
    }
    // THE WAY FORWARD IS DECLARED OR THE RULE DOES NOT ARM. This is the check
    // that keeps a rule from trapping the walk it is meant to govern.
    if (!isWayForward(e.on_break)) {
      problems.push({
        said,
        says: `no way forward — on_break must be one of ${WAYS_FORWARD.join(" | ")}, so a walk this rule refuses always has a legal move`,
      });
      continue;
    }
    armed.push({
      key: e.key,
      allows: e.allows.map(String),
      onBreak: e.on_break as WayForward,
      ...(typeof e.binds === "string" && e.binds !== "" ? { binds: e.binds } : {}),
    });
  }
  return { armed, problems };
}

/** The first SELF-GOVERNING rule this node breaks, or undefined.
 *
 *  SELF-GOVERNING MEANS NO `binds`. A rule that names another node is checked
 *  by the sweep rather than at this write — the node it governs is not the one
 *  in hand, and reading the whole corpus per write is the cost
 *  raid-asm-a-bound-check-runs-inside-the-write-budget warns about. */
export function brokenHere(frontmatter: Record<string, unknown>): { rule: BoundRule; got: string } | undefined {
  for (const rule of rulesOf(frontmatter).armed) {
    if (rule.binds !== undefined) continue;
    const raw = frontmatter[rule.key];
    if (raw === undefined || raw === null) continue;
    const got = String(raw).trim();
    if (got === "") continue;
    if (rule.allows.includes(got)) continue;
    return { rule, got };
  }
  return undefined;
}
