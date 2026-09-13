---
kind: [[ticket]]
state: open
urgency: now
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
process_hash: 62642eaf8f9c9c53
group: the-bridgehead-imports-its-vehicle
step: do
---

# Ask

The probe under test/fixtures/bridgehead lands with its tests and its chapter. A probe writes its code before its tests, because the answer decides what the tests say. So this ticket takes the trivial route, and the one under the standard route becomes it. Without it the stub branches lean on a chapter no test holds. Done is three things:

- `node --test test/level0/bridgehead.test.js` answers green, so the bridgehead forwards session.start, tool.call and turn.complete
- `SE_SLOW=1 node --test test/contract/bridgehead.test.js` answers green, so the client passes the probe and a headless turn in a stub answers the canary
- spec/design_output/level0.md carries the chapter A bridgehead imports a copy, naming the shape that holds and the three that fail

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
