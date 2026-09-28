---
kind: [[ticket]]
state: open
steps:
  - name: answer
    does: answers the question the ask carries
    by: person
    to: engine
    input: ask
    evidence:
      - name: answer
        form: text
        says: the answer, which the step behind this one reads
  - name: do
    does: carries the answer out, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: answer
    needs: ["branch test"]
    checklist: ["the change follows the answer, or the discussion says why it departs", "the cleanup the change reveals is in the change, or is a note of its own", "every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
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
process: [[spec/processes/question]]
process_hash: d1a6e26348695e24
step: do
todo: true
record:
  - step: answer
    hand: box 1327ac97a972 · claude-code-remote
    hash_before: 64f0950a790ac159aaf7c710a6f948ce693ce8d5
    hash_after: 64f0950a790ac159aaf7c710a6f948ce693ce8d5
    inputs:
      - name: ask
        hash: 01e96f354b9f7d30
        size: 794
      - name: [[spec/design_input/the-cloud-runs-itself]]
        hash: 591680bf2c6fc6d6
        size: 13376
      - name: [[spec/tickets/an-action-fires-the-workers]]
        hash: 44f47196af76f1b4
        size: 9242
    def: 2280015d497a3abd
---

# Ask

The owner makes the work routine's API trigger, and stores it where the Action reads it. On the work routine's page at claude.ai, add an API trigger. Copy the URL and the token it shows once. Then run `gh secret set ROUTINE_FIRE_URL` and `gh secret set ROUTINE_FIRE_TOKEN` from a clone, and paste each value.

Say too which token opens the Action's pull requests. A pull request opened on the workflow's own token starts no workflow, so the required check stays silent on it. The question comes from [[spec/design_input/the-cloud-runs-itself#what-stands-open]].

- [[spec/tickets/an-action-fires-the-workers]], which fires the work routine off these secrets

- `gh secret list` names `ROUTINE_FIRE_URL` and `ROUTINE_FIRE_TOKEN`
- the answer names the token that opens the Action's pull requests

# answer

<!-- answers the question the ask carries -->

## answer

<!-- the answer, which the step behind this one reads -->
<!-- the form is text -->

The owner reports the three repo secrets set on mb-89/quackitect. ROUTINE_FIRE_URL and ROUTINE_FIRE_TOKEN hold the work routine API trigger. PULL_TOKEN holds a fine-grained token with contents and pull requests write, and the Action opens its pull requests on it.

# do

<!-- carries the answer out, with the test that covers it -->

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
