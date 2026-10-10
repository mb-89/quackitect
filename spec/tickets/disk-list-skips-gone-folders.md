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
group: edits-and-files-hold
step: do
record:
  - step: do
    hand: box a5167492d95e · claude-code-remote
    hash_before: d95ae67bf32d736e0e208573f0c8c09e790aaef2
    hash_after: d95ae67bf32d736e0e208573f0c8c09e790aaef2
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/files passes
      - name: check
        exit: 0
        said: "   76.4  in all"
    inputs:
      - name: ask
        hash: 1b0246926b2cbdaa
        size: 331
    def: df12650931d480c9
reason: done
---

# Ask

disk.List returns the whole listing when a nested folder vanishes mid-walk.

A nested folder that vanishes ends the whole walk with no error, so rename and the branch doors act on a partial listing.

- `./RUNME.sh branch test src/modules/files` passes a case where a nested folder missing at its own read leaves its siblings listed

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

disk.List ended the whole walk on any missing path. A nested folder removed between its parent's read and its own therefore returned a partial listing with no error. The walk's answer to a missing path now lives in gone: a missing root still ends the walk, and a missing nested folder lets the walk go on to its siblings. The case drives gone directly, since a real disk gives no way to remove a folder between two reads of one walk. The commit also marks the part-written edits case as building its own root, so the fixture guard passes.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the ask: a nested folder gone at its own read leaves its siblings listed, and a missing root still lists nothing
- the cleanup: the red edits case wanted the fixture marker, and it rides here
- one place: gone owns the rule, and List calls it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
