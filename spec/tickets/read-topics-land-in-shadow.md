---
kind: [[ticket]]
state: open
step: accept
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
    hand: box d81edba2a3d5 · claude-code-remote
    hash_before: 29658dea603ac6cbf84d805c464b7e6e53cb920a
    hash_after: e99769296735d5f353089c188891f11836d7eec9
  - step: sync
    hand: box d84d03dd63d7 · claude-code-remote
    hash_before: e99769296735d5f353089c188891f11836d7eec9
  - step: sync
    hand: box d84d03dd63d7 · claude-code-remote
    hash_before: 1934b628fe319c78c2b5d2bd46649bd828e0985e
    hash_after: b9b802480087f0505de3206d483eadcdf79bbd49
    answered:
      - name: sync
        exit: 0
        said: work/read-topics-land-in-shadow already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box d84d03dd63d7 · claude-code-remote
    hash_before: 96b2ff14ca822eaf552c423563f3a54c2a121037
    hash_after: 96b2ff14ca822eaf552c423563f3a54c2a121037
    inputs:
      - name: ask
        hash: 7b2f4813dd22d30b
        size: 598
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: e122785976621597
        size: 10947
    def: cb8f90bc86fc7d39
  - step: children
    hand: the engine
    hash_before: 14062036097c66f4d5b78d1fe5b21141f8cf6e29
    hash_after: 14062036097c66f4d5b78d1fe5b21141f8cf6e29
  - step: accept
    hand: box d84d03dd63d7 · claude-code-remote
    hash_before: b7324d6b2613a6ff09a7eb89848da7285d19253d
    hash_after: b7324d6b2613a6ff09a7eb89848da7285d19253d
    answered:
      - name: sync/sync
        exit: 0
        said: work/read-topics-land-in-shadow already carries every commit on main.
    inputs:
      - name: ask
        hash: 7b2f4813dd22d30b
        size: 598
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: e122785976621597
        size: 10947
    def: 07c43ae7253713ec
depends_on: ["open-tasks-shadow-lands"]
enabled_by: migration.phase3shadow
cloud: true
---

# Ask

Phase 3 of [[spec/design_input/the-migration-runs-in-slices#the-phases]], in shadow: the read-only topics. Every `<instance>/config/` subtopic, `log/`, `guidance/` and the `check/` names, and the prose checks in Go, each with its own key. The old path keeps answering, and every mismatch writes a `shadow` row to the session log. The shadow adds each topic's key under `migration/config/slices/`, which the `migration` module declares as shared keys in the default file.

Done when the new path runs in shadow on `main`, and `./RUNME.sh log --kind shadow` names each mismatch for the owner to read.

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

- [[spec/tickets/cfg-topic-holds-one-resolver]], standard
- [[spec/tickets/check-names-meet-their-goldens]], standard
- [[spec/tickets/prose-checks-run-in-go]], standard
- [[spec/tickets/the-guidance-topic-lands]], standard
- [[spec/tickets/the-log-topic-lands]], standard
- [[spec/tickets/check-module-joins-the-wiring]], trivial
- [[spec/tickets/twin-goldens-walk-every-twin]], trivial
- [[spec/tickets/twin-golden-flag-name-agrees]], trivial
- [[spec/tickets/lsp-past-veto-reads-go]], trivial
- [[spec/tickets/prose-shadow-hooks-reads-text]], trivial
- [[spec/tickets/prose-shadow-wiring-gets-tests]], trivial
- [[spec/tickets/guidance-draft-matches-tests-red]], trivial
- [[spec/tickets/guidance-shadow-wiring-tested]], trivial
- [[spec/tickets/guidance-module-cases-cover-edges]], trivial
- [[spec/tickets/log-shadow-reads-unfiltered-rows]], trivial
- [[spec/tickets/log-shadow-wiring-gets-tests]], trivial

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

Each child holds one topic or one gate point, small enough to review whole.
The children add up to the goal: config, log, guidance, the check names and the prose checks each run in shadow under their own slice key, which spec/config/level0.json sets to shadow, and nothing of the goal stands outside them.
Each fix ticket names its parent, and the topics wait on none of each other.

# children

# accept

<!-- reads the diff since its last verdict against the goal and every prose criterion, and names what falls short as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- config-shadow-catches-its-faults: src/scripts/config-shadow.js runs proc.run with no try and no timeout, and the proc door throws where the binary stands but fails to run, so ./RUNME.sh config prints its rows and then dies on a stack trace; catch the fault as the log, guidance and prose shadows do, and pass a timeout
- prose-shadow-spawns-off-thread: readsProse in src/bridge/prose.js fires the shadow unawaited, but its spawn runs sync on the bridge server, so every read carrying a Vale finding waits on quack prose; start the process through proc.start, and move quackAt inside the try
- unused-shadow-package-leaves: nothing imports src/shadow since main dropped src/tui/work/shadow.go, since every shadow writes through the log door; take the package out

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
