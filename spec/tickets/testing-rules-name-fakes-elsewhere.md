---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-testing-rules-name-the-doors/gate
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
parent: the-testing-rules-name-the-doors
record:
  - step: do
    hand: box e97c7a20bbd2 · claude-code-remote
    hash_before: 8020e196612c4eef11f5e5d9fc95a5fc78f05d26
    hash_after: 9bd2924e286729e1f92c34b0654bd42d20319cab
    answered:
      - name: tests
        exit: 0
        said: green, src/imports passes
      - name: check
        exit: 0
        said: "  115.7  in all"
    inputs:
      - name: ask
        hash: c39b2fb37dc73f81
        size: 131
    def: 2f2c3d6572124fa4
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the five rules the approach lists leave out the done_when item fakes elsewhere, so the builder names it beside one door test a door

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/imports/clock_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Commit 9bd2924e2 writes the rules into the testing guidance. The note holds fifteen actionables at most, so each new rule joins the rule it extends: rule 3 holds one door test a door and fakes elsewhere, rule 7 the fixture built once, rule 8 no wall-clock wait or spawn outside a door test, rule 10 the stateless module, and rule 11 the read, compute and write. Rule 10 gave up a pointer at the check rule, which code guidance rule 7 already owns. The rationale argues each under its own number.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the point and the parent ask, and departs where the cap of fifteen forces the new rules into the old ones
- the cleanup it reveals rides in the change: the pointer rule 10 held stood twice, and it leaves
- each rule stands once, and rule 3 and rule 8 point at the doors note for the audit

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
