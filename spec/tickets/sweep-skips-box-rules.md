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
group: lsp-door-switches-over
step: do
record:
  - step: do
    hand: box d893e0ab0f106 · claude-code-remote
    hash_before: 2942103567cfc632fd2f0979260ba83ac6be4053
    hash_after: 2942103567cfc632fd2f0979260ba83ac6be4053
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/check passes; green, src/quack passes
      - name: check
        exit: 0
        said: "spec/tickets/lsp-door-switches-over.md:204:1: Vocabulary: lsp stands outside the words this tree writes. Write a core wo"
    inputs:
      - name: ask
        hash: 5afa6c5f90acaef0
        size: 424
    def: df12650931d480c9
reason: done
---

# Ask

The editor shows no false `SurveyFindsNode` row on `install.sh`, since the index sweep leaves out a rule that reads the box.

The sweep reads tracked files alone, and the survey stands ignored on the box. So the rule fires on every box, and every editor shows a row nobody can clear.

- `go test ./src/modules/check -run TestTheSweepLeavesTheBoxRulesOut` passes, and fails with the rule put back
- `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/modules/check/sweep_test.go src/quack/check_twins_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The index sweep drops SurveyFindsNode, since the survey stands on the box outside what git tracks. The editor loses a row that was false on every box, and the lint still decides the rule off the box.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask
the lint filter and the twin filter of the same rule stay as guards, and the new list in sweep.go names the rule for the Go side
the box-bound rule list stands once in the check module, in boxRules

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
