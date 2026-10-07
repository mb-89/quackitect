---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: bridge-library-leaves/gate
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
parent: bridge-library-leaves
record:
  - step: do
    hand: box fb4ccb7cacc7 · claude-code-remote
    hash_before: b2e780d8edb2b03b36abfde9caec361d8ff58240
    hash_after: b2e780d8edb2b03b36abfde9caec361d8ff58240
    answered:
      - name: tests
        exit: 0
        said: green, 27 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "   78.9  in all"
    inputs:
      - name: ask
        hash: 63fbcff094603435
        size: 157
    def: 752b392ff4b72b0a
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

The cli-read.js lint cut and the vale-rows.test.js deletion touch the lint group's scripts. Record both under Discussion on javascript-leaves for that group.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test test/contract/tree.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The group ticket javascript-leaves carries one line under Discussion for the lint-without-vale group. It names the node lint bridge-library-leaves cuts out of cli-read.js, and the vale-rows test that leaves with its subject. The lint group meets both changes there before it starts.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the line stands under Discussion on javascript-leaves, as the ask says
- the change reveals no cleanup
- the line points at bridge-library-leaves for the detail, and repeats none of its approach

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
