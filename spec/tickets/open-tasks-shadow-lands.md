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
step: retro/write
process: [[spec/processes/group]]
process_hash: 5d4a884bfb2491ff
enabled_by: migration.phase2shadow
depends_on: [the-foundation-closes-its-gaps]
cloud: true
record:
  - step: sync
    hand: box d81c1a402acf · claude-code-remote
    hash_before: bedc9cefe0d6a773c73bb1be6da6f0892e1e26e0
  - step: sync
    hand: box d81c1a402acf · claude-code-remote
    hash_before: f301ccd48ba9022c2cd8c2c4cca32f7e871a6a10
    hash_after: 1bbabaec73701c2eefbf9fc02aa363fbb1b59d1d
    answered:
      - name: sync
        exit: 0
        said: work/open-tasks-shadow-lands already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box d81c1a402acf · claude-code-remote
    hash_before: a22654053c9ba775401451b384e8f1de26007518
    hash_after: a22654053c9ba775401451b384e8f1de26007518
    inputs:
      - name: ask
        hash: 15f421ce1e8ace06
        size: 568
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: e122785976621597
        size: 10947
    def: cb8f90bc86fc7d39
  - step: children
    hand: the engine
    hash_before: 949b2b59df5f1b933bfcaf5c18d9b5178d20a002
    hash_after: 949b2b59df5f1b933bfcaf5c18d9b5178d20a002
  - step: accept
    hand: box d7a458cc59ec7 · claude-code-remote
    hash_before: b3c4cbe30207d8a5b443e0ab1a592868a7f1495f
    hash_after: b3c4cbe30207d8a5b443e0ab1a592868a7f1495f
    answered:
      - name: sync/sync
        exit: 0
        said: work/open-tasks-shadow-lands already carries every commit on main.
    inputs:
      - name: ask
        hash: 15f421ce1e8ace06
        size: 568
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: e122785976621597
        size: 10947
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box 660bb4d071b9 · claude-code-remote
    hash_before: d01a157bf73274d6d24c3588a9e277ca201486a2
    hash_after: d01a157bf73274d6d24c3588a9e277ca201486a2
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
---

# Ask

Phase 2 of [[spec/design_input/the-migration-runs-in-slices#the-phases]], in shadow. The queue and `work/open-tasks` stand as modules under `src/modules`, and run beside the chain that counts them today. The old path keeps answering, and every mismatch writes a `shadow` row to the session log. The shadow adds the key `migration/config/slices/openTasks`, which the `migration` module declares as a shared key in the default file.

Done when every child closes through the command it names, and `./RUNME.sh log --kind shadow` names each mismatch for the owner to read.

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

[[spec/tickets/the-queue-becomes-a-module]] standard
[[spec/tickets/open-tasks-come-from-work]] standard
[[spec/tickets/queue-reads-when-tickets-came]] trivial
[[spec/tickets/open-tasks-run-in-shadow]] standard
[[spec/tickets/fake-tree-runs-the-queue]] trivial
[[spec/tickets/open-tasks-wired-case-stands]] trivial
[[spec/tickets/ask-spells-the-slice-key]] trivial
[[spec/tickets/places-at-runs-the-shadow]] trivial

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

every child is small enough to review whole, and each stands closed
the children add up to the goal: the queue and work modules, the count, and the shadow with its key and rows
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
