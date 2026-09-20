---
kind: [[ticket]]
state: open
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

A pointer with the ending off reads as a live link in the links verb the way it
reads in the pointer gate. The two agree on every pointer. Today the index
resolves a link to the exact path, to the path with `.md`, to a note's id and
to a folder.

A ticket names its process with the ending off. So `./RUNME.sh
links` names every process pointer dead, and its answer says nothing a reader
acts on. `EveryPointerResolves` in `src/lsp/pointer.go` tries `.yaml` and
`.yml` too, and one resolver in a package both modules import would answer
both. For details, see [[spec/design_output/index#a-note-and-its-links]] and
[[spec/design_output/lsp#every-pointer-resolves]].

- `./RUNME.sh links` names no pointer into `spec/processes`
- a case feeds the index a pointer naming a process file with the ending off, and the link resolves
- `./RUNME.sh check` answers 0

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

<!-- what anybody adds, at any time, on this ticket -->
