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
    hash_before: ea03d57703cf0370b4730f539af4980c46793753
    hash_after: ea03d57703cf0370b4730f539af4980c46793753
    answered:
      - name: tests
        exit: 0
        said: green, 7 test(s) pass in 1 file(s); green, src/tui passes; green, src/tui/work passes
      - name: check
        exit: 0
        said: "spec/tickets/vale-ls-windows-trial.md:41:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: 9cd03195c1cb3d88
        size: 237
    def: afe0d22bb9adb010
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

test/level0/sidebar-work.test.js pins tui work --count, so the new counts line breaks it. src/tui/workplaces_test.go and src/tui/work/workplaces_test.go assert Takeable off PlacesIn. Neither list names them, so rewrite them in the build.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/sidebar-work.test.js src/tui src/tui/work

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The build commits of the-count-chain-leaves rewrote the three tests. The sidebar test spells no count flag. The Go tests read the count through PlacesAt off the index, and one case sets Takeable by hand in place of asserting it off PlacesIn.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: the three tests the ask names stand rewritten and green
the cleanup: the rewrite reveals none
one place: the count stands in the index, and PlacesAt reads it there

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
