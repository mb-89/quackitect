---
kind: [[ticket]]
state: open
urgency: soon
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

Nothing stands here yet.
