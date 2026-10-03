---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: node-leaves-the-boxes/accept
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
parent: node-leaves-the-boxes
record:
  - step: do
    hand: box 3f5d7b2a1399 · claude-code-remote
    hash_before: 52bd72c6a837525a4d2c1be2fb335f239e890d9f
    hash_after: 2087030d5a99696f8c521f51dab39a2fba3db8e6
    answered:
      - name: tests
        exit: 0
        said: green, 7 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "   73.7  in all"
    inputs:
      - name: ask
        hash: 3b39fe8b86891e4f
        size: 160
    def: 22963c491c71f419
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

on Windows cmd answers exit 9009 where no code stands, and the setup reads that as missing. The setup reads 9009 as no code, so the extensions skip as on Linux.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/setup.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

On Windows the setup reaches the editor command through cmd, and cmd answers its own exit where no such command stands. The setup reads that exit as no editor, so a Windows box with none skips the extensions, as a Linux box does.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the point the accept gate names
- the change reveals no cleanup past itself
- the exit cmd answers carries a name once, at the top of the setup verb

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
