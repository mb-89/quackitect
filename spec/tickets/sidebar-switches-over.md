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
    hand: box d88dc33717d8 · claude-code-remote
    hash_before: 29658dea603ac6cbf84d805c464b7e6e53cb920a
    hash_after: 538cd707aca865e30480059942cab5eb1f16e6be
  - step: sync
    hand: box d88ef4f8a2d6 · claude-code-remote
    hash_before: 538cd707aca865e30480059942cab5eb1f16e6be
    hash_after: 759f51c9a38a81157b24dbfc7c4654e76e0e0316
  - step: sync
    hand: box d8901b0331d5 · claude-code-remote
    hash_before: 759f51c9a38a81157b24dbfc7c4654e76e0e0316
    hash_after: 5923a0dffb980a7c64b96eec7ff43e42ed2b32f3
  - step: sync
    hand: box d891eb0f26d7 · claude-code-remote
    hash_before: 5923a0dffb980a7c64b96eec7ff43e42ed2b32f3
  - step: sync
    hand: box d891eb0f26d7 · claude-code-remote
    hash_before: 1189d06612f9a97692256170a1ee0ba5e31fde45
    hash_after: 0bc461d040fccec540a8d9c7776bfebd9590f5a4
    answered:
      - name: sync
        exit: 0
        said: work/sidebar-switches-over already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box d891eb0f26d7 · claude-code-remote
    hash_before: 083efb941ab7e61b72017402fbf268ef331b875a
    hash_after: 083efb941ab7e61b72017402fbf268ef331b875a
    inputs:
      - name: ask
        hash: 682752d3b4cefff7
        size: 344
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: e122785976621597
        size: 10947
    def: cb8f90bc86fc7d39
  - step: children
    hand: the engine
    hash_before: d56c5138a3baa77295df8a10a30c9b9d3e1170ce
    hash_after: d56c5138a3baa77295df8a10a30c9b9d3e1170ce
  - step: accept
    hand: box d891eb0f26d7 · claude-code-remote
    hash_before: bc725197d3f2ab641ead687620f5bc44aa7dfd46
    hash_after: bc725197d3f2ab641ead687620f5bc44aa7dfd46
    answered:
      - name: sync/sync
        exit: 0
        said: work/sidebar-switches-over already carries every commit on main.
    inputs:
      - name: ask
        hash: 682752d3b4cefff7
        size: 344
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: e122785976621597
        size: 10947
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box d891eb0f26d7 · claude-code-remote
    hash_before: 79d275f727a7ae0d9bb3bca9a93c9dbd8cf61e14
    hash_after: cf684ad6f6cca1137fa891798f48a0086d87d331
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
  - step: retro/write
    hand: box d891eb0f26d7 · claude-code-remote
    hash_before: 86b49dea88c17a3a198a6c5269d368b21ba4ee33
    hash_after: 86b49dea88c17a3a198a6c5269d368b21ba4ee33
    inputs:
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: retro/notes
        hash: 310d2ddd3fe31ac9
        size: 36
    def: 1246a42e29e7ae98
depends_on: ["sidebar-lands-in-shadow", "tui-shell-switches-over"]
enabled_by: migration.phase8switch
cloud: true
---

# Ask

Phase 8 of [[spec/design_input/the-migration-runs-in-slices#the-phases]], switched over. The slice's key under `migration/config/slices/` moves to `new`, and the old path leaves the tree. The group waits for `migration.phase8switch` to read true in the tracked config on `main`.

Done when the extension spawns no verb and reads no file itself.

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

- [[spec/tickets/config-answers-keys-and-overrides]] standard
- [[spec/tickets/config-draft-names-keys-test]] trivial
- [[spec/tickets/config-keys-built-in-layer]] trivial
- [[spec/tickets/config-keys-one-resolver]] trivial
- [[spec/tickets/config-override-takes-dotted-key]] trivial
- [[spec/tickets/config-root-lands-store-case]] trivial
- [[spec/tickets/config-set-spells-node-run]] trivial
- [[spec/tickets/the-sidebar-reads-v1]] standard
- [[spec/tickets/the-sidebar-writes-through-actions]] standard
- [[spec/tickets/the-lens-calls-actions]] standard
- [[spec/tickets/the-lens-reads-v1]] standard
- [[spec/tickets/the-extension-reads-no-files]] standard

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each child reaches one module or one side of the extension, so a reader takes its diff whole
- the reads, the writes, the lens and the switch add up to the goal, and every child stands closed
- the-extension-reads-no-files names the five it waits on under depends_on

# children

# accept

<!-- reads the diff since its last verdict against the goal and every prose criterion, and names what falls short as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept
- git grep for spawn( over src/extension meets respawn( in editor-process.js alone, which go-cage-switches-over owns
- a new window posts config/opened, and the local file stands whole, as sidebar-writes.test.js holds
- the sidebar slice reads new, and the shadow compare leaves with its mode
- three reads stay at start: the schema guard, the show-panel flag and the index port. Each runs before the index answers
- the check exits 0 on the branch

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

- the-extension-reads-no-files: change and tests-green. The sidebar slice reads new, and the shadow compare leaves
- the grid's work button drops its count, and the views section alone draws the badge
- patch-journals-a-refused-write: a hand-back skips a journal marked unlanded
- the group: sync, split, accept and the notes

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

- the gate's rows named the red cases, so the change went green on the first build
- the generators wrote the schema and the size golden, so no generated file took a hand edit
- the note parked the journal fault at once, so the retro fixed it in place

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->
<!-- the form is list -->

- 16:13 branch take with the work/ prefix answered no free todo, and the bare group name took it
- 16:15 the server behind the plan tool stood down twice, so the plan answered nothing
- 16:18 the draft's callers list missed three tests reading the grid's count
- 16:24 the check failed on the size golden, which holds the schema's line count
- 16:28 a patch to a path outside the tree left a journal, and the hand-back refused
- 16:35 the hand-back ran the check red once, and it passed alone and on retry
- 16:21 the pass commits staged the journaled files alone, so the deletions waited for the commit verb
- 16:44 a commit trailer carried a model name the owner's rules forbid, and it stands pushed
- no owner prompt came during the run

### improve

<!-- how each bad line stops happening, named by its home -->
<!-- the form is list -->

- the branch take verb reads a name with the work/ prefix as the bare name
- the serve verb keeps its server up across a session, and the plan tool starts it where none answers
- a draft's callers list greps the tests for the rendered markup it changes
- a switch draft names the size golden where it changes a generated file's length
- pull-landed.js skips an unlanded journal, and it does so now
- the command evidence keeps the failing case beside the last line, so a red check names its cause
- a deletion goes through a verb that journals it, so the pass commit carries it
- the commit verb refuses a trailer naming a model, where the owner's rules forbid one

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The run weighed the draft's line on the pull button. Dropping its help and icon leaves a bare button the grid still draws. The work-buttons contract also holds that every work button wears a mark. So the button keeps both. At accept, the run weighed the three reads left in the extension. Each runs before the index answers, so none can move there.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- one place: the badge stands in index/names, and draws.json no longer copies it
- numbers: the change adds none
- headers: the change writes no new file
- the chapter carries the run's errors with their times, and no owner prompt came
- the chapter names roles, and carries no name or path of the box

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
