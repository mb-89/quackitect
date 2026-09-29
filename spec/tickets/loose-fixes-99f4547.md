---
kind: [[ticket]]
state: closed
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
fix: true
record:
  - step: sync
    hand: box d84d8ece51e9 · claude-code-remote
    hash_before: 11f263cfcce247a81cc0a2de3b9cf5182fc4eab0
    hash_after: 64688c00ce15ce2fb9463e3af529ea9a70c6793e
  - step: sync
    hand: box d84e33ce20f7 · claude-code-remote
    hash_before: 64688c00ce15ce2fb9463e3af529ea9a70c6793e
    hash_after: 6fc3964b9b419cc811bf3c7c3dee089b76275536
  - step: sync
    hand: box d84f325b2110d · claude-code-remote
    hash_before: a14db7b5051df8c20e20dbb464c946b6cbb55c2c
    hash_after: 1907ec29634f93ca5d782ce5a3d2da8fa3c5bbc2
  - step: sync
    hand: box d84f325b2110d · claude-code-remote
    hash_before: a74c568a3f98d8cc968931357e518bd41f7496b3
    hash_after: a74c568a3f98d8cc968931357e518bd41f7496b3
    answered:
      - name: sync
        exit: 0
        said: work/loose-fixes-99f4547 already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box d84f325b2110d · claude-code-remote
    hash_before: 6b14da7de3d613222e6b6ec79a0b5112a6c23952
    hash_after: 6b14da7de3d613222e6b6ec79a0b5112a6c23952
    inputs:
      - name: ask
        hash: 8dc00399b152ebf3
        size: 385
      - name: [[spec/design_input/the-cloud-runs-itself]]
        hash: 591680bf2c6fc6d6
        size: 13376
    def: cb8f90bc86fc7d39
  - step: children
    hand: the engine
    hash_before: 51481f978be0e0b18b22a057f4a9686e3feb0e62
    hash_after: 51481f978be0e0b18b22a057f4a9686e3feb0e62
  - step: accept
    hand: box d84f325b2110d · claude-code-remote
    hash_before: 3399ec79bc3f14df72c56f720a6f96ad17c81909
    hash_after: 3399ec79bc3f14df72c56f720a6f96ad17c81909
    answered:
      - name: sync/sync
        exit: 0
        said: work/loose-fixes-99f4547 already carries every commit on main.
    inputs:
      - name: ask
        hash: 8dc00399b152ebf3
        size: 385
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: [[spec/design_input/the-cloud-runs-itself]]
        hash: 591680bf2c6fc6d6
        size: 13376
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box d84f325b2110d · claude-code-remote
    hash_before: d6a91fb0e7917e137a692a0c94fd30ab11dca424
    hash_after: d6a91fb0e7917e137a692a0c94fd30ab11dca424
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
  - step: retro/write
    hand: box d84f325b2110d · claude-code-remote
    hash_before: 28a1d5279bdf0aba0c9f7f49bcaa13d46d5c99bc
    hash_after: 28a1d5279bdf0aba0c9f7f49bcaa13d46d5c99bc
    inputs:
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: retro/notes
        hash: 310d2ddd3fe31ac9
        size: 36
    def: 1246a42e29e7ae98
  - step: retro/cloud
    hand: box d84f325b2110d · claude-code-remote
    hash_before: 6f5f7f99c8d67168fe47b092d62c02f66e5608e6
    hash_after: 6f5f7f99c8d67168fe47b092d62c02f66e5608e6
    inputs:
      - name: retro/write
        hash: c90a2b7483d61cd3
        size: 2316
    def: 4da1ca5da87d5bbc
step: retro/cloud
reason: done
---

# Ask

The loose agent tickets on main land in this fix group, per [[spec/design_input/the-cloud-runs-itself#feature-groups-and-fix-groups]].

A fix group closes every ticket it holds. Work a person alone can do leaves it on the person route, loose on main.

- every ticket naming this group closes through the command it names
- `./RUNME.sh check` exits 0

The view: none.

The source: none.

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

- [[spec/tickets/a-desk-runs-probe-reply]] (question)
- [[spec/tickets/boxes-keep-their-questions]] (trivial)
- [[spec/tickets/done-skips-added-drafts]] (trivial)
- [[spec/tickets/findings-reach-the-owner]] (question)
- [[spec/tickets/gate-points-pass-the-push]] (standard)
- [[spec/tickets/helpers-pull-past-plans]] (standard)
- [[spec/tickets/list-fields-split-lines]] (standard)
- [[spec/tickets/queue-reads-git-for-came]] (question)
- [[spec/tickets/stale-hold-frees-the-branch]] (trivial)
- [[spec/tickets/stale-hold-moves-by-take]] (trivial)
- [[spec/tickets/the-owner-names-three-things]] (question)
- [[spec/tickets/the-owner-runs-the-dispatch]] (question)
- [[spec/tickets/the-owner-shapes-the-editor]] (question)
- [[spec/tickets/the-owner-walks-a-process]] (question)
- [[spec/tickets/vale-ls-on-windows]] (question)

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each child is one loose agent ticket or a finding this branch minted, small enough to review whole
- the children are the loose agent tickets the dispatch bundled, plus the done fix this branch met, so the goal stands inside them
- no child waits on another, so none names depends_on

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

- the main merge resolved in the red list, keeping main's comma split and both comma tests
- the size twin golden reads the new line count of spec/design_output/pull.md
- helpers-pull-past-plans: a helper's pull takes the ticket the plan works
- list-fields-split-lines: its cases read main's bullet rows, since main carried the fix
- done-skips-added-drafts: branch done leaves an added draft loose on main

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

- a scratch clone of main showed the twin failure came from this branch, not from main
- the design table in spec/design_output/work decided the done defect without a question

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->
<!-- the form is list -->

- 04:19 the check went red on TestTwinGoldens after the merge, and the first commit stayed unpushed
- 04:20 git add came back refused, since a write reaches git through the commit verb alone
- 04:22 the plan tool answered no server until serve started, so the engine's gate counted down
- 04:33 a test verb chained before ticket pull came back refused under LandingFollowsItsGate
- 04:40 ticket pull naming the group came back refused under the queue, though branch done names that pull
- 04:41 the group stood at draft, so the pull handed none of its leaves out until the open

### improve

<!-- how each bad line stops happening, named by its home -->
<!-- the form is list -->

- src/lsp/twins_test.go: the size golden compares rule and file, and leaves the line count out
- the cloud boot: branch take starts the server, so the plan tool answers from the first call
- src/scripts/work-fix.js: the retro refusal names the plain pull, which the queue binding takes
- src/scripts/dispatch.js: the fix group mints open, so its route reaches the retro
- src/scripts/dispatch.js: a loose ticket a commit on main already answers leaves the bundle

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The merge and the twin golden cost the most time: the check failed on a line count that the branch's own ticket edit moved. The editor ticket looked like a question for the owner, yet the design table ruled it, so the box fixed the counter and left the draft loose on main as its source intended.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each fact points at its home file, and the retro repeats no rule
- the retro adds no number past the times the checklist asks for
- the retro writes no file header
- no owner prompt reached this scheduled run, and every error carries its time
- the retro names the role alone, with no name, address or box path

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->
<!-- the form is list -->

- 04:22 the level0 server stood down, so the plan tool answered nothing until serve started

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->
<!-- the form is list -->

- 04:18 a conflict with main in src/scripts/red-list.js and its test
- 04:19 the twin golden failed on a line count this branch moved
- 04:20 the hook refusing git add and a chained ticket pull

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->
<!-- the form is list -->

- the-editor-edits-a-process stands a draft at a person step, loose on main as its source rules
- no person step parked, and no other ticket minted with no group

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
