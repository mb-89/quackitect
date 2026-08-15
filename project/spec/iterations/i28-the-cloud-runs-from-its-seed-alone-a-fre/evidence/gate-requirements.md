---
form: gate-requirements
bless: blessed by human
amended: "2026-08-15T16:12:23.905Z by agent — The one-second rule was written up as a prohibition three times. It is a budget with a non-blocking escape, and the requirement's own text says so."
by: agent
signed_off: 2026-08-15T16:02:37.108Z
authors: agent
files:
---

# Evidence form / gate-requirements

## current_situation

Design input ends here. M3 is complete: seven new requirement rows, the function structure re-checked with one statement widened, two new assumptions, and all sixteen standing assumptions probed.

THIS GATE CARRIES NO FIELDS OF ITS OWN, deliberately. Six once stood here and every one was already settled by a mechanical check upstream. What is left is the four rounds.

THE DIAL IS TACTICAL AND THIS GATE IS SUBMITTED UNBLESSED, on the owner's ruling of 2026-08-15 that gates become strategic.

## round_0_verify

- evidence vs claims: FAIL, corrected. Three claims in the first version of this gate were asserted without a check behind them, and all three were wrong: that no M3 state grants se_run, that the lint was owed and refused, and that four probes therefore had to be scheduled. The corrected version stands below and the pattern is note-db74bf2b7f0b.
- types: pass by vacuity - M3 changed no code; twelve markdown nodes were written and four function nodes edited
- lint: NOT OWED, and reporting it as owed was the error. se_lint is granted at build-steps, fix-findings and sweep-consistency, which are M7 and M8. A gate refusing it is correct, because a gate judges rather than sweeps.
- tests: NOT RUN and not needed - no code changed, and the last battery stands green at 1314 of 1314 from i12's close this morning

## round_1_validate

- exercised against the goal: pass - the goal is a machine with a seed id producing a walking agent, and M3 turned that into seven rows that each name one condition and one response
- missing: THE KILL-CRITERION IS NO LONGER MISSING. Measured 2026-08-15 over 33 branches and it HOLDS, with a condition the build is not free to ignore: the reader batches. One git show per iteration costs 1004 ms, which is over the budget and would owe a non-blocking treatment for a question nobody should wait on.
- wrong: FOUR THINGS WERE FOUND WRONG AND ALL FOUR CHANGED SOMETHING - the seed's claim that the server dies when backgrounded is stale, since --headless exists at se-mcp.ts line 495; the runtime floor is declared at node >=22.6 in package.json line 8; my claim that this milestone could not run its probes was false, which had deferred the kill-criterion for no reason; and I wrote the one-second rule up as a prohibition when req-call-answers-in-one-second itself says "within 1 second OR return a background handle whose completion the driver observes"
- out of scope: unchanged from M2's eight non-goals, and no row crept past them
- prior art: NOT RE-MADE AT M3, deliberately - the comparison was made at M1 against Codespaces, Gitpod, devcontainers and our own written handover; requirement authoring follows ISO 29148 and INCOSE through the method card, which is a borrowed shape rather than a compared system

## round_2_red_team

- STEELMAN: seven rows for a MAJOR change is thin, and a reviewer could fairly say the fold hid work rather than clustering it => answered by the fold's reasoning, recorded per family, which names what was NOT folded and why
- THE FOLD COULD BE HIDING A VERIFY DIFFERENCE. The folder-lifecycle row covers three transitions in one Detail table => accepted as a real risk of the fold; if the lifecycle test needs splitting, so does the row
- THE KILL-CRITERION HOLDS AND NOW BINDS THE BUILD => measured over the real corpus: existsSync 12.6 ms, batched cat-file 58.7 ms, git show per iteration 1004 ms; batching is what keeps listing iterations inside the budget so it never has to announce itself
- THE ONE-SECOND RULE WAS WRITTEN UP AS A PROHIBITION, three times, in this gate and in the entry it rests on => corrected; the rule is a budget with an escape, operations over a second are allowed if they are few, non-blocking and non-obtrusive, and what is forbidden is stalling; the requirement's own statement carries that and I read past it
- THE COUNT IN THAT PROBE DID NOT MATCH THE SURVEY. The batched read saw a status line on all 33 branches while 27 are open, because a shipped iteration's record on its own branch can still read as open => the reader takes the record from TRUNK, now written into the entry rather than discovered during the build
- THE PROBE EVIDENCE STILL DISAGREES WITH ITSELF. Seven probe values were cut by the form's write path and restored from full text => unresolved here, a gate cannot write, and probes become dedicated notes in the implementation phase
- THIS GATE PASSED THREE UNCHECKED CLAIMS AND ONE MISREAD RULING ON ITS FIRST ROUND, and the owner caught every one => conceded without defence; evidence-vs-claims is the round that exists to catch exactly this and it reported pass

## raid_additions

- none

## verdict

pass — the register covers every use-case step and extension, the function structure closes both ways, every standing assumption carries a probe outcome with its reason, and the assumption that could have killed this design was measured rather than deferred.

THE KILL-CRITERION HOLDS. 33 branches: today's disk test costs 12.6 ms, a batched git read costs 58.7 ms, and the naive git-per-iteration read costs 1004 ms. The design is sound and the implementation is constrained to batch.

WHY IT IS NOT A CLEAN PASS. This gate's evidence-vs-claims round first reported pass over three claims that had no check behind them and one standing ruling I had misread. The owner caught all four. That round now reads FAIL, corrected, because a gate that grades its own unchecked assertions as sound is the failure mode gates exist to prevent.

THE ONE-SECOND RULE IS A BUDGET, NOT A BAN. Operations over a second are allowed where they are few, non-blocking and non-obtrusive, and what is forbidden is stalling. Three sentences in the first version of this gate treated it as a prohibition.

WHAT IS STILL OPEN AND NAMED: three probes remain spikes rather than blocked calls, and the probe form and the probe nodes disagree for seven entries until probes become notes.

THE THUMB IS NOT MINE. Submitted unblessed on the owner's ruling of 2026-08-15.

NO OVERRIDES.

## follow_up

- THE BLESS IS OWED BY THE OWNER, and the walk stands here until it comes
- THE READER MUST BATCH. One git show per iteration breaches the one-second rule at today's count, before a single new iteration is seeded.
- THE READER TAKES THE RECORD FROM TRUNK rather than the branch tip, and must handle a missing blob
- M4 opens the solution space, and derive-criteria needs its method card read first
- re-read req-the-lane-runs-without-a-console at M4, because --headless already builds half of it
- the probe form and the probe nodes disagree for seven entries until the probes-become-notes work lands
- nothing is parked from this state

## anything_else

### What M3 cost, and what it bought

FOUR CHEAP CHECKS CHANGED THE WORK. Reading se-mcp.ts removed a scope item. Reading package.json turned a smell into a measured floor. Reading a matrix row showed this milestone could always run its own probes. Running the probe settled the kill-criterion and constrained the build.

EACH ONE WAS ONE CALL. Three of them were available from the start and were not made.

### The grant gaps, corrected

I reported three. Only two are real.

- A GATE FINDS DEFECTS AND CANNOT RECORD THEM. Real, and already the owner's ruling of 2026-08-15.
- A WORK STATE MINTS NODES AND CANNOT REMOVE ONE. Real. se_file_delete is granted in overhaul alone.
- THE PROBING STATE CANNOT RUN ITS OWN CHECK. FALSE. M3_20C_probe-assumptions.md line 18 grants se_run, and it always did.

THE THIRD WAS THE LOUDEST OF THE THREE and it was the invented one. That is worth more than the correction itself: an assertion dressed as a systemic finding reads as insight, routes real work, and costs more than a plain mistake.
