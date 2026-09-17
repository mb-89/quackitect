---
kind: [[ticket]]
state: draft
urgency: now
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
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
process: [[spec/processes/trivial]]
process_hash: 05e53b89dab63152
group: work/the-work-editor-draws
---

# Ask

`branch list` spawns a git process per branch, and one per ticket on each
branch. At the scale this tree already carries, that is about a hundred
processes for one listing. The fetch stands on the read path too, so a listing
waits on the network before it answers.

| what runs it | how many processes |
|---|---|
| `branches` | a fetch, and an `ls-remote` |
| `briefOf`, once a branch | one `git show` |
| the group ticket, once a branch | one `git show` |
| `ticketsOn`, once a branch | one `ls-tree` |
| `textAt`, once a ticket | one `git show` |

`git cat-file --batch` reads any number of objects in one process. A caller
writes a revision and a path a line, and the contents stream back. So the
listing asks git three times: the refs, the paths, and the contents.

The gain is a listing a person waits nowhere for. The work editor redraws off
this answer, so the cost lands on every redraw until it falls.

Without it the editor inherits the cost. A board redrawing on a write spawns a
hundred processes each time, and a person feels every one.

- `branch list` answers with three git processes, whatever the branch count
- the fetch moves off the read path, and a flag asks for it
- `branch list` answers the same rows it answers today
- `node --test "test/level0/*.test.js"` is green
- `./RUNME.sh check` is green

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
