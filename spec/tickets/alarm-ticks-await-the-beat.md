---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: lease-waits-meet-a-fake-clock/gate
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
group: tests-meet-the-doors-once
parent: lease-waits-meet-a-fake-clock
record:
  - step: do
    hand: box b4c8cb96d125 · claude-code-remote
    hash_before: 25ecfd6655ddf9545614142785cdf23810d62efa
    hash_after: 25ecfd6655ddf9545614142785cdf23810d62efa
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "   93.7  in all"
    inputs:
      - name: ask
        hash: 2ea545aec62a90f3
        size: 197
    def: 4cf644d72e823f8e
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the module case ticks past the term only after the pid lands. The beat lands after the pid commit, so it can renew the lease past one tick. Tick on each poll while the current pid stands unexpired.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/quack

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Both alarm cases in `src/quack/io_test.go` run through one helper, `silentRun`. The dog reads a fake clock. On each poll, while the pid the fake last committed stands unexpired, the clock moves past the lease and the dog checks. A late beat meets the next tick. A slow spawn counts against no lease, because the clock stands still until the process commits. The process and the bus stay real, so the module case is the door test of a placed process. The IO fake now commits its pid, so both cases gate on it. Twenty runs beside four loaded package runs pass, each under half a second.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the tick runs on each poll while the live pid stands unexpired
- the cleanup it reveals is in it: the two cases share one helper and one set of dog settings
- the new numbers carry names once, at the top of the test file

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
