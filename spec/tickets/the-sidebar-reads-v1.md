---
kind: [[ticket]]
state: closed
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
group: sidebar-switches-over
depends_on: [config-answers-keys-and-overrides]
step: view
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box d88dc33717d8 · claude-code-remote
    hash_before: 47c12695b7948cf351d6d3a4bd83225b6e842ee9
    hash_after: 47c12695b7948cf351d6d3a4bd83225b6e842ee9
    inputs:
      - name: ask
        hash: 15d474e44d438e62
        size: 920
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d88ef4f8a2d6 · claude-code-remote
    hash_before: 68e016c087952c1b91beb510d5bd8cbaa6ef8d8d
    hash_after: 68e016c087952c1b91beb510d5bd8cbaa6ef8d8d
    answered:
      - name: tests
        exit: 1
        said: assertion, 4 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: d8e34f6fff8ed198
        size: 5290
    def: 08e16d07b0de477c
  - step: gate
    hand: box d88ef4f8a2d6 · claude-code-remote
    hash_before: 35cdd68eb7074298f469c6a6778e1ac9ae0d7827
    hash_after: 35cdd68eb7074298f469c6a6778e1ac9ae0d7827
    inputs:
      - name: design/draft
        hash: d8e34f6fff8ed198
        size: 5290
      - name: design/tests-red
        hash: 391eea19266a6d16
        size: 1863
    def: dc4904ab364efa10
  - step: implement/change
    hand: box d88ef4f8a2d6 · claude-code-remote
    hash_before: 6b6356f68faf019d065a50cea66dc10e06602d69
    hash_after: 6b6356f68faf019d065a50cea66dc10e06602d69
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box d88ef4f8a2d6 · claude-code-remote
    hash_before: 2dc4510756881159e9092ac690acbb1c4b784be1
    hash_after: 2dc4510756881159e9092ac690acbb1c4b784be1
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/config passes
      - name: check
        exit: 0
        said: "spec/tickets/the-sidebar-reads-v1.md:377:128: Vocabulary: orderedof stands outside the words this tree writes. Write a c"
    inputs:
      - name: design/tests-red
        hash: 391eea19266a6d16
        size: 1863
    def: ec253787263043a7
  - step: accept
    skipped: true
    why: the delivery's acceptance reads this ticket
  - step: view
    hand: box d88ef4f8a2d6 · claude-code-remote
    hash_before: 9d2b4b79af20952afc346b3a7b69ace3744819af
    hash_after: 9d2b4b79af20952afc346b3a7b69ace3744819af
    inputs:
      - name: ask
        hash: 15d474e44d438e62
        size: 920
      - name: implement/tests-green
        hash: 0d9cbc31ca76ec98
        size: 2207
    def: 561b3819e1683d37
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
<!-- view, as text: the view the owner reads the change in and the number there, in the owner's words, or none -->
<!-- from, as text: handover where the ask comes off a handover line, so the owner reads it first, or none -->

The sidebar draws off `/v1` values alone, and wakes on `/v1/watch`. It reads `config/keys`, `migration/config/sidebar`, the bless value, `work/open-tasks` and the parsed view bases. The index door gains a watch client, and the sidebar's file watches leave.

Today `sidebar.js` reads the schema, both config files and the bless file through the door. It lists and parses `spec/views` with a reader it imports out of the tree. It counts the badge through a verb spawn. So the sidebar computes a second copy of what the index holds.

- `git grep -n 'door.read\|door.list\|door.imports\|door.watch' src/extension/sidebar.js` answers nothing
- a case under `test/level0` draws the sidebar over a fake index, with the config tree and the views whole
- a case under `test/level0` sends a watch event, and reads the sidebar drawn again
- `./RUNME.sh check` exits 0

view: the sidebar, and the count on the work badge

from: none

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

The sidebar takes every value it draws off the index door, and wakes on one watch over the same names.

1. The index gains the three values it lacks, each a projection beside the ones standing:
   - `src/modules/config/config.go` adds `q.Also("spec/config/level0.schema.json")` to the config projection, so the schema answers at `config/spec/config/level0.schema.json`.
   - `src/modules/verbs/bless.go` projects the runtime bless file as JSON under `bless/<path...>`, optional, beside the `ticket/bless` action.
   - `src/modules/views/views.go` projects `spec/views/*.base` through a YAML codec off `src/yaml.Read`, and derives `views/bases`: every base as `{name, said}`, in name order. `src/modules/modules.go` registers it.
2. `src/extension/editor-index.js` gains `watch(names, fn)`: a GET on `/v1/watch?names=...` read as server-sent events, one `fn(name, value)` an event, and a `stop()` it returns. A stream the index ends opens again after a pause, because the index restarts under a window.
3. `src/extension/sidebar.js` reads through `door.index.values(name)` alone:
   - `readAll` reads `config/keys`, the schema value and the two file projections `config/spec/config/level0.json` and `config/.se/.runtime/config.json`. `valuesOf` gives way to `valuesOfKeys(rows, schema)` in `src/extension/lib/widgets.js`, which maps each row to its value and layer. `treeIn` takes the two projections.
   - `html` reads `migration/config/sidebar` for the slice, the bless projection for the bless button, and `views/bases` for the bases. `basesIn` and the YAML import leave.
   - `counted` reads each cell's value by `nameIn(cell.counts)`, which moves out of `lib/views-shadow.js` into `lib/work.js`, so the badge reads `work/open-tasks` and spawns no verb.
   - `set` and `opened` read the local file off its projection, and write it as the door writes today. `newTicket` asks `tickets/notes/<path>` whether the file stands. `shows` reads `log/rows`. Their writes stay for the-sidebar-writes-through-actions.
   - `watches` and `counts` leave, and `names` takes their place: every value name above.
4. `src/extension/extension.js` swaps both `door.watch(sidebar.watches, ...)` calls and `door.watch(sidebar.counts, ...)` for `door.index.watch(sidebar.names, ...)`, and keeps the `settled` burst on the panel draw.

Outside this ticket: `pullsNext` keeps `door.asksVerb` for the-lens-calls-actions, the `door.read(SCHEMA)` in `activate` leaves with the-extension-reads-no-files, and the shadow compare stays until that ticket drops it.

What I weigh and assume: the grep line reaches `set`, `opened`, `newTicket` and `shows`, so their reads move here and their writes stay put, and the writes sibling posts actions over reads that already come off the index. I assume a derived `views/bases` over the projection, in the shape `work/rows` takes over the notes, where the catalog lists no instances of a projection.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/extension/extension.js activate: sidebarOf, sidebar.watches, sidebar.counts, sidebar.states, sidebar.html
- src/extension/editor.js editorDoor: indexDoor
- src/extension/lib/views-shadow.js apartOf: nameIn
- test/level0/sidebar.test.js: sidebarOf over a fake door
- test/level0/sidebar-work.test.js: sidebarOf, SCHEMA
- test/level0/sidebar-views.test.js: sidebarOf, SCHEMA
- test/level0/lens-actions.test.js: sidebarOf, SCHEMA
- test/contract/editor-index.test.js: indexDoor
- src/modules/modules.go: the module list the views module joins

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- test/level0/sidebar-v1.test.js: the sidebar draws the config tree and the views off a fake index
- test/level0/sidebar-v1.test.js: the work badge reads work/open-tasks off the index, and spawns no verb
- test/level0/sidebar-v1.test.js: a watch event draws the sidebar again
- test/level0/sidebar-v1.test.js: sidebar.js names no door.read, door.list, door.imports or door.watch
- test/contract/editor-index.test.js: watch hands each named value, then a change
- src/modules/views/views_test.go: TestViewsBasesParsesEachBase
- src/modules/verbs/bless_test.go: TestBlessProjectsTheFile
- src/modules/config/config_test.go: TestSchemaProjects

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/extension/sidebar.js
- src/extension/editor-index.js
- src/extension/extension.js
- src/extension/lib/widgets.js
- src/extension/lib/work.js
- src/extension/lib/views-shadow.js
- src/modules/config/config.go
- src/modules/verbs/bless.go
- src/modules/views/views.go
- src/modules/modules.go
- src/modules/config/config_test.go
- src/modules/verbs/bless_test.go
- src/modules/views/views_test.go
- test/level0/sidebar-v1.test.js
- test/level0/sidebar.test.js
- test/level0/sidebar-work.test.js
- test/level0/sidebar-views.test.js
- test/level0/lens-actions.test.js
- test/contract/editor-index.test.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- opened sidebar.js, editor-index.js, extension.js, views-shadow.js, widgets.js, config.go, keys.go, v1.go, codec.go, markdown.go and src/yaml, and read the live catalog for every name the approach reads
- the callers list names every file that requires sidebar.js or editor-index.js, and the one that imports nameIn
- each done_when line meets a test: the grep and the fake index in sidebar-v1.test.js, the watch in sidebar-v1.test.js and editor-index.test.js, and the check in its own run

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test test/level0/sidebar-v1.test.js && ./RUNME.sh test test/contract/editor-index.test.js && ./RUNME.sh test src/modules/views/views_test.go && ./RUNME.sh test src/modules/holds/holds_test.go && ./RUNME.sh test src/modules/config/config_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- test/level0/sidebar-v1.test.js
- test/contract/editor-index.test.js
- src/modules/views/views_test.go
- src/modules/holds/holds_test.go
- src/modules/config/config_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Each case fails on its own assertion: the schema stands outside the config globs, bless/ and views/bases name no provider, the index door carries no watch, and the sidebar reads files, spawns the count and watches files. Three things differ from the draft, and the gate weighs them. First, q.Ordered carries no MarshalJSON, so /v1 hands a config projection field by field as Keys, Fields, Items and Literal, and the fake index answers that form: the sidebar decodes it, or q.Ordered gains its JSON form. Second, src/modules/modules.go registers nothing: the queue and holds projections load unprefixed through projected in src/quack/main.go, so views.Registers joins that list, and views.go stands as an empty Registers so its case compiles. Third, the bless projection joins holds.Registers, the other runtime file the agent's state stands in, in place of a new verbs file. The watch case drives the settled burst through a fake later, so it waits on no clock.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every done_when line meets a failing case: the grep in sidebar-v1.test.js, the fake index draw in sidebar-v1.test.js, the watch event in sidebar-v1.test.js and editor-index.test.js, and the check line in its own run at tests-green
- the index door is faked in sidebar-v1.test.js with values, calls and watch, and the contract case drives the real door against a real SSE server; the Go cases seed files/ through q/qtest

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

pass
- the approach answers the ask: every value the sidebar draws moves onto index.values, one index watch replaces the three file watches, and the count reads work/open-tasks with no spawn
- each done_when line meets a red case: the grep and the fake index draw and the watch redraw in test/level0/sidebar-v1.test.js, the watch stream in test/contract/editor-index.test.js, and the check at tests-green
- fix in place: src/modules/modules.go registers nothing, so views.Registers joins projected in src/quack/main.go beside queue and holds, which load unprefixed, and size names main.go in place of modules.go
- fix in place: q.Ordered carries no MarshalJSON, so /v1 hands each config and bless projection as Keys, Fields, Items and Literal; the sidebar decodes that form in one helper under src/extension/lib, since a JSON form on q.Ordered reaches every /v1 reader past this ask
- fix in place: the bless projection joins holds.Registers in src/modules/holds/holds.go in place of a new src/modules/verbs/bless.go, and TestBlessProjectsTheFile stands in holds_test.go
- weighed: the size reaches four old sidebar tests, which the change moves to the index door where they read files; each rides the same ask

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint src/modules/views src/modules/holds src/modules/config src/quack/main.go src/extension test/level0/sidebar-v1.test.js test/level0/v1-index.js test/level0/sidebar.test.js test/level0/sidebar-work.test.js test/level0/sidebar-views.test.js test/contract/editor-index.test.js test/contract/sidebar-reads-no-file.test.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the files the size names, with main.go for modules.go and holds.go for a new bless.go as the gate says, plus test/level0/v1-index.js as the shared fake index and test/contract/sidebar-reads-no-file.test.js, where the grep case moves since it reads the real tree
- the index door has its fake in test/level0/v1-index.js, which answers each value off the fake disk as the Go modules do, and the real door meets a real server in test/contract/editor-index.test.js
- each new function and constant carries a link to spec/tickets/the-sidebar-reads-v1 or the design section it implements
- every name the sidebar reads stands once in sidebar.js under NAMES, the bless path's copies name folders.js beside them, and orderedOf stands once in v1-index.js

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh test test/level0/sidebar-v1.test.js && ./RUNME.sh test test/contract/editor-index.test.js && ./RUNME.sh test src/modules/views/views_test.go && ./RUNME.sh test src/modules/holds/holds_test.go && ./RUNME.sh test src/modules/config/config_test.go

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The sidebar draws every value off the index door. The config tree, the widgets and the status bar read config/keys and the three config projections. The work badge reads work/open-tasks, the views section reads views/bases, and the bless button reads bless/agent. No verb spawns and no file is read. The index door gains watch, a reader of /v1/watch that opens again after a pause, and the extension wakes the status bar and the panel on it in place of three file watches. The index gains three names: the schema joins the config projection, bless/agent derives off the bless file beside the holds, and views/bases derives off the base files in a new views module loaded through projected in src/quack/main.go. bless/agent is a derived bool, since a loaded projection round-trips its file and the sidebar writes the bless file compact. The sidebar reads the field-by-field form /v1 hands a config projection in, through plainOf in src/extension/lib/values.js. A live index here answers every watched name, and the sidebar drawn over it shows the badge at the count work/open-tasks reads. The lens ticket case pull for me takes the first row of work/yours now needs its fake index to answer the schema value, and orderedOf in test/level0/v1-index.js builds it.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change stays within the size the gate weighed: the sidebar, its door and helpers, the three Go modules, main.go and the sidebar cases, plus the shared fake index and the grep case under test/contract
- the index door has its fake in test/level0/v1-index.js, and the real door meets a real SSE server in test/contract/editor-index.test.js
- each new function and constant links spec/tickets/the-sidebar-reads-v1 or the design section it implements
- every name the sidebar reads stands once under NAMES in sidebar.js, both copies of the bless path name folders.js beside them, and orderedOf stands once in v1-index.js

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

pass
- no editor runs on this cloud box, so the view is the real sidebar module drawn over the live index door: the work badge reads 12, and work/open-tasks on /v1 reads 12
- the same draw carries the views section off views/bases and the config tree off the projections, and /v1/watch streams every watched name

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
