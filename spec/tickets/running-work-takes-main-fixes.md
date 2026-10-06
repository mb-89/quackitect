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
step: gate
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 57a5a484096e · claude-code-remote
    hash_before: 880fd16ef6674b50661a3312169afd8c8f584f17
    hash_after: 880fd16ef6674b50661a3312169afd8c8f584f17
    inputs:
      - name: ask
        hash: 8b94909371973615
        size: 460
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box 57a5a484096e · claude-code-remote
    hash_before: fda9959e88c98ea038ddecd13693c97d8c9adc94
    hash_after: fda9959e88c98ea038ddecd13693c97d8c9adc94
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/pull fails
    inputs:
      - name: design/draft
        hash: 1a0ca8874b7da9b9
        size: 3433
    def: 08e16d07b0de477c
---

# Ask

A fix to the hooks or level zero reaches running boxes and open work pull requests as it lands on main.

Boxes and green pull requests run on the broken copy, and a sibling merge leaves a green pull request stuck behind a conflict.

- `go test ./src/pull/` passes a case where the pull asks a sync once main changes the cold path.
- `go test ./src/branches/` passes a case where a push to main updates every open work pull request.
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

Two roads carry a fix on main to work in flight: the pull asks a running box to sync, and a push to main updates every open work pull request.

The pull: the cold path list moves from coldPath and coldIn in src/quack/commit.go to ColdPath and ColdIn in a new src/pull/cold.go. commit.go calls pull.ColdIn, so the Go side keeps one copy beside the JavaScript owner, COLD_PATH in src/scripts/probe-cold.js. Pull in src/pull/pull.go, on a work branch and after fetched(branch), calls a new it.coldMoved(). coldMoved fetches origin main and reads git diff --name-only HEAD...origin/main through it.Git, then answers ColdIn over those paths. Where it names any path, the pull says refused, names the paths, asks ./RUNME.sh branch sync then a pull again, and answers 1. A desk on main takes no such check, because fetched fast-forwards main there.

The pull requests: Dispatch in src/branches/dispatch.go reads a --update word before its fetch, and runs a new d.updated(send) in src/branches/dispatch_fire.go alone. updated lists the open pull requests against main on PULL_TOKEN through hubOf, keeps each whose head opens on work/, and sends PUT /repos/<repo>/pulls/<number>/update-branch for each. The answers gather in a new updateRow, printed one line a branch or as JSON under --json. A refused update, such as a conflict, names its branch and reason and answers codeRed. A new workflow .github/workflows/update.yml runs ./RUNME.sh dispatch --update --json on a push to main, on PULL_TOKEN, so the hourly fire keeps its own clock.

The pull case wraps the clone git door in a fake answering the diff, and the dispatch case runs on dfHub with two routes more, so no case reaches the network.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/pull/pull.go (*It).Pulling (calls Pull)
src/quack/ticket_pull.go ticketPull (calls Pulling)
src/quack/commit.go (landingDoors).lands (calls coldIn, then pull.ColdIn)
src/quack/dispatch.go dispatchVerb (calls branches.Dispatch)
src/branches/dispatch.go Dispatch (reads --update, calls updated)

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

src/pull/pull_test.go TestPull/main_moving_the_cold_path_asks_a_sync_before_any_hand-out
src/pull/pull_test.go TestPull/main_moving_off_the_cold_path_hands_the_leaf_out
src/pull/cold_test.go TestColdInTakesAFolderEntryAndAFileEntry
src/branches/dispatch_fire_test.go TestDispatchUpdatesEveryOpenWorkPullRequest
src/branches/dispatch_fire_test.go TestDispatchUpdateNamesARefusedBranchAndAnswersRed

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

src/pull/cold.go
src/pull/cold_test.go
src/pull/pull.go
src/pull/pull_test.go
src/quack/commit.go
src/branches/dispatch.go
src/branches/dispatch_fire.go
src/branches/dispatch_fire_test.go
.github/workflows/update.yml

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

Opened pull.go (Pull, Pulling, fetched), pull_doors.go (It, Git), pull_route.go verdict words, pull_test.go (cloudPull, TestPull), quack/commit.go (coldPath, coldIn and its one caller), quack/ticket_pull.go, src/scripts/probe-cold.js COLD_PATH and coldIn, branches/dispatch.go (Dispatch), dispatch_fire.go (fire, hubOf, pulled, sent), dispatch_fire_test.go (dfHub, dfEnv), quack/dispatch.go, and .github/workflows/dispatch.yml.
Callers came from greps for .Pulling(, coldIn( and branches.Dispatch across src.
The pull done_when line meets TestPull's cold-path subtest under go test ./src/pull/; the pull-request line meets TestDispatchUpdatesEveryOpenWorkPullRequest under go test ./src/branches/; ./RUNME.sh check stands as its own command.

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/pull/cold_test.go src/pull/pull_test.go src/branches/dispatch_fire_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

src/pull/cold_test.go
src/pull/pull_test.go
src/branches/dispatch_fire_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The pull hands alpha out while main moves a hook file, and the dispatch reads --update as no word and sends no update. The cold path read answers nothing through its stub. The case where main moves a note alone passes already, and it guards the pull against a sync it needs nowhere. The dispatch cases run in a temporary folder outside any git tree, so the fetch meets no repository.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The pull line meets TestPull/main_moving_the_cold_path_asks_a_sync_before_any_hand-out, the pull request line meets TestDispatchUpdatesEveryOpenWorkPullRequest, and the check line waits for tests-green.
The pull case wraps the clone git door in mainMoves for the one diff call, and the dispatch cases run on dfHub, so no case reaches the network.

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

The pull road moves under this draft, so implement against it as it stands:

- `Dispatch` puts its `send` on `d.Send`, and the fire reads it there. Write `d.updated()`, reading `d.Send`, and take no `send` argument.
- Read the token through `d.pullToken()`, which falls back onto `GH_TOKEN`, and the hub through `d.hubOf(d.pullToken(), "PULL_TOKEN")`, as `pullOpens` does.
- Put `updated` and `updateRow` beside `pullOpens` in `src/branches/dispatch_fire.go`. For details, see [[spec/tickets/dispatch-update-collides]].
