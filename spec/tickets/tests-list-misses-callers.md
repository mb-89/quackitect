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
    hash_before: 8d836bff9a544869bed8d7170bfe07d32ec2e6f5
    hash_after: 8d836bff9a544869bed8d7170bfe07d32ec2e6f5
    answered:
      - name: tests
        exit: 0
        said: green, 7 test(s) pass in 3 file(s)
      - name: check
        exit: 0
        said: "    1.7  test/contract/desk-start.test.js a server the proc door starts detached writes its marker after its starter exi"
    inputs:
      - name: ask
        hash: 16e44b4aed09dd25
        size: 199
    def: 42cfda0a032b94c3
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the tests list leaves out `test/level0/wait.test.js` for `src/bridge/wait.js`, and `test/contract/editor-files.test.js` and `test/contract/editor-index.test.js`, which change with the extension files

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/wait.test.js test/contract/editor-files.test.js test/contract/editor-index.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The three tests the draft left out each changed with their callers. wait.test.js drives the bridge wait on a fake-clock box, and the two contract tests hand the editor files and index doors the real disk, http and clock.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask
no cleanup stands open past the change
each test names its door in its own file, and no note repeats it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
