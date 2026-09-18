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
    hand: box ee33ce836a4d
    hash_before: cdb0cc9d5eca391c8b52b12ddcd132acdabb9c29
  - step: sync
    hand: box ee33ce836a4d · claude-code-remote
    hash_before: 16a4a2a5d2797a1374053c1d821850b14c97790a
    hash_after: 16a4a2a5d2797a1374053c1d821850b14c97790a
    answered:
      - name: sync
        exit: 0
        said: work/the-hand-carries-a-step already carries every commit on main.
  - step: split
    hand: box ee33ce836a4d · claude-code-remote
    hash_before: db8b2d5dc0c07d8847495b5d1607a875f5c5200c
    hash_after: db8b2d5dc0c07d8847495b5d1607a875f5c5200c
  - step: children
    hand: box 7f15b4c0a10f
    hash_before: 9b8c0551f9db2ad2a1880516bd9193aa9aae6788
    hash_after: 2b1e81f2ccac4584e1da98a9ed9640d1338476d0
  - step: children
    hand: box 9c459f3a2272
    hash_before: 6e6ea62b2a0952f19cbf23d1a9069961e34bb0be
    hash_after: 6de7f6fd0ba2b4388bf9a3cdcb37af6571c43f88
  - step: children
    hand: box 7cdf2102f8a5
    hash_before: ccfd84049234feb3cab41c0b1c9a7bad29f68db7
    hash_after: b6fc422e6b6e1c89d5e1b6b4ac03c78d025c3cad
  - step: children
    hand: box 3d4c068755ec
    hash_before: 412a1a94c936e6012bdbad636d419b0e2235c887
  - step: children
    hand: the engine
    hash_before: e9189f3d55c6b4445c453623a7d599c13bab3c96
    hash_after: e9189f3d55c6b4445c453623a7d599c13bab3c96
  - step: retro/notes
    hand: box 3d4c068755ec · claude-code-remote
    hash_before: 86ae0078ece2f12607545fa6ccd686d2db4b83b6
    hash_after: 86ae0078ece2f12607545fa6ccd686d2db4b83b6
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
  - step: retro/write
    hand: box 3d4c068755ec · claude-code-remote
    hash_before: eb804b8ea6971b104419709d068989be87a7617b
    hash_after: eb804b8ea6971b104419709d068989be87a7617b
  - step: retro/cloud
    hand: box 3d4c068755ec · claude-code-remote
    hash_before: 757e5ea46333c6b4876e08ceb4b5ac1af3cac42a
    hash_after: ef5f5ed8029220a4594f944c1ee6013480e0d0ec
reason: done
---

# Ask

A hand carries one step. The hold names the session that took it, and a spawn takes a step of its own. The stub's plugin carries the name its vehicle gives it. These three tickets stand on the hand and the hold, and a cloud box works them on one branch.

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

- [[spec/tickets/the-hand-carries-the-session]], process [[standard]]
- [[spec/tickets/the-spawn-takes-a-step]], process [[standard]]
- [[spec/tickets/the-stub-plugin-name]], process [[spec/processes/trivial]]

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each child reviews whole: one holds the hand and the hold, one the spawn, and one the stub plugin name.
- the three cover the goal, and the hand, the spawn and the stub plugin name stand inside them.
- the spawn child waits on the hand child, and names it under `depends_on`.

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

- the branch takes trunk in, over the files the merge marks as conflicts
- the check answers 0 on the merge, with every finding at warning
- [[spec/tickets/the-hand-carries-the-session]] closes became [[spec/tickets/the-session-file-proves-itself]]
- [[spec/tickets/the-spawn-takes-a-step]] passes design/draft twice, and two hands of its own fail it
- that child closes became [[spec/tickets/the-spawn-answers-a-helper]], where a person rules
- the retro decides one private note, which becomes [[spec/tickets/the-record-why-holds-spans]]

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

- the payload road carries a field the write door refuses, so a leaf closes anyway
- a hand of its own reads harder than the hand that drafts, and it finds a real hole twice
- the todo tag hands a private note out first, so the retro reaches it on a work branch
- the unblock verb writes the question into each successor, so the box copies nothing by hand

### badly

<!-- what did not, each with its moment in the log or the transcript -->
<!-- the form is list -->

- the box drafts an approach claiming the road stands, and the review names four holes in it
- the write door refuses every hand write to one ticket, over a record line the verbs own
- the box drops its hold twice to reach a private note, because the group stands first

### improve

<!-- how each bad line stops happening, named by its home -->
<!-- the form is list -->

- [[spec/tickets/the-record-why-holds-spans]] carries the record line the door refuses
- [[spec/guidance/review/reviewing]] asks a draft to read every field the ask names
- [[spec/design_output/pull]] says the todo tag reaches a private note on a work branch

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

Two hands read this group's one open ticket, and each found a hole the drafting
hand stood past. The first said the spawn road reaches a leaf under `by` nowhere.
The second said the fix opens the same wall on a box that spawns no hand.

- the drafting hand reads the code it names, and believes what it reads
- the reading hand reads the code the draft leaves out
- the cap ends the loop, and a person rules on the third round

So the review earns its cost here. The person step then leaves the branch, and
the group closes behind it. The branch lands with its question standing, which
is the whole point of the road.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every fact stands in one place: the retro names each successor once, and that ticket holds the detail
- every number carries a name: the retro writes no count, and the merge answers its own
- every header says what its file is for: the retro writes ticket chapters, and no file header

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->
<!-- the form is list -->

- the box starts no server, so the check stops at its health probe until the serve verb runs
- the client refuses a shell write to the stop hook, and names it a write to the session own door
- the install answers every tool it names, and the proxy carries every host this session reaches

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->
<!-- the form is list -->

- the sync meets a conflict on ten files, and the box resolves each against the true base
- the write door refuses a hand write to one ticket, over a record line the verbs own
- the write door refuses the word the choice field asks for, because the tense rule reads it as past
- the payload road answers both, and the pull checks the same text in memory
- the cap inserts design/person-1 after the second return on one leaf

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->
<!-- the form is list -->

- [[spec/tickets/the-session-file-proves-itself]] carries the first person step, and stands in no group
- [[spec/tickets/the-spawn-answers-a-helper]] carries the second, and stands in no group
- [[spec/tickets/the-record-why-holds-spans]] carries the door the record shuts
- this ticket is the handover, because a group branch carries its retro here

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

- The clone on a cloud box is shallow, so `branch sync` at take dies on unrelated histories. `git fetch --unshallow` clears it, and the merge then takes trunk clean.
- `branch done` refuses here: the engine writes a `record.why` and a person step `asks` joining every finding into one line. The `CodeSpans` rule then refuses that line, so the check stands red on lines the engine wrote.
- The hand-back let a design draft through that the tree-wide sweep then named. The sweep and the write door read different scopes.
- `branch take` run twice claims a second branch, so one box holds two at once.
- The mint's placeholder comments count toward `Shape`. A text field under three of them takes a table or a list.
- The check probes the server, so it exits 1 on a box that runs none. The battery stamp then stays red, and `branch done` refuses. A cloud box starts `./RUNME.sh serve` before the check.
- `takeable` reads no `depends_on`, and `offer` reads it. So the pull answers wait while `branch done` names the same child takeable. The box leaves by `branch release` alone.
