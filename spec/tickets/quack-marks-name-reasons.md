---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: quack-reaches-the-box-through-doors/gate
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
group: doors-declare-what-they-own
parent: quack-reaches-the-box-through-doors
record:
  - step: do
    hand: box add8d8d0dd3d · claude-code-remote
    hash_before: e8175f4fb456c044b4b7a9a3ea70abc96ca8d34d
    hash_after: fe5d829786ba2a40eeea23706eb2567073722502
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes; green, src/owns passes
      - name: check
        exit: 0
        said: "    1.7  test/contract/desk-start.test.js a server the proc door starts detached writes its marker after its starter exi"
    inputs:
      - name: ask
        hash: f58a9c70e1b761bb
        size: 216
    def: 6a55bc0a7781afef
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

TestNoRootFileReachesTheBoxPastItsDoors in src/owns/quack_tree_test.go passes a marked walk, so each marker the change adds under src/quack names why no door serves it, and the accept reads every marker the diff adds

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/quack/verb_doors_test.go src/owns/quack_tree_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The branch added one marker under src/quack: the os import in verb_doors.go. The import served one read of each declaration, and rootDisk.Read already serves that read. The walk now reads through rootDisk, so the import and its marker leave, and no marker the branch adds under src/quack needs a reason. TestDoorsReadsTheTreeWithNoMarkedLineOfItsOwn holds that the verb over the tree lists no line of its own file, and it fails on the file before the change.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask by removing the one marker the diff added, since a door serves it, and a marker a door serves would carry a false reason
the change reveals no further cleanup: the other markers under src/quack stand on main already, outside this diff
the change adds no fact past the case, which reads the verb output over the tree

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
