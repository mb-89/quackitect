---
form: gate-implementation
bless: blessed by agent
reopened: "2026-08-20T23:56:12.843Z — verification was re-signed below it: the machinery-ascends rule moved onto dsp-walk-machine.md with a test guarding it, and the battery ran green over the tree that carries both. No shipped behaviour changed for this gate to answer differently."
by: agent
signed_off: 2026-08-20T23:56:15.554Z
authors: agent
files: null
---

# Evidence form / gate-implementation

## current_situation

M7 is walked: six test specs, two design specs, a ten-chunk build drawing, ten chunks built, the design traced, the battery run and two adversarial passes over it.

THE BATTERY IS 1650 PASS, 0 FAIL. It was 1632 pass, 0 fail before either adversarial pass, and every one of the eighteen cases added since exists because something was found that a green battery could not see.

### Two passes, sixteen findings, and only two of them were failing tests

A FRESH-EYES TESTER built an isolated copy of the repository and deleted mechanisms one at a time. Five could be removed with no red at all, and two of the five were broken rather than merely untested.

A RED TEAM then attacked the fixed build and broke it again in six places, every one proven by running it rather than by reading it.

NOT ONE OF THE SIXTEEN WAS A FAILING TEST. The battery was green through all of them, which is the single most useful thing this milestone learned.

### What was actually broken, as opposed to weakly checked

- A LANE CALL COULD VANISH FROM THE LOG, twice, through two different doors. The second door was opened by the fix for the first, and it swallowed REFUSAL records as well as ordinary ones.
- `se_update` TOOK ITS COORDINATES FROM THE WRONG OBJECT — the update payload rather than the call — so 1,615 of 9,024 records carried a part and a model that were wrong rather than claimed, and the update object was an undefended way past the vocabulary guard.
- THE PULL'S SIZING LOOKUP HAD NEVER WORKED. It read a nested id against a machine whose states are named bare, and a blanket catch turned the miss into "unrated", which is the ordinary case.
- `sizeUnit` NAMED THE WEAKEST RUNG for an unrecognised figure, because `Math.max(0, -1)` is zero. Under-driving, which this design names as the dangerous direction, silently.
- THE UNREASONED MARK COUNTED THE WRONG THING, then counted nothing when a caller omitted an echo it also supplied.
- AN OVER-SEGMENTED RATING was accepted and truncated without a word.

ALL SIX ARE FIXED, each with a case that goes red when the mechanism is removed.

## quality_ok

- [x] Dependencies stay layered
- [x] Every new element carries one stated responsibility
- [x] The linter and the complexity ceiling are clean, with no new suppression
- [x] Every new behavior carries its check, and the battery is green at rest
- [x] Nothing speculative shipped
- [x] What changed is findable
- [x] Every quick-and-dirty taken stands as a visible raid debt entry

## debt_taken

- project/spec/trace/raid/raid-debt-the-load-time-complexity-refusal-is-off-until-the-matrix-is-rated.md
- project/spec/trace/raid/raid-iss-the-matrix-cache-is-keyed-on-size-and-modification-time.md

## risks_acceptable

acceptable — the largest exposure is a debt with a named repayment rather than a risk, the second is older than this build and now registered, and the third trades a mark that meant nothing for one that means something.

THE LARGEST ONE IS THAT NOTHING IS RATED, and it is a debt with a named closing act rather than a risk. The mechanism ships able to declare, read, refuse and publish a difficulty. No cell declares one, so no pull in the shipped product carries a `hand` field. `specify-build` declared the rating out of scope before the build began, and putting 154 unreviewed judgements in the same commit as the mechanism that reads them would have been the worse call.

THE SECOND IS OLDER THAN THIS BUILD AND THIS BUILD MADE IT VISIBLE. The matrix content hash is memoised against size and modification time, and the comment above it says in capitals that it must never be. A red team produced two different published rungs from identical bytes, in a warm process and a fresh one. It is `conceivable` rather than `expected` — a natural collision does not occur on this filesystem, measured — and the vector is a mtime-preserving restore.

THE THIRD IS THE ONE I WOULD ARGUE HARDEST ABOUT. The safety asymmetry is now twice voluntary: a walker declares that it went weaker, and only then owes a sentence. That is worse than a mark that fires automatically — except the automatic one fired on nearly every record and counted nothing. A mark that means something and is voluntary beats a mark that means nothing and is not.

## round_0_verify

- evidence vs claims: THE CLAIMS WERE CHECKED BY DELETING THE MECHANISMS BEHIND THEM, not by reading them. A fresh-eyes tester built an isolated copy and mutated: five mechanisms could be removed with no red, and two of the five were broken rather than merely untested. All nine findings are fixed and the four weak checks now go red on deletion — verified for the pull case by deleting the line and running it.
- types: `npx tsc -p .` exit 0, no diagnostics, on the whole tree.
- lint: `npx biome check .` clean over 342 files, no new suppression. One finding was the linter's own — an optional chain that would have thrown on undefined — and it was fixed rather than silenced.
- tests: 1642 pass, 0 fail, 147 suites. Ten cases more than the tester ran against, all of them added by the fix pass.

## round_1_validate

- exercised against the goal: PARTLY, AND THE PART THAT IS NOT IS NAMED. The mechanism is exercised end to end by a check that seeds an iteration, pins its column, rates the cells, walks to a real step and reads the published statement off a live pull. What is NOT exercised is the product's own matrix, because nothing in it is rated — that is the debt entry, not an omission.
- missing: THE DEMONSTRATION. A must story is served by this build and its report belongs at run-demos, not here. The end-to-end pull is the join the unit checks hold both halves of.
- wrong: TWO THINGS WERE, AND A TESTER FOUND BOTH. A lane call with a bad part vanished from the log; the head's lookup had never once found a rated step. Both fixed, both with a case that goes red on deletion.
- out of scope: RATING THE 154 ACTIVE CELLS, declared at specify-build before the build began. The build makes a difficulty declarable, readable and refusable; it declares none.
- prior art: THE NO-MATCH VALUE IS OASIS XACML 3.0's, verified at the primary — OASIS Standard, 22 January 2013 — where NotApplicable and Indeterminate are distinct returned results. Nothing else here rests on prior art, and the rung vocabulary is ours.

## goals_served

- Every state in the rigor matrix carries a complexity rating on a five-rung ladder (C0 derive, C1 transcribe-or-rule, C2 apply, C3 author, C4 frame), each rated with evidence rather than asserted.: THE LADDER AND THE DECLARATION SHIP, THE RATINGS DO NOT. A cell carries `<column>_complexity: C3/R1` and the loader refuses a value outside either vocabulary. No cell in the shipped matrix is rated, and rating them is the matrix owner's judgement — raid-debt-the-load-time-complexity-refusal-is-off-until-the-matrix-is-rated.
- ONE fixed model list lives in the repo, identical on every host, mapping each rung to a model name.: NOT SERVED, AND DELIBERATELY. The declared winner publishes a rung and holds NO roster, which is the choice M4 made and gate-candidates blessed. The owner's ruling for a fixed list was recorded as an input to that choice rather than as an obligation on it, and declare-winner says so.
- Each milestone names the driver it needs before it is walked, computed live from the matrix and never pinned into a record's demands.: SERVED, AND THE SECOND HALF IS THE ONE WITH TEETH. The pull carries `hand` at every rated step, and a complexity change moves neither the demand digest nor the step shape — proved by folding the difficulty into the ledger and watching two cases go red. What ships names a STEP rather than a milestone, because the design publishes per state.
- Every call in the lane records which model actually answered it, so a walk can be attributed after the fact.: SERVED AND MARKED AS A CLAIM. The field is on every record and the transport still hands the engine a client name and no model, so the value comes from the party being measured. `claimed` says so on the record itself, and the schema tells the caller before they send it.
- A submachine takes the MAXIMUM complexity over its items, so one walker strong enough for the hardest item walks all of them and a fan-out never becomes a fleet.: BUILT, TESTED, AND CALLED BY NOTHING. `sizeUnit` takes the maximum per figure and keeps the spread. The declared design publishes per state, so there is no unit to reduce over — el-sizing records that under "One function it implements and never calls", because leaving it unallocated would hide a conflict between a standing must and the declared architecture.

## bound_breaches

- if-agent-harness-to-entrypoint: BREACHED AT 3.7 PER CENT, MEASURED THROUGH THE LANE'S OWN LOG. 321 of 8,685 lane calls exceeded the one-second bound. Excluding the two that spawn external work by design changes nothing at one decimal place. THE BREACH IS CONCENTRATED AND THAT IS THE USEFUL PART: `se_pull` alone is 305 of the 321, which is 24.5 per cent of all pulls. Every other verb is under one per cent. THE BOUND STILL CARRIES NO PERCENTILE to be judged against, for the fifth milestone running — a bound stated as an absolute over a distribution decides nothing, and this iteration adds a fifth measurement without fixing it.

## round_2_red_team

- THE BATTERY WAS GREEN THROUGH SIXTEEN FINDINGS ACROSS TWO ADVERSARIAL PASSES => THAT IS THE MILESTONE'S FINDING, NOT ITS EMBARRASSMENT. Reading the tests finds a missing case; reading the code finds a missing branch; only deleting the mechanism finds a check that cannot see it go. Five mechanisms could be deleted with no red, and two of the five were already broken. The two passes cost an isolated copy of the repository and about twenty minutes of machine time between them.
- EVERY CHECK TESTED A LAYER AND NOTHING TESTED A JOIN => AND BOTH LIVE DEFECTS WERE IN JOINS. The log was tested by calling `append` directly; the caller's declaration was tested by reading the tool schema; the published envelope was assembled by the test itself. A user's call travels all three and nothing travelled with it. Every fix added a case that goes through the lane.
- THE FIX FOR THE FIRST LOST-RECORD DEFECT OPENED THE SECOND => WHICH IS THE SHARPEST THING HERE. The guard compared raw arguments, and `as` is undefined when omitted — so a relay with no declared part sailed past it into the same throw, inside the same swallow. A fix written against one probe held for that probe and for nothing beside it.
- `reviewer` IS A VOCABULARY WORD NO CODE PATH PRODUCES => TRUE, AND IT STAYS. The closed vocabulary is the interface a later hand implements against, and it is cheaper to ship a word nothing sends than to widen a closed set later. `relayed_by` is likewise demanded by no requirement and justified by a register entry, and it was the direct cause of a lost record — that is the cost of shipping ahead of a demand, and it is recorded rather than argued away.
- THE LIVE LANE SERVER PREDATES THIS BUILD => SO NO LIVE EVIDENCE FOR THE THREE COORDINATES EXISTS YET. The server this walk is talking to started before the code landed and does not know the `as` argument. `se_log_query group_by: part` answers `(none)` for all 9,026 records, including the ones this gate is writing. That is an operational artifact and it means the demonstration at run-demos must run against a server built from this code.

## raid_additions

- project/spec/trace/raid/raid-debt-the-load-time-complexity-refusal-is-off-until-the-matrix-is-rated.md
- project/spec/trace/raid/raid-iss-the-matrix-cache-is-keyed-on-size-and-modification-time.md

## verdict

pass with overrides — the build is sound, the checks around it were not, and both adversarial passes are now cases.

WHAT IS BEING BLESSED. A mechanism that declares, carries, reads, refuses and publishes how strong a hand a step needs, and a call record that carries three coordinates instead of none. 1,650 cases, zero failures, clean types, clean lint.

THE OVERRIDES.

- NOTHING IN THE PRODUCT'S MATRIX IS RATED, so the sizing block publishes nothing in the shipped product. Debt, with a named closing act.
- THE MILESTONE MAXIMUM IS BUILT, TESTED AND CALLED BY NOTHING. The declared design publishes per state, so there is no unit to reduce over. It is allocated rather than dropped because the requirement is a must and hiding the conflict behind a tidy matrix would be worse.
- THE MATRIX CACHE CAN SERVE A STALE ANSWER to a long-lived process after a mtime-preserving restore. Older than this build, made visible by it, registered.
- THE SAFETY ASYMMETRY IS TWICE VOLUNTARY and the register entry against it stands at crippling, unretired.
- THE ONE-SECOND BOUND IS BREACHED AT 3.7 PER CENT and still carries no percentile to be judged against, for the fifth milestone running.
- NO LIVE EVIDENCE FOR THE THREE COORDINATES EXISTS YET, because the running lane server predates the build.

## follow_up

`run-demos` OWES A DEMONSTRATION AGAINST A SERVER BUILT FROM THIS CODE. The must story is `sty-the-machine-picks-the-hands`, and its report needs a walk that seeds an iteration, pins its column, rates a step, reads the `hand` field off a live pull, and delegates. Running it against the server this session is talking to would demonstrate the absence of the feature.

TWO SLIDES OF THAT STORY ARE OUT OF DATE and `fill-story-evidence` is where they are filled from the shipped system. One describes the seed's model list, which the declared winner does not hold. The other says no field is declared for the weaker-driver reason, and three now are.

THE RATING PASS IS THE NEXT REAL PIECE OF WORK and it is not this iteration's. It is 154 active cells, it is judgement, and `exp-two-hands-rating-the-same-six-cells` measured what it costs: two readers agreed on five of six, and disagreed on exactly the row that stands in for work happening elsewhere.

WHAT I WOULD ASK A RETRO TO LOOK AT. Both adversarial passes found more in twenty minutes than the whole build's own discipline found in a day, and both did it the same way: by deleting the mechanism and watching nothing happen. Nothing in the method asks for that, and `observe-red` — which is the state closest to it — asks only that a check fail BEFORE the build, never that it fail again once the build is removed.

## anything_else

