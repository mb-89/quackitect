---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: failures-and-the-sentinel/gate
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
group: failures-stand-registered
parent: failures-and-the-sentinel
record:
  - step: do
    hand: box 83c32b2b4d58 · claude-code-remote
    hash_before: 72a5d017390b91fd26973cc55c90ee14ae1fa390
    hash_after: 128efabc533b21c4d4f64ff0154dc17aa1e36bcf
    answered:
      - name: tests
        exit: 0
        said: green, src/failure passes
      - name: check
        exit: 0
        said: "  117.6  in all"
    inputs:
      - name: ask
        hash: b5124d23e41f697c
        size: 201
    def: 16e0bdd9a976b893
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

src/quack/refusals_test.go keeps its own refusalsPast map beside failure.Moved, which tree_test.go reads through DoorFaults; fill Moved, and let the red case read it, so one place names the moved files

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/failure/check_test.go src/failure/tree_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

failure.Moved in src/failure/check.go now names the moved places: the src/pull folder, src/branches/take.go and src/quack/verb_mint.go, each with the refusal call it held before the move. DoorFaults reads a place as a file or as the files directly in its folder, and a new case covers the folder. The red case TestMovedRefusalsPassTheFailureDoor in src/quack/refusals_test.go drops its own refusalsPast map and reads failure.Moved through failure.DoorFaults, so one place names the moved files. The duplicate tree case in src/failure/tree_test.go leaves, since the check leaves the red list out and that case would turn the check red until the pull and take tickets land. The design note names where the case runs.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: Moved is filled and the red case reads it; the tree case leaves because it repeats the red case outside the red list
- the cleanup the change reveals is in the change: the duplicate tree case leaves, and the design note says where the case runs
- every fact stands in one place: the moved places stand in failure.Moved alone, and the design note points at the file

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
