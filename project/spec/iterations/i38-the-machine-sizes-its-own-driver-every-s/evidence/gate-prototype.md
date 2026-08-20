---
form: gate-prototype
bless: blessed by agent
by: agent
signed_off: 2026-08-20T18:14:04.671Z
authors: agent
files:
---

# Evidence form / gate-prototype

## current_situation

M6 is walked. Three spikes ran, all three returned a verdict, none ran out of its timebox, and the fold-back reopened nothing upstream.

### What the prototype milestone actually established

TWO SPIKES CONFIRMED WHAT THE REGISTER ALREADY SAID and one narrowed a risk. That is a quiet result and it is the honest one: a spike that confirms changes nothing, and fold-back was the first state in this iteration that did not have to reopen something.

THE ONE THING NOBODY EXPECTED is that two of the three met at the same missing party.

- `exp-can-anything-act-on-a-published-driver` — FALLS. `se-start.ts` spawns the agent once, before any walk exists, with the model not a parameter of the call. `se-pty.ts` spawns a command handed to it. Nothing in the walk re-invokes either, so no published value changes what is running.
- `exp-what-the-lane-can-learn-about-the-answering-model` — HOLDS. `engine/mcp.ts` carries `clientInfo: { name, version }` and no model, on both the transport metadata and the request context a handler receives.
- `exp-two-hands-rating-the-same-six-cells` — HOLDS. Two independent readers landed on the same rung for five of six cells, quoting the same sentences.

### The gate's own question, answered plainly

CORRECTED 2026-08-20, BY AN OWNER QUESTION, BEFORE THE BUILD STARTED. This
section said the gate blesses "a build of a machine that hands its answer to
nobody". THAT IS WRONG AND THE SPIKE IT RESTED ON IS RESTATED.

THE RECEIVER IS THE WALKING AGENT, DELEGATING. It reads "this step needs a
stronger hand" and hands that step to a subagent on a stronger model. Contract
rule 11 sanctions spawning subagents without asking, and
`project/guidance/method/subagents.md` carries a "Which model" section under an
owner grant of 2026-07-11.

THE SPIKE SEARCHED THE ENGINE AND THE ANSWER WAS IN THE CONTRACT THE WALKER
OBEYS. What it established, narrower and true: the published value cannot change
the WALKER'S OWN model, because nothing re-spawns it mid-walk. A running agent
cannot become a different one; it can delegate.

SO WHAT THIS BLESSES IS A BUILD OF A MACHINE WHOSE ANSWER HAS A READER, and the
open question is not whether one exists but whether it obeys. That is not a defect in the design. `req-the-machine-names-a-driver-and-starts-nothing` demands exactly it, and the seed assumed it from the start.

WHAT SHIPS, STATED CORRECTLY. The machine names the hand a step needs, publishes
it, and starts nothing. A walking agent that reads it may delegate the step to a
stronger model, and nothing forces it to.

THE ENFORCEMENT GAP IS THE REAL ONE AND IT ALREADY HAS A REQUIREMENT.
`req-a-weaker-driver-than-named-owes-a-recorded-reason` marks rather than
refuses, and its own Detail says why: refusing would need the lane to know what
actually answered, and `exp-what-the-lane-can-learn-about-the-answering-model`
establishes that it cannot.

SO THE DESIGN'S ONE SAFETY RULE IS A MARK A READER CAN COUNT, and that is the
honest shape of what this blesses.

### What the first spike could not do, and it was seeded to do it

IT WAS MEANT TO SETTLE THE OWNER'S RULING AS A SIDE EFFECT: if nothing can act on a model name either, the roster is a file maintained for nobody.

THE TIEBREAK HOLDS FOR THE WRONG REASON. Both halves fail at the same place because nothing can be acted on at all. That argues against the payoff rather than for either design, and the ruling stands exactly where it stood.

## buildable

yes — AND THE BUILD IS SMALLER THAN THE DESIGN WORK THAT PRODUCED IT.

WHAT M7 BUILDS. A complexity obtained per applying matrix cell; a resolution from that to a rung; a publication of the rung and the two-part difficulty on the pull; a record that carries the driver named, the driver that answered as the caller reports it and marked self-reported, and the state the walk stood in; and the refusal that makes a record carrying neither a named driver nor a stated reason invalid.

WHAT MAKES IT BUILDABLE, checked rather than asserted. `el-sizing` is the whole of its cluster and crosses its boundary at exactly two interfaces, both declared. `el-account` already takes `flow-dispatched-call` and emits `flow-call-log`, so the stamp is a field addition on a path that runs. `cellsOf` at engine/rigor-matrix.ts:417 already builds a cell per row per column and `compileColumn` at :609 already carries a cell's prose onto the compiled state.

THE ONE TEST THAT MUST EXIST BEFORE ANYTHING ELSE is named on its own requirement: `req-the-complexity-value-is-read-live-and-never-pinned` is graded fatal and wants one assertion that a complexity key moves neither the demand digest nor the step shape. It is the cheapest high-value item in the set and it guards three open pinned records.

WHAT IS NOT BUILDABLE AND IS NOT ASKED FOR. A receiver. Nothing in M7 builds a party that acts on a published driver, because no requirement demands one and `req-the-machine-names-a-driver-and-starts-nothing` forbids the lane being it.

AND ONE PROMOTION ARRIVES FROM A SPIKE. A placeholder row that seeds a sub-machine has no complexity of its own, and three such rows exist. Either the loader refuses a complexity there, or the rating attaches to the seeded states. THE SECOND IS BETTER AND COSTS MORE, and the build should rule rather than default.

## round_0_verify

- evidence vs claims: pass, and the claims are unusually few. Three experiment nodes, each with a verdict, a timebox, a stated `faked` and a pre-agreed `fallback`. TWO OF THE THREE ARE CODE TRACERS rather than live runs and both say so in their own `faked` field — the spawn paths and the transport were read at their source, not exercised against a running client.
- types: pass. Three experiment nodes minted, all resolve, all carry the fields their item definition checks. No code was written at M6.
- lint: pass. The spike drawing `machines/spikes.md` was authored from the seeded list, one state per ref, all parallel, the join waiting for every one.
- tests: none owed and none run. M6 produced no code.
- grades: GREEN, AND IT WAS RED. `grades-complete.ts` is an exit condition of `rank-unknowns` and it refused with eight register entries off their own scales — five saying `how_likely: certain` where the scale offers expected, plausible, conceivable, and three more off the damage scale. ALL EIGHT ARE FIXED. Four of the five `certain` entries were written in this iteration by the same hand in different states.
- the spikes' own honesty: EACH ONE SAYS WHAT IT DID NOT SETTLE. Spike 1 says its tiebreak holds for the wrong reason. Spike 2 says it does not touch the state coordinate. Spike 3 says it measured agreement rather than drift, because two readers in one session cannot measure drift.

## round_1_validate

- exercised against the goal: YES, AND ONE GOAL IS NOW KNOWN TO BE UNREACHABLE THIS ITERATION. The third kickoff goal wants each milestone to name the driver it needs before it is walked; the machine will do that and nothing will act on it.
- missing: A RECEIVER. Two spikes found the same absence from opposite directions — a party that spawns on a published value would both unlock the payoff and be able to report what it started. It is not a missing mechanism: `se-pty.ts` already spawns a command and holds a live channel back. It is a missing decision about who may cause a spawn.
- wrong: NOTHING FOUND WRONG AT M6, which is the first milestone in this iteration where that is true. Every earlier one had a finding that reopened a state.
- out of scope: building the receiver, and rating the 154 cells. M7 builds the mechanism; M7's own states rate nothing.
- prior art: not re-scanned and none owed. Two spikes read this repository's own engine; the third rated this repository's own rows. No external comparison arose.

## goals_served

- Every state in the rigor matrix carries a complexity rating on a five-rung ladder (C0 derive, C1 transcribe-or-rule, C2 apply, C3 author, C4 frame), each rated with evidence rather than asserted.: NOT RATED, AND NOW MEASURED AS RATEABLE. Two independent readers agreed on five of six cells and quoted the same sentences. THE ONE DISAGREEMENT IS A CLASS RATHER THAN NOISE — a placeholder row that seeds a sub-machine has no single difficulty, and three such rows exist. That is the spike's promotion and it goes into the build.
- ONE fixed model list lives in the repo, identical on every host, mapping each rung to a model name.: NOT SERVED, AND THE SPIKE MEANT TO SETTLE IT COULD NOT. Nothing can act on a model name or on a rung today, so the choice between them is not what blocks the payoff. The owner's ruling stands and the spec does not enforce it.
- Each milestone names the driver it needs before it is walked, computed live from the matrix and never pinned into a record's demands.: THE NAMING IS BUILDABLE AND THE ACTING IS NOT. `exp-can-anything-act-on-a-published-driver` falls: the agent is chosen once, by a person, before the first pull.
- Every call in the lane records which model actually answered it, so a walk can be attributed after the fact.: SERVED AND PERMANENTLY MARKED. `exp-what-the-lane-can-learn-about-the-answering-model` establishes that the transport carries a client name and no model, and that the `--agent` command string fails the requirement twice over — it is what was requested, not what served, and it is per session, not per call.
- A submachine takes the MAXIMUM complexity over its items, so one walker strong enough for the hardest item walks all of them and a fan-out never becomes a fleet.: NOT SERVED AND NOT DEMANDED. The architecture names per state, which the restated must permits with a unit of one and a spread of zero.

## bound_breaches

- if-agent-harness-to-entrypoint: BREACHED, RE-MEASURED, AND THE RATE HAS COME DOWN AS THE REPAIR STOPPED. Snapshot taken in one call: 4477 log records, 209 of them the interface's own slow reports, 9 mirror control writes and 1367 narration ops that ride other calls rather than being calls. THAT LEAVES 2892 LANE CALLS AND 209 BREACHES: 7.2 per cent, against 7.7 measured at gate-candidates and 5.9 at gate-requirements. THE MECHANISM IS UNCHANGED AND SO IS THE DIAGNOSIS: the worst calls are reopen cascades, this session has made 131 reopens, and M6 made almost none of them — the rate fell because the repair stopped, not because anything was fixed. THE BOUND STILL CARRIES NO PERCENTILE, so none of the three figures can be judged against it either way, which is now the fourth milestone to say so.

## round_2_red_team

- YOU BLESSED A BUILD OF A MACHINE THAT HANDS ITS ANSWER TO NOBODY => YES, AND THIS GATE SAYS IT RATHER THAN LETTING A READER FIND IT. `req-the-machine-names-a-driver-and-starts-nothing` demands exactly that boundary and the seed assumed it. WHAT THE SPIKE ADDED is that the other side of the boundary is empty: `se-start.ts` spawns the agent once before any walk exists and nothing re-invokes it, so a published driver reaches a reader and stops. THE HONEST FRAMING is that this iteration builds one half of a mechanism and the half it builds is the half it was asked for.
- THE SPIKE THAT WAS SUPPOSED TO SETTLE THE OWNER'S RULING SETTLED NOTHING => IT SETTLED SOMETHING WORSE AND MORE USEFUL. It was seeded to break the tie between publishing a rung and publishing a model name, on the reasoning that if nothing can act on a model name the roster is a file maintained for nobody. BOTH HALVES FAIL AT THE SAME PLACE. The tiebreak technically holds and the reason destroys its value: nothing can be acted on at all. THE RULING IS EXACTLY WHERE IT WAS and this gate does not pretend otherwise.
- TWO OF YOUR THREE SPIKES ARE CODE TRACERS, NOT RUNS => TRUE, BOTH SAY SO IN THEIR OWN `faked` FIELD, AND ONE OF THEM SHOULD HAVE BEEN A RUN. Spike 1 read two spawn paths at their source and concluded nothing re-spawns mid-walk. A live attempt — publish a value, try to make it change what is running — would have been stronger and was within the ninety-minute box. WHAT MAKES THE TRACER SUFFICIENT HERE is that the absence is structural rather than behavioural: `launch()` takes no model parameter and the entrypoint returns after `unref`. There is no run that could find a path those two facts rule out.
- THE THIRD SPIKE DID NOT PROBE WHAT IT WAS SEEDED FOR => IT DID NOT, AND IT SAYS SO ON ITS OWN NODE. It was seeded against drift — a number typed once and never revisited while the work under it changes. TWO READERS IN ONE SESSION MEASURE AGREEMENT, NOT DRIFT. What would test the risk is the same six cells rated again, by a hand that has not seen these ratings, after the work has moved — an iteration apart, not a session apart. THE RISK STAYS OPEN and the register says so.
- YOUR SAMPLE WAS SIX CELLS OF A HUNDRED AND FIFTY-FOUR => AND ALL SIX AT `major`. A wider sample could find agreement is worse at `patch`, where rows inherit and a rung is easiest to type without thinking. THE RESULT IS STILL WORTH WHAT IT COST: five of six identical on a five-rung ladder, with both readers quoting the same sentence for each agreement, is not a result chance produces.
- THE ONE DISAGREEMENT IS THE MOST USEFUL THING M6 PRODUCED => BOTH READERS NAMED THE SAME ROW AS THEIR LEAST-SURE, UNPROMPTED, FOR THE SAME REASON. `M7_40 build-steps` is a placeholder a seeded sub-machine fills, so the row has no single difficulty to declare and rating it forces a choice the row does not make. THAT IS A FIGURE THAT WILL BE WRONG FOR ONE OF TWO CAREFUL READERS however carefully it is typed, and the promotion is not "rate more carefully".
- NOTHING WAS FOUND WRONG AT M6 AND EVERY EARLIER MILESTONE HAD SOMETHING => THAT IS EITHER THE RECORD SETTLING OR THIS GATE LOOKING LESS HARD. THE HONEST TEST IS WHAT M6 PRODUCED TO BE WRONG ABOUT: three experiment nodes and a drawing. It authored no requirements, no candidates, no scores and no verdicts — the artifact classes every earlier finding lived in. A MILESTONE THAT ASSERTS LITTLE HAS LITTLE TO GET WRONG, and this gate claims no more than that.

## raid_additions

- raid-dep-the-payoff-waits-on-a-weak-model-being-able-to-boot-at-all
- raid-risk-a-hand-declared-rung-drifts-upward-and-nothing-ever-says-so

## verdict

pass with overrides — the design is buildable and the half of the mechanism that lives outside it does not exist.

WHAT THE SPIKES ESTABLISHED. Nothing can act on a published driver today, and nothing will after this build, because no requirement asks for a receiver and one requirement forbids the lane being it. The self-reported mark on the answering model is permanent on today's transport. A declared rung reproduces across two independent readers on rows that are one act.

WHAT THAT MAKES THIS. A build of a machine that names a driver correctly, publishes it honestly, and hands it to nobody. THAT IS WHAT WAS ASKED FOR and it is stated here rather than left for a reader to discover at M8.

THE OVERRIDES.

- The payoff waits on a party nobody has built, and building one is not this iteration's scope. Two spikes found the same absence from opposite directions.
- The drift risk the third spike was seeded against is untested. Agreement is not drift, and the node says so.
- Six cells of 154, all at `major`. A wider sample could find agreement is worse where rows inherit.
- The assumption under every candidate — that a stronger hand does better work on a harder step — was never tested. Probe 3 tried at M4 and could not.
- Two spikes are code tracers rather than live runs, and both declare it.
- The interface bound is breached at 7.2 per cent and still carries no percentile to be judged against, for the fourth milestone running.

## follow_up

M7 BUILDS THE MECHANISM AND ONE TEST COMES FIRST. `req-the-complexity-value-is-read-live-and-never-pinned` is graded fatal and wants one assertion: a complexity key moves neither the demand digest nor the step shape. It guards three open pinned records and it is the cheapest high-value item in the set.

ONE PROMOTION ARRIVES FROM A SPIKE AND THE BUILD SHOULD RULE ON IT RATHER THAN DEFAULT. A placeholder row that seeds a sub-machine has no complexity of its own — `M4_25 run-candidates`, `M6_15 run-spikes`, `M7_40 build-steps`. Either the loader refuses a complexity there, or the rating attaches to the seeded states. The second is better and costs more.

WHAT M7 MUST NOT QUIETLY BUILD is a receiver. No requirement asks for one and `req-the-machine-names-a-driver-and-starts-nothing` forbids the lane being it. If the build finds itself wanting one, that is a finding for a retro rather than a step to take.

AND THE QUESTION FOR WHOEVER PICKS THIS UP NEXT is one decision, not one mechanism: WHO MAY CAUSE A SPAWN ON A COMPUTED VALUE. `se-pty.ts` already spawns a command and holds a live read-write channel back. The lane may not, correctly. Nothing anywhere says who may, and that single sentence is what stands between this design and its payoff.

## anything_else

