---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: install-drops-node/gate
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
group: node-leaves-the-boxes
parent: install-drops-node
record:
  - step: do
    hand: box 10b884eb9cae · claude-code-remote
    hash_before: 2d0893183b83ead0b4a4a9c3b9b5ee481c4db236
    hash_after: ef362b63601a5bca765d4662cc9e844faf7a22e5
    answered:
      - name: tests
        exit: 0
        said: green, 1 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/install-names-the-index-binary.md:41:130: Characters: The character $ stands outside the set a paragraph ad"
    inputs:
      - name: ask
        hash: c4a4d456be5e9418
        size: 133
    def: 7406f0bc9df1ebf5
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the stamp case builds a module with no go.sum and no git. go-stamp.sh hashes whichever of go.mod and go.sum stands, and reads no git.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/contract/go-stamp.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

`go-stamp.sh` reads no git, and hashes `go.mod` and `go.sum` where each stands, so a module with no `go.sum` stamps too. The stamp case builds such a module in a temporary folder, stamps it, reads it fresh, changes an imported package and reads it stale.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the stamp skips a module file that stands nowhere, and calls no git
- the cleanup stands in the change: an empty name from the list skips too
- the files a build reads stand once, in what go list names

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
