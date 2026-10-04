---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: config-verbs-port-to-go/gate
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
group: config-verbs-run-in-go
parent: config-verbs-port-to-go
record:
  - step: do
    hand: box 6183eb94e809 · claude-code-remote
    hash_before: 911a81a7753b8d06047652048e485a6e374ddcdc
    hash_after: 51b7a04a8f9ba19b4033fd96cc55b7d0b28e82c6
    answered:
      - name: tests
        exit: 0
        said: green, src/projection passes; green, src/quack passes
      - name: check
        exit: 0
        said: "   71.3  in all"
    inputs:
      - name: ask
        hash: f2c04d8608fdf006
        size: 174
    def: 0503e3c9bab2f18c
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

verb_project.go writes under the work root, and reads its sources off the method and work layers. Land verb_project_test.go red before implement, with a case over both roots.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/projection src/quack

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The project verb runs in Go: src/projection ports the four shapes, and verb_project.go reads each source off the method root with the work root over it, then writes and removes the targets under the work root alone. A case over two roots shows a method source still projecting, a work source winning, and the targets landing under the work root. The Go verb over the tree writes every target as it stands. Its program and project() in cli-check.js left the tree.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: both roots, and the case over them, which the helper wrote before the verb read SE_WORK_ROOT
- the cleanup it revealed: two broken pointers and a folder pointer, fixed in their own commits
- each path the package spells again names its owner in a comment beside it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
