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
group: read-topics-land-in-shadow
parent: read-topics-land-in-shadow
step: do
record:
  - step: do
    hand: box d84d03dd63d7 · claude-code-remote
    hash_before: c8f4bca31adcdaf299c08677a278be0054152eb4
    hash_after: c8f4bca31adcdaf299c08677a278be0054152eb4
    answered:
      - name: tests
        exit: 0
        said: green, 30 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/vale-ls-windows-trial.md:41:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: 6e4910880d55ee40
        size: 524
    def: df12650931d480c9
reason: done
---

# Ask

gain: a branch review runs the check with the branch's own front writer, so the mint test meets a binary and the review answers what the branch holds.

breaks: every branch review answers red on the mint contract test, because the worktree carries no `se-front` and only the install builds one.

done_when:

- `./RUNME.sh test test/level0/review.test.js` answers green, with a case asserting the build lands in the worktree's bin before the check
- `./RUNME.sh branch review read-topics-land-in-shadow` names no failing test

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/review.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The branch review runs the check in a fresh worktree, which carries no se-front, and only the install builds one. So every review failed the mint contract test. checkOn in src/scripts/work-review.js now builds the branch own se-front into the worktree bin before the check, with the go path the survey names and the exe name on a windows box. The design table in spec/design_output/review.md carries the row.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the review builds se-front, and branch review answers its check passes
- the cleanup the change reveals stays in it: the platform comes off the doors bundle, as OutsideInDoors asks
- the build path reads BUILDS in src/scripts/go-source.js, so the source folder stands in one place

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
