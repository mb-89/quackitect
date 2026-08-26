---
form: verification
judgment: passed at 2026-08-26T15:06:38.631Z with deliverable/engine/bin/battery.ts@dcc3f61899f0
by: agent
signed_off: 2026-08-26T14:46:06.516Z
authors: agent
files: null
---

# Evidence form / verification

## current_situation

FRESH EYES OBSERVED ALL SEVEN INSPECTION ITEMS GREEN, in a second round against the deltas, with a quote behind each verdict.

The two that failed in round one are fixed and confirmed:

- ONE PLACE HOLDS EACH RULE. `doors.ts:165` carries the only departure-line regex in the regime, module-private, one occurrence. `doorguard.ts:6` imports it. The tester read all 133 lines of the guard and found no regex except a path-separator normaliser.
- EACH DOOR STATES ITS COVERAGE LIMIT. `doors.ts:52` names both blind spots, and `deliverable/machines/doors.md:42` says the same in the list a person reads.

Eleven round-one findings are closed. One is fixed in the code and reaches no test.

### The tester retracted one of its own findings

It reported `dsp-the-departure-list.md` missing. It globbed `spec/trace/**/*door*.md`, and that name carries no "door", so the search could not have found it. Retracted on its own reading.

The other half of that finding stands: `deliverable/engine/bin/sweep.ts:1` cites `dsp-write-guard.md` while `dsp-the-door-sweep.md` claims the file.

### Four regressions this round introduced, and one is serious

THE POOL GUARD AT A CHOKEPOINT BREAKS A LEGITIMATE PATH. Folding `guardNoSecondDoor` into the shared function was the wrong half of a right idea. `pool.ts:121` refuses any path under `spec/trace/work-token/` with no escape at all, and `fileReplace` checks every staged file before writing any. So a corpus-wide id rename over `spec/**/*.md` — the job `se_file_replace` exists for — now fails whenever one work token cites the old id, and the remedy handed back is a note drain, which cannot rename a citation.

Nothing was gained against the risk it guards: `pool.ts:248` mints with `writeNode` directly, outside the file lane, and always did.

THE MOVE'S SECOND PHASE IS STILL UNGUARDED. `move.ts:121` guards the destination and `move.ts:146-196` then rewrites every referencing file in the tree through `writeNode`, with no guard and no bound on how many.

A DIRECTORY MOVE NOW THROWS `EISDIR`. `move.ts:121` reads the source before the rename, and `existsSync` is true for a folder. `renameSync` handled it before; the caller now gets a raw error with no remedy.

BOTH REFUSALS HAND BACK AN UNAPPLIABLE REMEDY. Each patches with an exact-match `old_string`, and `- deliverable/engine/doors.ts` is a strict prefix of the standing declared line. Two occurrences, so the patch refuses — for the commonest case of all, a path already listed and its reason dropped.

### The extension of the widget guard was correct

`widgets.ts:154` carries an already-emits escape read from disk, so every file that emits today stays editable through every verb. Only a write that turns a quiet module into an emitter is newly refused, which is the rule.

### Three cases claim more than they check

The no-copy case asserts one literal string, so a restatement as `new RegExp(...)` or a hand-parse passes it. The empty-tree case asserts the two primitives, both of which were already true before the fix — that WAS the bug. And nothing tests that `doorguard.ts` imports no filesystem, which is fix three's whole property.

### The chokepoint has no test at all

A search of `deliverable/tests` for `guardWriteContent` returns zero. The fix to the largest finding rests entirely on reading.

## claims

- [x] tsp-the-door-regime-s-static-attributes

## follow_up

### Into fix-findings, and the first three are regressions this round made

1. TAKE `guardNoSecondDoor` BACK OUT of the shared guard, or give it the escape the emitter guard already has: refuse a write that creates a token or changes its minted fields, allow one that only rewrites a reference inside an existing token. As it stands a corpus-wide rename refuses on the wrong grounds with an unrelated remedy.
2. GUARD THE MOVE'S SECOND PHASE. `move.ts:146-196` writes an unbounded number of files with no content guard.
3. A DIRECTORY MOVE MUST REFUSE TYPED, not throw `EISDIR`. Read the source only when it is a file, and hand back a remedy.
4. MAKE BOTH REMEDIES APPLIABLE. An exact-match `old_string` that is a prefix of a standing line is ambiguous. Anchor it to the whole line.

### Then the tests, because three of them claim more than they check

5. The no-copy case is a tripwire for one literal. Assert the property instead, or assert both callers IMPORT from the rule module — which is item four's own promised support and is `NOT BUILT YET`.
6. The empty-tree case asserts two primitives that were already true before the fix. Assert what the fix actually changed: that the sweep prints UNCHECKED and exits non-zero.
7. Nothing tests that `doorguard.ts` imports no filesystem. One grep beside the existing one makes fix three a standing property.
8. NOTHING REACHES THE CHOKEPOINT. Two short cases close it: `filePatch` on a quiet engine module in a temp root, and `filePatch` on `doors.md` with a bare bullet.
9. Item one's promised grep for a rule-count-zero path is `NOT BUILT YET`. `note-a9ace5007f7c` holds both it and item four's, drafted.

### Then the numbers, and the rule this record just wrote applies to them

82 engine modules reach the disk conversation, counted independently by the tester with the door's own predicate. `note-001678f78d53` holds my own count and why the earlier 81 and 82 were both right hours apart.

These are stale as LIVE claims and are wrong by one:

- `deliverable/tests/doors.test.ts:220` — "81 modules reach disk today".
- `spec/trace/design-spec/dsp-the-door-refusals.md:41` — the same sentence.

These are NOT stale and stay, because they record a measurement rather than a live count: `dsp-the-door-rule.md:90` and `dsp-the-departure-list.md:79`.

AND THE BETTER FIX IS DELETION, by this round's own argument. `deliverable/machines/doors.md:44` now says a number typed in prose goes stale the first time somebody adds an import. `sweep.ts:111` and `guidance/refusals.md` § SE-C-149 both still carry one, and `sweep.ts` is a file this round already changed.

### Smaller, all named with their line

- `sweep.ts:1` cites the wrong design spec.
- `sweep.ts:139` hardcodes the list path while `departureFile` is exported.
- `doors.test.ts:57` calls `entryPoints()` with no root, against whatever tree the engine sits in.
- `doors.ts:185` ends a section at a `## ` inside a code fence.
- The marker string is written by hand in five fixtures, and `MARKER` became exported this round.
- `.github` is walked for `.yml` only, and `RUNME.ps1` is hardcoded.
- A test fixture naming a real `bin/` path now marks it invoked.

### One figure nobody should lean on yet

The tester counted about 180 governed engine modules by eye against the specs' 178. The eight-module falsification margin at `dsp-the-departure-list.md:81` survives either denominator, and the count wants a script before anyone rests on it.

### Not this record's, and captured rather than carried

- The drift access ceiling does not scale with the state count while the honest cost does. `note-9d697da7ff83` holds the evidence.

### For the retro, both about this machine

- `note-86838fa04ab0`: the work account prints `se_run {job}` as the way to read a subagent, and verification refuses that exact call. The state whose card demands a tester cannot hear it. `se_answer` is refused there too, so a question the owner asks mid-verification cannot be recorded where the rule says it must be.
- `note-e76110c5cd0e`: a cloud box cannot reach its subagent's partial output through any door at all.

## anything_else

### What this round found and fixed, nine files

`note-49079bed7866` holds the patch as it was written out before it was applied.

**THE DEPARTURE LINE SHAPE WAS WRITTEN TWICE**, and that is the failure this whole record is about, committed inside the record.

One `DEPARTURE` pattern now stands in `deliverable/engine/doors.ts`. `departureLines` is exported and both callers read it. `doorguard.ts` holds no regex for a departure line, and a case asserts that by reading the file.

The reason stays OPTIONAL in the parser on purpose. The guard has to SEE a reasonless line in order to refuse it, so a parser that dropped one would force the guard to keep its own copy.

**A SECTION WITH NO MARKER READ BULLETS IT SHOULD NOT.** `indexOf` returned -1 and the slice started 43 characters into the section rather than nowhere. `sectionLines` now collects only after the marker is seen.

**A HEADING THAT PREFIXED ANOTHER MATCHED THE WRONG SECTION.** The match is exact now, which is what the departure list already stated as a property of itself.

**THE REASON GUARD ONLY EVER CHECKED THE FIRST DOOR.** Every door shares one file, so `DOORS.find` always returned the first and a second door's reasonless departures would pass entirely. `listedDoors` is plural.

**THE ALREADY-REACHES ESCAPE WAS EVALUATED FOR ONE DOOR AND RETURNED FOR ALL OF THEM.** A file already reaching door A would carry a brand-new reach to door B straight past the guard. The escape folded into the predicate, per door.

**THE GUARD THAT ENFORCES THE DOOR WALKED PAST IT.** `doorguard.ts` imported `node:fs` and read the file on disk. It is engine source, it held the conversation, and no departure declared it. The on-disk question moved into the rule module, which is already declared. The guard imports no filesystem at all now, and the measurement at `note-001678f78d53` confirms it is gone from the reacher list.

**A BULLET THE PARSER COULD NOT READ WAS SILENT.** A line naming `thing` rather than `thing.ts` matched nothing: not honoured, not refused, no error. That is the fourth equivalence class the test spec names and had no case for. It is refused now.

**THE SWEEP PRINTED GREEN ON A TREE IT NEVER LOOKED AT.** `dsp-the-door-sweep` forbids that by name and the door rule repeated it anyway. `governedCount` says how many files a rule actually saw, and the sweep reports UNCHECKED and exits 1 on a zero.

That was also the closest thing to the off-switch the record forbids. The root is caller-supplied, so a typo in it emptied every rule's findings at once with no error.

**THIRTEEN OF TWENTY-NINE ENTRY POINTS MARKED THEMSELVES REACHED.** Every entry point is engine source, so its own usage comment sat in the corpus. A dead script keeps its usage comment, which is the one thing that check exists to find. A file no longer reaches itself.

### Why the checklist did not reach any of this

The doubled regex is a straight miss. The checklist item names restated regexes and I did not apply it to my own file.

The guard's own undeclared reach is a different miss. The checklist asked whether the rule is expressed once. It never asked whether the rule HOLDS against the modules that implement it.

### The test-design finding, stated correctly

AN EARLIER DRAFT OF THIS FORM SAID THE TEST SPEC DID NOT USE FAULT-BASED METHODS. That is wrong, and reading `tsp-the-door-rule-refuses-and-reports` settles it.

Its Approach section names FAULT-BASED for the enumeration, by name, and injects an entry point to prove it. What it gave the departure list was equivalence classes and boundary values.

SO THE METHOD WAS CHOSEN PER DEMAND, and the demand carrying the record's whole differentiator got the weaker pair. Every one of the four defects hid in exactly that half: a missing marker, a second door, a malformed bullet, an empty root.

That is a sharper finding than "the spec used the wrong methods". The spec knew about fault-based design and spent it on the demand that needed it least.

Seven fault-based cases now stand beside the original eighteen.

### Two stale sentences in that spec, for fix-findings

Its step list cites "the six names `deliverable/tests/help.test.ts:24` lists today". That list is gone; the guard enumerates from the tree. The property still holds and the sentence does not.

It also says "the existing 81". A hand-written count inside a spec, which is the same defect this record removed from the departure list's prose.

### One risk this round takes deliberately

The single guard function carries the pool guard and the widget guard as well as the two door refusals. Those two were also whole-file-write-only, which is the same hole in two more rules.

So patch, replace and move ask them for the first time. A battery red on a pool or widget case is a hole that was already there, not a break this round made.
