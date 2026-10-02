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
    hand: box 3f5d7b2a1399 · claude-code-remote
    hash_before: 496efb2e6b338e0bc530987657d457721e69feef
    hash_after: ebd3ebc1c7441bb71a05592721ec4d1e44ec2f97
    answered:
      - name: tests
        exit: 0
        said: green, 6 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: "    2.5  test/contract/index.test.js a stopped index leaves no se-index process past the case"
    inputs:
      - name: ask
        hash: 4915b03722cd404b
        size: 195
    def: 7406f0bc9df1ebf5
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the draft names two cases in test/level0/setup.test.js, and tests-red writes neither. A red case proves setup.js honours SE_INSTALL_SKIP and runs the survey, then the Copilot setup and the brand.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/setup.test.js test/contract/verb-programs.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The install's steps that run JavaScript gain a home: `src/scripts/verbs/setup.js` holds the editor client, the browser, the editor link and the editor extensions, each with its here, why, get and missed lines, then the survey, the Copilot setup and the brand. It honours SE_INSTALL_SKIP as the loop does. Two cases in `test/level0/setup.test.js` hold the skip and the order on fake doors. The verb table in `tree.go` lists setup. The installer still runs its own copies, and the parent's build cuts them and hands over to this verb. The cut departs from the tests-red note, which planned the moved steps as sh in `setup.sh`: a verb on the doors takes a test on fakes, and a shell script takes none.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: both cases stand, and they pass because the verb now stands beside them
- the cleanup this reveals is the installer's copy of the same steps, which the parent's build cuts
- the runtime folder comes from folders.js, and the extension ids from servers.js

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
