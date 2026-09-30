---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: groups-land-through-pull-requests/gate
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
group: the-cloud-works-its-queue
parent: groups-land-through-pull-requests
record:
  - step: do
    hand: box d7e2326ed644e · claude-code-remote
    hash_before: 7cc50adbe84f5021394acf8dee83dac6c16cedfa
    hash_after: 7cc50adbe84f5021394acf8dee83dac6c16cedfa
    answered:
      - name: tests
        exit: 0
        said: green, 25 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-queue-views-agree.md:271:115: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: fb0734f0e869769c
        size: 119
    def: c1e6301a5c8b9caf
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the take case's /push/ match passes on any line naming push; assert the switch onto work/landing and the full push line

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/work.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The take case for a stuck hand-over matched any line naming push. It now asserts the git switch onto work/landing and the full line asking for a sync, the check and a push. The change landing groups through pull requests already carries those assertions, so this ticket closes on them.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the case follows the ask: the switch and the full push line stand asserted
- no cleanup shows past the one case
- the case reads the take's own output, and copies no rule

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
