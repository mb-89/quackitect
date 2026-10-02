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
    hash_before: 6a45e3712b2a7f0dcc3db69032bad124bcaa7039
    hash_after: 4ba40c18765857ca0d5e58b8c0e5be7077a6e569
    answered:
      - name: tests
        exit: 0
        said: green, 15 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: "   91.8  in all"
    inputs:
      - name: ask
        hash: 9efbbbc0ddda0128
        size: 135
    def: 22963c491c71f419
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

test/contract/fetching.js still names the modules item and leaves out browser. The list takes the items the install and the setup name.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/contract/install.test.js test/contract/stub.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The skip list a vehicle case hands the install drops the removed modules item and names browser. A contract case now holds the list equal to the install's loop and the setup's wants, so a want added to either reaches the list.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the point the accept gate names
- the drift the point reveals takes a case, so the cleanup stands in the change
- the setup owns its wants once, and the case reads them from there

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
