---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: module-processes-switch-over/accept
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
group: module-processes-switch-over
parent: module-processes-switch-over
record:
  - step: do
    hand: box 09eeff3afa7c · claude-code-remote
    hash_before: 946de768681040a16692d2a02dcb827892edc025
    hash_after: f4f3dcd497bbb3b157eb8f9a00e501685c29855f
    answered:
      - name: tests
        exit: 0
        said: green, src/index passes
      - name: check
        exit: 0
        said: "src/index/placements_test.go:258:31: Antithesis: Say what is. 'never' opens a half that says what the thing is not."
    inputs:
      - name: ask
        hash: edca01aa8e8d4ff5
        size: 153
    def: 0d4f9b5a406ad30a
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

Settle in src/index/procs.go starts its timer before it computes the deadline, so a timer firing in that gap leaves the wait with no broadcast to wake it

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/index/placements_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Placements.Settle in src/index/procs.go took its deadline off the clock after it started its timer. A timer firing in that gap broadcast before the deadline passed, and the reader then waited on with nothing left to wake it. The timer now sets a flag under the lock it wakes, and the wait ends on that flag, so no clock read stands between the two. The gap spans nanoseconds, so no case turns red on it reliably. TestASettleOnASilentProcessEndsAtItsWait runs two hundred short settles on a silent process, and each ends at its wait. The settle cases pass under the race detector.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the wait ends on the timer's mark, not on a clock the timer races
- the cleanup: none revealed
- one place: the flag lives inside Settle alone

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
