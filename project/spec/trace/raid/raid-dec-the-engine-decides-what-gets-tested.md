---
minted_in: i11-the-engine-fix-bundle-about-twenty-named
id: raid-dec-the-engine-decides-what-gets-tested
type: "[[raid]]"
kind: decision
statement: The agent says test and nothing more — the engine picks the scope from what changed, fires the battery at the implementation gates, and a record's verification serves only what its own delta touched.
owner: the owner
trigger: any agent-chosen test scope, or a verification serving a spec the record never touched
status: decided
impact: an agent choosing scope tests to reassure rather than to answer, and a verification that serves the whole product every record makes nine claims owed at a time until the owed list means nothing.
breaks_how_badly: crippling
how_likely: certain
weighs_with: none
weighs_against: none
source_refs:
  - "owner ruling 2026-08-16: the engine knows what files were touched and the engine decides what gets retested, not the agent"
  - "owner ruling 2026-08-16: do not reiterate stuff from old iterations all the time, only the delta is important"
  - raid-iss-whole-product-claims-reverified-by-every-record
  - req-the-full-battery-runs-where-the-method-says
---

## The agent says test. That is the whole verb.

THE OWNER'S WORDS: "the engine knows what files were touched, and the engine
decides what gets retested, not the agent. The agent can just call the test
verb. All the agent can do is say test, and whatever the engine makes out of
it is what the engine decides."

WHAT THAT REMOVES. `files` and `name_pattern` stop being the caller's to choose.
The engine knows what the lane wrote since the last green, because the lane did
the writing — the same knowledge `testGate` already uses to compute a scoped
remedy from the diff.

WHY IT IS RIGHT AND NOT MERELY TIDIER. A scope the agent picks is a scope the
agent can pick to reassure itself. A scope computed from the diff answers one
question — did THIS change break THAT — and cannot be widened to feel safer or
narrowed to go faster.

THE QUESTION STAYS THE CALLER'S. SE-C-136 already demands one, and it is the
half the engine cannot supply: the scope says which tests ran, only the caller
says why.

## The battery is the engine's, at the gates that did implementation work

RULED AND HALF-BUILT. i11 gave verification an `exit_script` that fires the
battery, so `filled_by: engine` finally does something. What is not built is
the owner's wider form: the battery runs at the implementation GATES, plural,
rather than only at verification.

THE AGENT NEVER FIRES IT. That half stands and is enforced.

## A record verifies its own delta

THE OWNER'S WORDS: "do not reiterate stuff from old iterations all the time.
Only the delta is important."

THIS SETTLES raid-iss-whole-product-claims-reverified-by-every-record, which
named the question and left it open: a record's verification serves the specs
its DELTA touches, and the product's standing claims are re-observed on their
own cadence rather than per record.

WHAT IT FIXES, measured on i11: twelve claims served, three touched by the
delta, nine owed against open entries. That entry warns in its own words that
nine at a time stops being a debt and becomes the normal case.

WHAT IS STILL OPEN: what computes "the delta touched this spec". The blast
radius (i18) is the machinery that would answer it, and until then the honest
version is the one i11 did by hand — name which specs the change endangered,
and say how.

## The walk ends at the front desk

THE OWNER'S WORDS: "it should end at the front desk, really."

TODAY `shipped` WALKS ON INTO THE NEXT ITERATION. i11's release bless swept
straight through `shipped` into i23's start and stamped it started — an
iteration opened without the person's word, which contract rule 9 forbids.

THE DESK IS WHERE A PERSON SAYS WHAT THEY WANT NEXT, and that is exactly the
decision that follows a ship.

## Built at i6, after the two refusals closed on each other

THE DECISION STOOD SINCE i11 AND THE MECHANISM DID NOT. Until 2026-08-16
the agent still chose the scope and the engine graded the choice, through
two refusals guarding it from opposite sides.

- SE-C-131's battery gate refused the battery while every change mapped
  to a scoped run, and handed over the scoped call.
- SE-C-131's flip refused scoped runs once the piecemeal odometer crossed
  a third of the suite, and handed over the battery.
- SE-C-112 refused an agent-initiated battery anywhere but verification.

THEY CLOSED AT i6's SIXTH BUILD CHUNK. The odometer stood at 42 and the
walk was four milestones from verification. The scoped run refused toward
the battery; the battery refused toward a scoped run. Each remedy was the
other refusal, and narrowing to one file changed nothing because the flip
counts the odometer rather than the call.

THE CAUSE WAS NOT THE THRESHOLD. Two graders with different subjects
eventually disagree, and an agent standing between them has no move.
Tuning the flip would have moved the collision, not removed it.

## Rejected options

### Raise the flip threshold

TREATS THE SYMPTOM. A higher flip means the collision happens later in a
longer iteration. Any threshold has a value at which both rules refuse.

### Let the battery run anywhere

RE-OPENS WHAT SE-C-112 EXISTS FOR. Five agent-judged batteries ran on
2026-08-16, none sanctioned by any row, and the battery is expensive
enough that habit is costly.

### Teach the agent to read both rules

REJECTED ON THIS ITERATION'S OWN THESIS. A rule that must be read and
reasoned about, in the moment, under a refusal, is exactly what does not
hold. And `force` is a flake hunt, not a way past a rule.

### Make the flip advisory

KEEPS THE AGENT CHOOSING, which is the thing the owner ruled out.

## Consequences

- `se_test` TAKES A `question` AND NOTHING ELSE. `files` and
  `name_pattern` are gone from the schema. No argument widens or narrows
  the scope.
- THE VERDICT CARRIES `decided` — the scope, the files and one line of
  reasoning. The agent can always say what ran and why.
- NOTHING IS AN ANSWER. An unchanged tree keeps its last verdict and the
  result says so, which is what SE-C-130 meant and could not do without
  stopping the walk.
- `force: true` IS THE ONE THING A PERSON PASSES, and it means the whole
  suite, because a flake is not known to live in one file.
- TWO CLAUSE NUMBERS ARE RETIRED, SE-C-130 and SE-C-131, and neither is
  reused.

WHAT IT COSTS. The agent can no longer narrow a run to chase one case.
That was the point: chasing one case is how a suite gets run sixty times
in two hours.

## Where it lives

- `engine/discipline.ts` — `decideScope(seDir, root, force)` returns
  `{scope, files, why}`. It replaced `batteryGate` and `scopedGate`.
- `engine/tools.ts` — `se_test` calls it and dispatches on the answer.
- `tests/discipline.test.ts` — seven cases drive the decision where two
  used to drive the refusals.
