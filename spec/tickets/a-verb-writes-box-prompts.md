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
group: the-fleet-watches-itself
step: implement/tests-green
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 238560a34a48 · claude-code-remote
    hash_before: abf770376e18cfc644da41560f97b17f44041c57
    hash_after: abf770376e18cfc644da41560f97b17f44041c57
    inputs:
      - name: ask
        hash: 7d33ff4dc7616eba
        size: 501
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box 238560a34a48 · claude-code-remote
    hash_before: 8721572abbbdb1ce50cfb6dfc7d16be36877005a
    hash_after: 8721572abbbdb1ce50cfb6dfc7d16be36877005a
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/branches fails
    inputs:
      - name: design/draft
        hash: 02f7a5a3a638d3f9
        size: 2318
    def: 08e16d07b0de477c
  - step: gate
    hand: box 238560a34a48 · claude-code-remote · helper-4
    hash_before: 877282628a5f86de2c6db79c3d3477e18ad04c74
    hash_after: 877282628a5f86de2c6db79c3d3477e18ad04c74
    inputs:
      - name: design/draft
        hash: 02f7a5a3a638d3f9
        size: 2318
      - name: design/tests-red
        hash: 31b422a6b4c97a95
        size: 832
    def: dc4904ab364efa10
  - step: implement/change
    hand: box 238560a34a48 · claude-code-remote
    hash_before: f74aaa851345a3ab379891d90cf33233ace99270
    hash_after: f74aaa851345a3ab379891d90cf33233ace99270
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
    def: f150b8c0dc20fe45
---

# Ask

Every box prompt comes from the route and the ticket, so no box starts with a rule missing or its steps out of order.

The coordinator types the prompt again at each spawn, and a typed prompt drops a rule or puts a release before a take.

- `go test ./src/branches/` passes a case where the prompt verb writes the prompt for a named group from its route.
- `go test ./src/branches/` passes a case where the prompt verb refuses a ticket name or a route that stands nowhere.
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

A new verb `./RUNME.sh cloud prompt <group>` prints the prompt a box starts with, off the group ticket and its route.

- `promptOf(group, steps, children)` in `src/branches/prompt.go` stands pure: it joins the opening line `run the work skill`, the group's name, its children, the route's steps in order, and the box rules.
- The box rules stand once, as the constant `boxRules` in `prompt.go`, in the order a box meets them: take, pull, commit and push, done, the pull request.
- The verb reads `spec/tickets/<group>.md` off the work root. It refuses, code 2, where the ticket stands nowhere, or where its `process` names no group route.
- It reads `spec/processes/<route>.yaml` off the method root, and refuses where that file stands nowhere. The route's top-level step names give the order the prompt prints.
- The children are the tickets under `spec/tickets` whose `group` names the group, in name order.
- `Cloud` in `src/branches/branch.go` runs `prompt` beside `trigger`, and its usage names it.

Weighed: the disk read over a read off `origin/main`, since the coordinator runs on a desk standing on main. Assumed: the route is the process file the ticket links, so a renamed or missing process refuses before a box starts.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/branches/branch.go: Cloud, which gains the prompt word
- src/quack/cloud.go: cloudVerb, which hands every word to Cloud and changes nothing

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/branches/prompt_test.go: TestPromptWritesTheGroupsPromptFromItsRoute
- src/branches/prompt_test.go: TestPromptRefusesATicketThatStandsNowhere
- src/branches/prompt_test.go: TestPromptRefusesARouteThatStandsNowhere
- src/branches/prompt_test.go: TestPromptRefusesATicketNamingNoGroup

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/branches/prompt.go
- src/branches/prompt_test.go
- src/branches/branch.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- Opened `src/branches/branch.go` (Cloud, the table), `src/branches/group.go` (routeOf, isGroup), `src/branches/doors.go` (read, names, methodAt) and `src/branches/guidance.go` (processFolder), and checked each claim there.
- Callers: Cloud is the one entry, and `src/quack/cloud.go` cloudVerb reaches it unchanged.
- The first done_when line meets TestPromptWritesTheGroupsPromptFromItsRoute, the second meets the two refusal tests, and the check line meets `./RUNME.sh check`.

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/branches/prompt_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/branches/prompt_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Each case fails on its own assertion: the cloud verb answers its usage, code 2, for the prompt word. The box rules constant stands in `src/branches/prompt.go` already, so the file builds and the first case reads it. The package tests run over a temp folder through the disk doors, as every case in the package does, so the prompt cases need no git.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- The first done_when line meets TestPromptWritesTheGroupsPromptFromItsRoute, and the second meets TestPromptRefusesATicketThatStandsNowhere and TestPromptRefusesARouteThatStandsNowhere. The check line meets the command at tests-green.
- The disk is the one door these cases reach, and they reach it over a temp folder, as the package's other cases do.

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept
- The approach names the children as every ticket whose group names the group, and TestPromptWritesTheGroupsPromptFromItsRoute leaves the closed child c-shut out: the builder reads open children alone.
- The route read reuses processAt in src/branches/dispatch_write.go, whose refusal `spec/processes holds no <name>.` is the line TestPromptRefusesARouteThatStandsNowhere holds, in place of a second reader of spec/processes.
- The tests list misses TestPromptRefusesNoName, which stands in src/branches/prompt_test.go and wants `cloud prompt needs a group`: the builder answers it, and the Cloud usage row names prompt beside trigger.

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint src/branches/prompt.go src/branches/branch.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- The change touches prompt.go and branch.go, both on the size list.
- The verb reads the disk through the standing doors, read, notesIn and processAt, which the cases drive over a temp folder.
- Each new function carries a link to this ticket, where the approach stands.
- The route reads through processAt and the box rules stand once in boxRules, so no reader or rule stands twice.

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
