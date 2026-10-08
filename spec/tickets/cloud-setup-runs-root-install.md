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

install.sh moves from src/scripts to the root of the tree, so the cloud environment setup script on claude.ai names a path that stands nowhere. Only the owner edits that setting, so no box can do it. The work comes from scripts-folder-leaves, approach line 22.

- Open the environment of this repository on claude.ai, at its setup script.
- Replace the two lines naming `src/scripts/install.sh` with the two lines `spec/design_output/level0.md` shows under `SE_INSTALL_SKIP`, which run `sh "$repo/install.sh"`.
- Start a fresh cloud session on this repository.

- In the fresh cloud session, `ls .se/.runtime/bin/se-index` answers the path, so the root install ran.

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
