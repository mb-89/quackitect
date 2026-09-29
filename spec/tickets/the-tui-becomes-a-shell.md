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
group: tui-shell-lands-in-shadow
record:
  - step: design/draft
    hand: box d85514b1a910b · claude-code-remote
    hash_before: 5d0923b6878a5e6c3367be9d88ab9595be7839bd
    hash_after: 5d0923b6878a5e6c3367be9d88ab9595be7839bd
    inputs:
      - name: ask
        hash: 7a8a87d4dd91f5b6
        size: 376
    def: 71651f49796eeda4
  - step: design/tests-red
    hand: box d85514b1a910b · claude-code-remote
    hash_before: 22b9e2bc25d42fdf976f80753e5d235a04c7d3bb
    hash_after: 22b9e2bc25d42fdf976f80753e5d235a04c7d3bb
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/tui/registry fails
    inputs:
      - name: design/draft
        hash: 44af430987b84e61
        size: 4553
      - name: [[spec/design_output/model]]
        hash: 3e2cd8b099700681
        size: 74868
      - name: [[spec/tickets/the-work-view-gains-actions]]
        hash: e037af28d323c289
        size: 5675
      - name: [[spec/tickets/the-log-becomes-a-view]]
        hash: 04353381cefa7404
        size: 5426
    def: 08e16d07b0de477c
---

# Ask

The window becomes the generic shell: declared views on the left, and `index`, `cli` and `help` on the right.

Every tool built on this tree then draws in the same shell.

- `go test ./...` from the root passes
- a case draws the `index` tab over a fake catalog
- a case draws the `help` tab, and reads each doc equal to the registration's `q.Doc`
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

A new package `src/tui/registry` holds the three registry tabs of [[spec/design_output/model#the-registry-tabs]], and the window appends them after the declared views. The frame stays as it stands: `frame.Tab` already carries a tab, so the shell gains tabs and no change to `src/tui/frame`.

| the part | where | what it does |
|---|---|---|
| `Catalog` | `src/tui/registry/catalog.go` | the door: `Names()`, `Actions()` and `Docs()`, each answering its rows or an error. Row types `NameRow`, `ActionRow`, `DocRow` and `FieldRow` mirror the json of `index/names`, `index/actions` and `index/docs`, spelled here because a renderer imports no module |
| `V1` | `src/tui/registry/v1.go` | the real door: `GET <base>/values/index/names` and its two siblings, over the base `index.V1` answers, the road `quack` takes |
| `Fake` | `src/tui/registry/fake.go` | the fake door: rows handed in, and an error where the test names one |
| `Tab` | `src/tui/registry/tab.go` | one `frame.Tab` over one of the three lists: `index`, `cli` or `help`. Each holds its rows, a cursor, the filter line through `draw.ParseFilter`, and draws its rows through `draw` as a table with a column line |
| the fetch | `src/tui/registry/tab.go` | `Init` asks the door in a `tea.Cmd`, and a `fetched{tab, rows, err}` message lands the rows; the tab takes only a message naming itself, since the frame hands each message to every tab. A tick of its own asks again, so a restart of the index reaches the tab |
| the window | `src/tui/main.go`, `newModel` | builds `[log, work, index, cli, help]`, handing the three tabs `registry.V1` over `index.V1`. `newModelOver(path, zone, catalog)` takes the door, so the tests hand the fake |

What each tab draws:

| the tab | columns | the details |
|---|---|---|
| `index` | `name`, `provider`, `state`, `value` cut to one line | the value in full, and the provider's name and kind |
| `cli` | `action`, `doc` | each input field with its label and doc, and the command line `quack run <action> --<key> <value>` it runs |
| `help` | `name`, `kind`, `doc` | the doc wrapped whole |

A door answering an error draws one line on the left naming it, and the declared views keep answering as they stand: the old path stays whole, per the group's shadow.

Assumptions, each for the hand at the merge:

- The declared views keep their order, log then work, and the config key `window.tabs` lands with the declared views in [[spec/tickets/the-work-view-gains-actions]] and [[spec/tickets/the-log-becomes-a-view]]. This ticket draws the three registry tabs after them.
- The `cli` tab's form under Enter and its F5 call ride a child the group's split mints, `the-cli-tab-calls-an-action`, since the ask names only the tabs and the index and help cases. This tab lists each action and shows its command line.
- `--tab` on `logview` takes the three new names, since `TabNamed` reads each tab's `Name()`.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/tui/main.go runWindow, through newModel
- src/tui/main.go Frame, through newModel
- src/tui/model_test.go, mouse_test.go, panes_test.go, sort_test.go, frame_test.go, window_test.go, work_test.go, workedit_test.go: each builds the window through newModel
- src/tui/frame/model.go Update: hands each message to every tab, so a registry tab takes only its own
- src/tui/frame/footer.go footer: reads Tabs[0], which stays the log
- src/tui/frame/tabs.go RenderStrip and TabNamed: read every tab's Label and Name
- src/tui/frame/mouse.go: measures every tab in the strip

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/tui/registry/tab_test.go TestTheIndexTabDrawsTheFakeCatalog
- src/tui/registry/tab_test.go TestTheHelpTabReadsEachDocAsTheRegistrationGivesIt
- src/tui/registry/tab_test.go TestTheCliTabShowsTheCommandLineOfAnAction
- src/tui/registry/tab_test.go TestADoorAnsweringAnErrorDrawsItsReason
- src/tui/registry/tab_test.go TestATabTakesOnlyItsOwnFetch
- src/tui/window_test.go TestTheStripNamesTheRegistryTabsAfterTheViews

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first, on a first draft

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file named stands opened: src/tui/main.go, src/tui/frame/tabs.go, model.go, help.go, part.go, door.go, src/modules/index/catalog.go, src/quack/cli.go, src/index/main.go V1, and the model note's registry tabs
- the callers list names newModel's callers, every test building the window, and the frame reading every tab
- the ask's index case meets TestTheIndexTabDrawsTheFakeCatalog, the help case TestTheHelpTabReadsEachDocAsTheRegistrationGivesIt over a qtest catalog whose registrations carry q.Doc, and go test ./... with ./RUNME.sh check close it

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/tui/registry src/tui

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/tui/registry/catalog_test.go
- src/tui/registry/tab_test.go
- src/tui/window_test.go TestTheStripNamesTheRegistryTabsAfterTheViews

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Every case fails on its assertion over a stub that compiles. The frame hands each arrival to every tab, so the fetch message names its tab, and a case holds that. The catalog door is one read a name, so one contract suite runs over the fake and over the /v1 door against an httptest server answering the index's shape. The surprise: frame.New draws its footer off Tabs[0].Marks, so a window of one registry tab needs Marks to answer its own order, which the stub leaves empty.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the index case is TestTheIndexTabDrawsTheFakeCatalog, the help case TestTheHelpTabReadsEachDocAsTheRegistrationGivesIt over a qtest catalog carrying q.Doc; go test ./... and ./RUNME.sh check close at tests-green
- the one door, Catalog, has Fake, and TestTheFakeCatalogKeepsTheContract with TestTheV1CatalogKeepsTheContract hold it to the real /v1 read

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
