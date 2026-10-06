---
kind: [[ticket]]
state: draft
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
    hand: box 37997ca97a74 · claude-code-remote
    hash_before: c45381bc7f70f32791cfb8fe65ff069b2f8a41b6
---

# Ask

<!-- goal, as text: what these tickets add up to, for the hand that takes them -->
The owner never again has the discussion about tests and code. Each rule below stands in the guidance an agent reads before it writes code or a test, `spec/guidance/code/code.md` and `spec/guidance/code/testing.md`. Each has a machine check behind it, since a rule only in guidance goes unfollowed. The retro's audit checklist, in `spec/processes/retro.yaml` and `spec/guidance/retro/audit.md`, carries each rule, so every retro audits it.

1. Code is pure by default. Impure code (files, processes, network, clock, randomness, git, the index) lives only in declared IO modules, the doors. Impure code anywhere else carries a marker with its reason, and the check refuses an unmarked one. The doors-declare-what-they-own group turns its walk-around guard from report to refuse; this group builds on its declarations and adds only what it lacks.
2. A test drives behavior through interfaces, never implementation details: a verb by its output, a door by its contract, a module through its ports. A Go test lives in a black-box `package <name>_test`, and an analyzer under `src/imports` refuses an in-package test that carries no marker with its reason.
3. Each door is tested once against the real thing, and everything else runs on the door's fake. No real git repo, process or index runs outside that door's one test.
4. Fixtures live in one home: per package a `TestMain` in `main_test.go` for setup once, and shared builders in `src/q/qtest` memoized with `sync.Once`, read-only to tests. An analyzer refuses fixture building (temp dirs, git repos, a process or an index start) inside a Test function outside that home.
5. No timer and no sleep in code or tests. Code waits on events, and reads time only through the clock door.
6. Test code stays at or under the code it tests: about one line of test per line of code, never more, per language and per module. The check measures the ratio and refuses a change that pushes a module past one to one. Cut duplicated, implementation-detail and scaffolding tests (migration twins, golden copies, tests of deleted code) to get under it.
7. No hand scripts. A script a hand writes (`.se/scripts`, a python heredoc, a shell loop) becomes a verb or an engine function. The retro's classify step promotes every such script, and the check refuses a tracked script outside the engine.

Each analyzer or measure lands in report mode first, listing offenders, then the tree migrates and the check switches to refuse. The battery's slowest Go packages migrate first: `src/branches`, `src/quack`, `src/imports`, `src/index`. The tests-meet-the-doors-once group moves git, process and index tests onto fakes, and the javascript-leaves group deletes JS tests with the JS it ports; this group leaves what they move to them, and reads origin/main and their branches before each slice. The group's retro carries `./RUNME.sh check` time before and after.

# sync

<!-- takes trunk into the branch, so the box works on the latest -->

## sync

<!-- branch sync, so the branch carries trunk -->

<!-- the form is command -->

# split

<!-- reads the standing children, and mints more where the goal needs them, each naming this group -->

## children

<!-- every child as a link, one a line, with its process -->

<!-- the form is list -->

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

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
