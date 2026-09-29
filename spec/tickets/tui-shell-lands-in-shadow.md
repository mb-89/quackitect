---
kind: [[ticket]]
state: open
step: retro/notes
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
    hand: box d85514b1a910b · claude-code-remote
    hash_before: 29658dea603ac6cbf84d805c464b7e6e53cb920a
    hash_after: 2e4f4a34bcc6100feaddd5374a1d401896b38c16
  - step: sync
    hand: box d856db450bd7 · claude-code-remote
    hash_before: 2e4f4a34bcc6100feaddd5374a1d401896b38c16
    hash_after: 76a7b2d37fb90c3677c90d5862c04a6c60ef7e3e
  - step: sync
    hand: box d857a59424d7 · claude-code-remote
    hash_before: 76a7b2d37fb90c3677c90d5862c04a6c60ef7e3e
  - step: sync
    hand: box d857a59424d7 · claude-code-remote
    hash_before: 4735c402648b4b31432d3b81662952c5b09079f3
    hash_after: 4735c402648b4b31432d3b81662952c5b09079f3
    answered:
      - name: sync
        exit: 0
        said: work/tui-shell-lands-in-shadow already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box d857a59424d7 · claude-code-remote
    hash_before: 830a58b65484cbd9dc440335ed67f3345117d2d2
    hash_after: 1daa1991e2631bbcc467a0f19cb81a63d2868cbc
    inputs:
      - name: ask
        hash: 8bd6c6dca29679f2
        size: 576
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: e122785976621597
        size: 10947
    def: cb8f90bc86fc7d39
  - step: children
    hand: the engine
    hash_before: d8cc82510dcf859ec3e3f3a5a6a01a56836a41a2
    hash_after: d8cc82510dcf859ec3e3f3a5a6a01a56836a41a2
  - step: accept
    hand: box d857a59424d7 · claude-code-remote
    hash_before: 33409f835457bfdf903d00c30eec0b0903d58f42
    hash_after: 33409f835457bfdf903d00c30eec0b0903d58f42
    answered:
      - name: sync/sync
        exit: 0
        said: work/tui-shell-lands-in-shadow already carries every commit on main.
    inputs:
      - name: ask
        hash: 8bd6c6dca29679f2
        size: 576
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: e122785976621597
        size: 10947
    def: 07c43ae7253713ec
depends_on: ["quack-verbs-land-in-shadow", "read-topics-land-in-shadow"]
enabled_by: migration.phase6shadow
cloud: true
---

# Ask

Phase 6 of [[spec/design_input/the-migration-runs-in-slices#the-phases]], in shadow: the window. The generic shell, the work view reading names and calling actions, the log as a declared view, and the `index` and `cli` tabs. The old path keeps answering, and every mismatch writes a `shadow` row to the session log. The shadow adds the key `migration/config/slices/window`, which the `migration` module declares as a shared key in the default file.

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

- [[spec/tickets/the-log-becomes-a-view]] standard, closed
- [[spec/tickets/log-draft-test-path-wrong]] trivial, closed
- [[spec/tickets/log-view-draw-case-missing]] trivial, closed
- [[spec/tickets/renderers-stand-inside-ioonly]] standard, the change stands pushed

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every child is small enough to review whole
- the children add up to the goal: the window in shadow, the log view, and the renderers held to their doors
- no child waits on another

# children

# accept

<!-- reads the diff since its last verdict against the goal and every prose criterion, and names what falls short as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

pass
The log view stands as a declared view over log/rows with a draw case, the work view and the index and cli tabs stand in shadow, the window key stands in the default file, and the renderers hold to their door files under the import rule. The check answers green on the pushed commit.

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
