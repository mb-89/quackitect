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
    hash_before: d359ad70fbba692f8ad11d36e16f85ecffecd390
    hash_after: f41183d7cf922c5e69b26ec226cb55c8a2a8d6c4
    answered:
      - name: tests
        exit: 0
        said: green, 9 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "   93.0  in all"
    inputs:
      - name: ask
        hash: df189c050e844f39
        size: 173
    def: 22963c491c71f419
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

install.sh runs the survey, the Copilot setup and the brand only where the index binary stands. The setup verb's ticket names that cost, or the steps reach a box with no Go.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/contract/install.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

A box with no Go builds no index, so the installer's hand-off to the setup verb skips there. RUNME.sh then runs each verb on node, so that road now runs the setup first, with its lines on stderr. A stop there costs one line, and the verb still runs.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the point the accept gate names, on its second road
- the installer's no-index line now names the road that runs the setup
- the setup verb stays the one owner of the steps, and both roads call it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
