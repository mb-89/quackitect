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
step: gate
record:
  - step: design/owner-read
    hand: box d85821f54410d · claude-code-remote
    hash_before: 48956a6421ee6e14f592483bcb1ee3567a91647d
    hash_after: 48956a6421ee6e14f592483bcb1ee3567a91647d
    inputs:
      - name: ask
        hash: eecebd8b5f500ddc
        size: 630
    def: dfe8a19a676f7573
  - step: design/draft
    hand: box d85821f54410d · claude-code-remote
    hash_before: 4ac3362d2168bc43594de43675cede76e3c13fb4
    hash_after: 4ac3362d2168bc43594de43675cede76e3c13fb4
    inputs:
      - name: ask
        hash: eecebd8b5f500ddc
        size: 630
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d85821f54410d · claude-code-remote
    hash_before: a2b28af8f5ccde36d5e372655891f9bc16ced713
    hash_after: a2b28af8f5ccde36d5e372655891f9bc16ced713
    answered:
      - name: tests
        exit: 1
        said: assertion, 3 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: f9fe69c7c1ba8cd3
        size: 2597
    def: 08e16d07b0de477c
---

# Ask

from: handover

The sidebar weighs the views section against the old sidebar while the slice `migration/config/slices/sidebar` reads shadow. Each place the two draw apart writes a `shadow` row to the session log. So the owner reads every mismatch before the old sidebar retires.

Without it the two stand side by side with nothing weighing them, and the switch-over flips blind.

- `go test ./src/modules/migration` decides that the migration module declares the slice, built-in old
- a case under `test/level0` reads a `shadow` row for a badge the two paths draw apart, and none under old
- `./RUNME.sh check` exits 0

view: none

# design

## owner-read

<!-- reads the ask a handover carries, before any draft -->

### read

<!-- pass where the ask says what the owner said, or fail with the owner's words -->
<!-- the form is verdict -->

pass: the ask carries the group brief, the shadow row on each mismatch and the slice key `migration/config/slices/sidebar`, in the brief's words

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->
<!-- the form is text -->

The migration module declares the slice `sidebar`, built-in old, beside `window`. While it reads shadow, each draw of the sidebar weighs the old groups against the views section, and writes a `shadow` row for each pair that reads apart.

| pair | old side | new side |
|---|---|---|
| a badge | the count of the cell whose `counts` names a value | the badge value off `index/names` for that name |
| a button | the help and icon of the cell `work.pull` | the doc and icon of the action `work/pull` |

A cell key pairs with the action whose name swaps its dot for a slash.

| part | file | what changes |
|---|---|---|
| the slice | `src/modules/migration/migration.go`, `slices` | the key `sidebar`, built-in old, with the three modes |
| the compare | `src/extension/lib/views-shadow.js`, new, `apartOf(groups, views, names)` | one line a pair that reads apart, and none where the pairs agree |
| the rows | `src/extension/sidebar.js`, `html` | under shadow, each new line writes one row through the logbook: kind `shadow`, slice `sidebar` |

What I weigh and assume:
- The key follows its siblings as `migration.sidebar`, so it reads `migration/config/sidebar`. The brief's `slices/` segment names no key standing today.
- A line told once stays quiet for the session, as `tell` in `src/tui/work/shadow.go` keeps it.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- `src/extension/sidebar.js`, `html`, which draws both paths and calls the compare
- `src/modules/migration/migration.go`, `Registers`, which reads `slices`
- `spec/config/level0.schema.json`, which `quack schema --write` writes off the declaration

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- `src/modules/migration/migration_test.go`, `TestTheSidebarSliceStandsBuiltInOld`
- `test/level0/views-shadow.test.js`, `a badge the two paths count apart reads as one line`
- `test/level0/views-shadow.test.js`, `a button whose help and icon agree reads no line`
- `test/level0/sidebar-views.test.js`, `under shadow a mismatch writes one shadow row, and under old none`

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first draft, so no earlier review names a finding

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- `src/modules/migration/migration.go`
- `src/modules/migration/migration_test.go`
- `src/extension/lib/views-shadow.js`
- `src/extension/sidebar.js`
- `test/level0/views-shadow.test.js`
- `test/level0/sidebar-views.test.js`
- `spec/config/level0.schema.json`

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file the approach names stands opened, among them `shadow.go`, `migration.go`, `sidebar.js` and the logbook
- the callers come off a search for `slices`, `html` and `WriteShadow`
- each done line meets a test: the slice case, the row case, and the check

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test test/level0/views-shadow.test.js test/level0/sidebar-views.test.js src/modules/migration

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- test/level0/views-shadow.test.js
- test/level0/sidebar-views.test.js
- src/modules/migration/migration_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The slice case fails, since no slice names the sidebar. The two compare cases fail against the stub, and the case where the pairs agree passes at once. The sidebar case fails on its first assertion, since no row reads shadow. What surprises me: the compare takes the base files and the catalog, the reads the sidebar holds at a draw, in place of the drawn views the draft names.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the first done line meets the slice case, the second the sidebar case, and the check is a checkpoint at tests-green
- the cases run over the fake disk and a fake index door, and the Go case over the slice list

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
