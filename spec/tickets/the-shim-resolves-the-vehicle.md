---
kind: [[ticket]]
state: closed
urgency: soon
depends_on: [the-stub-takes-shape]
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
process_hash: 484b33f9aed1254b
record:
  - step: sync
    hand: box d42624a67d18a8
    hash_before: 82520ca36c80417c512cc9750ab8f21113a4d8f7
  - step: sync
    skipped: true
    why: the box runs off the cloud
  - step: split
    hand: box d42624a67d18a8
    hash_before: 8b91f969050933ab127b17b006c29a3ef37fa811
    hash_after: 8b91f969050933ab127b17b006c29a3ef37fa811
  - step: children
    hand: the engine
    hash_before: ea5e1d57d292eafe6652ef08c0ff284cd1829f0e
    hash_after: ea5e1d57d292eafe6652ef08c0ff284cd1829f0e
  - step: retro/notes
    hand: box d42624a67d18a8
    hash_before: da088c0a4d7c7236b02657bb9d6a20d3c2f8ae7d
    hash_after: da088c0a4d7c7236b02657bb9d6a20d3c2f8ae7d
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
  - step: retro/write
    hand: box d42624a67d18a8
    hash_before: ba15944bc427031526813d6c4b76f5b68956501a
    hash_after: ba15944bc427031526813d6c4b76f5b68956501a
  - step: retro/cloud
    skipped: true
    why: the box runs off the cloud
step: retro/write
reason: done
---

# Ask

The stub's `RUNME.sh` finds its vehicle through the register, and runs the vehicle's verbs over the stub as the work root.

The design input [[spec/design_input/a-stub-takes-its-vehicle]] names this group, its proof and what it waits for. The funnel [[spec/funnel/a-button-makes-a-vehicle]] carries the owner's ask.

# sync

<!-- takes trunk into the branch, so the box works on the latest -->

## sync

<!-- branch sync, so the branch carries trunk -->

<!-- the form is command -->

# split

<!-- mints the children, or assigns standing tickets, each naming this group -->

## children

- [[spec/tickets/shim-resolves-vehicle]], on the standard process, closed done

## checked

- the one child reads whole: a shim, one function, two tests and two design chapters
- the child carries every line of the group's ask, and the bridgehead's register road belongs to the install group
- the child waits on nothing, and the group waits on the stub group under depends_on

# children

# retro

## notes

<!-- decides every private note on the box, and works what it mints into this group -->

### drained

    ./RUNME.sh retro notes

## write

<!-- writes the retro over the box's own window -->

### done

- shim-resolves-vehicle: the shim takes the register road and sets the work root, closed done
- the ask of a ticket reads anyone in the schema, so a hand fixes what the rules refuse
- eleven private notes became seven draft tickets, and the box leaves none behind
- two helper hands wrote the review and the verdict, and both passed

### well

- the tests went red on their own assertions first, so the change had a target
- the pull ran the tests and the check itself at each hand-back, so no evidence stood unread
- a fresh helper hand read the approach and the diff with no stake in either

### badly

- the ticket door kept a hand off two asks the rules refuse, and the check stood red
- the queue offered the held group before any note, so a hand at the retro reached no note
- a second hand pulling plain took the same group leaf the box holds, so two hands held one leaf
- this box took a group through `branch take` on a desk, where the owner rules the pull hands out work
- the canary reminder fired on every call of one long turn, and the agent wrote the line each time
- a python one-liner wrote seven files past the shell door, which reads sed and no other program

### improve

- `spec/schemas/ticket.schema.yaml`: the ask reads anyone, done in this group
- `src/scripts/pull.js`: a note reaches the retro hand ahead of its held group, the-pull-takes-the-branch names it
- `src/scripts/pull.js`: a leaf one hand holds goes to no second hand on the same box
- `spec/guidance/tickets.md`: the pull hands out work and no hand takes a branch, the-pull-takes-the-branch names it
- `.claude/skills/level0/lib/guidance.js`: the canary reminder reads the turn's text, the-canary-ends-no-turn names it
- `.claude/skills/level0/lib/`: the shell door reads python and node, python-writes-pass-the-door names it

### thoughts

The route runs a group's retro on the group's branch, and the retro drains the box's notes into tickets there. On a cloud box that fits, because the box dies with the branch. On a desk the notes belong to the desk and land on a branch about something else, which the owner reads as the wrong attribution. The tag road through `ticket todo` drained the notes, and a design road wants to say so.

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
