---
kind: [[ticket]]
state: closed
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
step: retro/cloud
record:
  - step: sync
    hand: box 5fb6c1c050cd · claude-code-remote
    hash_before: b35e12062695c317b92be59f8c8df268f5a58a08
    hash_after: 37d7269683451294285cb0b37646c79ab50ea41d
  - step: sync
    hand: box 5fb6c1c050cd · claude-code-remote
    hash_before: 31a244dd6facab427b23c8d4f5f188a5370fcb90
    hash_after: 819ddb23080d8dcf5cd8cc71e03e1040135f12d9
    answered:
      - name: sync
        exit: 0
        said: work/the-panel-reads-every-change took 4 commit(s) from main.
  - step: split
    hand: box 5fb6c1c050cd · claude-code-remote
    hash_before: 6f6d0fb104745e4021fd275d3d60ef188b2c53f6
    hash_after: 6f6d0fb104745e4021fd275d3d60ef188b2c53f6
  - step: children
    hand: the engine
    hash_before: a450f5a6efcd98f2ee2ebcba40f785b8823a43e3
    hash_after: a450f5a6efcd98f2ee2ebcba40f785b8823a43e3
  - step: retro/notes
    hand: box 5fb6c1c050cd · claude-code-remote
    hash_before: 8e8a05589a61f07c9a2f0d76661e4094d7fb27c4
    hash_after: 8e8a05589a61f07c9a2f0d76661e4094d7fb27c4
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
  - step: retro/write
    hand: box 5fb6c1c050cd · claude-code-remote
    hash_before: 82cf68778d31bc61db4e7248843c39293e5bda5c
    hash_after: 82cf68778d31bc61db4e7248843c39293e5bda5c
  - step: retro/cloud
    hand: box 5fb6c1c050cd · claude-code-remote
    hash_before: f72af47ac606e554e359c8abbe0cce75cb8ad8c9
    hash_after: f72af47ac606e554e359c8abbe0cce75cb8ad8c9
reason: done
---

# Ask

<!-- goal, as text: what these tickets add up to, for the hand that takes them -->
The problems panel behaves as any language's does. Every file's findings stand on open, and every change redraws as a person types. A file that goes takes its row with it, and no source waits for a save.

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

- [[spec/tickets/a-move-redraws-both-files]], on [[spec/processes/trivial]], closed done
- [[spec/tickets/the-panel-lints-on-change]], on [[spec/processes/trivial]], closed done

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- every child is small enough to review whole. Each child stands on the trivial route, with one leaf and one commit.
- the children add up to the goal. The earlier panel group holds the rows on open and off the disk. One child takes the move, and one the change as typed.
- a child that waits on another names it under depends_on. Neither waits on the other, and neither names one.

# children

# retro

## notes

<!-- decides every private note on the box, and works what it mints into this group -->

### drained

<!-- retro notes, which passes when the private folder is empty -->

<!-- the form is command -->

    ./RUNME.sh retro notes

## write

<!-- writes the retro over the box's own window -->

### done

<!-- what was done, one line a ticket or a thing -->

<!-- the form is list -->

- a-move-redraws-both-files: the watcher reads its own change types, and a folder stands for every file under it. The stamp mints a missing plugin manifest.
- the-panel-lints-on-change: a change to an open file asks the bridge after the quiet span. The bridge lints the held buffer through the Vale door.
- the terminal push door reads through the tense reader, so a push carries the list the check reads
- the split list reads under the cap

### well

<!-- what went well, and what made it go well -->

<!-- the form is list -->

- the tests on both sides drive the server over a temporary root and a fake bridge. No editor and no disk outside the case answer any of it.
- `lintText` stands already, so the bridge lints a buffer at its own path with no new Vale call
- the closed tickets show the shape of a filled evidence chapter, so each hand-back meets the door in its form

### badly

<!-- what did not, each with its moment in the log or the transcript -->

<!-- the form is list -->

- the check fails on the untouched tree at the stub and the vehicle contract tests. It meets the first check of the first leaf.
- the push door refuses trunk's own notes at a false past. It meets the sync hand-back.
- the formatter runs without the tree's config on the first pass over the JavaScript files, and rewrites both with tabs. It meets the first diff read of the first leaf.
- several hand-backs meet the prose rules on a long list line or a past form. Each meets the lint before the pass.

### improve

<!-- how each bad line stops happening, named by its home -->

<!-- the form is list -->

- the stamp mints a missing manifest, in `src/scripts/brand.js`, so a fresh clone passes the check
- the push door reads through the tense reader, in `src/scripts/prepush.js`
- the fix verb names the formatter's config path, under `./RUNME.sh fix`, so a hand runs it with the tree's config
- the hand-back lints the ticket before it commits, in `src/scripts/pull-chapter.js`. A prose fault then meets the hand ahead of the push.

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->

<!-- the form is text -->

The two children read as work on the Go side, and each turns out to need a hand on the JavaScript side. The ask on the change as typed names the bridge nowhere, and the gain it names holds only where the bridge reads the buffer. So the change grows past the ticket's own files, and the says line names why. A cloud box decides this alone, and the merge is where the owner reads the call.

| the doubt | what it rests on |
|---|---|
| the change grows past the ticket's files | the manifests the check trips on, and the bridge route the buffer reaches |
| the sync replays trunk's commits onto the branch | a push then carries the owner's files through the push door, and a fault there holds the branch |

The door fix lands here because the branch stands otherwise.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- every fact the change adds stands in one place. Each design chapter names its file, and the tickets point at the chapters.
- every number the change adds carries a name in one place. The quiet span carries the name `lintQuiet` in `src/lsp/bridge.go`, and the test span `testQuiet`.
- every header the change writes says what its file is for, and counts nothing. No new file stands, and each changed header keeps its line.

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->

<!-- the form is list -->

- no tool, host, right or install stands missing. The setup installs Vale, Biome, both language servers and the index at the take.

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->

<!-- the form is list -->

- the trunk guard: none, because the branch pushes to its own ref
- a conflict at sync: none. The sync replays trunk's commits onto the branch, so the push carries the owner's files through the push door.
- the cap: none
- a hook: the commit door refuses the bridge route with no test beside it, at the second leaf's hand-back. A test through the server's box answers it.
- a hook: the push door refuses a false past on trunk's notes, at the sync hand-back. The door fix answers it.
- a test that fails on the box alone: the stub and the vehicle contract tests, at the first check. A fresh clone carries no plugin manifest.

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->

<!-- the form is list -->

- no person step stands parked
- no ticket stands minted with no group
- the handover: trunk carries none, and this branch writes none. The retro above and the done line say what the next box reads.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
