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
group: edits-and-files-hold
step: implement/change
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box a5167492d95e · claude-code-remote
    hash_before: e1c69bd0cf28165a6c9a726eafcac2fb2061451e
    hash_after: e1c69bd0cf28165a6c9a726eafcac2fb2061451e
    inputs:
      - name: ask
        hash: 06a035779e5c678b
        size: 646
    def: c01ae0f2ace0cecb
  - step: design/tests-red
    hand: box a5167492d95e · claude-code-remote
    hash_before: 7062c665034be3a5a6b9c637449b53b5b8c63747
    hash_after: 7062c665034be3a5a6b9c637449b53b5b8c63747
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/files fails
    inputs:
      - name: design/draft
        hash: 9502fdb7652648e5
        size: 1846
    def: 08e16d07b0de477c
  - step: gate
    hand: box a5167492d95e · claude-code-remote · helper-8
    hash_before: 29c5ce35857d1cc76abb59928e3f9d9ef89883dd
    hash_after: 29c5ce35857d1cc76abb59928e3f9d9ef89883dd
    inputs:
      - name: design/draft
        hash: 9502fdb7652648e5
        size: 1846
      - name: design/tests-red
        hash: 1d059c372b05e12d
        size: 755
    def: dc4904ab364efa10
---

# Ask

The files family follows a folder that appears, moves in, moves out, or is a named folder created after the watch starts.

Files in a new or moved-in folder never reach the files family, files under a moved-out folder stay as ghosts, and a late `.se/.log` goes unwatched until the index restarts.

- `./RUNME.sh branch test src/modules/files` passes a case where a folder holding a file moves into the root and the file is handed
- the same suite passes a case where a folder holding a file moves out and the file is handed gone
- the same suite passes a case where `.se/.log` is created after the start and a write under it is handed

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

The real watch keeps one record of every file it meets, beside the known map. adds walks a folder by entered, the rule Standing walks by, so a named folder under the private one joins the watch when it appears, and its own named folder below it joins too. The start loop adding the named folders by hand then goes, since adds covers them. adds records every heard file it meets, and where it walks a folder that appears after the start, it hands each file's text as hears does. That covers a folder made with files already in it, and a folder moved in from outside. A remove or a rename hands gone for the path and for every recorded file under it, so a folder moved out leaves no ghost. adds and hears take an interface holding Add, which the watcher satisfies, so a case records what joins the watch. The record and the known map stand behind one lock, since the start's walk and the watcher's loop both reach them.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/modules/files/watch.go watch.Changes, through adds and hears
- src/modules/files/watch.go Start and Seeds, through Changes

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/modules/files/watch_folders_test.go, the case where a folder holding a file moves in and the file is handed
- src/modules/files/watch_folders_test.go, the case where a folder holding a file moves out and the file is handed gone
- src/modules/files/watch_folders_test.go, the case where .se/.log appears after the start, joins the watch, and its file is handed

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/modules/files/watch.go
- src/modules/files/watch_folders_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- opened: Changes, adds, hears, heard, entered and Standing stand as the approach reads them
- callers: Changes is the one caller of adds and hears, and Start and Seeds reach Changes
- done_when: the three cases decide the three lines
- config: the approach adds no key

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/modules/files

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/modules/files/watch_folders_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

All three cases fail on their own assertions. A folder moved in hands nothing, a folder moved out hands gone for the folder alone, and a log folder made after the start joins no watch and hands nothing. The seam lands with today's behavior: adds and hears take an interface holding Add and one held state, and adds takes a hand it leaves unused. The cases hand hears the events the watcher delivers, so each reads at once and waits on nothing.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- done_when: each line meets its own case, red today
- doors: the cases run the real watch over a temp root through the real disk, with a record standing in for the watcher's Add

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

pass
- the lock: watcher.hears delivers events on its own goroutine while Changes runs its start walk, so one lock holds both, and adds takes no lock of its own since hears already holds it
- moved-out prefix: match recorded files under rel plus a slash, so a sibling such as gone2 is not handed gone, and drop those entries from the record and from known
- the record grows on the start walk: adds with a nil hand only records files, and with a hand it records them and hands them
- the named loop in Changes goes, as the draft says: a named folder standing at start joins through adds, and one made later joins through hears

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
