---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
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
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: examples-run-as-tests
step: do
record:
  - step: do
    hand: box 1fb91bdd8469 · claude-code-remote
    hash_before: e2d353e0c559b842c41e30490c0a64a3075a27ca
    hash_after: e2d353e0c559b842c41e30490c0a64a3075a27ca
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "  100.3  in all"
    inputs:
      - name: ask
        hash: 808fb6358cf73d74
        size: 366
    def: df12650931d480c9
reason: done
---

# Ask

A rule in report mode lists its gaps and holds nothing, so branch done and the trunk push pass while the tree catches up

The coverage rules count as warnings in the check stamp, so branch done refuses every branch while any verb lacks an example

- go test ./src/quack -run TestLintVerb passes a case where a report-mode finding leaves under neither stood nor erred

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/quack

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The lint leaves a report-mode finding under neither stood nor erred, so the check stamp counts it as no warning. A coverage rule in report mode then lists its gaps and holds no branch done and no trunk push, as the group goal says.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask
- the sibling test pinning the old behaviour changes in the same commit
- report mode stays decided once, in check.Reports

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
