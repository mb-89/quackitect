---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: rules-lint-changed-files-first/gate
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
group: lint-without-vale
parent: rules-lint-changed-files-first
record:
  - step: do
    hand: box 09cf21ad3c5d · claude-code-remote
    hash_before: c25ddee6e3a77489aa31c647ffb295cfae9dd33b
    hash_after: f79bf94a8caadb6f912f97506fbba6c51361bb75
    answered:
      - name: tests
        exit: 0
        said: green, 47 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: "   79.2  in all"
    inputs:
      - name: ask
        hash: 31513f4cf6b4add8
        size: 201
    def: 1462c12807ab5533
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

guidance working rule 10 says a line at warning stands and only the push waits, and the commit's strict lint now refuses a staged file at warning; the rule and its table row name the commit as the gate

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test test/level0/projection.test.js test/level0/guidance.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Working rule 10 told an agent to leave a line at warning and let the push wait on it. The parent ticket's strict commit refuses a staged file at warning, so the rule now names the commit as the gate. An agent carries on past a warning while it writes, and clears the file in one pass before its commit. The table row says the same, and the output style takes the change through the projection.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the rule and its table row name the commit as the gate
- the cleanup: the old line about the Problems panel and the push leaves with the rule it served
- one place: `spec/guidance/working.md` owns the rule, and `.claude/output-styles/level0.md` is its projection

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
