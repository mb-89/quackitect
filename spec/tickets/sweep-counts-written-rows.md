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
group: checks-and-index-read-right
step: do
record:
  - step: do
    hand: box f689bbb375f6 · claude-code-remote
    hash_before: d285ba815a47285702e93ce83413f36df0ae181b
    hash_after: e6b1f926864f4b6c68ae4ce6a2e5bca3a4f86fdd
    answered:
      - name: tests
        exit: 0
        said: green, src/index passes
      - name: check
        exit: 0
        said: "   59.5  in all"
    inputs:
      - name: ask
        hash: 5980c1cccbc35555
        size: 389
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
gain: a sweep counts a path as moved only where it writes a row, so an unreadable file or a linked folder wakes nobody.

<!-- breaks, as text: what breaks if it is never done -->
breaks: `refresh` in `src/index/sweep.go` counts an entry the read fails on, so each sweep ticks the changes call over a tree that holds still.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
done_when:

- `go test ./src/index/ -run TestASweepOverAnUnreadableEntryMovesNothing` passes
- `./RUNME.sh check` answers 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh test src/index

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

`one` in `src/index/index.go` answers whether it wrote a row, and `refresh` in `src/index/sweep.go` counts that, so an entry the read fails on, a linked folder among them, moves nothing. A known file the read now fails on drops its row once, so the next sweep finds nothing to move. `TestASweepOverAnUnreadableEntryMovesNothing` failed red, moving one on a still tree, and passes now.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the fix sketch first form
- a known file going unreadable counts one move, once
- the written-row answer stands in `one` alone

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
