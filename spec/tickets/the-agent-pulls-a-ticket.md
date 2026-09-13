---
kind: [[ticket]]
state: open
urgency: soon
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
depends_on: ["a-process-is-a-route", "a-group-is-a-branch"]
record:
  - step: sync
    hand: an unnamed box
    hash_before: b0eba19f17474e1b311a53564228e73f2db54852
  - step: sync
    hand: box d49afdfe301a64
    hash_before: e41a185a0be3e8593b2bc9ada89b3d44c95992a4
    hash_after: ee264c82a7be39a66a62114933336c336478cfa8
    answered:
      - name: sync
        exit: 0
        said: work/the-agent-pulls-a-ticket already carries every commit on main.
  - step: split
    hand: box d49afdfe301a64
    hash_before: ce2ed820d36e74a03d6ae66b2c09f5db55109d7e
    hash_after: 91e407676de09781dcbc219c124cf719858c57d9
step: children
---

# Ask

The agent pulls a ticket. This group lands the pull, its checks, its answers, the record, a hold per hand and the stop rule. So a box works a group's tickets leaf by leaf with no brief.

Done is one of two things, and the retro over the box's own window with it:

- the child ticket closes
- the child ticket parks at the one step this box lacks a hand for

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

- [[spec/tickets/agent-pulls-ticket]], under the standard process

## checked

- the one child is the engine whole, and its diff is the branch, which one reviewer reads at the verdict step
- the child's ask carries the brief's tables, so the pull, the test verb, the hold, the stop rule and the wrapper stand inside it
- the child waits on no other ticket, and the group's own dependencies stand on the group

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

This is the first group a box works under the pull, so its own record is the first run of the group route as data. The child ticket carries the brief's tables, because the brief is where the owner wrote them.
