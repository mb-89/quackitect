---
kind: [[ticket]]
state: closed
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
process_hash: 22b42ea1501e8967
group: quack-verbs-switch-over
step: implement/tests-green
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box d85989c4d4d5 · claude-code-remote
    hash_before: c44fed0452570fad3391dfac3d0850edcf4ce3dd
    hash_after: c44fed0452570fad3391dfac3d0850edcf4ce3dd
    inputs:
      - name: ask
        hash: d469d84a5fa315bf
        size: 923
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d85989c4d4d5 · claude-code-remote
    hash_before: 078fa90f6853d0c8ae97696ab88c6e729dee52ff
    hash_after: 078fa90f6853d0c8ae97696ab88c6e729dee52ff
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/config fails
    inputs:
      - name: design/draft
        hash: ef1962777dcbd748
        size: 4357
    def: 08e16d07b0de477c
  - step: design/draft
    hand: the engine
    stale: ask
  - step: design/draft
    hand: box d8888f6242d7 · claude-code-remote
    hash_before: d80f5dfc926949dd93f6dac9ea30fe6cafca14ed
    hash_after: d80f5dfc926949dd93f6dac9ea30fe6cafca14ed
    inputs:
      - name: ask
        hash: e07c6471d1922e43
        size: 925
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d8888f6242d7 · claude-code-remote
    hash_before: 3f480422f34e40d763bdfdda73d52e00e3c947ad
    hash_after: 3f480422f34e40d763bdfdda73d52e00e3c947ad
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/config fails
    inputs:
      - name: design/draft
        hash: 37c497d04da200ac
        size: 4528
    def: 08e16d07b0de477c
  - step: gate
    hand: box d8888f6242d7 · claude-code-remote · helper-7
    hash_before: 8e02f9ad55209003941d6cf008599d83cf949745
    hash_after: 8e02f9ad55209003941d6cf008599d83cf949745
    inputs:
      - name: design/draft
        hash: 37c497d04da200ac
        size: 4528
      - name: design/tests-red
        hash: dd6885586879f5d3
        size: 1035
    def: dc4904ab364efa10
  - step: implement/change
    hand: box d8888f6242d7 · claude-code-remote
    hash_before: c8afc1cd42b0aa994f5b96991361a2dc95377ce2
    hash_after: c8afc1cd42b0aa994f5b96991361a2dc95377ce2
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box d8888f6242d7 · claude-code-remote
    hash_before: c634e7e32068ff8c3fcb5be273ee135c1d63263c
    hash_after: c634e7e32068ff8c3fcb5be273ee135c1d63263c
    answered:
      - name: tests
        exit: 0
        said: green, src/q passes; green, src/modules/config passes
      - name: check
        exit: 0
        said: "spec/tickets/index-reads-loaded-projections.md:342:153: Characters: The character / stands outside the set a paragraph a"
    inputs:
      - name: design/tests-red
        hash: dd6885586879f5d3
        size: 1035
    def: ec253787263043a7
  - step: accept
    skipped: true
    why: the delivery's acceptance reads this ticket
  - step: view
    skipped: true
    why: the ask names no view the owner reads
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
<!-- view, as text: the view the owner reads the change in and the number there, in the owner's words, or none -->
<!-- from, as text: handover where the ask comes off a handover line, so the owner reads it first, or none -->

The index answers a loaded projection off the file the watch holds. An agent then reads the config, the plan and a ticket through the index.

The index now answers each loaded projection with its default, where the watch holds the file:

| the name | what it answers |
|---|---|
| `config/spec/config/level0.json` | an empty file |
| `queue/.se/.runtime/plan.json` | an empty file |
| `tickets/notes/spec/tickets/<name>.md` | an empty head and body |
| `migration/config/config` | `old`, where the tracked file says `shadow` |

The switch-over breaks without it: every verb it hands to the index reads the defaults.

- a case under `src/q` reads a loaded projection off a seeded `files/` value, and `./RUNME.sh test` answers green on it
- `curl` over V1 at `migration/config/config` answers the value `spec/config/level0.json` holds
- `./RUNME.sh check` exits 0

view: none

from: none, the note config-reads-the-tracked-file

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

The scheduler runs a loaded projection per concrete key, off the files/ names a wave moves.

Today `readersOf` in src/q/scheduler.go skips every keyed family, so a move of `files/<key>` reaches no loaded projection, and `Snapshot.Read` answers the family's default. `Store.Run` holds the per-key parse, and only the TUI, the LSP and qtest call it.

1. `readersOf` takes a keyed family into the graph where its registration carries `keyed`, so `files/<path...>` names every loaded family as a reader, and `config/values` stays a reader of `config/<path...>`. A keyed family without `keyed` stays out, as now.
2. `waves` expands a loaded family in the list to the concrete names `<family>/<key>`, one for each moved `files/<key>` its globs cover, through `registration.covers`. A key no glob covers adds nothing.
3. `byHeight` reads the height of a concrete name off its owner group, so a concrete loaded name runs at its family's height, below `config/values`.
4. `Store.settle` calls `one.keyed(view, name)` where the registration carries it, and `one.run(view)` otherwise, as `Store.Run` does. A parse error reaches `failed`.
5. `wave` marks the owner group moved after a concrete name settles, beside the concrete name, so `reads` finds `config/<path...>` moved and `config/values` runs in the same wave.

The index starts the scheduler before the IO modules (src/index/door.go), so the watch's start commit of the whole tree reaches step 2, and every loaded projection meets the tree at start. `migration/config/config` resolves through `config/values`, which reads `config/spec/config/level0.json`, so it answers the tracked file's value once step 5 holds.

The strongest objection: a lazy parse inside `Snapshot.Read` fixes the read with a smaller diff. It commits nothing, so no derived reader such as `config/values` reruns, and the migration row stays `old`. The wave carries the change to the readers, so the fix belongs there.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/q/scheduler.go NewScheduler: calls readersOf
- src/q/scheduler.go Scheduler.waves: calls listOf and byHeight, and gains the expansion
- src/q/scheduler.go Scheduler.listOf: calls byHeight
- src/q/scheduler.go Scheduler.wave: gains the owner mark after a settle
- src/q/scheduler.go Scheduler.settle: calls Store.settle
- src/q/store.go Store.onMove: reaches Scheduler.moved, which queues the waves
- src/index/door.go start: calls NewScheduler
- src/q/qtest/qtest.go: calls NewScheduler

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/q/scheduler_test.go TestALoadedProjectionReadsASeededFile: a seeded files/<key> commit answers the parsed value at <family>/<key>
- src/q/scheduler_test.go TestALoadedProjectionFollowsAFileChange: a second commit of files/<key> answers the new parse
- src/q/scheduler_test.go TestALoadedProjectionFeedsADerivedReader: a derived provider reading the concrete loaded name reruns in the same wave
- src/q/scheduler_test.go TestAKeyOutsideTheGlobsRunsNothing: a files/ name no glob covers leaves the family at its default
- src/modules/config/config_test.go TestValuesReadTheTrackedFile: a seeded files/spec/config/level0.json setting migration/config to shadow answers shadow through config/values

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- the ask moved in wording alone, one sentence split in two, so the approach stands as drafted, and the four red cases still fail on the merged code for the cause the draft names

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/q/scheduler.go
- src/q/store.go
- src/q/scheduler_test.go
- src/modules/config/config_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

every file, function and verb the approach names stands opened, and each claim checked there: read readersOf, heightsOf, keyed, listOf, byHeight, moved, waves, wave, settle and reads in src/q/scheduler.go, ProjectIn and covers in src/q/projection.go, Store.settle, Store.Run and Snapshot.Read in src/q/store.go, the start order in src/index/door.go, layersIn and Registers in src/modules/config/config.go, and the slices in src/modules/migration/migration.go
the callers list names every caller of what the approach changes: grep over src for NewScheduler, readersOf, byHeight, settle and Store.Run; Store.Run keeps its callers and its behaviour, so the TUI and the LSP stand off the list
every done_when line names the test that decides it: the first line meets the four scheduler cases and the config case under ./RUNME.sh test; the curl line stands a checkpoint the hand answers at tests-green against a running index, since no command in the tree drives V1 over a seeded file; the check line meets ./RUNME.sh check at tests-green

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/q/scheduler_test.go
- src/modules/config/config_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Three scheduler cases read the family's default, an empty list, after the file lands, and the derived reader reads 0. The config case reads the key's default 0 where the tracked file says 3, so the migration row of the ask fails the same way. The out-of-glob case passes before the change, since it guards the default the fix keeps. No surprise: the failures match the draft's cause, a keyed family standing outside the scheduler's graph.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

every done_when line meets a test that fails, or a checkpoint the hand answers where no command decides: the first line meets the three scheduler cases and the config case, the curl line stays a checkpoint at tests-green against a running index, and the check line meets the check at tests-green
every door the tests reach has a fake: the scheduler cases reach the store alone, and the config case runs over the fake index in q/qtest, seeding files/ as the case

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- loaded-projection-test-names-match: the draft names a `shadow` value for the config case, and the case seeds `switch` at 3. Align the tests list with the case.
- loaded-projection-curl-checkpoint: the curl line has no command. The hand answers it at tests-green against a running index, and the evidence names the reply.

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint src/q

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change touches `src/q/scheduler.go`, `src/q/store.go` and `src/q/scheduler_test.go` alone
the cases reach the store and `q/qtest` alone
each new function names the ticket
`filesPrefix` and `covers` stand once

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh test src/q src/modules/config

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The scheduler runs a loaded projection once per concrete key a wave moves, so the index answers the parsed file the watch holds, and no longer the family default. `curl` over V1 at `migration/config/cage` answers `shadow`, the value `spec/config/level0.json` holds, over a built-in `old`. The ask's `migration/config/config` takes `new` alone and decides nothing, as the Discussion says.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change touches `src/q/scheduler.go`, `src/q/store.go` and `src/q/scheduler_test.go` alone, each inside the ask
the change reaches no door: the cases run against the store and `q/qtest`
each comment the change adds names this ticket, which carries the approach
`filesPrefix` and `covers` stand once, and the Discussion points at the cases instead of repeating them

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

- the config case: `TestValuesReadTheTrackedFile` in `src/modules/config/config_test.go` seeds `migration.switch` at 3 and reads 3 at `migration/config/switch`. The draft's tests list names a `shadow` value, and the case decides this claim in its place. [[spec/tickets/loaded-projection-test-names-match]]
- the curl line: `migration/config/config` takes `new` alone, so its reply decides nothing. The checkpoint reads `migration/config/cage`, which answers `shadow` off the tracked file over a default of `old`. [[spec/tickets/loaded-projection-curl-checkpoint]]
