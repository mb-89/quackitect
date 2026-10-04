---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: quack-registers-each-verb/gate
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
group: quack-holds-a-verb-registry
parent: quack-registers-each-verb
record:
  - step: do
    hand: box 470a600bc22e · claude-code-remote
    hash_before: 3357b94d41c2ea8470a5898f85e11530ddfcc6f0
    hash_after: 15ee8c4bd0ce331cd00f3c4f66583248f2c92046
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "   74.5  in all"
    inputs:
      - name: ask
        hash: a4ca28b0fd3fd8d6
        size: 246
    def: d433e035639ee62a
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the third done_when line, a port adding one file and no edit of src/quack/verbs.go, meets no command. Add a check that src/quack/verbs.go and src/quack/registry.go name no verb words, or name the port diff as the checkpoint the accept step reads.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

TestVerbRegistry gains a subtest that reads verbs.go and registry.go and fails where either calls register or names the words of a registered verb. A port that edits a shared file to add its verb then fails the test, so the third done_when line meets a command. The old verbs.go named ticket yours, so the subtest fails on the tree before the change.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask, through its first road: a check over the two shared files
- the cleanup it reveals: ticket_twins_test named ticket yours as its node verb, and now names ticket open, which no file registers
- the shared files stand named once, in the test

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
