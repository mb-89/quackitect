---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-bridge-outlives-its-starter/gate
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
parent: the-bridge-outlives-its-starter
record:
  - step: do
    hand: box d7e124b659cd · claude-code-remote
    hash_before: bb4f35dcce7f7bf75f7c775ae6cf4f108995070e
    hash_after: 547d66d4ce1e3a7acea483162a46ca16ba2a9454
    answered:
      - name: tests
        exit: 0
        said: green, 24 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-queue-views-agree.md:241:1: CodeSpans: A sentence holds 4 code spans, and this one holds 10. Carry the "
    inputs:
      - name: ask
        hash: fab1fdab848e4410
        size: 364
    def: b55bbe11bbd0f8bf
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

`boxesOf` in `src/bridge/server.js` keys a box on the raw root, and `answersEvent` hands it the root each event carries, so a `C:` root and a `c:` root build two boxes on one server. On this desk the standing bridge runs from a `C:` root, and the register names a `c:` one. The key folds the way `same` in `.claude/skills/level0/lib/vehicle.js` compares two paths.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh test test/level0/box-keys.test.js test/level0/vehicle.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

`boxesOf` in `src/bridge/server.js` keys each box on `rootKey`, the fold `same` in `.claude/skills/level0/lib/vehicle.js` compares by. A `C:` root and a `c:` root now reach one box on one server, and the box keeps the root it first meets. A POSIX root keeps its case, so two roots differing in case alone still build two boxes.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the key folds the way `same` compares
- `same` now reads `rootKey`, so one fold serves both, and `server.js` stays under the file ceiling
- `rootKey` states the fold once, and the server points at it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
