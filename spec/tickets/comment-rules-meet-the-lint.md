---
kind: [[ticket]]
state: closed
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
group: lint-without-vale
step: do
record:
  - step: do
    hand: box 09cf21ad3c5d · claude-code-remote
    hash_before: 17c22efeb0d4aae0db75c386e07d957dfca65348
    hash_after: 96113d89e11fb955151eee9187bbfb04620d1235
    answered:
      - name: tests
        exit: 0
        said: green, 25 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "   95.2  in all"
    inputs:
      - name: ask
        hash: 06e9e1135931546a
        size: 360
    def: df12650931d480c9
reason: done
---

# Ask

The code comment rules say what the lint holds, so a hand reads one rule and meets that rule at the check.

The rules, the lint and the route each say a different thing, and nobody follows the rules as written.

- Rules 1, 3 and 4 of `spec/guidance/code/code.md` say what `CodeComment` passes, or the lint refuses what they refuse.
- `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test test/contract/vale.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Rules 1, 3 and 4 of the code guidance now say what CodeComment passes: a comment line past the header carries a pointer, a level0 suppression or a tool directive. The tree points its code at tickets as well as design output, so the rules move to the lint, and the lint stays as it stands. A contract case holds the rule to that: a pointed, suppressed or directed line passes, and a bare one warns.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the rules say what the lint passes
- the change reveals no cleanup
- the rules point at CodeComment, which owns the mechanism

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
