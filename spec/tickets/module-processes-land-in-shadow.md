---
kind: [[ticket]]
state: open
step: retro/notes
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
    checklist: ["every child is small enough to review whole, or is a group itself", "the children add up to the goal, and nothing of the goal stands outside them", "a child that waits on another names it under depends_on"]
    evidence:
      - name: children
        form: list
        says: every child as a link, one a line, with its process
  - name: children
    by: children
    on_fail: split
  - name: accept
    gate: does the work of every child add up to the goal, and does every command of the route pass
    final: true
    does: reads the diff since its last verdict against the goal and every prose criterion, and names what falls short as points
    tags: ["review", "accept"]
    input: ["ask", "children"]
    evidence:
      - name: verdict
        form: verdict
        says: accept, accept with points naming a fix ticket a line, or reject with findings one a line
  - name: retro
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
process: [[spec/processes/group]]
process_hash: 5d4a884bfb2491ff
record:
  - step: sync
    hand: box 03ba8e0fb2d4 · claude-code-remote
    hash_before: 29658dea603ac6cbf84d805c464b7e6e53cb920a
    hash_after: 2e4a2d7267800dec02984fc3bf0bf2fa6b83df6f
  - step: sync
    hand: box 36586c1b4c37 · claude-code-remote
    hash_before: b91d7086b35e9baa4077c29e9b7469aca9da9069
    hash_after: fac27e51027eae82509239eabb5d07de53b922fd
  - step: sync
    hand: box 5ebffe916bed · claude-code-remote
    hash_before: af2310e82f638eca56fb908adb0abe22d3df2034
    hash_after: cf52e9e8b2231f7228398e4239407260b182945c
  - step: sync
    hand: box 23776eae9f68 · claude-code-remote
    hash_before: cf52e9e8b2231f7228398e4239407260b182945c
  - step: sync
    hand: box 23776eae9f68 · claude-code-remote
    hash_before: 28f2be8745fee81f658d84ebb3bd0ba24b51a619
    hash_after: 28f2be8745fee81f658d84ebb3bd0ba24b51a619
    answered:
      - name: sync
        exit: 0
        said: work/module-processes-land-in-shadow already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box 23776eae9f68 · claude-code-remote
    hash_before: 76a2fda275dd443e32a80d6cb1c45942e7c681f2
    hash_after: 76a2fda275dd443e32a80d6cb1c45942e7c681f2
    inputs:
      - name: ask
        hash: 392420b7addb5a7e
        size: 548
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: e122785976621597
        size: 10947
    def: cb8f90bc86fc7d39
  - step: children
    hand: the engine
    hash_before: 5ce7a9878c36dbdba15316f6762971e7387c4d4f
    hash_after: 5ce7a9878c36dbdba15316f6762971e7387c4d4f
  - step: accept
    hand: box 23776eae9f68 · claude-code-remote
    hash_before: 1c97a1ef1a1217ff7e92013d1ba43718c562d838
    hash_after: deeb93da9c375e113b816ef8dc2ee4f394de0dc2
    answered:
      - name: sync/sync
        exit: 0
        said: work/module-processes-land-in-shadow already carries every commit on main.
    inputs:
      - name: ask
        hash: 392420b7addb5a7e
        size: 548
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: e122785976621597
        size: 10947
    def: 07c43ae7253713ec
depends_on: ["go-cage-switches-over", "lsp-door-switches-over", "sidebar-switches-over"]
enabled_by: migration.phase9shadow
cloud: true
---

# Ask

Phase 9 of [[spec/design_input/the-migration-runs-in-slices#the-phases]], in shadow: the deployment. The IO process, and module processes the system places, with watchdogs across the processes. The old path keeps answering, and every mismatch writes a `shadow` row to the session log. The shadow adds the key `migration/config/slices/processes`, which the `migration` module declares as a shared key in the default file.

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

- [[spec/tickets/the-doors-process-stands]], standard
- [[spec/tickets/the-system-places-modules]], standard
- [[spec/tickets/watchdogs-span-the-processes]], standard
- [[spec/tickets/fake-snapshot-stays-in-case]], trivial
- [[spec/tickets/model-marks-io-names]], trivial
- [[spec/tickets/module-silence-reads-alarms]], trivial
- [[spec/tickets/placements-leave-http]], trivial
- [[spec/tickets/placements-select-off-the-table]], trivial
- [[spec/tickets/processes-links-point-at-model]], trivial
- [[spec/tickets/topic-folder-in-the-table]], trivial

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every child is small enough to review whole: each standard child carries one process piece, and each trivial child one fix
- the children add up to the goal: the IO process, the placed module processes and the watchdogs, under the processes key the default file sets to shadow
- no child waits on another past its depends_on: watchdogs-span-the-processes names the-doors-process-stands, and every child stands closed

# children

# accept

<!-- reads the diff since its last verdict against the goal and every prose criterion, and names what falls short as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept

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
