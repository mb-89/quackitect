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
group: the-tests-start-fewer-processes
step: do
record:
  - step: do
    hand: box 819347f31bce · claude-code-remote
    hash_before: 702956030d9ab34c0179a96c061ef5667d3d0f8f
    hash_after: 702956030d9ab34c0179a96c061ef5667d3d0f8f
    answered:
      - name: tests
        exit: 0
        said: green, 2 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "    6.6  test/contract/paragraph.test.js a character outside the set is refused, and a code span passes"
    inputs:
      - name: ask
        hash: e6d216876e42f547
        size: 705
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

The tests part of `./RUNME.sh check` starts one node process a test file. A unit test touches memory alone, so its file pays a process start for a few milliseconds of cases. This ticket runs every unit file in one process and keeps a process a file for the contract tests, which drive the real doors.

- gain: the tests part spends its time on cases, so every push and hand-back waits less
- breaks: each new unit file adds a process start to every check on every box
- done_when: `./RUNME.sh branch test test/level0/cli-reporter.test.js` passes, and its cases hold the two parts
- done_when: `./RUNME.sh check` reads a smaller `battery.parts.tests` in `.se/.runtime/check.json` than main reads on one box

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test test/level0/cli-reporter.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The tests part runs in two runs. Every file under test/level0 shares one process, and every file under test/contract keeps a process of its own. The table under Discussion holds the measure.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the two runs stand in TEST_PARTS, and the tests part reads smaller than main reads
- the cleanup: the two cases reading shared module state import a module of their own
- one place: TEST_PARTS in src/scripts/check-verb.js owns the split, and the ticket points at it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

The measure, on a cloud box with four cores, wall seconds:

| run | seconds |
|---|---|
| `node --test` over the unit files, a process a file | 26.7 |
| the same files in one process | 6.2 |
| `node --test` over the contract files, a process a file | 18.0 |
| the tests part on main, both folders in one run | 40.4 |

The calls I took, with nobody to ask:

- The unit files share a process through `--experimental-test-isolation=none`, which node 22 carries. A shared process breaks a case that reads module state another file set. Two cases did, and each now imports a module of its own through a query on the import path, with every assertion kept. The unit files pass in both orders in one process.
- The contract files keep a process each, because each drives a real door and some read a clock. The two parts run one after the other, so a contract case meets an idle box.
- The dry probe stays as it stands. It is the one real contract for level zero, and most of its time is the start road's own install, the road a cloud box takes. Seeding the downloaded tools saved two seconds of it.
The measure after the merge of main, on a second cloud box, wall seconds:

| run | seconds |
|---|---|
| main's form, both folders in one `node --test` | 53.5 |
| the unit files in one process | 6.8 |
| the contract files, a process a file | 21.4 |
| `battery.parts.tests` in the warm check | 29.9 |
| the warm check in all | 92.5 |

- The Go part reads its cache on a warm box. A change under a Go package reruns that package, and `src/quack` takes the most. The budget in the check names it where it grows.
