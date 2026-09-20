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
process_hash: 05e53b89dab63152
group: the-work-tab-reads-tickets
step: do
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
The index holds every ticket with its fields, and one query answers them. The fields are state, step, group, urgent, and the standing a branch gives it. A reader asks the index and reads no file.

<!-- breaks, as text: what breaks if it is never done -->
The work tab reads a file the branch verbs write, so it shows what the last verb saw. A ticket is a thing of branches in its eyes.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- `./RUNME.sh index tickets` answers every ticket with its fields as JSON, off the index alone
- a ticket's standing reads off its group's branch through the ticket, which `test/level0/index.test.js` covers over a fixture

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
