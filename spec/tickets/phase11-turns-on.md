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
step: do
record:
  - step: do
    hand: box d8921a909c1fa5 · claude-code-remote
    hash_before: 3182759b673723d925497019b1dd0ad7894aa25a
    hash_after: 3182759b673723d925497019b1dd0ad7894aa25a
    answered:
      - name: tests
        exit: 0
        said: green, 8 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "   61.6  in all"
    inputs:
      - name: ask
        hash: 0eeadcb2fc48d726
        size: 402
      - name: [[spec/tickets/node-leaves-the-boxes]]
        hash: e6099ee6a209fa79
        size: 213
      - name: [[spec/tickets/quack-holds-a-verb-registry]]
        hash: 0c6937b1a801ee73
        size: 294
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

Phase 10 stands switched over now that [[spec/tickets/node-leaves-the-boxes]] has closed on main. The owner chose the verbs port as phase 11, and its groups stand open on their branches. Turning `migration.phase11` on lets boxes take [[spec/tickets/quack-holds-a-verb-registry]] first, then each verb group in parallel.

- `./RUNME.sh config` reads `migration.phase11 true`
- `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/work-switch.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Phase 10 closed on main when node-leaves-the-boxes merged. The check stood green on Linux and Windows on its merge commit. The owner then chose to port the remaining Node verbs to Go as phase 11. A box opened its groups and their branches. So the coordinator turns the switch on, and the work routine and the coordinator's boxes take the groups, the registry first.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: one key in spec/config/level0.json
- the cleanup it reveals: none
- every fact stands once: the run lives on this ticket and the pull request

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
