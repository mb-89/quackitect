---
kind: [[ticket]]
state: closed
step: retro/cloud
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
  - step: retro/notes
    hand: box 23776eae9f68 · claude-code-remote
    hash_before: 22a4b0306c81db346c6416d9e1c9fb2cf8388b9e
    hash_after: 22a4b0306c81db346c6416d9e1c9fb2cf8388b9e
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
  - step: retro/write
    hand: box 23776eae9f68 · claude-code-remote
    hash_before: 9457b28da7508236d56f4178e46139490aecd8c3
    hash_after: 9457b28da7508236d56f4178e46139490aecd8c3
    inputs:
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: retro/notes
        hash: 310d2ddd3fe31ac9
        size: 36
    def: 1246a42e29e7ae98
  - step: retro/cloud
    hand: box 23776eae9f68 · claude-code-remote
    hash_before: 28e31355f8aeef1e44d9c654b02ef9a58116fa2b
    hash_after: 28e31355f8aeef1e44d9c654b02ef9a58116fa2b
    inputs:
      - name: retro/write
        hash: 25a8d15261ca518d
        size: 3117
    def: 4da1ca5da87d5bbc
depends_on: ["go-cage-switches-over", "lsp-door-switches-over", "sidebar-switches-over"]
enabled_by: migration.phase9shadow
cloud: true
reason: done
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

./RUNME.sh retro notes

## write

<!-- writes the retro over the box's own window -->

### done

<!-- what was done, one line a ticket or a thing -->
<!-- the form is list -->

- module-silence-reads-alarms: the silent module case runs over the manager's dog in quack, and reads session/alarms
- watchdogs-span-the-processes: the leases, the restarts and the alarms reach across the processes under the shadow
- expired-hands-leave-on-stop: a stopped placed process drops its expiry hand
- health-row-once-a-silence: a guarded call writes one shadow row a silence of the index
- the take at 01:30 took main in, and level0.json keeps both the processes slice and work.staleAfter

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

- the red cases decided each piece, so each push carried one green package
- an independent review at accept found the hand leak and the row flood, and both closed in the group
- the race detector ran clean over the four changed packages before the accept

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->
<!-- the form is list -->

- 01:28 the take came back refused, since no check had run on the box, and the check took a turn
- 01:28 the shell door refused calls until the server ran again, and it fell again after each quack test run
- 01:30 the take met a conflict in level0.json at sync
- 01:43 the check refused the silent module case in src/index, since the index imports no module
- 02:05 the hand-back read a warning line of the check as red, and then go test's ok as red
- 02:36 the commit door refused code with no staged test, twice in one package each
- 02:46 manager.go named config, which lease.go imports alone
- 02:58 gofmt refused an alignment, and a format fix then needed a staged test
- 03:13 a code comment carried history, and the check refused it at error
- 03:34 I minted the fix tickets before the accept, and the verdict refused to mint them twice
- no owner prompt reached the run past the dispatch prompt and two stop-hook notes

### improve

<!-- how each bad line stops happening, named by its home -->
<!-- the form is list -->

- the cloud guidance: run the check before branch take on a fresh box
- the doors process: keep the server up past a quack test run, or say why it falls
- the testing guidance: a test that crosses a module boundary goes to the package wiring both
- the trivial route: name branch test with the changed files as the tests evidence
- the code guidance: put a constant beside the import that reads it
- the accept leaf: say the verdict mints its points, so no hand mints them first

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The design put the index's beat in the manager, which reaches no bus. The run moved it to quack, off each commit of index/health, since only the work loop's renew commits it, so a hung loop still beats nothing. The hooks case read the wall clock while the door reads its own, and the run moved the case onto the fixed clock. The reviewer's point that a shadow process raises a real alarm stands as the design asks.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every fact the change adds stands in one place: the lease term in lease.go, the told end on the door
- every number the change adds carries a name: watchSteps in io.go, and the term reads off config
- every header the change writes says what its file is for: no new file opened
- the chapter carries the run's errors with their times, and names no owner prompt past the dispatch
- the chapter says the role, and carries no name, address or path of the box

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->
<!-- the form is list -->

- 01:28 the take tool over MCP answered no handler, so the shell verb took its place

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->
<!-- the form is list -->

- 01:28 the trunk guard held the take's push until a check ran on the box
- 01:30 a conflict at sync in level0.json, which kept both sides
- the write door's server fell after each quack test run, and serve brought it back
- the plan hook refused calls until the plan named the work in hand

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->
<!-- the form is list -->

- no person step stands parked, no ticket stands minted outside the group, and the handover names none

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
