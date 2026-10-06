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
group: engine-verbs-hold
step: design/tests-red
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 57a5a484096e · claude-code-remote
    hash_before: 878ca7e20145adfd5655dda8dc72134d298f0206
    hash_after: 878ca7e20145adfd5655dda8dc72134d298f0206
    inputs:
      - name: ask
        hash: 9c802087afbe9acf
        size: 496
    def: 7883b3d10633c780
---

# Ask

A finished branch opens its pull request with auto-merge on in the same call, so no pushed branch stands without one.

A box pushes and leaves, or meets the limit, and its branch waits with no pull request until a hand opens one.

- `go test ./src/branches/` passes a case where `branch done` opens the pull request with auto-merge on through its door.
- `go test ./src/branches/` passes a case where the dispatch opens a pull request for a done branch that has none.
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

One function opens a pull request with auto-merge on, and both roads call it. pulled in src/branches/dispatch_fire.go splits into a new pullOpens(send Send, branch, title, body string, out *pullRow) int. pullOpens holds the list, the open and the auto-merge mutation that pulled holds today, on PULL_TOKEN through hubOf. pulled keeps its write-branch guard and calls pullOpens for the write branch.

Done: Doors in src/branches/doors.go takes a field Send Send. branchDoors in src/quack/branch.go sets it to httpSend, the send door src/quack/dispatch.go holds. leaves in src/branches/done.go calls pullOpens for work/<group> right after the push. Where pullOpens answers opened or standing, done prints the pull request's address. Where the run holds no token or the hub refuses, done prints the reason and the existing line naming the work skill, and still answers codeOK. The push stands, and the dispatch picks the branch up on its next run.

Dispatch: dispatchPlan in src/branches/dispatch.go takes Done []string, every work branch planned() reads at done. fire calls pullOpens once per branch in plan.Done, after the write branch, and fireRow gathers each answer under Hands []pullRow. pullRow takes a Branch field, so fireLines prints one row a branch. A branch whose pull request stands open reads standing, and the hub sees no second POST.

The owner's question is decided here: a box with no token keeps done green and leaves the pull request to the dispatch, so no new secret is asked.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/branches/dispatch_fire.go (*Doors).fire, which calls pulled and then pullOpens a done branch
src/branches/dispatch.go Dispatch, which calls planned and fire
src/branches/done.go finish, which calls leaves
src/branches/branch.go the done row of the verb table, which runs finish
src/quack/branch.go branchVerb, through branchDoors
src/quack/dispatch.go dispatchVerb, through branchDoors
src/quack/cloud.go the cloud verb, through branchDoors

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

src/branches/port_c_done_test.go TestPCDoneOpensThePullRequestWithAutoMergeThroughItsDoor
src/branches/port_c_done_test.go TestPCDoneWithNoTokenNamesTheWorkSkillAndLeaves
src/branches/dispatch_fire_test.go TestDispatchOpensAPullRequestForADoneBranchHoldingNone
src/branches/dispatch_fire_test.go TestDispatchOpensNoSecondPullRequestForADoneBranch

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

src/branches/dispatch_fire.go
src/branches/dispatch.go
src/branches/done.go
src/branches/doors.go
src/quack/branch.go
src/branches/port_c_done_test.go
src/branches/dispatch_fire_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

Opened done.go (finish, leaves), dispatch_fire.go (fire, pulled, hubOf, sent, fireLines, autoMerge), dispatch.go (planned, Dispatch, carried, dispatchPlan), doors.go (Doors), branch.go (table), quack/branch.go (branchVerb, branchDoors), quack/dispatch.go (dispatchVerb, httpSend), dispatch_fire_test.go (dfHub, dfEnv, dfFired), port_c_done_test.go (TestPCDoneClosesAFinishedGroup) and .claude/skills/work/SKILL.md.
Callers came from greps for pulled, fire, planned, leaves, finish and branchDoors, and a grep for .planned( and branchDoors( confirms the rest.
The first done_when line meets TestPCDoneOpensThePullRequestWithAutoMergeThroughItsDoor, the second meets TestDispatchOpensAPullRequestForADoneBranchHoldingNone, both under go test ./src/branches/; ./RUNME.sh check stands as its own command.

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->

<!-- the form is list -->

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

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
