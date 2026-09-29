---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: dispatch-writes-the-bundles/gate
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
todo: false
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: the-cloud-works-its-queue
parent: dispatch-writes-the-bundles
record:
  - step: do
    hand: box d7e093d924e2 · claude-code-remote
    hash_before: 97c167bb66eb53647a3cf46c07026b28a02493fe
    hash_after: 801c7b88a35a16f6b979a0c21ea97a1ae01e20da
    answered:
      - name: tests
        exit: 0
        said: green, 24 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-queue-views-agree.md:271:115: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: 7fd07100646b3682
        size: 150
    def: 76beff46e9d5f076
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

loose-fixes-<short> holds three words, so a names.words below three overruns it; cut the name through cutTo in src/scripts/ticket.js, as the mint does

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/dispatch.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The fix group name loose-fixes plus the short main commit runs three words, so a names.words cap below three cut nothing and the name broke the cap. fixName now cuts it with cutTo, which the ticket verb already uses, and cutTo stands exported from ticket.js. A case holds a cap of two to the first two words, and a cap of five to the whole name.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the gate point: the fix name cuts with cutTo from src/scripts/ticket.js
- the change reveals one cleanup, the worktree path spelling the runtime folder, which now takes RUN from folders.js
- the name stands once in fixName

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
