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
    hand: box d6f05e3a585030 · claude-code
    hash_before: 2d27a1e74c4962165211208ab7e83b8d1204d9da
    hash_after: aaf4b13440af0c8f245bc5a3fce22f999a733ae9
    answered:
      - name: tests
        exit: 0
        said: green, 28 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/queue-approach-sentence-split.md:61:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: d6a60537030d0ef4
        size: 596
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

The cold probe passes on a desk, so a desk lands its own commit on the cold path.

The probe runs the client under an empty config folder, and the client answers `Not logged in`. So every cold probe fails on a desk, and every commit touching the bridgehead or the server stays refused there.

- the probe copies the desk's login file into its fresh config folder, where one stands. A case in `test/level0/probe-cold.test.js` decides it
- a desk with no login file carries none, and the same file holds a case for it
- `./RUNME.sh probe cold` answers PASS on this desk
- `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh test test/level0/probe-cold.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The cold probe copies the desk's login file into its fresh config folder where one stands, so its client signs in and reads nothing else of the desk. The folder goes with the probe. On a desk the probe then passes every check, and a commit on the cold path lands from the desk.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the login rides in, a desk with none carries none, and the probe passes on this desk
- the cleanup it reveals rides the same commit: the stop reply that made the probe repeat its canary
- the login file's name stands once, in src/scripts/probe-cold.js, and the design chapter points at the probe

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
