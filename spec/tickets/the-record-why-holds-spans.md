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
step: do
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
A hand writes its ticket again after a failed review. The door reads the record as the verbs wrote it.

<!-- breaks, as text: what breaks if it is never done -->
A verdict joins its findings into one `why` line. Five code spans there lock the ticket. Every later write from a hand meets a refusal over a line the ticket door keeps for the verbs. The payload road carries the work, and the file stays shut.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- the door passes a ticket whose record joins findings past the code span cap
- a case drives the door over a record holding seven code spans in one `why`
- the fix names one home: the rule reading frontmatter, or the writer joining the findings
- `./RUNME.sh lint spec/tickets/the-spawn-takes-a-step.md` reads that ticket clean

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
