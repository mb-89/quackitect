---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-log-tab-reads-v1/gate
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
group: tui-shell-switches-over
parent: the-log-tab-reads-v1
record:
  - step: do
    hand: box d88aea6eafd6 · claude-code-remote
    hash_before: 474023dbbcdc30821844aaf701eadc2600961607
    hash_after: 474023dbbcdc30821844aaf701eadc2600961607
    answered:
      - name: tests
        exit: 0
        said: green, src/tui/log passes
      - name: check
        exit: 0
        said: "spec/tickets/the-tui-data-paths-leave.md:376:73: Passive: Write in the active voice and name who acts: 'is reached'."
    inputs:
      - name: ask
        hash: ee65a201ee7738ca
        size: 289
    def: 21b058f33a8e4913
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the log tab stands first, and the frame hands each message to the first tab taking it. So the tab takes a `registry.Change` named `log/rows` alone. Its stream's end lands as a message of its own, as `watchEnded` does in `src/tui/work/v1.go`. A case sends `work/rows` and wants it declined.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/tui/log/v1_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The implement commit of the-log-tab-reads-v1, 98501ed5e, carries this fix. The log tab's `changes` in `src/tui/log/v1.go` declines every change whose name is not log/rows. Its stream's end lands as the tab's own `watchEnded`, the way the work tab does it. `TestTheLogTabHandsOnAChangeToAnotherName` sends work/rows and a bare end, and wants each declined. This leaf adds no code.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: the tab takes log/rows alone, its end is its own message, and a case sends work/rows
the cleanup: nothing further surfaced
one place: the rows name stands once, as rowsName in v1.go

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
