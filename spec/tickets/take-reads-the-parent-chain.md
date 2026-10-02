---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: groups-hold-groups/gate
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
parent: groups-hold-groups
record:
  - step: do
    hand: box d7e2326ed644e · claude-code-remote
    hash_before: 82066f02b159841ae10247f3a3199be30268a22e
    hash_after: 757d9d6bdb75ba20805c753cf9a73c19a71ae9d1
    answered:
      - name: tests
        exit: 0
        said: green, 2 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "src/scripts/work.js:67:1: correctness/noUnusedImports: Several of these imports are unused."
    inputs:
      - name: ask
        hash: a113cb2f16b6d56e
        size: 218
    def: 7803caee80b1d4db
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

`branch take`, the trigger and `pull-hand.js` call `freeIn` over `readWork(it)` with no trunk, so they miss an ancestor's wait and a parent standing on `main` alone. Only the dispatch reads the chain after this ticket.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/work-chain.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The take and the trigger read the free branches through readFree in src/scripts/work-free.js. It reads the refs and main once and hands the trunk to freeIn, as the dispatch does. So a group whose parent stands on main alone, waiting on an open group, stays at todo, and the take names that wait. The pull reaches the take through it.take, so it reads the chain too. The two cases in test/level0/work-chain.test.js go red with the change undone.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: both callers read main, and the pull reaches the take
- the cleanup it reveals is the wait message, which now reads the trunk too
- readFree holds the read once, and both callers call it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
