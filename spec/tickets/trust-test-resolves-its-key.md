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
    hand: box d6f05e3a585030 · claude-code · the owner says so
    hash_before: 65cf3783cd915bc24e18dc1a7bc91569a6be8cd5
    hash_after: 65cf3783cd915bc24e18dc1a7bc91569a6be8cd5
    answered:
      - name: tests
        exit: 0
        said: green, 9 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/trust-test-resolves-its-key.md:33:1: CodeSpans: A sentence holds 4 code spans, and this one holds 5. Carry "
    inputs:
      - name: ask
        hash: 2bf0feb5d64326db
        size: 630
    def: df12650931d480c9
reason: done
---

# Ask

The trust test at `test/level0/trust.test.js` looks up the project key `join("/tree")`, while `main` in `src/scripts/trust.js` keys the folder `resolve(argv[2])`. On Linux both read `/tree`. On Windows `resolve` adds the drive and `join` adds none, so the key the test reads stands empty. [[one-reader-names-the-home]]

The gain is a check that goes green on a Windows desk, so the push from that desk lands.

Without it the check stays red on a Windows desk, and the pre-push hook refuses every push from there.

- `node --test test/level0/trust.test.js` is green on a Windows desk
- `./RUNME.sh check` exits 0 on the head commit

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test test/level0/trust.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The trust test reads the project key through `resolve`, as `main` in `src/scripts/trust.js` writes it. The test read it through `join`, which keeps no drive letter. On Linux the two agree, so the test passed on the box that wrote it and failed on a Windows desk.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the test reads the key the way `main` writes it
- the cleanup it reveals: no check runs on Windows before trunk takes a push, parked as the note `check-runs-on-no-windows`
- the key stands in `main` alone, and the test reads it through the same call

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
