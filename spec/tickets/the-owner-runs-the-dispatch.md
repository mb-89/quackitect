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
step: answer
group: the-cloud-follow-ups-land
---

# Ask

The owner starts the dispatch Action once by hand, and says whether its first live run holds. The Action comes from [[spec/tickets/an-action-fires-the-workers]], and no box here reaches the real routine.

The agent takes these calls, and the owner confirms or turns each:

| the call | why |
|---|---|
| auto-merge asks for the merge method MERGE | MERGE keeps the write branch's commit as it stands, and a refused mutation names itself in the plan |
| an issue a question closes by hand | the dispatch opens issues and closes none, so a person closes it once the answer lands |
| the fire text names the branch | the routine's saved prompt runs the work skill, and the text stands as context |

Run these from a clone:

```sh
gh workflow run dispatch.yml
gh run watch
gh run view --log | tail -40
```

- the dispatch Action's first scheduled run

- the answer names whether the run fires, opens the issues and opens the write branch's pull request
- the answer confirms or turns each call in the table

# answer

<!-- answers the question the ask carries -->

## answer

<!-- the answer, which the step behind this one reads -->

<!-- the form is text -->

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
