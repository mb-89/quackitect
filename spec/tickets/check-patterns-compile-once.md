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
group: check-patterns-compile-once
step: do
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

The check module's sweep runs three functions on every line of the tree. `carriesTheName` compiles a pattern on every call, and `functionNamed` and `plainCode` run their patterns on lines that cannot match. This ticket compiles the name pattern once a name, and skips a pattern on a line missing the text it needs, so every answer stays the same.

- gain: the sweep, the twin goldens and every reader of the check module spend their time on findings, so each check waits less
- breaks: every line of the tree pays a pattern compile, and the Go part of the check grows with the tree
- done_when: `go test ./src/modules/check` passes, and its cases hold each prefilter to the pattern it guards
- done_when: `go test ./src/quack -run TestTwinGoldens` passes, and reads a shorter time than main reads on one box

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

The measure before, on a cloud box with four cores, wall seconds:

| run | seconds |
|---|---|
| `TestTwinGoldens` | 13.1 |
| `regexp.Compile` under `carriesTheName`, in its profile | 3.1 |
| `sizeFaults`, in its profile | 3.2 |
| `quack sweep` through `sweepRowsOf`, an idle box | 3.3 |
| `go test ./src/quack`, uncached | 35.1 |

The calls I took, with nobody to ask:

- `src/quack` reruns on nearly every commit, because its tests read the whole tree and the Go test cache keys on the files a test opens. Moving the whole-tree tests to a package of their own leaves many readers behind, so this ticket cuts the work they share instead.
- Each prefilter holds the same answers: the name pattern matches the name as written, every function pattern needs `func` or a closing `{`, and both cuts in `plainCode` need a quote mark or a slash.
