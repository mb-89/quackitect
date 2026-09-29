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
depends_on: ["tui-shell-lands-in-shadow"]
enabled_by: migration.phase8shadow
cloud: true
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

The switch-over that retires the widget grid carries one cut. The `pull` entry of `spec/config/draws.json` drops its help and icon, since `work/pull` registers both. Until then the grid draws its pull button off that entry, so both stand.

The owner's word on the sidebar, for the split:

- the plugin opens as a dumb little adapter
- a value it cannot know yet draws as a question mark, the Work count among them
- once the whole engine stands, the sidebar pulls the right values
- the sidebar rebuilds nothing and restarts nothing
- the same holds for every adapter

Today the first draw waits on `./RUNME.sh tui work --count`, which can build the Go viewer before it answers. `counted` in `src/extension/sidebar.js` runs it, and `it.viewer()` in `src/scripts/tui.js` builds.
