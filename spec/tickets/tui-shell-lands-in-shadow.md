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
    hash_after: 4e42527a30cc262005248445fb35e7eb4a52abca
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
  - step: retro/notes
    hand: box d857a59424d7 · claude-code-remote
    hash_before: a297e0d91db845cdec80ece347e9ab57cc1b87e6
    hash_after: a297e0d91db845cdec80ece347e9ab57cc1b87e6
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
  - step: retro/write
    hand: box d857a59424d7 · claude-code-remote
    hash_before: 9977f126be4d2f8fa617f18b17afdc4be7cd27bb
    hash_after: 9977f126be4d2f8fa617f18b17afdc4be7cd27bb
    inputs:
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: retro/notes
        hash: 310d2ddd3fe31ac9
        size: 36
    def: 1246a42e29e7ae98
  - step: retro/cloud
    hand: box d857a59424d7 · claude-code-remote
    hash_before: 4ba8e1a09e444a4065d589213436083f4d25e734
    hash_after: 4ba8e1a09e444a4065d589213436083f4d25e734
    inputs:
      - name: retro/write
        hash: 76428fd724a7568c
        size: 2046
    def: 4da1ca5da87d5bbc
depends_on: ["quack-verbs-land-in-shadow", "read-topics-land-in-shadow"]
enabled_by: migration.phase6shadow
reason: done
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

./RUNME.sh retro notes

## write

<!-- writes the retro over the box's own window -->

### done

<!-- what was done, one line a ticket or a thing -->
<!-- the form is list -->

- Took the stale hold by its bare name, and merged main, keeping both the window and lsp keys in the config, the schema and the migration module
- Refreshed the size golden after the merge grew the schema
- Closed the-log-becomes-a-view with a draw case over fake rows and a ViewOver for the log
- Closed log-draft-test-path-wrong with the corrected path in the parent Discussion
- Closed renderers-stand-inside-ioonly: the analyzer holds every renderer to its door files, and two net/http reaches moved into doors

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

- The check named each fault plainly, so each fix was one step
- The parent held the gate points as tickets, so each stood as a small leaf

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->
<!-- the form is list -->

- 18:37 the push refused on a red check because the merge grew the schema past the size golden, and the golden refreshed only after a full check run
- 18:39 to 18:43 the pull held on a stale plan entry, because the plan call took done and working under other names, until the parameters were read in the source
- 18:47 the commit refused for a missing test beside changed code, and the layout table refused an import the new view added, one check run apart
- branch take with the full work/ name doubled the prefix and took nothing

### improve

<!-- how each bad line stops happening, named by its home -->
<!-- the form is list -->

- The work skill should say branch take takes the bare group name, and its home is .claude/skills/work/SKILL.md
- The plan tool description should name the done parameter, and its home is the tool schema

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The stale hold cost nothing once the merge was clean. The renderer rule reads files, since a door and its logic share one package, and that shaped the analyzer more than the ask said.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every fact stands once: the import row stands in the tui chapter and the layout test reads it
- every number carries a name: the status bound became a constant in the registry
- every header says what its file is for and counts nothing
- the chapter carries no owner prompt, and the errors of the run stand with their times
- the chapter says the role and carries no name, address or path

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->
<!-- the form is list -->

- No tool lacked: the box ran every verb and test it needed

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->
<!-- the form is list -->

- Start: a merge conflict at sync in the config, the schema and the migration module, resolved by keeping both keys
- The check red on the size golden after the merge, refreshed by the twins test flag
- The queue holding the pull while the plan named the ticket in hand

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->
<!-- the form is list -->

- No person step parked and no ticket minted outside the group
- The handover says the group stands at done, and the merge coordinator flips the window switch key

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
