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
group: the-verbs-run-in-go
step: do
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

The evidence of `do` stands here. The parent group closed before this ticket was minted, so the pull hands out no leaf on its branch, and a named pull stands behind the queue. A hand with the pull, or the owner, passes `do` on it.

- tests: `node --test test/contract/lint-twins.test.js`, green
- check: `./RUNME.sh check`, green on the commit that lands the fix
- says: The case read the parent ticket of phase 11 as its file with a finding. A closed ticket passes the lint, so closing that group left the case failing its own guard. The case now reads `spec/design_output/tui.md`, a design note keeping a finding at warning.
- lasting road: every finding in the tree waits on the push gate, so a committed fixture carrying a finding on purpose frees the case from the tree.
