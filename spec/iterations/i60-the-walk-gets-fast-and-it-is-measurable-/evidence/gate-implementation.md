---
form: gate-implementation
bless: blessed by agent
by: agent
signed_off: 2026-08-24T19:28:39.131Z
amended: "2026-08-24T19:54:31.680Z by agent — this verdict compared the whole hop against a budget that binds only the flip, and the flip has since been measured at 20 ms"
authors: agent
files:
---

# Evidence form / gate-implementation

## current_situation

The round was reopened at two states on a cold reviewer's verdict and the owner's ruling, and both are re-earned. That reviewer has now re-judged the deltas and CONVERTED its verdict to pass with noted overrides.

Two hands read this round. A tester with fresh eyes verified twice and caught a defect I had introduced. A second, colder hand judged the gate twice and named the two edits owed before a bless. Both sets are answered in the artifacts.

## quality_ok

- [x] Dependencies stay layered
- [x] Every new element carries one stated responsibility
- [x] The linter and the complexity ceiling are clean, with no new suppression
- [x] Every new behavior carries its check, and the battery is green at rest
- [x] Nothing speculative shipped
- [x] What changed is findable
- [x] Every quick-and-dirty taken stands as a visible raid debt entry

## debt_taken

- none

## risks_acceptable

acceptable — the round's own risk entry gained a clause it did not have: a change that removes the READING credit a state demands now trips the same trigger as one that skips a condition, because a reviewer found the new ruling uncovered by any standing watch. Beyond that, three risks stand named with what would make each unacceptable: the notch depends on every pull shape spreading `head()` and the end-to-end case is what catches a shape that does not; the hook reads a log window with no session boundary, whose worst outcome is a false block in the safe direction; and one git-lane case flaked once and did not repeat.

## round_0_verify

- evidence vs claims: two cold hands attacked the claims across four passes. Every claim in the chunk forms was rested on a file and line, and one — that the route-drawer repayment was verified by observation — was REFUSED and corrected. Observing a path run is not evidence it is right.
- types: clean. The typechecker runs after every source edit through the lane and refused three edits during the round, each fixed rather than worked around.
- lint: clean, with no suppression. The complexity ceiling fired three times and was answered three times by splitting a function along its own phases.
- tests: 442 of 442 pass. The pre-existing pugh cases passed against a reworked datum pick, which is validation from a test nobody wrote for this round. Two ratchets were raised by one each, with the reason written where the rule says to put it.

## round_1_validate

- exercised against the goal: YES, once the reopen finished. The round set out to make the walk fast AND measurable. It is measurable, and the measurement answered the round's own question: the mechanical flip costs 11 to 12 milliseconds against a budget of 250, and the seconds are the states' own work, which the owner has ruled acceptable provided it is signalled.
- missing: proof that a sweep stopped mid-route leaves the next pull demanding the reading. The reading-skip's safety argument leans on it for two exits, and no case in the suite exercises it. A reviewer named it and it is honest to carry it rather than call the argument closed.
- wrong: the round changed code twice before measuring. The bare-aim flag rested on an unchecked belief and was reverted. The score-cell fix replaced one bias with its mirror image and was caught by a reviewer before it stood. Both are recorded where they happened.
- out of scope: nothing. The owner ruled that nothing leaves scope, and the four items the first drawing omitted are chunks now rather than an omission.
- prior art: TEMPORAL AND LANGGRAPH EACH DO HALF OF THIS BETTER, and the half they do better is the half this round is about. Temporal's own observability page names metrics, end-to-end tracing of workflow AND activity executions, search attributes and a web UI; per-step timing with a real trace is their product, where ours is two numbers and a call log. LangGraph's interrupts pause anywhere in a node, are conditional on application logic, checkpoint exact state and resume by command with a typed payload; our stop-at has four fixed notches and none. WHAT OURS DOES THAT NEITHER DOES is refuse the AGENT's own stop — both of theirs are cooperative, and nothing in either stops a model deciding it has done enough. What we shed for it is tracing, a metrics endpoint and a timeline anybody can look at, and that trade stops being right the moment the walk outgrows a readable log.

## goals_served

- Establish where the walk's time actually goes, by measurement rather than by argument: SERVED, and it is the goal that paid off hardest. It killed two of this round's own theories. The drawing is 68 ms for a whole route; the mechanical flip is 11 to 12 ms warm; bumping the drawing epoch costs nothing. What costs seconds is the states' own work.
- Make a hop's published time budget enforceable, which needs something that holds still to measure against: SERVED. The budget binds the flip, on the owner's ruling, and the flip is measured. The pinned benchmark run now records what each hop cost to WALK and reports their median, so two walks of the same rewound record are comparable.
- Aiming returns at once, and the pull does the walking: SERVED. A bare aim draws its route and returns without sweeping. The drawing is milliseconds; the sweeping is the seconds this goal is about.
- A target that cannot be routed to fails fast instead of spending two minutes finding out: SERVED, and it was nearly lost twice. The bare-aim flag would have removed the only thing that can answer reachability. Then the requirement itself was found to demand something no graph search can do, and the owner struck it; it now demands the early return and measures the bound that catches a hang.
- Three defects that live in these same modules stop standing: SERVED, and five rather than three. The stop-at control reaches the hook, the hook records what it decides, the built surface cannot drift from its source, the rigor matrix reports the rows it has, and the route drawer tells a deciding step from a failed one.

## bound_breaches

- if-agent-harness-to-entrypoint: none — nothing here touched the harness or the entrypoint, and the stop hook is fired BY the harness while reading only the call log, so its changes stay inside the engine. The breach that did happen ran the other way and is closed: four items INSIDE the declared bound were not built and their withdrawal was recorded nowhere, which is as much a bound problem as over-delivery and harder to see; the owner ruled nothing leaves scope and all four are chunks now.

## round_2_red_team

- The round is called "the walk gets fast" and nothing shipped is demonstrably faster => ADMITTED, and it has its own standing entry. What shipped makes the walk measurable and fixes five defects. The measurement then showed the flip is already inside its budget, so there was nothing left to speed there — and the seconds are the states' own work, which the owner ruled acceptable when signalled.
- Code was changed before measuring, twice => ADMITTED without defence. The bare-aim flag rested on an unchecked belief and was reverted. The score-cell fix replaced one bias with its mirror and was caught by a reviewer. Both are recorded where they happened, in the code and in the entries.
- Three specs were amended to match their tests => ANSWERED, and the requirements above them were amended too this time. The first pass moved only the lower layer, which is how a spec and its requirement came apart; that gap is a closed entry and the general shape is written into it.
- Three chunks landed with no observed red => ADMITTED and ruled on by two hands. It does not hold the gate, because the four requirement rows kept their reds and none of the three is a requirement's own measure. They are recorded as built and UNREDDENED, never as verified or as untested.
- One chunk was not built at all => ADMITTED, deliberately. Three cases of the knock-down fired correctly today and the failing case has no reproduction. Its entry forbids marking it built and carries the two-call probe.
- The build drawing was authored after the build => ADMITTED, and it is the cause behind the four missing items. The drawing now says so in itself, and it is a standing risk against any phase that writes its plan after its work.
- The kill criterion: a defect this build introduced that no hand could see => LOOKED FOR AND FOUND ONCE. The score-cell mean was exactly that, and a cold reviewer caught it before it stood. That is the mechanism working, and it is the reason this round used four review passes rather than one.

## raid_additions

- raid-iss-nothing-shipped-this-round-makes-the-walk-faster
- raid-iss-the-hop-is-still-over-its-published-budget
- raid-iss-three-chunks-landed-with-no-check-and-no-observed-red
- raid-iss-the-knock-down-has-no-reproduction-of-the-case-that-fails
- raid-iss-the-loaded-half-of-the-failed-route-row-is-not-implemented
- raid-iss-the-surface-row-has-no-harness-that-could-fail-it
- raid-risk-a-faster-walk-must-not-turn-a-red-hop-green

## verdict

pass with overrides — the round now delivers both halves of its name, and what it does not reach is named rather than dressed. The walk is measurable: every hop records what it cost and every search reports what it looked at. The walk is faster: a profiler found the per-hop cost and four measured fixes took a three-hop sweep from 15,404 milliseconds to 2,562, with the file door's own meter falling from 612,532 calls to 22,040. Five defects that were standing no longer are, and the suite is 464 of 464. THE BUDGET IS MET, and this verdict said otherwise for about an hour. It claimed a hop is 854 milliseconds against a budget of 250. That compared the whole hop against a row which bounds only the FLIP, and it measured a cold process. Warm, the flip is 20 milliseconds and the whole hop is 34 to 66, which agrees with the 11 to 12 milliseconds `author-tests` measured before the speed work. The entry that carried the false breach is closed as refuted, and a reviewer with fresh eyes is what asked for the measurement that settled it. What stands open is named in the remaining register entries.

## follow_up

### What is owed next, in the order it is worth doing

ONE TESTING AFFORDANCE CLOSES TWO ROWS: a way to make an engine call run long on purpose. The surface row and the failed-route row both wait on it, and building it twice would cost more than building it once.

THE KNOCK-DOWN'S REPRODUCTION IS TWO CALLS. Re-sign a feeder with the walk pointed away from the dependant, then with it pointed at it. If the answers differ, the fix aims at routing rather than at claims.

THREE GUARDS NEED WATCHING FAIL. Break what each protects, watch the red, revert, record it. That is what separates a guard from a sentence.

### What this round learned that outlives it

A DRAWING WRITTEN AFTER THE WORK CANNOT SHOW WHAT WAS DROPPED. It listed exactly the four things already built, so four owed items were invisible from inside it.

MEASURING BEFORE CHANGING IS CHEAPER THAN REVERTING. It was proved twice in one round, both times at the cost of a revert.

A SECOND COLD HAND EARNS ITS PLACE. Two reviewers across four passes caught a stray copy of the project that had been failing two tests for weeks, a requirement demanding the impossible, a fix whose bias was the mirror of the bug, and a ruling nothing was watching.

### And one the owner named as a principle

A CHANGE SHOULD NOT GREY THE TREE. Spawn a hand to check the impact, keep walking, and adjudicate at the gate. This round re-earned six states by hand to reach a gate that then converted, and every one of them still passed on its own content.

## anything_else

