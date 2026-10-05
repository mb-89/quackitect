---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: check-verbs-port-to-go/gate
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
group: check-verbs-run-in-go
parent: check-verbs-port-to-go
record:
  - step: do
    hand: box bf0e991d1270 · claude-code-remote
    hash_before: e782d01f31b2488541c84ff811019d17c4abb35e
    hash_after: e782d01f31b2488541c84ff811019d17c4abb35e
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "   58.9  in all"
    inputs:
      - name: ask
        hash: 556ef3c5f99fff4f
        size: 404
    def: 758db3e91dbc96cf
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the callers list misses test/level0/pull-fields.test.js (expectedRed), test/level0/cli-reporter.test.js (TEST_PARTS, testArgv), test/level0/probe-dry.test.js (probeApart, which the draft removes), test/contract/stub.test.js and test/level0/stub.test.js (verbs/check.js), test/level0/work-group.test.js and test/level0/bash.test.js (the node verbs/check.js command); the implement step moves or drops each

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/check_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The draft callers list of check-verbs-port-to-go left out seven test files that reach code the group removes. The box confirmed each one with a search of src and test, and wrote the full list into the Discussion of check-verbs-port-to-go, so the implement step moves or drops the cases each names. The search also named the tree golden and pull-kept.test.js, which carry the names in ticket text and a link alone, so neither joins the list. The change touches no code, so the Go test of the check stands as its test.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: each caller it names stands in the list the implement step reads
- the search reveals no cleanup past the list
- the list stands once, in the Discussion of check-verbs-port-to-go, and this evidence points at it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
