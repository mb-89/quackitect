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
depends_on: ["runme-hands-verbs-to-quack"]
record:
  - step: design/draft
    hand: box d8509c02d5db · claude-code-remote
    hash_before: 8d267257d3291dc05c57c93c21982676964028a1
    hash_after: 8d267257d3291dc05c57c93c21982676964028a1
    inputs:
      - name: ask
        hash: cc3ddddf3d021714
        size: 318
    def: 71651f49796eeda4
  - step: design/tests-red
    hand: box d8509c02d5db · claude-code-remote
    hash_before: 1ca035076a7e70d9056233ba42100449a8da6a12
    hash_after: 1ca035076a7e70d9056233ba42100449a8da6a12
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/verbs fails
    inputs:
      - name: design/draft
        hash: 587cd1370cbcd7a4
        size: 2962
    def: 08e16d07b0de477c
  - step: gate
    hand: box d8509c02d5db · claude-code-remote · helper-3
    hash_before: bb8c9b346f082eea4c32c65efc1026cc21cd551e
    hash_after: bb8c9b346f082eea4c32c65efc1026cc21cd551e
    inputs:
      - name: design/draft
        hash: 587cd1370cbcd7a4
        size: 2962
      - name: design/tests-red
        hash: 36714828de8c510c
        size: 755
    def: dc4904ab364efa10
---

# Ask

The `ticket` verbs become actions answering within the wait their caller sets, each in shadow against its `cli.js` twin.

An agent calls the index, and parses no standard output.

- `go test ./...` from the root passes
- `./RUNME.sh log --kind shadow` names each answer the two disagree on
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

Each `ticket` verb stands as an action, and a read the index already holds gets a native twin in shadow. The writes keep the engine `cli.js` runs, behind an IO module, until the switch-over ports them.

| what changes | where it stands | what it does |
|---|---|---|
| the actions | a new `src/modules/verbs/verbs.go`, `Topic` | registers one action a verb of a topic, `ticket/note` for `ticket note`, taking the words past the verb as `args`. Each lists one request to the `node` module |
| the node module | `accepts` in `src/quack/main.go`, over a new `nodeAccept` | runs `node cli.js <topic> <verb> <args>` under the root, and answers its output, or fails with it where the exit reads past 0 |
| the wiring | `spec/wiring.yaml` and `modules` in `main.go` | loads the instance `ticket` of the module type `ticket` |
| the read | a new port `yours` in `src/modules/work/rows.go` | derives the rows `ticket yours` prints: every placed row off the cloud, in outline order, each with its path |
| the twin | a new `src/quack/twins.go`, `ticketYours` | reads `work/yours` over V1 and prints the JSON `ticket yours` prints, `--next` among it. The road table takes it under `ticket yours` |

An agent then calls `ticket/<verb>` through the index, within its wait, and the tool list carries each one.

What I weigh: the writes reach the schema mint, the front writer, the process routes, the Vale lint of an Ask and the holds. A native port of each is the engine itself. So this ticket stands their actions over the old engine, and a line under the switch-over group's Discussion names each native port it owes. The shadow rows come from the reads, where two answers can differ.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/quack/main.go: modules, which loads the ticket instance
- src/quack/main.go: accepts, which answers the node module
- spec/wiring.yaml: the instances, which gain ticket
- src/modules/work/rows.go: Registers, which adds the yours port
- src/quack/verbs.go: twinVerbs, which takes ticket yours
- src/index/tools.go: the tool list, which reads each new action off the registry

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/modules/verbs/verbs_test.go: TestEachVerbOfATopicStandsAsAnAction
- src/modules/verbs/verbs_test.go: TestAnActionHandsItsWordsToTheNodeModule
- src/modules/work/rows_test.go: TestYoursHoldsThePlacedRowsOffTheCloudInOutlineOrder
- src/quack/twins_test.go: TestTicketYoursPrintsTheRowsAsCliJsDoes
- src/quack/twins_test.go: TestTicketYoursNextNamesTheFirstOpenPersonRow
- src/quack/main_test.go: TestTheRootRunsANodeVerbThroughCliJs

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- ticket.js, ticket-yours.js, work-answer.js, rows.go, outline.go, tickets.go, action.go, main.go and the wiring stand opened, and each claim checked there
- the callers list names the root, the wiring, the work module, the road and the tool list
- go test from the root meets every Go case, the shadow line meets the road's shadow cases through the twin, and the check meets the check verb

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/modules/verbs/verbs_test.go src/modules/work/rows_test.go src/quack/twins_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/modules/verbs/verbs_test.go
- src/modules/work/rows_test.go
- src/quack/twins_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The topic registers no action, the yours port holds no row, the twin answers usage, and the root accepts no node request. Each fails on its own assertion. What surprises: no module registers an action yet, so the verbs module stands as the first the tool list carries.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- go test meets every new Go case, the shadow line meets the twin the road runs beside cli.js, and the check meets the check verb
- the twin reads a door over a seeded catalog, and the node case runs a stand-in cli.js under a temp root

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- ticket-draft-real-callers: the callers list names src/index/tools.go, which stands absent from the tree. No file serves /v1/tools yet: src/index/tools_test.go stands red under the-hook-registers-index-tools, so the tool list is that sibling's work and a go test ./... green waits on it. Name src/index/actions.go servesActions, which posts one route an action, as the caller here, and name the tool list as the sibling's. The tests list also puts TestTheRootRunsANodeVerbThroughCliJs under src/quack/main_test.go, where it stands in src/quack/twins_test.go.
- ticket-verbs-each-pinned: src/modules/verbs/verbs_test.go seeds note and todo alone. No test pins that every verb cli.js answers under ticket (pull, note, update, open, todo, route, yours, fill) stands as an action with its doc, as TestEveryRetroVerbStandsAsAnAction does for retro, so the approach's 'each ticket verb' meets no red test.

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
