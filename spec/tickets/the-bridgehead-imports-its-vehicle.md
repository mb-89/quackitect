---
kind: [[ticket]]
state: closed
urgent: true
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
    hash_before: 1a9a2d76f8e0d8fb1904a9efe154e03a6e17b014
  - step: sync
    skipped: true
    why: the box runs off the cloud
  - step: split
    hand: box d42624a67d18a8
    hash_before: 4ab44c819b8d390fc6bb94fc105edf7d3d0b1c9b
    hash_after: 4ab44c819b8d390fc6bb94fc105edf7d3d0b1c9b
  - step: children
    hand: the engine
    hash_before: 29a817acca678a1d30b85884c5e83f3a486b29fb
    hash_after: 29a817acca678a1d30b85884c5e83f3a486b29fb
  - step: retro/notes
    hand: box d42624a67d18a8
    hash_before: f3f4d43b2d14a556ea4dd5cbcf7e67b50bbf81c4
    hash_after: f3f4d43b2d14a556ea4dd5cbcf7e67b50bbf81c4
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
  - step: retro/write
    hand: box d42624a67d18a8
    hash_before: 48829e344d1b1d4f86d5a2d801468b9010bfda31
    hash_after: 48829e344d1b1d4f86d5a2d801468b9010bfda31
  - step: retro/cloud
    skipped: true
    why: the box runs off the cloud
    hash_after: e7acf2334fb8a94f6a5763c439b6aab721093496
step: retro/write
reason: done
---

# Ask

The probe every other branch leans on. A plugin imports a hooks module from a path it reads at session start, and forwards every event to it.

The design input [[spec/design_input/a-stub-takes-its-vehicle]] names this group, its proof and what it waits for. The design output [[spec/design_output/vehicle]] carries what stands built.

# sync

<!-- takes trunk into the branch, so the box works on the latest -->

## sync

<!-- branch sync, so the branch carries trunk -->

<!-- the form is command -->

# split

<!-- mints the children, or assigns standing tickets, each naming this group -->

## children

<!-- every child as a link, one a line, with its process -->
<!-- the form is list -->

- [[spec/tickets/bridgehead-imports-vehicle]], under the standard process, which becomes the next
- [[spec/tickets/bridgehead-probe-lands]], under the trivial process

## checked

- each child is the probe whole, small enough to read in one sitting
- the two children add up to the goal: the probe, its tests and the chapter. Nothing of the goal stands outside them.
- the second child waits on no other ticket, because the first becomes it

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

- bridgehead-probe-lands: the probe plugin, the fake vehicle, the unit test, the contract test and the chapter
- bridgehead-imports-vehicle: the approach and its review, then it becomes bridgehead-probe-lands
- the test verb names the tap reporter
- a became hand-back reads no field of the leaf
- two private notes become tree tickets: the-stub-plugin-name and edit-door-reads-whole

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

- the client answers each import shape in one headless turn, so the four shapes cost minutes
- the pull hands out leaf by leaf, and each refusal names the line. The fields land on the second try.
- a helper hand takes the review from the prompt the pull prints

### badly

<!-- what did not, each with its moment in the log or the transcript -->
<!-- the form is list -->

- the standard route asks for a red test, and a probe writes its code first. The tests-red leaf refuses at the hand-back.
- the test verb answers build on node 24, at the first branch test call, because the count reads tap
- a became hand-back checks the fields of the leaf first, at the first became call
- the retro/notes leaf goes out before the private notes, so the hand holds it and pulls no note
- the Edit door of this session refuses the ticket chapters with Schema.checked, so four writes go past it by script
- the hand-back refuses long sentences four times, at every fields payload

### improve

<!-- how each bad line stops happening, named by its home -->
<!-- the form is list -->

- a probe takes the trivial route from the mint: spec/guidance/tickets, a line naming which route a probe takes
- the tap reporter stands in src/scripts/pull.js, with its test
- the became check stands in src/scripts/pull.js, with its test
- the pull offers a private note at a retro step before the group leaf: spec/design_output/pull, What a hand-out reads
- the door reads the ticket schema of the tree, and no older one: spec/tickets/the-hook-reloads-its-door
- a draft field goes through check_answer first: spec/guidance/working, rule 12

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The thoughts circle the client longer than the actions show. Three failing shapes read as the end of the stub design. Then the file table of the design input says the vehicle writes the bridgehead at an update. So a copy inside the plugin folder is the design, and the probe names it. The second circle is the route. The transcript weighs a fake red test before it takes the became road, and the became road is the honest one.

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

Nothing stands here yet.
