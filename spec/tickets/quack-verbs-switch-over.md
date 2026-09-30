---
kind: [[ticket]]
state: open
step: retro/write
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
    hand: box d85989c4d4d5 · claude-code-remote
    hash_before: 29658dea603ac6cbf84d805c464b7e6e53cb920a
    hash_after: 891089bced9b311cfaf088d3b8a802a64b3830d0
  - step: sync
    hand: box d85a88bc0dd4 · claude-code-remote
    hash_before: 891089bced9b311cfaf088d3b8a802a64b3830d0
    hash_after: db48964e661fe42fa924ed0cf4215f8712e1b68e
  - step: sync
    hand: box d8888f6242d7 · claude-code-remote
    hash_before: db48964e661fe42fa924ed0cf4215f8712e1b68e
  - step: sync
    hand: box d8888f6242d7 · claude-code-remote
    hash_before: f31a380063a71d79d4be5b49923e52ad757449b5
    hash_after: f31a380063a71d79d4be5b49923e52ad757449b5
    answered:
      - name: sync
        exit: 0
        said: work/quack-verbs-switch-over already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box d8888f6242d7 · claude-code-remote
    hash_before: 328f1998b76a824b1a03f97c432b7733b136c606
    hash_after: 328f1998b76a824b1a03f97c432b7733b136c606
    inputs:
      - name: ask
        hash: 8a0d99f99d9c7a55
        size: 365
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: e122785976621597
        size: 10947
    def: cb8f90bc86fc7d39
  - step: children
    hand: the engine
    hash_before: fc7e58fefb0f56bb7bd9f3e0d3df0546a053024f
    hash_after: fc7e58fefb0f56bb7bd9f3e0d3df0546a053024f
  - step: accept
    hand: box d8888f6242d7 · claude-code-remote
    hash_before: 7a38146219e3a70e69370a49b4a779dbbffe695f
    hash_after: 7a38146219e3a70e69370a49b4a779dbbffe695f
    answered:
      - name: sync/sync
        exit: 0
        said: work/quack-verbs-switch-over already carries every commit on main.
    inputs:
      - name: ask
        hash: 8a0d99f99d9c7a55
        size: 365
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: e122785976621597
        size: 10947
    def: 07c43ae7253713ec
  - step: accept
    hand: box d8888f6242d7 · claude-code-remote
    hash_before: 9ab27d2581dd959c9c3e4678fcccb68f8a513be8
    hash_after: 9ab27d2581dd959c9c3e4678fcccb68f8a513be8
    answered:
      - name: sync/sync
        exit: 0
        said: work/quack-verbs-switch-over already carries every commit on main.
    inputs:
      - name: ask
        hash: 8a0d99f99d9c7a55
        size: 365
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: e122785976621597
        size: 10947
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box d8888f6242d7 · claude-code-remote
    hash_before: 75f3de0059664816b4ba15dea35f86b250bbf521
    hash_after: 75f3de0059664816b4ba15dea35f86b250bbf521
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
depends_on: ["quack-verbs-land-in-shadow", "open-tasks-switch-lands", "read-topics-switch-over"]
enabled_by: migration.phase4switch
cloud: true
---

# Ask

Phase 4 of [[spec/design_input/the-migration-runs-in-slices#the-phases]], switched over. The slice's key under `migration/config/slices/` moves to `new`, and the old path leaves the tree. The group waits for `migration.phase4switch` to read true in the tracked config on `main`.

Done when agents call `quack` and no `./RUNME.sh` verb, and `cli.js` leaves the tree.

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

[[spec/tickets/agents-call-quack-directly]] on standard
[[spec/tickets/cage-comments-drop-needs-shadow]] on trivial
[[spec/tickets/cli-callers-the-draft-misses]] on trivial
[[spec/tickets/cli-js-leaves]] on standard
[[spec/tickets/describe-reaches-the-tool-list]] on trivial
[[spec/tickets/index-reads-loaded-projections]] on standard
[[spec/tickets/loaded-projection-curl-checkpoint]] on trivial
[[spec/tickets/loaded-projection-test-names-match]] on trivial
[[spec/tickets/runme-road-reads-verbs-new]] on trivial
[[spec/tickets/verb-outputs-name-index-tools]] on trivial
[[spec/tickets/verbline-spares-blocking-verbs]] on trivial

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

every child is small enough to review whole: each is a one-line trivial fix or a standard ticket over one slice, and every one stands closed
the children add up to the goal: agents-call-quack-directly moves the agents to quack, the leaving ticket takes the old script out of the tree, and index-reads-loaded-projections lets the index answer the tracked config the switched verbs read
no child waits on another now, since every one stands closed

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

The native ports this group owes, since each action below runs its verb through `cli.js` over the `node` module until its port lands:

| the topic | what ports | where the old code stands |
|---|---|---|
| `vehicle` | every verb `theVehicle` answers, over the register and the identity file | `theVehicle` in `src/scripts/cli.js` |
| `stub` | into, with its git and its shim | `theStub` in `src/scripts/cli.js` |
| `ticket` | every verb past `yours`, which a twin answers already | `src/scripts/ticket.js` |
| `retro` | every verb past `notes`, which a twin answers already | `src/scripts/retro.js` |
| `branch` | every verb past `list --queue`, which a twin answers already | `WORK_VERBS` in `src/scripts/work.js` |
