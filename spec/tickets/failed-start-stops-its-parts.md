---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-foundation-closes-its-gaps/accept
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
group: the-foundation-closes-its-gaps
parent: the-foundation-closes-its-gaps
record:
  - step: do
    hand: box d7e2ac6b84cc · claude-code-remote
    hash_before: 7bcc827c58cf2332864d9aa0c18441a33c518d9c
    hash_after: 7bcc827c58cf2332864d9aa0c18441a33c518d9c
    answered:
      - name: tests
        exit: 0
        said: green, src/index passes
      - name: check
        exit: 0
        said: "src/index/door.go:1:1: FileCeiling: A file holds 600 lines, and the file holds 608. Split it by topic."
    inputs:
      - name: ask
        hash: 452bfec158587a29
        size: 186
    def: 0ed6eff0a1a99c52
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the door's start in `src/index/door.go` returns on a failed listen or `/v1` start and leaves the beats, the IO modules and the scheduler running. Run the stop over what the start reached

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh branch test src/index/failed_start_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The door's start in `src/index/door.go` now keeps an undo list of each part it starts: the database, the scheduler, the manager, the IO modules, the old API server and the beats. A failed sweep, listen or `/v1` start runs that list newest first and answers the error, so nothing the start reached keeps running. Before, the listen and `/v1` failures closed the server and the database alone. The start takes its listen through `opensOn`, so a case fails the `/v1` port and reads every part stopped.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask, and it also covers the failed sweep, which leaked the database the same way
- no other cleanup shows: the running door's stop keeps its own order
- the undo list stands in the start alone, and the case points at the index note

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
