---
kind: [[ticket]]
state: closed
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
step: implement/tests-green
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 23ee163eaf36 · claude-code-remote
    hash_before: 186341f580a7f62e0c61d817f051bc9746f233ed
    hash_after: 186341f580a7f62e0c61d817f051bc9746f233ed
    inputs:
      - name: ask
        hash: c15bc62210a85ef6
        size: 431
    def: c01ae0f2ace0cecb
  - step: design/tests-red
    hand: box 23ee163eaf36 · claude-code-remote
    hash_before: 93833b9ab510cea3e362c42bd278b42cb2a0604e
    hash_after: 93833b9ab510cea3e362c42bd278b42cb2a0604e
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/tickets fails
    inputs:
      - name: design/draft
        hash: 59055ecaa00ed26d
        size: 2620
    def: 08e16d07b0de477c
  - step: gate
    hand: box 1fb91bdd8469 · claude-code-remote
    hash_before: b26fb59bdcac6dace2e540e5393088ee96fad60e
    hash_after: b26fb59bdcac6dace2e540e5393088ee96fad60e
    inputs:
      - name: design/draft
        hash: 59055ecaa00ed26d
        size: 2620
      - name: design/tests-red
        hash: 1caa5ffda3b7aa95
        size: 875
    def: dc4904ab364efa10
  - step: implement/change
    hand: box 1fb91bdd8469 · claude-code-remote
    hash_before: 41ef7e1e27a3c0bffc42b8faf8a6cb91360a105d
    hash_after: 41ef7e1e27a3c0bffc42b8faf8a6cb91360a105d
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box 1fb91bdd8469 · claude-code-remote
    hash_before: 859c485b642a949226a553f4bb7c4f5bd1e22cf1
    hash_after: 859c485b642a949226a553f4bb7c4f5bd1e22cf1
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/git passes; green, src/modules/tickets passes
      - name: check
        exit: 0
        said: "   98.3  in all"
    inputs:
      - name: design/tests-red
        hash: 1caa5ffda3b7aa95
        size: 875
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

the work views read every standing branch, since the tips port stays under the bus cap as branches grow

git/tips never lands past the bus cap, so every reader of the standing branches meets none, and the port grows with each branch times every ticket

- go test ./src/modules/git/ passes a case where a tip carries only the ticket files its branch changes against trunk, and the live git/tips value lands under the cap

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

A tip carries its ticket-folder diff against trunk, and the tickets module lays it over trunk's files. (1) ticket.Tip gains Gone []string (json gone): the ticket paths trunk holds and the tip lacks. (2) git.repo.tipAt runs `git diff --name-status --no-renames <trunk> <commit> -- spec/tickets/` (two-dot, so a path it leaves out is byte-identical to trunk's), keeps paths passing ticketPath, reads A/M/T paths' text plus trunk's group copy in the one cat-file batch, and lists D paths under Gone. With no trunk ref it keeps the whole listing, as now. (3) FakeGit.Tips answers the same diff: a branch file whose text differs from trunk's or trunk lacks, and trunk's ticket files the branch lacks under Gone. (4) tickets: a helper treeOf(tip, trunk []ticket.File) []ticket.File answers trunk's files, minus Gone, with the tip's files over them, in path order. owned reads treeOf, so branchedOf and branchesOf take in.Trunk through it. A tip carrying every file reads the same as before, so callers building full tips keep their answers. Weighed: two-dot over three-dot, which drifts from the tip's own copy. Assumed: stale copies of files trunk moved after the fork ride along, bounded by drift.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/modules/git/git.go repo.Tips
- src/modules/git/git.go repo.tipAt
- src/modules/git/git.go repo.filesAt
- src/modules/git/git.go FakeGit.Tips
- src/modules/tickets/tickets.go branchedOf
- src/modules/tickets/tickets.go branchesOf
- src/modules/tickets/tickets.go owned
- src/ticket/ticket.go Tip
- .se/scripts/gitsize/main.go main

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/modules/git/git_contract_test.go gitSuite: a tip carries only the ticket files its branch changes against trunk, and a dropped one under Gone (rewritten want)
- src/modules/tickets/branches_test.go TestABranchReadsTrunkUnderItsChanges
- src/modules/git/git_contract_test.go TestTheLiveTipsLandUnderTheBusCap (contract tag, reads the checkout through New, skips where no origin work ref stands)

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/ticket/ticket.go
- src/modules/git/git.go
- src/modules/git/git_contract_test.go
- src/modules/tickets/tickets.go
- src/modules/tickets/branches_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- opened git.go Tips/tipAt/filesAt/FakeGit.Tips, tickets.go branchedOf/branchesOf/owned/merged, ticket.go Tip, wiring.yaml git.tips and tickets.tips, the contract suite and gitsize probe
- callers came from a grep for .Tips, ticket.Tip and Tip{ across src; only the tickets module reads the port
- done_when's two lines: the case is gitSuite's rewritten want, the cap is TestTheLiveTipsLandUnderTheBusCap
- the approach adds no config key

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/modules/git src/modules/tickets

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/modules/git/git_contract_test.go
- src/modules/tickets/branches_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Each fails on its own assertion: the suite answers every branch file with no Gone, the live tips carry 205077886 bytes over 32 branches against the 64 MiB cap, and the branch reads no child off trunk. Surprise: the pull judges the last output line, so a bare go test reads as no assertion, and the tree's runner prints it. The Gone field lands with the tests and its JSON round trip, so they compile and fail on the assertion.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- done_when's first half meets the suite's rewritten want on the fake and the real repo, and its second half meets TestTheLiveTipsLandUnderTheBusCap
- git reaches the fake through FakeGit and the real repo in one suite, and the tickets case reaches only the fake index

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

./RUNME.sh lint src/modules/git/git.go src/modules/tickets/tickets.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches git.go and tickets.go alone, both in the draft size list
- the change reaches git, whose FakeGit answers the same diff
- each new function and constant points at this ticket
- the deleted status stands once, and the tip-over-trunk rule once

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh test src/modules/git src/modules/tickets

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

A work branch tip now carries only the ticket files its branch adds or changes against trunk, and lists the ones it drops under Gone. The git module reads that off one two-dot diff, and its fake answers the same. The tickets module lays each tip over trunk before it reads the branch, so a reader sees the same tickets with far fewer bytes on the bus, and the live tips land under the cap.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches git.go and tickets.go alone
- the git fake answers the same diff as the real repo, in one suite
- each new function and constant points at this ticket
- the tip-over-trunk rule stands once, in treeOf

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

The red tests from tests-red prove the change:

    ./RUNME.sh test src/modules/git/git_contract_test.go src/modules/tickets/branches_test.go
