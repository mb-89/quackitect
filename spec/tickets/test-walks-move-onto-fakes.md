---
kind: [[ticket]]
state: open
step: implement/change
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
        checklist: ["every file, function and verb the approach names stands opened, and each claim checked there", "the callers list names every caller of what the approach changes", "every done_when line names the test that decides it", "every config key the approach adds names each default file it lands in"]
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
          - name: size
            form: list
            says: every file the approach touches, one a line
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
process_hash: c671f20a6ae2a4a6
group: doors-declare-what-they-own
depends_on: ["tests-meet-the-doors-once", "a-live-branch-holds-its-dependents"]
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box dcf1ea3c64fd · claude-code-remote
    hash_before: 9841cc3c3a88d3f1fb78b53d66fb7bba39647114
    hash_after: 9841cc3c3a88d3f1fb78b53d66fb7bba39647114
    inputs:
      - name: ask
        hash: 84c390bc46122637
        size: 473
    def: c01ae0f2ace0cecb
  - step: design/tests-red
    hand: box dcf1ea3c64fd · claude-code-remote
    hash_before: 748d13e8baafa88ac31bff392bd568f85364615c
    hash_after: 748d13e8baafa88ac31bff392bd568f85364615c
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/owns fails
    inputs:
      - name: design/draft
        hash: 77bec66c56f0fa62
        size: 6751
      - name: [[spec/design_output/doors]]
        hash: c954e18a8d392976
        size: 23272
    def: 08e16d07b0de477c
  - step: gate
    hand: box dcf1ea3c64fd · claude-code-remote · helper-4
    hash_before: e48ab6d9a8fc1a3dbfedb66a776a2e9f023bccc7
    hash_after: e48ab6d9a8fc1a3dbfedb66a776a2e9f023bccc7
    inputs:
      - name: design/draft
        hash: 77bec66c56f0fa62
        size: 6751
      - name: design/tests-red
        hash: 6aadec6afa1cb638
        size: 690
      - name: [[spec/design_output/doors]]
        hash: c954e18a8d392976
        size: 23272
    def: dc4904ab364efa10
  - step: design/tests-red
    hand: the engine
    stale: [[spec/design_output/doors]]
  - step: gate
    hand: the engine
    stale: [[spec/design_output/doors]]
  - step: design/tests-red
    skipped: true
    kept: e48ab6d9a8fc1a3dbfedb66a776a2e9f023bccc7
    why: its red tests stand as e48ab6d9a landed them, and a later leaf passed since
  - step: gate
    hand: box dcf1ea3c64fd · claude-code-remote · helper-8
    hash_before: 05a6f591dbba58e3f73bafea389040d156d91c7d
    hash_after: 05a6f591dbba58e3f73bafea389040d156d91c7d
    inputs:
      - name: design/draft
        hash: 77bec66c56f0fa62
        size: 6751
      - name: design/tests-red
        hash: 6aadec6afa1cb638
        size: 690
      - name: [[spec/design_output/doors]]
        hash: 871c46a73c83753e
        size: 23251
    def: dc4904ab364efa10
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
<!-- view, as text: the view the owner reads the change in and the number there, in the owner's words, or none -->
<!-- from, as text: handover where the ask comes off a handover line, so the owner reads it first, or none -->

Every test meets a door through its fake, or stands as the door's contract test. So a test run reaches the box in one place, and the guard of `the-guard-refuses` meets an empty list.

A test reaching the box outside its door takes the box into its run, and the walk-around list never reaches zero. The approach stands under part two of the draft in `go-tests-meet-the-doors`.

- `./RUNME.sh doors` lists no walk-around in a test file
- `./RUNME.sh check` passes

none

none

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

Each test file `./RUNME.sh doors` lists takes the first of six moves that fits it. The owner's word decides the order: test at the outermost door, which is the command line, each door meets the real thing once, every other test takes the door's fake, and a test tests behaviour and interfaces.

1. A case restating behaviour another case or a command-line case covers leaves.
2. A fixture seeded on the real disk for code taking a disk door seeds the door's fake: `files.NewFakeDisk` in a module, `newFakeDisk` in the root. Code reaching the disk past a door takes the door as an argument first.
3. A wait on the wall becomes a wait on `qtest.NewFake` or on the readiness event. A bound on a hang drops, since `go test -timeout` bounds the run. In JavaScript the clock and `fetch` come from `src/doors/fake`.
4. A case meeting the real thing a door owns, a spawn, a socket or the disk under the door, moves into that door's one contract test, `_contract_test.go` or under `test/contract/`, and the door's `owns.yaml` names it under `contract`. [[spec/design_output/doors#a-door-names-its-contract-tests]]
5. A case spawning `quack` or the test binary meets the command line, and moves into the quack door's contract test.
6. A case reading the tree's own source, as a build check reads it, keeps its import with the marker `level0: OutsideInDoors - <reason>`, as the cases under `src/owns/*_tree_test.go` do. The guard lists every marked line.

A new case, `TestNoTestFileWalksAroundADoor` in `src/owns/tests_tree_test.go`, holds the list of test files at zero. The work splits by package, so a half-moved package breaks no other package's run, and each package lands as one commit.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/owns/owns.go Read: reads each contract key a door's owns.yaml gains
src/owns/owns.go Door.Holds: answers true for each contract test a door gains
src/owns/tree_test.go TestEveryContractTestNamesItsDoor: reads every contract test that moves
every production function that gains a door argument under move 2, named with its callers in implement/change's checked field

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

src/owns/tests_tree_test.go TestNoTestFileWalksAroundADoor

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

src/owns/tests_tree_test.go
owns.yaml of each door gaining a contract test
src/branches/dispatch_vale_test.go
src/branches/dispatch_write_test.go
src/branches/doors_test.go
src/branches/port_f_helpers_test.go
src/config/config_test.go
src/engine/swap/swap_test.go
src/engine/swap/watches_test.go
src/front/front_test.go
src/imports/clock_test.go
src/imports/imports_test.go
src/imports/walkaround_test.go
src/index/actions_test.go
src/index/bus_test.go
src/index/detach_test.go
src/index/detach_windows_test.go
src/index/door_test.go
src/index/failed_start_test.go
src/index/files_test.go
src/index/index_test.go
src/index/placements_test.go
src/index/procs_test.go
src/index/reach_test.go
src/index/start_test.go
src/index/stop_test.go
src/index/sweep_test.go
src/index/tools_test.go
src/index/v1_test.go
src/index/v1keyed_test.go
src/index/v1watch_test.go
src/index/watch_test.go
src/modules/files/watch_contract_test.go
src/modules/files/watch_stop_test.go
src/modules/index/call_test.go
src/modules/lsp/lsp_test.go
src/proc/proc_contract_test.go
src/pull/edit_test.go
src/pull/pull_home_test.go
src/pull/pull_test.go
src/pull/shell_test.go
src/q/qtest/clock_test.go
src/q/scheduler_test.go
src/quack/box_doors_test.go
src/quack/branch_doors_test.go
src/quack/brand_test.go
src/quack/browser_test.go
src/quack/check_test.go
src/quack/checkdoors_test.go
src/quack/cli_test.go
src/quack/codec_test.go
src/quack/commit_test.go
src/quack/dispatch_test.go
src/quack/doctor_verb_test.go
src/quack/drafts_test.go
src/quack/dump_test.go
src/quack/editorlink_test.go
src/quack/edits_test.go
src/quack/ending_test.go
src/quack/ending_windows_test.go
src/quack/given_test.go
src/quack/guidance_test.go
src/quack/hookprobe_test.go
src/quack/hooks_test.go
src/quack/io_test.go
src/quack/landing_test.go
src/quack/lsp_test.go
src/quack/main_test.go
src/quack/manager_test.go
src/quack/modules_test.go
src/quack/placements_test.go
src/quack/plans_test.go
src/quack/probe_cold_test.go
src/quack/probe_verb_test.go
src/quack/queue_wiring_test.go
src/quack/registry_test.go
src/quack/rename_test.go
src/quack/repos_moved_test.go
src/quack/retro_backlog_test.go
src/quack/retro_chapters_test.go
src/quack/retro_collect_test.go
src/quack/retro_mint_test.go
src/quack/retro_new_test.go
src/quack/retro_timeline_test.go
src/quack/retro_twins_test.go
src/quack/schema_test.go
src/quack/serve_verb_test.go
src/quack/settings_test.go
src/quack/setup_verb_test.go
src/quack/spawns_runner_test.go
src/quack/split_test.go
src/quack/stop_rules_test.go
src/quack/stub_verb_test.go
src/quack/survey_test.go
src/quack/ticket_note_test.go
src/quack/ticket_place_test.go
src/quack/ticket_route_test.go
src/quack/tools_test.go
src/quack/tools_verb_test.go
src/quack/tui_verb_test.go
src/quack/twin_live_test.go
src/quack/twins_test.go
src/quack/vale_fake_test.go
src/quack/vehicle_verb_test.go
src/quack/verb_config_group_test.go
src/quack/verb_config_test.go
src/quack/verb_fix_test.go
src/quack/verb_lint_test.go
src/quack/verb_log_test.go
src/quack/verb_mint_test.go
src/quack/verb_project_test.go
src/quack/verb_read_test.go
src/quack/verb_split_test.go
src/quack/verb_tools_test.go
src/quack/verbs_test.go
src/quack/voice_verb_test.go
src/quack/waits_test.go
src/quack/writedoor_test.go
src/tui/draw/colour_test.go
src/tui/frame/door_test.go
src/tui/frame/frame_test.go
src/tui/frame/tell_test.go
src/tui/layout_test.go
src/tui/log/detail_test.go
src/tui/log/read_test.go
src/tui/log/v1_test.go
src/tui/registry/tab_test.go
src/tui/registry/v1_test.go
src/tui/registry/watch_test.go
src/tui/tree/base_test.go
src/tui/tree/palette_test.go
src/tui/window_test.go
src/tui/work/actions_test.go
src/tui/work/v1_test.go
src/tui/work_test.go
src/tui/workedit_test.go
src/vehicle/vehicle_test.go
src/watcher/watcher_test.go
src/watcher/watchertest/watchertest_test.go
test/contract/cloud-start.test.js
test/contract/editor-index.test.js
test/contract/wire.test.js
test/level0/bridgehead.test.js
test/level0/caged-door.test.js
test/level0/copilot.test.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

opened src/owns/owns.go Read and Holds, src/owns/scripts_tree_test.go and quack_tree_test.go for the marker precedent, files.NewFakeDisk, quack's newFakeDisk and qtest.NewFake, and each stands as the approach names it
the callers list names the readers of the contract key, and move 2 names its callers where it lands, since which function gains a door shows only on the move
the first done_when line falls to TestNoTestFileWalksAroundADoor and `./RUNME.sh doors`, the second to `./RUNME.sh check`
the approach adds no config key

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/owns

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

src/owns/tests_tree_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The case fails once for each walk `./RUNME.sh doors` lists in a test file, and on no other line. Most walks are disk fixtures through os, then wall-clock waits. The marked lines in the guard's own tree cases already pass, so the marker reads as the approach expects.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the first done_when line meets TestNoTestFileWalksAroundADoor, red on its own assertion, and the second meets `./RUNME.sh check`, which tests-green answers
the case reads source alone, and every door the moves reach holds a fake: files.NewFakeDisk, the root's fake disk and runner, qtest's fake clock, and src/doors/fake

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- quack-row-names-its-contracts: the door-audit row of spec/design_output/doors.md for the box and check doors of quack names none under contract suite, while src/quack/owns.yaml names src/quack/box_doors_contract_test.go, src/quack/ending_contract_test.go and src/quack/ending_windows_contract_test.go under contract. The row names those three, so the chapter and the declaration say one thing.
- door-families-name-contracts-alone: the family table of spec/design_output/doors.md still names src/quack/cli_test.go, src/quack/dump_test.go, src/quack/main_test.go, src/quack/placements_test.go, src/quack/io_test.go, src/index/watch_test.go, src/watcher/watcher_test.go and src/watcher/watchertest/watchertest_test.go as door tests of a real thing, and after the moves none of them reaches one. The owner tests each door against the real thing once, so each row names its contract files alone.
- watchertest-helper-meets-its-door: src/watcher/watchertest/watchertest.go carries an OutsideInDoors marker on os to make the folders a real watch hears. The last gate said to leave no marker on a fake or its helper, so the helper takes the disk door, or the file goes under the watch door's files key.

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
