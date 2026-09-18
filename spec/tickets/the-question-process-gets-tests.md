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

A box mints a successor `branch unblock` takes, and a test holds that road open.

<!-- breaks, as text: what breaks if it is never done -->

- The cloud guidance tells a box to mint a successor whose first step reads `by: person`.
- `admits` in `src/scripts/unblock.js` refuses every other `by`.
- Every process a box could name opened at a step admitting an agent.
- So the verb refused every successor a box could mint, and the wall stood.
- `spec/processes/question.yaml` now opens at a person step, and it carries no test and no chapter.
- Nothing holds that road open, and a later edit closes it again with no case going red.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

- a case in `test/level0/unblock.test.js` mints off `question` and reads `branch unblock` running
- a chapter under `spec/design_output/work` names the process a successor takes, and the cloud guidance points at it
- `./RUNME.sh branch test test/level0/unblock.test.js` answers green
- `./RUNME.sh check` exits 0 on the commit

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

- This ticket names no group, so it stands in the pool on trunk.
- [[spec/tickets/the-successor-names-a-person]] adds the refusal, and names the gap this ticket closes.
- [[spec/tickets/a-person-reads-the-split]] is the first successor the new process carries.
- `test/level0/person-step.test.js` covers the wait answer naming the route. The chapter under the design output, and a case over the route itself, stand open.
