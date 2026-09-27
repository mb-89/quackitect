---
kind: [[ticket]]
state: closed
step: do
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: ask
    reads: [[spec/guidance/working]]
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
record:
  - step: do
    hand: person
    hash_before: 6ee7dd0c4b2b1bb90ea8d21e1e279300a72302d7
    hash_after: 1763d99580fd330a9c88d836931d51e8f85ea891
    answered:
      - name: tests
        exit: 0
        said: green, 21 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-queue-moves-to-plan.md:121:99: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: c315059b2794e282
        size: 580
      - name: [[spec/design_output/level0]]
        hash: 7a88483fbd32b3cd
        size: 87491
    def: 41499778917f0d75
reason: done
---

# Ask

The plugin carries the read marks of the write door alone where a road calls them. A reader of [[spec/design_output/level0]] meets the door as it stands.

Today `.claude/skills/level0/lib/marks.js` and `MARKS` in `.claude/skills/level0/lib/runs.js` stand with no caller but their cases. Two chapters of the design describe a door that checks no mark.

- `lib/marks.js` and `MARKS` in `lib/runs.js` leave, with the mark cases in `test/level0/apply.test.js`
- the two mark chapters of the design leave, and `./RUNME.sh links` names no link reaching them
- `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/apply.test.js test/level0/work-merge-cloud.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The write door keeps no read mark, so `lib/marks.js` and `MARKS` in `lib/runs.js` leave the plugin with their five cases in `test/level0/apply.test.js`. The two design chapters describing the mark leave `spec/design_output/level0.md`, and a case holds that the runtime folder names no marks file. The cloud merge case now joins the install path the way the box does, so the check passes on a Windows desk.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the library, the constant, their cases and the two chapters leave, and `./RUNME.sh links` names no link reaching them
- the cleanup the change reveals is in the change: the Windows path in the cloud merge case held the check red, and it lands in the same commit
- the change adds one fact, the case over the runtime folder, and it stands in `test/level0/apply.test.js` alone

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
