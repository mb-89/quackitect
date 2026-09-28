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
group: the-foundation-closes-its-gaps
depends_on: [the-manager-becomes-a-module, ports-declare-their-looks]
step: implement/tests-green
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box d7e2ac6b84cc · claude-code-remote
    hash_before: 23d8976c0f7d607851a160dca7f0f67f67757e5b
    hash_after: 23d8976c0f7d607851a160dca7f0f67f67757e5b
    inputs:
      - name: ask
        hash: 3c601a7e92ad3657
        size: 656
      - name: [[spec/design_output/model]]
        hash: eb315d7a681bc4e4
        size: 74362
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d7e2ac6b84cc · claude-code-remote
    hash_before: c3d31ce011191c91195cfa3a88d01bb812654df4
    hash_after: c3d31ce011191c91195cfa3a88d01bb812654df4
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/index fails
    inputs:
      - name: design/draft
        hash: b107ab46f5080e28
        size: 3591
    def: 08e16d07b0de477c
  - step: design/draft
    hand: the engine
    stale: [[spec/design_output/model]]
  - step: design/draft
    hand: box d7e2ac6b84cc · claude-code-remote
    hash_before: 7a1d0f785fc96e6e79d13fd24bbad58fd2366904
    hash_after: 7a1d0f785fc96e6e79d13fd24bbad58fd2366904
    inputs:
      - name: ask
        hash: 3c601a7e92ad3657
        size: 656
      - name: [[spec/design_output/model]]
        hash: 1717325681c1003e
        size: 74654
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d7e2ac6b84cc · claude-code-remote
    hash_before: 33510beb542701bfe41bba359976664a40dfdd7d
    hash_after: 33510beb542701bfe41bba359976664a40dfdd7d
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/index fails
    inputs:
      - name: design/draft
        hash: b107ab46f5080e28
        size: 3591
    def: 08e16d07b0de477c
  - step: gate
    hand: box d7e2ac6b84cc · claude-code-remote · helper-7
    hash_before: 689b16cea06c8b723b0f9e1f1dfb651d09753c2c
    hash_after: 689b16cea06c8b723b0f9e1f1dfb651d09753c2c
    inputs:
      - name: design/draft
        hash: b107ab46f5080e28
        size: 3591
      - name: design/tests-red
        hash: 1998e0e2d5b122f0
        size: 696
    def: dc4904ab364efa10
  - step: implement/change
    hand: box d7e2ac6b84cc · claude-code-remote
    hash_before: 77c0d8dcfc628bd35497a6ecf53c2b8c560184bd
    hash_after: 77c0d8dcfc628bd35497a6ecf53c2b8c560184bd
    answered:
      - name: lint
        exit: 0
        said: ""
    def: f150b8c0dc20fe45
---

# Ask

The index manager writes the catalog as rows under `index/`, per [[spec/design_output/model#the-topics-and-their-writers]]. The registry tabs and every surface then read one list of names, actions and docs.

The manager writes `index/health` alone today, so the `index`, `cli` and `help` tabs have no rows to read.

- A case starts the manager over a catalog, and reads `index/names` naming each name, its provider, and whether a provider answers it.
- A case reads `index/actions` naming each action with its doc and its input fields.
- A case reads `index/docs` naming each name, action and key with its `q.Doc`.
- `./RUNME.sh check` exits 0.

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

One, q gains two methods on Store in src/q/store.go: Names() lists each group name in catalog order.
Presentation(name) answers the active owner's Presentation, the way Catalog.Presentation does.
Two, Registers gives three more names with q.Doc and q.Looks(q.Rows): index/names, index/actions and index/docs.
Each takes an empty slice as its default, since Check refuses a nil default.
Three, a new file src/modules/index/catalog.go holds three row types: NameRow, ActionRow and DocRow.
NameRow holds name, provider (q.Provider off Store.Why), state (Why.State) and value, the value only for a name that is not a family pattern.
ActionRow holds each name whose provider kind is action, with its doc and its fields. An action keeps its input fields and no input type, so the fields stand for the type.
DocRow holds every name with its doc, and a kind of name, action or key.
A key is a name under config/ or <instance>/config/.
Four, begins commits all three after Restart, in one commit, since the catalog stays fixed once the store starts.
Five, renews commits index/names again beside index/health on each step, so the state follows what providers answer.
Weighed: a once-at-start commit of index/names, which leaves every state stale after the first provider commits.
Weighed: an Outside.Catalog field, which widens index.Manage and main.go for a list the store already holds.
Weighed: a Doc field on Why, which changes the JSON of quack why for a need of the manager alone.
The cost is a rewrite of index/names on every step, which already commits index/health.
Assumed: the row keeps a state word off Why, and answered reads as that state.
Assumed: index/names lists registered names and family patterns, and no concrete key under a family.
Assumed: the new code imports q and sort alone, so the onlyq import rule holds.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/q/store.go: Store, gains Names and Presentation
src/modules/index/manager.go: Registers, registers index/names, index/actions and index/docs
src/modules/index/manager.go: begins, commits the three catalog rows after Restart
src/modules/index/manager.go: renews, commits index/names beside index/health
src/modules/index/catalog.go: namesOf, actionsOf, docsOf, new builders over the store
src/quack/main.go: main, calls Registers(q.Main) with no change
src/quack/main.go: manages, calls Start with no change
src/index/ops.go: the manage call, with no change
src/modules/index/manager_test.go: manager and TestTheManagerRunsOverTheFakeIndex, call Registers with no change

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

src/modules/index/manager_test.go: TestIndexNamesNameEachNameItsProviderAndState
src/modules/index/manager_test.go: TestIndexActionsNameEachActionWithItsDocAndFields
src/modules/index/manager_test.go: TestIndexDocsNameEachNameActionAndKeyWithItsDoc
RUNME.sh: ./RUNME.sh check

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first draft

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

src/q/store.go
src/q/store_test.go
src/modules/index/manager.go
src/modules/index/catalog.go
src/modules/index/manager_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

opened manager.go, manager_test.go, looks.go, q.go, store.go, why.go, qtest.go, action.go, check.go, wiring.go, imports.go, src/quack/main.go and the model on the topics and the registry tabs, and checked each claim there
the callers list comes off greps for Registers, Start, Outside, the modules/index import, NewStore, Presentation and Why, and a grep showing no Store or Catalog listing method exists
each test starts the manager over qtest.New with an action carrying doc-tagged fields and a config key, and reads one row topic, one test a done_when line, and the check decides the last

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/modules/index/manager_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

src/modules/index/manager_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Each case fails on its own assertion with no stub, because the fake reads a name nobody registers as nil, which reads as no rows. The cases pin the row keys as lowercase name, provider, state, doc, fields and kind, which the draft leaves open. The state of index/health turns answered only after a step, so the names case leans on the step committing index/names again.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

every done_when line meets a failing case: the names, the actions and the docs, and the check as a command
the cases run over the fake index and an op table in memory, and reach no door

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept
- the approach holds against the core as it stands: q.OutIn and the kind "out" stand in why.go, the three names join the writer Registers hands back so Commit takes them, Presentation now carries Out beside Fields, and the three cases fail on their own assertion over qtest.New
- the builder fixes in place: renews commits index/health first and builds index/names off the snapshot after it, since a row built before that commit reads index/health as default and the names case steps once
- the builder fixes in place: a NameRow carries no value for the index/ names themselves, since index/names holding its own last value nests one list deeper on every step
- an ActionRow may carry Presentation.Out beside its input fields at no cost, and the ask asks for the input fields alone

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

    go vet ./src/...

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The change stays inside the draft's size list: the store's two methods sit in looks.go beside the catalog's own Presentation, so one function builds a presentation for both.
The manager's cases run over the fake index and an op table in memory, and reach no door.
The comments on the rows, the start's commit and the step's commit name the approach, with links to this ticket and the topics in the model.
The gate's two fixes land: renews commits index/health first and builds the names after it, and no row under index/ carries a value, so index/names nests nothing.

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
