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
    hand: box c46fdbdc0cdf · claude-code-remote
    hash_before: b2be4014364b17f1497d96690275297014d59208
  - step: sync
    hand: box c46fdbdc0cdf · claude-code-remote
    hash_before: 6a385c47acc0137fb626f993d2238e8ba2bbc9b4
    hash_after: 6a385c47acc0137fb626f993d2238e8ba2bbc9b4
    answered:
      - name: sync
        exit: 0
        said: work/the-check-runs-beside already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box c46fdbdc0cdf · claude-code-remote
    hash_before: 38024a806da0856b1b6e0113b853d0819326d365
    hash_after: 38024a806da0856b1b6e0113b853d0819326d365
    inputs:
      - name: ask
        hash: 40924ce6fcecee9a
        size: 619
      - name: [[spec/tickets/the-probe-starts-with-tests]]
        hash: 2f27903492d3e8aa
        size: 574
    def: cb8f90bc86fc7d39
  - step: children
    hand: the engine
    hash_before: 20746d6d63235e07eeee15f013a4b0736aa5120a
    hash_after: 20746d6d63235e07eeee15f013a4b0736aa5120a
  - step: accept
    hand: box c46fdbdc0cdf · claude-code-remote
    hash_before: d79c45d87bd1dfaf1155a1e66a3c7114ba8b83cb
    hash_after: d79c45d87bd1dfaf1155a1e66a3c7114ba8b83cb
    answered:
      - name: sync/sync
        exit: 0
        said: work/the-check-runs-beside already carries every commit on main.
    inputs:
      - name: ask
        hash: 40924ce6fcecee9a
        size: 619
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: [[spec/tickets/the-probe-starts-with-tests]]
        hash: 2f27903492d3e8aa
        size: 574
    def: 07c43ae7253713ec
  - step: accept
    hand: box c46fdbdc0cdf · claude-code-remote
    hash_before: 69a3037b7e3d988e27b1cc2114e91887c14d2ec0
    hash_after: c4868df8b9744946f4dd01b56e7bea2587ff154c
    answered:
      - name: sync/sync
        exit: 0
        said: work/the-check-runs-beside already carries every commit on main.
    inputs:
      - name: ask
        hash: 40924ce6fcecee9a
        size: 619
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: [[spec/tickets/the-probe-starts-with-tests]]
        hash: 2f27903492d3e8aa
        size: 574
    def: 07c43ae7253713ec
  - step: split
    hand: box c46fdbdc0cdf · claude-code-remote
    hash_before: 0877db723f2affd6dabbe0ab3482c7591c2ce191
    hash_after: 0877db723f2affd6dabbe0ab3482c7591c2ce191
    inputs:
      - name: ask
        hash: 40924ce6fcecee9a
        size: 619
      - name: [[spec/tickets/the-probe-starts-with-tests]]
        hash: 2f27903492d3e8aa
        size: 574
    def: 19b6849b1f151cd5
  - step: children
    hand: the engine
    hash_before: e3c746a0b800e4fb78532715b008a2d9ff9f0f37
    hash_after: e3c746a0b800e4fb78532715b008a2d9ff9f0f37
  - step: accept
    hand: box c46fdbdc0cdf · claude-code-remote
    hash_before: 2c3f0b766545919a826f7190ba60f932afdb7122
    hash_after: 2c3f0b766545919a826f7190ba60f932afdb7122
    answered:
      - name: sync/sync
        exit: 0
        said: work/the-check-runs-beside already carries every commit on main.
    inputs:
      - name: ask
        hash: 40924ce6fcecee9a
        size: 619
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: [[spec/tickets/the-probe-starts-with-tests]]
        hash: 2f27903492d3e8aa
        size: 574
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box c46fdbdc0cdf · claude-code-remote
    hash_before: a68f8903a8738b56cc644edb9f9fe517d35c54b8
    hash_after: a68f8903a8738b56cc644edb9f9fe517d35c54b8
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
---

# Ask

<!-- goal, as text: what these tickets add up to, for the hand that takes them -->

The check's parts block each other no more: every part starts at once, so the check's wall time is its slowest part. A red part still names itself, and the parts it ran beside still report. A part waits on another only where it reads that part's output, and the design says which and why. A test over fake parts and the clock door's fake proves the overlap, with no real timer. `battery.budget` stays honest after the change. The closed ticket [[spec/tickets/the-probe-starts-with-tests]] asked this, and its criterion falls short today.

- goal: a clean check costs the slowest part's span, with the budget sized to it

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

- [[spec/tickets/the-parts-start-at-once]], standard
- [[spec/tickets/the-budget-reads-the-span]], trivial
- [[spec/tickets/index-cases-wait-for-it]], trivial

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each child carries one diff a reviewer reads whole
- the first child starts the parts at once, the second sizes the budget, and the third adds the ready step, so the goal stands inside the three
- the-budget-reads-the-span names the-parts-start-at-once under depends_on
- the budget reads the span the first child sets, and the ready step reads the parts the first child starts, so they landed in that order
- the group diff stays one review, so it needs no split

# children

# accept

<!-- reads the diff since its last verdict against the goal and every prose criterion, and names what falls short as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept
- the diff since the last verdict carries ticket evidence alone, and the check stands green on the merge

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
