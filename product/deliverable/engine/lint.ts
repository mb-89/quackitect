// MECHANICAL DECISION (i12, element E6): the machine judges what can be judged,
// so a self-blessed gate rests on computation rather than on the agent's
// attention. This is the half of i12 that matters more than the tools.
//
// THE CONTRACT (se.adr-a-lint-decides-or-defers): a lint yields PASS, FAIL or
// DEFER — and nothing else. Two failures are designed out at once:
//   - a lint that PARKED would stop an unattended run at 3am for a human who is
//     deliberately absent, inverting the delegation the project exists for
//     (se.law-responsibility-never-delegates);
//   - a lint that judged INTENT would refuse correct work, making the rational
//     response to route around it — "the checks are too dumb to satisfy" is the
//     same failure as "the tools are too weak to use", carrying more authority.
// So a lint decides only on FACTS derivable from the record, and a check that
// needs interpretation DEFERS to the agent's prose, exactly as today.
//
// WHY THE SET IS SMALL, stated here rather than apologised for later: the
// checks worth mechanizing most — does the build conform to the architecture's
// allocation, does every requirement carry a verify_method — compare against
// facts that do not exist in machine-readable form. Measured at i12 M5: zero
// element nodes, allocations living only as evidence prose. Those lints DEFER
// with that reason until items become nodes
// (se.raid-items-are-prose-so-the-best-checks-cannot-be-mechanical).
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { layout } from "./layout.ts";

export interface LintVerdict {
  check: string;
  verdict: "pass" | "fail" | "defer";
  /** The FACT that held or did not — never an opinion (R19). */
  fact: string;
}

/** What a lint may look at. Facts only; no prose is interpreted. */
export interface LintContext {
  state: string;
  evidence: Record<string, string>;
  /** Field names the state's evidence form declares required. */
  required: string[];
  /** Iteration id, when the check needs the record. */
  iteration?: string;
}

type LintFn = (root: string, ctx: LintContext) => LintVerdict;

const deferred = (check: string, why: string): LintVerdict => ({ check, verdict: "defer", fact: why });

/**
 * THE REGISTRY. Adding a check here is how a gate gains a mechanical verdict;
 * a state declares check ids and gets them computed. An id that is not
 * registered DEFERS rather than throwing — an unknown check must never be able
 * to stop a run.
 */
const LINTS: Record<string, LintFn> = {
  // Every declared-required field is non-empty. The engine already refuses a
  // missing key; this catches the emptier failure of a key present and blank.
  evidence_fields_present: (_root, ctx) => {
    const missing = ctx.required.filter((f) => (ctx.evidence[f] ?? "").trim() === "");
    return missing.length === 0
      ? { check: "evidence_fields_present", verdict: "pass", fact: `all ${ctx.required.length} required fields carry content` }
      : { check: "evidence_fields_present", verdict: "fail", fact: `empty required field(s): ${missing.join(", ")}` };
  },

  // The suite ran and failed BEFORE the build — read from the run record the
  // engine already writes, rather than from the agent's account of it.
  tests_observed_red: (root, ctx) => {
    const dir = join(layout.seDir(root), "runs");
    if (!existsSync(dir)) return deferred("tests_observed_red", "no run records on this machine to read");
    const refs = Object.values(ctx.evidence).join(" ").match(/run-[0-9a-f]{12}/g) ?? [];
    if (refs.length === 0) return { check: "tests_observed_red", verdict: "fail", fact: "the evidence pins no run ref, so no red observation can be checked" };
    for (const ref of refs) {
      const p = join(dir, `${ref}.json`);
      if (!existsSync(p)) continue;
      try {
        const rec = JSON.parse(readFileSync(p, "utf8")) as { ok?: boolean; detail?: { exit?: number } };
        if (rec.ok === false || (rec.detail?.exit ?? 0) !== 0) {
          return { check: "tests_observed_red", verdict: "pass", fact: `${ref} exited non-zero — a real red observation` };
        }
      } catch {
        continue;
      }
    }
    return { check: "tests_observed_red", verdict: "fail", fact: `none of the pinned runs (${refs.join(", ")}) exited non-zero` };
  },

  // The evidence pins at least one run ref, so a claim about execution can be
  // traced to a record rather than taken on the agent's word.
  runs_pinned: (_root, ctx) => {
    const refs = Object.values(ctx.evidence).join(" ").match(/run-[0-9a-f]{12}/g) ?? [];
    return refs.length > 0
      ? { check: "runs_pinned", verdict: "pass", fact: `${refs.length} run ref(s) pinned: ${[...new Set(refs)].slice(0, 4).join(", ")}` }
      : { check: "runs_pinned", verdict: "fail", fact: "no run ref appears in the evidence" };
  },

  // A state whose guidance demands a state-of-the-art scan must COLLECT one.
  // This is i12's own retro finding made mechanical (R21).
  scan_collected: (_root, ctx) => {
    const text = Object.values(ctx.evidence).join(" ").toLowerCase();
    const scanned = /state of the art|state-of-the-art|prior art|prior-art/.test(text);
    return scanned
      ? { check: "scan_collected", verdict: "pass", fact: "the evidence records a prior-art or state-of-the-art scan" }
      : { check: "scan_collected", verdict: "fail", fact: "this state's guidance requires a scan and the evidence records none" };
  },

  // BLOCKED, and honest about why. It defers rather than passing vacuously,
  // because a check that always passes is worse than no check.
  models_adhered: () =>
    deferred(
      "models_adhered",
      "the element allocation is evidence PROSE, not machine-readable nodes — measured at i12 M5 (zero element nodes). Blocked on items-as-nodes; the agent's prose still answers this",
    ),
  requirements_have_verify_method: () =>
    deferred(
      "requirements_have_verify_method",
      "the requirement register is prose in one evidence field, not nodes — same prerequisite as models_adhered",
    ),
};

/**
 * Run the declared checks. NEVER throws, never blocks: an unknown check, an
 * unreadable record or a thrown lint all become a DEFER, because the run
 * continuing matters more than any single check.
 */
export function runLints(root: string, checks: string[], ctx: LintContext): LintVerdict[] {
  return checks.map((check) => {
    const fn = LINTS[check];
    if (fn === undefined) return deferred(check, "no lint is registered for this check");
    try {
      return fn(root, ctx);
    } catch (e) {
      return deferred(check, `the lint could not compute: ${String((e as Error).message).slice(0, 160)}`);
    }
  });
}

/** The ids a caller may declare — so a typo in a state node is discoverable. */
export function registeredChecks(): string[] {
  return Object.keys(LINTS);
}

/**
 * R20: computed and asserted must be distinguishable WITHOUT reading prose.
 * Verdicts ride in their own block, never mixed into the evidence fields.
 */
export function verdictBlock(verdicts: LintVerdict[]): Record<string, unknown> {
  return {
    computed: verdicts.map((v) => ({ check: v.check, verdict: v.verdict, fact: v.fact })),
    summary: {
      pass: verdicts.filter((v) => v.verdict === "pass").length,
      fail: verdicts.filter((v) => v.verdict === "fail").length,
      defer: verdicts.filter((v) => v.verdict === "defer").length,
    },
  };
}
