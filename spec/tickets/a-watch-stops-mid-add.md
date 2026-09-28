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
group: the-watches-close-cleanly
step: gate
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box d81e857fa7fb · claude-code-remote
    hash_before: 14b78009f5f7443f4b928f4eeda37787ec4b92bc
    hash_after: 14b78009f5f7443f4b928f4eeda37787ec4b92bc
    inputs:
      - name: ask
        hash: 73f34d9bc60b7e39
        size: 233
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d81e857fa7fb · claude-code-remote
    hash_before: 711340a3069b4dbf15ca31f205a61e2d075d7448
    hash_after: 711340a3069b4dbf15ca31f205a61e2d075d7448
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/watcher fails
    inputs:
      - name: design/draft
        hash: 05ab375eb6284c9e
        size: 1847
    def: 08e16d07b0de477c
---

# Ask

The watch in src/modules/files/watch.go and the one in src/index/watch.go hand a stop back while their events goroutine adds a folder. Done when a test stops each watch while folders keep appearing, under -race, and the stop returns.

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

A new package src/watcher owns the loop both watches share. One goroutine drains the fsnotify Events and Errors into a queue, so the reader never blocks on a send. A second goroutine hands each queued event to the hear function, which adds folders through Watcher.Add. Add and Close take one mutex, and Close sets a closed flag under it before it closes the fsnotify watch, so no Add waits on a reply the reader drops. Close then waits on both goroutines. The loop reads the watch through a seam, so a test hands a fake with the Windows timing: Add waits on a reply, the reader picks done or input at random, and the event send blocks. src/modules/files/watch.go and src/index/watch.go run on the loop, and door.go hands index its Touched method.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/quack/main.go: files.Seeds, over files.NewWatch
src/index/door.go: open, calling watches and closing the watch in its stop
src/index/index_test.go: the two tests calling folders

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

src/watcher/watcher_test.go TestAStopReturnsWhileTheHearAdds
src/watcher/watcher_test.go TestAStopReturnsOverTheRealWatch
src/modules/files/watch_stop_test.go TestAStopReturnsWhileFoldersAppear
src/index/watch_test.go TestTheIndexWatchStopsWhileFoldersAppear

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

src/watcher/watcher.go
src/watcher/watcher_test.go
src/modules/files/watch.go
src/modules/files/watch_stop_test.go
src/index/watch.go
src/index/watch_test.go
src/index/door.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

every file named stands opened: both watches, door.go, index_test.go, the imports cage, and backend_windows.go of fsnotify v1.10.1 for AddWith, Close, readEvents and sendEvent
the callers list names quack's Seeds, the door's open and stop, and the index tests over folders
the done_when line meets the fake test in src/watcher, and each watch meets its own test of a stop while folders appear

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

src/watcher/watcher_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

TestAStopReturnsWhileTheHearAdds fails on its own assertion within its first rounds: the fake picks the stop over the add, and the stop hangs on the loop. The files and index tests pass on Linux, because inotify answers Add without the reader; they guard the Windows job, where the hang showed.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the done_when line meets the fake test, red here, and each watch meets a stop test that CI runs on Windows
the door the tests reach, fsnotify, has a fake with its Windows timing in src/watcher/watcher_test.go

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
