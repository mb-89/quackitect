---
form: verification
by: agent
signed_off: 2026-08-15T20:09:13.146Z
authors: agent
files:
---

# Evidence form / verification

## current_situation

i28 built the unattended entrypoint. Verification found it did not do what its own requirement demands, and the fix pass below is part of this state.

WHAT LANDED IN THE BUILD.

- `project/deliverable/engine/bin/se-start.ts` — the entrypoint. Seven steps take a machine from a clone to a walking agent: verify, install, start, wait, fetch, adopt, launch. Every step failure exits naming itself.
- `project/deliverable/tests/unattended-start.test.ts` — eight cases, all passing.
- `project/deliverable/package.json` — `engines.node` pinned at `>=24.0.0`, the floor the engine actually runs on.
- `project/guidance/method/cloud-runner.md` — the briefing an unattended agent reads on arrival, so it reinvents nothing.

Seven engine defects were fixed on the way, each measured before it was touched.

- The chain stood green over an unfinished input, because two guards held different definitions of what counts as an input.
- A state's script condition judged the repo root while the agent wrote to the bound worktree. `workRoot()` now serves both roots, and 92 call sites moved off the raw field.
- A fan's join deadlocked when one leg reached it unwalked.
- The completion check set its exit code unconditionally, so it could never pass.
- The outward search read `.se` from the wrong root.
- The cage was missing its Stop hook, which showed as two battery failures.
- The start step was believed not to release its caller. That belief was wrong, and the correction is the largest finding of this state.

WHAT VERIFICATION CHANGED. A tester with fresh context found the launch step produced no agent and the adopt step took no claim. Both are fixed. The measurement four artifacts rested on was retracted and re-taken. The details are in the section below.

## claims

- [owed] tsp-autonomy-tiers — raid-debt-human-observed-demonstrations
- [owed] tsp-derivation-analysis — raid-issue-the-corpus-wide-inspections-have-no-runner
- [owed] tsp-desk-and-gates — raid-issue-must-demos-owed
- [owed] tsp-first-run — raid-issue-must-demos-owed
- [owed] tsp-panel-walkthrough — raid-debt-human-observed-demonstrations
- [owed] tsp-prose-inspection — raid-issue-the-corpus-wide-inspections-have-no-runner
- [owed] tsp-record-inspection — raid-issue-the-corpus-wide-inspections-have-no-runner
- [owed] tsp-tour-run — raid-issue-must-demos-owed
- [owed] tsp-unattended-start — raid-issue-must-demos-owed

## follow_up

WORK TO PULL IN.

- raid-debt-core-and-satellite-is-off-the-live-path. Eight engine files carry a designed, tested subsystem that nothing on the running path imports. Six test files exercise it against itself. It is wired on or cut, and both are the owner's call.

NOTES PARKED, all ready at the retro.

- note-f2b4b93c28d4 — a landing brings the code and leaves the trace behind. Confirmed live this iteration, with the two commits that hold the lost specs.
- note-fe9e091bfa4c — an iteration to code-review the engine for competing mechanisms and quick hacks.
- note-f7777e741479 — the graph must recompute on change, instead of needing a re-walk before a change shows.
- note-e1c389b07962 — too many manual steps the engine could have done, checked or corrected.
- note-9790deb26c96 — a new mechanism must kill the old path, not sit beside it.
- note-238e5c575922 — the reload commits an open iteration's work to trunk, then trunk and the branch conflict over identical content.
- note-5aabf156e5f7 — a fan's join deadlocks when one agent reaches it with a leg unwalked. Fixed in the engine this iteration; the note stays for the design question behind it.
- note-2605b620b8eb — a state's script condition judges the repo root while the agent writes to the bound worktree. Fixed this iteration.

WHAT THIS ITERATION UNBLOCKS. Cloud runners can be started from a seed alone. That is the target the owner set for tonight.

## anything_else

THE TESTER WAS SPAWNED WITH FRESH CONTEXT, per meth-verification-discipline and the owner ruling of 2026-08-11. It found 15 findings. One was fatal.

EVERY FINDING IS FIXED IN THIS PASS except the three recorded as standing, named at the bottom.

### What was wrong, and what it is now

LAUNCH DID NOT LAUNCH. It checked two files existed and printed `ready`. It spawned no agent, which is the one thing req-one-command-starts-an-unattended-machine demands, graded fatal. It now places the cage at `project/.claude/settings.json`, probes the agent command, and spawns it with the briefing. It refuses by name when there is no agent to start.

ADOPT DID NOT CLAIM. It ran `git rev-parse` and printed that the branch was present, which claims nothing. Two machines given one iteration id would both have started walking. It now calls `claimIteration` and refuses when another machine holds it, naming the holder and the time.

THE DETACH MEASUREMENT DID NOT REPRODUCE. The experiment recorded a caller held for 45,600 ms. Re-measured at 74 ms, against a child living 20 seconds. The first run timed the lane runner around the parent, which waits on the child it inherited. Three numbers came out of one process and only the middle one belonged to the parent.

Four artifacts were built on the retracted number and all four are corrected: the platform split, a test skipped on Windows, a line in the cloud-runner card, and a constraint in the design spec. The experiment node carries both numbers and the diagnosis.

`--root` WAS HONOURED BY THREE STEPS AND IGNORED BY TWO. So `--root <fresh dir>` cloned there and then started the lane on the entrypoint's own tree. The flag is cut. The root is derived from the entrypoint's own location, and `--repo` is now checked against origin rather than pretending to clone a repository this file already lives in.

THE STEP ORDER CONTRADICTED THREE SPEC NODES. The code ran fetch before start. The requirement, the element and the design spec all say start, wait, then fetch. The code was wrong and now runs the spec's order.

### The tests that could not fail

THE SKIP SUPPRESSED A CASE THAT PASSES. It skipped on Windows citing the retracted measurement, so the iteration's one load-bearing assertion executed on no platform at all. The skip is gone and the case passes here.

THE DETACH TEST DID NOT TEST THE CODE. It re-declared the spawn options as a string literal, so changing the real spawn left it green. The options are exported from the entrypoint and the test imports them.

THE STEP-NAME TEST COULD NOT FAIL FOR A MISSING STEP. It asserted only that no failure named a stranger, so deleting six of the seven steps kept it green. It now checks both directions.

THE RUNTIME FLOOR ASSERTED 23 AGAINST A PIN OF 24, so the pin could be dropped a whole major and the test stayed green. It tracks the pin now.

FOUR CASES WERE ADDED, all executing the entrypoint rather than reading it: a usage error exits 2 without wearing a step's name, and verify refuses a checkout whose origin is not the repository asked for.

### Runs

- unattended-start: 8 cases timed, 8 pass, 0 fail, 0 skip.
- confirm pass over the entrypoint and the trace corpus: 64 cases timed, 64 pass, 0 fail.
- typecheck: exit 0, after `@types/node` moved from ^22 to ^24 to match the pinned runtime.
- voice lint on the cloud-runner card: 0 findings.

A GREEN IS READ AS A CASE COUNT, never an exit code. note-ae6265b74821 records that a scoped run over an empty scope answers ok, so every number above is a count of cases that actually ran.

### What stands, and why it is not fixed here

NINE TEST SPECS, NINE OWED. Five need a machine or a live session nobody can make from here. Three demand a corpus-wide sweep no command performs, which is now raid-issue-the-corpus-wide-inspections-have-no-runner. One needs a screen, which needs the person's permission per session.

THE SIGNED BUILD EVIDENCE MISCOUNTS ITS OWN TEST FILE. chunk-the-seven-steps.md says three cases where the file held four. It is signed, and the miscount changes no verdict. Left standing rather than amended.

FOUR VOICE FINDINGS STAND IN GUIDANCE, none in a file this iteration wrote. They belong to note-70c755925b31, which is i25's opening debt.

THE POSIX BRANCH HAS STILL NEVER RUN. Every machine that has run this engine was Windows. Whether a POSIX host reaps the lane with its session is the half of the assumption this iteration could not answer.
