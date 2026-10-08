---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: extension-imports-stay-inside/gate
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
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: javascript-leaves
parent: extension-imports-stay-inside
record:
  - step: do
    hand: box fb4ccb7cacc7 · claude-code-remote
    hash_before: 5a84a085ba4d26c38b1cac250dec207cfa53eb65
    hash_after: ee2ef62ce43cc7ea52aee6bd83a8beca05596022
    answered:
      - name: tests
        exit: 0
        said: green, 51 test(s) pass in 5 file(s)
      - name: check
        exit: 0
        said: "    1.8  test/contract/front.test.js set, drop, entry and after write what se-front writes over tickets of this tree"
    inputs:
      - name: ask
        hash: eddc2412e9bd19a1
        size: 352
    def: 19d6e7162adba5fa
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

test/level0/logbook.test.js imports SESSION from .claude/skills/level0/lib/log.js and fakeDisk from src/doors/fake/disk.js, so the done test itself pins the log library and the doors the ask means to free. The done grep reads src/extension alone and misses it. Give the test its own session path and fake, or name the Go owner, so both files can leave.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/logbook.test.js test/level0/binding.test.js test/level0/fields-to-fill.test.js test/level0/lens-v1.test.js test/level0/lens.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The logbook test imported SESSION from the level0 log library and fakeDisk from the doors, so the test itself held both in the tree. It now reads the log path the fake index writes, LOG in test/level0/v1-index.js, and a memory disk that file now exports beside v1Over. So the logbook test imports neither the level0 lib nor src/doors, and both can leave with extension-imports-stay-inside.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: the test takes its own session path and fake, from the fake index file it already reads
the other tests over v1Over keep fakeDisk, since the ask names the logbook test alone, and they run green
the log path stands once, as LOG in v1-index.js, and the test imports it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
