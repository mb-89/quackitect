---
kind: [[ticket]]
state: open
step: design/tests-red-2
steps:
  - name: design
    steps:
      - name: owner-read
        does: reads the ask a handover carries, before any draft
        by: person
        when: handed
        input: ask
        evidence:
          - name: read
            form: verdict
            says: pass where the ask says what the owner said, or fail with the owner's words
      - name: draft
        does: writes the approach the ask calls for
        from: anyone
        by: anyone
        input: ask
        checklist: ["every file, function and verb the approach names stands opened, and each claim checked there", "the callers list names every caller of what the approach changes", "every done_when line names the test that decides it"]
        evidence:
          - name: approach
            form: text
            says: the approach here where it takes minutes, or a link to the design output where it takes a note
          - name: callers
            form: list
            says: every caller of what the approach changes, one a line, as a file and a function
          - name: tests
            form: list
            says: every test the change adds, one a line, as a file and a test name
          - name: answers
            form: list
            says: every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft
      - name: tests-red
        does: writes the tests the ask calls for
        tags: ["code", "testing"]
        needs: ["branch test"]
        input: draft
        checklist: ["every done_when line meets a test that fails, or a checkpoint the hand answers where no command decides", "every door the tests reach has a fake"]
        evidence:
          - name: tests
            form: command
            expects: assertion
            says: the tests you write fail on their own assertion
          - name: red
            form: list
            says: every test file standing red until tests-green closes, one a line, which the check leaves out
          - name: seen
            form: text
            says: what you see, and what surprises you
      - name: draft-2
        does: writes the approach the ask calls for
        from: anyone
        by: anyone
        input: ask
        checklist: ["every file, function and verb the approach names stands opened, and each claim checked there", "the callers list names every caller of what the approach changes", "every done_when line names the test that decides it"]
        evidence:
          - name: approach
            form: text
            says: the approach here where it takes minutes, or a link to the design output where it takes a note
          - name: callers
            form: list
            says: every caller of what the approach changes, one a line, as a file and a function
          - name: tests
            form: list
            says: every test the change adds, one a line, as a file and a test name
          - name: answers
            form: list
            says: every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft
      - name: tests-red-2
        does: writes the tests the ask calls for
        tags: ["code", "testing"]
        needs: ["branch test"]
        input: draft-2
        checklist: ["every done_when line meets a test that fails, or a checkpoint the hand answers where no command decides", "every door the tests reach has a fake"]
        evidence:
          - name: tests
            form: command
            expects: assertion
            says: the tests you write fail on their own assertion
          - name: red
            form: list
            says: every test file standing red until tests-green closes, one a line, which the check leaves out
          - name: seen
            form: text
            says: what you see, and what surprises you
  - name: gate
    gate: does the approach answer the ask, and does a red test decide every done_when line
    does: reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points
    not: design/draft
    tags: ["review"]
    input: ["design/draft", "design/tests-red", "design/draft-2", "design/tests-red-2"]
    evidence:
      - name: verdict
        form: verdict
        says: accept, accept with points naming a fix ticket a line, or reject with findings one a line
  - name: implement
    tags: ["code", "testing"]
    needs: ["branch test"]
    input: ["design/draft", "gate", "design/draft-2"]
    checklist: ["the change touches no file the ask leaves out", "every door the change reaches has a fake", "a comment names the approach the change implements", "every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
    steps:
      - name: change
        does: makes the change
        evidence:
          - name: lint
            form: command
            expects: 0
            says: the tree builds and lints
      - name: tests-green
        does: makes the tests pass
        input: ["design/tests-red", "design/tests-red-2"]
        to: retro
        evidence:
          - name: tests
            form: command
            expects: green
            says: the same tests pass
          - name: check
            form: command
            expects: 0
            says: the check is green on the commit
          - name: says
            form: text
            says: what changes and why, for a reader who was not there
  - name: accept
    gate: does the whole work answer the ask, and does every command of the route pass
    final: true
    when: backlog
    does: reads the diff since its last verdict against the ask and every prose criterion, and names what falls short as points
    not: implement/change
    tags: ["review", "accept"]
    input: ["ask", "implement"]
    evidence:
      - name: verdict
        form: verdict
        says: accept, accept with points naming a fix ticket a line, or reject with findings one a line
  - name: view
    does: reads the change in the view the ask names
    by: person
    when: view
    on_fail: implement
    to: retro
    input: ["ask", "implement/tests-green"]
    evidence:
      - name: seen
        form: verdict
        says: pass where the view shows the ask's number, or fail with what it shows
process: [[spec/processes/standard]]
process_hash: 22b42ea1501e8967
record:
  - step: design/draft
    hand: box 03ba8e0fb2d4 · claude-code-remote
    hash_before: e83f301f33ccf46c24533b948458730ec79d69d5
    hash_after: e83f301f33ccf46c24533b948458730ec79d69d5
    inputs:
      - name: ask
        hash: e437528f642d7a6c
        size: 346
      - name: [[spec/design_input/the-index-holds-the-model]]
        hash: 5f2da8fccb387d1f
        size: 23680
    def: 71651f49796eeda4
  - step: design/tests-red
    hand: box 03ba8e0fb2d4 · claude-code-remote
    hash_before: 6618daaeb49688c71c08f5ee4d5a7e7ddef015aa
    hash_after: 6618daaeb49688c71c08f5ee4d5a7e7ddef015aa
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/index fails
    inputs:
      - name: design/draft
        hash: 3656ed69f13bbe52
        size: 4147
      - name: [[spec/tickets/the-doors-process-stands]]
        hash: a166f2553415d2a5
        size: 402
    def: 08e16d07b0de477c
  - step: gate
    hand: box 03ba8e0fb2d4 · claude-code-remote · helper-6
    hash_before: 3adb9cb20dc011cf036357299bde7f09a0a89915
    hash_after: d1986cae28ae29f940db8d8a9eae137efa340080
    returns: 1
    why: "placements-link-points-at-model: the approach links [[spec/design_output/model#the-placements]], a note that does not exist; the processes chapter stands in spec/design_output/model.md, so the link reads [[spec/design_output/model#the-placements]]. The write door refuses the ticket body at gate, so the move rides here.; placed-topics-name-module-folders: Placed.Topics carries module types (placements_test wants \\\"tickets, queue\\\"), while the watch change names a folder under src/modules/<topic>; several types share one folder (ticket, retro, branch, vehicle, stub in the verbs package), so Placements.Restart needs a map from module type to its folder, or a restart misses them.; placements-leave-door-instances: placing each instance whose module carries no start in the modules table of src/quack/main.go also places hooks, mcp, lsp, http and the settings sections, whose listeners the index manager's start opens; placementsOf leaves them out, per model#the-io-process.; placements-answer-inputs-tested: no red test decides the index side of step 3, Placements answering in.<instance> with the saved inputs and publishing run.<instance> after a commit moves an input; add a case in src/index/procs_test.go.; watch-restart-joins-switch: step 5 has the watch module call Placements.Restart on a change under src/modules/<topic>, while the assumption puts the rebuild with the switch; under shadow a restart reruns the same binary, so the watch caller (src/modules/files) belongs to the switch ticket, or the approach says why it lands now.; tests-list-matches-files: the draft's tests list names src/q/store_test.go, src/q/projection_test.go and src/quack/module_test.go, where the cases stand in src/q/start_test.go and src/quack/placements_test.go; the red list names the right files."
  - step: design/draft-2
    hand: box 03ba8e0fb2d4 · claude-code-remote · helper-7
    hash_before: 578a003a43ed613d92e6cb77f7faaca2c1404e36
    hash_after: 578a003a43ed613d92e6cb77f7faaca2c1404e36
    inputs:
      - name: ask
        hash: e437528f642d7a6c
        size: 346
      - name: [[spec/design_input/the-index-holds-the-model]]
        hash: 5f2da8fccb387d1f
        size: 23680
    def: a3dfd8c60d853590
  - step: design/tests-red
    hand: the engine
    stale: design/draft
  - step: design/tests-red
    skipped: true
    kept: 28834b1b612c04d55117635cb75585294b3e7fcb
    why: its red tests stand as 28834b1b6 landed them, and a later leaf passed since
  - step: design/draft-2
    hand: box 36586c1b4c37 · claude-code-remote
    hash_before: 6fa7724d7151e209ff3e74f5f991475f7540be12
    hash_after: 6fa7724d7151e209ff3e74f5f991475f7540be12
    inputs:
      - name: ask
        hash: e437528f642d7a6c
        size: 346
      - name: [[spec/design_input/the-index-holds-the-model]]
        hash: 5f2da8fccb387d1f
        size: 23680
    def: a3dfd8c60d853590
group: module-processes-land-in-shadow
---

# Ask

The index places each module topic in a process and supervises it. [[spec/design_input/the-index-holds-the-model#the-system-places-the-processes]] asks it.

A crash stays in one module, and a changed module restarts alone.

- `go test ./...` from the root passes
- a case restarts one module, and the index stays warm
- `./RUNME.sh check` exits 0

# design

## owner-read

<!-- reads the ask a handover carries, before any draft -->

### read

<!-- pass where the ask says what the owner said, or fail with the owner's words -->

<!-- the form is verdict -->

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->
<!-- the form is text -->

The index places each module instance in a process over the bus [[spec/tickets/the-doors-process-stands]] builds, per [[spec/design_output/model#the-placements]]. Under the `processes` slice's `shadow`, the old path keeps every provider in the index, and the module processes compute beside it.

1. The placements. The index manager registers `processes/placements` in `src/modules/index/manager.go`, a list of instance lists, built-in empty. `src/quack/placements.go` turns the wiring and the key into one `index.Placed` a list, and one a process for each instance in no list. It places each instance whose module carries no start in the `modules` table of `src/quack/main.go`. The IO instances stay with the IO process.
2. `quack module <instance>...`. `src/quack/module.go` loads the whole wiring into a catalog of its own, with no IO start, and dials the bus. On each `run.<instance>` it asks `in.<instance>`, restores the values it answers through `Store.Restore`, settles its scheduler, and publishes the instance's out-port values on `commit.<instance>`. Its loop beats `lease.<process>`.
3. The index's side. `src/index/procs.go` gains `Placements`, which starts each `Placed` and publishes `run.<instance>` after a commit moves an input of a placed instance. It answers `in.<instance>` with the saved inputs. `src/q` gains `Store.Inputs(instance)`, `Store.Outputs(instance)` and `Store.SaveNames(names)`, beside `Save`.
4. The shadow. Under `shadow` each placed commit goes to the shadow weigh [[spec/tickets/the-doors-process-stands]] adds, and nothing lands. Under `new` the switch ticket lands it, and takes the provider off the index.
5. A crash stays in one process. `Placed` restarts its own process alone after its wait, and the index and every other process keep running, so the index stays warm. `Placements.Restart(topic)` restarts the processes holding a topic's instances, and the `watch` IO module calls it on a change under `src/modules/<topic>`.

The assumption: under `shadow` a restart runs the index's own binary again. The rebuild under `.se/.runtime/bin` and `processes.rebuild` belong to the switch, since a shadow process lands nothing a stale binary could spoil.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/modules/index/manager.go Registers, which gains processes/placements
- src/index/procs.go Placed.Start, which Placements starts and restarts
- src/index/door.go starts, which runs the placements' start beside the IO starts
- src/quack/main.go main, whose dispatch gains module
- src/quack/main.go manages and wired, which hand the index its placements under shadow
- src/quack/main.go loaded, which the module process reuses with no IO start
- src/quack/io.go shadows.weigh, which weighs each placed commit
- src/q/projection.go Save and Restore, beside the new SaveNames
- src/modules/files watch, whose change under src/modules/<topic> calls Placements.Restart
- spec/config/level0.schema.json, which quack schema --write regenerates

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/index/procs_test.go TestAKilledModuleProcessRestartsAloneAndTheIndexStaysWarm
- src/index/procs_test.go TestAPlacementRestartsTheProcessesOfOneTopic
- src/q/store_test.go TestAnInstanceNamesItsInputsAndOutputs
- src/q/projection_test.go TestSaveNamesSavesTheNamesItIsHanded
- src/quack/placements_test.go TestEachInstanceInNoListTakesAProcessOfItsOwn
- src/quack/placements_test.go TestAListOfInstancesSharesOneProcess
- src/quack/module_test.go TestAModuleProcessCommitsItsInstanceOffTheInputs

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first draft

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file, function and verb the approach names stands opened, and each claim checked there: manager.go Registers and CfgIn, q.Instance, registration inputs, projection.go Save and Restore, main.go modules, loaded and wired, and the Placed the first ticket's draft adds
- the callers list names every caller of what the approach changes, off a grep of Placed, Save(, Restore(, manager.Registers and the modules table
- every done_when line names the test that decides it: the restart line TestAKilledModuleProcessRestartsAloneAndTheIndexStaysWarm, the go test line go test ./..., and the check line ./RUNME.sh check

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/index/procs_test.go
- src/q/start_test.go
- src/quack/placements_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Each new case fails on its own assertion over stubs that compile. The two fakes never commit, the store names no inputs, SaveNames saves nothing, and the placements run no process. The module process reaches no bus. The store cases stand in src/q/start_test.go beside the down cases, and the module process case stands in src/quack/placements_test.go, where the draft names store_test.go, projection_test.go and module_test.go. One file a topic keeps each case beside the helper it reuses. The fake IO process now takes its instance off the argument after the double dash, so one fake serves both placements.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every done_when line meets a test that fails: the restart line meets TestAKilledModuleProcessRestartsAloneAndTheIndexStaysWarm, and go test ./... and ./RUNME.sh check run at implement
- every door the tests reach has a fake: the module processes are the test binary run again, and the bus runs in memory on loopback

## draft-2

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->
<!-- the form is text -->

The index places each module instance that computes in a process over the bus [[spec/tickets/the-doors-process-stands]] builds, per [[spec/design_output/model#the-placements]]. Under the `processes` slice's `shadow`, the old path keeps every provider in the index, and the module processes compute beside it.

1. The placements. The index manager registers `processes/placements` in `src/modules/index/manager.go`, a list of instance lists, built-in empty. `src/quack/placements.go` turns the wiring and the key into one `index.Placed` a list, and one a process for each instance in no list.
2. What it places. `placementsOf` places an instance whose providers read an input, by `Store.Inputs(instance)`. It leaves out each instance whose module carries a start, which the IO process runs. It leaves out the instances whose listener the manager's start opens: hooks, mcp and lsp.
3. A topic names a folder. `Placed.Topics` holds the folder under `src/modules` that registers each instance's module type. `placementsOf` reads it off the package path of the type's registration, so the five types the verbs package registers share the topic `verbs`.
4. `quack module <instance>...`. `src/quack/placements.go` loads the whole wiring into a catalog of its own, with no IO start, and dials the bus. On each `run.<instance>` it asks `in.<instance>`, restores the values through `Store.Restore`, settles its scheduler, and publishes the instance's out-port values on `commit.<instance>`. Its loop beats `lease.<process>`.
5. The index's side. `src/index/procs.go` gains `Placements`, which starts each `Placed`. It publishes `run.<instance>` once a commit moves an input of a placed instance, and answers `in.<instance>` with the saved inputs. `src/q` gains `Store.Inputs(instance)`, `Store.Outputs(instance)` and `Store.SaveNames(names)`, beside `Save`.
6. The shadow. Under `shadow` each placed commit goes to the shadow weigh [[spec/tickets/the-doors-process-stands]] adds, and nothing lands. Under `new` the switch ticket lands it, and takes the provider off the index.
7. A crash stays in one process. `Placed` restarts its own process alone after its wait, and the index and every other process keep running, so the index stays warm. `Placements.Restart(topic)` restarts the processes holding a topic's instances.

The assumption: the `watch` caller of `Placements.Restart` lands with the switch ticket, beside the rebuild under `.se/.runtime/bin` and `processes.rebuild`. Under `shadow` a restart reruns the binary the index runs, and a shadow process lands nothing a stale binary could break.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/modules/index/manager.go Registers, which gains processes/placements
- src/index/procs.go Placed, which gains its topics, and Placements, which starts and restarts each one
- src/index/bus.go Peer, which gains Run, Runs, Inputs and AnswersInputs
- src/quack/main.go main, whose dispatch gains module
- src/quack/main.go manages, which hands the index its placements under shadow
- src/quack/io.go shadows.weigh, which weighs each placed commit
- src/q/projection.go Save and Restore, beside the new SaveNames
- src/q/store.go Down and Up, beside the new Inputs and Outputs
- spec/config/level0.schema.json, which quack schema --write regenerates

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/index/procs_test.go TestAKilledModuleProcessRestartsAloneAndTheIndexStaysWarm
- src/index/procs_test.go TestAPlacementRestartsTheProcessesOfOneTopic
- src/index/procs_test.go TestPlacementsAnswerInputsAndRunOnAMove
- src/q/start_test.go TestAnInstanceNamesItsInputsAndOutputs
- src/q/start_test.go TestSaveNamesSavesTheNamesItIsHanded
- src/quack/placements_test.go TestEachInstanceInNoListTakesAProcessOfItsOwn
- src/quack/placements_test.go TestAListOfInstancesSharesOneProcess
- src/quack/placements_test.go TestAModuleProcessCommitsItsInstanceOffTheInputs

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- placements-link-points-at-model: the approach links the model's placements chapter
- placed-topics-name-module-folders: step 3 names a topic by the folder under src/modules that registers the type, read off its registration's package path
- placements-leave-door-instances: step 2 places an instance that reads an input, and leaves out the IO instances and the hooks, mcp and lsp listeners
- placements-answer-inputs-tested: TestPlacementsAnswerInputsAndRunOnAMove in src/index/procs_test.go decides step 5
- watch-restart-joins-switch: the assumption moves the watch caller to the switch ticket, and Placements.Restart stands tested for it
- tests-list-matches-files: the tests list names the files the cases stand in

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file, function and verb the approach names stands opened, and each claim checked there: manager.go Registers, main.go modules and listens, the bus and Placed in src/index, projection.go Save and Restore, store.go Down, the gate's six findings, and the register function each entry of the modules table in main.go holds, whose package a runtime lookup names
- the callers list names every caller of what the approach changes, off a grep of Placed, Peer, Save(, Restore(, manager.Registers and the modules table
- every done_when line names the test that decides it: the restart line TestAKilledModuleProcessRestartsAloneAndTheIndexStaysWarm, the go test line go test ./..., and the check line ./RUNME.sh check

## tests-red-2

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->

<!-- the form is list -->

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

reject
- placements-link-points-at-model: the approach links [[spec/design_output/model#the-placements]], a note that does not exist; the processes chapter stands in spec/design_output/model.md, so the link reads [[spec/design_output/model#the-placements]]. The write door refuses the ticket body at gate, so the move rides here.
- placed-topics-name-module-folders: Placed.Topics carries module types (placements_test wants "tickets, queue"), while the watch change names a folder under src/modules/<topic>; several types share one folder (ticket, retro, branch, vehicle, stub in the verbs package), so Placements.Restart needs a map from module type to its folder, or a restart misses them.
- placements-leave-door-instances: placing each instance whose module carries no start in the modules table of src/quack/main.go also places hooks, mcp, lsp, http and the settings sections, whose listeners the index manager's start opens; placementsOf leaves them out, per model#the-io-process.
- placements-answer-inputs-tested: no red test decides the index side of step 3, Placements answering in.<instance> with the saved inputs and publishing run.<instance> after a commit moves an input; add a case in src/index/procs_test.go.
- watch-restart-joins-switch: step 5 has the watch module call Placements.Restart on a change under src/modules/<topic>, while the assumption puts the rebuild with the switch; under shadow a restart reruns the same binary, so the watch caller (src/modules/files) belongs to the switch ticket, or the approach says why it lands now.
- tests-list-matches-files: the draft's tests list names src/q/store_test.go, src/q/projection_test.go and src/quack/module_test.go, where the cases stand in src/q/start_test.go and src/quack/placements_test.go; the red list names the right files.

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->

<!-- the form is command -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

### check

<!-- the check is green on the commit -->

<!-- the form is command -->

### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# accept

<!-- reads the diff since its last verdict against the ask and every prose criterion, and names what falls short as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->

<!-- the form is verdict -->

# view

<!-- reads the change in the view the ask names -->

## seen

<!-- pass where the view shows the ask's number, or fail with what it shows -->

<!-- the form is verdict -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
