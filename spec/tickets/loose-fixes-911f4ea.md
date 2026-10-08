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
    checklist: ["every child is small enough to review whole, or is a group itself", "the children add up to the goal, and nothing of the goal stands outside them", "a child that waits on another names it under depends_on", "each child names what it reads from its siblings, and the children land in that order", "a group whose diff grows past one review splits into a group of its own before it grows further"]
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
            home: true
            says: how each bad line stops happening, each line naming its home as a link, a ticket in backticks or a path in backticks
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
process_hash: d9f9539fef3ec913
step: retro/write
fix: true
record:
  - step: sync
    hand: box f9a347032e0b · claude-code-remote
    hash_before: f4d4cfc83cc85511989a3c7c6932f494ef11b478
    session: cse_01NDHJqHBMiFBoMeufqUF5YY
  - step: sync
    hand: box f9a347032e0b · claude-code-remote
    hash_before: d3495ac80e5afa063e8a9176b0bcfa0f8cfdfb55
    hash_after: d3495ac80e5afa063e8a9176b0bcfa0f8cfdfb55
    answered:
      - name: sync
        exit: 0
        said: work/loose-fixes-911f4ea already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box f9a347032e0b · claude-code-remote
    hash_before: 5a7bb096aa870dbe0f5b8c6c32c4c1614a3fc216
    hash_after: 5a7bb096aa870dbe0f5b8c6c32c4c1614a3fc216
    inputs:
      - name: ask
        hash: 8dc00399b152ebf3
        size: 385
      - name: [[spec/design_input/the-cloud-runs-itself]]
        hash: 4fda339dd698ce5e
        size: 13377
    def: 19b6849b1f151cd5
  - step: children
    hand: the engine
    hash_before: 2e143d64abc737684457384f8f345902f2c06a57
    hash_after: 2e143d64abc737684457384f8f345902f2c06a57
  - step: accept
    hand: box f9a347032e0b · claude-code-remote
    hash_before: 8c513c159306d8024ec075834ccd42181a120168
    hash_after: 8c513c159306d8024ec075834ccd42181a120168
    answered:
      - name: sync/sync
        exit: 0
        said: work/loose-fixes-911f4ea already carries every commit on main.
    inputs:
      - name: ask
        hash: 8dc00399b152ebf3
        size: 385
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: [[spec/design_input/the-cloud-runs-itself]]
        hash: 4fda339dd698ce5e
        size: 13377
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box f9a347032e0b · claude-code-remote
    hash_before: b3d11296e2605932fe4f1c83c3a74b4d52475e05
    hash_after: b3d11296e2605932fe4f1c83c3a74b4d52475e05
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
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

- [[doors-pr-windows-goes-green]], trivial

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every child is small enough to review whole: the one child carries no diff on this branch
- the children add up to the goal: the one loose agent ticket naming this group is the one child
- no child waits on another
- no child reads from a sibling
- the diff stays inside one review

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

### well

<!-- what went well, and what made it go well -->

<!-- the form is list -->

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->

<!-- the form is list -->

### improve

<!-- how each bad line stops happening, each line naming its home as a link, a ticket in backticks or a path in backticks -->

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
