---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-queue-views-agree/design/review
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
group: the-engine-fixes-its-faults
parent: the-queue-views-agree
record:
  - step: do
    hand: box d7e124b659cd · claude-code-remote
    hash_before: ba8f76c3139f834302d9d3b759a44dd360def299
    hash_after: ba8f76c3139f834302d9d3b759a44dd360def299
    answered:
      - name: tests
        exit: 0
        said: green, 3 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/sync-takes-its-own-branch.md:282:1: ListItem: A sentence in a list item holds 20 words, and this one holds "
    inputs:
      - name: ask
        hash: 67bdcfea0d0255bd
        size: 382
    def: 67a88a4c3e102bfa
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the-badge-reads-open-tasks carries none of the lines the owner moves at person-2: the sidebar redraw after a burst of ticket, plan and hold writes, its case in `test/level0/sidebar.test.js`, and the person step comparing the badge with the brackets. This ask still carries all three, so they land on that ticket's ask and leave this one, or this ticket closes on lines nobody builds

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test test/contract/front.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The three badge lines leave the ask of the-queue-views-agree, which closes on the todo, the rows and the lens. The-badge-reads-open-tasks already carries them under its Discussion, where its draft takes them in. The door refuses an edit to that ask from a hand holding no step of it.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the lines leave the phase one ask, and phase two carries them under its Discussion, since the door refuses an edit to its ask
- the cleanup the check names, one comment in pull-hand-of.js, rides this change
- the three lines stand once, on the phase two ticket

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
