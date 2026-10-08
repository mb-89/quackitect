---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: example-retro-counts-gaps/gate
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
group: examples-run-as-tests
parent: example-retro-counts-gaps
record:
  - step: do
    hand: box 23ee163eaf36 · claude-code-remote
    hash_before: 9e7373077eca386523b9a75e241dd9222c09fbaf
    hash_after: 9e7373077eca386523b9a75e241dd9222c09fbaf
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/check passes
      - name: check
        exit: 0
        said: "   66.0  in all"
    inputs:
      - name: ask
        hash: 57b432e608df2e2e
        size: 274
    def: 494539d9ce138ff0
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the draft renames shownNames to Shown, but src/modules/check/export.go already exports the constant Shown (= shown, from lsp-rules-move-to-check), so the rename breaks the build; implement exports it under another name, such as ShownNames, and fixes the name in the approach

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/modules/check/example_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The names every example shows under `interface` now export from the check module as `ShownNames`, so the retro gaps verb reads them from the one place that owns them. The draft named it `Shown`, which stands already as a constant in the module's exports. A new case holds what the exported function answers, and the retro gaps ticket's Discussion names the function.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the function exports as ShownNames, and the retro gaps Discussion fixes the name
- the rename reveals no cleanup past its one caller, coverage.go
- the name stands once, in coverage.go, and the Discussion points at this ticket

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
