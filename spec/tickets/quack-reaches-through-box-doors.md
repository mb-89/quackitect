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
group: javascript-leaves
step: gate
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box ba1101ec7b2d · claude-code-remote
    hash_before: acce97a30d11751b7ce4def77ef75429464897ca
    hash_after: acce97a30d11751b7ce4def77ef75429464897ca
    inputs:
      - name: ask
        hash: 965aca16ed5ff388
        size: 494
    def: c01ae0f2ace0cecb
  - step: design/tests-red
    hand: box ba1101ec7b2d · claude-code-remote
    hash_before: 225da84707812ee47a8d19295e33b5ef00cf993c
    hash_after: 225da84707812ee47a8d19295e33b5ef00cf993c
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/quack fails
    inputs:
      - name: design/draft
        hash: 445d03daa0755edf
        size: 2849
    def: 08e16d07b0de477c
---

# Ask

The quack verbs bundle, hook, probe clear, probe dry and stamp reach the box through boxDoors, so a test drives them on fakes and the door audit sees every reach.

Five quack verbs reach os, exec and the clock past a door under an OutsideInDoors marker, so their tests run on the real box and the audit cannot list the reach.

- go test ./src/owns/ ./src/imports/ passes with no OutsideInDoors marker left in src/quack/bundle_verb.go, hook_verb.go, probe_clear.go, probe_dry.go or stamp_verb.go

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

Each reach moves onto the doors the function already holds, and each file drops its os and net/http imports with their markers.

- bundle_verb.go: bundleVerb reads the shipped drawing through d.disk.read. drawingStamp takes the diskDoors and walks the webview through disk.list in place of filepath.WalkDir, reading each source through disk.read.
- stamp_verb.go: stampVerb reads, makes the folder and writes the stamp through d.disk, and sourceStamp reads each file through d.disk.read.
- hook_verb.go: hookHere builds its hand off quietBox(): env, input, clock.Now and disk come from the box doors, and copilotCloudAt reads the box's disk and env. hookAsk takes the read and the post it reaches, and copilotReader takes the read. The two status bounds of a 2xx reply stand as named constants, so net/http leaves.
- probe_clear.go: clearRun, grouped, unparked and keyed write through d.disk, and keyed takes the boxDoors.
- probe_dry.go: probed makes its temp tree through d.disk.makeTemp and removes it through d.disk.removeAll.

The registered twins still hand the real doors through realBoxDoors, so nothing changes on a real run. The purity baseline rows these functions hold leave through ./RUNME.sh guards --update.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/quack/bundle_verb.go bundleVerb, which calls drawingStamp
- src/quack/bundle_verb_test.go TestTheShippedDrawingNamesTheStampItsSourcesGive and TestTheDrawingStampMovesWithASourceUnderTheWebviewAndHoldsOtherwise, which call drawingStamp
- src/quack/hook_verb.go init, which calls hookHere
- src/quack/hook_verb.go copilotAnswer, which calls copilotReader
- src/quack/hook_verb_test.go copilotHooks callers, which call hookAsk
- src/quack/probe_clear.go dryRun.clearRun, which calls keyed
- src/quack/probe_dry.go probeDry and probeSmoke, which call probed

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/quack/bundle_verb_test.go TestTheSourceStampReadsFreshAfterAWriteAndStaleOnceASourceMoves, moved onto newFakeDisk so the stamp writes and reads in memory
- src/owns/tree_test.go and src/imports/walkaround_test.go, which decide the done_when line with no marker left in the five files

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/quack/bundle_verb.go
- src/quack/stamp_verb.go
- src/quack/hook_verb.go
- src/quack/probe_clear.go
- src/quack/probe_dry.go
- src/quack/bundle_verb_test.go
- src/quack/hook_verb_test.go
- src/imports/baseline/purity.txt

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- opened boxDoors and realBoxDoors in boxdoors.go, diskDoors and realDisk in boxfiles.go, newFakeDisk in box_doors_test.go, and each reach the five files hold
- the callers list names every caller of drawingStamp, hookAsk, copilotReader, hookHere, keyed and probed, off a grep of src
- the done_when line is decided by go test over src/owns and src/imports, with git grep finding no OutsideInDoors marker in the five files
- the approach adds no config key

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/quack/bundle_verb_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/quack/bundle_verb_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The stamp cases now seed and read the fake disk the box doors hand. Two cases fail on their assertions: a move in an imported package reads fresh, since the verb hashes the real disk, and no stamp stands beside the binary on the fake disk, since the verb writes the real one. Nothing surprised me: the bundle and stamp cases already held fake doors, and only their seeding reached the real disk.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the done_when line meets go test over src/owns and src/imports with the markers gone, and these cases fail until the verbs read through the doors
- the tests reach the disk and the runner, and both have fakes: newFakeDisk and fakeRunner

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
