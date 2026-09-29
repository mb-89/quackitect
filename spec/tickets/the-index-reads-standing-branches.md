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
step: accept
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box d857a7e738d8 · claude-code-remote
    hash_before: 9135a44e2f2a41f2fd54416269553d5424ff8538
    hash_after: 9135a44e2f2a41f2fd54416269553d5424ff8538
    inputs:
      - name: ask
        hash: b8802faa10e9f7d7
        size: 1122
      - name: [[spec/tickets/fix-verbs-shadow-yours-2]]
        hash: f1cff362e5646752
        size: 3915
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d857b1c19ed5 · claude-code-remote
    hash_before: f3b30f83fca548c861196a097be8c2f9a42a595f
    hash_after: f3b30f83fca548c861196a097be8c2f9a42a595f
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/git fails
    inputs:
      - name: design/draft
        hash: 7d1eb474d5c70bf4
        size: 3599
    def: 08e16d07b0de477c
  - step: gate
    hand: box d857b1c19ed5 · claude-code-remote
    hash_before: d7294d2b09d26290bd3321a3747c7fec4e6e6a33
    hash_after: d7294d2b09d26290bd3321a3747c7fec4e6e6a33
    inputs:
      - name: design/draft
        hash: 7d1eb474d5c70bf4
        size: 3599
      - name: design/tests-red
        hash: a7a51b4ff7583ad2
        size: 1371
    def: dc4904ab364efa10
  - step: implement/change
    hand: box d857b1c19ed5 · claude-code-remote
    hash_before: ce82f35d1f8aa4a77831fa6a22f95b338868552c
    hash_after: ce82f35d1f8aa4a77831fa6a22f95b338868552c
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box d857b1c19ed5 · claude-code-remote
    hash_before: 9f9821103ad5b158fc1800748c1c6a1688225ce2
    hash_after: 9f9821103ad5b158fc1800748c1c6a1688225ce2
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/git passes; green, src/modules/tickets passes; green, src/modules/work passes; green, src/quack passe
      - name: check
        exit: 0
        said: "spec/tickets/vale-ls-windows-trial.md:41:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: design/tests-red
        hash: a7a51b4ff7583ad2
        size: 1371
    def: ec253787263043a7
  - step: accept
    hand: box d857b1c19ed5 · claude-code-remote · helper-7
    hash_before: 26811ea0e95b1e09cbdefda716f9986b71668b84
    hash_after: 26811ea0e95b1e09cbdefda716f9986b71668b84
    answered:
      - name: design/tests-red/tests
        exit: 0
        said: green, src/modules/git passes; green, src/modules/tickets passes; green, src/modules/work passes
      - name: implement/change/lint
        exit: 0
        said: The rules pass.
      - name: implement/tests-green/tests
        exit: 0
        said: green, src/modules/git passes; green, src/modules/tickets passes; green, src/modules/work passes; green, src/quack passe
      - name: implement/tests-green/check
        exit: 0
        said: "spec/tickets/vale-ls-windows-trial.md:41:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: b8802faa10e9f7d7
        size: 1122
      - name: implement
        hash: a0c1971cb91b77a2
        size: 2488
      - name: [[spec/tickets/fix-verbs-shadow-yours-2]]
        hash: f1cff362e5646752
        size: 3915
    def: 5050b7ed72b70652
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
<!-- view, as text: the view the owner reads the change in and the number there, in the owner's words, or none -->
<!-- from, as text: handover where the ask comes off a handover line, so the owner reads it first, or none -->

The index gains a port that names the standing branches under `work/` on origin, with each branch's copy of its group ticket. The work module then draws the branch row without a state and leaves out trunk tickets naming that group, as `answerOf` in src/scripts/work-answer.js does. Gain: `ticket yours` and `branch list --queue` answer as cli.js does while a work branch stands, so the shadow log stays empty and the switch can turn on. Breaks: while a work branch stands with later trunk children, the new path draws the group closed and its children, and the shadow log names the verb again. The cause and the weighing stand on [[spec/tickets/fix-verbs-shadow-yours-2]].

- a case in src/modules/work holds a standing branch of a closed group with two later trunk children, and the queue draws the branch row with an empty state and no child
- a case holds the same tickets with no branch, and the queue draws the group and both children
- `./RUNME.sh test src/modules/work src/quack` is green
- `./RUNME.sh ticket yours` writes no row to `./RUNME.sh log --kind shadow` while a work branch stands

view: none

from: none

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

Decision: a new outbound IO module git (src/modules/git) reads what standing work/ branches carry on origin and writes it on the out-port standing; the wiring binds tickets.standing to git.standing. Weighed and refused: (a) drop trunk children of a group in the work module alone, because the standing branch copy is unread, so places and children drift from cli.js; (b) read git inside the work module, because the module reads no git and a fake could not stand in for it. The git module holds an interface Git with Standing(), a real one running git, and a FakeGit holding branches in memory, with one contract suite over both (testing rule 12 and 13), so no test needs a scratch remote the write door would refuse. A standing branch is one row of ticket.Standing: branch name, whether trunk already merged it, and the text of each ticket file under spec/tickets on its tip. The tickets module folds it into all the way ticketsIn in src/scripts/work-answer.js does: an unmerged branch speaks for its group ticket and the tickets naming that group, its copy wins over trunk by name, and each such ticket carries Branch and Here (stands in the working tree). The queue module then places rows off the same list, so places agree with cli.js. The work module draws the branch group row with an empty state, and leaves out every trunk-only ticket that is a standing branch group (merged included) or names one, as answerOf does; those tickets still take a place, as in cli.js. yoursOf prints an empty path for a ticket not standing in the working tree. Assumption: the port is read at start and again each minute of clock/minute, and merged means a tip off the first-parent line of origin/main, the rule mergedHere holds.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/modules/tickets/tickets.go: allOf, cloudOf, Registers
- src/modules/queue/places.go: placesOf reads tickets/all
- src/modules/work/rows.go: rowsOf, rowOf, yoursOf, openTasksOf
- src/quack/twins.go: the yours and queue twins read work/yours
- src/quack/main.go: the module table and wired() start the new module
- spec/wiring.yaml: the git instance and tickets.standing wire

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/modules/work/rows_test.go: TestAStandingBranchDrawsItsRowWithNoStateAndDropsTrunkChildren
- src/modules/work/rows_test.go: TestTheSameTicketsWithNoBranchDrawTheGroupAndBothChildren
- src/modules/tickets/tickets_test.go: TestAStandingBranchCopyWinsOverTrunkByName
- src/modules/tickets/tickets_test.go: TestAMergedBranchSpeaksForNothing
- src/modules/git/git_test.go: TestFakeGitAnswersStandingBranches
- src/modules/git/git_contract_test.go: the contract suite runs over FakeGit and a scratch repository
- src/quack/ticket_twins_test.go: TestTicketYoursAgreesWithACliJsRowSetWhileABranchStands

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first on a first draft

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/ticket/ticket.go
- src/modules/git/git.go
- src/modules/git/git_test.go
- src/modules/git/git_contract_test.go
- src/modules/tickets/tickets.go
- src/modules/tickets/tickets_test.go
- src/modules/queue/places.go
- src/modules/work/rows.go
- src/modules/work/rows_test.go
- src/quack/main.go
- src/quack/ticket_twins_test.go
- src/quack/testdata/tree.golden.json
- spec/wiring.yaml

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file, function and verb the approach names stands opened: answerOf, ticketsIn, ownTickets, readWork, mergedHere, allOf, cloudOf, placesOf, rowsOf, yoursOf, clock.Start and env.Start were read
- callers: every reader of tickets/all found by search, and the twins read work/yours only
- done_when: each of the four lines meets a test above, and the last meets the shadow log run by hand at the end

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/modules/git src/modules/tickets src/modules/work

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/modules/git/git_test.go
- src/modules/git/git_contract_test.go
- src/modules/tickets/branches_test.go
- src/modules/work/branches_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Each new case fails on its own assertion over stubs. The no-branch case passes already and stays as the guard.

Two findings correct the draft:

- cli.js reads a branch merged where trunk carries its group ticket closed, as `landedHere` answers. The first-parent rule of `mergedHere` plays no part. So a tip carries trunk's copy of its group ticket, and the tickets module decides merged.
- `tickets/all` also feeds the tickets topic and the retro twin. So the fold lands on a new port `tickets/branched`, which the queue and work read.

The wiring moved in this leaf, because an input no writer feeds refuses the whole catalog. Quack stands green over the stubs. The type takes the name `ticket.Tip`, since `Standing` already names a field of `ticket.Ticket`.

A branch whose ticket runs no group route reads no standing. So `branch take` refuses it by name, and the box switched onto the branch and pulled there.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every `done_when` line meets a failing test, and the shadow line is a checkpoint run by hand at `tests-green`
- the git door has a fake, and `TestGitKeepsItsContract` holds it to a real clone

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept

The approach answers the ask, with the two corrections `design/tests-red` names under seen. A red test decides each command line of `done_when`. The shadow line stays a checkpoint by hand at `tests-green`. The size list misses test files alone, which the new ports force, so no fix ticket follows.

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint src/modules/git src/modules/tickets src/modules/work src/quack src/ticket spec/wiring.yaml

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the files the draft names, plus the old test wirings the new ports force
- the git door has `FakeGit`, held to a real clone by `TestGitKeepsItsContract`
- each new function points at `spec/tickets/the-index-reads-standing-branches` or the design output it ports
- the refs and the ticket folder stand once in `src/modules/git/git.go`, and the merged rule once in `merged`

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh test src/modules/git src/modules/tickets src/modules/work src/quack

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The index now reads the work branches standing on origin, so `ticket yours` and `branch list --queue` answer as cli.js does while a branch stands.

- A new IO module `git` reads each `work/` branch on origin. It answers the ticket files on the tip and trunk's copy of the group ticket, on the port `git/tips`.
- The module reads the refs again every five seconds, and reads the files only where a ref moves.
- The tickets module folds the tips into `tickets/branched`. An unmerged branch speaks for its group and the tickets naming it, and the folders speak for the rest.
- A branch reads merged where trunk carries its group ticket closed, as cli.js reads it.
- `tickets/branches` hands the work module each branch, and the work draws one row for it with no state.
- A trunk ticket under a branch group draws no row, as in cli.js.
- The queue and the cloud read `tickets/branched`. The cloud had to, because a child on a marked group's tip alone stands on the cloud in cli.js.
- `tickets/all` stays as it stands, so the tickets topic and the retro twin read what they read before.

Both verbs ran at 19:27 against the rebuilt index while this branch and others stood, and `./RUNME.sh log --kind shadow` holds no row after it.

One gap stays outside this ask. On a work branch the new path reads the working tree, and cli.js reads trunk from origin. A ticket minted on trunk after the last sync reads apart until the next `branch sync`.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the drafted files, plus the old test wirings the new ports force
- the git door has `FakeGit`, held to a real clone by `TestGitKeepsItsContract`
- each new function points at this ticket or the design output it ports
- the refs and the ticket folder stand once in `src/modules/git/git.go`, and the merged rule once in `merged`

# accept

<!-- reads the diff since its last verdict against the ask and every prose criterion, and names what falls short as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points

- index-reads-trunk-off-origin: `answerOf` in `src/scripts/work-answer.js` reads trunk off `origin/main` and adds the working tree. The Go path reads the working tree alone. A ticket minted on trunk after the last `branch sync` draws in cli.js and not in `tickets/branched`. So the shadow log names both verbs again until the next sync.

# view

<!-- reads the change in the view the ask names -->

## seen

<!-- pass where the view shows the ask's number, or fail with what it shows -->

<!-- the form is verdict -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
