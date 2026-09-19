---
kind: [[ticket]]
state: closed
urgent: true
depends_on: [the-listing-opens-git-once, the-runtime-folder-holds-state]
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
    hash_before: 3ca924e66a58bd0bb08bef6ec081047e735f0713
    hash_after: 3ca924e66a58bd0bb08bef6ec081047e735f0713
    answered:
      - name: tests
        exit: 0
        said: green, 4 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: 86 stand at warning, which the panel draws and check allows.
reason: done
---

# Ask

The editor opens no git process. What git knows arrives as a file, and one verb
writes it. So the editor reads disk alone, and the board is as fresh as the last
write.

| what the file carries | where it comes from |
|---|---|
| the branches standing, and their tips | `ls-remote` |
| which group a branch holds | the group ticket on it |
| the age of each tip | the tip's own time |
| the tickets on each branch, and their state | the branch's own notes |
| the queue order | the same decider the pull reads |

The verb carries a flag that writes the order. So one door answers the queue,
and nothing computes a second one.

The gain is one road to the git truth. A board, a terminal and the pull all read
the same answer, so none of the three drifts from the others.

The file lands under `.se`, outside `.se/.runtimetime`, because a reader reads it and
the index has to see the write. The engine's own state stays in `runtime`, which
the index skips. [[spec/tickets/the-runtime-folder-holds-state]]

- one verb writes the answer, and the editor opens no git process
- a flag on the verb writes the queue order into the same file
- the file lands where the index walks, so a write wakes a reader
- a reader meeting no file says so, and the board draws what the notes hold
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

`branch answer` writes one file, and a board, a terminal and the pull read that
one answer. The listing's queue column reads it too, so nothing computes a
second order:

| what the file carries | where it comes from |
|---|---|
| every work branch, its tip and the time on it | the one read the listing runs |
| the group a branch holds, its status and its age | the group ticket on that branch |
| the tickets on each branch, each with its state and step | the branch's own notes |
| the queue place, under `--queue` | the decider the pull reads |

The file lands beside the work a reader reads, so the index walks it and a write
wakes a reader. A reader meeting no file says so.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask: one verb writes the answer, and a flag adds the order
- the cleanup it reveals: the listing's queue column reads the same answer, so one order stands
- the file's name stands in `folders.js`, and every reader points at it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
