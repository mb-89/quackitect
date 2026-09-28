---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: a-rewind-spares-landed-tests/gate
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
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: the-engine-fixes-its-faults
parent: a-rewind-spares-landed-tests
record:
  - step: do
    hand: box d7e2385398cd · claude-code-remote
    hash_before: 49b5c3a1872de37234af9ad316605f865b6548d6
    hash_after: 49b5c3a1872de37234af9ad316605f865b6548d6
    answered:
      - name: tests
        exit: 0
        said: green, 7 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/sync-takes-its-own-branch.md:282:1: ListItem: A sentence in a list item holds 20 words, and this one holds "
    inputs:
      - name: ask
        hash: e2d10f35154186a8
        size: 203
    def: c81a2888c939396e
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the red commit search matches the whole change `passes <leaf>`, since `passes design/tests-red` is a prefix of `passes design/tests-red-2` on this very route, and a startsWith read takes the wrong commit

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/pull-kept.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The red commit search in `keptRed` reads the ticket name before the colon, and each whole change after it. So `passes implement/tests-red-2` and another ticket passing the same leaf never stand for the red commit. The search landed with a-rewind-spares-landed-tests, and this case proves it against both decoys.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the search matches the whole change, and a case holds it
- the change reveals no cleanup
- the search stands once, in `redCommit` of `src/scripts/pull-kept.js`

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
