---
kind: [[ticket]]
state: open
step: children
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
record:
  - step: sync
    hand: box d2c15bcb53d2 · claude-code-remote
    hash_before: 04fdf6f3074ffe3f7dae3aeeea3a972e5b29ed88
    hash_after: 4ae4d26d19e4133fba12429f3d15767ce53fb36b
  - step: sync
    hand: box 34eba3f85616 · claude-code-remote
    hash_before: 3e92d5bac4bc2165f0d7b54cd8368c7b732cac3f
  - step: sync
    hand: box 34eba3f85616 · claude-code-remote
    hash_before: 12d4c5d6afc7f0a33f7d7ef8273a8204888c025b
    hash_after: 12d4c5d6afc7f0a33f7d7ef8273a8204888c025b
    answered:
      - name: sync
        exit: 0
        said: work/dead-tests-and-code-leave already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box 34eba3f85616 · claude-code-remote
    hash_before: e86f1d4f5ccbff7c139c8b58d3bf9a1bde25da07
    hash_after: e86f1d4f5ccbff7c139c8b58d3bf9a1bde25da07
    inputs:
      - name: ask
        hash: 0c167c1dcc40d01c
        size: 477
    def: 19b6849b1f151cd5
cloud: true
---

# Ask

The test suite tests only code that runs, once each, and the tree holds the rules that keep it so.

The check spends its time on code nothing loads and on comparisons whose migration phase has passed. Two config readers disagree on a value, and the next box writes the same dead tests again.

- every child of the group stands closed
- the retro carries `./RUNME.sh check` time and the Go and JS test and code line counts, measured before and after
- `./RUNME.sh check` exits 0

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

- [[spec/tickets/dead-go-goldens-leave]], trivial
- [[spec/tickets/dead-js-tests-leave]], trivial
- [[spec/tickets/js-take-path-leaves]], trivial
- [[spec/tickets/one-config-reader-decides]], trivial
- [[spec/tickets/branches-fixtures-copy-a-template]], trivial
- [[spec/tickets/restated-tests-merge]], trivial
- [[spec/tickets/tests-guidance-note-lands]], trivial

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each child landed as its own few commits, small enough to review whole
- the children add up to the goal: dead tests and code leave, restated tests merge, one config reader decides, and the rules keep it so
- no child waits on another now, since every child stands closed
- the guidance child read the audit draft and the examples note, and landed last
- the diff stays one group, since the goal is one cut and no child grew past its own review

# children

# accept

<!-- reads the diff since its last verdict against the goal and every prose criterion, and names what falls short as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->

<!-- the form is verdict -->

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
