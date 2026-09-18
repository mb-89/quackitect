---
kind: [[ticket]]
state: closed
urgent: true
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
group: the-work-editor-draws
step: do
record:
  - step: do
    hand: box 4089f1b3b6bc · claude-code-remote
    hash_before: 8323d3ce82404d7bedbdfed8dee91520f63f100e
    hash_after: 8323d3ce82404d7bedbdfed8dee91520f63f100e
    answered:
      - name: tests
        exit: 0
        said: green, 84 test(s) pass in 8 file(s)
      - name: check
        exit: 0
        said: 87 stand at warning, which the panel draws and check allows.
reason: done
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

    ./RUNME.sh branch test

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

`branch list` asks git three times, whatever stands on the remote. One
`for-each-ref` answers every work branch, its tip, the time on that tip and
whether trunk holds it. Two `cat-file --batch` runs answer the rest:

| what went | what comes |
|---|---|
| a fetch and an `ls-remote` | one `for-each-ref`, off the refs this box holds |
| a `git show` a brief, and one a group ticket | one batch, over every tip |
| an `ls-tree` a branch, and a `git show` a ticket | one batch, over the names the trees carry |
| a `git log -1` a held branch | the time the refs answer already |

The fetch stands off the read path. `branch list --fetch` asks for it, and
`take` and the trigger fetch on their own, because each acts on the remote.

A tree carries its names beside bytes, so the batch reads raw and each payload
turns back into text. `proc.run` takes `raw` for that, and the git door's
`batch` is its one caller.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask: the listing asks git three times, and the fetch moves behind a flag
- the cleanup it reveals: the tip's time comes off the refs, so the age costs no process
- the three reads stand in `readWork`, and every verb reading the remote points at it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
