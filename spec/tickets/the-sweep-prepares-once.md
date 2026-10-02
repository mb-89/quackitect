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
group: the-sweep-prepares-once
step: do
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

A fresh index sweeps every file before its door stands, and writes a full-text row for each line. `lines` in `src/index/index.go` prepared the insert again for every line. This ticket prepares it once a file, and the rows stand as before.

- gain: a fresh index stands sooner on every cloud box, in the dry probe and in every case starting one
- breaks: each line the tree adds pays a statement of its own, so the start grows with the tree
- done_when: `go test ./src/index` passes
- done_when: a sweep of a fresh clone reads shorter than main reads on one box

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

The measure: one in-process `sweep` of a fresh clone into a fresh database, three runs each way on a cloud box with four cores, wall seconds. A test file timed it and left with the measure.

| run | before | after |
|---|---|---|
| first | 8.41 | 6.86 |
| second | 8.20 | 7.23 |
| third | 8.70 | 6.99 |

The calls I took, with nobody to ask:

- A helper profiled the sweep: the full-text rows took most of it, and a fresh statement a line took a quarter of that.
- The insert stands prepared once a file, not once a sweep, so the change stays inside `lines` and its callers stand as they are.
- The cases under `src/index` hold the rows a find reads, so the change takes no case of its own.
