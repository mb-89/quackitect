---
kind: [[ticket]]
state: open
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: seed-survives-bad-files/gate
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
point: gate
todo: true
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: edits-and-files-hold
parent: seed-survives-bad-files
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

The ask says the files watch still starts past a folder that refuses a read, and the approach changes the seed's walk alone. watch.adds in src/modules/files/watch.go returns every WalkDir error and every eyes.Add error, so Changes fails, Seeds returns that error after the seed commits, and a folder the seed walks past still stops the watch. Route the errors under the root in watch.adds through walkPast, let an Add refused under the root cost that folder alone, name Changes and hears as callers, and add a red case over the adder seam where a folder refuses its Add and the watch still starts.

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
