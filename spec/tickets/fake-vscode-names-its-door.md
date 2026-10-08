---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-guard-refuses/gate
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
group: doors-declare-what-they-own
parent: the-guard-refuses
record:
  - step: do
    hand: box dcf1ea3c64fd · claude-code-remote
    hash_before: 0fb6793d9d9b80db846975963c82643ee19b8c28
    hash_after: fc6ba895203aa6591a5e765c28f61b35a1efb8fa
    answered:
      - name: tests
        exit: 0
        said: green, 23 test(s) pass in 5 file(s)
      - name: check
        exit: 0
        said: "   64.4  in all"
    inputs:
      - name: ask
        hash: b24b77b9aed73d90
        size: 307
    def: 1ba1f1de37804f52
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the draft says no undeclared impure node: import stands, and src/doors/fake/vscode.js imports node:module, held by no door in src/doors/owns.yaml. Once jsWalks names an undeclared module, that line walks around no door and the check goes red. Name the file under a door owning node:module, or mark the line.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/editor-doors.test.js test/level0/extension-load.test.js test/level0/fields-to-fill.test.js test/contract/editor-index.test.js test/contract/editor-files.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The fake vscode reaches node:module twice: it imports createRequire, and it requires the module to bend its resolver so vscode answers the fake. No door declares node:module. Once the guard names an undeclared module, both lines would walk around no door and turn the check red. Both lines now carry the marker with its reason. The fake bends the node loader inside the process and reaches nothing on the box, so a door would add a contract and a fake for no outside world. The five test files that load the fake pass unchanged.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask, and takes its second road: the line is marked, since node:module reaches nothing a door guards
the cleanup it reveals is in the change: the require of node:module inside editorRequire is the second walk, and it carries the marker too
the reason stands once a line, on the marker, and no note repeats it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
