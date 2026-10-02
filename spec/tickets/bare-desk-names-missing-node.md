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
    hash_before: 74f716032f44abb86a6f363f9af0cb5d50a4e99a
    hash_after: 3cedc0104cd24778f09a8e71294aa29be05a0d25
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "spec/tickets/install-names-the-index-binary.md:41:130: Characters: The character $ stands outside the set a paragraph ad"
    inputs:
      - name: ask
        hash: dc9e2aadc96dc004
        size: 225
    def: 7406f0bc9df1ebf5
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the doctor runs on Node, so a box with no Node never reaches it. RUNME.sh and the verb road meet a bare spawn error. RUNME.sh or quack names the missing Node in one line, since the no-node case bars that line from install.sh.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/quack/verbs_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The install brings no Node now, so a box lacking it meets the verb road with a bare spawn error. `startFault` in `src/quack/verbs.go` turns a runtime missing from the PATH into one line naming it, and `RUNME.sh` says the same line where no quack binary stands. The doctor cannot say it, since the doctor runs on Node too.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: quack and RUNME.sh each name the missing node in one line
- the cleanup stands in the change: the old door's other start errors keep their text
- the line stands once in Go, and RUNME.sh spells it again because a shell script imports nothing

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
