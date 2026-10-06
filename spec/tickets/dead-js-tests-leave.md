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
group: dead-tests-and-code-leave
cloud: true
step: do
record:
  - step: do
    hand: box d2c15bcb53d2 · claude-code-remote
    hash_before: e41d59048af12698017ca43c2ffb6427574f6326
    hash_after: 8094440a2274ea9291f2693ca450367ff3816f20
    answered:
      - name: tests
        exit: 0
        said: green, 63 test(s) pass in 7 file(s); green, src/quack passes
      - name: check
        exit: 0
        said: "  107.1  in all"
    inputs:
      - name: ask
        hash: 955b950397a619b3
        size: 655
    def: df12650931d480c9
reason: done
---

# Ask

The JS test files the JS test audit marks DELETE leave with the unloaded modules behind them, so the suite tests only code that runs.

The check keeps running tests of code nothing loads. A reader keeps meeting a bridge server, rule, prose and schema modules, verb programs and golden writers that no path calls.

- the tree holds no test file `audit/test-audit-js.txt` marks DELETE, re-verified against the tree, and no unloaded module it tests
- `sym.cjs` on the audit branch decides what loads
- the JS take-path test files stay for `js-take-path-leaves`
- the live test/level0 files stay for level-zero-becomes-a-typed-mod
- `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/handover.test.js test/level0/findings.test.js test/contract/tree.test.js test/contract/stop-rules.test.js test/level0/cage.test.js test/level0/hooks.test.js test/level0/outside-hand.test.js src/quack

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The D1 to D4 test files of the JS audit leave, re-verified against the tree with .se/scripts/jsverdicts.py, and so do the source modules .se/scripts/jsorphans.py names as loaded from no entry and held by no staying test. The check then named eleven bridge modules left with no test, imported only by the dead bridge doors guidance, stop and write. Those three doors leave with them, and so do the cases in cage, hooks, outside-hand and stop-rules that drive the doors. handover.js keeps RESUME, its one live symbol, and findings.js drops the Vale cache branch, each with a test. trust.js, the drawing bundle route.mjs, the helpers pull-schema, pull-doors and drawn-twin, and the wire door contract test stay, because a staying file loads each. The tree test reads the Go stop door for the mechanical checks.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: the D groups leave, with the take path and the live test/level0 files kept; it departs where a staying file loads a D-marked file, and keeps that file
the cleanup the change reveals is in the change: the cold path lists, the root list, the argv test and two owner comments point at standing files; the provenance comments in Go headers stand as the note on this ticket
every fact the change adds stands in one place: the new tests import RESUME and READ instead of restating them, and the tree test reads the stop door files

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
