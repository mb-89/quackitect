---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: remaining-js-names-its-reason/gate
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
group: javascript-leaves
parent: remaining-js-names-its-reason
record:
  - step: do
    hand: box ba1101ec7b2d · claude-code-remote
    hash_before: ba80cc5a7ad40f6e4718037b6afa1c3b479a3fd9
    hash_after: ba80cc5a7ad40f6e4718037b6afa1c3b479a3fd9
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "   85.1  in all"
    inputs:
      - name: ask
        hash: 450e25d27dd26f6b
        size: 509
    def: 6d8d4db4b183406b
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the src/doors/ and test/ rows cover a folder, so a new JavaScript file there passes the part with no reason of its own, which is the regrowth the ask names. The builder narrows those two rows to one file a row, or one reason a test subfolder that holds only tests of code that stays, while it writes the table. The rows otherwise cover every file git ls-files lists today, and the reasons for src/extension/, both hook folders, the Vale scripts and prototype/trace-view/ match the group ask and its inventory.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/quack/check_lines_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The table under The JavaScript that stays in [[spec/design_output/doors]] names each door and fake under src/doors one file a row. The test rows stand one a subfolder: test/contract/ and test/level0/ each hold only tests of code a row above names, and test/battery-reporter.js stands as its own row. A new door or fake now needs its own row and reason, so the javascript part of the check refuses its regrowth. Commit 0553c20f9 carries the change.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: src/doors stands one file a row, and each test subfolder keeps one reason since every file there loads only code that stays
- the cleanup it reveals is none: every row covers a tracked file, which the javascript part of the check asserts
- each fact stands once: the reasons stand in the doors note, and the check reads them there

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
