---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: test-walks-move-onto-fakes/gate
    by: anyone
    to: retro
    input: ask
    tags: ["code", "testing"]
    needs: ["branch test"]
    checklist: ["the change follows the ask, or the discussion says why it departs", "the cleanup the change reveals is in the change, or is a note of its own", "every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
    evidence:
      - name: tests
        form: command
        expects: green
        says: the tests that cover the change, or the check where it touches no code
      - name: check
        form: command
        expects: 0
        says: the check is green on the commit
      - name: says
        form: text
        says: what changes and why, for a reader who was not there
point: gate
todo: false
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: doors-declare-what-they-own
parent: test-walks-move-onto-fakes
record:
  - step: do
    hand: box dcf1ea3c64fd · claude-code-remote
    hash_before: 1b57d212787901381b8167a7c0926dd3e1fa1d0f
    hash_after: 2a4fbf08d2cfbb1624b1fe82c0e8feccd826b48a
    answered:
      - name: tests
        exit: 0
        said: green, src/imports passes
      - name: check
        exit: 0
        said: "   63.0  in all"
    inputs:
      - name: ask
        hash: 8711a9c2577417a0
        size: 328
    def: 16c92ada996c9f36
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the family table of spec/design_output/doors.md names src/quack/check_twins_test.go and src/quack/golden_test.go in the twins and goldens row, and dead-go-goldens-leave deleted both in 09e8b38e2. The row names only files the tree holds, or leaves, and the check that reads these code spans refuses a name with no file behind it.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/imports/clock_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The twins and goldens row of spec/design_output/doors.md named two test files that an earlier commit deleted. It now names src/quack/codec_test.go alone. StaleSpans in src/imports/clock.go names each audit span holding a folder that matches no file under src. The tree case in clock_test.go refuses such a span, and it went red on the two dead names before the row changed. A bare suffix the prose names holds no folder, so the guard reads it as no path.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: the row names a standing file alone, and the check refuses a span with no file behind it.
the cleanup this change reveals is in it: the guard met one prose suffix span, and it now skips a span holding no folder.
the audit spans stand in doors.md once, and the guard reads them there through the one span pattern UnauditedWaits uses.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
