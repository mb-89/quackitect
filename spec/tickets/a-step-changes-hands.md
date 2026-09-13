---
kind: [[ticket]]
state: open
urgency: whenever
steps:
  - name: sync
    does: takes trunk into the branch, so the box works on the latest
    when: cloud
    by: agent
    needs: ["work sync"]
    evidence:
      - name: sync
        form: command
        expects: 0
        says: work sync, so the branch carries trunk
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
process: [[group]]
depends_on: ["the-agent-pulls-a-ticket"]
record:
  - step: sync
    hand: box b71bba5a7b0c
    hash_before: 30750b0403b60ea900582a7d55bff0ba773252b9
  - step: sync
    hand: box b71bba5a7b0c
    hash_before: 3a1748319aeadf464b247f0d8b505ce178950839
    hash_after: 3a1748319aeadf464b247f0d8b505ce178950839
    answered:
      - name: sync
        exit: 0
        said: work/a-step-changes-hands already carries every commit on main.
  - step: split
    hand: box b71bba5a7b0c
    hash_before: 02834b8cfe784fd57403133f142dfc327e93d800
    hash_after: 02834b8cfe784fd57403133f142dfc327e93d800
  - step: children
    hand: box b71bba5a7b0c
    skipped: true
    why: the box leaves it while step-changes-hands stand open
  - step: retro/notes
    hand: box b71bba5a7b0c
    hash_before: 5a185b5a34d533dffe0d042e055ad00cd3ff3404
    hash_after: 5a185b5a34d533dffe0d042e055ad00cd3ff3404
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
step: retro/write
---

# Ask

The pull learns who holds a step. The group holds one child, [[spec/tickets/step-changes-hands]], whose ask carries the pieces: the hand id, the helper's tag, the person's hand, the escalation verb and the group that leaves at `todo`. The design input [[spec/design_input/the-agent-pulls-tickets]] draws it under Hands, Escalation is a step, and Children and private tickets.

# sync

<!-- takes trunk into the branch, so the box works on the latest -->

## sync

<!-- work sync, so the branch carries trunk -->
<!-- the form is command -->

./RUNME.sh branch sync

# split

<!-- mints the children, or assigns standing tickets, each naming this group -->

## children

<!-- every child as a link, one a line, with its process -->

<!-- the form is list -->

- [[spec/tickets/step-changes-hands]], under the standard process

## checked

- the one child reads whole, because its ask holds one table of pieces and one design note takes them
- the child carries every piece the group asks for, and the group itself holds the retro alone
- the child waits on no other ticket, so it names nothing under depends_on

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

The judge refuses the one-line command under retro/notes against the working rules, twice in a row, and those rules govern a session's conduct and read nothing in a command. The hand-back takes the shell road there, which the design names as a person's road, and the judge reads it at the next agent pull.
