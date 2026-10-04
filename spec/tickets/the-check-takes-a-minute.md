---
kind: [[ticket]]
state: draft
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
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

Every push and every hand-back waits on `./RUNME.sh check`, so its length sets the pace of all work. The level zero dry probe costs the most part on every run, and it spends most of its span waiting on the processes it starts. The battery runs it beside the parts after the tests, so its wait overlaps theirs.

- gain: a check spends the dry probe's span once beside the go and rules parts, and a push waits on the slower of the two
- breaks: every check pays the probe's wait on top of every other part
- done_when: `./RUNME.sh test test/level0/cli-stamp.test.js test/level0/check-server.test.js test/level0/battery.test.js` passes
- done_when: `./RUNME.sh check` twice on one box, and the second run's `battery.total` in `.se/.runtime/check.json` reads under its sum of parts

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

The measure, on a cloud box with four cores, on origin/main at the merge of #87.

The check's parts, in seconds, from `.se/.runtime/check.json`:

| part | first run, the binary rebuilt | second run, nothing changed |
|---|---|---|
| tests | 45.2 | 20.2 |
| go | 38.2 | 4.5 |
| level0 | 27.3 | 28.9 |
| rules | 6.5 | 6.5 |
| plugin | 1.0 | 1.0 |
| in all | 118.4 | 61.3 |
| wall time of `./RUNME.sh check` | 129.7 | 62.4 |

A run beside a run reads differently, for three causes:

- `go test` keeps a package's result while its inputs stand, so the go part costs seconds on an unchanged tree and the full test time after a Go change.
- The first run rebuilt the index binary, and the live index restarted on it while the tests ran.
- The parts run one after another, so every part's time adds into the total.

The Go part after a change, per package, in seconds:

| package | package time | sum of its cases |
|---|---|---|
| src/quack | 21.1 | 18.3 over 157 cases, none parallel |
| src/index | 10.5 | 9.5 over 119 cases |
| src/imports | 8.9 | 5.4 over 21 cases |

The slowest test cases in `.se/.runtime/tests.jsonl` sit near two seconds each, so no single case dominates the tests part.

The level0 dry probe costs the most on every run, and nothing caches it. It goes first.
