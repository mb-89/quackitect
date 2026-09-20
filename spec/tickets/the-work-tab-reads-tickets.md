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
    hand: box 51c5005e133c · claude-code-remote
    hash_before: ee9509dd2d41a15d8434a5fcfdf14695ee1b2509
  - step: sync
    hand: box 51c5005e133c · claude-code-remote
    hash_before: c35f0536f104e7ac62fb9bf7ef80c41b6f685221
    hash_after: 7466e24e17194c2092558f24dee3424dbda29602
    answered:
      - name: sync
        exit: 0
        said: work/the-work-tab-reads-tickets already carries every commit on main.
  - step: split
    hand: box 51c5005e133c · claude-code-remote
    hash_before: c95648a1710b977ea275d2f4f440aebe8fbb1e87
    hash_after: c95648a1710b977ea275d2f4f440aebe8fbb1e87
  - step: children
    hand: the engine
    hash_before: b5e18fa5eefa644975dca691b3d838aba316ddc1
    hash_after: b5e18fa5eefa644975dca691b3d838aba316ddc1
  - step: retro/notes
    hand: box 51c5005e133c · claude-code-remote
    hash_before: 3bfef58746c0179ff289ec41cf95c73506870b1f
    hash_after: 3bfef58746c0179ff289ec41cf95c73506870b1f
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
  - step: retro/write
    hand: box 51c5005e133c · claude-code-remote
    hash_before: 3bcecebc2b2a2ce42eea31a88323c5ae80a6594c
    hash_after: 3bcecebc2b2a2ce42eea31a88323c5ae80a6594c
  - step: retro/cloud
    hand: box 51c5005e133c · claude-code-remote
    hash_before: 8e41764c538aa130133d112561b2b6ceede538ee
    hash_after: 7591ab80313ddd9a8e5d40c0f63220fefc0066ff
reason: done
---

# Ask

<!-- goal, as text: what these tickets add up to, for the hand that takes them -->
The work tab is a ticket editor. It queries the index for tickets, and a branch informs a ticket's standing and nothing more. The index fires a callback on a disk change and the tab redraws, and a cell edit writes the ticket. No file stands between the index and the tab.

# sync

<!-- takes trunk into the branch, so the box works on the latest -->

## sync

<!-- branch sync, so the branch carries trunk -->

    ./RUNME.sh branch sync

# split

<!-- mints the children, or assigns standing tickets, each naming this group -->

## children

<!-- every child as a link, one a line, with its process -->

- [[spec/tickets/the-index-answers-tickets]], trivial
- [[spec/tickets/the-index-fires-on-change]], trivial
- [[spec/tickets/the-work-tab-asks-index]], trivial
- [[spec/tickets/the-work-tab-takes-edits]], trivial

## checked

<!-- one line per item of the checklist, on how you take it into account -->

- every child is small enough to review whole: each lands as one commit of one module and its note
- the children add up to the goal: the query, the callback, the tab reading both, and the edit
- a child that waits on another names it: none names one, and the pull hands them out in order

# children

# retro

## notes

<!-- decides every private note on the box, and works what it mints into this group -->

### drained

<!-- retro notes, which passes when the private folder is empty -->

    ./RUNME.sh retro notes

## write

<!-- writes the retro over the box's own window -->

### done

<!-- what was done, one line a ticket or a thing -->

- [[spec/tickets/the-index-answers-tickets]]: the index answers `tickets`, with the standing off the group's record
- [[spec/tickets/the-index-fires-on-change]]: the door holds a `changes` call until a sweep, and answers the tick
- [[spec/tickets/the-work-tab-asks-index]]: the tab asks the door, redraws on the tick, and the answer file goes
- [[spec/tickets/the-work-tab-takes-edits]]: a cursor, a cell edit and two mark keys write the ticket's front
- the plugin manifests: the brand stamp writes both where a clone holds none, so three contract cases stand green
- the door over a fresh tree: `serves` makes the runtime folder first
- the sync: trunk came in with one conflict in the installer, resolved by keeping both sides
- twelve lines of three notes: reworded past the tense reader, so the push door opens

### well

<!-- what went well, and what made it go well -->

- the pull carried each ticket to its commit and push, so the box took the next leaf each time
- the door's JSON shape took `tickets` and `changes` as two cases and no new transport
- a fake door on a port the standing file names let every tab case run with no binary
- the schema file already said which field the verbs own, so the tab reads it and holds no list

### badly

<!-- what did not, each with its moment in the log or the transcript -->

- the first hand-back of the first ticket met three red contract cases the clone brought, at the first check
- the node fixture case stood under `test/level0` until the check named the rule, one hand-back later
- the process call stood in the wrong Go file until the lint named `door.go`, at the third ticket's lint
- a python slice on the group ticket cut a heading short, at the split, and cost one refused hand-back
- the push door refused twelve tense findings in notes off trunk, at the sync hand-back

### improve

<!-- how each bad line stops happening, named by its home -->

- the manifests: `stamps` in `src/scripts/brand.js` writes them now, so no clone meets that red again
- the test folder: `spec/guidance/code/testing` names the contract folder for a real binary, so a hand reads it first
- the process call: `spec/design_output/doors` says the Go import runs in `door.go`, and a hand reads it before writing a client
- the slice: a heading match reads the whole line, which `mcp__level0__patch` does and a substring does not
- the tense reader: `spec/config/styles/VoiceParagraph/PastTense.yml` flags nouns as verbs, and a person weighs its words

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->

The ask said a branch informs a ticket's standing and nothing more, and the
record on the group ticket already carried that standing. So the index reads
no git, and the answer file the verbs wrote had nothing left to say. The
queue place and the progress went with it, because the tab draws what the
index answers and the index answers what the notes hold. A person moving work
between groups wants the `group` column, so the base file gained it. The
mark keys stand in for the editor a mark carries open, which the tree view
note still names as waiting.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

- every fact stands once: the rows, the road and the door rule each stand in their own note
- every number carries a name: the waits stand as named constants in `door.go` and `workindex.go`
- every header says what its file is for: each new Go file opens on what it holds, and counts nothing

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->

- nothing: every tool stood, the proxy refused no host, and the build of the index ran on this box

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->

- a conflict at sync: the installer's list of moved files, where trunk and this branch each changed a name
- a test that fails on the box alone: three contract cases over the plugin manifests, red on every fresh clone
- the commit hook: a code change with no test beside it, answered with two cases over the usage rows
- the push hook: twelve tense findings in three notes, and a list item over its words, each reworded

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->

- no person step stands parked, and no ticket stands minted with no group
- the tree view note still names the editor reading a field's type as waiting, and no ticket carries it
- the handover says the branch stands done at its tip, and a person reads the merge

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

The Vale paths case read a raw finding off the level zero note, and the push
door had just asked for that note to stand clean. So the case now feeds Vale a
flagged line on stdin, and no tracked note has to carry a warning for it.
