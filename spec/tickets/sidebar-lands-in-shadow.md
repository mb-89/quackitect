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
    hand: box d85821f54410d · claude-code-remote
    hash_before: 29658dea603ac6cbf84d805c464b7e6e53cb920a
    hash_after: 660822557b19c369af7f3dc6fe36f94bca4223fa
  - step: sync
    hand: box d85821f54410d · claude-code-remote
    hash_before: 697f0a11125c5aa45d90e1645e62c77d904193b8
    hash_after: 12f665821e6fe91eb12db9d5a31d1cb53c5cbcde
    answered:
      - name: sync
        exit: 0
        said: work/sidebar-lands-in-shadow already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box d85821f54410d · claude-code-remote
    hash_before: 62b80a66051601a6b37eb2794f69850befa55bca
    hash_after: 91e91057da4140b45d6445cbe84c2a0f283f3493
    inputs:
      - name: ask
        hash: 44916162433af90b
        size: 559
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: e122785976621597
        size: 10947
    def: cb8f90bc86fc7d39
  - step: children
    hand: the engine
    hash_before: 2871560716d4faea8f3d7ee4617388a4fa93b729
    hash_after: 2871560716d4faea8f3d7ee4617388a4fa93b729
  - step: accept
    hand: box d85821f54410d · claude-code-remote
    hash_before: 768186c291b2ff11573e0d1d718de6664b772d07
    hash_after: 768186c291b2ff11573e0d1d718de6664b772d07
    answered:
      - name: sync/sync
        exit: 0
        said: work/sidebar-lands-in-shadow already carries every commit on main.
    inputs:
      - name: ask
        hash: 44916162433af90b
        size: 559
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: e122785976621597
        size: 10947
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box d85821f54410d · claude-code-remote
    hash_before: 288cba972bd1884729d12e7c8bbabf26683c750a
    hash_after: 288cba972bd1884729d12e7c8bbabf26683c750a
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
  - step: retro/write
    hand: box d85821f54410d · claude-code-remote
    hash_before: d9c416ee44b57d40ac51ac99decf0413d4e969d6
    hash_after: d9c416ee44b57d40ac51ac99decf0413d4e969d6
    inputs:
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: retro/notes
        hash: 310d2ddd3fe31ac9
        size: 36
    def: 1246a42e29e7ae98
  - step: retro/cloud
    hand: box d85821f54410d · claude-code-remote
    hash_before: 6be53dbf19b303672237e310b1bdc19d5645bd35
    hash_after: 6be53dbf19b303672237e310b1bdc19d5645bd35
    inputs:
      - name: retro/write
        hash: 438552e973c9dc44
        size: 2159
    def: 4da1ca5da87d5bbc
depends_on: ["tui-shell-lands-in-shadow"]
enabled_by: migration.phase8shadow
reason: done
---

# Ask

Phase 8 of [[spec/design_input/the-migration-runs-in-slices#the-phases]], in shadow: the extension. A generic sidebar and form renderer, and `spec/config/level0.schema.json` generated from the declarations. The old path keeps answering, and every mismatch writes a `shadow` row to the session log. The shadow adds the key `migration/config/slices/sidebar`, which the `migration` module declares as a shared key in the default file.

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

- [[spec/tickets/the-config-schema-gets-generated]], standard
- [[spec/tickets/the-sidebar-renders-generically]], standard
- [[spec/tickets/view-actions-run-through-verbs]], standard
- [[spec/tickets/the-sidebar-shadow-compares]], standard

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each child reviews whole: the schema, the renderer, the actions, then the compare
- the four add up to the goal: a generated schema, a generic sidebar, and its shadow with the slice key
- the compare reads what the renderer draws, and the renderer stands closed, so no child waits on an open one

# children

# accept

<!-- reads the diff since its last verdict against the goal and every prose criterion, and names what falls short as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept
- the sidebar draws the views section off the catalog, and the four view actions run through the verbs
- the migration module declares the slice sidebar, built-in old, and the tracked default file now sets it to shadow beside window, so the shadow runs on main
- under shadow each badge or button the two paths draw apart writes one shadow row naming the slice sidebar, so ./RUNME.sh log --kind shadow names it
- the key reads migration/config/sidebar beside its siblings, where the ask names migration/config/slices/sidebar, and the child draft names the call
- the check answers 0 on the tree

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

- the-sidebar-shadow-compares: the slice sidebar, the compare apartOf, and one shadow row a pair apart, gated by a second hand
- the tracked default file sets the sidebar slice to shadow, found at the group's accept
- the size golden takes the schema's new line count

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

- the red tests from the design phase named the compare's arguments, so the build followed them and passed on its first run
- the handover named the twin golden fix, so the red check cleared in one step

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->
<!-- the form is list -->

- 22:03 a shell call naming no ticket in its description came back refused
- 22:08 the gate helper's commit came back refused, because this hand's uncommitted build stood in the same tree and migration.go carried no changed test
- 22:12 the change step's commit came back refused on the same rule, until a case for the sidebar key stood beside it
- 22:14 the check stood red on TestTwinGoldens, because the schema's line count moved
- 22:15 a test run piped through tail and joined to a landing came back refused
- 22:18 the accept found the tracked default file missing the sidebar mode, so the shadow never ran on main
- no owner prompt turned the run

### improve

<!-- how each bad line stops happening, named by its home -->
<!-- the form is list -->

- the spawn prompt the pull prints for a gate: tell the spawning hand to keep its tree clean until the gate lands, since the gate commits the whole tree
- the draft checklist of the standard process: name the tracked default file, the projections and the goldens a new config key moves, so the size list carries them
- the migration phase design input: name the line in spec/config/level0.json that sets a slice to shadow as part of every shadow phase

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The build ran ahead of the gate while the helper read it, which saved time but blocked the gate's commit. A clean tree while a helper lands a step costs less than taking the build off and replaying it.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each fact stands once: the slice in migration.go, the compare in views-shadow.js
- the change adds no number
- the new header says what views-shadow.js is for, and counts nothing
- the badly list carries each error with its time, and no owner prompt turned the run
- the chapter names roles alone

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->
<!-- the form is list -->

- nothing: every tool, host and install the run asked for stood ready

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->
<!-- the form is list -->

- the commit hook refused a code change with no changed test beside it, twice
- the landing guard refused a test run piped through tail and joined to a landing
- the twin golden stood red on the box after the schema grew

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->
<!-- the form is list -->

- no person step parked, and no ticket minted outside the group
- the handover says the group stands at done, and the branch goes back through branch done

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

The switch-over that retires the widget grid carries one cut. The `pull` entry of `spec/config/draws.json` drops its help and icon, since `work/pull` registers both. Until then the grid draws its pull button off that entry, so both stand.

The owner's word on the sidebar, for the split:

- the plugin opens as a dumb little adapter
- a value it cannot know yet draws as a question mark, the Work count among them
- once the whole engine stands, the sidebar pulls the right values
- the sidebar rebuilds nothing and restarts nothing
- the same holds for every adapter

Today the first draw waits on `./RUNME.sh tui work --count`, which can build the Go viewer before it answers. `counted` in `src/extension/sidebar.js` runs it, and `it.viewer()` in `src/scripts/tui.js` builds.
