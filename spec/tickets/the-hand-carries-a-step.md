---
kind: [[ticket]]
state: open
urgency: soon
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
step: children
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

- The clone on a cloud box is shallow, so `branch sync` at take dies on unrelated histories. `git fetch --unshallow` clears it, and the merge then takes trunk clean.
- `branch done` refuses here: the engine writes a `record.why` and a person step `asks` joining every finding into one line. The `CodeSpans` rule then refuses that line, so the check stands red on lines the engine wrote.
- The hand-back let a design draft through that the tree-wide sweep then named. The sweep and the write door read different scopes.
- `branch take` run twice claims a second branch, so one box holds two at once.
- The mint's placeholder comments count toward `Shape`. A text field under three of them takes a table or a list.
- The check probes the server, so it exits 1 on a box that runs none. The battery stamp then stays red, and `branch done` refuses. A cloud box starts `./RUNME.sh serve` before the check.
- `takeable` reads no `depends_on`, and `offer` reads it. So the pull answers wait while `branch done` names the same child takeable. The box leaves by `branch release` alone.
