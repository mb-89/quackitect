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
    hash_before: 0c9da50158ca657ded383a911c0d2fe9f5957676
    hash_after: 0c9da50158ca657ded383a911c0d2fe9f5957676
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "   95.2  in all"
    inputs:
      - name: ask
        hash: aebd3ebce9f94916
        size: 128
    def: 4cf644d72e823f8e
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

no red test decides the io_test line before implement. The rewritten case under implement decides it, and the check confirms it.

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

The io_test line stands decided by the rewritten module case, which landed under alarm-ticks-await-the-beat. That change is test-only: no code moves for it, so no red run precedes it. The red run the line wanted is the old case failing inside the full check, which the Ask quotes. Twenty runs on a loaded box now pass, and the check confirms it here.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the case decides the line, and the check confirms it
- no cleanup follows, since the change touched no code
- no new fact lands: the run counts stand in the closed point's record

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
