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
group: the-verbs-run-in-go
step: do
record:
  - step: do
    hand: box d8921a909c1fa5 · claude-code-remote
    hash_before: 2ca51e4b69f8aa28192a368cb1fa345eaa9b6d26
    hash_after: 2ca51e4b69f8aa28192a368cb1fa345eaa9b6d26
    answered:
      - name: tests
        exit: 0
        said: green, 1 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "  103.9  in all"
    inputs:
      - name: ask
        hash: bb6664ed6d1bf7de
        size: 499
    def: df12650931d480c9
reason: done
---

# Ask

gain: The lint twins case in `test/contract/lint-twins.test.js` compares both lints over a file that keeps a finding, so the check stays green when a ticket closes.

breaks: The case reads `spec/tickets/the-verbs-run-in-go.md`. A closed ticket passes the lint, so closing that group left the case with no finding to compare. The check then went red on the group's own branch, and `branch done` refused.

done_when:
- `node --test test/contract/lint-twins.test.js` passes
- `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh branch test test/contract/lint-twins.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The lint twins case read the phase 11 parent ticket as its file with a finding. A closed ticket passes the lint, so closing that group left the case with nothing to compare, and the check went red on the group's own branch. The case now reads `spec/design_output/tui.md`, a design note that keeps a finding at warning. The fix landed in #106; this pass carries its evidence, since the pull hands out no leaf on a closed group.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the case reads a standing finding, as the ask names
- the cleanup it reveals: the deadlock of a child minted after its group closed stands in the parent's Discussion
- every fact stands in one place: the case names its file once, and the ticket points at the test

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

The evidence of `do` stands here. The parent group closed before this ticket was minted, so the pull hands out no leaf on its branch, and a named pull stands behind the queue. A hand with the pull, or the owner, passes `do` on it.

- tests: `node --test test/contract/lint-twins.test.js`, green
- check: `./RUNME.sh check`, green on the commit that lands the fix
- says: The case read the parent ticket of phase 11 as its file with a finding. A closed ticket passes the lint, so closing that group left the case failing its own guard. The case now reads `spec/design_output/tui.md`, a design note keeping a finding at warning.
- lasting road: every finding in the tree waits on the push gate, so a committed fixture carrying a finding on purpose frees the case from the tree.
