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
fix: true
cloud: true
record:
  - step: sync
    hand: box d84ce7ff23d8 · claude-code-remote
    hash_before: f5e429651e5110315ee42723c4e059ab70ee87ea
  - step: sync
    hand: box d84ce7ff23d8 · claude-code-remote
    hash_before: 8d423ed8256a532a6fb342d9dc413e34107af0f0
    hash_after: 8d423ed8256a532a6fb342d9dc413e34107af0f0
    answered:
      - name: sync
        exit: 0
        said: work/loose-fixes-4140d51 already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box d84ce7ff23d8 · claude-code-remote
    hash_before: aee81ffed8cc12d914e651cf1a946da6ff2d2815
    hash_after: aee81ffed8cc12d914e651cf1a946da6ff2d2815
    inputs:
      - name: ask
        hash: 514ac4d454e0004c
        size: 371
      - name: [[spec/design_input/the-cloud-runs-itself]]
        hash: 591680bf2c6fc6d6
        size: 13376
    def: cb8f90bc86fc7d39
  - step: children
    hand: the engine
    hash_before: 69fc23f0a1e23973f89874bfdbe45962c950a34b
    hash_after: 69fc23f0a1e23973f89874bfdbe45962c950a34b
  - step: accept
    hand: box d84ce7ff23d8 · claude-code-remote
    hash_before: 83718dc38c2cd4fa8b6f402913b359cde33ec4f3
    hash_after: 83718dc38c2cd4fa8b6f402913b359cde33ec4f3
    answered:
      - name: sync/sync
        exit: 0
        said: work/loose-fixes-4140d51 already carries every commit on main.
    inputs:
      - name: ask
        hash: 514ac4d454e0004c
        size: 371
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: [[spec/design_input/the-cloud-runs-itself]]
        hash: 591680bf2c6fc6d6
        size: 13376
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box d84ce7ff23d8 · claude-code-remote
    hash_before: 980425de8377e06c59c760cb4ee62cc0140aacca
    hash_after: 980425de8377e06c59c760cb4ee62cc0140aacca
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
step: retro/write
---

# Ask

The loose agent tickets on main land in this fix group, per [[spec/design_input/the-cloud-runs-itself#feature-groups-and-fix-groups]].

A fix group hands back no ticket for an agent. What it leaves goes to a person as a question ticket.

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

- [[spec/tickets/take-honours-the-name]], process trivial, closed done on the work PR #7 landed on main

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the one child is a single scoped change, small enough to review whole
- the goal is the loose agent tickets on main, and take-honours-the-name is the only ticket naming this group
- no child waits on another, so no depends_on stands

# children

# accept

<!-- reads the diff since its last verdict against the goal and every prose criterion, and names what falls short as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept
The one child, take-honours-the-name, closes done. Its work stands on main in commit 008c2a7b8, and its named test answers green here.
./RUNME.sh check exits 0 on this branch. Six prose warnings stand, five on tickets other hands hold, and the door refuses a write to them.

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

- take-honours-the-name: the box passes `do` on the work main already carries, and redoes nothing. It weighs three facts. Commit 008c2a7b8 stands on `origin/main` and adds `src/scripts/work-held.js` with `pastHold`. `test/level0/work-held.test.js` holds both cases the ask names. One takes a name over a done hold, and one meets a refusal naming both branches. `./RUNME.sh branch test test/level0/work-held.test.js` answers green on this branch. It assumes the ticket's `says` evidence still describes main. No later commit on those files changes the take's order.
