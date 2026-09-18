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

`.se` holds two unrelated things under one name. What the engine writes to know
its own state sits beside work a reader wants, so no rule reaches one without
reaching the other. The index skips the whole folder today, and a reader loses
the half worth reading.

`.se/runtime` takes the engine's own state, and the rest of `.se` stays what a
reader reads:

| what moves to `.se/runtime` | what it is |
|---|---|
| `index.db`, `index.json` | the index, and where its door stands |
| `log/` | the session log, the server log, and the rotations |
| `level0.stamp`, `session.json` | what a session writes to know itself |
| `config.json` | the values a window holds for its own session |
| `check.json`, `check.log` | the battery |
| `hold/`, `vehicle.json`, `show-panel` | the holds, the pointer, and the flag |
| `bin/` | the binaries the install puts there |
| `review/` | a git worktree, which is a second copy of the whole tree |
| `measure/` | what the voice verb writes, one file a span |

| what stays under `.se` | why a reader wants it |
|---|---|
| `tickets/` | the to-dos a box mints, which a board draws |
| `scripts/` | what a hand writes, and a handover names |
| `retro/` | what a hand answers at the end |
| `notes/` | what a hand writes down, which the privacy door reads |

`review/` earns its place in `runtime` on its own. `git worktree add --detach
.se/review/<branch>` opens a whole checkout there. A walk over it reads the
tree twice, so every row doubles and every search answers each line twice.
[[spec/design_output/review#a-worktree-runs-the-check]]

`~/.se/vehicles` sits in the home of the box, outside this tree, so nothing
here reaches it.

The index then skips `.se/runtime` alone, and walks the rest. Two faults go
with that change:

- The index walking `.se` reads its own database, and a write to it marks its
  own rows dirty.
- The session log grows a line a door call, so a walk over it sweeps on every
  line.
- `review/` holds a whole checkout, so a walk reads the tree a second time.

Both live under `runtime` after this, so the skip is one path and the reason is
one sentence.

The gain is a rule that reads. A folder named `runtime` says what it holds, and
a reader needs no list to know what the index passes.

- `.se/runtime` holds every file the table above names
- the index skips `.se/runtime`, and walks the rest of `.se`
- a write under `.se/tickets` marks the rows dirty, and a reader sees it
- a write to the log sweeps nothing
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

- The owner rules the `log/` row wrong. The log stays outside the runtime folder.
- The retro collects the log, and a retro reads it more than anything else.
- The runtime folder holds what dies with the box. A record a reader reads later stands outside it.
- So the hand taking this ticket moves every other row, and leaves `log/` where it stands.
- [[spec/tickets/the-retro-takes-the-box]] copies the private folder, and it skips the runtime folder whole.
