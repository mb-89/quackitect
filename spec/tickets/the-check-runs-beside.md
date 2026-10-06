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
  - step: retro/write
    hand: box c46fdbdc0cdf · claude-code-remote
    hash_before: 550d7aea7f4d1c9a7a7a762dfc763f064bc8ee06
    hash_after: 550d7aea7f4d1c9a7a7a762dfc763f064bc8ee06
    inputs:
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: retro/notes
        hash: 310d2ddd3fe31ac9
        size: 36
    def: e7ed0badf886b5b5
  - step: retro/cloud
    hand: box c46fdbdc0cdf · claude-code-remote
    hash_before: 6f20accd2805b189f026a2aee59fdc132e55d4ae
    hash_after: 6f20accd2805b189f026a2aee59fdc132e55d4ae
    inputs:
      - name: retro/write
        hash: 7a86bd9c22aa0d94
        size: 2710
      - name: [[spec/tickets/the-parts-start-at-once]]
        hash: dfee1caff0b0df9a
        size: 1112
      - name: [[spec/tickets/the-budget-reads-the-span]]
        hash: 2a6c87fb96da7541
        size: 483
      - name: [[spec/tickets/index-cases-wait-for-it]]
        hash: 0ac7d2bb2c4c626e
        size: 408
    def: 4da1ca5da87d5bbc
  - step: split
    hand: box c46fdbdc0cdf · claude-code-remote
    hash_before: ece6a6e50c5c99d5c91b9b6a9ba67295c60ce02b
    hash_after: ece6a6e50c5c99d5c91b9b6a9ba67295c60ce02b
    returns: 1
    why: the hand takes it back
  - step: split
    hand: box c46fdbdc0cdf · claude-code-remote
    hash_before: cfbfdc8b6ea806fba616039e70066fed6772382c
    hash_after: cfbfdc8b6ea806fba616039e70066fed6772382c
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
    hash_before: e6a61975f7cf8128f5d51f59101eff0dd329491b
    hash_after: e6a61975f7cf8128f5d51f59101eff0dd329491b
  - step: accept
    hand: box c46fdbdc0cdf · claude-code-remote
    hash_before: 6eefb3972718f054b52670b6a9edd7173474a4f9
    hash_after: 6eefb3972718f054b52670b6a9edd7173474a4f9
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
    hash_before: 94cc5c7924ad015b18e6555c3c912f5fc3e8036e
    hash_after: 94cc5c7924ad015b18e6555c3c912f5fc3e8036e
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
reason: done
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
- [[spec/tickets/vale-retries-its-timeout]], trivial

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each child carries one diff a reviewer reads whole
- the parts start at once, the budget reads the span, and the ready step and the Vale retry keep the parts sound under the load
- the-budget-reads-the-span names the-parts-start-at-once under depends_on
- the later children read the parts the first child starts, so they landed after it
- the group diff stays one review, so it needs no split

# children

# accept

<!-- reads the diff since its last verdict against the goal and every prose criterion, and names what falls short as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept
- the Vale run goes again on its own timeout, with a case for one timeout and a case for every run timing out
- the check stands green on the commit

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

- [[spec/tickets/the-parts-start-at-once]]: every part starts at once, and a red part names itself
- [[spec/tickets/the-budget-reads-the-span]]: battery.budget reads a fifth over a clean check
- [[spec/tickets/index-cases-wait-for-it]]: a ready step stands the binaries and the index door before the parts start
- the branch took main in twice, and the second merge kept the table rule main carries

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

- a helper traced the door going down to a binary swap, with a watcher on the standing file, so the fix met the cause
- the timing table the check prints showed the wall time at the slowest part, so the goal read off one run
- the review in a fresh worktree caught a race the warm tree hid

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->
<!-- the form is list -->

- 19:5x: the queue answered wait, because the group stood at draft while both children stood closed
- 19:5x: the first check after branch sync went red in lint-twins, while the index restarted on a new binary
- 20:07: the review worktree went red in lint-twins and runme-road
- 20:53: a review beside a second full check went red in lint-twins under load
- 21:4x: a lone review went red once in vale-paths, and the next passed
- 21:5x: the accept hand-back ran branch sync, and main conflicted in seven files, the check and the table rule among them
- 22:01: the first check after the merge went red with no case named, and the rerun went green
- no owner prompt turned the run, and the session started on the resume prompt level zero sends after a clear

### improve

<!-- how each bad line stops happening, named by its home -->
<!-- the form is list -->

- a group whose children all close reads open at its own sync, so the queue hands it on: `spec/processes/group.md`
- the ready step closes the restart race: `src/quack/check.go`
- review.go writes the stamp after its builds, and a review takes a worktree path of its own: `src/branches/review.go`
- the budget cases run apart from the parts that load the cores, or read a budget sized for a loaded box: `test/level0/budget.test.js`
- the stamp names the red part where a red carries no case: `src/quack/check.go`

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The worry through the run was whether the review reds came from this group or from load. A lone review settled it twice. Two branches changed the check at once, and the merge cost more than any child. The helper script watch-bin.sh polled the binaries and the standing file, and it stands gone from the box.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the ready step and its reason stand once in spec/design_output/work.md, and the code points there
- calmBy and niceProgram stand named once in checkdoors.go
- the new check_battery_test.go opens on a header saying what it tests
- the badly list carries each error of the run with its time, and no owner prompt turned it
- the chapter names the box by role alone

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->
<!-- the form is list -->

- nothing: every tool stood on the box, and the review worktree fetched vale and biome on its own

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->
<!-- the form is list -->

- 21:5x: a conflict at sync in seven files, since main changed the check and the table rule beside this group
- the write door refused a git rm and a hand edit of the projected yml, so rules.go took the change and the projection wrote the yml
- the MCP pull tool lost its hook once, and RUNME.sh ticket pull carried the hand-back
- the stop hook refused a stop while a helper ran, since the box stops with the turn

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->
<!-- the form is list -->

- no person step parked, and no ticket stands minted with no group
- the handover says the group reaches branch done, then its pull request against main with auto-merge on

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
