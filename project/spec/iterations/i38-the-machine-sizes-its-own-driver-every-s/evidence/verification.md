---
form: verification
by: agent
signed_off: 2026-08-20T21:12:39.619Z
authors: agent
files:
---

# Evidence form / verification

## current_situation

The build is traced and the file claims are corrected. This is where the full battery runs — fired by the state's own exit script, never by me — and where fresh eyes look at what the checks actually hold.

TWO INSPECTIONS WERE OWED A REAL RUN HERE, and `observe-red` said so. Both were accepted as unfalsifiable before the build because their path did not exist. It exists now, and a spec accepted as unfalsifiable before a build and never re-run after it is coverage that never happened.

### tsp-the-published-strength-is-the-same-on-every-host — every item green

Examined: `engine/sizing.ts` whole, and the two functions in `rigor-matrix.ts` that produce a difficulty.

- NO ENVIRONMENT READ ON THE PATH. `sizing.ts` mentions no `process.env`, no home directory, no platform flag and no hostname. `parseDifficulty` and `difficultyFor` carry none either.
- NO NETWORK CALL. `sizing.ts` imports one module, `./rigor-matrix.ts`, and nothing else.
- NO CLOCK AND NO RANDOMNESS. Neither `Date` nor `Math.random` appears anywhere on the path.
- EVERY INPUT IS A REPOSITORY FILE. Two: the matrix rows, and the matrix folder's README for the rated line. Both are files this repository carries and neither is machine-local.
- PATH SEPARATORS DO NOT REACH THE ANSWER. No published value is built from a filesystem path — the rung comes from indexing two frozen lists.

THE INSPECTION IS STILL THE WEAKER INSTRUMENT AND THE SPEC SAYS SO. It establishes that nothing on the path CONSULTS anything host-specific. Running it on three hosts would be the better evidence and needs three machines.

### tsp-the-lane-publishes-a-strength-and-starts-nothing — every item green

- THE VALUE RIDES THE PULL. `Session`'s head adds `needs` beside `where`, `target` and the tier.
- NO SPAWN ON THE SIZING PATH. `sizing.ts`, `rigor-matrix.ts` and `machine.ts` carry zero occurrences of `child_process`, `spawn`, `spawnSync`, `execSync` or `execFileSync`.
- NO SPAWN DOWNSTREAM OF THE VALUE. Nothing in the engine reads the `needs` field at all — a search over `engine/*.ts` returns no reader. The value goes out and nothing inside the box acts on it.
- THE TWO STANDING SPAWN PATHS ARE UNCHANGED AND EXCLUDED BY REASON. `session.ts:879` spawns a node canary that imports `tools.ts` to prove the engine loads; `session.ts:3324` opens an evidence folder in the file manager. Neither takes a published strength and neither gained a caller.
- HEADLESS AND PSEUDO-TERMINAL MODES ARE COVERED BY THE SAME READING, because the sizing path is the same code in every mode and none of it spawns.
### The tester's verdict: FAIL, on a green suite

FRESH EYES RAN THE BATTERY AND MUTATED THE CODE. `npx tsc -p .` exit 0. `node --test "tests/*.test.ts"`: 1632 pass, 0 fail, 94 seconds. Nothing is failing.

WHAT IT FOUND IS THAT SEVERAL CHECKS DO NOT HOLD WHAT THEY READ AS HOLDING, and it proved each one by deleting the mechanism in an isolated copy and showing the suite stayed green.

### One live defect, and this iteration introduced it

A BAD `part` THROUGH THE LANE LOSES THE RECORD INSTEAD OF REFUSING THE CALL. `tools.ts:869` casts the caller's `as` to `CallPart` with no run-time check. `calllog.ts:133` throws. `mcp.ts:177-183` catches and discards, because the log hook must never break dispatch. Probed: two `se_pull` calls, the second carrying `as: "sorcerer"` — answered normally, and ONE record of two reached `calls.jsonl`.

THIS BUILD PUT THE FIRST THROW INTO `append`, so this build created a way for a lane call to vanish from the log. That is `req-every-call-logged`, and it is the exact case the spec step "THE VOCABULARY IS CLOSED" was written to close.

### Three requirements survive having their lane wiring deleted

`whichHand` at `tools.ts:864-884` is the only place a real call's coordinates are taken from the caller. The tester replaced its return with constants and ran the whole suite: IDENTICAL to control, zero additional failures.

`tests/call-attribution.test.ts` tests `CallLog.append` directly and the tool SCHEMA separately, and never the join between them. The wiring does work — probed, all five coordinates reach the record — and nothing checks that it does.

### The publishing half has no red-on-delete case

Deleting `...this.strengthNeeded()` from the pull's head produced ZERO additional failures. The only case touching `body.needs` asserts the field is ABSENT, and the positive case builds the envelope itself with `compileColumn` and `publish` rather than by pulling — so it cannot see the field go away.

### Four more, each proven or grepped

- THE SPREAD ASSERTION SURVIVES THE SPREAD LYING. It checks step NAMES only. Rewriting `sizeUnit` so every entry carries the unit maximum left `sizing-block.test.ts` at 12 pass.
- `unreasoned` FIRES ON A NAMED DRIVER, NOT ON A WEAKER ONE. Nothing compares `answered_by` against `named_driver`, and the schema tells callers to send `named_driver` on every call. A step walked at or above its named strength is marked identically to one that went weaker.
- THE UNMATCHED BRANCH IS UNREACHABLE FROM REAL INPUT. The loader refuses any value outside the two vocabularies, and the loader is the only source of a step's complexity — so the case exercises a value the system cannot produce.
- ONE SPEC STEP HAS NO CASE. `tsp-a-complexity-never-enters-a-demand-ledger` owes "a standing claim survives a rating edit, end to end"; the file holds four unit cases and none signs a claim.

### What the tester confirmed as sound

`req-the-complexity-value-is-read-live-and-never-pinned` IS REAL. Folding the difficulty into `demandsFor` turned two cases red. The fatal row's guard does what it says.

BOTH INSPECTIONS PASS INDEPENDENTLY. The tester re-ran both checklists and reached the same verdict I did, item by item, and added one caveat worth keeping: `rowsStamp` keys its cache on `size:mtimeMs`, whose resolution is filesystem-dependent. That is a cache-freshness hazard rather than an answer-variance one, and it is older than this build.


## claims

- [x] tsp-the-lane-publishes-a-strength-and-starts-nothing
- [x] tsp-the-published-strength-is-the-same-on-every-host

## follow_up

A NAME COLLIDES IN THE SERVED ENVELOPE AND THE INSPECTION FOUND IT. The field this build adds to the pull's head is `needs`, and the pull already serves a `needs` on each OPTION meaning something else entirely — "this door needs the person, because the work is above the dial" (`session.ts:2178`). One answer, one word, two meanings, at two levels.

IT IS NOT A TEST FAILURE AND NO CHECK WOULD HAVE CAUGHT IT. Both fields are correct in isolation and neither shadows the other. What is wrong is the vocabulary an agent reads, and the only instrument that finds that is somebody reading the whole envelope.

THE FIX IS A RENAME AND IT IS OWED AT `fix-findings`, which is where a finding from this state lands.

TWO SLIDES OF `sty-the-machine-picks-the-hands` ARE NOW OUT OF DATE, and `fill-story-evidence` is where they are filled from the shipped system rather than here.

- "It looks that rung up in one list kept in the repository, and puts a model name on the pull" describes the SEED design. What shipped publishes a rung and holds no roster, which is the declared winner.
- "No field is declared for the reason, no clause covers its absence" is false now. `weaker_reason` is declared, `unreasoned` marks an owed-and-absent one, and both ride every lane tool.

THE MUST STORY'S DEMONSTRATION IS THE END-TO-END PULL. `run-demos` seeds an iteration, rates a step, walks to it and reads the published statement off a live pull — the join the unit checks hold both halves of and not the middle. That is already recorded on `the-answer-rides-the-pull`'s own form.

NOTHING IN THE PRODUCT'S MATRIX IS RATED, so the field is absent on every real pull today. The mechanism ships able to publish and the ratings are the matrix owner's to write, which `specify-build` declared as scope before the build began.

### Nine findings go to fix-findings, and one of them is a live defect

THE FIRST ONE IS NOT A WEAK CHECK. A lane call carrying a `part` outside the vocabulary is answered normally and never reaches the log, because `append` throws and the dispatch's log hook swallows it. Refusing the CALL is right; losing the RECORD is not, and `req-every-call-logged` is unconditional.

THE FIX IS TO REFUSE EARLIER, at the lane's own guard, so the call is rejected typed AND the rejection is logged — which is what every other bad argument already does.

THREE FIXES ARE NEW CASES RATHER THAN NEW CODE, and each is a case that goes red when its mechanism is deleted.

- A lane-level case: a real call through `buildServer` carrying the coordinates, asserting the record holds them. Gutting `whichHand` must turn it red.
- A pull-level case: `needs` PRESENT on a live pull at a rated step. Deleting the head line must turn it red.
- A spread case asserting the per-step VALUES, not the names.

TWO ARE DEFECTS IN WHAT THE CODE MEANS, not in what it does.

- `unreasoned` marks a named driver with no reason, and the requirement is about a WEAKER one. Nothing can compare a rung against a self-reported model name, so the mark has to say what it actually counts or the caller has to declare that it went weaker.
- The unmatched branch cannot be reached from any input the loader accepts. Either the loader is the wrong place to refuse, or the branch is dead and the requirement is discharged elsewhere.

ONE IS A MISSING CASE the spec already owes: a standing claim surviving a rating edit, end to end.

ONE IS BOOKKEEPING: `tests/sizing-on-the-pull.test.ts` is named by no spec, and `tsp-the-lane-publishes-a-strength-and-starts-nothing` names an element node in its `files:` where a test file belongs.


## anything_else

