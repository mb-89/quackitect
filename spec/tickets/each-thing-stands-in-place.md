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
step: children
record:
  - step: sync
    hand: box b8ae1b45d463 · claude-code-remote
    hash_before: 24c5ff7c229e6eb08bfb916f0b9eda7b349e7dad
  - step: sync
    hand: box b8ae1b45d463 · claude-code-remote
    hash_before: d1e40bc5b723f3ed94d9af103fd235df1dd74b7e
    hash_after: f7b7a842d915829ede147cb7f7418ba3a1ac19ca
    answered:
      - name: sync
        exit: 0
        said: work/each-thing-stands-in-place took 25 commit(s) from main.
  - step: split
    hand: box b8ae1b45d463 · claude-code-remote
    hash_before: d66e10d5034f0ed0c7cac82d977cb1d9b6fb77af
    hash_after: d66e10d5034f0ed0c7cac82d977cb1d9b6fb77af
---

# Ask

Each fact and each note stands in its one place, and small faults land fixed. A retro finishes what it asks, and reads what each cloud box says of its own run.

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

- [[spec/tickets/each-fact-keeps-one-owner]], standard
- [[spec/tickets/each-folder-holds-its-kind]], standard
- [[spec/tickets/the-retro-finishes-its-asks]], standard
- [[spec/tickets/the-retro-reads-cloud-retros]], standard
- [[spec/tickets/the-small-faults-land]], standard
- [[spec/tickets/a-promotion-names-its-fault]], trivial
- [[spec/tickets/a-promotion-ticket-reads-once]], trivial
- [[spec/tickets/callers-name-work-answer-home]], trivial
- [[spec/tickets/the-quoted-pair-stays-paired]], trivial
- [[spec/tickets/the-second-collect-keeps-lines]], trivial

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- [x] every child is small enough to review whole: each standard child passed a review of its own, and the trivial ones came from the review of `the-retro-finishes-its-asks`
- [x] the children add up to the goal: one owner a fact, one kind a folder, the small faults, and the retro's two asks each hold a child
- [x] a child that waits on another names it: the trivial children follow their parent, and the engine hands them in order

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
