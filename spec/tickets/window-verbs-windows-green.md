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
group: window-verbs-run-in-go
step: implement/tests-green
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 1d64c60aa6ea · claude-code-remote
    hash_before: 6d880bc8c9d0d71d2ead0ba13a1047c55ecc1f2a
    hash_after: 6d880bc8c9d0d71d2ead0ba13a1047c55ecc1f2a
    inputs:
      - name: ask
        hash: 5632e30a35cc2c00
        size: 556
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box 1d64c60aa6ea · claude-code-remote
    hash_before: c2faa23f9474c6e3e9a8b6077f862846ad2aa598
    hash_after: c2faa23f9474c6e3e9a8b6077f862846ad2aa598
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/vehicle fails
    inputs:
      - name: design/draft
        hash: fc6e633495ac75f4
        size: 2057
    def: 08e16d07b0de477c
  - step: gate
    hand: box 1d64c60aa6ea · claude-code-remote · helper-4
    hash_before: 5c81a93cac61fbc70d28d7d3dfb956cffe184dd2
    hash_after: 5c81a93cac61fbc70d28d7d3dfb956cffe184dd2
    inputs:
      - name: design/draft
        hash: fc6e633495ac75f4
        size: 2057
      - name: design/tests-red
        hash: d84ad84cd90c993f
        size: 625
    def: dc4904ab364efa10
  - step: implement/change
    hand: box 1d64c60aa6ea · claude-code-remote
    hash_before: ef6ffe7372aa14ef7196b7f70db921c8167a32ec
    hash_after: ef6ffe7372aa14ef7196b7f70db921c8167a32ec
    answered:
      - name: lint
        exit: 0
        said: "src/voice/voice.go:653:43: MagicNumber: 64 carries a meaning here. Name it in the constants block at the top of this fil"
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box 1d64c60aa6ea · claude-code-remote
    hash_before: 0a455628c033bab854d70e7fabb6075621e78d54
    hash_after: 0a455628c033bab854d70e7fabb6075621e78d54
    answered:
      - name: tests
        exit: 0
        said: green, src/vehicle passes
      - name: check
        exit: 0
        said: "  103.4  in all"
    inputs:
      - name: design/tests-red
        hash: d84ad84cd90c993f
        size: 625
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

The window verbs' Go tests pass on the Windows runner, so the group's pull request turns green and merges. On a Windows box, `vehicle here`, `produce` and `register` then spell each root one way.

Without it, the Windows job of the check stays red on the voice, vehicle, stub and quack packages, and the group never merges.

- `go test ./src/quack/ ./src/vehicle/... ./src/voice/...` passes on the Windows runner of the check
- `GOOS=windows go vet ./src/quack/ ./src/vehicle/... ./src/voice/...` passes
- `./RUNME.sh check` exits 0

view: none

from: none

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

The Windows runner fails on test spellings in five places and on code in one. The code fault: Produce in src/vehicle/vehicle.go compares dest to method as strings. MethodRootFrom answers method with slashes, as methodRootFrom in the JS did, and a Windows dest carries backslashes. So into over the method itself copies onto itself, and the guard compares both slashed. The test faults: the voice fake disk in src/voice/voice_test.go keys files by slash paths, while filesUnder joins with filepath, so the fake takes either separator, as a Windows disk does. TestVoiceVerbMeasuresARealFolder writes the raw Windows root into a JSON string, so it writes the slashed root. The vehicle and stub verb tests want the method root spelled natively, and the code answers it slashed, so the wants take filepath.ToSlash. The empty-brand cases name a folder ..., which Windows refuses, so they name ---, which slugs to nothing too. The run-bit asserts read a bit Windows lacks, so a helper reads it off Windows alone and the content still asserts on every box.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/quack/vehicle_verb.go vehicleTwin, the produce and into roads, which call vehicle.Produce
- src/vehicle/vehicle_test.go and src/quack/vehicle_verb_test.go, which drive Produce

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/vehicle/vehicle_test.go TestProduceRefusesTheMethodSpelledEitherWay, a dest naming the method with backslashes refuses

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first draft

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/vehicle/vehicle.go
- src/vehicle/vehicle_test.go
- src/vehicle/stub_test.go
- src/voice/voice_test.go
- src/quack/voice_verb_test.go
- src/quack/vehicle_verb_test.go
- src/quack/stub_verb_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- opened every failing case the Windows log of run 37220535376 names, Produce, MethodRootFrom, methodRootFrom in src/scripts/vehicle.js, filesUnder and the voice fake, and read each cause there
- Produce has one caller road, the vehicle twin, and its tests stand listed
- the Windows runner of the check decides the first done_when line, GOOS=windows go vet the second, and ./RUNME.sh check the third

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/vehicle/vehicle_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/vehicle/vehicle_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

TestProduceRefusesTheMethodSpelledEitherWay fails on its own assertion on Linux too, since the guard compares the strings as spelled. The other Windows faults sit in the tests themselves, so the Windows runner shows them red and this box shows them green.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the new case meets the one code fault, and the Windows runner of the check decides the test-side ones, since this box runs no Windows
- the case reaches the real disk through OS(), whose contract suite stands in src/vehicle/disk_test.go

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- window-verbs-here-one-spelling: the approach keeps MethodRootFrom slashed and moves the test wants to filepath.ToSlash, so on Windows `vehicle here` prints the method root slashed beside a work root taken native off SE_WORK_ROOT; the ask wants each root spelled one way, so the change slashes the work root in here too, or the here case asserts both roots under one spelling

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the seven files the size names, and no other
- the change adds no door: the voice fake reads either separator as a Windows disk does, and permOf reads the real disk OS() drives
- each changed spot carries a comment naming the ticket and the cause it answers
- the slashed method root stands in MethodRootFrom alone, and the tests point at it through filepath.ToSlash

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh branch test src/vehicle/vehicle_test.go

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The window verbs ported to Go failed fourteen cases on the Windows runner. One cause sat in code: Produce compared a native dest with the slashed method root, so into over the method itself reached the copy. It now compares both slashed. The rest sat in the tests: the voice fake read slash keys alone, a case wrote a raw Windows root into JSON, the wants spelled the method root natively, two cases named a folder ... that Windows refuses, and two read a run bit Windows lacks. The Windows job of check run 37223712908 passes on commit 9122c43.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the tests touch the files the draft names, and the new Produce case stands in src/vehicle/vehicle_test.go
- the voice fake reads either separator as a Windows disk does, and permOf reads the real disk
- each changed case carries a comment naming the ticket
- the slashed root stands in MethodRootFrom alone, and every want points at it through ToSlash

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
