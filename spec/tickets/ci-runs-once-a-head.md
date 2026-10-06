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
step: retro/cloud
record:
  - step: sync
    hand: box d040db23b249 · claude-code-remote
    hash_before: 8c0f79e4bdb5320a26034a65bb4f7a835cdd0c4a
    hash_after: ab8db557a2278941081d5fd000033c4072f3914f
    answered:
      - name: sync
        exit: 0
        said: work/ci-runs-once-a-head already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box d040db23b249 · claude-code-remote
    hash_before: 07d2388b9cea84fa96feb1c2a784343375245f1c
    hash_after: 07d2388b9cea84fa96feb1c2a784343375245f1c
    inputs:
      - name: ask
        hash: 2f604c4e87630f58
        size: 204
    def: cb8f90bc86fc7d39
  - step: children
    hand: the engine
    hash_before: 26797bfdbd1b7a9445e7a987c5bf5094f087bc0e
    hash_after: 26797bfdbd1b7a9445e7a987c5bf5094f087bc0e
  - step: accept
    hand: box d040db23b249 · claude-code-remote
    hash_before: 0ffa2fc8f83d1377910f94bbbad1989c0441c4c4
    hash_after: 0ffa2fc8f83d1377910f94bbbad1989c0441c4c4
    answered:
      - name: sync/sync
        exit: 0
        said: work/ci-runs-once-a-head already carries every commit on main.
    inputs:
      - name: ask
        hash: 2f604c4e87630f58
        size: 204
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box d040db23b249 · claude-code-remote
    hash_before: 2d06982ee69b278ad8cc9c2383b8bafc728fd391
    hash_after: 2d06982ee69b278ad8cc9c2383b8bafc728fd391
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
  - step: retro/write
    hand: box d040db23b249 · claude-code-remote
    hash_before: a5044e4d3bbd6a797a9ec6be4d723146ae1d2a05
    hash_after: a5044e4d3bbd6a797a9ec6be4d723146ae1d2a05
    inputs:
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: retro/notes
        hash: 310d2ddd3fe31ac9
        size: 36
    def: 1246a42e29e7ae98
---

# Ask

The CI queue runs one check a head. A branch takes its check through its pull
request alone, a newer push cancels the run it supersedes, and trunk's own run
never waits behind the fleet's superseded ones.

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

- [[spec/tickets/check-runs-once-a-head]], trivial

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the one child changes one workflow, its contract test and one design section, small enough to review whole
- the child covers the goal whole: the triggers, the groups, the names kept and the reason written
- no child waits on another, since the group holds one

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

- check-runs-once-a-head: the check runs on a push to main and on a pull request against main, with a concurrency group per pull request that cancels and a group per run on main
- the contract test pins the triggers, the groups and the job name
- work.md carries the reason under the check runs once a head
- the group's tickets reached main through their own pull request, #119

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

- the contract test named the old trigger at once, so the workflow and its test moved together
- the size golden named its own fix, the -twins flag, in its failure line

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->
<!-- the form is list -->

- 20:21 the mint refused the group before a child named it, and the door refused every call naming the group before its file stood
- 20:22 the door refused cloud: true on the group, and no verb named in the ask writes it
- 20:25 branch open refused to run off a detached head, then needed the group on origin main, so the tickets took their own pull request and its queued CI
- 20:47 branch open tried to push its cloud marker to main, the push came back refused, and branch take then handed out another group's done branch
- 20:55 the first commit's check went red on the size golden, so the commit landed on a rescue branch, which stays on origin
- 21:00 the hand-back of do ran past a 115 second cap, and its tests field refused a node command where it wants branch test

### improve

<!-- how each bad line stops happening, named by its home -->
<!-- the form is list -->

- the cloud guidance names the order a box mints a group in: child first, then the group, then the mark
- branch open on a cloud box writes its cloud marker on the work branch, so it needs no push to main
- branch take on a cloud box hands the branch its own group names before a stuck hand-over
- the do step of the trivial process names branch test in its tests field's line

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The ask was small, and the route around it was large: two pull requests and two CI queues for one workflow change. The choice the run weighed was the concurrency key on main. A group per ref drops a queued run when a third push joins, so the change takes a group per run there, and main never gives way.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every fact stands once: the reason lives in work.md, and the workflow and the test link it
- the change adds no number
- the workflow header says what the file is for, and counts nothing
- the chapter carries the run's errors with their times, and the opening prompt stands as the only owner prompt
- the chapter names roles alone, and no box path

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
