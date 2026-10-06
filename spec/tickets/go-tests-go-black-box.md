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
group: code-is-pure-tests-test-behavior
depends_on: [black-box-tests-guard-reports]
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
