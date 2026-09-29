---
kind: [[ticket]]
state: open
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
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

The fake door in test/level0/sidebar-views.test.js imports a bare path, which Node refuses on Windows. The real door in src/extension/editor-files.js already turns the path into a file URL, so the fake does the same, and `check (windows-latest)` goes green.

- `./RUNME.sh test test/level0/sidebar-views.test.js` is green
- `check (windows-latest)` passes on the pull request

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

node --test test/level0/sidebar-views.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Pull request 53 failed on Windows alone. The fake door imported a drive path, and Node reads a drive letter as a URL scheme. The fake now builds a file URL, as the real door in src/extension/editor-files.js does.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: two lines in one test file
- the cleanup it reveals: none
- every fact stands once: the reason stands on the real door, and this ticket points at it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
