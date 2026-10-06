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
group: unfaked-doors-take-fakes
step: gate
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box e97c7a20bbd2 · claude-code-remote
    hash_before: e2842fc2057e82dbf60f9860bf6ce47b3fca1d9b
    hash_after: 25bbd1f0a7b557d324039e1b609e6efbcc6d06aa
    inputs:
      - name: ask
        hash: 9d952661f907f30c
        size: 729
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box e97c7a20bbd2 · claude-code-remote
    hash_before: 4e6d2c07ff7ac3771bfb68871a1764536d80c1da
    hash_after: 4e6d2c07ff7ac3771bfb68871a1764536d80c1da
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/proc fails
    inputs:
      - name: design/draft
        hash: 2e87095745369753
        size: 1218
      - name: [[spec/design_output/doors]]
        hash: 468995647948509f
        size: 17322
    def: 08e16d07b0de477c
  - step: gate
    hand: box e97c7a20bbd2 · claude-code-remote · helper-4
    hash_before: 9bf1c0b28da0fdb102260dd81067da22a78f79ba
    hash_after: ea5f38b3905ce70b1ddc906ece851a4a317b5f02
    inputs:
      - name: design/draft
        hash: 2e87095745369753
        size: 1218
      - name: design/tests-red
        hash: 2a9158664f043493
        size: 860
      - name: [[spec/design_output/doors]]
        hash: 468995647948509f
        size: 17322
    def: dc4904ab364efa10
  - step: design/tests-red
    hand: the engine
    stale: [[spec/design_output/doors]]
  - step: gate
    hand: the engine
    stale: [[spec/design_output/doors]]
  - step: design/tests-red
    skipped: true
    kept: 18f9e64f61fc6c30d0b025f7a38c2b4f006ec933
    why: its red tests stand as 18f9e64f6 landed them, and a later leaf passed since
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
One design names the git door carrying writes and the process door for quack, each with its fake and its contract suite, so each move onto them reviews whole.

<!-- breaks, as text: what breaks if it is never done -->
The git the branch verbs, the quack verbs and the pull run speaks the whole command line, pushes and merges among it, and `FakeGit` holds four reads. With no design, each move builds a fake of its own, and the fakes drift apart.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- a chapter of `spec/design_output/doors.md` names the git door, its fake, its contract suite, and the commands it carries
- the same chapter names the process door for quack, its fake and its contract suite
- the chapter names, for each family row it serves, the child ticket moving its cases
- `./RUNME.sh check` stands green

<!-- view, as text: the view the owner reads the change in and the number there, in the owner's words, or none -->
none

<!-- from, as text: handover where the ask comes off a handover line, so the owner reads it first, or none -->
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

[[spec/design_output/doors#the-git-door-carries-writes]] names the git door Repo in src/modules/git with FakeRepo and its contract suite, and the process door Runner in a new src/modules/proc, grown from the lsp runner, with FakeRunner and its contract suite. The same chapter orders the four moves, the pull first and the branch verbs last. The ticket writes the design alone, so its tests are the check over the note.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- spec/tickets/pull-meets-fake-git, which reads the design
- spec/tickets/quack-repos-meet-fake-git, which reads the design
- spec/tickets/quack-spawns-meet-fake-process, which reads the design
- spec/tickets/branch-verbs-meet-fake-git, which reads the design

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- none: the design adds no code, and the check reads the note

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- spec/design_output/doors.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- src/modules/git/git.go, src/branches/doors.go, src/pull/door.go and src/modules/lsp/tools.go stand opened, and the subcommands come off a grep of each package
- the callers are the four moves, which each read the chapter
- each done_when line meets the chapter: the git door, the process door, the order of the moves, and the check green on the commit

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/proc/proc_contract_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/proc/proc_contract_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

A design adds no code, so the red test is the process door contract suite, the half of the design small enough to stand here. The real runner passes each case, and the stub fake fails each on its own assertion. The git door stays a design, and pull-meets-fake-git builds it first. A surprise: the lsp module already runs a tool process behind a Runner, so the door takes that shape, and the door lands at src/proc, since a package under src/modules registers ports.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the process door half meets the contract suite, and the git door half and the order of the moves meet a checkpoint the gate reads in the chapter
- the suite reaches a real process, and it is the one door test of a spawned process, listed in the door table

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- proc-contract-holds-the-folder: Command carries Dir and the door takes a folder, yet src/proc/proc_contract_test.go holds no case running a command in a folder, so a fake ignoring Dir passes
- proc-empty-argv-never-starts: proc.Real indexes Argv[0] and panics on an empty Argv, where the door answers NotStarted for a program that never starts
- fake-repo-absorbs-fake-git: the chapter puts FakeRepo beside FakeGit in src/modules/git and names no fate for FakeGit four reads, so the package keeps two git fakes, the drift the ask names

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
