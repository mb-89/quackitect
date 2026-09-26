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
    hash_before: 1fb07f024c558dce954758604d35d08aa065bb53
    hash_after: 1fb07f024c558dce954758604d35d08aa065bb53
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

anchor the `FREE` scratchpad pattern to an absolute path, as `^/.*/claude-[^/]+/.*/scratchpad/`, since the harness nests the scratchpad below a project folder and a session id, and a relative tree path holding `claude-*/…/scratchpad` stays under the rules

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

The scratchpad pattern in `FREE` in `lib/bash.js` opens at the root or a drive letter, so it reads an absolute path alone. A case in `test/level0/bash.test.js` passes three desk scratchpads and refuses a tree path of the same shape.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask, and landed with the implement step of `doors-read-what-commands-do`
- no cleanup stands open
- the shape stands in `FREE` alone

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
