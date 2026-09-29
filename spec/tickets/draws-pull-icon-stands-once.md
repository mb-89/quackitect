---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: view-actions-run-through-verbs/gate
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
group: sidebar-lands-in-shadow
parent: view-actions-run-through-verbs
record:
  - step: do
    hand: box d85821f54410d · claude-code-remote
    hash_before: 85d834f5990e8629b8738beb874ae192fd44ddf1
    hash_after: 85d834f5990e8629b8738beb874ae192fd44ddf1
    answered:
      - name: tests
        exit: 0
        said: green, 7 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "src/scripts/ticket-edit.js:6:1: correctness/noUnusedFunctionParameters: This parameter n is unused."
    inputs:
      - name: ask
        hash: 4e1487edde833acf
        size: 228
    def: 0c8d38ef023e7139
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

The Discussion says the pull entry of `spec/config/draws.json` drops its help and icon. The approach keeps them until the grid retires, so the icon stands in two places and no ticket carries the cut. Carry the cut on this child.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/sidebar-work.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The change departs from the ask and cuts nothing yet. The widget grid still draws its pull button off the `pull` entry of `spec/config/draws.json`, so a cut now leaves that button bare. The cut goes to the Discussion of `sidebar-lands-in-shadow`, where the switch-over that retires the grid reads it.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change departs, and both Discussions say why
- the change reveals no cleanup
- the cut stands once, under the group ticket, and this ticket points there

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

The cut waits on two things. `work/pull` registers its icon once `view-actions-run-through-verbs` lands. The widget grid reads the pull cell's help and icon off the schema, which `spec/config/draws.json` feeds. A cut before the grid retires leaves the grid's button bare.
