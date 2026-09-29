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
group: loose-fixes-99f4547
step: do
record:
  - step: do
    hand: box d84f325b2110d · claude-code-remote
    hash_before: 1444f229dc0994ccff778aec9c8a02a1b150a0a8
    hash_after: 1444f229dc0994ccff778aec9c8a02a1b150a0a8
    answered:
      - name: tests
        exit: 0
        said: green, 6 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/vale-ls-windows-trial.md:41:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: f61b2873f12e4dba
        size: 565
      - name: [[spec/design_output/work]]
        hash: 8c9ad0df03f072da
        size: 40393
    def: df12650931d480c9
reason: done
---

# Ask

A draft a box mints with no group lands loose on main through the group's pull request, as [[spec/design_output/work#a-box-leaves]] rules. `branch done` then counts only the open tickets the branch adds, and a fix group reaches done.

Today `leftOpen` in `src/scripts/work-fix.js` counts an added draft as well. A fix group that mints a draft for a person stands short of done, and no box closes it.

- a case in `test/level0/work-fix.test.js` adds a draft with no group, and `leftOpen` leaves it out
- `./RUNME.sh check` exits 0

The view: none.

The source: none.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/work-fix.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

branch done counted a draft the branch adds with no group as work the group leaves open, against the table in spec/design_output/work, chapter A box leaves, and the comment on leftOpen. A fix group that minted a draft for a person then stood short of done, with no box to close it. leftOpen now keeps an added ticket only off draft, so such a draft lands loose on main through the pull request.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: leftOpen leaves an added draft out, and a group child at draft still counts
- the change reveals no further cleanup
- the rule stands once, in the design table the comment links

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
