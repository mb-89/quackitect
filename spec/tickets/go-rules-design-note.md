---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: go-rules-replace-vale/gate
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
parent: go-rules-replace-vale
record:
  - step: do
    hand: box 09cf21ad3c5d · claude-code-remote
    hash_before: f45f66d58c02f39a21411afb8f3710cdcffa21b2
    hash_after: 7e19b5981aef4c1e713353fa933b37cf7db91cdc
    answered:
      - name: tests
        exit: 0
        said: green, 5 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "  115.6  in all"
    inputs:
      - name: ask
        hash: 8b0641f89f512183
        size: 185
      - name: [[spec/design_output/rules]]
        hash: a2ee78211056e4da
        size: 773
    def: 4bc7bee7defe0b42
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

src/rules/scope.go links [[spec/design_output/rules#a-rule-reads-its-paths]], and no such note stands, nor does the draft's size list it; write the note or point the links at the ticket

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/roots.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

spec/design_output/rules.md now stands, with the section a rule reads its paths, which src/rules/scope.go points at. The hand-back met a red check: a gate parks its points under todo, and a box on another group branch took them ahead of its own work, so the dry probe pulled this ticket in place of its own leaf. handOut in src/pull/pull_hand.go now keeps the parked tickets of the box own group and the private notes, a case in src/pull/pull_test.go holds it, and the pull note says so. The size golden reads the pull note new length.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the note stands, and the links resolve
- the cleanup the change revealed, the pull taking another group parked tickets, rides in the change with its case
- the note owns the scoping, and scope.go points at it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
