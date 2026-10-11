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
step: retro/cloud
fix: true
cloud: true
record:
  - step: sync
    hand: box 05c4736f6ff2 · claude-code-remote
    hash_before: f3f63063b8f2c311bf487752207439a096fdf961
    session: cse_01H2kW6pjRfTnoLoJ5T2hs9w
  - step: sync
    hand: box 05c4736f6ff2 · claude-code-remote
    hash_before: 3dc4ab864d7a51c18b0c2abe11aaf97c4c0cac6e
    hash_after: 7d874ae8f97d8ea4308e3caa3c7242441a2759c7
    answered:
      - name: sync
        exit: 0
        said: work/loose-fixes-0032249 already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box 05c4736f6ff2 · claude-code-remote
    hash_before: ef9ccfa4152aef76928fc80f35f1f91e24d97403
    hash_after: ef9ccfa4152aef76928fc80f35f1f91e24d97403
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
    hash_before: 8858fc12593e34623af564b7c2531ab94e10db85
    hash_after: 8858fc12593e34623af564b7c2531ab94e10db85
  - step: accept
    hand: box 05c4736f6ff2 · claude-code-remote
    hash_before: 4a95aa6dcaf9c01b98e817114e87969d325f2e84
    hash_after: 4a95aa6dcaf9c01b98e817114e87969d325f2e84
    answered:
      - name: sync/sync
        exit: 0
        said: work/loose-fixes-0032249 already carries every commit on main.
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
    hand: box 05c4736f6ff2 · claude-code-remote
    hash_before: 1591339398278670fcfb0ca0cd44ad3d4b07f024
    hash_after: 1591339398278670fcfb0ca0cd44ad3d4b07f024
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
  - step: retro/write
    hand: box 05c4736f6ff2 · claude-code-remote
    hash_before: dfbb69a3edb790b29f734e3a44098c445d32cf67
    hash_after: dfbb69a3edb790b29f734e3a44098c445d32cf67
    inputs:
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: retro/notes
        hash: cd64de0d4d23e2c7
        size: 40
    def: e7ed0badf886b5b5
  - step: retro/cloud
    hand: box 05c4736f6ff2 · claude-code-remote
    hash_before: 28e7791da286ce555c0338ca2fe48ab53b247aec
    hash_after: 28e7791da286ce555c0338ca2fe48ab53b247aec
    inputs:
      - name: retro/write
        hash: 9e7dc1096b8a2e74
        size: 1465
      - name: [[spec/tickets/wal-case-opens-a-copy]]
        hash: 8942f4d0ccdbb49a
        size: 490
    def: 4da1ca5da87d5bbc
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

- [[spec/tickets/wal-case-opens-a-copy]], trivial

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the one child is a single test case, small enough to review whole
- the child is the one loose agent ticket on main, so it covers the goal
- no child waits on another
- no child reads from a sibling
- the diff carries ticket evidence alone, well inside one review

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

- [[spec/tickets/wal-case-opens-a-copy]] closes on the fix standing on main, with its case and the check green
- the group syncs main in, and the sync resolves its own conflict on the group ticket

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

- the fix stood on the branch already, so the step took evidence alone, because the ticket discussion named the commit

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->
<!-- the form is list -->

- 07:19 UTC the do step refused `go test` as the tests evidence, since a field expecting green wants the tree's test verb
- 07:21 UTC the accept gate refused --pass, since its verdict field decides, while the hand-back hint names --pass on every leaf
- the level0 tool server dropped after the take, so every hand-back ran through the command line

### improve

<!-- how each bad line stops happening, each line naming its home as a link, a ticket in backticks or a path in backticks -->
<!-- the form is list -->

- the hand-back hint drops --pass on a leaf holding a verdict field, in `src/pull/pull_chapter.go`
- the refusal of a green field names `./RUNME.sh test <path>` as the command it takes, in `src/pull/pull_accept.go`

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The dispatch named work/check-notices-leave-the-cap, but its one child waits at an owner read, so the take handed this fix group instead. The group held one ticket whose fix had already merged, so the run recorded evidence and moved the group through its route.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every fact stands in its ticket, and the retro points at it
- the retro adds no number
- the change writes no header
- the chapter carries the two refusals with their times, and no owner prompt came
- the chapter names the box by role alone

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->
<!-- the form is list -->

- the level0 tool server, which dropped after the take, so the command line carried every verb

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->
<!-- the form is list -->

- a conflict at sync on the group ticket, which the sync resolved itself
- the check ran past its time budget, and passed

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->
<!-- the form is list -->

- no person step parks
- no ticket minted
- work/check-notices-leave-the-cap waits at design/owner-read for the owner

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
