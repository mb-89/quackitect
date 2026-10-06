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
    hash_before: d1693b39881db6c01e6222e55891281098b8bc5f
    hash_after: d1693b39881db6c01e6222e55891281098b8bc5f
    inputs:
      - name: ask
        hash: d5fd766e4b279ef6
        size: 528
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box 238560a34a48 · claude-code-remote
    hash_before: 676ca69525637262c763d8f4c10362bb5befc272
    hash_after: 676ca69525637262c763d8f4c10362bb5befc272
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/branches fails
    inputs:
      - name: design/draft
        hash: ac503a0377c565c7
        size: 2730
    def: 08e16d07b0de477c
  - step: gate
    hand: box 238560a34a48 · claude-code-remote · helper-4
    hash_before: 6af74b5ef2e97364c6561498259449cb00608017
    hash_after: 6af74b5ef2e97364c6561498259449cb00608017
    inputs:
      - name: design/draft
        hash: ac503a0377c565c7
        size: 2730
      - name: design/tests-red
        hash: 733bb02b6ec002b3
        size: 854
    def: dc4904ab364efa10
  - step: implement/change
    hand: box 238560a34a48 · claude-code-remote
    hash_before: 3e231e3232f5344d5d2df4c4d48929ebb7acdd9f
    hash_after: 286b8d30377d81428c7632ec1e369b656e984491
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box 238560a34a48 · claude-code-remote
    hash_before: 66b0b8c4ab43a71947c710a1734d561895858d39
    hash_after: 66b0b8c4ab43a71947c710a1734d561895858d39
    answered:
      - name: tests
        exit: 0
        said: green, src/branches passes
      - name: check
        exit: 0
        said: "    1.7  test/contract/desk-start.test.js a server the proc door starts detached writes its marker after its starter exi"
    inputs:
      - name: design/tests-red
        hash: 733bb02b6ec002b3
        size: 854
    def: ec253787263043a7
  - step: accept
    skipped: true
    why: the delivery's acceptance reads this ticket
  - step: view
    skipped: true
    why: the ask names no view the owner reads
depends_on: the-fleet-verb-watches-boxes
reason: done
---

# Ask

One stored routine checks the fleet on a schedule, and a pull request event wakes the box that drives it, not the coordinator.

The coordinator types its check again as a chain of one-shot wakes that die at the limit, and spends turns on events boxes own.

- `go test ./src/branches/` passes a case where `./RUNME.sh cloud trigger` names one stored fleet routine and the prompt it carries.
- `go test ./src/branches/` passes a case where a pull request event routes to the box that holds its branch.
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

The fleet check stands as one stored routine whose prompt the tree writes once. A pull request event goes to the box its branch's record names.

- `src/branches/routine.go` holds the fleet routine's name `fleet_check` and its prompt `fleetPrompt`. The prompt runs `./RUNME.sh cloud fleet` and acts on each wake line it prints.
- The routine's id comes from the config key `cloud.fleetRoutine`, since the owner stores the routine on claude.ai and the id follows.
- `cloud trigger`, through `trigger` in `src/branches/free.go`, prints the work routine as it does now. Under it stands the fleet routine with its name, its id and its prompt. Where no id stands, it says so, and prints the prompt to store.
- `pullRouteOf(head, rows)` stands pure. It answers the session of the box that holds the head branch off the fleet rows, or nothing where no box holds it.
- `./RUNME.sh cloud route` reads the event at `GITHUB_EVENT_PATH`, or the path past the verb, and takes `pull_request.head.ref`. It prints the session that holds that branch, or says the coordinator takes it.
- A person ticket in the group stores the routine on claude.ai with the prompt the verb prints, and writes its id to the config. Done hands it loose to main.

Weighed: the config key over a constant id, since the routine does not stand yet and a constant id would name nothing. Assumed: a box holding a branch is the one its open take names, as the record ticket writes it.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/branches/branch.go: Cloud, which gains the route word
- src/branches/free.go: trigger, which prints the fleet routine
- src/quack/cloud.go: cloudVerb, which hands every word to Cloud and changes nothing

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/branches/routine_test.go: TestTriggerNamesTheStoredFleetRoutineAndItsPrompt
- src/branches/routine_test.go: TestTriggerSaysWhereNoFleetRoutineStands
- src/branches/routine_test.go: TestAPullRequestEventRoutesToTheBoxThatHoldsItsBranch
- src/branches/routine_test.go: TestAPullRequestEventOnAFreeBranchRoutesToNoBox
- src/branches/routine_test.go: TestRouteReadsTheEventFile

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/branches/routine.go
- src/branches/routine_test.go
- src/branches/free.go
- src/branches/branch.go
- spec/tickets/the-fleet-routine-stands.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- Opened `branch.go` (Cloud), `free.go` (trigger), `stands.go` (routineName, routineID) and `doors.go` (config, env, read), and checked each claim there.
- Callers: Cloud and trigger stand in the list, and `src/quack/cloud.go` reaches them unchanged.
- The first done_when line meets TestTriggerNamesTheStoredFleetRoutineAndItsPrompt, the second meets TestAPullRequestEventRoutesToTheBoxThatHoldsItsBranch, and the check line meets the command at tests-green.

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/branches/routine_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/branches/routine_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Four cases fail on their own assertion. The trigger prints the work routine alone, the route word answers the usage, and the stub routes nothing. The free-branch case passes against the stub, since an empty route is its claim. It stands as the guard that the change routes nothing past a hold.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- The first done_when line meets TestTriggerNamesTheStoredFleetRoutineAndItsPrompt. The second meets TestAPullRequestEventRoutesToTheBoxThatHoldsItsBranch and TestRouteReadsTheEventFile, and the check line meets the command at tests-green.
- The trigger and route cases reach git and the disk over a temp clone, as the package's other cases do. The config door is a function the case hands in, and the routing cases stand pure.

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- pr-events-reach-their-box: `./RUNME.sh cloud route` stands with no caller. No workflow on `pull_request` and no routine runs it, so the session it prints never gets the event, and the ask's wake lands as a lookup alone. A caller runs the verb on the event and messages the session it names.
- fleet-prompt-awaits-fleet-verb: `fleetPrompt` runs `./RUNME.sh cloud fleet`, which `Cloud` lacks until the-fleet-verb-watches-boxes lands its implement. The ticket names no `depends_on`, so the person ticket can store a routine whose verb answers the usage. The ticket gains `depends_on: the-fleet-verb-watches-boxes`, or the person ticket waits on it.

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint src/branches/routine.go src/branches/free.go src/branches/branch.go spec/config/level0.schema.json spec/tickets/the-fleet-routine-stands.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- The change touches routine.go, free.go, branch.go and the person ticket, all on the size list. It also declares cloud.fleetRoutine and fleet.idleAfter in the config schema, since the person ticket writes the id into tracked config.
- cloud route reads the event file through readFile and git through the quiet door, and the cases drive both over a temp clone.
- Each new function carries a link to this ticket.
- The routine's name, key and prompt stand once in routine.go, and the route reads the fleet rows through fleetRows.

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh branch test src/branches/routine_test.go

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The fleet check now stands as one stored routine. cloud trigger prints the work routine as before, then fleet_check with the id under cloud.fleetRoutine and the prompt it carries. Where no id stands, it prints the prompt to store. cloud route reads a pull request event and names the session of the box that holds its branch, or the coordinator where none holds it. The box itself subscribes to its pull request, as the work skill now says. The person ticket the-fleet-routine-stands carries the commands that store the routine and write its id into tracked config. The config schema declares that key and the fleet's idle span. The two keys stand in the settings catalog, and the schema, the projected config commands and the size golden regenerate off it.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- Every file touched stands on the size list, and the schema takes the two keys the verbs read.
- cloud route reads the event through readFile and git through the quiet door, and the cases drive both.
- Each new function carries a link to this ticket.
- The routine's name, key and prompt stand once in routine.go.

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
