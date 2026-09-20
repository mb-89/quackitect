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
process: [[spec/processes/trivial]]
process_hash: 05e53b89dab63152
group: the-panel-reads-every-change
step: do
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
A rename or a delete on disk redraws both the old path and the new one, off the watcher's own change types. So a moved file leaves no row behind and gains its own.

<!-- breaks, as text: what breaks if it is never done -->
A file moved outside the editor keeps its rows on the old path until a sweep. A person then opens a problem that names no file.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- the watcher's delete and create types each redraw their path, which `src/lsp/watch_test.go` covers
- a rename in the editor leaves no row on the old path, read in the problems panel

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
