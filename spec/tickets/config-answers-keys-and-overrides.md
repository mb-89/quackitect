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
group: sidebar-switches-over
step: gate
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box d88dc33717d8 · claude-code-remote
    hash_before: 13bc68918f983603e2fa9774844673d085378537
    hash_after: 13bc68918f983603e2fa9774844673d085378537
    inputs:
      - name: ask
        hash: a85d7b24dea0e5fb
        size: 1089
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d88dc33717d8 · claude-code-remote
    hash_before: 9ab6b544d5682e034a5c7e3eab8ea60cb5baadf3
    hash_after: 9ab6b544d5682e034a5c7e3eab8ea60cb5baadf3
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/config fails
    inputs:
      - name: design/draft
        hash: 68b2bce98c183707
        size: 4426
    def: 08e16d07b0de477c
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
<!-- view, as text: the view the owner reads the change in and the number there, in the owner's words, or none -->
<!-- from, as text: handover where the ask comes off a handover line, so the owner reads it first, or none -->

The config module answers `config/keys` over `/v1`: every declared key with its declaration, the value it resolves to, and the layer answering it. Three actions stand beside it. `config/set {key, value}` writes the key into the local file, typed by its declaration. `config/override {key, value, window}` holds the value as an override for that window. `config/opened {window}` drops every override another window set.

The sidebar then reads and writes the config through the index. A new window takes its values as overrides, and leaves the local file whole. Today the sidebar parses the schema and both files itself. No route posts a change to `config/held`.

- a case under `src/modules/config` reads `config/keys` over three layers: tracked, local and override. Each key names its value and layer
- a case under `src/modules/config` posts `config/set`, and reads the key typed in the local file
- a case under `src/modules/config` posts `config/override` for two windows, then `config/opened` for a third. It reads no override left
- `./RUNME.sh check` exits 0

view: none

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

The config module in `src/modules/config/config.go` gains one value and three actions, and the root's request router gains a road into a guard.

- `config/keys`: a value derived off the layers `config/values` reads, plus the schema. `Registers` projects `spec/config/level0.schema.json` beside the two layer files, through `q.Also`, so the schema stands as `config/spec/config/level0.schema.json`. `config/keys` walks the schema's leaf entries in order. Each row carries the dotted key, the value's JSON literal and the layer answering it, through `winning`. A leaf the catalog declares no key for reads the two files alone, as `Layered` does. A key no layer sets carries its built-in literal and an empty layer.
- `config/set {key, value}`: runs the `config` verb through `nodeRun`, as the view actions in `src/modules/verbs/actions.go` do. The verb types the value off the schema, writes the local file, or the tracked file for a shared key, and logs the line.
- `config/override {key, value, window}`: lands an `override` change on `config/held`, with `Holder` set to the window. `Held` gains `By`, the holder of each override by full key name.
- `config/opened {window}`: lands a new kind, `drop`, whose step keeps the overrides the window holds and drops every other.

An action reaches no store today: `accepts` in `src/quack/main.go` routes `disk` and `node` alone. It takes the store's `Land`, and routes a request `store.land`, whose args name the fold and the event, to it. The request carries `NoUndo`, since a restart drops every override.

Weighed: `config/set` could write the local file through `disk.write`. But an action reads no layer, so it cannot merge the key into the file's text. The node verb already merges, types and logs, and phase 10 moves every `nodeRun` at once.

Assumed: two windows open side by side drop each other's overrides on open. The local file wipe did the same, so the owner loses nothing.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/modules/config/config.go Registers, which registers the schema projection, config/keys and the three actions
- src/modules/config/config.go holds, which takes the drop kind and writes By
- src/modules/config/config.go winning and Layered, which config/keys reads each row through
- src/quack/main.go accepts, which routes store.land to the store
- src/quack/main.go the index start at the Accept field, which hands accepts the store
- src/quack/main_test.go TestTheRootAcceptsDiskAndRefusesEveryOtherModule, which calls accepts
- src/quack/ticket_twins_test.go, which calls accepts
- src/quack/described_test.go and src/quack/manager_test.go, which register the config module and read the catalog
- src/quack/testdata/readers.golden.json and tree.golden.json, where the catalog's new names land
- spec/design_output/model.md the config module chapter, which names what the module writes

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/modules/config/config_test.go TestConfigKeysNameEachLayer: a key set in the tracked file, one in the local file and one overridden each read their value and layer
- src/modules/config/config_test.go TestConfigKeysCarryTheBuiltInWhereNoLayerSets: a key no layer sets reads its built-in literal and an empty layer
- src/modules/config/config_test.go TestConfigSetRunsTheConfigVerb: the action answers one node request naming config, the key and the value
- src/modules/config/config_test.go TestOpenedDropsTheOverridesOfOtherWindows: overrides for two windows, then opened for a third, leave none
- src/quack/main_test.go TestTheRootLandsAStoreRequest: a store.land request folds its event into config/held

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/modules/config/config.go
- src/modules/config/config_test.go
- src/quack/main.go
- src/quack/main_test.go
- src/quack/ticket_twins_test.go
- src/quack/testdata/readers.golden.json
- src/quack/testdata/tree.golden.json
- spec/design_output/model.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every name here stands opened on this branch: Registers, holds, winning, Layered, Held, Change in config.go; accepts and its callers in main.go, main_test.go and ticket_twins_test.go; nodeRun in actions.go and verbs.go; readConfig in cli-check.js
- git grep for accepts( and config.Registers names every caller above, and the goldens carry the catalog's names
- the three done_when cases meet TestConfigKeysNameEachLayer, TestConfigSetRunsTheConfigVerb and TestOpenedDropsTheOverridesOfOtherWindows, and the check line meets ./RUNME.sh check

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/modules/config/keys_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/modules/config/keys_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Each case fails on its own assertion: the schema stands outside the config projection's globs, and config/set and config/override name no action. The cases read the new names through the store and decode rows through JSON, so the file compiles against today's code. The router's store.land case waits for tests-green, because accepts takes the store only then, and a case naming the new signature would stop the package compiling. landsAll stands in for the router here, as the fake of the store door.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the keys line meets TestConfigKeysNameEachLayer and TestConfigKeysCarryTheBuiltInWhereNoLayerSets, the set line meets TestConfigSetRunsTheConfigVerb, the windows line meets TestOpenedDropsTheOverridesOfOtherWindows, and the check line meets ./RUNME.sh check
- the files door is the seeded files/ value, the node door is the request list the case reads, and the store door is landsAll, which folds each land request into config/held

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
