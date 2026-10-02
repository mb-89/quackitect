---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: install-drops-node/gate
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
group: node-leaves-the-boxes
parent: install-drops-node
record:
  - step: do
    hand: box 10b884eb9cae · claude-code-remote
    hash_before: 208bf0f050d17e97fe9c2db06d909a1f48cd09f8
    hash_after: aea15a2965a9653d3dbc1215590a89cb5759439b
    answered:
      - name: tests
        exit: 0
        said: green, 25 test(s) pass in 3 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/install-names-the-index-binary.md:41:130: Characters: The character $ stands outside the set a paragraph ad"
    inputs:
      - name: ask
        hash: 95072a7a568b1330
        size: 268
    def: 7406f0bc9df1ebf5
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

test/level0/go-source.test.js imports foldersOf, fresh and stamps, and test/level0/tools.test.js drives rebuilt on go-source.js fresh. The draft strips go-source.js to BUILDS and moves rebuilt to go-stamp.sh, so both break the check. The builder updates both in place.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/go-source.test.js test/level0/tools.test.js test/contract/go-stamp.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The install now stamps each Go binary through `go-stamp.sh`, so `go-source.js` keeps `BUILDS` alone, which `work-review.js` reads. Its stamp cases leave with its stamp. A contract case holds the packages the shell spells equal to `BUILDS`, and drives the stamp over a real module. `rebuilt` in `lib/tools.js` reads the new call, and its case names it.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: both test files read what the install does now
- the cleanup stands in the change: `foldersOf`, `fresh` and `stamps` leave, and `goFoldersOf` stays for `tui-build.js`
- `BUILDS` owns the packages, and the shell's copy names it beside the copy

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
