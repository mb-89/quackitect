---
kind: [[ticket]]
state: open
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: ask
    reads: [[spec/guidance/working]]
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
process_hash: 05e53b89dab63152
group: the-migration-writes-its-specs
---

# Ask

A design note specifies the index model: names, providers and defaults, `q.Derived`, and `q.Fold` over `session/`. It covers actions as door calls with an undo each, snapshots and revisions, the catalog check at start, and `quack why`. [[spec/design_input/the-index-holds-the-model#one-owner-per-name]] asks it. So does [[spec/design_input/the-index-holds-the-model#input-processing-output]]. So does [[spec/design_input/the-index-holds-the-model#the-wiring-analyzer]].

Every later phase builds on this note. Without it each box writes a model of its own.

- a design note under `spec/design_output` says it, and `./RUNME.sh lint` passes over it
- the note names the `clock/minute` input and the names under `session/<id>/`, as [[spec/design_output/migration#the-gaps-and-their-answers]] asks
- `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
