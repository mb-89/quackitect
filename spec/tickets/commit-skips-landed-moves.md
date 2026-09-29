---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
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
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: the-engine-fixes-its-faults
step: do
record:
  - step: do
    hand: box d7e124b659cd · claude-code-remote
    hash_before: a4e516894ec3d8459cb625c066a17b4fb05f923f
    hash_after: 9b99003ce67a043fd90f8e8fccdc039c8dd71b3d
    answered:
      - name: tests
        exit: 0
        said: green, 23 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-queue-views-agree.md:241:1: CodeSpans: A sentence holds 4 code spans, and this one holds 10. Carry the "
    inputs:
      - name: ask
        hash: 40ce2a8edc5aabf9
        size: 601
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

The commit verb lands a file that a rename moved long ago, so a ticket keeps its commits after its rename lands.

Without it, `movedFrom` in `src/scripts/commit-verb.js` takes every move the undo journal holds. An old path that left `HEAD` then joins the pathspec of `git commit`, and git refuses it. So every commit naming a renamed ticket's file fails until the journal entry leaves. A desk met it on `the-engine-fixes-its-faults`.

- a case in `test/level0/commit-verb.test.js` commits a file whose journaled old path stands nowhere
- `./RUNME.sh test test/level0/commit-verb.test.js` answers green

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh test test/level0/commit-verb.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

`movedFrom` in `src/scripts/commit-verb.js` takes a journaled old path only where the staged delta names it, or where the disk or the index still holds it. A rename that landed long ago leaves its old path nowhere, so that path now joins no pathspec, and git commits the renamed file. A staged deletion of the old path still rides the same commit, as the older cases hold.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: a case commits a file whose journaled old path stands nowhere
- the check reuses `stagable` and the staged delta the function already reads, so it adds no git read
- the rule stands once, beside `movedFrom`, and points at this ticket

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
