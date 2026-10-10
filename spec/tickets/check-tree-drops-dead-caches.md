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
    hash_before: bdd4bf74735d9817e386b60c8c0f0e86685c3e5c
    hash_after: 0fefa71526f973098164bfc6bce392d225cd84b0
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/check passes
      - name: check
        exit: 0
        said: "   65.2  in all"
    inputs:
      - name: ask
        hash: 6c3755de4bacea9b
        size: 434
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
gain: the check's `Tree` carries only the state a sweep reuses, so a reader meets no cache that never hits and no method nobody calls.

<!-- breaks, as text: what breaks if it is never done -->
breaks: each sweep pays for keys nothing reuses, and `Drops`, `Pulls`, `Changes` and `ErrNoIndex` stand with no caller, which a reader takes as live.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
done_when:

- `go test ./src/modules/check/` passes
- `grep -rnE 'ErrNoIndex|ruleFound|copyFound' src` names nothing
- `./RUNME.sh check` answers 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh test src/modules/check

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Each front builds a fresh `Tree` per sweep, and the sweep runs each pass once, so the restated slot, the guidance-pair key and the Go-body hash go with `keyedOnce`. `Drops`, `Pulls`, `Changes` and `ErrNoIndex` had no caller and go. `parses`, the doors memo and the path list stay. `TestASecondSweepReadsTheBufferThatAddsACopy` pins that a second sweep reads a changed buffer.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the fix sketch
- the lsp design note drops the guidance-pair row
- the memo the tree keeps stands in one table

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
