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
group: check-patterns-compile-once
step: do
record:
  - step: do
    hand: box 819347f31bce · claude-code-remote
    hash_before: 37c72714005f7ad312aedcf1ef2d7ce89c3690a5
    hash_after: 37c72714005f7ad312aedcf1ef2d7ce89c3690a5
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/check passes
      - name: check
        exit: 0
        said: "    2.4  test/contract/runme-road.test.js ./RUNME.sh hands get to quack, which reads the verbs slice off the index"
    inputs:
      - name: ask
        hash: b941e4488dcd7ff5
        size: 807
    def: df12650931d480c9
reason: done
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

./RUNME.sh branch test src/modules/check/textfaults_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The check module compiles the word pattern for a name once, and skips it on a line missing the name. functionNamed and plainCode skip their patterns on a line missing the text every pattern needs. Each prefilter answers what its patterns answer, and TestTwinGoldens holds the findings over the whole tree.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the three prefilters stand, and the twin test reads 5.6s against 11.5s
- the cleanup: the whole-tree tests in src/quack bust its Go cache, and the ticket says why they stay
- one place: each prefilter names the pattern it guards, and the test holds the two together

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

The measure after, on the same box, wall seconds:

| run | before | after |
|---|---|---|
| `TestTwinGoldens`, one test binary each, run back to back | 11.5 | 5.6 |
| `go test ./src/quack`, uncached | 35.1 | 30.4 |

The twin goldens pass unchanged over the whole tree, so the sweep reads the same findings.

The calls I took, with nobody to ask:

- `src/quack` reruns on nearly every commit, because its tests read the whole tree and the Go test cache keys on the files a test opens. Moving the whole-tree tests to a package of their own leaves many readers behind, so this ticket cuts the work they share instead.
- Each prefilter holds the same answers: the name pattern matches the name as written, every function pattern needs `func` or a closing `{`, and both cuts in `plainCode` need a quote mark or a slash.
