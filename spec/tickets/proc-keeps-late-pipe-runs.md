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
    hash_before: 96c76eae128f0f248e145f83bab3b20dec04808d
    hash_after: 91c934750f572ca9bb22aa064e0ec31b2b31c099
    answered:
      - name: tests
        exit: 0
        said: green, src/proc passes
      - name: check
        exit: 0
        said: "   59.9  in all"
    inputs:
      - name: ask
        hash: fe738edbfa495dc4
        size: 387
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
gain: a run that exits zero while a descendant holds its pipes answers its code and its output.

<!-- breaks, as text: what breaks if it is never done -->
breaks: `runUnder` in `src/proc/proc.go` reads `exec.ErrWaitDelay` as a failed start, so a run starting a background child reports `NotStarted` and loses its output.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
done_when:

- `go test ./src/proc/ -run TestARunWhoseChildHoldsThePipeAnswersItsCode` passes
- `./RUNME.sh check` answers 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh test src/proc

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

`runUnder` in `src/proc/proc.go` reads `exec.ErrWaitDelay` with a process state as the run exit, so a run exiting zero while its child holds the pipes answers code 0 and its output, where it answered `NotStarted` with none before. The generic fault keeps the output read so far. `TestARunWhoseChildHoldsThePipeAnswersItsCode` failed red on the live fault and passes now. It runs on the real runner alone, since the fake holds no pipes, and the ratio guard holds the package at its code lines.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the fix sketch
- the case stands small enough for the ratio guard
- the wait-delay rule stands in `runUnder` alone

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
