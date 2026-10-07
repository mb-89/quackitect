---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-hooks-feed-the-sentinel/gate
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
parent: the-hooks-feed-the-sentinel
record:
  - step: do
    hand: box 83c32b2b4d58 · claude-code-remote
    hash_before: 0b8e741d1e800734d10120931a72ff1dbfb02699
    hash_after: 630bcd8ffb5573b9dbe1cd139e5f17a8f3bbc88c
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: green
    inputs:
      - name: ask
        hash: 8bfb9874f267c57d
        size: 150
    def: d79e6f2f77a124a8
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

src/quack/sentinel.go, sentinelOver drops the error say returns, since the fire hand returns nothing. Raise or log a failed write so a lost row shows.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/sentinel_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check > /dev/null 2>&1 && echo green

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

sentinelOver in src/quack/sentinel.go now builds the sentinel over the loaded registry. Its fire hand writes the fired row, stamped by the clock door, through the log. The fire hand answers nothing, so a write the log refuses prints the lost row's id and the fault to an errs writer the wiring hands in. Before, sentinelOver was a stub, and the draft's body dropped that error. TestSentinelOverSaysALostRow drives a refusing log, and the fired-row case from tests-red now passes too.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the failed write prints on errs, since the fire hand has no answer to raise through
- the wiring in listensHooks hands errs once it calls sentinelOver, which the child wiring-names-listens-hooks and the parent's change carry
- the row stamp reads logStamp, the one layout quack's log owns

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
