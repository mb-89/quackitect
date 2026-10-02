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
group: the-sweep-prepares-once
step: do
record:
  - step: do
    hand: box 819347f31bce · claude-code-remote
    hash_before: c74f003cae36666df233a59609f118a80cd210e0
    hash_after: c74f003cae36666df233a59609f118a80cd210e0
    answered:
      - name: tests
        exit: 0
        said: green, src/index passes
      - name: check
        exit: 0
        said: "    2.6  test/contract/one-reading.test.js the lint reads each row of the sweep once"
    inputs:
      - name: ask
        hash: 22747682946c3b53
        size: 560
    def: df12650931d480c9
reason: done
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

./RUNME.sh branch test src/index/index_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

lines in src/index/index.go prepares the full-text insert once a file, where it prepared one a line. The rows stand as before, and a cold sweep of this tree reads about 7.0s against 8.4s.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the insert stands prepared once a file, and the measure stands under Discussion
- the cleanup: the placements start a module process a quarter second apart, and that is the next ticket
- one place: the statement stands once, in lines

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
