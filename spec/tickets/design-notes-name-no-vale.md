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
group: lint-without-vale
step: do
record:
  - step: do
    hand: box 09cf21ad3c5d · claude-code-remote
    hash_before: 5060d794315c57d9f8dfe2a3ffdd858a9a31228c
    hash_after: 8704dc7b1f7c9910c22a6aeb23e675e7f5627271
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/check passes
      - name: check
        exit: 0
        said: "   84.0  in all"
    inputs:
      - name: ask
        hash: 4c6cedc7105f8c75
        size: 513
    def: df12650931d480c9
reason: done
---

# Ask

A reader of the design notes meets the tree as it stands. The Go rules own the prose, and no part of Vale stands beside them.

The notes under `spec/design_output` still describe the ini, the editor ini, the extension settings and the check rule over them. A reader builds on a road the tree no longer holds.

- `git grep -il -e '\.vale\.ini' -e 'editor\.vale' -e 'vale\.valeCLI' -e 'EditorDrawsWriteRules' -e 'vale-ls' -- spec/design_output` answers nothing.
- `./RUNME.sh check` exits 0.

view: none

from: none

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/modules/check/check_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The notes under spec/design_output describe the Go rules where they describe the Vale road: the editor's extension list and settings rules, the lsp's tools and battery, the path a rule reads through the scope sections, the projection's script rules as heads alone, and the vehicle's rules read off the work root. The size golden takes the new line count of level0.md, since the twin records each long file's lines.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: the grep over spec/design_output answers nothing, and the owner's input under design_input and funnel stands as it is
the cleanup the change reveals is a child of the group: vehicle-rules-come-down, since a vehicle's work root holds no rule files, and the Vale history in level0.md stays for the retro
every fact stands in one place: each rewritten passage points at src/rules or the rules note in place of a second copy

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
