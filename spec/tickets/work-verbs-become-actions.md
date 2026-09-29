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
    hash_before: f3a56c1b9d0acb8be175e377518ab9382c1fc2ae
    hash_after: f3a56c1b9d0acb8be175e377518ab9382c1fc2ae
    inputs:
      - name: ask
        hash: 4e14549deb9b42c2
        size: 332
    def: 71651f49796eeda4
  - step: design/tests-red
    hand: box d8509c02d5db · claude-code-remote
    hash_before: c3d3976c933bc9822bd0f533c13bebc94fd56af4
    hash_after: c3d3976c933bc9822bd0f533c13bebc94fd56af4
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/verbs fails
    inputs:
      - name: design/draft
        hash: 55a013c777fc0271
        size: 2974
    def: 08e16d07b0de477c
  - step: gate
    hand: box d8509c02d5db · claude-code-remote · helper-3
    hash_before: 0518114efe0fad7bbeafbe16a90c70a0da66fa8a
    hash_after: 0518114efe0fad7bbeafbe16a90c70a0da66fa8a
    inputs:
      - name: design/draft
        hash: 55a013c777fc0271
        size: 2974
      - name: design/tests-red
        hash: aa79d154b7d0d7f6
        size: 738
    def: dc4904ab364efa10
  - step: implement/change
    hand: box d8509c02d5db · claude-code-remote
    hash_before: bedb3db2e8be1c9a21584ace943b091ba5a1db53
    hash_after: bedb3db2e8be1c9a21584ace943b091ba5a1db53
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
    def: f150b8c0dc20fe45
---

# Ask

The `branch` verbs become work actions answering within the wait their caller sets, and each runs in shadow against its `cli.js` twin.

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

Each `branch` verb stands as an action through `verbs.Topic`, the module type `ticket-verbs-become-actions` lays down, and `branch list --queue` gets a native twin in shadow. The rest keep the engine `cli.js` runs, through the `node` module.

| what changes | where it stands | what it does |
|---|---|---|
| the verbs | a new `src/modules/verbs/branch.go`, `BranchVerbs` | lists every verb `work` in `src/scripts/work.js` answers, from open to test |
| the actions | `Topic` in `src/modules/verbs/verbs.go` | registers each verb with `q.Writes` and no `q.Deadline`, as the retro topic does |
| the wiring | `spec/wiring.yaml` and `modules` in `src/quack/main.go` | loads the instance `branch` |
| the twin | `src/quack/twins.go`, `branchQueue` | reads `work/yours` over V1 and prints each row as `queueOnly` in `src/scripts/work-list.js` prints it, place then name then step. An empty list prints the line `queueOnly` prints |
| the road | `twinVerbs` and `twinWordsAt` in `src/quack/verbs.go` | keys a twin on up to three words, and takes `branchQueue` under `branch list --queue`, so every other listing runs `cli.js` alone |

What I weigh: `work/yours` holds the placed rows off the cloud in outline order, which the queue listing prints. So the twin adds no port. Every other verb reads git or writes a branch, which the index holds nowhere, and its native port belongs to `quack-verbs-switch-over`, where a line under Discussion names it.

What I assume: `Topic`, `nodeAccept` and the port `work/yours` land under `ticket-verbs-become-actions` first. A key of three words matches the flag in third place alone, and `branch list --fetch --queue` runs `cli.js` alone, which costs a shadow row on that spelling and nothing else.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/quack/main.go: modules, which loads the branch instance
- spec/wiring.yaml: the instances, which gain branch
- src/modules/verbs/verbs.go: Topic, which each verb reaches
- src/quack/verbs.go: twinVerbs, which takes branch list
- src/quack/verbs.go: twinOf, which reads up to three words
- src/quack/twins.go: nodeAccept, which runs each action through cli.js
- src/scripts/work.js: work, which the node module runs and this ticket leaves unchanged

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/modules/verbs/verbs_test.go: TestEveryBranchVerbStandsAsAnAction
- src/quack/twins_test.go: TestBranchQueuePrintsThePlacesAsCliJsDoes
- src/quack/twins_test.go: TestBranchQueueSaysSoWhereNoRowStands
- src/quack/twins_test.go: TestTheWiringLoadsTheBranchTopic
- src/quack/verbs_test.go: TestATwinKeysOnThreeWords

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- work.js, work-list.js, work-stands.js, rows.go, verbs.go, twins.go, main.go and the wiring stand opened, and each claim checked there
- the callers list names the root, the wiring, the topic, the road, the node module and the engine it runs
- go test from the root meets every Go case, the shadow line meets the twin and the three-word key on the road, and the check meets the check verb

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/modules/verbs/verbs_test.go src/quack/twins_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/modules/verbs/verbs_test.go
- src/quack/twins_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The branch verb list stands empty, the queue twin answers usage, the wiring loads no branch topic, and the road keys two words alone. Each fails on its own assertion. The three-word case stands in twins_test.go, beside the draft's verbs_test.go, so the road's own tests stay under the check while this ticket stands red.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- go test meets every new Go case, the shadow line meets the twin and the three-word key on the road, and the check meets the check verb
- the twin reads a door over a seeded work/yours, and the road case runs over the fake road

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept
- the builder adds a `branch` row to the ports table under Discussion on quack-verbs-switch-over, naming every verb past `list --queue` over `src/scripts/work.js`. The draft says a line there names it, and none stands.
- the builder checks `yoursOf` against `queueOnly` on a row the cloud holds: `yoursOf` skips a row carrying `Cloud`, and `queueOnly` skips the cloud place alone, so the shadow log names any row the two part on.
- the draft's tests list names src/quack/verbs_test.go for TestATwinKeysOnThreeWords, and the case stands in src/quack/twins_test.go, as the tests-red seen field says.

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint src/modules/verbs/branch.go spec/wiring.yaml src/quack/main.go src/quack/verbs.go src/quack/twins.go spec/tickets/quack-verbs-switch-over.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change touches the branch verbs, the wiring in spec/wiring.yaml and main.go, the twin road in verbs.go and twins.go, and the ports table the gate verdict asks for, and nothing else
the twin reaches work/yours over V1, which the yoursTree case seeds through a real index on a temp root, as ticket yours does
every new line points at spec/tickets/work-verbs-become-actions, whose approach the change implements
the column widths and the empty line stand once as constants in twins.go, pointing at queueOnly; the branch ports stand once in the switch-over table
verdict point 2: yoursOf drops a row carrying Cloud where queueOnly drops the cloud place alone; the twin keeps yoursOf, so the shadow log names any such row, which the ask wants
verdict point 3: TestATwinKeysOnThreeWords stands in src/quack/twins_test.go, which the tests-green list names

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
