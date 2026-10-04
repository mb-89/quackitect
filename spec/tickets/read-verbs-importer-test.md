---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: read-verbs-port-to-go/gate
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
todo: false
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: read-verbs-run-in-go
parent: read-verbs-port-to-go
record:
  - step: do
    hand: box af8a15ff4571 · claude-code-remote
    hash_before: a1d4d2cc951e5e5f4c59358dbd558c97e8430776
    hash_after: 417a1f72b916abf6efcd2d15822f27cfc2593b2f
    answered:
      - name: tests
        exit: 0
        said: green
      - name: check
        exit: 0
        said: "   52.8  in all"
    inputs:
      - name: ask
        hash: f288eea32241aa5f
        size: 146
    def: 4d5ec233e043428a
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

no test decides the importer line of the ask. `TestReadVerbsLeaveNode` checks the six programs alone, so `log-verb.js` can stand with no red test.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

go test ./src/quack -run TestReadVerbsLeaveNode && echo green

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

TestReadVerbsLeaveNode in src/quack/verb_read_test.go takes a case that decides the importer line of the ask: log-verb.js stands nowhere under src/scripts, and no JavaScript file under src imports log-verb.js or a program of the six verbs. The test goes green with the removal, so this ticket carries it: the six programs, log-verb.js and its two tests leave, asksIndex leaves cli-read.js, logRowsOf leaves quack-topic.js, and the filters only the log verb read leave log-read.js. The reads the window keeps off log-read.js keep their cases in a new test/level0/log-read.test.js. Two contract tests read every verb of the table as a program: verb-programs.test.js now loads the programs that stand, and cli-leaves.test.js keeps its half that no program stands past the table.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the test decides the importer line, and the removal it needs lands beside it
- the cleanup the change reveals is in the change: the orphaned exports, the two contract tests, and a comment naming a deleted file
- every fact stands in one place: the module list stands in readModules alone

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
