---
kind: [[ticket]]
state: closed
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
fix: true
cloud: true
record:
  - step: sync
    hand: box d85ab822b1d7 · claude-code-remote
    hash_before: a6a479785bf111a127f126518d43c77cf515c860
  - step: sync
    hand: box d85ab822b1d7 · claude-code-remote
    hash_before: 98d779fa92c5e65c2e2e731aec922241a1f25605
    hash_after: 937b98f9738e3744da7d4233a8ce495b16d64375
    answered:
      - name: sync
        exit: 0
        said: work/loose-fixes-a906d84 took 5 commit(s) from main.
    def: 8a9850a81227554b
  - step: split
    hand: box d85ab822b1d7 · claude-code-remote
    hash_before: 261c8d99d9d1ce92b05289985edb5b069651f9ee
    hash_after: 261c8d99d9d1ce92b05289985edb5b069651f9ee
    inputs:
      - name: ask
        hash: 8dc00399b152ebf3
        size: 385
      - name: [[spec/design_input/the-cloud-runs-itself]]
        hash: 591680bf2c6fc6d6
        size: 13376
    def: cb8f90bc86fc7d39
  - step: children
    hand: the engine
    hash_before: 4e6ffec8c1487967a6808fbed34bb95fd85bd8e2
    hash_after: 4e6ffec8c1487967a6808fbed34bb95fd85bd8e2
  - step: accept
    hand: box d85ab822b1d7 · claude-code-remote
    hash_before: 331da9c444e01f520603009946f97b930554be92
    hash_after: 331da9c444e01f520603009946f97b930554be92
    answered:
      - name: sync/sync
        exit: 0
        said: work/loose-fixes-a906d84 already carries every commit on main.
    inputs:
      - name: ask
        hash: 8dc00399b152ebf3
        size: 385
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: [[spec/design_input/the-cloud-runs-itself]]
        hash: 591680bf2c6fc6d6
        size: 13376
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box d85ab822b1d7 · claude-code-remote
    hash_before: 007f20e6da62b78a28cb050ad52f586128b86399
    hash_after: 007f20e6da62b78a28cb050ad52f586128b86399
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
  - step: retro/write
    hand: box d85ab822b1d7 · claude-code-remote
    hash_before: ec167dc6aeb42406ac81c7dcfaa6736fcb7e03f8
    hash_after: ec167dc6aeb42406ac81c7dcfaa6736fcb7e03f8
    inputs:
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: retro/notes
        hash: 310d2ddd3fe31ac9
        size: 36
    def: 1246a42e29e7ae98
  - step: retro/cloud
    hand: box d85ab822b1d7 · claude-code-remote
    hash_before: 45074c3453de9f6174cc3ae93647562030fa5fd4
    hash_after: 45074c3453de9f6174cc3ae93647562030fa5fd4
    inputs:
      - name: retro/write
        hash: d14ccde7721f3daa
        size: 1900
    def: 4da1ca5da87d5bbc
step: retro/cloud
reason: done
---

# Ask

The loose agent tickets on main land in this fix group, per [[spec/design_input/the-cloud-runs-itself#feature-groups-and-fix-groups]].

A fix group closes every ticket it holds. Work a person alone can do leaves it on the person route, loose on main.

- every ticket naming this group closes through the command it names
- `./RUNME.sh check` exits 0

The view: none.

The source: none.

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

- [[spec/tickets/fix-verbs-shadow-yours-2]], process trivial, closed

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every child is small: the one child is a single trivial step, and it reviews whole
- the children add up to the goal: every other loose ticket on trunk waits on a person, three on the person route and one at draft, so none joins this fix group
- depends_on: the one child waits on nothing

# children

# accept

<!-- reads the diff since its last verdict against the goal and every prose criterion, and names what falls short as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept
- the one child closes through its own command, and its three done lines hold on this box
- the diff carries ticket prose alone, and the check answers green on it
- weighed: the child claims no code fix, and the closed follow-up carries the fix

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

- fix-verbs-shadow-yours-2 closes. Its three done lines hold on this box.
- Three sentences past the word cap split in two, on two tickets of other groups.
- The group opens, splits, passes its gate and reaches its retro.

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

- The earlier hand leaves full evidence, so the recheck takes one run of each verb.
- The door names its fault each time, so each refusal costs one call.

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->
<!-- the form is list -->

- 23:48 UTC: branch take with the full branch name looks for work/work/. The verb adds the prefix itself.
- 23:56 UTC: a patch on the open child refuses the whole batch. The engine writes an open ticket.
- 23:57 UTC: the plan call finds no server. The check stops the server it starts.
- 23:58 UTC: my own evidence line breaks the form rules and lands at warning.
- 00:01 UTC: commit takes no -m flag, and a closed ticket cannot head a commit.
- 00:03 UTC: the pull waits on a draft group until ticket open runs.
- No owner prompt turns the run. The dispatch prompt alone starts it.

### improve

<!-- how each bad line stops happening, named by its home -->
<!-- the form is list -->

- branch take: accept a name carrying work/ and strip it. Its home is the branch verb.
- The work skill: name ticket open for a draft group before the first pull.
- The check: leave the server standing where it finds one, or say it stops it.
- The hand-back: run check_prose over the fields before it writes them.

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The group holds one child, and that child claims no fix. The real fix lands in a closed follow-up. So the run is mostly procedure. Each door refusal teaches one verb shape, and the skill text could carry those shapes up front.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- one place: the cause stands on the child, and this retro points at it
- numbers: the retro adds no number past the times
- headers: the change writes no file header
- prompts and errors: each error carries its time, and no owner prompt turns the run
- role: the retro says the box and the owner, with no name or path

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->
<!-- the form is list -->

- nothing: every tool stands installed, and no host or right meets a refusal

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->
<!-- the form is list -->

- the level zero doors on git writes and on a gate chained before a landing, at 00:00 UTC
- the server stop after the check, at 23:57 UTC
- no conflict at sync, and no test failing on the box alone

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->
<!-- the form is list -->

- no person step parks, and no ticket mints without a group
- the person tickets on trunk stay loose on the person route, untouched

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
