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
        checklist: ["every fact the change adds stands in one place, and a note points at the file instead of repeating it", "every number the change adds carries a name in one place, and a copy a technical reason forces says so beside it", "every header the change writes says what its file is for, and counts nothing", "the chapter carries the run's owner prompts and errors off the transcript, each with its time", "the chapter says the role, and carries no name, address or path of the box"]
        evidence:
          - name: done
            form: list
            says: what was done, one line a ticket or a thing
          - name: well
            form: list
            says: what went well, and what made it go well
          - name: badly
            form: list
            says: what did not go well, each error of the run and each owner prompt turning it, with its time
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
step: retro/notes
process: [[spec/processes/group]]
process_hash: 57b2cccd0445ea9a
depends_on: [open-tasks-land-in-shadow]
enabled_by: migration.phase2switch
record:
  - step: sync
    hand: box d7d80931cecf · claude-code-remote
    hash_before: ef191748722031f7e521c65f9fb70c78629bde96
  - step: sync
    hand: box d7d80931cecf · claude-code-remote
    hash_before: 832b75de0163512a2cf31f3d96500da425749116
    hash_after: 832b75de0163512a2cf31f3d96500da425749116
    answered:
      - name: sync
        exit: 0
        said: work/open-tasks-switch-over already carries every commit on main.
  - step: split
    hand: box d7d80931cecf · claude-code-remote
    hash_before: 6bf3f8303b230669979340d08e654ca7d7c6019b
    hash_after: 6bf3f8303b230669979340d08e654ca7d7c6019b
  - step: children
    hand: the engine
    hash_before: 2635e46d354e6697f658e662212f277ccfbdea46
    hash_after: 2635e46d354e6697f658e662212f277ccfbdea46
---

# Ask

Phase 2 of [[spec/design_input/the-migration-runs-in-slices#the-phases]], switched over. The slice's key under `slices` moves to `new`, and the old path leaves the tree. The group waits for `migration.phase2switch` to read true in the tracked config on `main`.

Done when the badge and the work tab's brackets read one name.

# sync

<!-- takes trunk into the branch, so the box works on the latest -->

## sync

<!-- branch sync, so the branch carries trunk -->

    ./RUNME.sh branch sync

<!-- the form is command -->

# split

<!-- reads the standing children, and mints more where the goal needs them, each naming this group -->

## children

<!-- every child as a link, one a line, with its process -->

<!-- the form is list -->

- [[spec/tickets/the-badge-reads-open-tasks]], standard
- [[spec/tickets/the-count-chain-leaves]], standard

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- Each child changes one reader or one delete, and a reviewer reads it whole.
- The badge child moves the key, and the count child takes the old path out.
- The count child waits on the badge child, which waits on [[spec/tickets/open-tasks-run-in-shadow]].

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

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->

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
