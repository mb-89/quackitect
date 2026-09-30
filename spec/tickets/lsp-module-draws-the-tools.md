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
group: lsp-door-switches-over
step: implement/change
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box d8922c5f7ed7 · claude-code-remote
    hash_before: 57d5844760b63e1dcffe1dff88ce5f8b1d9397d2
    hash_after: 57d5844760b63e1dcffe1dff88ce5f8b1d9397d2
    inputs:
      - name: ask
        hash: cd2afb18da164609
        size: 487
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d8922c5f7ed7 · claude-code-remote
    hash_before: 5145bad52e5f229351d8c11869d16444cc57bb98
    hash_after: 5145bad52e5f229351d8c11869d16444cc57bb98
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/lsp fails
    inputs:
      - name: design/draft
        hash: 9c15e28df12267fe
        size: 2649
    def: 08e16d07b0de477c
  - step: gate
    hand: box d8922c5f7ed7 · claude-code-remote · helper-4
    hash_before: ebcb7775db992cb2c47be0d8c2463acfbd54acce
    hash_after: ebcb7775db992cb2c47be0d8c2463acfbd54acce
    inputs:
      - name: design/draft
        hash: 9c15e28df12267fe
        size: 2649
      - name: design/tests-red
        hash: 199a3aa8f4a7901b
        size: 620
    def: dc4904ab364efa10
---

# Ask

The `lsp` IO module publishes the rows Vale, Biome and the code faults draw, beside the check module's sweep. Each row names its own source, the way the old server's `Outside` draws them. So the panel keeps every row once the editor starts `quack lsp`.

The switch leaves the panel with the tree's own rules alone, and a prose fault stands unseen until the lint.

- `go test ./src/modules/lsp` publishes a `vale`, a `biome` and a `tree` row off a fake runner
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

The module runs the tools the old server's `Outside` runs, and publishes their rows beside the sweep's.

| what | the change |
|---|---|
| the runs | `src/modules/lsp/tools.go` carries `Outside.Sweep`, `Outside.Over`, the Vale and Biome parsers and the tense vetoes of `src/lsp/outside.go`, over a `check.Tree` the module builds off the store's `files/` and its open buffers |
| the door | `src/modules/lsp/door.go` runs a binary and reads the survey and the code ceilings, and a case hands a runner of its own |
| an open file | a change waits the quiet span `lintQuiet` names, then Vale reads the buffer on its input and the publish carries its rows |
| a closed file | the listen runs one whole sweep, and publishes every file carrying a row, under the file address `uriOf` makes off the root |
| a disk change | a commit moving a `files/` name runs the tools over those paths, and a change to a file `toolInputs` names runs the whole sweep again. One run goes at a time |
| the rows | each keeps its source, `vale`, `biome` or `tree`, and a Vale fault draws `ValeRuns` on the config |
| the wiring | `listensLSP` in `src/quack/main.go` hands the module the runs off the door |

Weighed: a tools module writing the `check/vale` and `check/biome` names, against runs inside the `lsp` module. The module stands as an IO module already, and no other reader of those rows exists before phase 10, so the runs stay beside their one reader. Assumed: the tense reader keeps running through node until Node leaves.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/quack/main.go listensLSP
- src/modules/lsp/lsp.go New, Handle, Republish, publishes, Listen
- src/modules/lsp/lsp_test.go every case building a Server

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/modules/lsp/tools_test.go TestAValeRowPublishesUnderItsSource
- src/modules/lsp/tools_test.go TestABiomeRowPublishesUnderItsSource
- src/modules/lsp/tools_test.go TestACodeFaultPublishesUnderTree
- src/modules/lsp/tools_test.go TestAClosedFileDrawsItsRowsAtTheListen
- src/modules/lsp/tools_test.go TestTheTenseReaderDropsAPastRow
- src/modules/lsp/tools_test.go TestAValeFaultDrawsValeRuns

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/modules/lsp/tools.go
- src/modules/lsp/door.go
- src/modules/lsp/lsp.go
- src/modules/lsp/tools_test.go
- src/quack/main.go
- spec/design_output/lsp.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- src/lsp/outside.go, src/modules/lsp/lsp.go, src/modules/check/export.go and listensLSP stand opened, and the exports the runs need stand in export.go
- the callers list names every caller of New, Listen and the publish, off a git grep
- the Vale, Biome and tree lines meet their three cases, and the check line meets ./RUNME.sh check

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/modules/lsp/tools_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/modules/lsp/tools_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Each of the six cases fails on its own assertion: every publish comes back empty, and the tense case sees no run at all. The stubs give the cases a shape to compile against. The fixture marker tripped the exemption rule in the test file itself, so the literal stands split in two.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the Vale, Biome and tree lines each meet a case failing on its assertion, and the check line meets ./RUNME.sh check at the build
- the one door the cases reach, the tool runner, takes the fake in tools_test.go

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept. The approach ports the old Outside runs into the module, and each done_when line meets its decider. The Vale, Biome and tree lines meet their own red cases, and the check line meets `./RUNME.sh check` at the build. Every case fails on its own assertion. The gate fixed the Vale fixtures in place: they named a `Voice` style the port never strips, so the Vale and closed-file cases wanted a code the port cannot draw. They now name `VoiceVale`, the style the tree holds, and the tense case now decides the drop.

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
