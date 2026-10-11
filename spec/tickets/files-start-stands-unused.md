---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: edits-and-files-hold/accept
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
group: edits-and-files-hold
parent: edits-and-files-hold
record:
  - step: do
    hand: box a5167492d95e · claude-code-remote · helper-16
    hash_before: 5ccd1515bf7db181d3df01e32a8d9a718c40f266
    hash_after: 92de53cbaf7e7c2c9a46052c47c89a003aff5f8f
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/files passes
      - name: check
        exit: 0
        said: "   76.8  in all"
    inputs:
      - name: ask
        hash: 5ce074e280641c3d
        size: 268
    def: 97e74ee9911f668d
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

files.Start in src/modules/files/watch.go has no caller left, since seedsIn commits through commitsHeard, and its one test TestAPushedChangeReachesTheFamily left in the a-part-written-apply-undoes tests-green commit; delete Start, or give it back a caller and its case

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh branch test src/modules/files

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

files.Start goes. Nothing in the tree calls it, since seedsIn commits through commitsHeard. Its last test, TestADiskWriteComesBackThroughWatch, now starts through Seeds over an empty root. The commitsHeard comment no longer names Start.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- ask: Start and its comment are gone, and grep finds no Start in src/modules/files
- cleanup: commitsHeard stays, since seedsIn calls it, and no other helper loses its last caller
- one place: the watch path now starts through Seeds alone, and the test meets the same path

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
