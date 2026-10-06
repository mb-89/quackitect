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
group: dead-tests-and-code-leave
cloud: true
step: do
---

# Ask

The rules the goldens audit drafts land as a guidance note spec/guidance/code/tests.md with its rationale. The retro audit rule and the audit checklist line land beside it, so the next box writes no test this group deletes.

The tree keeps minting parity goldens, per-verb registers tests and tests of dead code, and the next audit finds the same pile.

- spec/guidance/code/tests.md holds the drafted rules, with the owner's decisions below
- outermost means the command line, and the module's ports for an edge the command line cannot reach
- fixtures count toward the test-to-code ratio
- testing.md rules 1-3 cover the VS Code extension and the level-zero hooks alone
- the file ceiling covers code files alone
- the rationale stands under spec/rationales, linked from the note
- the retro audit rule and the audit checklist line stand where the draft names
- the testing guidance other boxes land stands beside it, merged in whole
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
