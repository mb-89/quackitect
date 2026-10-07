---
kind: [[ticket]]
state: open
step: implement/tests-green
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
depends_on: ["example-schema-reads-steps"]
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 42197a224bb7 · claude-code-remote
    hash_before: 0587e6fdf54a50fc9dd5e963d0a37a1fd36a228e
    hash_after: 0587e6fdf54a50fc9dd5e963d0a37a1fd36a228e
    inputs:
      - name: ask
        hash: f4be009a917e0225
        size: 514
      - name: [[spec/design_output/examples]]
        hash: 5245c4fe35ade37e
        size: 8237
    def: c01ae0f2ace0cecb
  - step: design/tests-red
    hand: box 42197a224bb7 · claude-code-remote
    hash_before: cbbdee33ce96b27a9bddf985588bd876735d0e71
    hash_after: cbbdee33ce96b27a9bddf985588bd876735d0e71
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/check fails
    inputs:
      - name: design/draft
        hash: 83dc7b7ceca2dc35
        size: 2113
    def: 08e16d07b0de477c
  - step: gate
    hand: box 23ee163eaf36 · claude-code-remote
    hash_before: 2f773e176b26706a97bf5754ffeb4eaf75748866
    hash_after: 2f773e176b26706a97bf5754ffeb4eaf75748866
    inputs:
      - name: design/draft
        hash: 83dc7b7ceca2dc35
        size: 2113
      - name: design/tests-red
        hash: 7cf4ffc5704f346f
        size: 588
    def: dc4904ab364efa10
  - step: implement/change
    hand: box 23ee163eaf36 · claude-code-remote
    hash_before: 6c1c44d3a2604e445243afce39d9a52c29fcd6f8
    hash_after: 379dad0c67e5f27e4e8ffde3915246ec3d58432e
    answered:
      - name: lint
        exit: 0
        said: ""
    def: f150b8c0dc20fe45
---

# Ask

A feature with no example shows in the check, and a ticket's proof names the example that shows it. [[spec/design_output/examples#the-checks]]

A verb lands with no example, and the tutorial and the suite fall behind the tree.

- the check names each verb, tab and door-facing feature no example names under `interface`, in report mode
- the check names each standard ticket whose `done_when` names no example, in report mode
- each guard's case proves it on a planted tree
- `./RUNME.sh check` exits 0

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

Two tree rules join `Rules` in `src/modules/check`, both in a new `coverage.go`. Each answers its findings at warning, which is the report mode. Turning a rule to refuse is a change of its severity alone.

- `ExampleCovers`: the rule reads the names the examples show off the `interface` field of every file under `spec/examples`, through `example.Read`. It reads the verbs off the `register("…")` and `registerBox("…")` lines of `src/quack/*.go` past the tests, and the tabs off the `tuiTabs` line of `src/quack/tui_verb.go`. A tab counts as shown where an example names `tui <tab>`. Each verb or tab no example names takes one warning, on the line that registers it.
- `ExampleProves`: for each open ticket on `spec/processes/standard`, the rule reads the list under `# Ask`, which holds the `done_when` lines. Where no line names a path under `spec/examples/`, the ticket takes one warning, on its first list line.

The door-facing features take no list of their own here. A feature a user reaches stands as a verb or a tab, and the doors stand behind them. The rule widens once a list of them stands.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/modules/check/checker.go treeFaults, which runs every rule of Rules
- src/modules/check/checker.go Sweep, which reaches treeFaults

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/modules/check/example_test.go TestAVerbNoExampleNamesTakesAWarning
- src/modules/check/example_test.go TestATabNoExampleNamesTakesAWarning
- src/modules/check/example_test.go TestAStandardTicketNamingNoExampleTakesAWarning

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/modules/check/coverage.go
- src/modules/check/checker.go
- src/modules/check/example_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file named stands opened: checker.go with Rules and treeFaults, group.go as the model of a ticket rule, finding.go for the severities, tui_verb.go for tuiTabs, registry.go for register, and standard.yaml for the ask fields
- the callers list names treeFaults and the sweep, the one road into a rule
- each done_when line names its test: the verb and tab warnings, the ticket warning, and the check run itself
- the approach adds no config key

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/modules/check/example_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The cases plant a tree of texts: two verbs registered in quack, one registered in a test file the rule skips, two tabs, one example naming one verb and one tab, and four tickets on the two routes and states. The rules stand as stubs answering nothing, so each case fails on its own assertion.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each done_when line meets a red case: the verb, the tab and the standard ticket, each on a planted tree, and the check at the end
- the cases reach no door: the tree is texts in memory

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

go vet ./src/modules/check/

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the files the size list names: coverage.go, checker.go and example_test.go
- the rules reach no door: they read the tree handed in, which the cases plant as texts
- the comment on src/modules/check/coverage.go names the approach, and links the design
- every fact stands once: the rule names stand in the constants block, and each message points at the design for the check

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
