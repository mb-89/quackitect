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
step: gate
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box a5167492d95e · claude-code-remote
    hash_before: d8d35fc1b144fd4c530e0874c8dd90fdea019c8c
    hash_after: e9755a7fae374e58de6271f5c5c4eb6aae4ccb79
    inputs:
      - name: ask
        hash: 6f5066e5cc08f412
        size: 362
    def: c01ae0f2ace0cecb
  - step: design/tests-red
    hand: box a5167492d95e · claude-code-remote
    hash_before: 21fb177845655f51c5651067bbad0f11642a4165
    hash_after: 21fb177845655f51c5651067bbad0f11642a4165
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/git fails
    inputs:
      - name: design/draft
        hash: 42901e755d3d884e
        size: 1691
    def: 08e16d07b0de477c
---

# Ask

The added-at log parser and the cat-file batch framer each stand once in the git module, so the two readers cannot drift apart.

Two copies already disagree on unquoting and short payloads, and a fix taught to one copy misses the other.

- `./RUNME.sh branch test src/modules/git` passes with Stood and Added reading through one parser and one framer

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

One added-at parser and one batch framer stand in the git module. addedIn(said, key) reads the log of adds, newest first, and keys each path through key. Stood calls it with the path as git prints it, since its keys meet the quoted ls-tree paths of Tip and Trunk. Added calls it with unquoted, since the pull matches its keys against paths read off the disk. frames(stream) reads a cat-file --batch stream into one frame an ask, each holding its kind and its payload. It clamps a short payload and leaves a missing object empty. framed keeps the payloads of a repo read, and ShowMany keeps the blobs. headerFields and batchFields fold into one constant. The repo's own runner stays as it stands, since moving it onto proc.Runner widens the change past the finding.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/modules/git/git.go repo.Stood, through stoodIn
- src/modules/git/git.go repo reads, through framed
- src/pull/pull_hand.go the queue's added-at read, through door.Added
- src/branches/unreached.go and src/branches/stands.go, through door.ShowMany

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/modules/git/git_test.go, the case where both readers parse one log, a quoted path among it
- src/modules/git/git_test.go, the case where one framer reads a batch holding a missing object and a tree

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/modules/git/git.go
- src/modules/git/repo.go
- src/modules/git/door_refs.go
- src/modules/git/git_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- opened: Stood, stoodIn, framed, door.Added and door.ShowMany stand as the approach reads them
- callers: the grep over src lists every caller of the four, and the list carries each
- done_when: the two cases decide the one line
- config: the approach adds no key

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/modules/git

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/modules/git/git_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The case fails on its own assertion: framed reads the short payload as empty, where ShowMany keeps the two bytes the batch carries. The two framers answer one stream two ways, which is the drift the finding names. The parser copies agree on every ASCII path, so the case for them stands green and guards the move onto one parser.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- done_when: the short-payload case fails today, and the one framer turns it green
- doors: the case reads a stream held in memory, and reaches no door

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
