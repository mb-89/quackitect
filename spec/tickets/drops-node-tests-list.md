---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: program-of-drops-node/gate
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
group: the-node-road-closes
parent: program-of-drops-node
record:
  - step: do
    hand: box 89f685f4bb16 · claude-code-remote
    hash_before: 57a378802dcfa343cdaeb3e42230c7ac06b114a9
    hash_after: 57a378802dcfa343cdaeb3e42230c7ac06b114a9
    answered:
      - name: tests
        exit: 0
        said: green, 12 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "    2.2  test/contract/front.test.js set, drop, entry and after write what se-front writes over tickets of this tree"
    inputs:
      - name: ask
        hash: c5d29b4238b330b6
        size: 63
    def: c908f075c406526d
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

draft tests list names cases tests-red never wrote, so align it

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/contract/ticket.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The draft of program-of-drops-node named a programs_test.go case tests-red never wrote. The Discussion of that ticket now names the cases tests-red wrote, in the Go file and the contract file, and says no programs_test.go case stands.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask, written under Discussion since the draft leaf stands passed
- no cleanup comes out of this, since the build touches the same files
- the corrected list stands once, under the ticket Discussion, beside the size list

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
