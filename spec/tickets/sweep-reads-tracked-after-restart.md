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
group: examples-run-as-tests
step: gate
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 23ee163eaf36 · claude-code-remote
    hash_before: 22e632e66f618699d63e518355b1c82a2aec8b3b
    hash_after: 22e632e66f618699d63e518355b1c82a2aec8b3b
    inputs:
      - name: ask
        hash: f241581ca84384d8
        size: 425
    def: c01ae0f2ace0cecb
  - step: design/tests-red
    hand: box 23ee163eaf36 · claude-code-remote
    hash_before: 3dbf4cb9b3dbd60e2fdd0d770cee8ac987fec046
    hash_after: 3dbf4cb9b3dbd60e2fdd0d770cee8ac987fec046
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/files fails
    inputs:
      - name: design/draft
        hash: ec101ae395b95f41
        size: 1914
    def: 08e16d07b0de477c
---

# Ask

the check and the lint name every tree rule's findings, the coverage report of this group among them, after the index restarts

every tree rule stays silent on a box whose index restarted, so the coverage guard this group lands reports nothing and a broken note passes the check

- ./RUNME.sh lint, run after .se/scripts/serve-wait.sh brings the index back, names a finding saying stands in no example's interface

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

Cause, read on this box: the IO process runs every IO instance, git and watch among them, and exits on watch starts not: nats: maximum payload exceeded. The watcher's seed hands every file its folder filter lets through, and a git-ignored build binary at the root (quack, a Go executable) swells the seed's JSON past the bus cap of 64 MiB. The IO process dies at start, its restart meets the same seed, and git/tracked, git/tips, git/trunk and git/stood stay at their empty defaults, so check/sweep reads no file. Fix: a pure reader textual(body) in src/modules/files/watch.go answers whether a body holds no NUL byte. Standing and hears hand no body it refuses, and FakeWatch.Push skips one too, so the fake keeps the real watch's contract. A binary file reaches no rule, no reader and no search, so the family loses nothing a reader asks for.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/modules/files/watch.go Seeds, through Standing
- src/modules/files/watch.go watch.Changes, through hears
- src/modules/files/watch.go FakeDisk listeners, through FakeWatch.Push
- src/quack/modules.go the watch IO module start, through Seeds

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/modules/files/files_test.go TestTheSeedCommitsTheStandingTreeOnce: a binary file at the root reads empty in the family
- src/modules/files/watch_contract_test.go TestWatchKeepsItsContract, the runtime JSON case: a binary write comes back nowhere, on the fake and the real watch alike

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/modules/files/watch.go
- src/modules/files/files_test.go
- src/modules/files/watch_contract_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

opened: watch.go Standing, hears, heard, FakeWatch.Push and Seeds, io.go ioOver, procs.go spawn, and se-index io run by hand against the live bus
callers: the four places a body reaches the family stand in the callers list
done_when: the lint line stands, and the two cases name the cause under it
config keys: the approach adds none

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/modules/files/files_test.go
- src/modules/files/watch_contract_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The seed case reads files/quack holding the binary, and the contract case hears the watch hand quack, on the fake and the real watch alike. The surprise: the IO process exits whole on one instance's start, so a seed past the bus cap takes git down beside the watch. Its stderr reaches /dev/null once the index runs as a daemon, so the fault shows nowhere but the empty ports.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

done_when: the lint line meets the seed case, which fails on the binary the seed carries, and the hand reads the lint once the fix lands
fakes: the tests reach the disk and the watch, and FakeDisk and FakeWatch stand for both under one contract suite

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
