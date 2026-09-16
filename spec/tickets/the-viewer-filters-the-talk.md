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
step: do
---

# Ask

The owner reads the talk between the prompts and the replies in one key. Alt Q sets the filter to the prompts and the replies, and Alt Q again clears it. The filter reads red while it stands, as a filter does today.

Without it the owner types the filter by hand each time, and the log verb loses its fastest reading.

- Alt Q sets the filter to prompts and replies, a second Alt Q clears it, and a test drives both
- the heading bar keeps Alt L and Alt F and takes no new key
- Ctrl F goes, since the level filter stands in its place
- the filter help lists Alt Q as a filter shortcut, where more of its kind land later
- a filter Alt Q sets reads red the way a typed one does

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
