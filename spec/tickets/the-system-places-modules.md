---
kind: [[ticket]]
state: open
step: design/tests-red
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
  - name: gate
    gate: does the approach answer the ask, and does a red test decide every done_when line
    does: reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points
    not: design/draft
    tags: ["review"]
    input: ["design/draft", "design/tests-red"]
    evidence:
      - name: verdict
        form: verdict
        says: accept, accept with points naming a fix ticket a line, or reject with findings one a line
  - name: implement
    tags: ["code", "testing"]
    needs: ["branch test"]
    input: ["design/draft", "gate"]
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
        input: design/tests-red
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
group: module-processes-land-in-shadow
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

The index places each module instance in a process over the bus [[spec/tickets/the-doors-process-stands]] builds, per [[spec/design_output/processes#the-placements]]. Under the `processes` slice's `shadow`, the old path keeps every provider in the index, and the module processes compute beside it.

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
