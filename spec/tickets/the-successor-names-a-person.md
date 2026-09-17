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

A person's work reaches a person.

<!-- breaks, as text: what breaks if it is never done -->

- `branch unblock` hands a step wanting a person into a successor outside the group.
- It reads that successor as open and outside the group, and reads no `by`.
- A hand mints a successor off `trivial`, whose step reads `by: anyone`.
- The pull hands that successor to an agent, which reaches a person's question.
- The group stalls on the wall the verb exists to clear.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

- `branch unblock` refuses a successor whose first step admits an agent.
- A test covers that refusal, and `./RUNME.sh branch test` answers green.
- The cloud guidance names the assignment a successor carries.
- `./RUNME.sh check` exits 0 on the commit.

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
- The step reads `by: anyone`. A process carries the assignment, and the ticket
  door holds `steps` for the verbs, so a hand assigns none after the mint.
- The verb and its design output stand already. For details, see
  [[spec/design_output/work#a-person-step-leaves]].
