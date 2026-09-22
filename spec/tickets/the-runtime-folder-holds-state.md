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
    hash_before: 89abb36ca16eae7d93d415a291f7d2b4aec7d97e
    hash_after: 89abb36ca16eae7d93d415a291f7d2b4aec7d97e
    answered:
      - name: tests
        exit: 0
        said: green, 20 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: 86 stand at warning, which the panel draws and check allows.
reason: done
---

# Ask

`.se` holds two unrelated things under one name. What the engine writes to know
its own state sits beside work a reader wants, so no rule reaches one without
reaching the other. The index skips the whole folder today, and a reader loses
the half worth reading.

`.se/.runtimetime` takes the engine's own state, and the rest of `.se` stays what a
reader reads:

| what moves to `.se/.runtimetime` | what it is |
|---|---|
| `index.db`, `index.json` | the index, and where its door stands |
| `log/` | the session log, the server log, and the rotations |
| `level0.stamp`, `session.json` | what a session writes to know itself |
| `config.json` | the values a window holds for its own session |
| `check.json`, `check.log` | the battery |
| `hold/`, `vehicle.json`, `show-panel` | the holds, the pointer, and the flag |
| `bin/` | the binaries the install puts there |
| `review/` | a git worktree, which is a second checkout of the whole tree |
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

The index then skips `.se/.runtimetime` alone, and walks the rest. Two faults go
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

- `.se/.runtimetime` holds every file the table above names
- the index skips `.se/.runtimetime`, and walks the rest of `.se`
- a write under `.se/tickets` marks the rows dirty, and a reader sees it
- a write to the log sweeps nothing
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

The runtime half already stands, under the name `run`. For details, see
[[spec/tickets/the-runtime-files-stand-apart]]. What this ticket adds is what
kept that split from showing:

| what stood | what stands now |
|---|---|
| the index binary rebuilds off its own absence | it rebuilds where its source stands newer, the way the language server does |
| a binary older than the split skipped the private folder whole | the walk reads the private folder, and skips the runtime half alone |
| every log line woke the watch | the watch stands off the log, and the walk still reads it |

The owner's ruling on the log holds, so the log stays beside the work a reader
reads. The private half the engine has yet to give up waits on a note under the
private tickets. A live hook and the editor both spell those names.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask: the runtime half stands, and the note names what waits
- the cleanup it reveals: the index binary rebuilds off its own age, so a stale one stops lying
- the folder's name stands in `folders.js`, and the index spells it beside its reason

# Discussion

- The owner rules the `log/` row wrong. The log stays outside the runtime folder.
- The retro collects the log, and a retro reads it more than anything else.
- The runtime folder holds what dies with the box. A record a reader reads later stands outside it.
- So the hand taking this ticket moves every other row, and leaves `log/` where it stands.
- [[spec/tickets/the-retro-takes-the-box]] copies the private folder, and it skips the runtime folder whole.
- The hand closing this ticket found the log inside the runtime half, against the ruling above.
- The retro's collect skips that half, so every retro read no log at all.
- The move back lands under [[spec/tickets/the-work-tab-draws]], because this ticket stood closed by then.
