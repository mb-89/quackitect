---
kind: [[ticket]]
state: closed
step: implement/tests-green
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
group: lsp-door-lands-in-shadow
record:
  - step: design/draft
    hand: box 5c8055bbc025 · claude-code-remote
    hash_before: daa6e9463d6beefdfe9a9b5fa42ec6443cfbf78f
    hash_after: daa6e9463d6beefdfe9a9b5fa42ec6443cfbf78f
    inputs:
      - name: ask
        hash: ed1f5fec9ced9579
        size: 308
    def: 71651f49796eeda4
  - step: design/tests-red
    hand: box 5c8055bbc025 · claude-code-remote
    hash_before: bb83998dbb6d53378c1c42488e41321db4428214
    hash_after: bb83998dbb6d53378c1c42488e41321db4428214
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/check fails
    inputs:
      - name: design/draft
        hash: 5c34c24b4d80a416
        size: 1724
      - name: [[spec/design_output/model]]
        hash: 3e2cd8b099700681
        size: 74868
      - name: [[spec/tickets/the-lsp-door-lands]]
        hash: 9077ecae87856252
        size: 5609
    def: 08e16d07b0de477c
  - step: gate
    hand: box d856596c7410d · claude-code-remote
    hash_before: 9448fdfc1a4feeb2413bf51e913142733d68d3a4
    hash_after: b95ad82f84846c952bf0b7039f4e92a328aca6c8
    inputs:
      - name: design/draft
        hash: 5c34c24b4d80a416
        size: 1724
      - name: design/tests-red
        hash: 784c865b5c7ba256
        size: 661
      - name: [[spec/design_output/model]]
        hash: 3e2cd8b099700681
        size: 74868
      - name: [[spec/tickets/the-lsp-door-lands]]
        hash: 9077ecae87856252
        size: 5609
    def: dc4904ab364efa10
  - step: implement/change
    hand: box d856596c7410d · claude-code-remote
    hash_before: dc036d9918b7012b492fd82b059c5f3376923b21
    hash_after: dc036d9918b7012b492fd82b059c5f3376923b21
    answered:
      - name: lint
        exit: 0
        said: ""
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box d856596c7410d · claude-code-remote
    hash_before: 4da2e691a42af58b2a7002b84cbdbde6b591ae0c
    hash_after: 4da2e691a42af58b2a7002b84cbdbde6b591ae0c
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/check passes
      - name: check
        exit: 0
        said: "spec/tickets/vale-ls-windows-trial.md:41:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: design/tests-red
        hash: 784c865b5c7ba256
        size: 661
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

A `buffers/` input the `lsp` IO module writes carries unsaved editor text, and a check reads the buffer where one stands open.

The editor checks what a person types, before a save.

- `go test ./...` from the root passes
- a case opens a fake buffer and reads the finding off it
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

The check module's `sweep` takes a second input, `buffers/<path...>`, optional, each value the unsaved text of one path. Before it sweeps, the module lays every buffer over its file with `Tree.Holds`, the overlay the LSP already keeps for an open editor. So a check reads the buffer where one stands open, and the file otherwise, as [[spec/design_output/model#the-topics-and-their-writers]] says.

| the part | what it does |
|---|---|
| `src/modules/check/sweep.go`, the input struct | gains `Buffers map[string]string` under `buffers/<path...>,optional` |
| the sweep | calls `Holds` for each buffer before `Sweep`, so the rules read one overlay on both paths |
| a buffer over a path the files lack | adds no path, as `Holds` keeps it on the LSP side |

The `lsp` IO module writes the name, and [[spec/tickets/the-lsp-door-lands]] adds the writer and its wire. Until then the input stands optional, and the index takes a reader of a name nobody writes.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/modules/check/sweep.go: the sweep's input and its run
- src/modules/check/tree.go: Tree.Holds, which the sweep calls
- src/lsp/lsp.go: didOpen and didChange, which call Holds today and keep calling it

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/modules/check/buffers_test.go: TestABufferStandsOverItsFile
- src/modules/check/buffers_test.go: TestAPathWithNoBufferReadsItsFile

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file named stands opened: tree.go for Holds and Paths, lsp.go for the calls, the model note for the topic
- the callers list names the sweep, the overlay it calls, and the LSP's own calls into the same overlay
- go test ./... meets both cases, the fake buffer case meets TestABufferStandsOverItsFile, and the check runs over the module

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/modules/check

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/modules/check/buffers_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Both cases fail on their own assertion, since the sweep stands nowhere yet and reads an empty list. The seed takes a `buffers/` name no registration declares, so the fake index holds a name before its reader: the reader lands with `lsp-rules-move-to-check`, and these cases turn green on its sweep plus the overlay.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every done_when line meets a red case: the fake buffer case is `TestABufferStandsOverItsFile`, and go test and the check run over the module
- the tests reach no door: the fake index takes the files and the buffers as seeds

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

go vet ./src/modules/check

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches `sweep.go` and the case alone
- the change reaches no door, and the fake index takes the buffers as seeds
- a comment beside the loop names the overlay the approach lays
- the port name stands once, in `sweep.go`

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh test src/modules/check

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The check module sweep takes a second input, `buffers/<path...>`, optional, each value the unsaved text of one path. Before it sweeps, it lays each buffer over its file with `Tree.Holds`, the overlay the LSP keeps for an open editor. So a rule reads the buffer where one stands open, and the file otherwise. A buffer over a path the files lack adds no path. The index refuses an in-port no wire reaches, optional or not, so the wiring binds the buffers to their built-in value until the next ticket lands the writer.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches `sweep.go`, the case, and one wire
- the change reaches no door, and the fake index takes the buffers as seeds
- a comment beside the loop names the overlay the approach lays
- the port name stands once, in `sweep.go`

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

The draft's third caller reads wrong: the LSP calls `Holds` from `draws` in `src/lsp/panel.go`, on an open and a change, and `src/lsp/lsp.go` calls it nowhere.
