---
minted_in: i33-every-interface-a-person-or-an-agent-tou
id: dsp-the-goal-binds-the-walk
type: "[[design-spec]]"
statement: the iteration's goals travel on the kickoff's own form and every gate below measures its output against each, carried by one item source and one standard round
realizes:
  - el-walk-engine
files:
  - project/deliverable/engine/machine.ts
  - project/deliverable/engine/stateform.ts
  - project/deliverable/engine/rigor-matrix.ts
  - project/deliverable/engine/machines/compile.ts
  - project/deliverable/engine/session.ts
---

## The concern

EVERY COVERAGE CHECK IN THIS SYSTEM COMPARES TWO NEIGHBOURS. Story to value
prop, use case to story, requirement to use case, function to requirement,
element to function, spec to element, chunk to spec. Each is checked both ways
and each is sound.

A CHAIN THAT IS PERFECTLY LINKED AND SERVES A QUARTER OF ITS KICKOFF PASSES ALL
OF THEM, because not one of them looks up. The chain is anchored at a VALUE
PROP, which is a standing product promise, and an iteration that authors no new
prop anchors its whole walk on a promise it merely inherited.

SO THE GOAL WAS PROSE AND EVERYTHING ELSE WAS A GRAPH. It lived in the record's
goal line and in the scope field, and nothing in the trace pointed at either.
Prose cannot be checked against.

## The design

THE GOALS ARE A LIST ON THE KICKOFF'S OWN FORM. They travel with the iteration
the way the change size already does, and they never enter the trace graph — a
goal is not an artifact anything refines, it is what every artifact is measured
against.

`$goals` in stateform.ts resolves them by reading the kickoff's evidence file
out of the evidence folder the field already receives. Only list lines count,
so framing prose beside the list cannot become a phantom row in every gate.

`goals_served` joins STANDARD_ROUNDS in machine.ts, so BOTH compilers get it
from one place. That split is not hypothetical: the rounds themselves once
lived in one compiler and reached half the gates.

`roundsFor` holds the one exemption. The kickoff DEFINES the goals, so asking
what it produced for each is circular.

## Why the ripple is in this spec

THE GOALS CHANGE IS AN UPSTREAM EDIT, and an upstream edit must grey what
stands on it. The existing ripple walked the graph and dropped a claim whose
FEEDER WAS NOT GREEN — it compared colour. A form resubmitted through the pull
unsigns and re-signs inside one call, so the feeder is green again before
anything downstream looks.

SO THE SECOND COMPARE IS TIME: a claim signed before its feeder's current
signature answered older ground. Three things follow, and all three are in
session.ts:

- the bless falls with the green, because a thumb adjudicates one body of work
- an amend counts as freshly as a signature, or the ripple would have no cheap
  exit and se_reopen would be the only way out of a typo upstream
- se_why names the newer feeder, instead of answering that a fallen claim
  stands

## A node-table cell is written back to the node

THE COLUMNS. For `table`, plain headings. For `node-table`, the
 FRONTMATTER KEYS on the listed nodes — each becomes an editable cell,
 read from the node and written back to it (owner ruling 2026-08-07).

 WHY THE NODE AND NOT THE FORM. A probe result belongs to the assumption,
 not to whichever iteration happened to run it. Written in both places it
 is two copies of one fact, and one of them goes stale. The register's
 own law already says this: the nodes are the truth, the table is a view.

## The goals check

THE GOALS CHECK (owner ruling 2026-08-17). Round 1 already says "the
RESULT against the goal" and it is not enough, because it asks about a
goal that is PROSE — so the answer can be true about the wrong subject.
i33 answered it "the scope answers both halves of the owner's framing",
which was true of the SCOPE and never checked the register.

EVERY OTHER COVERAGE CHECK IN THIS SYSTEM COMPARES A NODE TO ITS
NEIGHBOUR — story to value prop, requirement to use case, chunk to spec.
A chain that is perfectly linked and serves a quarter of the kickoff
passes all of them, because not one looks UP. This is the only field
that does, and it is per-item so it cannot be answered in general.

## A round that only ever passes is decoration

A ROUND THAT ONLY EVER PASSES IS DECORATION. Round 1's `missing` and
round 2's kill-criterion are the two places a gate can actually die, and
both are worthless when filled with findings nobody would act on. A
finding padded in to make the list look longer is worse than a short
list: it teaches the reader to skim (owner, 2026-08-06, striking
"fourteen stories is an arbitrary number" from a live gate).

## Scxml-style state contract

SCXML-style state contract (owner ruling 2026-07-26): authored on the
 NOTE, evaluated as the transition's cond. Each is a DICTIONARY:
 key = a condition TYPE (defined by its note in machines/conditions/),
 value = the type's arguments. All keys must hold. Absent = always.

## A branching point

A BRANCHING POINT is a state with more than one way out (owner design
 2026-08-07). The owner calls it a waypoint; this file already uses that
 word for a claim-less transparent state, so the new idea takes the plainer
 name and the two stay distinguishable.

 It matters because a fan hands out ONE leg. Whoever walks it reaches the
 end and the drawing offers nothing: the other legs are behind them, and
 the join above wants them all.

## The rung arrives as a word from every launch

THE RUNG ARRIVES AS A WORD FROM EVERY LAUNCH PATH (owner ruling
2026-08-18). se-arrive hands the lane `--autonomy tactical`, and until
this resolved it the boot died on `Number("tactical")` before the first
call — measured on the i17 cloud arrival, where the lane never answered.
The numeric form stays because the mirror's control and the tests still
send one, and because the scale is still compared as numbers.

## Leaving a kickoff pins the blessed change size

THE BLESS PINS (owner verdicts 2026-07-30): leaving an iteration
 kickoff compiles the record's blessed change_size from the LIVE rigor matrix
 and pins the machine into the record. No change size, no pass — the
 demand is mechanical. An existing same-size pin walks on untouched;
 a larger size escalates; pinIteration refuses de-escalation itself.

## Nothing is written onto the claims

NOTHING IS WRITTEN ONTO THE CLAIMS. The reopen used to strip their
signatures and stamp a reason in their place; it does not any more
(owner ruling 2026-08-06, built 2026-08-07). The reason belongs in the
log, which already has it — this call is logged like every other.

## Name the claim that actually fell

NAME THE CLAIM THAT ACTUALLY FELL (i3, 2026-08-13).

recordDone runs a RIPPLE, and says so twenty lines above: green stops
at the first input that is not green, because a claim may be word for
word fine and still rest on ground that moved.

This refusal reported only that the claim does not stand. So a state
whose own form is perfect and whose INPUT fell reads as a broken form,
and the reader goes to inspect a form with nothing wrong with it.

It cost this iteration a long detour. specify-build was submitted,
signed, re-submitted, rewritten field by field and reformatted into a
table — all of it against a form that was never the problem.

The engine knew which input had fallen the whole time.

ONE MECHANISM, TWO QUESTIONS (owner instruction 2026-08-14). The
ripple and the content check used to live here alone, so se_why —
the verb built to explain a grey state — ran neither and answered
`standing: true` for a state this guard was dropping. Both now read
claimBlockers, so the two answers cannot differ.

## The doors own weight

THE DOOR'S OWN WEIGHT, NOT THE ROOM'S (i11's audit of the 2026-08-12
 seed, which calls this "THE MAP LIES").

 Entering a container lands on its START state, which is mechanical — so a
 route into `expeditions` weighed 0.01 while the door weighs 0.4. At a dial
 of 0.2 the line drew OPEN the whole way and the walk then stopped, and
 `stops_at` came back undefined: nothing told the reader the way was shut.
 The gate refused correctly. Only the map was wrong, which is worse than a
 refusal because it is silent.

 ONLY THE INITIAL STATE PAYS IT. Once inside, the door has been paid, and
 charging every state within would shut a container from the inside.

## The route collects every judgment up front and moves nothing

THE BLUE LINE. Where the walk stands, where it is headed, and every
 hop between — with what each will ask for. It MOVES NOTHING.

 EVERY JUDGMENT IS COLLECTED UP FRONT (owner ruling 2026-07-29). Not
 just the first blocker: the whole list, so a person can answer all of
 them in one sitting and then leave the walk to run alone. Stopping at
 each one in turn is how a five-minute errand becomes an afternoon of
 being asked one question at a time.

## Entering a generated containers record states binds that records

Entering a GENERATED container's record states binds that record's
 worktree — the click IS the pick (owner design 2026-07-27). The walk
 may already stand INSIDE the record's own machine when this runs (an
 iteration node descends at once), so every frame is checked and the
 deepest frame naming a record wins. The parent-return and escape
 paths unbind as ever.

## The verdict is keyed to its inputs

THE VERDICT IS KEYED TO ITS INPUTS — v1's adr-verdict-cache, reapplied
(owner ruling 2026-08-09). Stamping the corpus took entering an
iteration from 274 s to 66 s; the rest is THIS check, re-run for every
claimful state, for every machine, at every hop of the walk.

A CHECK WHOSE INPUTS HAVE NOT MOVED HAS NOT CHANGED ITS MIND. The inputs
are the corpus, the claim's own body, and the form the state declares.
All three are in the key, so an edit to any of them recomputes and
nothing else does.

## From the desk nothing is bound

FROM THE DESK NOTHING IS BOUND, and the bound fallback alone left a
drawn sub-machine's whole interior grey when browsed from trunk
(owner report 2026-08-09: i1 read "not done" though its claims stood).
The host chain answers instead: whichever machine carries this drawing
as a state, climbed until one of them IS an open iteration.

## The scenario walks at-risk and unaddressed verdicts become register

The scenario walk's at-risk and unaddressed verdicts become register
 entries at the moment they are saved (owner rulings 2026-08-10): a risk
 naming its hinge, an issue the gate must see. One node per scenario; a
 re-save reuses the standing node. breaks_how_badly INHERITS the
 requirement's own grade — the risk grades the same failure. how_likely
 stays a minted comment, answered at the register review.

## A credible ruling mints its tripwire on save

A CREDIBLE RULING MINTS ITS TRIPWIRE ON SAVE (owner ruling 2026-08-10).
The sensitivity card's buttons emit ruling lines; each new one becomes
a RAID node here and the line is rewritten with the minted ref, so the
card renders the tripwire link on the next look. Idempotent: a line
already carrying its ref is left alone.

## The claims own blockers

THE CLAIM'S OWN BLOCKERS, from the same mechanism the walk's guard
throws with. Before this the verb ran neither the ripple nor the
content check, so it answered `standing: true` for a state the guard
was dropping (owner instruction 2026-08-14).

## One doc one channel one verdict

One doc, one channel, one verdict.

 EACH HAND PROVES THE COPY IT WAS SHOWN (owner ruling 2026-07-28).
 The agent reads through the LANE, which serves the bound worktree, so
 its supplied hash must match that copy exactly — a stale token proves a
 stale read, and a hash from a tree it was never shown proves nothing.

 The human checks in the MIRROR, which serves the project root. Their
 checkbox counts against either copy. On Windows the two differ by line
 endings alone after a checkout (core.autocrlf), so demanding the lane's
 hash from a checkbox would void every check the moment an expedition
 binds — a false invalidation that teaches people to ignore the gate.

## The kickoff pins

THE KICKOFF PINS, AND THE MACHINE GROWS IN PLACE (owner ruling
2026-08-04): leaving a blessed kickoff compiles the column and swaps
the M0 seed machine for the pinned walk BEFORE the step is weighed —
same machine id, same state ids, so evidence and history carry.

## The iterations own goals

THE ITERATION'S OWN GOALS, read off the kickoff's blessed form.

 THEY TRAVEL WITH THE RECORD, NOT THE TRACE GRAPH (owner ruling
 2026-08-17). A goal is not an artifact anything refines — it is what every
 artifact is measured AGAINST. Same vehicle as the change size, which has
 ridden this exact form since the pin was built.

 EMPTY IS LEGAL and means the kickoff has not blessed any yet. The kickoff
 is the one gate that runs before goals exist, so a per-item field over
 nothing renders as nothing rather than refusing.

 ONLY LIST LINES COUNT. The section carries the framing prose beside the
 list, and a paragraph that became a phantom goal would put an unanswerable
 row in every gate below.

## The specify-build law

THE SPECIFY-BUILD LAW (owner ruling 2026-08-11): the design below the
 line is defined spec-first as design-spec nodes, the same shape as
 author-tests — and every promoted spike is assigned to a step.

 Files are NAMED, not existing: a spec is written before its code
 lands. Existence and the dead-code sweep get teeth at trace-design.

## The trace-design law

THE TRACE-DESIGN LAW (owner ruling 2026-08-11): the mechanical half
 of the design trace, after the build. Coverage again, existence now,
 and the dead-code sweep — file grain: every engine file claimed by a
 spec, and the unclaimed list is the finding.

## A demonstration spec may verify nothing

A DEMONSTRATION SPEC MAY VERIFY NOTHING (owner ruling 2026-08-11):
its upward edge is `demonstrates:` naming the must story it shows end
to end, and the mechanics stay with the sibling test-method specs. A
none-convention line under verifies is honesty, not an id.

## The riskiest assumptions are validated

The riskiest assumptions are validated — gate-prototype's law (owner
 ruling 2026-08-10). An assumption in the worst two damage grades must
 carry a probe result, a conscious acceptance, or a deferral WITH its
 until — a deferral without one is a silent pass wearing a status.


## The law is swept, not only triggered

THE DESIGN-COVERAGE LAW IS CORPUS-WIDE IN SCOPE AND WAS STATE-LOCAL IN TRIGGER,
and that pair is what let interfaces ship with no design spec.

WHAT IT READS. Every element and every interface in the trace, against every
design spec's `realizes:`. Nothing about that is scoped to one iteration.

WHAT USED TO FIRE IT. One line in `stateform-problems.ts`:

    if (s.id.endsWith("specify-build")) out.push(...specifyBuildLawProblems(...))

and the same coverage half again at trace-design. Nowhere else.

## What that combination costs

THE LAW LANDED AS A RULING AND NOTHING SWEPT WHAT CAME BEFORE IT. Every element
and interface already in the corpus on that day became debt that nobody was
billed for.

THE BILL ARRIVES ON A STRANGER. It lands on whichever iteration next stands on
a specify-build state, as a wall of ids that iteration did not mint. Measured on
i37: fourteen crossings named at once, and NINE OF THEM WERE MINTED IN i9 —
an iteration that shipped before the law existed.

THE BATTERY DID NOT CATCH IT, AND THIS IS THE PART WORTH REMEMBERING. Eleven
test cases exercise this law. Every one of them mints a fresh synthetic root.
So the battery proved the law WORKED and never once asked whether the real
corpus PASSED it.

A LAW TESTED ONLY AGAINST FIXTURES IS A LAW ABOUT FIXTURES. The logic was
green the whole time the corpus was in breach.

## The sweep

`tests/design-coverage-sweep.test.ts` runs `designCoverageProblems` over the
REAL trace, at `project/spec/trace`, and demands an empty list.

WHAT CHANGES. An uncovered crossing now fails the battery on the day it is
minted, in the iteration that minted it, where the person who drew it still
knows which design carries it. It no longer waits for a walk to stand on one
particular state.

WHY A TEST AND NOT ANOTHER STATE CHECK. Adding a second state would move the
trigger without removing the shape — corpus-wide debt surfacing on whoever
happens to walk there. The battery runs on every change, which is the only
cadence that matches a law about the whole corpus.

THIS IS THE SECOND TIME ONE SHAPE HAS BILLED i37. The register's exit condition
made this iteration grade seventeen entries it did not write, recorded as
note-83835912bf27. Same mechanism: a corpus-wide condition with a state-local
trigger and no sweep.
