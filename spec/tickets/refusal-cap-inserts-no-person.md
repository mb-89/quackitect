---
kind: [[ticket]]
state: open
urgency: soon
group: the-person-step-holds
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: ask
    reads: [[spec/guidance/working]]
    needs: ["work test"]
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
process_hash: 568f402efe3adab7
---

# Ask

The pull inserts no person step. A hand-back that meets the refusal cap fails the leaf back with the findings. A step that fails back past the cap drops its hold and answers wait. The owner rules that no step waits for a person on a box. So the escalation verb alone puts a person step in, and only where a person sits beside the box. Done is the two caps in the config gone or renamed, the two insertions in the pull replaced, and the tests reading the fail-back.

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

The first run of the pull put a person step before the verdict of agent-pulls-ticket after five refusals. Every refusal came from an engine fault. Until this lands, a person takes a standing person step out of a route by hand.
