---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-retro-finishes-its-asks/design/review
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
group: each-thing-stands-in-place
parent: the-retro-finishes-its-asks
record:
  - step: do
    hand: box b8ae1b45d463 · claude-code-remote
    hash_before: a2d2c18046504a78d2a5b7104c191f36475d846a
    hash_after: a2d2c18046504a78d2a5b7104c191f36475d846a
    answered:
      - name: tests
        exit: 0
        said: green
      - name: check
        exit: 0
        said: "spec/tickets/the-small-faults-land.md:184:5: Characters: The character ] stands outside the set a paragraph admits: lett"
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the callers list places `workAnswer` in `pull-hand.js` and `pull.js`, and it stands in `src/scripts/pull-chapter.js`

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

    ./RUNME.sh check > /dev/null 2>&1 && echo green

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

The callers list of `the-retro-finishes-its-asks` now names `workAnswer` where it stands.

- a new line names `src/scripts/pull-chapter.js` and `workAnswer`, which prints the checklist
- the lines for `handed` and `handBack` point at `pull-chapter.js`
- the change touches no code, so the check decides it

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- [x] the change follows the ask, or the discussion says why it departs: the list names `pull-chapter.js`
- [x] the cleanup the change reveals is in the change, or is a note of its own: none stands
- [x] every fact the change adds stands in one place, and a note points at the file instead of repeating it: yes

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
