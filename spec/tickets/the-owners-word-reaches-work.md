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
step: retro/write
record:
  - step: sync
    hand: box 0dde19be1600 · claude-code-remote
    hash_before: 18e94e85552c478281f47d467e5dfcffb1c0ab0c
    hash_after: 2d48a1cbd96484b454378d183f05bfefd515c4d8
  - step: sync
    hand: box fcc1ba4a896f · claude-code-remote
    hash_before: 18e9a3fd425b8be1063c3ff4b7402c35bd6c3da3
    hash_after: cc1a26a47c399b88663e3a7a1662389ccb28773d
  - step: sync
    hand: box fcc1ba4a896f · claude-code-remote
    hash_before: d200c5f8fa28583ea2e31e2ffed293ef76db9483
    hash_after: aec0af7ae76a937c689a6bd17f2859467066a337
    answered:
      - name: sync
        exit: 0
        said: work/the-owners-word-reaches-work already carries every commit on main.
  - step: split
    hand: box fcc1ba4a896f · claude-code-remote
    hash_before: e6dada9d095f1b518c7b9f1fe7cb3847162df334
    hash_after: e6dada9d095f1b518c7b9f1fe7cb3847162df334
  - step: children
    hand: the engine
    hash_before: a1e1212acde46714228a76b0b4e6efbf825c0058
    hash_after: a1e1212acde46714228a76b0b4e6efbf825c0058
  - step: retro/notes
    hand: box fcc1ba4a896f · claude-code-remote
    hash_before: eb322145a58115206c00cd20406e54abcc72c23f
    hash_after: eb322145a58115206c00cd20406e54abcc72c23f
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
  - step: retro/write
    hand: box d7a4b8aac9106 · claude-code-remote
    hash_before: 741fe98f17f5cbe1c1428d0ae3db5068f491bfe8
---

# Ask

The owner's words reach the work as said. A claim of done rests on the owner's view, and a small ask stays small.

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

- [[spec/tickets/a-small-ask-stays-small]], standard
- [[spec/tickets/the-owner-view-decides-done]], standard
- [[spec/tickets/the-owners-words-travel-verbatim]], standard
- [[spec/tickets/the-hook-awaits-the-spawn]], trivial
- [[spec/tickets/the-new-rule-appends]], trivial
- [[spec/tickets/the-view-fails-to-implement]], trivial
- the other review findings, each trivial, closed into the child they name

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- each child changes one road: the small ask, the owner's view, or the owner's words
- the children add up to the ask: a small ask stays small, done rests on the view, and the words travel as said
- the verbatim child reads the Ask-line reader the view child lands, and each landed in that order on this branch

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
