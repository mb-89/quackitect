---
kind: [[ticket]]
state: open
steps:
  - name: do
    does: does the work the ask names, and says what came back
    by: person
    to: engine
    input: ask
    evidence:
      - name: result
        form: text
        says: what came back, which the step behind this one reads
  - name: follow
    does: carries the result into the tree, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: result
    needs: ["branch test"]
    checklist: ["the change follows the result, or the discussion says why it departs", "every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
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
process: [[spec/processes/person]]
process_hash: 781b200dbb69dec3
step: do
---

# Ask

<!-- work, as text: what the person does, why no box can do it, and the ticket the work comes from -->
<!-- commands, as list: every command the person runs, one a line, in order -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

The owner deletes the test files the Discussion of [[spec/tickets/js-tests-cut-to-the-ratio]] lists. Each tests `src/bridge` code no live module imports, or a twin Go covers whole. The cloud box's safety check refuses the delete as a destructive action, so a person runs it, or grants the box a Bash rule for it.

- `git rm test/level0/command-cases.test.js test/level0/commit-guards-cases.test.js test/contract/write-door-cases.test.js test/level0/answer-read.test.js test/level0/viewer.test.js test/level0/agent.test.js test/level0/cloud-ask.test.js test/level0/wait.test.js test/level0/code-door.test.js test/level0/bash-engine.test.js test/level0/bash-desk.test.js test/level0/bash-commit.test.js test/level0/bash-bless.test.js test/level0/trunk-door.test.js test/level0/write.test.js test/level0/write-bless.test.js test/level0/prose.test.js test/level0/tools-door.test.js test/level0/hand-tools.test.js test/level0/handover-door.test.js test/level0/style-top.test.js test/level0/review-door.test.js test/level0/ask-door.test.js`
- `./RUNME.sh commit "the-dead-bridge-tests-leave: the dead bridge tests leave"`

Done when:

- `git ls-files test` names none of the files the first command lists
- `./RUNME.sh check` exits 0, and the follow step drops each `src/bridge` module the cut leaves untested

# do

<!-- does the work the ask names, and says what came back -->

## result

<!-- what came back, which the step behind this one reads -->

<!-- the form is text -->

# follow

<!-- carries the result into the tree, with the test that covers it -->

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
