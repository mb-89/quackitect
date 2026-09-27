---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: doors-read-what-commands-do/design/review
    by: anyone
    to: retro
    input: ask
    reads: [[spec/guidance/working]]
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
process_hash: 05e53b89dab63152
group: the-verbs-land-whole
parent: doors-read-what-commands-do
record:
  - step: do
    hand: box d1fe1ca62214 · claude-code-remote
    hash_before: 728c4e0e3e95854d789d02cba58b0fb35d4db242
    hash_after: 728c4e0e3e95854d789d02cba58b0fb35d4db242
    answered:
      - name: tests
        exit: 0
        said: green, 37 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-verbs-need-no-wrapper.md:184:1: ListItem: A sentence in a list item holds 20 words, and this one holds "
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

step 2 names both a gate list (a test, a check, a commit) and a read list (`cat`, `grep`, `ls`, `git status`); refuse every segment before `;`, `||` or `&` except one on a read list, so an unnamed gate still refuses

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

    ./RUNME.sh test test/level0/bash.test.js

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

`gatesLoosely` in `lib/bash.js` counts a segment before `;`, `||` or `&` as a gate unless every command of its pipeline stands in `READS` or `GIT_READS`. So a gate nobody listed, as `true`, still refuses. The cases in `test/level0/bash.test.js` hold both sides.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask, and it landed with the implement step of `doors-read-what-commands-do`
- no cleanup stands open
- the read words stand in `READS` and `GIT_READS` alone

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
