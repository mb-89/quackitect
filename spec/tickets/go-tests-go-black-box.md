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
group: code-is-pure-tests-behave
depends_on: [black-box-tests-guard-reports]
step: do
record:
  - step: do
    hand: box 7b5a2726379b · claude-code-remote
    hash_before: c4521dd1216f67e327e61ab6df5f31a10c65b09e
    hash_after: c4521dd1216f67e327e61ab6df5f31a10c65b09e
    answered:
      - name: tests
        exit: 0
        said: green, src/imports passes
      - name: check
        exit: 0
        said: "  111.4  in all"
    inputs:
      - name: ask
        hash: eeec35f4d88525d7
        size: 597
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
The battery's slowest Go packages test through their exported surface, so their tests stand through a refactor and the black-box baseline shrinks.

<!-- breaks, as text: what breaks if it is never done -->
The baseline stands whole, and the guard holds new files alone.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- the black-box baseline names no test file of `src/imports` and `src/index`, and each file left in `src/branches` and `src/quack` stands either moved or named in the Discussion with the sibling group's ticket moving it
- a test reaching an unexported name takes the exported port, or the file keeps its clause with `// level0: InPackageTest - <why>`
- `./RUNME.sh check` stands green

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/imports/blackbox_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

No new code. The go-fixtures-move-home sweep (c4521dd) already meets this ask. The black-box baseline src/imports/baseline/blackbox.txt names no test file of src/imports, src/index, src/branches or src/quack. Every in-package test file in those four packages carries `// level0: InPackageTest - <why>`, and none stands unmarked, so no file waits on a sibling group ticket. The black-box guard tests pass, and ./RUNME.sh check exits 0 on c4521dd, which matches origin.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: each done_when line holds on c4521dd, by a baseline read and a per-file marker scan
the cleanup: none revealed; the MagicNumber warnings in src/voice stand at warning, outside this ask
one place: the baseline file owns the list, and this ticket points at it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
