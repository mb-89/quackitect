---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: git-and-process-doors-designed/gate
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
group: unfaked-doors-take-fakes
parent: git-and-process-doors-designed
record:
  - step: do
    hand: box e97c7a20bbd2 · claude-code-remote
    hash_before: ab2efcd583f2c98eb12d1be512449310db5648f9
    hash_after: 9c8637367c13bf78eca72794ab07b987f32c70db
    answered:
      - name: tests
        exit: 0
        said: green, src/imports passes
      - name: check
        exit: 0
        said: "  119.2  in all"
    inputs:
      - name: ask
        hash: 727fcc8926fe4a2f
        size: 228
    def: 3a9676c35d5b5a6c
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the chapter says the lsp module moves onto the Runner in src/proc, yet the lsp Runner in src/modules/lsp/tools.go keeps its own signature with no env and no exit code, and neither the moves table nor any ticket carries that move

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/imports/clock_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The doors chapter says the lsp module moves onto the process door, yet no ticket carried that move. The lsp runner holds a halt and a wait the door lacks, so the move needs its own design. The moves table now names it as row five, with the ticket lsp-tools-take-the-runner in the group unfaked-doors-take-fakes. The sentence on the order says the lsp move stands apart from the git moves.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: the moves table and a ticket now carry the lsp move, and the move itself waits on its own design
the cleanup the change reveals is in the change: the order sentence names the git moves alone
the move stands once, as a row in spec/design_output/doors.md, and its ask lives on the ticket

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
