---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: javascript-reaches-through-doors/gate
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
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: doors-declare-what-they-own
parent: javascript-reaches-through-doors
record:
  - step: do
    hand: box add8d8d0dd3d · claude-code-remote
    hash_before: 38514c0db0d0e011ce7e5dbe767000871c5f465f
    hash_after: 38514c0db0d0e011ce7e5dbe767000871c5f465f
    answered:
      - name: tests
        exit: 0
        said: green, 2 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: "  119.2  in all"
    inputs:
      - name: ask
        hash: 08d28a4dff3b3a9d
        size: 305
    def: 42cfda0a032b94c3
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the draft names `src/extension/editor.js activate` as the root, but `activate` stands in `src/extension/extension.js`, the package main, which builds the editor door through `editorDoor` and requires `lib/settle.js` and `lib/lsp.js`; add `extension.js` and `test/level0/editor.test.js` to callers and size

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/extension-load.test.js test/level0/editor.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The root stands at activate in src/extension/extension.js, the package main, as the gate named. It builds the doors once and hands them to editorDoor, which passes them to the process, file and index doors, to the lsp client wait, and to the settle timer that replaces settle.js own timer.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: extension.js and its tests joined the change
the cleanup stands in the change: settle.js loses its timer, and its one caller takes door.later
the root stands once in extension.js, and editor.js takes the hand it builds

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
