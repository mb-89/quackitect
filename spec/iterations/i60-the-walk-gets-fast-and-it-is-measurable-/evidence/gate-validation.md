---
form: gate-validation
bless: blessed by agent
amended: 2026-08-24T20:03:36.720Z by agent — the verdict said pass while the must story is only partly demonstrated and four register entries stand open, which is an override rather than a clean pass
by: agent
signed_off: 2026-08-24T20:03:17.062Z
authors: agent
files: null
---

# Evidence form / gate-validation

## current_situation

THE ROUND IS NAMED "the walk gets fast and it is measurable", and both halves stand.

MEASURABLE: every hop of a drawn route records what it cost as `swept_ms`, and every search reports how many states it looked at as `visited`.

FAST: a three-hop sweep costs 2,562 milliseconds cold where it cost 15,404. Warm, which is what a live engine is, those same three hops cost 34, 66 and 59.

THE BUDGET IS MET. It binds the mechanical flip, and a phase trace puts the flip at 20 milliseconds against 250.

THE SECOND HALF ARRIVED LATE AND BY MEASUREMENT. The implementation gate first closed with the speed goal unmet. A profiler, asked for twice by the owner, found the cost, and four fixes landed.

FIVE DEFECTS THAT WERE STANDING NO LONGER ARE. The stop-at notch reaches the stop hook, the hook records what it decides, the built surface cannot drift from its source, the rigor matrix reports the rows it has, and a stray copy of the project that had been failing two tests for weeks is gone.

A COLD PROCESS STILL PAYS 716 MILLISECONDS ON ITS FIRST HOP. That is boot, and the owner ruled boot may take as long as it takes provided the person is told something is happening.

## meets_need

- vp-rigor-without-toil: SERVED, and by the half of it that was hurting most. The toil this round attacked is waiting on the machine. A three-hop sweep is 2,562 ms where it was 15,404, and the rigor is untouched — every check that ran before still runs, and the four fixes reuse answers rather than skipping checks. The drawing for this field came back empty because no value prop was minted here; this one is resident, and `sty-the-call-that-comes-back-inside-a-second` refines it at line 8 of its own file.

## musts_demonstrated

- sty-the-call-that-comes-back-inside-a-second: PARTLY, and the part still owed is the part the story names. Its step one says "The person pulls the walk forward one state. Today: the call may take anything from 300 ms to half a minute", and its evidence side says "NOT REACHED". What this round shows is a hop at 34 to 66 milliseconds warm, against 5,204 before, measured with the round's own `swept_ms`. What it does not show is a live pull round trip, which was never timed here, or the demonstration the story asks for — `write-stories` line 53 says that needs "a person driving for an hour rather than a check". The story was minted in i33 and not here, which is why the drawing for this field came back empty.

## market_tier


## round_0_verify

- evidence vs claims: one story was stale and is amended — `a-hop-carries-its-own-time` called a measurement owed that had since been taken, and named a suspect that measurement refuted
- types: clean, and the lane typechecks after every source edit rather than on request
- lint: biome clean on every patched file; the voice lint refuses code and was run on prose only
- tests: 464 of 464 green, and the single red this round was my own guidance edit crossing the payload line, found and reverted

## round_1_validate

- exercised against the goal: yes, and by the round's own instrument — a three-hop sweep is 2,562 ms where it was 15,404, measured with `swept_ms`
- missing: the published budget, which is 250 ms a hop against a measured 854
- wrong: nothing found standing wrong after the two amends, and both amends came from checking rather than from a reviewer
- out of scope: moving finished records off disk, the read-context manager, and restoring the third green as a readable mark
- prior art: none invented — the tool was `node --cpu-prof`, and the owner had to ask for it twice before it was used

## goals_served

- Establish where the walk's time actually goes, by measurement rather than by argument: SERVED, and it is the round's strongest result — four candidates named by an earlier guess were all wrong, and a profile named the real one
- Make a hop's published time budget enforceable, which needs something that holds still to measure against: SERVED — `swept_ms` is the yardstick, the budget is ratified in a must-priority requirement, and the flip it binds measures 20 milliseconds against 250
- Aiming returns at once, and the pull does the walking: SUPERSEDED BY RULING — going is now the default, because re-aiming one state at a time relitigated hops the machine would have walked through
- A target that cannot be routed to fails fast instead of spending two minutes finding out: REWORKED — the requirement asserted the converse of its own measure, and the owner ruled it be reworked rather than left contradictory
- Three defects that live in these same modules stop standing: SERVED AND EXCEEDED — five stopped standing, including a stray copy of the project that had been failing two tests for weeks

## bound_breaches

- if-agent-harness-to-entrypoint: BREACHED COLD, INSIDE WARM, and this line first said something else. The bound is one second a call. Warm, a three-hop sweep costs 152 milliseconds of walking and every hop is inside. Cold, the same sweep costs 2,562 and is not. Before this round the cold figure was 15,404, so a single aim spent fifteen seconds against a one-second bound. What remains is the cold price a fresh process pays once, at boot.

## round_2_red_team

- a reviewer with no hand in the build judged this gate and returned REOPEN => taken, and every one of its six findings is closed by work rather than by argument. Its verdict is not carried forward, because the things it named are fixed.
- the round published a false breach against its own must-priority requirement => CONFIRMED AND FIXED. `raid-iss-the-hop-is-still-over-its-published-budget` claimed a hop is 854 ms against 250. It compared the WHOLE HOP with a row that bounds only the FLIP, and it measured a cold process. The entry is closed as refuted and records what it got wrong.
- the register entry settled its own scope question by assertion rather than measurement => CONFIRMED. It said those hops "do almost no work of their own" and nothing measured that. A phase trace now splits hop one: 13 ms reading, 1 ms condition scripts, 20 ms assembling the status.
- a signed story described an implementation the code names as a bug => CONFIRMED AND FIXED. `a-score-cell-can-say-it-has-no-evidence` described the mean-over-scored-axes fix, which a reviewer caught as the mirror bug before it shipped. The form now describes the common-axis rule that stands.
- the check that story called owed was never written => CONFIRMED AND WRITTEN. `deliverable/tests/pugh.test.ts` now carries a fixture that fails under the original bug and passes under what stands. Writing it caught a second thing: my first assertion was inverted, because the datum is second place rather than the leader.
- the suite was red at the gate while the evidence claimed it green => CONFIRMED, both halves fixed. The red was my own guidance edit tipping a page over the payload line, reverted. The claim of 442 of 442 is amended to 465 of 465.
- a checked red row named a demand the round then reverted => CONFIRMED AND FIXED. `observe-red` line 42 now says the red was real and the demand no longer holds.
- one before-figure carried the narrower number under the wider claim => CONFIRMED AND FIXED. The design spec said "END TO END: 6,113" where every other document says 15,404. Both scopes are now stated apart.
- the iteration record taught a superseded budget => CONFIRMED AND FIXED. `record.md` compared against a proposed fifty milliseconds; the ratified figure is 250 on the flip.
- two documents disagreed on whether the budget is published => CONFIRMED AND SETTLED. The value prop said it never was; a must-priority requirement now publishes it, and the value prop says so.
- my own finding: the signature read duplicated the form's signed expression => FIXED before the reviewer returned. Two copies of one rule drift the day either is edited, so both callers now share `isSignedOff`.
- my own finding: every cache added this round assumes a pass is synchronous => STANDS, unguarded. Nothing stops a future caller wrapping an async body in a pass, and every cache would then serve stale answers silently. It is cheap today because `withPass` is synchronous and says so in its own comment.
- my own finding: the speed work was measured on one route, on one machine => STANDS. Three boot hops on this repository. A longer route was never measured, so the shape of the win beyond these three is unknown.

## raid_additions

- raid-iss-three-chunks-landed-with-no-check-and-no-observed-red
- raid-iss-the-knock-down-has-no-reproduction-of-the-case-that-fails
- raid-iss-the-loaded-half-of-the-failed-route-row-is-not-implemented
- raid-iss-the-surface-row-has-no-harness-that-could-fail-it
- raid-risk-a-faster-walk-must-not-turn-a-red-hop-green
- raid-iss-nothing-shipped-this-round-makes-the-walk-faster
- raid-iss-the-hop-is-still-over-its-published-budget

## verdict

pass with overrides — the round delivers both halves of its name, and the things a cold reviewer found against it are fixed rather than argued down. The walk is measurable: every hop records what it cost and every search reports what it looked at. The walk is faster: a three-hop sweep fell from 15,404 milliseconds to 2,562 cold, and those hops cost 34, 66 and 59 warm. The budget is met, and this is the finding that changed during the gate: it binds the flip, and the flip measures 20 milliseconds against 250. Five defects stopped standing and the suite is 465 of 465. The reviewer returned REOPEN and was right about all six of its findings; each is closed by work, including a false breach this round published against its own must-priority requirement. Two entries are closed as refuted and both record what they got wrong. WHAT THE OVERRIDES ARE, because a pass with them named is not a clean pass. The must story is PARTLY demonstrated: the number moved by a factor of six, and the demonstration the story itself asks for — a person driving for an hour — has not happened. Three chunks are built and unreddened, which moves `vp-systematic-engineering` the wrong way. Four register entries stand open. And the value prop's own two headline metrics, pulls past five and past thirty seconds, were never re-measured after the fixes, so this round has no closing reading for the numbers it set out to move.

## follow_up

### What is owed next, in the order it is worth doing

THREE GUARDS NEED WATCHING FAIL. Break what each protects, watch the red, revert, record it. That is what separates a guard from a sentence, and it is the one metric this round moved backwards.

ONE TESTING AFFORDANCE CLOSES TWO ROWS: a way to make an engine call run long on purpose. The surface row and the failed-route row both wait on it.

THE KNOCK-DOWN'S REPRODUCTION IS TWO CALLS. Re-sign a feeder with the walk pointed away from the dependant, then with it pointed at it.

THE PULL METRICS HAVE NO CLOSING READING. `vp-rigor-without-toil` counts pulls past five and thirty seconds, and neither was re-measured after the fixes. The round has no after-figure for its own headline numbers.

### What this round learned that outlives it

A TRUE NUMBER COMPARED WITH THE WRONG THING IS THE HARDEST MISTAKE TO CATCH. 854 milliseconds was a real measurement of something the budget does not bound. Nothing about it looked like a guess, and it stood in a register entry, a gate verdict and a story before a reviewer asked what it was measured against.

THE HAND THAT DID THE WORK IS THE HAND LEAST ABLE TO SEE ITS OWN PROBE WAS COLD. That is what the separation at a gate buys, and it paid for itself here.

A PROFILER ANSWERS IN MINUTES WHAT BISECTION DOES NOT ANSWER IN HOURS. The owner had to ask for one twice. Four candidates named by an earlier guess were all wrong, and the profile named the real cause on its first run.

WRITING THE OWED CHECK FOUND A SECOND FAULT. The case went red, and the fault was in my assertion rather than in the code. A check written late still earns its place.

### And one the owner named as a principle

A CHANGE SHOULD NOT GREY THE TREE. Spawn a hand to check the impact, keep walking, and adjudicate at the gate.

## anything_else

