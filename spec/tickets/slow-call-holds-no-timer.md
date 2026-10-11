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
    hash_before: 753d678c32d20e7a06806607f771c7d25f7c654a
    hash_after: 8006ee3ffd02427922026420677685489f911e41
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/index passes
      - name: check
        exit: 0
        said: "   59.3  in all"
    inputs:
      - name: ask
        hash: 2f5d8beea6a8ecb0
        size: 514
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
gain: the slow-call case decides on its own order of events, so a loaded runner reads it green.

<!-- breaks, as text: what breaks if it is never done -->
breaks: `TestASlowCallAnswersStillRunningWithItsHandleAndFraction` in `src/modules/index/call_test.go` races a wall timer against the run goroutine, and a late goroutine reads a fraction of zero.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
done_when:

- the case fires the book's `after` seam once progress stands, and arms no wall timer
- `go test -race -count=50 ./src/modules/index/ -run 'TestASlowCall|TestAQuickCall'` passes
- `./RUNME.sh check` answers 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh test src/modules/index

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

`TestASlowCallAnswersStillRunningWithItsHandleAndFraction` hands the book an `after` seam it fires once the first request stands done, and `awaits` reads the book moves in place of a wall wait. The quick call arms a seam that never fires, and the expired-writer case waits through `awaits` too. `go test -race -count=50` over the two named cases passes, and `-count=20` over the package passes.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the fix sketch through the book seam
- the wait helper stands in `awaits` once
- no case in the call tests arms a wall timer for its order of events

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
