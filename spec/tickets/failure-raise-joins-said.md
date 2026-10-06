---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: failure-verbs-raise-and-register/gate
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
group: failures-stand-registered
parent: failure-verbs-raise-and-register
record:
  - step: do
    hand: box 83c32b2b4d58 · claude-code-remote
    hash_before: 0a08ffdc928de9783c14dd9db25926b7832401ca
    hash_after: 0a08ffdc928de9783c14dd9db25926b7832401ca
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "    1.7  test/contract/desk-start.test.js a server the proc door starts detached writes its marker after its starter exi"
    inputs:
      - name: ask
        hash: bc973c5289454577
        size: 204
    def: 9da33ea199bff5a7
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

raise <id> [said...] hands each word to failure.Raise as its own Said entry, so an unquoted message prints one word a line through Lines while Row joins them. Join the words into one message before Raise.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/quack/verb_failure_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

failure raise joins the words past the id into one message before it calls failure.Raise. An unquoted message now prints as one line, the same text the log row carries, and TestFailureRaisePrintsTheNodesLinesAndWritesItsRow asserts both.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the words join before Raise
- the cleanup the change reveals is none past the join
- the join stands once, in the raise verb

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
