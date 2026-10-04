---
kind: [[ticket]]
state: open
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
group: the-verbs-run-in-go
enabled_by: migration.phase11
cloud: true
depends_on: ["quack-holds-a-verb-registry"]
step: retro/write
record:
  - step: sync
    hand: box 6f8b02d3b81e · claude-code-remote
    hash_before: 9a5042d133c3ce74cfd00d4079804dcfe59d1a21
    hash_after: ff652cfafa02f27e7e7bb88a3f23d1b94cba0d46
  - step: sync
    hand: box 08f4218ba236 · claude-code-remote
    hash_before: ff652cfafa02f27e7e7bb88a3f23d1b94cba0d46
    hash_after: d482e87c3e5dc1fb604795152086d2b4b6f5bad6
  - step: sync
    hand: box 08f4218ba236 · claude-code-remote
    hash_before: 0dd7828eab172efc04e35f5fffb9b7a0f0a9ca6f
    hash_after: 0dd7828eab172efc04e35f5fffb9b7a0f0a9ca6f
    answered:
      - name: sync
        exit: 0
        said: work/retro-verbs-run-in-go already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box 08f4218ba236 · claude-code-remote
    hash_before: 0a8556dd00670a4f4fb3309055a70b35aa6193b4
    hash_after: 0a8556dd00670a4f4fb3309055a70b35aa6193b4
    inputs:
      - name: ask
        hash: b0f8341cbe2d0d9d
        size: 283
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: 3eaee7b8cc71d34a
        size: 11400
    def: cb8f90bc86fc7d39
  - step: children
    hand: the engine
    hash_before: 47f667d2357fe1ad5d465860e5162f1331ede991
    hash_after: 47f667d2357fe1ad5d465860e5162f1331ede991
  - step: accept
    hand: box 08f4218ba236 · claude-code-remote
    hash_before: 54d155f08506cd317d3634a26c5189b8a5713df2
    hash_after: 54d155f08506cd317d3634a26c5189b8a5713df2
    answered:
      - name: sync/sync
        exit: 0
        said: work/retro-verbs-run-in-go already carries every commit on main.
    inputs:
      - name: ask
        hash: b0f8341cbe2d0d9d
        size: 283
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: 3eaee7b8cc71d34a
        size: 11400
    def: 07c43ae7253713ec
  - step: accept
    hand: box f8b693e22e97 · claude-code-remote
    hash_before: d482e87c3e5dc1fb604795152086d2b4b6f5bad6
  - step: accept
    hand: box f8b693e22e97 · claude-code-remote
    hash_before: 1031767f13b9db60de5c1dda4eb2a87dfdcbd80b
    hash_after: 1031767f13b9db60de5c1dda4eb2a87dfdcbd80b
    answered:
      - name: sync/sync
        exit: 0
        said: work/retro-verbs-run-in-go already carries every commit on main.
    inputs:
      - name: ask
        hash: b0f8341cbe2d0d9d
        size: 283
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: 3eaee7b8cc71d34a
        size: 11400
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box f8b693e22e97 · claude-code-remote
    hash_before: d2f8e062dac0776fdef3d29ca61a08d5cfaa724e
    hash_after: d2f8e062dac0776fdef3d29ca61a08d5cfaa724e
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
---

# Ask

Part of phase 11 of [[spec/design_input/the-migration-runs-in-slices#the-phases]]: the verbs retro leave Node.

Done when these verbs run in Go with their contract tests passing, and their JavaScript files, and every JavaScript module no remaining JavaScript imports, leave the tree.

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

- [[spec/tickets/retro-verbs-port-to-go]], standard
- [[spec/tickets/retro-port-size-names-pull]], trivial
- [[spec/tickets/se-minted-pass-binds-mint]], trivial
- [[spec/tickets/retro-registry-test-starts-green]], trivial

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the port is one ticket because one verb leaves Node whole, and its diff reads one file a sub-verb, each beside its own test; the three gate points stand small
- the children add up to the goal: every retro sub-verb runs in Go, the retro JavaScript and every module only it imported leave, and a search finds no importer left
- the three gate points wait on the port, which closed before them, so none names depends_on

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

true

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
