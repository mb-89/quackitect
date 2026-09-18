---
kind: [[ticket]]
state: open
urgency: now
steps:
  - name: sync
    does: takes trunk into the branch, so the box works on the latest
    when: cloud
    by: agent
    needs: ["branch sync"]
    evidence:
      - name: sync
        form: command
        expects: 0
        says: branch sync, so the branch carries trunk
  - name: split
    does: mints the children, or assigns standing tickets, each naming this group
    from: anyone
    by: anyone
    input: ask
    reads: [[spec/guidance/working]]
    checklist: ["every child is small enough to review whole, or is a group itself", "the children add up to the goal, and nothing of the goal stands outside them", "a child that waits on another names it under depends_on"]
    evidence:
      - name: children
        form: list
        says: every child as a link, one a line, with its process
  - name: children
    by: children
    on_fail: split
  - name: retro
    reads: [[spec/guidance/working]]
    to: retro
    steps:
      - name: notes
        does: decides every private note on the box, and works what it mints into this group
        needs: ["retro"]
        evidence:
          - name: drained
            form: command
            expects: 0
            says: retro notes, which passes when the private folder is empty
      - name: write
        does: writes the retro over the box's own window
        input: ["children", "notes"]
        checklist: ["every fact the change adds stands in one place, and a note points at the file instead of repeating it", "every number the change adds carries a name in one place, and a copy a technical reason forces says so beside it", "every header the change writes says what its file is for, and counts nothing"]
        evidence:
          - name: done
            form: list
            says: what was done, one line a ticket or a thing
          - name: well
            form: list
            says: what went well, and what made it go well
          - name: badly
            form: list
            says: what did not, each with its moment in the log or the transcript
          - name: improve
            form: list
            says: how each bad line stops happening, named by its home
          - name: thoughts
            form: text
            says: what the thoughts say that the actions do not, off the transcript
      - name: cloud
        does: names what the box lacked, met and leaves for a person
        when: cloud
        input: write
        evidence:
          - name: lacked
            form: list
            says: a tool, a host the proxy refused, a right the platform refused, an install, each with its moment
          - name: met
            form: list
            says: the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone
          - name: left
            form: list
            says: every person step parked, every ticket minted with no group, and what the handover says
process: [[spec/processes/group]]
process_hash: 3c35c048932fd579
step: retro/notes
record:
  - step: sync
    hand: box 4089f1b3b6bc · claude-code-remote
    hash_before: ca22b75158abd573db00e1635f0bd8ea5b443cf4
  - step: sync
    hand: box 4089f1b3b6bc · claude-code-remote
    hash_before: b73859fb845d1fc76392b91bc8264f5427d41ab3
    hash_after: b73859fb845d1fc76392b91bc8264f5427d41ab3
    answered:
      - name: sync
        exit: 0
        said: work/the-work-editor-draws already carries every commit on main.
  - step: split
    hand: box 4089f1b3b6bc · claude-code-remote
    hash_before: 515f0f5e80f49e0eb8dffa7d18978e3f45a9ad02
    hash_after: 515f0f5e80f49e0eb8dffa7d18978e3f45a9ad02
  - step: children
    hand: the engine
    hash_before: 58f4b6d1241c6e8ebc51d7a2e5d634bd23a8ee41
    hash_after: 58f4b6d1241c6e8ebc51d7a2e5d634bd23a8ee41
---

# Ask

The work editor draws every ticket in the tree view, live, in the window's work
tab. A person reads what waits on them, what an agent works, and what the queue
hands out next. [[spec/design_input/the-agent-pulls-tickets]]

The tree view already draws a tree and a table at once. It filters in the log's
language, reads a base file, and takes an edit in a cell. The work tab stands
empty, and these tickets fill it.

The order runs data first, then drawing, then the acts. These tickets stand:

| the ticket | what it lands |
|---|---|
| `the-listing-opens-git-once` | the listing stops spawning a process per branch and per ticket |
| `the-work-answer-lands` | one verb writes what git knows, and the editor reads that file |
| `the-work-tab-draws` | the base file, the columns, and the tree in the tab |
| `the-flags-draw-as-letters` | one boolean key a flag, one lettered column |
| `the-runtime-folder-holds-state` | `.se/runtime` takes the engine's state, and the index walks the rest |
| `the-tree-sorts-several-keys` | a sort of several keys, between the data and the view |
| `one-urgency-stands` | the three urgency words become one mark |
| `the-queue-is-a-score` | the queue orders by a polynomial the config weighs |
| `a-preset-carries-its-sort` | presets and slices as buttons, carrying a filter and a sort |
| `the-cell-fill-takes-marks` | marked rows, and a fill reaching those alone |

The first three are the visibility cut. A person reads the board once they
land. Every ticket after them adds to a board that already draws.

The gain is one board over work this tree already holds. Nothing here mints a
second record. The notes stay the truth, git stays the truth about a branch,
and the editor reads both.

Without it a person reads work through `branch list` in a terminal, one screen
at a time, and reaches no row to change it.

- the work tab draws every ticket, nested under its group
- a write to a ticket redraws the tab with no key pressed
- the queue column answers the order the pull hands out
- `go -C src/viewer test ./...` is green
- `./RUNME.sh check` is green

# sync

<!-- takes trunk into the branch, so the box works on the latest -->

## sync

<!-- branch sync, so the branch carries trunk -->

<!-- the form is command -->

./RUNME.sh branch sync

# split

<!-- mints the children, or assigns standing tickets, each naming this group -->

## children

<!-- every child as a link, one a line, with its process -->

<!-- the form is list -->

- [[spec/tickets/the-listing-opens-git-once]], trivial, which reads git in one process
- [[spec/tickets/the-runtime-folder-holds-state]], trivial, which gives the engine's state its own folder
- [[spec/tickets/the-work-answer-lands]], trivial, which writes what git knows into a file
- [[spec/tickets/the-work-tab-draws]], trivial, which draws the tree in the work tab
- [[spec/tickets/the-flags-draw-as-letters]], trivial, which draws the boolean keys as one lettered column
- [[spec/tickets/the-tree-sorts-several-keys]], trivial, which sorts the tree on several keys
- [[spec/tickets/one-urgency-stands]], trivial, which turns urgency into one mark
- [[spec/tickets/the-queue-is-a-score]], trivial, which orders the queue by a score the config weighs
- [[spec/tickets/a-preset-carries-its-sort]], trivial, which draws presets carrying a filter and a sort
- [[spec/tickets/the-cell-fill-takes-marks]], trivial, which reaches a fill to the marked rows

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- every child is small enough to review whole: each carries the trivial route, so a reader reads its diff whole
- the children add up to the goal: the listing, the answer and the tab land the board. Every later child adds to it
- a child that waits on another names it: each waiting child names it under depends_on

# children

# retro

## notes

<!-- decides every private note on the box, and works what it mints into this group -->

### drained

<!-- retro notes, which passes when the private folder is empty -->

<!-- the form is command -->

## write

<!-- writes the retro over the box's own window -->

### done

<!-- what was done, one line a ticket or a thing -->

<!-- the form is list -->

### well

<!-- what went well, and what made it go well -->

<!-- the form is list -->

### badly

<!-- what did not, each with its moment in the log or the transcript -->

<!-- the form is list -->

### improve

<!-- how each bad line stops happening, named by its home -->

<!-- the form is list -->

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->

<!-- the form is list -->

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->

<!-- the form is list -->

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->

<!-- the form is list -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
