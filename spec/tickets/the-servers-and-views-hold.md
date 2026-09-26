---
kind: [[ticket]]
state: open
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
    does: reads the standing children, and mints more where the goal needs them, each naming this group
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
process_hash: 94d924fb96257431
step: retro/notes
record:
  - step: sync
    hand: box 63693613eded · claude-code-remote
    hash_before: 20022646735c999ccb27192e5e032196c59a314b
    hash_after: e787849a05ca8b2ecc624a9df31e124846dfba31
  - step: sync
    hand: box c81556ef1606 · claude-code-remote
    hash_before: 70c635e24700974de0bd4536aed4d8c31eba6bb2
    hash_after: a39da25007f44bb1bf3d90af3d830e069a82e8d8
  - step: sync
    hand: box d7a44d6f73215 · claude-code-remote
    hash_before: 4bb12d0a36f3fe243b3a090d02ac10232a14383c
    hash_after: ae63ba8dfef5a273ce1a6c4dd402e3bc89411d5f
  - step: sync
    hand: box d7a44d6f73215 · claude-code-remote
    hash_before: 870905195a13be89442caf991782ce06e8033176
    hash_after: 870905195a13be89442caf991782ce06e8033176
    answered:
      - name: sync
        exit: 0
        said: work/the-servers-and-views-hold already carries every commit on main.
  - step: split
    hand: box d7a44d6f73215 · claude-code-remote
    hash_before: 2de3ec05c97cf040138e3bbb537267c62a416a03
    hash_after: 2de3ec05c97cf040138e3bbb537267c62a416a03
  - step: children
    hand: the engine
    hash_before: e99ff292d9c32d8cbc4c683796044f87c59d8c61
    hash_after: e99ff292d9c32d8cbc4c683796044f87c59d8c61
  - step: retro/notes
    hand: box d7a4c7b217104 · claude-code-remote
    hash_before: 30b7e8fa8894aab1c3efc233987cc28c95b5442c
---

# Ask

The servers answer while they run, and come back after a restart. Every view of the queue shows the number in the work tab's brackets, and every road in the engine has a caller.

# sync

<!-- takes trunk into the branch, so the box works on the latest -->

## sync

<!-- branch sync, so the branch carries trunk -->

<!-- the form is command -->

    ./RUNME.sh branch sync

# split

<!-- reads the standing children, and mints more where the goal needs them, each naming this group -->

## children

<!-- every child as a link, one a line, with its process -->

<!-- the form is list -->

- [[spec/tickets/every-road-has-a-caller]], standard
- [[spec/tickets/a-closed-ticket-takes-writes]], trivial

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- every child is small enough to review whole: each closed in one review.
- the children add up to what stays in the group. The branch done freed the server, queue view, judge and mark tickets, and each carries its own ask on to the queue.
- neither child waits on the other, so neither names a depends_on.

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
