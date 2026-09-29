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
depends_on: ["runme-hands-verbs-to-quack"]
record:
  - step: design/draft
    hand: box d8509c02d5db · claude-code-remote
    hash_before: 343952bc8f1f6a119f0e77f3fe06635c27c8d4e9
    hash_after: 343952bc8f1f6a119f0e77f3fe06635c27c8d4e9
    inputs:
      - name: ask
        hash: 2ccf2c410d2366a6
        size: 309
    def: 71651f49796eeda4
  - step: design/tests-red
    hand: box d8509c02d5db · claude-code-remote
    hash_before: a85bca891398b27dab5234d9e4384c2183945647
    hash_after: a85bca891398b27dab5234d9e4384c2183945647
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/verbs fails
    inputs:
      - name: design/draft
        hash: 92c91396a234d448
        size: 3211
    def: 08e16d07b0de477c
---

# Ask

The `retro` verbs become actions answering within the wait their caller sets, in shadow against `cli.js`.

A retro collect runs long, and the wait keeps its caller free.

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

Each `retro` verb stands as an action through `verbs.Topic`, the module type `ticket-verbs-become-actions` lays down, and `retro notes` gets a native twin in shadow. The rest keep the engine `cli.js` runs, through the `node` module.

| what changes | where it stands | what it does |
|---|---|---|
| the verbs | a new `src/modules/verbs/retro.go`, `RetroVerbs` | lists every verb `retro` in `src/scripts/retro.js` answers, each with the line its usage prints as its doc |
| the actions | `Topic` in `src/modules/verbs/verbs.go` | registers each verb with `q.Writes` and no `q.Deadline`, so a long collect never fails on a deadline, and each call answers within the wait its caller sets through `index.Call` |
| the wiring | `spec/wiring.yaml` and `modules` in `src/quack/main.go` | loads the instance `retro` of the module type `retro` |
| the twin | `src/quack/twins.go`, `retroNotes` | reads `tickets/all` over V1, keeps each row under `.se/tickets/` whose state reads other than closed, and prints the two answers `notes` in `retro.js` prints, with its exit |
| the road | `twinVerbs` in `src/quack/verbs.go` | takes `retroNotes` under `retro notes`, so shadow logs each answer the two disagree on |

What I weigh: the wait stands already. `index.Call` answers `still running` with the handle past the wait, and a test of `src/modules/index` holds it. So this ticket adds no wait of its own, and declares no deadline on a verb whose length it cannot know. `retro notes` is the one read the index holds whole. Every other verb reads the retro's input folder or writes the tree, and its native port belongs to `quack-verbs-switch-over`, where a line under Discussion names it.

What I assume: `Topic` and `nodeAccept` land under `ticket-verbs-become-actions` first, which `depends_on` carries through `runme-hands-verbs-to-quack`. A read verb declaring `q.Writes` queues behind a running collect, and one writer per tree takes that cost for a verb over `cli.js`.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/quack/main.go: modules, which loads the retro instance
- spec/wiring.yaml: the instances, which gain retro
- src/modules/verbs/verbs.go: Topic, which each retro verb reaches
- src/quack/verbs.go: twinVerbs, which takes retro notes
- src/quack/twins.go: nodeAccept, which runs each retro action through cli.js
- src/scripts/retro.js: retro, which the node module runs and this ticket leaves unchanged

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/modules/verbs/verbs_test.go: TestEveryRetroVerbStandsAsAnAction
- src/modules/verbs/verbs_test.go: TestARetroActionWritesAndDeclaresNoDeadline
- src/quack/twins_test.go: TestRetroNotesPrintsTheOpenNotesAsCliJsDoes
- src/quack/twins_test.go: TestRetroNotesPassesWhereNoNoteStandsOpen
- src/quack/main_test.go: TestTheWiringLoadsTheRetroTopic

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- retro.js, retro-collect.js, ticket.js, verbs.go, twins.go, main.go, call.go, ops.go, q.go, tickets.go and the wiring stand opened, and each claim checked there
- the callers list names the root, the wiring, the topic, the road, the node module and the engine it runs
- go test from the root meets every Go case, the shadow line meets the road's shadow case through retroNotes, and the check meets the check verb

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

The retro verb list stands empty, the topic declares no collect, the wiring loads no retro instance, and the notes twin answers usage. Each fails on its own assertion. What surprises: both red files stand red already under ticket-verbs-become-actions, so this ticket adds no file to the list the check leaves out.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- go test meets every new Go case, the shadow line meets the notes twin the road runs beside cli.js, and the check meets the check verb
- the twin reads a door over a seeded catalog of tickets/all, and the topic and wiring cases run over a fresh catalog

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
