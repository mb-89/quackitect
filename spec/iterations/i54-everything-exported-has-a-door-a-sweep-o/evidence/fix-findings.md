---
form: fix-findings
judgment: passed at 2026-08-26T15:04:15.170Z with deliverable/engine/bin/battery.ts@dcc3f61899f0
by: agent
signed_off: 2026-08-26T14:59:11.909Z
authors: agent
files: null
---

# Evidence form / fix-findings

## current_situation

Six fixes landed in one pass, across seven files. Four of them are regressions this record made and fresh eyes found.

### The three the battery itself named

The prompt layer is stale, because this record added two clause sections to `guidance/refusals.md`. IT CANNOT BE FIXED FROM HERE: `se_prompt_place` is refused at fix-findings, at verification and at build-steps with SE-C-110, and running the script through the shell would be working around a refusal with another lane. Captured as `note-bad426c8c8f1`.

The drift access ceiling is not this record's. Its ceiling is a constant calibrated at 25 claimful states and the matrix now yields 35. `note-9d697da7ff83` holds the evidence and says why two data points cannot recalibrate it.

The help ratchet read 12 and measured 17. A wrong constant, not a wrong guard: I wrote 12 from the count of failing FILES and the ratchet counts FINDINGS. Fixed, with the comment saying so.

### The four regressions, all mine, all found by fresh eyes

THE POOL GUARD AT A SHARED CHOKEPOINT BROKE A LEGITIMATE PATH. I folded `guardNoSecondDoor` into the guard every write verb calls. It refuses every path under the pool with NO escape, and `fileReplace` checks every staged file before writing any — so a corpus-wide id rename over `spec/**/*.md`, the job that verb exists for, failed whenever one work token cited the old id. The remedy handed back was a note drain, which cannot rename a citation.

Nothing was gained against the risk it guards: the mint writes with `writeNode` directly, outside the file lane, and always did. It is back on the whole-file write alone, with the measurement written where it stands.

THE MOVE'S SECOND PHASE WAS STILL UNGUARDED. I guarded the destination and left the reference rewrite, which walks the whole tree and writes an unbounded number of files. Guarded now.

A DIRECTORY MOVE THREW `EISDIR`. Reading the source before the rename broke a case `renameSync` had handled. It refuses typed now, with a remedy.

BOTH REFUSALS HANDED BACK AN UNAPPLIABLE PATCH. Each matched `- <path>` unanchored, and that is a strict PREFIX of the same path already declared with its reason — two occurrences, so the patch refused as ambiguous, for the commonest case there is. Anchored to the whole line.

### Seven cases where there were three

Three of the old ones claimed more than they checked, which fresh eyes caught and I had not.

- The no-copy case asserted ONE literal string, so a restatement as `new RegExp(...)` or a hand-parse would have passed a case named for the property. It now checks seven shapes.
- The empty-tree case asserted two primitives that were BOTH ALREADY TRUE before the fix. That was the bug. It now spawns the sweep and demands UNCHECKED and a non-zero exit.
- Nothing tested that the guard imports no filesystem, which is the whole property of moving the on-disk question into the rule module.

And the two the inspection spec PROMISED and never had: a grep for a path that empties the door table, and an assertion that both callers import from the rule module. A spec claiming a check it does not have is worse than one claiming none, because a reader takes the sentence as evidence.

### The counts are gone from the places that go stale

82 engine modules reach the disk conversation, counted twice independently. Four hand-written copies of that figure stood in code, in a clause and in a spec; two of them said 81 while the tree held 82.

All four now name the sweep and carry no number. The two that record a MEASUREMENT rather than a live count stay, because they are dated evidence rather than a claim about today.

## follow_up

### One thing this state cannot do

THE PROMPT LAYER STAYS STALE. `se_prompt_place` is the remedy preflight names, and it is refused in every state this record has stood in. `note-bad426c8c8f1` says which three were checked and that the rest were not enumerated.

Somebody with a state that grants it, or a person outside the lane, closes this in one call.

### Registered, and deliberately not widened into

- 17 findings across 11 entry points break the help rule, in eleven files this record does not otherwise touch. Registered at `raid-iss-eleven-entry-points-parse-a-switch-their-help-never-mentions` with every one named. The ratchet holds the count and may only fall.
- Around eighty modules reach the disk conversation with no departure declared. That is the ratchet gap, and moving them is a record of its own.
- Four entry points are invoked by nothing. Each needs a door, a deletion, or the invocation somebody forgot.

### Smaller, each named with its line, none load-bearing

- `deliverable/engine/bin/sweep.ts:1` cites `dsp-write-guard.md`, while `dsp-the-door-sweep.md` claims the file.
- `sweep.ts` hardcodes the departure list's path in a message while `departureFile` is exported.
- `deliverable/tests/doors.test.ts:57` calls `entryPoints()` with no root, against whatever tree the engine sits in.
- `doors.ts` ends a section at a `## ` inside a fenced code block.
- The marker string is written by hand in five fixtures, and `MARKER` became exported this round.
- `.github` is walked for `.yml` only, and the root bootstrap script is hardcoded by name.
- A test fixture naming a real `bin/` path now marks it invoked.

### Two the fix round could not close

`governedCount` and `reachers` both walk `deliverable/engine` and then filter by the door's own `covers`. A door governing any other folder counts zero on a FULL tree, and the sweep would call it UNCHECKED forever.

That is this record's own theme again: the table takes four conversations and two of its walkers know where only the first one lives. The fix is a `roots` field on the door beside `covers`. It is a change to the door type and belongs in the record that adds the second door.

The already-reaches escape now reads the file once per candidate door rather than once per write. With four doors that is four reads of one file. Within the budget the design spec sets, and worth knowing before door two.

### For the retro, all four about this machine

- `note-a71bef4acbff`: the leaving judgment reports a verdict and keeps none of the output that explains it. The state that receives the failure is this one, whose whole law is to collect every finding.
- `note-bad426c8c8f1`: preflight names a remedy that fix-findings may not call.
- `note-86838fa04ab0`: the work account prints `se_run {job}` as the way to read a subagent, and verification refuses that exact call.
- `note-e76110c5cd0e`: a cloud box cannot reach its subagent's partial output through any door at all.

## anything_else

### The chokepoint, verified by reading the call sites after the fix

Five calls across four verbs, and the pool guard on one of them.

- `deliverable/engine/files.ts:491` — the whole-file write.
- `deliverable/engine/files.ts:677` — the replace, per staged file.
- `deliverable/engine/files-patch.ts:277` — the patch, per file in the batch.
- `deliverable/engine/move.ts:136` — the move's destination.
- `deliverable/engine/move.ts:185` — the move's reference rewrite, which was the unguarded one.

`guardNoSecondDoor` is called ONCE, at `files.ts:490`, immediately before the shared guard on the whole-file write. That is where it stood before I widened it and where the measurement says it belongs.

A case now asserts the three write modules call the shared guard, so a call site deleted is caught. It does not catch a guard that stops refusing, and the comment above it says so rather than implying otherwise.

### What the door rule reports now, and what moved

The sweep reports 80 undeclared reaches where it reported 81. One module left the list: the guard that enforces the door stopped reaching disk, which is the third fix showing up in the count rather than in an assertion.

The unreached-entry-point list changed COMPOSITION, not just length. Two files left it and two arrived once a file stopped certifying itself with its own usage comment. That is the fourth fix showing up the same way: the old list was wrong in both directions, not merely short.

### Two things I got wrong and a reader should not inherit

AN EARLIER DRAFT SAID THE TEST SPEC DID NOT USE FAULT-BASED METHODS. It did, by name, for the enumeration. What it gave the departure list was equivalence classes and boundary values, and every one of the four defects hid in that half. The spec knew the technique and spent it on the demand that needed it least.

AND FRESH EYES REPORTED A DESIGN SPEC MISSING that is not missing. The glob was `spec/trace/**/*door*.md` and the filename carries no "door", so the search could not have matched it. Retracted on both sides.

BOTH ARE THE SAME LESSON. A search that cannot find a thing and a thing that is not there look identical from the caller's side, and only the search string tells them apart.

### The verdict this round rests on

The battery ran three times across the round. 1890 cases at the start, 1902 after, with seven new door cases and five replaced.

Every new case passes, including the one that spawns the sweep against an empty tree and demands a non-zero exit. That is the case testing the fix rather than the primitive behind it, and it was the one most likely to fail for a reason unrelated to the defect.
