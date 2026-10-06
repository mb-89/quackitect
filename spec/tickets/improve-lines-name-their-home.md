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
group: retro-and-coordinator
step: implement/tests-green
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 8c9d6ebe7819 · claude-code-remote
    hash_before: 0a50b997caaabb4d087f9e66f1724c4388274c0c
    hash_after: 0a50b997caaabb4d087f9e66f1724c4388274c0c
    inputs:
      - name: ask
        hash: 40c833ee214a778b
        size: 341
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box 8c9d6ebe7819 · claude-code-remote
    hash_before: b4a64b1a54af1aff947b322bc6665a24cb1d3285
    hash_after: b4a64b1a54af1aff947b322bc6665a24cb1d3285
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/pull fails
    inputs:
      - name: design/draft
        hash: 2362b656d120e1b4
        size: 1779
    def: 08e16d07b0de477c
  - step: gate
    hand: box 2e87e70adc83 · claude-code-remote
    hash_before: 0ab8b466e8e601b449bdddc4cc04ea676778f9c0
    hash_after: 0ab8b466e8e601b449bdddc4cc04ea676778f9c0
    inputs:
      - name: design/draft
        hash: 2362b656d120e1b4
        size: 1779
      - name: design/tests-red
        hash: f823972b459c1de0
        size: 501
    def: dc4904ab364efa10
  - step: implement/change
    hand: box 2e87e70adc83 · claude-code-remote
    hash_before: 42f6cf5f469472b16c25224171d7b43d6df15c97
    hash_after: 42f6cf5f469472b16c25224171d7b43d6df15c97
    answered:
      - name: lint
        exit: 0
        said: "spec/design_output/pull.md:470:179: Vocabulary: backticked stands outside the words this tree writes. Write a core word,"
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box 2e87e70adc83 · claude-code-remote
    hash_before: b3ecdc79009c3c1e32c7f45ed1e608725b407794
    hash_after: b3ecdc79009c3c1e32c7f45ed1e608725b407794
    answered:
      - name: tests
        exit: 0
        said: green, src/pull passes
      - name: check
        exit: 0
        said: "    1.6  test/contract/vale-paths.test.js a rationale reads the same by its absolute path as by its relative one"
    inputs:
      - name: design/tests-red
        hash: f823972b459c1de0
        size: 501
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

Every improve line names a path, a link or a ticket, so the next retro finds it and builds it.

Half the improve lines name no home, and the retros ask one fix three times while nobody builds it.

- `go test ./src/pull/` passes a case where the retro write refuses an improve line naming no path, link or ticket.
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

A list field takes a new evidence key, `home: true`, which the hand-back reads. `formFault` in `src/pull/pull_chapter.go` passes a list's rows to a new `homeFaults`. Where the field carries the key, it refuses each line that names no home. A home is a link resolving in the tree, a ticket in backticks standing under the tickets folder, or a backticked path whose file or folder stands. The `improve` field of the retro write in `spec/processes/group.yaml` takes the key, and its says line names the three homes. `spec/schemas/ticket.schema.yaml` admits the key on an evidence item. `spec/design_output/pull.md` gains the row under the fields and their forms. The process hash moves, so `./RUNME.sh ticket update` rewrites the tickets the route test pins, and the open group tickets read the new route on their next pull.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/pull/pull_back.go, the hand-back, through formFaults
src/pull/pull_chapter.go formFaults, which calls formFault
src/pull/pull_chapter.go formFault, which calls homeFaults and namesHome
src/branches/dispatch_write_test.go TestDispatchHashesARouteAsTheJavaScriptDoes, which pins the group route's hash

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

src/pull/pull_home_test.go TestImproveLinesNameTheirHome

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

src/pull/pull_chapter.go
src/pull/pull_home_test.go
spec/schemas/ticket.schema.yaml
spec/processes/group.yaml
spec/design_output/pull.md
spec/tickets/dispatch-verbs-run-in-go.md, through ticket update

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

pull_chapter.go formFault and inherited, pull_stale.go linkIn, the schema's evidence item and group.yaml's improve field stand opened
the callers come from a grep of formFault and formFaults over src, and of the group route's hash over the tests
the one done_when line meets TestImproveLinesNameTheirHome

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/pull/pull_home_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

src/pull/pull_home_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

A list field takes any line today, so the line naming no home and the four naming a home that stands nowhere all pass. The two subcases on homes that stand, and on an unmarked field, already hold, and guard the change against refusing too much.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the one done_when line meets TestImproveLinesNameTheirHome, red on its assertion
the test reaches the disk through FakeDisk alone

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

pass
- the hand-back runs on src/scripts/pull-chapter.js by default, since migration.verbs stays unset, so formFault there takes the same home check, with a case under test/level0
- ticket update rewrites every open ticket on the group route, the group ticket among them, and the size takes them
- a path counts as a home where its file or its parent folder stands, and a backticked span holding a space counts as none
- a case ties the improve field of spec/processes/group.yaml to the home key

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint src/pull/pull_chapter.go src/pull/pull_home_test.go src/scripts/pull-chapter.js src/scripts/pull-stale.js test/level0/pull-chapter.test.js test/level0/pull-stale.test.js spec/processes/group.yaml spec/schemas/ticket.schema.yaml spec/design_output/pull.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the draft size list, the JS twin the gate named, the tickets ticket update rewrites, and the size golden that reads pull.md at its new length
- the Go test reads through FakeDisk, and the JS cases through the fake doors of test/level0
- the home check points at the forms table of spec/design_output/pull
- the three homes stand once, in the says line of the improve field

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh branch test src/pull/pull_home_test.go

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The hand-back now refuses an improve line that names no home. A list field marked home: true takes each line only where it names a link resolving in the tree, a ticket in backticks standing under the tickets folder, or a backticked path whose file or parent folder stands, and a span holding a space counts as none. The retro write in spec/processes/group.yaml marks its improve field so, the ticket schema admits the key, and the JavaScript hand-back, the road a default box runs, carries the same check as the Go one. The route hash moved, so ticket update rewrote the open tickets on the group route.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the draft size list, the JS twin the gate named, the tickets ticket update rewrites, and the size golden that reads pull.md at its new length
- the Go test reads through FakeDisk, and the JS cases through the fake doors of test/level0
- the home check points at the forms table of spec/design_output/pull
- the three homes stand once, in the says line of the improve field

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
