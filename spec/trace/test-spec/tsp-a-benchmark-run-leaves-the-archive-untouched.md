---
minted_in: i37-training-iterations-a-disposable-iterati
id: tsp-a-benchmark-run-leaves-the-archive-untouched
type: "[[test-spec]]"
statement: A bound benchmark run changes no bytes of the iteration it re-walks, mints no records, and adds nothing to the survey's counts.
method: inspection
verifies:
  - req-a-benchmark-run-modifies-no-record-and-appears-in-no-survey
files:
  - none — the checklist below is the whole definition; what it examines is the state of a tree and a count, not the behaviour of a running system
---

## Scope

THE DISPOSABILITY PROPERTY, examined as a static attribute of the tree and the
counts after a run rather than as behaviour during one.

WHAT IS DELIBERATELY OUT. Whether the run produced a useful measurement. A run
that measured nothing and touched nothing passes this inspection, correctly.

## Approach

DESIGN METHOD: inspection rather than test, because the claim is about ABSENCE
across a whole tree. A test asserts what happened at the points it looked; an
inspection examines the tree itself and cannot miss a place nobody thought to
assert about.

WHY THIS METHOD AND NOT A TEST, said plainly because the choice is arguable.
The requirement's failure mode is a write SOMEWHERE UNEXPECTED. Enumerating the
expected write sites and asserting none fired is exactly the mistake — it proves
the guard holds where somebody already thought about it.

DEPTH: high. This is the property the owner's ruling rests on. `does not count
toward normal iterations` is only TRUE rather than CLAIMED if the counts are
examined.

## Checklist

Each line names an attribute and its pass criterion.

- THE RE-WALKED ITERATION'S FOLDER. `git status --porcelain` over
  `spec/iterations/<the re-walked id>/` is empty after the run. PASS:
  zero lines.
- THE WHOLE SPEC TREE. `git diff --stat` between before and after the run names
  no file under `spec` outside the benchmark reports folder. PASS: zero
  such files.
- THE ITERATION NUMBERING. The highest `i<n>` under `spec/iterations`
  is the same before and after. PASS: unchanged. This is what `itSeed` numbers
  from, so a run that consumed a number would be visible here and nowhere else.
- THE SURVEY'S COUNTS. `se_survey`'s open, seeded and shipped counts are
  identical before and after. PASS: all three unchanged.
- THE RECORD COUNT. The number of `record.md` files under
  `spec/iterations` is unchanged. PASS: equal.
- WHAT THE RUN DID LEAVE. Exactly one new file, under the benchmark reports
  folder. PASS: one, and it is the filled report. An inspection that finds ZERO
  new files FAILS — a run that recorded nothing is not a clean run, it is a lost
  one.
- THE MACHINE-LOCAL STORE. `.se/` may change freely and is not examined. NOTED
  rather than checked: it is untracked by design and a cloud box is reclaimed,
  which is the whole reason the report is committed.
