---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
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
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: branches-and-pull-report-truly
step: do
record:
  - step: do
    hand: box 8339730da099 · claude-code-remote
    hash_before: 526194ecc88177b3208dbcd0f5e8578bd3ea2fde
    hash_after: 526194ecc88177b3208dbcd0f5e8578bd3ea2fde
    answered:
      - name: tests
        exit: 0
        said: green, src/branches passes
      - name: check
        exit: 0
        said: "   94.5  in all"
    inputs:
      - name: ask
        hash: 8bdfdf31d38f2a5b
        size: 445
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
gain: a parked note keeps its todo-tag edits whether the switch lands or refuses.

<!-- breaks, as text: what breaks if it is never done -->
breaks: `onBranch` in `src/branches/take.go` restores every parked note to HEAD before the switch, and writes the saved texts back only after a switch that lands. A refused switch loses the edits under take, beat, free and done.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
done_when:

- `go test ./src/branches/ -run TestARefusedSwitchKeepsTheParkedNotes` passes
- `./RUNME.sh check` answers 0 on this box

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh branch test src/branches/port_a_take_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

`onBranch` in `src/branches/take.go` restores each parked note to HEAD before the switch, and wrote the saved texts back only after a switch that landed. A refused switch lost the todo-tag edits under take, beat, free and done. A deferred write now puts every parked note back on both roads.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: a parked note keeps its edits whether the switch lands or refuses
- the change reveals no cleanup
- the fact stands once: the deferred write in `onBranch` alone puts the notes back

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
