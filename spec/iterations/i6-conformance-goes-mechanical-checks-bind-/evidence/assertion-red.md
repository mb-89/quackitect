---
form: assertion-red
by: agent
signed_off: 2026-08-16T17:41:51.635Z
authors: agent
files: null
---

# Evidence form / assertion-red

## current_situation

OBSERVE-RED PASSED ON AN INSTRUMENT FAILURE.

Its own header says a check green from birth proves nothing. A check that CRASHES from birth proves just as little, and it read as the red the state was asking for.

The two are indistinguishable in the counts. `# fail 4` is the same four whether the checks reached their expectations or blew up on a bad import.

The distinction was already on the wire. Node's TAP reporter writes `code: 'ERR_ASSERTION'` in the diagnostic block under an assertion failure, and the script was throwing that away by counting with two regexes.

MEASURED 2026-08-16, in this iteration's own write-budget probe: nine write-guard cases ran, four failed, every one carried ERR_ASSERTION, none crashed. Observable by hand, and by nothing else.

## built

OBSERVE-RED NOW READS THE FAILURE'S KIND, NOT ONLY THE COUNT.

THE PARSER CARRIES IT. engine/discipline.ts gained FailureKind and TapFailure. failureKind() reads `code: 'ERR_ASSERTION'` out of the diagnostic block Node's TAP reporter writes under each `not ok`. The kind is computed BEFORE capMiddle trims the block, because the diagnostic keys sit exactly in the middle that gets dropped.

THE STATE SCRIPT DEMANDS THE FIRST KIND. engine/bin/red-observed.ts now uses parseTap rather than two count regexes.

- Every failure crashed: the run is a problem, and each crashing case is printed with its detail. A crash never reaches its expectation, so it says the check file is broken rather than that the design is unrealized.
- At least one assertion: the red stands. Any crash alongside is NAMED on a note line but does not refuse, because a check may legitimately throw before the build exists.
- The no-summary and zero-case guards are unchanged. The summary test is now an explicit regex rather than a -1 sentinel, since parseTap reports 0 for an absent count.

WHAT WAS MISSING AND IS NOW THERE. The chunk had no trace row at all. Minted req-a-red-is-an-assertion-not-a-crash, refining uc-answer-a-question-with-tests, and tsp-assertion-red naming the check file.

FIVE CASES in deliverable/tests/assertion-red.test.ts, against TAP fragments in the shape the real reporter writes: an assertion, a crash, a mixed run, a subtest roll-up, and a green run.

THE ROLL-UP CASE IS THE ONE THAT EARNS ITS PLACE. A describe() parent reports ERR_TEST_FAILURE and is dropped where a leaf survived it. Reading the kind off the parent would call every nested assertion failure a crash.

FIXTURES RATHER THAN A LIVE CRASH. Producing a genuine crash-only red means committing a check file that is broken on purpose, and the battery would then have to tolerate it forever.

Typecheck clean. Lint clean.

THE RUN IS OWED, AND THIS IS THE SIXTH. SE-C-112 refuses an agent-initiated battery here; SE-C-131 answers the scoped run with 42 distinct files and orders the battery. Each names the other. That deadlock is what chunks eight and nine deleted, and the replacement cannot load until idle. Verification's battery covers chunks six through eleven.

## follow_up

THE STATE SCRIPT'S OWN VERDICT IS NOT UNIT-TESTED. red-observed.ts composes the counts into a refusal, and that behaviour is a demonstration step on the observe-red row rather than a case in tsp-assertion-red. Driving it would mean committing a check file broken on purpose, which the battery then tolerates forever.

THE RUN IS OWED, AND THIS IS THE SIXTH. SE-C-112 refuses an agent-initiated battery here; SE-C-131 answers the scoped run with 42 distinct files and orders the battery. Each names the other. That deadlock is what chunks eight and nine deleted, and the replacement cannot load until idle, because se_reload is legal only there. Verification's battery covers chunks six through eleven, and firing it is the engine's job.

TWO TRACE ROWS WERE MINTED HERE RATHER THAN AT SEEDING, because the chunk had none. trace-design should check the rest of the fixes for the same hole.

CHUNK TWELVE IS NEXT: the-ripple-names-its-root.

## anything_else

