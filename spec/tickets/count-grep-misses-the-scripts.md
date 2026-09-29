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
    hash_before: c2d503a481caf52ed4bc1e4212b26fa246963819
    hash_after: c2d503a481caf52ed4bc1e4212b26fa246963819
    answered:
      - name: tests
        exit: 0
        said: green, 27 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/vale-ls-windows-trial.md:41:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: d9a56ee68a8f8db7
        size: 182
    def: afe0d22bb9adb010
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the done_when grep skips src/scripts/tui.js, which holds counted and COUNT. It also hits a playwright-core line under node_modules. Widen it to src/scripts, and exclude node_modules.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/contract/tree.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The case 'no count chain stands in the verb, the viewer or the badge line' in test/contract/tree.test.js holds the count flag gone from src/scripts/tui.js, src/tui/main.go and the schema. It reads those files alone, and no grep walks node_modules. It departs from a grep over all of src/scripts, because that grep hits git rev-list --count and the log verb's own --count, which belong to no chain.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask where the ask holds, and the Discussion names the departure: a grep over src/scripts flags git rev-list and the log verb
the cleanup: the change reveals none, since the three files carry no count flag
one place: the case names its files once, and points at this ticket

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
