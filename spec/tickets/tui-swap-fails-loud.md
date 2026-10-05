---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: window-verbs-run-in-go/accept
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
group: window-verbs-run-in-go
parent: window-verbs-run-in-go
record:
  - step: do
    hand: box 05659fab4226 · claude-code-remote
    hash_before: e51f75d3d998f9c0fcfb98e6c6d5e007f683904e
    hash_after: e74788319d1fed3e50923fdc27d901ddb3407278
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "   70.1  in all"
    inputs:
      - name: ask
        hash: af584c249b7618ab
        size: 134
    def: 66bb314c32a9b6ac
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

tuiVerb prints the plain rows and asks for Go when the fresh viewer fails to swap in, on a box that holds Go, where tui.js failed loud

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

tuiViewerOf answers a third value, a fault, where the viewer build lands and the rename fails to swap it in. The tui verb prints that fault and exits failed, as tui.js did when swapsIn threw. Before, the verb printed the plain rows and asked the reader to install Go on a box that already holds Go. TestTuiFailedSwapFailsTheVerbAndAsksNotForGo holds every aside name with a folder that refuses removal, so the rename fails on any box. The tui note gains the row for the failed swap.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: a failed swap fails loud and asks for no Go
- the cleanup: none revealed past the three files
- each fact stands once: the build table in spec/design_output/tui.md holds the new row, and the code links to it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
