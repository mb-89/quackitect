---
kind: [[ticket]]
state: open
urgency: soon
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
---

# Ask

A fix to a lib under the hook reaches the running session. Today the hook imports its libs once at session start. So a reviewer hand that fixes the ticket door writes through the old door for the rest of the session. Done is a reload on a change to a lib file, or a check that names a hook older than its lib.

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

A reviewer hand on the first pull run fixed the ticket door for two chapters of one name. The session kept refusing under the old door. The payload road of the pull went around it.
