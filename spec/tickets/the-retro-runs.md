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
step: children
record:
  - step: sync
    skipped: true
    why: the box runs off the cloud
  - step: split
    hand: box d42624a67d18a8 · claude-code
    hash_before: 581614665675d9aeffd86b072b89bba30e8be6d4
    hash_after: 581614665675d9aeffd86b072b89bba30e8be6d4
---

# Ask

<!-- goal, as text: what these tickets add up to, for the hand that takes them -->

The retro route runs end to end, because the verb its first step names stands.

| what stands today | what this group lands |
|---|---|
| the route, in its process file | the verb the route calls |
| the readers, in a process file of their own | the mint that writes one per chapter |
| the note drain, under the retro verb | the collect beside it |
| the design, in full | the code answering it |

Read [[spec/design_input/the-agent-pulls-tickets]] first, the chapter The retro. It names every take, every leaf and every count, and this group builds what it names.

# sync

<!-- takes trunk into the branch, so the box works on the latest -->

## sync

<!-- branch sync, so the branch carries trunk -->

<!-- the form is command -->

# split

<!-- mints the children, or assigns standing tickets, each naming this group -->

## children

- [[spec/tickets/the-retro-takes-the-box]], off [[spec/processes/standard]]
- [[spec/tickets/the-retro-cuts-its-window]], off [[spec/processes/standard]]
- [[spec/tickets/a-retro-mints-itself]], off [[spec/processes/standard]]

<!-- the form is list -->

## checked

- every child is small enough to review whole. Each one lands in a diff a reader reads at a sitting.
- the children add up to the goal. The take, the cut and the mint are the whole of the verb.
- a child that waits on another names it. The cut names the take under depends_on.

<!-- the form is checklist -->

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

- The owner reads every branch for a retro verb first, and none carries one. So this group takes it.
- [[spec/tickets/the-runtime-files-stand-apart]] splits the private folder into three, and the retro's half is one of them.
- The owner rules the take a deny list. Collect takes every file under the private folder that the list leaves standing.
- So that split matters here. The runtime half is what the deny list names, beside the retro's own folders.
- The first window takes the tree's first commit, because no retro closes before it.
