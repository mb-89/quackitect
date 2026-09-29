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
group: sidebar-lands-in-shadow
step: implement/change
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box d85821f54410d · claude-code-remote
    hash_before: 97d6fe8eb4e57cec26d14762eff9fcbb999d55bf
    hash_after: 97d6fe8eb4e57cec26d14762eff9fcbb999d55bf
    inputs:
      - name: ask
        hash: 2e3ecc9883d2c715
        size: 641
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d85821f54410d · claude-code-remote
    hash_before: f9a2cb98faf846ea8553adb93693569b39731794
    hash_after: f9a2cb98faf846ea8553adb93693569b39731794
    answered:
      - name: tests
        exit: 1
        said: assertion, 4 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: 940a479820d0af61
        size: 2892
    def: 08e16d07b0de477c
  - step: gate
    hand: box d85821f54410d · claude-code-remote · helper-4
    hash_before: 04911c798c6a4d19d7e9ebc54c21322fbfd6582d
    hash_after: 04911c798c6a4d19d7e9ebc54c21322fbfd6582d
    inputs:
      - name: design/draft
        hash: 940a479820d0af61
        size: 2892
      - name: design/tests-red
        hash: 883d13c9e60c0a79
        size: 809
    def: dc4904ab364efa10
---

# Ask

The base files name four actions: work/pull, work/place, tickets/flip-urgent and tickets/set-field. Each registers in the catalog with a label and an icon. Each runs a ticket verb that does what the work tab's own key does. So a surface draws the button off the catalog, and a press does the work.

Without it the work view's buttons draw a bare name with no icon, and a press reaches no action.

- go test ./src/modules/verbs decides that the four actions register, each with a label and an icon
- the ticket verbs place, urgent and set write what the tab writes, and set refuses state, step and steps
- ./RUNME.sh check exits 0

view: none

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

Four actions register in `src/modules/verbs/actions.go`, each with a label, an icon and a doc. Each hands its words to the node module, as `Topic` does.

| action | input | runs |
|---|---|---|
| `work/pull` | none | `ticket yours --next` |
| `work/place` | name, n | `ticket place <name> <n>` |
| `tickets/flip-urgent` | name | `ticket urgent <name>` |
| `tickets/set-field` | name, field, value | `ticket set <name> <field> <value>` |

The three verbs land in `src/scripts/ticket-edit.js`, beside the table in `src/scripts/ticket.js`.

- `place` reads the siblings off `answerOf`, finds the anchor by the rule `placeAt` holds, and writes `places` in the plan file.
- `urgent` writes the urgent mark at its other value, through `withField`.
- `set` writes one field, and refuses a field the schema marks `x-engine`.

The actions join the `work` and `tickets` instances in `src/quack/main.go`, as the settings sections join theirs.

What I weigh and assume:
- A shared case file holds the place rule. `src/tui/work/testdata/places.json` feeds the Go case and the JavaScript case alike.
- The pull entry of `spec/config/draws.json` keeps its help and icon. The widget grid reads them through the schema until it retires.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- `src/quack/main.go`, the `modules` table and its `init`, which join the actions to two instances
- `src/scripts/ticket.js`, `ticket`, whose table gains three verbs
- `src/modules/verbs/ticket.go`, `TicketVerbs`, which gains the three usage lines
- `src/extension/lib/views.js`, `viewsOf`, which reads the new rows unchanged

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- `src/modules/verbs/actions_test.go`, `TestTheViewActionsRegisterWithLabelAndIcon`
- `src/modules/verbs/actions_test.go`, `TestEachViewActionRunsItsTicketVerb`
- `test/level0/ticket-edit.test.js`, `place writes the anchor the work tab writes, over the shared cases`
- `test/level0/ticket-edit.test.js`, `urgent writes the mark at its other value`
- `test/level0/ticket-edit.test.js`, `set writes one field and refuses a field the engine owns`
- `src/tui/work/workplace_test.go`, `TestPlaceAtReadsTheSharedCases`

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first draft, so no earlier review names a finding
- `draws-json-yields-to-views` became this ticket. Its cut waits for the grid to retire, since the grid reads draws.json.

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- `src/modules/verbs/actions.go`
- `src/modules/verbs/actions_test.go`
- `src/modules/verbs/ticket.go`
- `src/quack/main.go`
- `src/scripts/ticket.js`
- `src/scripts/ticket-edit.js`
- `test/level0/ticket-edit.test.js`
- `src/tui/work/testdata/places.json`
- `src/tui/work/workplace_test.go`

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file the approach names stands opened, among them `workplace.go`, `workedit.go`, `verbs.go` and `work-answer.js`
- the callers come off a search for `Topic`, `TicketVerbs` and the verb table
- each done line meets a test: the two Go cases, the three verb cases, and the check

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test test/level0/ticket-edit.test.js src/modules/verbs src/tui/work

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- test/level0/ticket-edit.test.js
- src/modules/verbs/actions_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The four verb cases fail on their assertions against the stub in `ticket-edit.js`, and the two action cases fail since no action registers. `TestPlaceValueReadsTheSharedCases` passes at once. It holds the window side of the shared cases, so its file stays out of the red list. What surprises me: the rule pulls out of `placeAt` whole, and the window place tests pass unchanged over it.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the first done line meets the two action cases, the second meets the three verb cases, and the check is a checkpoint at tests-green
- the verb cases run over the fake disk and fake git, and the Go cases over a bare catalog

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- urgent-off-drops-the-mark: The urgent case in `test/level0/ticket-edit.test.js` wants `urgent: false` after the second flip. The tab drops the field there, since `WithField` in `src/tui/work/workedit.go` drops a flag standing off. Make the case want the field gone, so the verb writes what the tab writes.
- set-weighs-values-too: The tab weighs a value against the schema's enum and type through `Weighs` in `src/tui/work/workedit.go`. The draft's set refuses the engine fields alone. Make set weigh the value the same way, with a case for a refused value.
- draft-size-names-workplace: The size list leaves out `src/tui/work/workplace.go`, which tests-red changed to pull out `PlaceValue`. The tests list names `TestPlaceAtReadsTheSharedCases`, and the file holds `TestPlaceValueReadsTheSharedCases`.
- draws-pull-icon-stands-once: The Discussion says the pull entry of `spec/config/draws.json` drops its help and icon. The approach keeps them until the grid retires, so the icon stands in two places and no ticket carries the cut. Carry the cut on this child.

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

The draft corrects two lines, since the engine holds its evidence. The size list also takes `src/tui/work/workplace.go`, which tests-red changes to pull out `PlaceValue`. The Go case on the place rule is `TestPlaceValueReadsTheSharedCases`.

`draws-json-yields-to-views` became this ticket. Once `work/pull` registers its help and icon, the `pull` entry of `spec/config/draws.json` drops the two, so the icon stands in one place. The draft names that cut under its approach.
