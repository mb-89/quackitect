---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: exp-do-the-lists-that-demand-a-reason-collect-considered-ones
type: "[[experiment]]"
statement: Does a mechanism that refuses an entry without a reason collect considered reasons, measured as the share of a real population that reads as one repeated template?
probes:
  - raid-asm-a-demanded-reason-is-a-considered-reason
timebox: one sweep of every reason-bearing list in the tree
form: script
chunk: none — all 113 recorded reasons were counted, and the 17 the classifier flagged were read by hand
faked: none on the population. The CLASSIFIER is a proxy for a judgment, and it was checked rather than trusted — 8 of its 17 flags are false positives, each named below.
fallback: pre-agreed at seeding. If the reasons read as boilerplate, the departure list stops being the product and the design falls back to a plain allow-list with no reason column.
verdict: holds
measured: 2026-08-26. 113 reasons collected by a verb that refuses an empty one. 9 are a repeated template, or 8.0 percent, and all 9 sit in one record. 104 are specific enough for a reader to act on.
folds_to: The assumption moves from open to probed and holds at 8 percent templated. Its earlier not-probeable reading is corrected on the node. el-door-rule gains a constraint - do not ask for a reason where the answer is mechanical, because the one cluster of boilerplate this tree holds came from a ripple.
promote: none - the finding is the product
source_refs:
  - rank-unknowns, the seeded pick
  - deliverable/engine/sessionclaims.ts:995 — the refusal that collects them
---

## Setup

### First, find the mechanisms that actually refuse

The earlier reading said no list in this tree refuses a reasonless entry. That reading was wrong, and a search over `deliverable/engine/**/*.ts` for places a missing reason changes behaviour found four classes.

- REFUSES. `deliverable/engine/session.ts:1394` on the escape hatch. `deliverable/engine/sessionclaims.ts:903` and `:995` on the claim verbs. The last one says it plainly: an amend that says nothing is an untracked edit.
- REFUSES, on a different subject. `deliverable/engine/iterations-draw.ts:109` refuses an empty step list with no reason given.
- MARKS, never refuses. `deliverable/engine/calllog.ts:192` stamps `unreasoned: true` when a walk went weaker and gave no reason.
- REPORTS as a form problem. `deliverable/engine/stateform-problems.ts:866` lists rank-cut rows moved with no reason.
- IGNORES. The widget exemption list, whose own file says a bullet with no reason is ignored on purpose.

So the premise the assumption describes DOES exist here, three times over.

### Then read what one of them has collected

The amend verb has the largest recorded population. Every amend writes its reason onto the evidence file, so the reasons are readable at rest.

`scratchpad/reasons.mjs` pulled every `amended:` line under `spec/**/evidence/`. The population is 113, across 15 records.

The classifier was written BEFORE the count and its rule was stated first: a reason is templated if it says an upstream state re-signed and this form's own contents are unchanged.

## Result

HOLDS. 104 OF 113 REASONS ARE CONSIDERED.

### The count, after hand-checking

The classifier flagged 17. Eight of those are false positives, and each was read to confirm it.

- Two match on "so the claim stands", and both explain that a join's form was written by hand because the walk never serves it. That is specific.
- Three match on "is unchanged" or "never changed", and each names exactly which nodes moved and why this form is untouched by the move.
- Two match on "re-stamping", and both describe a real ripple where one form's hash kept moving under another.
- One matches on "stand open", and it is a verdict correction saying a pass was really an override.

That leaves 9 genuinely templated reasons, or 8.0 percent.

### The nine are not spread thin — they are one cluster

All nine sit in `i33-every-interface-a-person-or-an-agent-tou`, and they are 9 of that record's 20.

They share one sentence shape: an upstream state re-signed, and the N things this form carries still stand.

Every other record scores zero, including the three largest populations — 17 reasons, 11 reasons and 10 reasons, none templated.

### Mean length, as a second and independent measure

The templated pile averages 95 characters. The considered pile averages 139.

### What the cluster actually says, and it is not laziness

The nine appeared where one author re-stamped a chain of forms after an upstream re-sign. The honest reason in each case genuinely IS "nothing here moved".

THE MECHANISM ASKED A QUESTION WHOSE ANSWER WAS THE SAME NINE TIMES. A repeated answer to a repeated question is not a thin reason; it is a mechanism that should have asked once.

That reading matters more to the design than the percentage does.
