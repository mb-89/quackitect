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
step: do
group: loose-fixes-99f4547
record:
  - step: do
    hand: box d84e33ce20f7 · claude-code-remote
    hash_before: 5e931144330f9abbed46c208fb7aef8dd4ed8de9
    hash_after: 5e931144330f9abbed46c208fb7aef8dd4ed8de9
    answered:
      - name: tests
        exit: 0
        said: green, 37 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/vale-ls-windows-trial.md:41:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: 9281c28c1ff0ecfb
        size: 550
    def: df12650931d480c9
reason: done
---

# Ask

A stale hold moves to the box that takes it, so a dead box locks its branch for one span at most.

Without it, a plain push onto a stale hold refreshes the tip and leaves the dead box's hold in place. The hold reads fresh for another span, and every other box stays locked out.

- `./RUNME.sh test test/level0/prepush.test.js` refuses a plain push onto a stale hold, passes a take, and refuses both onto a fresh hold
- `./RUNME.sh test test/level0/work-held.test.js` pushes the claim of a stale take, then takes main in
- `./RUNME.sh check` answers 0

# do

<!-- makes the change, with the test that covers it -->

## tests

./RUNME.sh test test/level0/prepush.test.js test/level0/work-held.test.js

## check

./RUNME.sh check

## says

The work landed on main through PR 30, commit 2fe64c73f, before this group took the ticket, and this branch carries main. A stale hold opens to a take alone: a plain push onto it stays refused, and the take moves the hold to the new box. The prepush and work-held tests pass. So this step passes on that evidence, and redoes nothing.

## checked

- the change stands on main as the ask names it, and nothing departs
- the verification reveals no cleanup
- the rule stands once, in the push door and its tests

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
