---
kind: [[ticket]]
state: closed
group: the-hand-carries-a-step
step: do
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: ask
    reads: [[spec/guidance/working]]
    needs: ["work test"]
    checklist: ["the change follows the ask, or the discussion says why it departs", "the cleanup the change reveals is in the change, or is a note of its own"]
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
process_hash: 568f402efe3adab7
record:
  - step: do
    hand: box ee33ce836a4d
    hash_before: 146837e16d00768c6502d28f65cc0b701c7640d0
    hash_after: 146837e16d00768c6502d28f65cc0b701c7640d0
    answered:
      - name: tests
        exit: 0
        said: green, 25 test(s) pass in 3 file(s)
      - name: check
        exit: 0
        said: 37 stand at warning, which the panel draws and check allows.
reason: done
---

# Ask

A tool registers under the plugin's name. Level zero under a bridgehead answers to `mcp__bridgehead__stop`, and its guidance names `mcp__level0__stop`. So an agent in a stub reads a name no tool carries. Done is one of two things, decided on this ticket:

- the stub's plugin folder carries the name level0, and the design input's file table says so
- level zero reads its name off the event, and every place naming `mcp__level0__` reads it there

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

./RUNME.sh branch test

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

./RUNME.sh check src test spec/design_output .vale.ini

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

The stub's plugin folder carries the name level0, the one the settings allow and the guidance writes. A plugin takes its name from the folder it stands in, so this folder name is what a tool in a stub answers to. The attach writes level zero over the same folder, so a tool keeps one name from the first session to the next. The design input's file table names level0 already, and the design output, the Vale scope and the stub's manifest now agree.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the ask offers two roads, and this takes the first: the folder carries level0. The design input's table already says so.
- the rename reveals a stale Vale scope and a stale row in the design output. Both stand in this change.

# Discussion

Nothing stands here yet.
