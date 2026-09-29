---
kind: [[ticket]]
state: closed
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
    hand: box d81edba2a3d5 · claude-code-remote
    hash_before: 29658dea603ac6cbf84d805c464b7e6e53cb920a
    hash_after: e99769296735d5f353089c188891f11836d7eec9
  - step: sync
    hand: box d84d03dd63d7 · claude-code-remote
    hash_before: e99769296735d5f353089c188891f11836d7eec9
    hash_after: 8284daf4b773f14546ee517cabbc7c75459b22ec
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
  - step: accept
    hand: box d84d03dd63d7 · claude-code-remote
    hash_before: 03fea7a04e38646faf56212b755e434cebe8a77e
    hash_after: 7d2b7806b6d57f18426bd945545c0005dc00a2eb
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
  - step: retro/notes
    hand: box d84d03dd63d7 · claude-code-remote
    hash_before: 21c7a0b57cc50d1ad915241161097968030c401d
    hash_after: 21c7a0b57cc50d1ad915241161097968030c401d
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
  - step: retro/write
    hand: box d84d03dd63d7 · claude-code-remote
    hash_before: b5ba2d54357f8c96a30b0c9037254c3ed6ba52bc
    hash_after: b5ba2d54357f8c96a30b0c9037254c3ed6ba52bc
    inputs:
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: retro/notes
        hash: 310d2ddd3fe31ac9
        size: 36
    def: 1246a42e29e7ae98
  - step: retro/cloud
    hand: box d84d03dd63d7 · claude-code-remote
    hash_before: fd57ba77fdf3c606bc98c100f5ac69424dbe1ba4
    hash_after: fd57ba77fdf3c606bc98c100f5ac69424dbe1ba4
    inputs:
      - name: retro/write
        hash: a9748d0bc7b387eb
        size: 2212
    def: 4da1ca5da87d5bbc
depends_on: ["open-tasks-shadow-lands"]
enabled_by: migration.phase3shadow
reason: done
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

- unused-shadow-package-leaves: the shadow package leaves the tree, since nothing imports it
- review-builds-its-front: the branch review builds the branch own se-front into its worktree before the check
- the group passes its second accept, over the removal and the review fix

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

- a search for importers before the deletion proved it safe, so the removal took one commit
- a worktree nested where the review opens its own reproduced the red mint test, and its trace named the missing binary

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->
<!-- the form is list -->

- 03:1x: the plan call found no server at the event address, and a restart brought it back
- 03:2x: the first hand-back named prose in the command fields, and the engine ran it as a command
- 03:2x: the review answered red on the mint contract test twice, while a check in place answered green
- 03:28: a git stash and a shell copy over a source file came back refused, while the agent tried to show the new test red
- 03:31: the push waited, because the new build read the platform past a door
- 03:35: the commit came back refused, because the platform change carried no test
- 03:35: the bridge lost events while the check restarted the server

### improve

<!-- how each bad line stops happening, named by its home -->
<!-- the form is list -->

- the mint output for a command field in the pull verb: print one example command beside the field
- the review design in spec/design_output/review: a table row now names every binary a check needs, so the next install-only binary lands there first
- the agent: read the doors bundle before a platform branch, since it carries windows already
- the agent: show a test red by reading the assert, or through a scratch copy of the test, since stash stands refused

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The review had failed since the front writer moved to Go, and every group since would have met it. A check in place hid it, because the install had built the binary on this box. A fresh worktree is the only place the fault shows.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the source folder of se-front stands in BUILDS alone, and the review reads it there
- the change adds no number
- the change writes no header
- the badly list carries each error of this window with its time, and the owner sent no prompt
- the chapter names roles and tree paths alone, and no box path

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->
<!-- the form is list -->

- 03:1x: the level0 server stood down, and a start by hand brought it back

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->
<!-- the form is list -->

- the branch review answered red on the mint contract test on every run, because its fresh worktree carried no se-front, and review-builds-its-front fixes it
- a hook refused a git stash, a shell write over a source file, and a commit joined to a test with a semicolon

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->
<!-- the form is list -->

- no person step stands parked
- every ticket this window minted stands in this group
- the handover names the pull request into main as the step that waits

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
