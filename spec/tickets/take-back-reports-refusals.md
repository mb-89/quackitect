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
    hash_before: baff54e4631655bb77eede014e6a8f48d2d488b0
    hash_after: 83920b00ed66bf0e5fc1f0e8c7e7dc7e5609b7dd
    answered:
      - name: tests
        exit: 0
        said: green, src/pull passes
      - name: check
        exit: 0
        said: "   95.0  in all"
    inputs:
      - name: ask
        hash: f8341243fadc372b
        size: 402
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
gain: a take-back the commit refuses names the refusal, and the leaf stays where it stands.

<!-- breaks, as text: what breaks if it is never done -->
breaks: `takeBack` in `src/pull/pull.go` drops the result of `landed`. A refused landing still pushes and prints that the leaf stands open again, while the ticket on disk stays shut.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
done_when:

- `go test ./src/pull/ -run TestARefusedTakeBackSaysTheRefusal` passes
- `./RUNME.sh check` answers 0 on this box

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh branch test src/pull/pull_back_engine_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The take-back now reads the answer of its landing. A refused commit refuses the take-back with the rows the hook names, pushes nothing, and leaves the ticket as it stands. The rows under the refusal line come from refusedRows, which unlandedRows shares.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the named test passes, and the check answers 0
- the cleanup the change reveals: unlandedRows and the take-back share refusedRows
- every fact stands in one place: the refusal rows live in refusedRows alone

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
