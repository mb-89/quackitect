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
group: window-verbs-run-in-go
step: design/tests-red
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 2e385b836f39 · claude-code-remote
    hash_before: 3d3c8c3eb534276d9e78c645ad70beced24260ef
    hash_after: 3d3c8c3eb534276d9e78c645ad70beced24260ef
    inputs:
      - name: ask
        hash: bbe9c1cc20d15917
        size: 750
    def: 7883b3d10633c780
---

# Ask

The verbs tui, serve, voice, vehicle and stub run in Go, each registered in its own file under `src/quack`, and their JavaScript leaves the tree.

The window, the index's start and the vehicles answer from the Go binary that already draws and serves them. Until it lands, these verbs start node, and `tui.js`, `serve.js`, `voice.js` and `vehicle*.js` stay in the tree.

- `go test ./src/quack ./src/modules/...` passes, with a case for every road the verbs' JavaScript tests cover
- `./RUNME.sh <verb>` reaches no node for each of tui, serve, voice, vehicle and stub
- `ls src/scripts/verbs` names none of tui, serve, voice, vehicle and stub
- a search of `src` names no importer of a JavaScript module this group deletes
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

Each verb gets one Go file under src/quack that registers it from an init, the way twins.go registers its twins: tui_verb.go, serve_verb.go, voice_verb.go, vehicle_verb.go and stub_verb.go. Under migration.verbs new the road hands a registered verb to its Go answer, and the node module answers a vehicle or stub action through goAnswer, so neither reaches node. Each file carries a prefix of its verb on every helper name, so a parallel group porting another verb into package main meets no name collision. The vehicle and stub verbs share the register, the identity, the roots and the pointer port, so that logic stands in a new package src/vehicle, ported from lib/vehicle.js, src/scripts/vehicle.js and src/bridge/vehicle.js. The JS of those modules stays, since the hooks, serve.js and the probes still import it. tui builds the viewer off the same source hash viewerOf writes, hands a tab to a standing window over frame.TellPort, launches the viewer holding the terminal, and prints the session log's rows where no Go builds it. serve runs quack standing and reads the hooks standing file, as detachedStart does. voice ports measure and refused off lib/voice.js. The verb files src/scripts/verbs/{tui,serve,voice,vehicle,stub}.js leave, and with them every module only they import: src/scripts/tui.js, src/scripts/voice.js, src/scripts/vehicle-verb.js, src/scripts/stub.js and src/bridge/window.js, with the JS tests over them. src/scripts/serve.js, src/scripts/vehicle.js, src/bridge/vehicle.js, lib/vehicle.js and lib/voice.js keep importers, and stay. Assumed: the Go output matches the JS output line for line, since the lens and the tests read it.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/quack/verbs.go verbRoad, through the registry
- src/quack/twins.go nodeAccept, for the vehicle and stub actions spec/wiring.yaml loads
- RUNME.sh, through quack verb
- test/contract/verb-programs.test.js RUNS, which drops the five verbs
- test/level0/tui-verb.test.js, voiceverb.test.js, stub.test.js, window-door.test.js, test/contract/stub.test.js, which leave with their modules
- test/level0/brand.test.js, which drops its stub.js case

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/quack/tui_verb_test.go: the tab argument, the plain rows, the handover to a standing window, the launch
- src/quack/serve_verb_test.go: a fresh start, a door already answering, a failing start
- src/quack/voice_verb_test.go: usage, measure missing Vale, measure over a folder, measure --transcripts, refused over days
- src/vehicle/vehicle_test.go: identity, register read and write, roots, produce, attach port, detach
- src/quack/vehicle_verb_test.go: here, produce, into, attach, detach, register
- src/quack/stub_verb_test.go: usage, beside its vehicle, no upstream, empty brand, a written stub

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/quack/tui_verb.go
- src/quack/serve_verb.go
- src/quack/voice_verb.go
- src/quack/vehicle_verb.go
- src/quack/stub_verb.go
- src/vehicle/*.go
- the matching _test.go files
- src/scripts/verbs/{tui,serve,voice,vehicle,stub}.js
- src/scripts/{tui,voice,vehicle-verb,stub}.js
- src/bridge/window.js
- test/contract/verb-programs.test.js
- the JS tests over the deleted modules

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file and function the approach names stands opened: the five verb files, tui.js, serve.js, voice.js, vehicle-verb.js, stub.js, vehicle.js, verbs.go, twins.go, registry.go, frame/door.go, tui-build.js
- the callers list names the road, the node module, RUNME.sh and every JS importer the resolver found
- each done_when line maps to a test: go test for the roads, a node-free run per verb, the ls of src/scripts/verbs, the importer search, and the check

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
