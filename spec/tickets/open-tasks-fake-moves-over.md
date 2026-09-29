---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-count-chain-leaves/gate
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
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: open-tasks-switch-lands
parent: the-count-chain-leaves
record:
  - step: do
    hand: box d81f28f032e0 · claude-code-remote
    hash_before: d343654ce5b3eaf2e59a67857aecf2a017b661c3
    hash_after: d343654ce5b3eaf2e59a67857aecf2a017b661c3
    answered:
      - name: tests
        exit: 0
        said: green, src/tui/work passes
      - name: check
        exit: 0
        said: "spec/tickets/vale-ls-windows-trial.md:41:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: c59922847ff98de1
        size: 150
    def: afe0d22bb9adb010
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the red cases fake askOpenTasks, which lives in shadow.go. The design deletes that file. Move askOpenTasks beside PlacesAt, and back it with askIndex.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/tui/work

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

shadow.go left the tree with the count chain. askOpenTasks now stands in src/tui/work/workplaces.go beside PlacesAt, and asks the index for the open tasks value through askIndex. The red cases swap it as a var, so they fake the index answer and read no shadow file.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: askOpenTasks stands beside PlacesAt, backed by askIndex
the cleanup: shadow.go is gone, and nothing else names it
one place: the open tasks value stands in the index, and askOpenTasks reads it there

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
