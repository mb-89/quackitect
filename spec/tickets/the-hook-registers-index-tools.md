---
kind: [[ticket]]
state: open
step: gate
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
depends_on: ["the-quack-cli-gets-generated"]
record:
  - step: design/draft
    hand: box d8509c02d5db · claude-code-remote
    hash_before: d7cd6e3b9ccd71296609436f59b49c314efc7917
    hash_after: d7cd6e3b9ccd71296609436f59b49c314efc7917
    inputs:
      - name: ask
        hash: 77d4d7d4493d36a8
        size: 267
    def: 71651f49796eeda4
  - step: design/tests-red
    hand: box d8509c02d5db · claude-code-remote
    hash_before: e0617b8db07c27e40eee172e57fe7aa89503fb17
    hash_after: e0617b8db07c27e40eee172e57fe7aa89503fb17
    answered:
      - name: tests
        exit: 1
        said: assertion, 3 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: 6ed3948a7e420447
        size: 2582
    def: 08e16d07b0de477c
---

# Ask

The hook module registers the tool list the index generates, beside the tools it registers today.

A tool then costs one action, and every harness picks it up.

- a case under `test/level0` reads the generated list and registers each tool
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

The index generates the tool list off the registry, and the hook reaches it through the binary, the way the pull reaches `cli.js`.

| what changes | where it stands | what it does |
|---|---|---|
| the list | a new `src/index/tools.go`, served at `GET /v1/tools` | answers one tool an action: its name, its `q.Doc` as the description, and its input schema off the Huma registry, with the reference resolved |
| the name | `toolName` in `tools.go` | `index_` and the action with each slash an underscore, so a tool reads apart from the tools the bridge serves |
| a bare input | `tools.go` | an action taking no struct carries its input as the one property `input`, since a tool takes an object |
| the command | `quack tools` and `quack act <action> <json>` in `src/quack/cli.go` | prints the list, and posts the JSON as the input, follows the call, and prints the result |
| the hook | a new `.claude/skills/level0/lib/index-tools.js`, which `pull-tool.js` calls | at the session start, runs `se-index tools` under the method root and registers each tool beside the pull and the read tools. A call of a tool it holds runs `se-index act` and answers what it prints |

A box whose binary stands nowhere or answers nothing registers no index tool, and the tools it registers today stand as before.

The verbs slice decides nothing here: a tool reaches an action, and no verb of `cli.js` twins it.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- .claude/skills/level0/hooks/pull-tool.js: register, whose session start registers the list
- .claude/skills/level0/hooks/pull-tool.js: a new tool call handler for the index tools
- src/index/v1.go: servesV1, which serves the list
- src/quack/cli.go: cli, which answers tools and act
- src/quack/cli.go: cliVerbs, which main reads

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/index/tools_test.go: TestV1ListsEachActionAsATool
- src/index/tools_test.go: TestABareInputRidesAsOneProperty
- src/quack/cli_test.go: TestToolsPrintsTheListTheIndexGenerates
- src/quack/cli_test.go: TestActPostsItsJSONAndPrintsTheResult
- test/level0/index-tools.test.js: the hook reads the generated list and registers each tool
- test/level0/index-tools.test.js: a call of an index tool runs act with its input
- test/level0/index-tools.test.js: a binary that answers nothing registers no tool

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- pull-tool.js, level0.js, v1.go, actions.go, catalog.go and cli.go stand opened, and each claim checked there
- the callers list names the hook, the door and the command tree
- the list case names index-tools.test.js under test/level0, and the check names the check verb

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/index/tools_test.go src/quack/cli_test.go test/level0/index-tools.test.js

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/index/tools_test.go
- src/quack/cli_test.go
- test/level0/index-tools.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The door answers 404 at the tools route, the command tree answers usage for tools and act, and the stub hook registers nothing and finds no binary. The case where the binary answers nothing passes against the stub already, as it should. What surprises: the hook reaches the outside through the process, the file and the tool doors alone, so the binary is its one road to the index.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the list case under test/level0 reads a generated list and asserts each tool registered beside the pull, and the check meets the check verb
- the hook cases hand a fake process and a fake tool door, and the Go cases stand a door over fake actions

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
