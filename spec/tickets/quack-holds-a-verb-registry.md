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
group: the-verbs-run-in-go
enabled_by: migration.phase11
cloud: true
step: retro/write
record:
  - step: sync
    hand: box 470a600bc22e · claude-code-remote
    hash_before: 8b11a68b844c2317ca1d0b4284b5f3a5fd1c4846
  - step: sync
    hand: box 470a600bc22e · claude-code-remote
    hash_before: 0b335bc831694a4dd2d86437675629639ce71885
    hash_after: daebda642065f70dca1dbe3f52c40328e7ca3449
    answered:
      - name: sync
        exit: 0
        said: work/quack-holds-a-verb-registry took 8 commit(s) from main.
    def: 8a9850a81227554b
  - step: split
    hand: box 470a600bc22e · claude-code-remote
    hash_before: dc5c6af186836672e0cdce31f3502e3b9f784a2e
    hash_after: dc5c6af186836672e0cdce31f3502e3b9f784a2e
    inputs:
      - name: ask
        hash: 0c6937b1a801ee73
        size: 294
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: 3eaee7b8cc71d34a
        size: 11400
    def: cb8f90bc86fc7d39
  - step: children
    hand: the engine
    hash_before: 11e35ab406b45a667a3690043838107360d52318
    hash_after: 11e35ab406b45a667a3690043838107360d52318
  - step: accept
    hand: box 470a600bc22e · claude-code-remote
    hash_before: e51b255ab5525777a5491bbd1724cd877feaf6a7
    hash_after: e51b255ab5525777a5491bbd1724cd877feaf6a7
    answered:
      - name: sync/sync
        exit: 0
        said: work/quack-holds-a-verb-registry already carries every commit on main.
    inputs:
      - name: ask
        hash: 0c6937b1a801ee73
        size: 294
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: 3eaee7b8cc71d34a
        size: 11400
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box 470a600bc22e · claude-code-remote
    hash_before: dde8a2e3bde07ef41647aa8a07959aa1223a965f
    hash_after: dde8a2e3bde07ef41647aa8a07959aa1223a965f
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
---

# Ask

The foundation of phase 11 of [[spec/design_input/the-migration-runs-in-slices#the-phases]]: a Go verb registry in quack, so each verb's Go implementation registers itself in its own file.

Done when `programOf` hands only an unregistered verb to node, and adding a verb touches no shared line.

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

- [[spec/tickets/quack-registers-each-verb]], standard
- [[spec/tickets/twin-reads-inside-an-action]], minted by the gate
- [[spec/tickets/port-diff-stays-one-file]], minted by the gate

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each child is one change of a few files, reviewed whole
- the registry, the node module road and the shared-file test add up to the goal
- the two gate children stand on the first child alone, and each closed after it

# children

# accept

<!-- reads the diff since its last verdict against the goal and every prose criterion, and names what falls short as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept. The registry stands in registry.go, each twin registers from an init beside its function, and twinVerbs leaves verbs.go. The road and the node module both read the registry, so node meets only a verb no file registers. TestVerbRegistry covers the registered road, the unregistered road, the node module, a double registration, and the shared files. The live test shows the twin read settling beside the action calling it. The check stands green on the commit. A port keys its verb by three words at most, as twinWordsAt sets, which every verb in the ten groups fits.

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

true

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
