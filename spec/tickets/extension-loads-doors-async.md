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
    hash_before: bcd69097e94fe8d4d959c8196b51c4526fa90e2e
    hash_after: bcd69097e94fe8d4d959c8196b51c4526fa90e2e
    answered:
      - name: tests
        exit: 0
        said: green, 7 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "    1.7  test/contract/front.test.js set, drop, entry and after write what se-front writes over tickets of this tree"
    inputs:
      - name: ask
        hash: 1b48fee2d14c54ff
        size: 280
    def: 42cfda0a032b94c3
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the extension loads as CommonJS and reaches the ESM doors only by `await import` off `homeOf` in `editor-process.js`, which itself calls `realpathSync` from `node:fs`; name how activation awaits the doors before it builds the hand, and mark the `realpathSync` line with its reason

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/editor-doors.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

activate awaits doorsOf in src/extension/editor-doors.js before it builds the editor door. doorsOf finds the tree off the real path of the extension link, imports clock, disk, http and proc once each out of src/doors, and hands them on as one hand. The realpath line carries the OutsideInDoors marker, since it finds the doors and cannot reach through them.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask
the cleanup stands in the change: editor-process.js loses its own door imports and takes the hand
the loading stands once in editor-doors.js, and editor-process.js points at it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
