---
minted_in: i51-work-running-out-of-sight-reports-itself
id: tsp-a-leaving-check-hands-the-call-back
type: "[[test-spec]]"
statement: A step's leaving judgment starts without holding the call, and where the step stands can be read while that judgment is still being reached.
method: test
verifies:
  - req-a-leaving-check-does-not-hold-the-call
  - req-a-pending-verdict-is-recorded-against-its-state
files:
  - tests/handback.test.ts
---

## Scope

The two halves of the handback, and nothing else.

- STARTING a leaving judgment without waiting for its verdict.
- READING where a step stands while the judgment runs.

WHAT IS DELIBERATELY OUT. Whether the judgment survives its call is
[[exp-does-a-left-check-survive-its-call]], already measured. Whether a fresh
session can settle a standing is [[raid-ar-walk-resumes-from-repo]], and it is
M7's build decision rather than a check.

THE ACCOUNT IS ITS OWN SPEC. Listing work out of sight belongs to
[[tsp-the-account-of-work-out-of-sight]]; this one is about one step's judgment.

## Approach

COMPONENT LEVEL, both cases. Each defect is catchable at the unit that owns it,
so neither is hunted higher.

RISK DECIDES THE DEPTH AND THE RISK IS HIGH. Both requirements are `must` and
graded crippling, and the second carries a fatal at-risk entry against
`req-walk-resumes-from-repo`. Two cases is thin for that exposure, and it is thin
on purpose: the surface being tested does not exist yet, so the cases state the
demand rather than explore it. Depth is added at observe-red once the shape is
real.

THE DESIGN METHOD IS STATE-BASED for the second case.
[[req-a-pending-verdict-is-recorded-against-its-state]] carries a ten-transition
state model, and a step's standing is one word from a closed set of three
([[raid-dec-a-step-s-standing-is-one-word-from-a-closed-set-of-three]]).
Full all-states coverage is owed once the standing exists; today only the
existence of a reader is checked.

## Steps

Every case in `tests/handback.test.ts` is one step and its name states its claim.

- THE SERVING PATH DOES NOT AWAIT A STEP'S LEAVING JUDGMENT. Reads
  `deliverable/engine/session.ts` and fails while `await this.scripts.scriptRun(`
  stands on the tick path. That await is the whole defect this record exists to
  end.
- A STEP'S STANDING CAN BE READ WHILE ITS JUDGMENT IS STILL BEING REACHED. Asks
  the `Scripts` surface what it offers and fails while nothing there answers
  where a step stands.

WHY ONE READS SOURCE AND THE OTHER READS THE CLASS. The first claim is about a
call SHAPE that no runtime value exposes — an await either stands in the serving
path or it does not. The second is about a surface, and a surface can be asked
what it offers.

BOTH ARE RED AT AUTHORING and neither is red by accident. The judgment's verdict
lives in an in-memory Map that deletes its own entry on settle, measured
2026-08-21 in [[exp-what-a-fresh-session-sees]].

WHAT THE FILES CANNOT CARRY YET. A timing case — that the call returns inside a
second while a long judgment runs — waits for the mechanism to exist. It is owed
at observe-red and it is what `req-a-leaving-check-does-not-hold-the-call`
actually measures.
