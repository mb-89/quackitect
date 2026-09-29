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
group: quack-verbs-land-in-shadow
depends_on: ["runme-hands-verbs-to-quack"]
record:
  - step: design/draft
    hand: box d8509c02d5db · claude-code-remote
    hash_before: d7ad1e9b0ce0e56843f3fd265b778a3108d6de2a
    hash_after: d7ad1e9b0ce0e56843f3fd265b778a3108d6de2a
    inputs:
      - name: ask
        hash: 7566b997b4508ad5
        size: 302
    def: 71651f49796eeda4
  - step: design/tests-red
    hand: box d8509c02d5db · claude-code-remote
    hash_before: 63ff59e85fd106c28c1da3717289587485b737c7
    hash_after: 63ff59e85fd106c28c1da3717289587485b737c7
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/verbs fails
    inputs:
      - name: design/draft
        hash: 5d91f54bb2d59460
        size: 2602
    def: 08e16d07b0de477c
  - step: gate
    hand: box d8509c02d5db · claude-code-remote · helper-3
    hash_before: 7ae8214fc269f591d863203092058fd0e03aaef7
    hash_after: 7ae8214fc269f591d863203092058fd0e03aaef7
    inputs:
      - name: design/draft
        hash: 5d91f54bb2d59460
        size: 2602
      - name: design/tests-red
        hash: 5afed80b58640373
        size: 691
    def: dc4904ab364efa10
---

# Ask

The `vehicle` and `stub` verbs become actions answering within the wait their caller sets, in shadow against `cli.js`.

Every verb then answers through the index.

- `go test ./...` from the root passes
- `./RUNME.sh log --kind shadow` names each answer the two disagree on
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

The `vehicle` and `stub` verbs stand as actions through `verbs.Topic`, the module type `ticket-verbs-become-actions` lays down. Each runs through the `node` module over `cli.js`, and none takes a twin.

| what changes | where it stands | what it does |
|---|---|---|
| the verbs | a new `src/modules/verbs/vehicle.go`, `VehicleVerbs` and `StubVerbs` | lists the verbs `theVehicle` and `theStub` in `src/scripts/cli.js` answer: here, produce, into, attach, detach and register, then into |
| the actions | `Topic` in `src/modules/verbs/verbs.go` | registers each verb with `q.Writes` and no `q.Deadline`, as the retro topic does |
| the wiring | `spec/wiring.yaml` and `modules` in `src/quack/main.go` | loads the instances `vehicle` and `stub` |
| the road | `twinVerbs` in `src/quack/verbs.go` | takes no entry, so shadow runs `cli.js` alone and writes no row |

What I weigh: every verb reads or writes outside the tree the index watches. The register stands under the home folder, `produce` and `stub` write a new folder, `stub` runs git, and `here` writes the identity file where it stands absent. A twin over the index answers none of them, so a shadow row would name a gap in the index, and no fault of either road. The native ports belong to `quack-verbs-switch-over`, where a line under Discussion names them.

What I assume: `Topic` and `nodeAccept` land under `ticket-verbs-become-actions` first. The shadow line holds where the road writes a row for a twin that disagrees and none for a verb without one.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/quack/main.go: modules, which loads the vehicle and stub instances
- spec/wiring.yaml: the instances, which gain vehicle and stub
- src/modules/verbs/verbs.go: Topic, which each verb reaches
- src/quack/twins.go: nodeAccept, which runs each action through cli.js
- src/scripts/cli.js: theVehicle and theStub, which the node module runs and this ticket leaves unchanged

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/modules/verbs/verbs_test.go: TestEveryVehicleVerbStandsAsAnAction
- src/modules/verbs/verbs_test.go: TestTheStubTopicStandsAsOneAction
- src/quack/twins_test.go: TestTheWiringLoadsTheVehicleAndStubTopics
- src/quack/verbs_test.go: TestAVerbWithNoTwinWritesNoShadowRow

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- cli.js, vehicle.js, verbs.go, twins.go, verbs.go under quack, main.go and the wiring stand opened, and each claim checked there
- the callers list names the root, the wiring, the topic, the node module and the engine it runs
- go test from the root meets every Go case, the shadow line meets the road case with no twin, and the check meets the check verb

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/modules/verbs/verbs_test.go src/quack/twins_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/modules/verbs/verbs_test.go
- src/quack/twins_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The vehicle and stub verb lists stand empty, and the wiring loads neither topic. Each fails on its own assertion. The road case with no twin passes already, and guards the twin table from here on. What surprises: vehicle here writes the identity file, so even the plainest verb writes.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- go test meets every new Go case, the shadow line meets the road case with no twin, and the check meets the check verb
- the topic and wiring cases run over a fresh catalog, and the road case runs over the fake road

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- vehicle-stub-native-ports: the draft says a Discussion line on quack-verbs-switch-over names the native ports of theVehicle and theStub, and that ticket holds none; its ask takes cli.js out of the tree, which these actions run through, so a ticket names the ports
- vehicle-cases-own-files: the red cases share src/modules/verbs/verbs_test.go and src/quack/twins_test.go with work-verbs-become-actions, so tests-green moves them into files of their own before it turns green

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
