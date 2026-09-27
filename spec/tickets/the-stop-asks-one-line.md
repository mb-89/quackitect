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
step: do
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

The owner reads each answer once. After the stop call, the agent writes the stop line alone, because the answer before the call carries the report.

The reply of a claim that stands tells the agent to write the answer again. So every stop shows the owner the same answer twice.

- the reply of a claim that stands asks for the line `stop: <reason>` alone, and asks for no second answer. A case in `test/level0/stop-door.test.js` decides it
- a report the answer before the call carries stands for the turn, so the line alone ends it. A case in `test/level0/stop-said.test.js` drives `turn.said`, then the stop, through `decide`
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

The reply case stands in `test/level0/stop-said.test.js` beside the streamed report, because `test/level0/stop-door.test.js` stands at the line ceiling.

The change lands from a box whose cold probe passes. On the owner's desk the probe's client answers 1 on the tree as it stands, before any change. The change stands tested there, and it carries four parts:

- `claims` in `src/bridge/stop.js` answers a standing claim with `The claim stands. The answer before this call carries the report, so end the turn with the line stop: ${reason} alone. The owner reads the answer once.`
- `saidReport` in `src/bridge/stop.js` sets `box.reported` where a `turn.said` text carries the needs table and names no helper
- `turn.said` in `src/bridge/server.js` runs `saidReport`, then `onTurnSaid`
- `test/level0/stop-said.test.js` drives the reply, a streamed report, a stream with none, and a helper's stream through `decide`
