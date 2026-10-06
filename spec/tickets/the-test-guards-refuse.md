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
group: code-is-pure-tests-behave
depends_on: [go-tests-go-black-box, go-fixtures-move-home, js-tests-cut-to-the-ratio, hand-script-guard-reports, purity-guard-covers-every-outside]
step: do
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
The black-box, fixture, ratio and script guards refuse. A new offender fails the check, and the baselines only shrink.

<!-- breaks, as text: what breaks if it is never done -->
A guard in report mode lists offenders nobody reads, as the retro proved, and the tree drifts back.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- each guard's own test proves the check refuses its planted case off the baseline: an in-package test file, a fixture build in a Test function, a script, a module growing past one to one
- a baseline entry the guard no longer names fails the check until it leaves the baseline
- `./RUNME.sh check` stands green on the tree

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
