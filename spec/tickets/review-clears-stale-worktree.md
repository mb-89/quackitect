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
group: branches-and-pull-report-truly
step: do
record:
  - step: do
    hand: box 8339730da099 · claude-code-remote
    hash_before: 2f5fb7446fe695c266a389303e1d3420662636c3
    hash_after: ecd1019b21820f89f05db596bbf302842860b82b
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/files passes
      - name: check
        exit: 0
        said: "   93.6  in all"
    inputs:
      - name: ask
        hash: 9397b62fbba39a37
        size: 461
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
gain: a review after an interrupted one opens its worktree, so the check runs.

<!-- breaks, as text: what breaks if it is never done -->
breaks: `Doors.remove` deletes the files under a folder and leaves its subfolders, so `git worktree add` meets a standing path. Every later `branch review` of that branch answers that no worktree opens, until a person deletes the folder.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
done_when:

- `go test ./src/modules/files/ -run TestRemovingAFolderOfEmptyFoldersRemovesIt` passes
- `./RUNME.sh check` answers 0 on this box

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh branch test src/modules/files/disk_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The real disk Remove on a folder removes the empty folders under it, deepest first, before the folder itself. Doors.remove lists and removes the files, and the folder then goes whole, so git worktree add meets no standing path. A folder still holding a file stands, and its Remove answers the error.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the named test passes, and the check answers 0
- the cleanup the change reveals: the fake disk keeps no folders, so it needs no change
- every fact stands in one place: the folder walk lives in disk.folders alone, and Doors.remove stays untouched

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
