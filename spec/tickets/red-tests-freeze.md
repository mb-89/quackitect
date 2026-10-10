---
kind: [[ticket]]
state: open
step: implement/change
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
      - name: draft-2
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
      - name: tests-red-2
        does: writes the tests the ask calls for
        tags: ["code", "testing"]
        needs: ["branch test"]
        input: draft-2
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
    input: ["design/draft", "design/tests-red", "design/draft-2", "design/tests-red-2"]
    evidence:
      - name: verdict
        form: verdict
        says: accept, accept with points naming a fix ticket a line, or reject with findings one a line
  - name: implement
    tags: ["code", "testing"]
    needs: ["branch test"]
    input: ["design/draft", "gate", "design/draft-2"]
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
        input: ["design/tests-red", "design/tests-red-2"]
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
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box b9ccbd72b78d · claude-code-remote
    hash_before: 121b20e28326113b29d63999dfd25b56889dbc3c
    hash_after: 121b20e28326113b29d63999dfd25b56889dbc3c
    inputs:
      - name: ask
        hash: 271bbec27388e167
        size: 1143
    def: c01ae0f2ace0cecb
  - step: design/tests-red
    hand: box b9ccbd72b78d · claude-code-remote
    hash_before: b63b6ded3a40cd12aadafe76031b517ddcdaf513
    hash_after: b63b6ded3a40cd12aadafe76031b517ddcdaf513
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/pull fails
    inputs:
      - name: design/draft
        hash: 3229149659b199fb
        size: 1686
      - name: [[spec/design_output/pull]]
        hash: 18bdfb73ec25a90a
        size: 49571
    def: 08e16d07b0de477c
  - step: gate
    hand: box b9ccbd72b78d · claude-code-remote · helper-5
    hash_before: e40961606d6ce8ce5114dd492862e5091edfd661
    hash_after: e40961606d6ce8ce5114dd492862e5091edfd661
    returns: 1
    why: the done_when line 'a pull test passes both where a reopen entry names the moved file' meets a case for tests-green alone (TestAReopenLetsTheGreenPassThrough); no case passes the final accept over a moved file a reopen names, so that half of the line stands undecided; TestAGateShowsTheReopenedRedFiles reads the reopen in the green pass's output, which reaches workAnswer through handed in pull_hand.go; no case reads it from a bare pull at accept, the path through handBack in pull_back.go a fresh reviewer takes, so an implementation printing the reopen in handed alone passes; the draft tests list names TestAnUnmovedRedFileLetsTheGreenPassThrough, which src/pull/pull_frozen_test.go does not hold
  - step: design/draft-2
    hand: box b9ccbd72b78d · claude-code-remote
    hash_before: 4b068f9e346d3e6a16420344ea64ad9cf9acffd1
    hash_after: 4b068f9e346d3e6a16420344ea64ad9cf9acffd1
    inputs:
      - name: ask
        hash: 271bbec27388e167
        size: 1143
    def: 05d09c51410ea2a3
  - step: design/tests-red-2
    hand: box b9ccbd72b78d · claude-code-remote
    hash_before: 0e73dbc53b6214c5fe6bc37e731e0f71a783be3e
    hash_after: 0e73dbc53b6214c5fe6bc37e731e0f71a783be3e
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/pull fails
    inputs:
      - name: design/draft-2
        hash: 8854276953331dae
        size: 2193
      - name: [[spec/design_output/pull]]
        hash: 18bdfb73ec25a90a
        size: 49571
    def: 9c7cd4dd4a2dadb8
  - step: gate
    hand: box b9ccbd72b78d · claude-code-remote · helper-7
    hash_before: 1f78a76639cc01538c81561f2b6ac79b489d6bda
    hash_after: c8e2b6748a424846d7f84be287f9e40606dab36a
    inputs:
      - name: design/draft
        hash: 3229149659b199fb
        size: 1686
      - name: design/tests-red
        hash: c80cd65ee2fd5eb4
        size: 671
      - name: design/draft-2
        hash: 8854276953331dae
        size: 2193
      - name: design/tests-red-2
        hash: fe01c6bf8fbc99b5
        size: 577
      - name: [[spec/design_output/pull]]
        hash: 18bdfb73ec25a90a
        size: 49571
    def: 01417e29801ecc2f
  - step: implement/change
    hand: box b9ccbd72b78d · claude-code-remote · builder
    hash_before: 6517967880c96b489b50ffcc7ddb1b3a8ddef868
    hash_after: 6517967880c96b489b50ffcc7ddb1b3a8ddef868
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
    def: f150b8c0dc20fe45
  - step: design/tests-red
    hand: the engine
    stale: [[spec/design_output/pull]]
  - step: design/tests-red-2
    hand: the engine
    stale: [[spec/design_output/pull]]
  - step: gate
    hand: the engine
    stale: [[spec/design_output/pull]]
  - step: design/tests-red
    skipped: true
    kept: 3dad4a713612b3ecbb4d8e6feeb7778ae52b5516
    why: its red tests stand as 3dad4a713 landed them, and a later leaf passed since
  - step: design/draft-2
    hand: box b9ccbd72b78d · claude-code-remote · greener
    hash_before: 4591c100e6543e7377c10ccd23d783f40c936f69
    hash_after: 4591c100e6543e7377c10ccd23d783f40c936f69
    inputs:
      - name: ask
        hash: 271bbec27388e167
        size: 1143
    def: 05d09c51410ea2a3
  - step: design/tests-red-2
    skipped: true
    kept: fa373a55832fcf68718f742babf7529ea9de3769
    why: its red tests stand as fa373a558 landed them, and a later leaf passed since
  - step: gate
    hand: box b9ccbd72b78d · claude-code-remote · helper-9
    hash_before: a192cfd7c52bf678789510ed09f41da3b2ba7591
    hash_after: a192cfd7c52bf678789510ed09f41da3b2ba7591
    inputs:
      - name: design/draft
        hash: 3229149659b199fb
        size: 1686
      - name: design/tests-red
        hash: c80cd65ee2fd5eb4
        size: 671
      - name: design/draft-2
        hash: 8854276953331dae
        size: 2193
      - name: design/tests-red-2
        hash: fe01c6bf8fbc99b5
        size: 577
      - name: [[spec/design_output/pull]]
        hash: 3ce642ed632fb96f
        size: 49558
    def: 01417e29801ecc2f
group: red-freezes-and-stalls-show
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
<!-- view, as text: the view the owner reads the change in and the number there, in the owner's words, or none -->
<!-- from, as text: handover where the ask comes off a handover line, so the owner reads it first, or none -->

A red test keeps its meaning to the end of its ticket. Once `design/tests-red` passes, the hand at `implement/tests-green` cannot bend a red test to its code, and the gate's read of the tests still holds at accept. An honest test bug still has a way back: a `reopen` entry in the record names the file and why, and the reviewer reads it.

A hand at `tests-green` edits a red test until it passes, and the gate's verdict on that test reads a test that no longer stands. Today the engine refuses a deleted red file alone. Without the way back, a test bug stalls the chain. Clean room B saw it stall a third of its chains, on branch `experiment/cleanroom-b`.

- `./RUNME.sh branch test` runs a pull test where the pass of `design/tests-red` records the hash of every file in its `red` list
- a pull test refuses the pass of `implement/tests-green` on a red file whose hash moved since that record
- a pull test refuses the final `accept` on a red file whose hash moved
- a pull test passes both where a `reopen` entry names the moved file and says why
- a pull test shows the `reopen` entry in the input the reviewer at `accept` reads

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

For details, see [[spec/design_output/pull#red-tests-freeze]]. The pass of a red leaf writes `frozen` hashes of its red list, `handBack` refuses a pass at a green leaf or a final gate on a moved file no `reopen` row names, `--reopen "<path>: <why>"` rides the hand-back onto the pass entry, and `workAnswer` lists the reopened files at a gate.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/pull/pull_back.go handBack calls passed and gains the frozen check
- src/pull/pull_writes.go minted calls passed
- src/pull/pull.go Pull calls handBack
- src/pull/pull_back.go handBack calls workAnswer on a bare pull
- src/pull/pull_hand.go handed calls workAnswer
- src/pull/pull.go positionalOf reads takes, which gains --reopen

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/pull/pull_frozen_test.go TestARedPassFreezesItsRedFiles
- src/pull/pull_frozen_test.go TestAMovedRedFileRefusesTheGreenPass
- src/pull/pull_frozen_test.go TestAnUnmovedRedFileLetsTheGreenPassThrough
- src/pull/pull_frozen_test.go TestAReopenLetsTheGreenPassThrough
- src/pull/pull_frozen_test.go TestTheFinalAcceptRefusesAMovedRedFile
- src/pull/pull_frozen_test.go TestAGateShowsTheReopenedRedFiles

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/pull/pull_frozen.go
- src/pull/pull_frozen_test.go
- src/pull/pull_writes.go
- src/pull/pull_back.go
- src/pull/pull.go
- src/pull/pull_chapter.go
- spec/schemas/ticket.schema.yaml
- spec/design_output/pull.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file and function named stands opened: pull_kept.go, pull_writes.go, pull_back.go, pull_accept.go, pull.go
- the callers list names the callers of passed, handBack, workAnswer and positionalOf
- each done_when line meets a test in pull_frozen_test.go
- the change adds no config key

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

    ./RUNME.sh branch test src/pull/pull_frozen_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/pull/pull_frozen_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Each case fails on its own assertion: the red pass writes no frozen hash, a moved red file passes tests-green and accept, and a reopen leaves no trace in the record or at the gate. The fixture first met the ticket schema, which wants says on every evidence field and a reader for the red list.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every done_when line meets a case in src/pull/pull_frozen_test.go, each failing on its assertion
- the cases reach the disk, git and the shell through the fakes cloudPull builds, and swap the shell for a fake answering green at the accept

## draft-2

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->
<!-- the form is text -->

For details, see [[spec/design_output/pull#red-tests-freeze]]. The pass of a red leaf writes `frozen` hashes of its red list. The hand-back at a green leaf or a final gate meets a moved file refused where no `reopen` row names it. The flag `--reopen "<path>: <why>"` rides the hand-back onto the pass entry, and every gate's hand-out lists the reopened files.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- `src/pull/pull_back.go` `handBack` calls `passed` and gains the frozen check
- `src/pull/pull_writes.go` `minted` calls `passed`
- `src/pull/pull.go` `Pull` calls `handBack`
- `src/pull/pull_back.go` `handBack` calls `workAnswer` on a bare pull
- `src/pull/pull_hand.go` `handed` calls `workAnswer`
- `src/pull/pull.go` `positionalOf` reads `takes`, which gains `--reopen`

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- hash line: `src/pull/pull_frozen_test.go` `TestARedPassFreezesItsRedFiles`
- green refusal line: `src/pull/pull_frozen_test.go` `TestAMovedRedFileRefusesTheGreenPass`
- accept refusal line: `src/pull/pull_frozen_test.go` `TestTheFinalAcceptRefusesAMovedRedFile`
- reopen line, green half: `src/pull/pull_frozen_test.go` `TestAReopenLetsTheGreenPassThrough`
- reopen line, accept half: `src/pull/pull_frozen_test.go` `TestAReopenLetsTheFinalAcceptThrough`
- reviewer line: `src/pull/pull_frozen_test.go` `TestAGateShowsTheReopenedRedFiles`, read off a bare pull at accept

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- the accept half of the reopen line: `TestAReopenLetsTheFinalAcceptThrough` passes the accept over a moved file a reopen names
- the reviewer's read: `TestAGateShowsTheReopenedRedFiles` reads a bare pull at accept, the road `handBack` prints
- the unmoved case leaves the list, since the reopen cases pass the green leaf already

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/pull/pull_frozen.go
- src/pull/pull_frozen_test.go
- src/pull/pull_writes.go
- src/pull/pull_back.go
- src/pull/pull.go
- src/pull/pull_chapter.go
- spec/schemas/ticket.schema.yaml
- spec/design_output/pull.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the files the approach names stand opened, and each claim checked there
- the callers list names the callers of `passed`, `handBack`, `workAnswer` and `positionalOf`
- each done_when line names its case in the tests list
- the change adds no config key

## tests-red-2

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

    ./RUNME.sh branch test src/pull/pull_frozen_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/pull/pull_frozen_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Each case fails on its own assertion. A bare pull on a held gate prints that the leaf stands in hand, so the gate case drops the hold and reads the fresh hand-out, the one a reviewer meets. The accept with a reopen closes the ticket today and keeps no reopen.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each done_when line meets a failing case, the reopen line at both the green leaf and the accept
- the cases reach the disk, git and the shell through the fakes `cloudPull` builds

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

    ./RUNME.sh lint src/pull/pull_frozen.go src/pull/pull_writes.go src/pull/pull_back.go src/pull/pull_chapter.go src/pull/pull.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the files the draft lists, and nothing past them
- the cases reach the disk, git and the shell through the fakes `cloudPull` builds
- each function carries a pointer at [[spec/design_output/pull#red-tests-freeze]]
- the chapter in `spec/design_output/pull.md` owns the mechanism, and the schema rows point at it

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
