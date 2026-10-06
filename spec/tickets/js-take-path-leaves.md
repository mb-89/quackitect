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
    hash_before: 3b8ed7cb5df58a0cc976eb04c97bc0057362dff6
    hash_after: 24e698055610283147f0bc914cba160e97b477a8
    answered:
      - name: tests
        exit: 0
        said: green, 69 test(s) pass in 10 file(s); green, src/quack passes
      - name: check
        exit: 0
        said: "   95.4  in all"
    inputs:
      - name: ask
        hash: facd8f017df545dc
        size: 607
    def: df12650931d480c9
reason: done
---

# Ask

lib/copilot-dispatch.js calls `./RUNME.sh branch take` in place of the JS work verb. The JS take path then loses its last caller and leaves with its tests.

The JS work, pull and ticket code under src/scripts stays alive for one caller. Its take-path test files keep a second take path under test beside the Go one.

- lib/copilot-dispatch.js calls `./RUNME.sh branch take`, and a test shows the call
- the tree holds none of the JS take-path test files the JS audit names
- the tree holds none of the src/scripts work, pull and ticket code they held alive, as `sym.cjs` decides
- `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/copilot-dispatch.test.js test/level0/held-tests.test.js test/level0/precommit.test.js test/level0/landed.test.js test/level0/chapter.test.js test/contract/process.test.js test/level0/route-fixture.test.js test/level0/folders.test.js test/level0/stand.test.js test/level0/outside-hand.test.js src/quack

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Copilot dispatch claims through ./RUNME.sh branch take on the process door. The old call handed it.work, which holds the work root path, to the JS work verb as a function, so every real dispatch threw before the claim. With that caller gone, the JS take path leaves: the M1 take-path tests, guidance-hand.test and save-fills, and the 47 modules no entry evaluates and no staying test imports, among them work.js, pull.js, ticket.js and every pull, ticket and work script past them. Four cuts keep the live code off the chain, judged by the ESM import closure of the entries, since an import evaluates its target whole: precommit reads held tests from the new held-tests.js, work-free and pull-landed read the hold names off work-stands and ephemeral, pull-route drops the VERBS table and holdsVerb only the dead pull read, and chapterOf and schemasHere move to chapter.js and process.js. The work, pull and ticket scripts left either load from an entry or stand held by an R1, R2 or M2 test outside this ask.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: dispatch calls branch take with a test, and the take-path tests and the code they alone held leave; it departs where sym.cjs counts a module unloaded that an import still evaluates, and there the closure decides
the cleanup the change reveals is in the change: the latent dispatch fault, the lens owner comment and the brand.js case go with it; the scripts R1, R2 and M2 tests still hold stand for the restated-tests-merge child
every fact the change adds stands in one place: chapterOf, lines and schemasHere move whole, and the tests import the owners in place of re-exports

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
