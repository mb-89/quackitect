---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-log-becomes-a-view/gate
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
group: tui-shell-lands-in-shadow
parent: the-log-becomes-a-view
record:
  - step: do
    hand: box d857a59424d7 · claude-code-remote
    hash_before: 0a031751506ad0219ece98b0ce62b562c411b844
    hash_after: af4cb632045dde784b0988fcc12601fecae0750b
    answered:
      - name: tests
        exit: 0
        said: green, src/tui/log passes
      - name: check
        exit: 0
        said: "spec/tickets/vale-ls-windows-trial.md:41:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: e81cea10d5a2ff52
        size: 339
    def: 8a94143eab7e05cb
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

no case draws the log view over fake rows, as the ask's second done_when line names; the shadow cases compare and write rows, and TestTheLogBaseFileDeclaresTheLogView reads the file alone. Add a case beside TestTheWorkViewDrawsOverAFakeWorkRows that builds the log view off spec/views/log.base over fake log/rows and asserts the drawn rows

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/tui/log

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

A new ViewOver in src/tui/log builds the log view off spec/views/log.base over log/rows rows, and TestTheLogViewDrawsOverAFakeLogRows draws it over fake rows and asserts the header and both rows. The log package now imports the tree package, so the layout table and the tui chapter say so.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the case sits beside the work view case and draws off log.base
- the cleanup it revealed, the layout table row, is in the change
- the import fact stands in the tui chapter, and the layout test reads the same row

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
