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
    hand: box b1311a2beaed · claude-code-remote
    hash_before: 29658dea603ac6cbf84d805c464b7e6e53cb920a
    hash_after: 75375d96fba6a70720d36797a14bc48c859fb59c
  - step: sync
    hand: box 09eeff3afa7c · claude-code-remote
    hash_before: 6f6790863026f71fd441b6ca2eac17f1d824f909
  - step: sync
    hand: box 09eeff3afa7c · claude-code-remote
    hash_before: 6f6790863026f71fd441b6ca2eac17f1d824f909
    hash_after: 24d289657980e1748bf530e1d5775920dc506e1e
    answered:
      - name: sync
        exit: 0
        said: work/module-processes-switch-over already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box 09eeff3afa7c · claude-code-remote
    hash_before: 9bdc20709130b5bf612873ad4da1c3950c880e43
    hash_after: 9bdc20709130b5bf612873ad4da1c3950c880e43
    inputs:
      - name: ask
        hash: 0a32db0c3452e5e4
        size: 357
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: e122785976621597
        size: 10947
    def: cb8f90bc86fc7d39
  - step: children
    hand: the engine
    hash_before: 372a0cd8de7540212b363afbe72d01445760f539
    hash_after: 372a0cd8de7540212b363afbe72d01445760f539
  - step: accept
    hand: box 09eeff3afa7c · claude-code-remote
    hash_before: 3b81d663f6182488f1a0913df3c9bb4ddbac0bf9
    hash_after: 3b81d663f6182488f1a0913df3c9bb4ddbac0bf9
    answered:
      - name: sync/sync
        exit: 0
        said: work/module-processes-switch-over already carries every commit on main.
    inputs:
      - name: ask
        hash: 0a32db0c3452e5e4
        size: 357
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: e122785976621597
        size: 10947
    def: 07c43ae7253713ec
  - step: accept
    hand: box 09eeff3afa7c · claude-code-remote
    hash_before: c0b4f16e80a4ce279f6642d43069f758b8d7b560
    hash_after: c0b4f16e80a4ce279f6642d43069f758b8d7b560
    answered:
      - name: sync/sync
        exit: 0
        said: work/module-processes-switch-over already carries every commit on main.
    inputs:
      - name: ask
        hash: 0a32db0c3452e5e4
        size: 357
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: e122785976621597
        size: 10947
    def: 07c43ae7253713ec
depends_on: ["module-processes-land-in-shadow"]
enabled_by: migration.phase9switch
cloud: true
---

# Ask

Phase 9 of [[spec/design_input/the-migration-runs-in-slices#the-phases]], switched over. The slice's key under `migration/config/slices/` moves to `new`, and the old path leaves the tree. The group waits for `migration.phase9switch` to read true in the tracked config on `main`.

Done when a crash in one part leaves the others running, and raises an alarm.

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

- [[spec/tickets/the-split-deployment-takes-over]] standard
- [[spec/tickets/callers-name-drains-readers]] trivial
- [[spec/tickets/kill-case-drives-live-split]] trivial
- [[spec/tickets/mid-run-commit-clears-early]] trivial
- [[spec/tickets/quack-io-answers-no-run]] trivial

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each child is small enough to review whole: the switch in one standard ticket, and each gate point as a trivial of its own
- the children add up to the goal: the switch moves the slice and kills the old path, and the four points close what the gate found short, the alarm among them through the dog's faults
- no child waits on another: the four points name the switch as parent, and each closed after it

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

- The box, at the accept: a review found that `src/index/door.go` sets `Except` once the manager starts. So a commit inside that window lets a wave in the index compute an away instance's names.
- I mint no ticket for it. The wave runs the same provider over the same inputs as the process, and the process's commit lands over it. The cost is one wave of work at the start.
- A fix hands the manager the scheduler before it starts. That reshapes `Manage`, which the ask leaves alone.
