---
kind: [[ticket]]
state: open
step: retro/cloud
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
    hand: box d856f55387d6 · claude-code-remote
    hash_before: 29658dea603ac6cbf84d805c464b7e6e53cb920a
    hash_after: 0775c9d0263bd9a490ee4a977fd8268c128e59b6
  - step: sync
    hand: box d857a59f27d6 · claude-code-remote
    hash_before: 0775c9d0263bd9a490ee4a977fd8268c128e59b6
    hash_after: 44d6fc076e9a256554192e329f1dfec8377e177d
  - step: sync
    hand: box d857c176ced7 · claude-code-remote
    hash_before: 44d6fc076e9a256554192e329f1dfec8377e177d
  - step: sync
    hand: box d857c176ced7 · claude-code-remote
    hash_before: 48e1294af73914448d0fb73bb4149e7679420e03
    hash_after: 5149e7697e0a24d898f39f419f7a24914100127b
    answered:
      - name: sync
        exit: 0
        said: work/read-topics-switch-over already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box d857c176ced7 · claude-code-remote
    hash_before: cd93579b85142499c5f765070b0aad17cbae5db9
    hash_after: cd93579b85142499c5f765070b0aad17cbae5db9
    inputs:
      - name: ask
        hash: bf36b714071714b6
        size: 330
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: e122785976621597
        size: 10947
    def: cb8f90bc86fc7d39
  - step: children
    hand: the engine
    hash_before: b7ef17b730c092d9e2644216a86a452083839f6b
    hash_after: b7ef17b730c092d9e2644216a86a452083839f6b
  - step: accept
    hand: box d857c176ced7 · claude-code-remote
    hash_before: 18ffcbfca6748e880d735759904cd1dafbc56ced
    hash_after: bc3378e88579704cbcc2c9d4e0d28a3a11c88686
    answered:
      - name: sync/sync
        exit: 0
        said: work/read-topics-switch-over already carries every commit on main.
    inputs:
      - name: ask
        hash: bf36b714071714b6
        size: 330
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: e122785976621597
        size: 10947
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box d857c176ced7 · claude-code-remote
    hash_before: dfbce56bb6f6d25c555c75728d3235e80f03046a
    hash_after: dfbce56bb6f6d25c555c75728d3235e80f03046a
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
  - step: retro/write
    hand: box d857c176ced7 · claude-code-remote
    hash_before: 6cfc8cfc78b18c1c7585aa694728c7d082d86af1
    hash_after: 6cfc8cfc78b18c1c7585aa694728c7d082d86af1
    inputs:
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: retro/notes
        hash: 310d2ddd3fe31ac9
        size: 36
    def: 1246a42e29e7ae98
depends_on: ["read-topics-land-in-shadow"]
enabled_by: migration.phase3switch
cloud: true
---

# Ask

Phase 3 of [[spec/design_input/the-migration-runs-in-slices#the-phases]], switched over. The slice's key under `migration/config/slices/` moves to `new`, and the old path leaves the tree. The group waits for `migration.phase3switch` to read true in the tracked config on `main`.

Done when no JavaScript twin of a Go check stands.

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

- [[spec/tickets/readers-take-the-go-topics]], standard
- [[spec/tickets/the-js-twins-leave]], standard
- [[spec/tickets/readers-name-one-mode-source]], trivial
- [[spec/tickets/handed-meets-its-own-case]], trivial
- [[spec/tickets/read-text-meets-its-case]], trivial
- [[spec/tickets/read-config-meets-its-case]], trivial
- [[spec/tickets/check-twins-leave-phase-seven]], trivial
- [[spec/tickets/topic-fallback-leaves-the-readers]], trivial
- [[spec/tickets/twins-leave-misses-some-callers]], trivial

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every child is small enough to review whole: each trivial child touches a handful of files
- the children add up to the goal: the readers take the Go topics, and the comparison twins leave; the check twins leave with phase 7
- the-js-twins-leave names readers-take-the-go-topics under depends_on, and the gate's children hang off their parent

# children

# accept

<!-- reads the diff since its last verdict against the goal and every prose criterion, and names what falls short as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept. A helper read the diff since the last verdict and named three gaps. The log verb's doors and the lint's doors carried no slices, so both readers stayed on the old path, and no case held the real door builders. The gate fixed all three in its own diff: both builders now hand the slices and the method root, and a case holds each. Weighed: the done line reads over the Go topics, and the check twins leave with phase 7, as the group's Discussion says. The twins are gone, nothing imports one, and every reader on a new slice takes its topic or faults. The check answers green.

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

- check-twins-leave-phase-seven: the group's Discussion narrows the done line to the Go topics, and the phase 7 switch carries the check twins
- topic-fallback-leaves-the-readers: a reader on a new slice takes its topic or faults, and the config rows read the values quack prints
- twins-leave-misses-some-callers: the gate's callers change, and the twins' wiring leaves
- the-js-twins-leave: the four comparison twins and their seven test files leave, and the five keys take new alone
- the accept gate: the log verb's and the lint's doors carry the slices

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

- A fault stood out once the fallback left: the config topic's values read twice, hidden behind the old path
- A helper read the diff at the gate and found two door builders with no slices, which no case covered

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->
<!-- the form is list -->

- 18:52 UTC: the take found the hold fresh, so the box waited until the hold went stale
- 19:13 UTC: every note write threw, since the topic helper read a join the write door's box never carries
- 19:28 UTC: the commit verb refused a staged deletion, since the tree read a path git tracks and the disk no longer holds
- 19:40 UTC: the ticket pass staged the modified files alone, and left the deletions and the projection loose
- the server fell away after each check, and the level-zero tools answered nothing until a restart

### improve

<!-- how each bad line stops happening, named by its home -->
<!-- the form is list -->

- the topic helper takes the join of node:path where the doors carry none, and a case holds it
- the tree's paths leave out a file the disk no longer holds, and a case holds it
- a ticket pass stages deletions as the commit verb does: a finding for the engine, which owns the pass
- the old-path readers leave with the last caller of each, in the phases that own those callers

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The last box stopped on Vale findings in prose it never pushed, so this box wrote that step fresh. Once the check ran, the one finding at error was a header that counted keys. The deeper stop was the write door itself: it threw on every note write, so each Discussion line failed until the topic helper found its join. The remaining findings sit at warning, and the hand-backs land over them.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every fact stands in one place: each line points at the ticket owning it
- the change adds no number
- every header the change writes says what its file is for: the contract test's header counts nothing now
- the chapter carries the run's errors with their times, and the owner sent no prompt during the run
- the chapter names roles alone, with no name, address or box path; the scripts under the private scripts folder hold the hand-back fields alone

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

The done line reads over the Go topics: the config, log, guidance and prose comparison twins leave here. The JavaScript twins of the Go checks leave with phase 7, since every check name answers an empty list until then. [[spec/tickets/check-twins-leave-phase-seven]]
