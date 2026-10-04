---
kind: [[ticket]]
state: open
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
group: quack-holds-a-verb-registry
step: implement/change
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 470a600bc22e · claude-code-remote
    hash_before: 1284bdec1a577adf9057b69d2746bb75ae596cf2
    hash_after: 1284bdec1a577adf9057b69d2746bb75ae596cf2
    inputs:
      - name: ask
        hash: 580ad8ec1ffd810d
        size: 816
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box 470a600bc22e · claude-code-remote
    hash_before: c11a1b55c3f9bff81a475a242681e06636d5e78c
    hash_after: c11a1b55c3f9bff81a475a242681e06636d5e78c
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/quack fails
    inputs:
      - name: design/draft
        hash: fa73b414a51abd6a
        size: 2644
    def: 08e16d07b0de477c
  - step: gate
    hand: box 470a600bc22e · claude-code-remote · helper-4
    hash_before: 0fc9d5f180f0b54e1a283b0358822f21ed02eb19
    hash_after: 0fc9d5f180f0b54e1a283b0358822f21ed02eb19
    inputs:
      - name: design/draft
        hash: fa73b414a51abd6a
        size: 2644
      - name: design/tests-red
        hash: 7f7526f6270128bf
        size: 741
    def: dc4904ab364efa10
---

# Ask

Each Go verb registers itself in its own file under `src/quack`, and `programOf` hands node only a verb no file registers.

A branch porting a verb then adds one file and touches no shared line, so the phase 11 groups land side by side with no conflict at the merge. Without it every port edits the same twin table and the same road, and parallel branches wait on each other.

- `go test ./src/quack -run TestVerbRegistry` passes, with a case where a registered verb runs in Go and an unregistered one reaches node
- the twins `ticket yours`, `retro notes` and `branch list --queue` register through the registry, and `twinVerbs` leaves `src/quack/verbs.go`
- `git diff --stat` of a port adding one registered verb names one new file under `src/quack` and no edit of `src/quack/verbs.go`
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

A new file `src/quack/registry.go` holds `registry`, a map from a verb's words to its `twin`, and `register(words, one)`, which panics at start where the same words register twice. Each Go verb calls `register` from an `init` in its own file, so a port adds one file and edits no shared line. The three twins in `src/quack/twins.go` each take an `init` beside their function. `twinVerbs` leaves `src/quack/verbs.go`, and `verbRoad` hands the road `registry`. `nodeAccept` in `src/quack/twins.go` runs a registered verb's Go answer before it reaches `programOf`, so the index's node module hands node only an unregistered verb. The road already hands a registered verb to Go: `migration.verbs` allows `new` alone (`src/modules/migration/migration.go`), and `roadOf` sends a twin to quack under `new`. Assumption: the node module runs a registered verb in Go whatever the mode, since the mode allows `new` alone and phase 11 retires node. The twins read the index over HTTP GET of values, which the server answers beside the action in flight.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/quack/verbs.go verbRoad, reads twinVerbs, then registry
- src/quack/verbs_test.go TestTheTwinsStandInShadow (line 165 and 176), reads twinVerbs, then registry
- src/quack/accepts.go accepts, calls nodeAccept
- src/quack/person_run_test.go, calls nodeAccept with an unregistered verb
- src/quack/verbs.go programDoor, calls programOf behind roadOf
- src/quack/twins.go nodeAccept, calls programOf
- src/quack/programs_test.go TestAVerbWithNoTwinRunsItsProgram, calls programOf

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/quack/registry_test.go TestVerbRegistry/a_registered_verb_runs_in_Go
- src/quack/registry_test.go TestVerbRegistry/an_unregistered_verb_reaches_node
- src/quack/registry_test.go TestVerbRegistry/the_node_module_runs_a_registered_verb_in_Go
- src/quack/registry_test.go TestVerbRegistry/a_registered_verb_failing_answers_an_error_through_the_node_module
- src/quack/registry_test.go TestVerbRegistry/the_twins_register_through_the_registry
- src/quack/registry_test.go TestVerbRegistry/a_second_registration_of_the_same_words_panics

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/quack/registry.go
- src/quack/registry_test.go
- src/quack/twins.go
- src/quack/verbs.go
- src/quack/verbs_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- opened verbs.go, twins.go, accepts.go, cli.go, migration.go, programs_test.go and verbs_test.go, and checked each claim there
- grep of twinVerbs, programOf and nodeAccept over src names every caller above
- TestVerbRegistry decides the first two done_when lines, a port's diff decides the third by registering in its own file, and ./RUNME.sh check decides the fourth

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/quack/registry_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Five subtests of TestVerbRegistry fail on their assertions over the stub register, which holds nothing. The case of an unregistered verb passes already, since the road hands it to node today; it guards that road through the change. A surprise: the node module starts node for a verb with no program, so a missing script reads as a node stack trace.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the first done_when line meets TestVerbRegistry, the second meets its twins subtest, the third the diff of a port decides, and the check decides the fourth
- the road takes fake doors through roadOver, and the node module meets a registered fake twin, so no test reaches node or the index

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- twin-reads-inside-an-action: nodeAccept runs a twin that reads the index over an HTTP GET of values while the action calling the node module stands in flight. The draft asserts the server answers that read, and no test meets the real path, since every subtest hands a fake twin. Run ticket yours through the node module against a live index once, and add a test where a value read settles beside an action.
- port-diff-stays-one-file: the third done_when line, a port adding one file and no edit of src/quack/verbs.go, meets no command. Add a check that src/quack/verbs.go and src/quack/registry.go name no verb words, or name the port diff as the checkpoint the accept step reads.

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
