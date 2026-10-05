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
  - name: children-2
    by: children
    on_fail: split
  - name: accept
    gate: does the work of every child add up to the goal, and does every command of the route pass
    final: true
    does: reads the diff since its last verdict against the goal and every prose criterion, and names what falls short as points
    tags: ["review", "accept"]
    input: ["ask", "children", "children-2"]
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
        input: ["children", "notes", "children-2"]
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
    hand: box 2e385b836f39 · claude-code-remote
    hash_before: 14c93ceb1cb3a559b608ab975f699a9eb9106399
    hash_after: fb15021a6832623d21aefa258ccdccf88efb7b0f
  - step: sync
    hand: box 1d64c60aa6ea · claude-code-remote
    hash_before: fb15021a6832623d21aefa258ccdccf88efb7b0f
    hash_after: 073e467831c10526b396f2538599be8567433af9
  - step: sync
    hand: box 1d64c60aa6ea · claude-code-remote
    hash_before: c3b1063cbd98bba441b2e5eea7acab29decbe3d7
    hash_after: e2096b0ab314db4ac7c01ef2eb323928b6f18523
    answered:
      - name: sync
        exit: 0
        said: work/window-verbs-run-in-go already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box 1d64c60aa6ea · claude-code-remote
    hash_before: 0a508a909cf789dc0a6e3fa6ffed3560ef1073eb
    hash_after: 0a508a909cf789dc0a6e3fa6ffed3560ef1073eb
    inputs:
      - name: ask
        hash: 3484fd0a47aa84d4
        size: 313
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: 3eaee7b8cc71d34a
        size: 11400
    def: cb8f90bc86fc7d39
  - step: children
    hand: the engine
    hash_before: 2934f0685698b5e1a142fc8bb34ae12b8732b878
    hash_after: 2934f0685698b5e1a142fc8bb34ae12b8732b878
  - step: accept
    hand: box 1d64c60aa6ea · claude-code-remote
    hash_before: 245973525ad2962658c9221a3dc03e0ce393a6c7
    hash_after: 595fce395717ae0b403e6b9c413903cbc7168a69
    returns: 1
    why: "the Windows job of the check fails go test on src/quack, src/vehicle and src/voice, the group own packages: window-verbs-windows-green carries it; src/scripts/log-read.js stands with no importer past its own test since tui.js left, and spec/design_output/log.md still names it as the read tui --plain calls"
    answered:
      - name: sync/sync
        exit: 0
        said: work/window-verbs-run-in-go already carries every commit on main.
  - step: children-2
    hand: the engine
    hash_before: 2cead64925ac69d18659c5671f56d9010b39d8cb
    hash_after: 2cead64925ac69d18659c5671f56d9010b39d8cb
  - step: accept
    hand: box 1d64c60aa6ea · claude-code-remote
    hash_before: 3c9b5f26c7e2579b8b28b88dacc27e807fd0daad
    hash_after: 1caf22247f98c0d5cd35534aa1897a28538f5ca8
    answered:
      - name: sync/sync
        exit: 0
        said: work/window-verbs-run-in-go took 27 commit(s) from main.
    inputs:
      - name: ask
        hash: 3484fd0a47aa84d4
        size: 313
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: children-2
        hash: 811c9dc59e3779b9
        size: 0
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: 3eaee7b8cc71d34a
        size: 11400
    def: bf1fe6cde364dfd7
  - step: accept
    hand: box 05659fab4226 · claude-code-remote
    hash_before: 073e467831c10526b396f2538599be8567433af9
group: the-verbs-run-in-go
depends_on: ["quack-holds-a-verb-registry"]
enabled_by: migration.phase11
cloud: true
---

# Ask

Part of phase 11 of [[spec/design_input/the-migration-runs-in-slices#the-phases]]: the verbs tui, serve, voice, vehicle and stub leave Node.

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

- [[spec/tickets/window-verbs-port-to-go]], process standard: tui, serve, voice, vehicle and stub answer in Go from their own files, and their JavaScript leaves
- [[spec/tickets/registered-verb-skips-the-mode]], process trivial: a verb Go registers whole takes quack under every mode, since its program left

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each child reviews whole: the port is five verbs of one shape, each in its own file, and the road fix is one function with its case
- the children add up to the goal: no program of the five verbs stands under src/scripts/verbs, a scan of src/scripts finds no module nothing imports, and vehicle.js stays because src/bridge/vehicle.js imports it
- registered-verb-skips-the-mode was minted from the port gate and closed after it, so neither waits on the other and neither names depends_on

# children

# children-2

# accept

<!-- reads the diff since its last verdict against the goal and every prose criterion, and names what falls short as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- tui-swap-fails-loud: tuiVerb prints the plain rows and asks for Go when the fresh viewer fails to swap in, on a box that holds Go, where tui.js failed loud
- stub-shim-stays-tested: no test runs the real src/stub/RUNME.sh since test/contract/stub.test.js left, so its hand-over through SE_VEHICLE and the register road stand untested
- vehicle-test-comment-current: src/modules/verbs/vehicle_test.go names theVehicle, which left with vehicle-verb.js

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

- The sync met main's box group in `roadOf`. Main sent a registered `tools` to its program under old, and `tools.js` left the tree in that same group, so node answers nothing there. The road keeps this group's rule: a verb Go registers whole takes quack under every mode, ahead of the twin block. `TestARegisteredVerbRunsAheadOfQuacksOwn` keeps its check that the twin runs ahead of quack's own `tools`, and wants quack under old. A twin of a verb's words, such as `retro notes`, keeps its shadow road. [[spec/tickets/registered-verb-skips-the-mode]]
- The take's merge left a second `goVerbs` in `test/contract/commands.js` and in the imports of `tree.test.js`. Main's copy stays.
