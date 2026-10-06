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
group: level-zero-smoke
step: implement/tests-green
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box a694567529c5 · claude-code-remote
    hash_before: c147f74925e7b70fbba5f10fef3672cd90266297
    hash_after: c147f74925e7b70fbba5f10fef3672cd90266297
    inputs:
      - name: ask
        hash: f2b473ba57ff3686
        size: 326
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box a694567529c5 · claude-code-remote
    hash_before: c7e91ca468d252f900122b16ec7f3a945126b549
    hash_after: c7e91ca468d252f900122b16ec7f3a945126b549
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/quack fails
    inputs:
      - name: design/draft
        hash: b9bab6ddb10cb2bd
        size: 1203
    def: 08e16d07b0de477c
  - step: gate
    hand: box a694567529c5 · claude-code-remote · helper-4
    hash_before: 02727c9fef6f94b54aad7ebd6157206707778365
    hash_after: 02727c9fef6f94b54aad7ebd6157206707778365
    inputs:
      - name: design/draft
        hash: b9bab6ddb10cb2bd
        size: 1203
      - name: design/tests-red
        hash: b9c2ed36934e28a6
        size: 581
    def: dc4904ab364efa10
  - step: implement/change
    hand: box a694567529c5 · claude-code-remote
    hash_before: 302374d50444627c5371db7eb2cea663f2c7599a
    hash_after: 5dc70d242f9a09ae310c58d56da1d136f2d741a5
    answered:
      - name: lint
        exit: 0
        said: ""
    def: f150b8c0dc20fe45
---

# Ask

A level-zero claim names the platform it ran on, and the check names the desk trial that covers Windows.

Every proof runs on Linux, and a claim about the owner's Windows desk stands unread.

- `go test ./src/quack/` passes a case where `level0Runs` on Windows names the desk trial that covers it.
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

level0Runs names the platform in every line it prints, as runtime.GOOS reads through the windows door: green names the platform it ran on, red names it beside the tree going red. On Windows the line names spec/tickets/desk-probe-reply-trial, the open trial that runs the live client on the owner's Windows desk, which no box reaches. One constant in src/quack/check.go holds that trial's name. The smoke ticket in this group later runs level zero on Windows as well, and keeps the trial line, since the smoke fakes the client.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/quack/check.go partsOf, the level0 part
- src/quack/check_test.go TestCheckReads

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/quack/check_test.go TestCheckReads/a Windows box names the desk trial covering it
- src/quack/check_test.go TestCheckReads/a green level zero names the platform it ran on

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/quack/check.go
- src/quack/check_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- level0Runs, partsOf, checkDoors.windows and the desk trial ticket stand opened, and the trial stands open
- grep finds level0Runs in check.go and check_test.go alone among the sources
- each done_when line names its go test case above, and the check line its own command

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/quack/check_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Both cases fail on their assertion: the green run prints nothing, and the Windows box names neither its platform nor the trial. checkDoors carried a windows flag, so the platform name rides in as a string now, and the fake reads linux on every runner.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each done_when go test line meets a case failing on its assertion, and the check line stays with tests-green
- the platform rides through the check's doors, and the fake names linux, so a Windows runner reads the fake and no box

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- platform-draft-names-checkdoors: the draft's size and callers lists leave out src/quack/checkdoors.go checkDoorsOf, which tests-red already changes from the windows flag to platform: runtime.GOOS, and src/quack/check_test.go TestCheckParts, whose Windows case the rename reaches; the builder names both in place
- platform-red-line-tested: the approach has the red line name the platform beside the tree going red, and no test decides it; the builder adds the platform to the existing case 'level zero going red says the tree is red', or drops that claim from the approach

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

cd src && CGO_ENABLED=0 go vet ./quack/

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change touches src/quack/check.go alone, inside the size list
the change reaches the platform and the streams through checkDoors, whose fake names linux
the comment over level0Runs links this ticket and level0-runs-on-the-door
the desk trial name stands once, in deskTrial, and the line reads it there

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

The draft's callers list also takes `src/quack/checkdoors.go` `checkDoorsOf`, which fills `platform` from `runtime.GOOS`. It also takes `src/quack/check_test.go` `TestCheckParts`, whose Windows case sets `platform`. The size list also takes `src/quack/checkdoors.go`. [[spec/tickets/platform-draft-names-checkdoors]]

The platform cases in `src/quack/check_test.go` cover the change to `level0Runs`. The red case takes the platform through [[spec/tickets/platform-red-line-tested]]. It keys on `probe smoke --working`, so it goes green at the implement step of [[spec/tickets/level0-smoke-runs-in-seconds]].

    grep -n "platform it ran on\|desk trial" src/quack/check_test.go
