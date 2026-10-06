---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: one-routine-checks-the-fleet/gate
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
point: gate
todo: false
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: the-fleet-watches-itself
parent: one-routine-checks-the-fleet
record:
  - step: do
    hand: box 238560a34a48 · claude-code-remote
    hash_before: be7842a55d52930093c85e856c0525bf5e4eba04
    hash_after: be7842a55d52930093c85e856c0525bf5e4eba04
    answered:
      - name: tests
        exit: 0
        said: green
      - name: check
        exit: 0
        said: "    1.6  test/contract/front.test.js set, drop, entry and after write what se-front writes over tickets of this tree"
    inputs:
      - name: ask
        hash: 98b4ee7206db28ad
        size: 263
    def: d30540c12b845b77
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

`./RUNME.sh cloud route` stands with no caller. No workflow on `pull_request` and no routine runs it, so the session it prints never gets the event, and the ask's wake lands as a lookup alone. A caller runs the verb on the event and messages the session it names.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh check > /dev/null 2>&1 && echo green

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

A pull request event now reaches the box that drives the pull request. The work skill's new last step has the box subscribe its own session to the pull request's activity as it opens it, so CI and review events wake that box and not the coordinator. A GitHub workflow cannot reach a running session, since no secret here opens one, so the harness subscription is the caller. The cloud route verb stays as the lookup a hand uses where it meets an event elsewhere.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- The ask asks for a caller that hands the event to its box. The box's own subscription is that caller, and the says field gives the reason a workflow is not.
- No cleanup follows from a one-line skill step.
- The step stands once, in the work skill, and the box prompt points at the skill.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
