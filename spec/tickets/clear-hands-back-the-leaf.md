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
step: retro/cloud
record:
  - step: sync
    hand: box 156418b839c4 · claude-code-remote
    hash_before: 4450569fccb58c3a9f7136fe3ceeb83fada71971
    hash_after: 0605116fa656ac502753e02eddeb02cb0137cf4d
  - step: sync
    hand: box 156418b839c4 · claude-code-remote
    hash_before: fbeabf1f0c7331f85c58bd4a1140ea0d8db2c25a
    hash_after: fbeabf1f0c7331f85c58bd4a1140ea0d8db2c25a
    answered:
      - name: sync
        exit: 0
        said: work/clear-hands-back-the-leaf already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box 156418b839c4 · claude-code-remote
    hash_before: 5cd3e07bd327bf06bcb7db42315e594903dc63fd
    hash_after: 5cd3e07bd327bf06bcb7db42315e594903dc63fd
    inputs:
      - name: ask
        hash: 2ef6b9dde7e8eb45
        size: 457
    def: cb8f90bc86fc7d39
  - step: children
    hand: the engine
    hash_before: 5ccc94ce8a2a75a751e47e29c544a97fa61fe24d
    hash_after: 5ccc94ce8a2a75a751e47e29c544a97fa61fe24d
  - step: accept
    hand: box 156418b839c4 · claude-code-remote
    hash_before: a28d4c0effaeff6a56365002cde5a501cdfd4ee3
    hash_after: a28d4c0effaeff6a56365002cde5a501cdfd4ee3
    answered:
      - name: sync/sync
        exit: 0
        said: work/clear-hands-back-the-leaf already carries every commit on main.
    inputs:
      - name: ask
        hash: 2ef6b9dde7e8eb45
        size: 457
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box 156418b839c4 · claude-code-remote
    hash_before: f67fd1abe4e6cc39cca45394a6b0bfaf2d1f4db8
    hash_after: f67fd1abe4e6cc39cca45394a6b0bfaf2d1f4db8
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
  - step: retro/write
    hand: box 156418b839c4 · claude-code-remote
    hash_before: d3263a74c6582071c1445efb240fefeef9eb409e
    hash_after: d3263a74c6582071c1445efb240fefeef9eb409e
    inputs:
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: retro/notes
        hash: 310d2ddd3fe31ac9
        size: 36
    def: 1246a42e29e7ae98
  - step: retro/cloud
    hand: box 156418b839c4 · claude-code-remote
    hash_before: 8719fe198977c01f5cd8dbe7dcf53cbdd9e51bf9
    hash_after: 8719fe198977c01f5cd8dbe7dcf53cbdd9e51bf9
    inputs:
      - name: retro/write
        hash: c208215450c5f11f
        size: 2336
    def: 4da1ca5da87d5bbc
reason: done
---

# Ask

<!-- goal, as text: what these tickets add up to, for the hand that takes them -->

A cloud box carries the leaf it holds across a context clear. The pull after the clear hands that leaf back in the same turn. A second handover with no new commit sends the box back to its leaf. The pull hands out the handover and `clear` tickets as work nowhere. The dry probe walks the whole cycle, handover, clear, pull, continue, commit.

The group carries the name the owner ordered with its article cut, because a branch name holds at most five words.

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

- [[spec/tickets/the-clear-hands-back-the-leaf]], standard
- [[spec/tickets/clear-names-the-probe-test]], trivial

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the fix stands in one ticket, reviewable whole, and the point is a one-line correction
- the fix ticket carries every done_when line of the goal, so nothing of the goal stands outside it
- the point waits on nothing open, and both stand closed

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

- the-clear-hands-back-the-leaf: the Stop that answers the clear puts the read in its place, the read's pass hands the leaf, a second handover hands the leaf back, and the clear's tickets hold no pull back
- the dry probe walks past the clear: the read, the leaf, a commit, and no second clear
- clear-names-the-probe-test: the Discussion names the file the probe cases stand in

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

- the dry probe reproduced the live loop through the real plugin and door before any fix, so the cause stood proven and not guessed
- the Go pull tests run over a real origin and clone, so each case reads the exact answer a box reads

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->
<!-- the form is list -->

- 09:30 UTC, the owner prompt arrives as a background event naming a normal route, and the tree holds no normal process
- 09:33 UTC, branch open refuses: it reads the group off main, and a box pushes no main
- 09:35 UTC, the ticket name runs past the five words a branch name holds
- 09:41 UTC, a plan working on a ticket name holds the pull at wait, twice
- 09:52 UTC, the tests-red hand-back takes a raw go test as no assertion, and the commit hook asks a test file named beside probe-clear.js
- 09:55 UTC, the index restarts mid hand-back, and the point waits on a check the main ticket turns red
- 10:06 UTC, the commit hook refuses the change step, because its tests landed one step earlier

### improve

<!-- how each bad line stops happening, named by its home -->
<!-- the form is list -->

- `src/branches/take.go` openGroup: a cloud box opens its own group branch off origin main, with no push to main
- `src/pull/pull_holds.go` workingTodo: a plan naming a ticket that stands in the hold reads as no todo
- `spec/processes/standard.yaml` tests-red: the probe a ticket extends joins the red list, so the check stands green between steps

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The owner reads the loop as a fault of the pull alone. The cause stands one door over: the port that retired the bridge server carried the clear onto the Go door and left out the step after it. So the box held the clear across the clear, and every resumed turn answered it again.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each fact stands in the ticket that owns it, and this chapter points at files by name
- the change adds no number
- the one header the change writes, on pull_clear_test.go, says what the file is for
- the badly list carries the owner prompt and each error with its time
- the chapter names the box by its role alone

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->
<!-- the form is list -->

- none: every tool the run asked stood on the box

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->
<!-- the form is list -->

- the commit hook asking a test beside each code file, at the probe change and at the change step
- the write door binding each edit to the ticket in hand, while the point stood before the fix
- the stop hook refusing the helpers reason, since a cloud box stops its helpers with its turn

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->
<!-- the form is list -->

- no person step parked
- no ticket minted outside this group

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
