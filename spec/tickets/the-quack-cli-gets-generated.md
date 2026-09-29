---
kind: [[ticket]]
state: open
step: design/tests-red
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
group: quack-verbs-land-in-shadow
depends_on: ["actions-answer-over-http"]
record:
  - step: design/draft
    hand: box d84fcad60110c · claude-code-remote
    hash_before: b20604d47d46c7bbf871a42dd1f65d550a218658
    hash_after: 43e6a0eb915cea6f18d11a9568bab40a2d42ad6c
    inputs:
      - name: ask
        hash: ca2485addab1b9fe
        size: 627
      - name: [[spec/design_input/the-index-holds-the-model]]
        hash: 5f2da8fccb387d1f
        size: 23680
    def: 71651f49796eeda4
---

# Ask

`quack` builds its command tree off the registry, with help from each `q.Doc` and each field's tags. [[spec/design_input/the-index-holds-the-model#the-registry-builds-each-surface]] asks it. It reaches the index over `/v1`, the way every other client does, with no path of its own.

A command then costs no hand-written verb, and its help reads the text every other surface reads.

- `go test ./...` from the root passes
- a case reads the help of a fake action off `quack --help`, equal to its `q.Doc`
- a case runs a slow fake action, and reads `quack run` follow it and `--detach` answer at once
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

`quack` reads the registry over `/v1` and builds its command tree off it. It keeps no list of verbs of its own.

| what changes | where it stands | what it does |
|---|---|---|
| the base | a new `V1` in `src/index/main.go` | reaches the door through `reaches`, which starts one where none answers, and answers `http://127.0.0.1:<port>/v1` off the standing file |
| the tree | a new `src/quack/cli.go`, `commands` | reads `GET /v1/values/index/actions`, the rows the manager commits, each with its name, its `q.Doc` and its fields |
| the help | `helps` in `cli.go` | `quack --help` prints each action beside its `q.Doc`. `quack run <action> --help` prints the `q.Doc` on its first line, then a flag a field, with the field's `doc` tag as its usage |
| the run | `runs` in `cli.go` | builds a `flag.FlagSet` off the fields, posts the flags as a JSON object, and follows the call: `Prefer: wait=1`, then a read of the handle path each pause until the state ends, the fraction done on standard error. `--detach` posts `Prefer: wait=0` and prints the handle alone |
| the read | `gets` in `cli.go` | `quack get <name>` prints the value `GET /v1/values/<name>` answers, as the design input shows |
| the root | `main` in `src/quack/main.go` | hands `help`, `--help`, `run` and `get` to the tree, and every other verb to `index.Main` as today |

A flag value reads as JSON where it parses as a number, a boolean or `null`, and as a string otherwise, since a field carries no type on its row. An action taking no struct takes its input as the one argument past its name.

A failed operation prints its error and exits 1. A 400 or 422 prints the problem's detail and exits 1.

I assume `quack` with no verb keeps running the index as today, since `RUNME.sh` and the editor start it so.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/quack/main.go: main, which routes the new verbs
- src/index/main.go: reaches, which V1 calls
- src/index/main.go: standingOf, which V1 reads

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/quack/cli_test.go: TestTheHelpReadsEachActionsDoc
- src/quack/cli_test.go: TestRunFollowsASlowActionToItsResult
- src/quack/cli_test.go: TestRunDetachedAnswersTheHandleAtOnce
- src/quack/cli_test.go: TestGetPrintsTheValueOfAName
- src/index/v1_test.go: TestV1AnswersTheBaseOfTheStandingDoor

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file and function the approach names stands opened: main.go of quack and of the index, reaches, standingOf, catalog.go and its ActionRow, and the /v1 route of actions-answer-over-http
- the callers list names every caller of reaches and standingOf the change touches, and main, the one caller of the tree
- each done_when line names its case: the help case, the follow case and the detach case, and go test and the check in tests-green

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
