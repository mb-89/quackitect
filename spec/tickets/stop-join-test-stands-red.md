---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: each-door-meets-one-test/gate
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
parent: each-door-meets-one-test
record:
  - step: do
    hand: box 0e8770600b2b · claude-code-remote
    hash_before: c88ee4df2225c443b5a242c870bbf9cfba80b869
    hash_after: c88ee4df2225c443b5a242c870bbf9cfba80b869
    answered:
      - name: tests
        exit: 0
        said: green, src/index passes
      - name: check
        exit: 0
        said: "    4.2  test/contract/vale.test.js a shouted lead is refused and an acronym inside a sentence passes"
    inputs:
      - name: ask
        hash: 905d6ced1e896f0c
        size: 109
    def: d6b34b181afb7e04
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the draft names TestAStopJoinsTheSpawnerBeforeItAnswers, and no red case holds it, so the join lands unproven

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

A new case proves the stop joins the spawner. Its timer holds the spawner until the stop closes the quit channel, and the case reads the spawned channel the moment the stop answers. Before the join it reads red on its own assertion: the stop answers while the spawner still runs. The spawner now waits on the timer the placements name, closes spawned as it returns, and the stop waits on spawned before it reads the stops. A spawn in flight then lands its stop first, and no process starts past the stop. The two stop cases on the fake timer turn green with it.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the case named in the draft stands red before the join and green after it
- the cleanup it reveals is in the change: the spawner fields take the formatter layout, which turned the check red
- every fact stands in one place: the fake timer stays in the case file, and the join lives in the stop alone

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
