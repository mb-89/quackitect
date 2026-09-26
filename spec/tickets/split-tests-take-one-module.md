---
kind: [[ticket]]
state: draft
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: go-code-shares-one-module/design/review
    by: anyone
    to: retro
    input: ask
    reads: [[spec/guidance/working]]
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
step: do
process: [[spec/processes/trivial]]
process_hash: 05e53b89dab63152
group: the-foundation-lands-unchanged
parent: go-code-shares-one-module
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the callers list misses the tests that assert the split layout, and each breaks under one module: `test/level0/go-modules.test.js` and `test/level0/go-tests.test.js` on `goModulesIn`, `test/level0/test-verb.test.js` on `go -C src/index test ./...` and `goModulesOf`, `test/level0/pull-leaves.test.js` on `goModulesOf`, `test/level0/go-source.test.js` on the replace-line `foldersOf`, `test/level0/viewer.test.js` on its `go build -o <exe>.new .` fake and its `src/tui/go.mod`, and `test/contract/install.test.js` on the module fetch. Rewrite each beside the caller it tests

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
