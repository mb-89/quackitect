---
kind: [[ticket]]
state: open
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
step: do
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

The file lands under `.se`, outside `.se/runtime`, because a reader reads it and
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
