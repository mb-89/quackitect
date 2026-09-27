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
depends_on: [the-foundation-lands-unchanged]
enabled_by: migration.phase2shadow
record:
  - step: sync
    hand: box d7d70c069f441 · claude-code-remote
    hash_before: ef191748722031f7e521c65f9fb70c78629bde96
  - step: sync
    hand: box d7d70c069f441 · claude-code-remote
    hash_before: 277c2c5207c7b788ff9aa47aeaeb7dfb8f0e06da
    hash_after: 370d487478c1ceefe54a3aa27dcf7034b3adb3a9
    answered:
      - name: sync
        exit: 0
        said: work/open-tasks-land-in-shadow already carries every commit on main.
  - step: split
    hand: box d7d70c069f441 · claude-code-remote
    hash_before: d3391d99ec71947f9219d32a47819ddd90e1fed9
    hash_after: 7b6be703e04b72c3e7eec5fbba34b7e7e3edd1fd
  - step: children
    hand: the engine
    hash_before: f10a75f63c7a669a2af11294d6d87314a5e427c9
    hash_after: f10a75f63c7a669a2af11294d6d87314a5e427c9
---

# Ask

Phase 2 of [[spec/design_input/the-migration-runs-in-slices#the-phases]], in shadow: the pilot. The cloud marker, the tickets topic, the queue, and `work/open-tasks`, computed beside the chain that counts them today. The old path keeps answering, and every mismatch writes a `shadow` row to the session log.

Done when the new path runs in shadow on `main`, and `./RUNME.sh log --kind shadow` names each mismatch for the owner to read.

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

- [[spec/tickets/groups-carry-the-cloud-marker]], standard
- [[spec/tickets/the-tickets-topic-lands]], standard
- [[spec/tickets/ask-reading-names-its-differences]], trivial
- [[spec/tickets/close-force-guards-trunk-checkout]], trivial
- [[spec/tickets/go-test-names-the-root]], trivial
- [[spec/tickets/open-marker-outlives-refused-push]], trivial
- [[spec/tickets/open-marks-standing-branches]], trivial
- [[spec/tickets/private-tickets-reach-tickets-all]], trivial
- [[spec/tickets/the-golden-keys-group-hash]], trivial
- [[spec/tickets/tickets-register-in-the-catalog]], trivial

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- Each child stands closed, and each trivial child reads whole in one diff.
- The children carry the cloud marker and the tickets topic. The queue port and `work/open-tasks` left the group at `branch done`, and a next group carries them: [[spec/tickets/the-queue-moves-to-plan]], [[spec/tickets/open-tasks-come-from-work]], [[spec/tickets/open-tasks-run-in-shadow]].
- No child here waits on another, so none names `depends_on`.

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
