---
kind: [[ticket]]
state: closed
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
group: sidebar-lands-in-shadow
record:
  - step: design/draft
    hand: box d85821f54410d · claude-code-remote
    hash_before: 8243e1a7de64ad98a30f1457dc029d825df823d3
    hash_after: 8243e1a7de64ad98a30f1457dc029d825df823d3
    inputs:
      - name: ask
        hash: bf860f6851f1211e
        size: 611
    def: 71651f49796eeda4
  - step: design/tests-red
    hand: box d85821f54410d · claude-code-remote
    hash_before: 8fdd5630834127dd01a5c522d39744c7f62b72fc
    hash_after: 8fdd5630834127dd01a5c522d39744c7f62b72fc
    answered:
      - name: tests
        exit: 1
        said: assertion, 4 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: baa2b39c4d52bd5e
        size: 7485
      - name: [[spec/tickets/the-sidebar-renders-generically]]
        hash: dabdc9f8eb9f93af
        size: 5597
    def: 08e16d07b0de477c
  - step: design/tests-red
    hand: the engine
    stale: [[spec/tickets/the-sidebar-renders-generically]]
  - step: design/tests-red
    hand: box d85821f54410d · claude-code-remote
    hash_before: 1eb9d5ccf1ebc78c0b04dcd3bc5759e6d7450f12
    hash_after: 1eb9d5ccf1ebc78c0b04dcd3bc5759e6d7450f12
    answered:
      - name: tests
        exit: 1
        said: assertion, 4 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: baa2b39c4d52bd5e
        size: 7485
      - name: [[spec/tickets/the-sidebar-renders-generically]]
        hash: a13aa8be236faed5
        size: 13565
    def: 08e16d07b0de477c
  - step: design/tests-red
    hand: the engine
    stale: [[spec/tickets/the-sidebar-renders-generically]]
  - step: design/tests-red
    hand: box d85821f54410d · claude-code-remote
    hash_before: 0592570c20f7f5a9feb0716fcabba922399226ef
    hash_after: 0592570c20f7f5a9feb0716fcabba922399226ef
    answered:
      - name: tests
        exit: 1
        said: assertion, 4 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: baa2b39c4d52bd5e
        size: 7485
      - name: [[spec/tickets/the-sidebar-renders-generically]]
        hash: ecdfa10dc707c2ae
        size: 15191
    def: 08e16d07b0de477c
  - step: gate
    hand: box d85821f54410d · claude-code-remote · helper-7
    hash_before: 6e398c66f482cc20343a9a1387cf9d3b65bd0ebe
    hash_after: 6e398c66f482cc20343a9a1387cf9d3b65bd0ebe
    inputs:
      - name: design/draft
        hash: baa2b39c4d52bd5e
        size: 7485
      - name: design/tests-red
        hash: f196c5e02ca2a87c
        size: 1628
      - name: [[spec/tickets/the-sidebar-renders-generically]]
        hash: ecdfa10dc707c2ae
        size: 15191
    def: dc4904ab364efa10
  - step: implement/change
    hand: box d85821f54410d · claude-code-remote
    hash_before: 24747e345ce91236743ffb4aa1e1758dd8c1d42a
    hash_after: 9968d31f1606eddff4006cfef4893d93322ac5ac
    answered:
      - name: lint
        exit: 0
        said: "src/quack/main.go:192:42: MagicNumber: 3 carries a meaning here. Name it in the constants block at the top of this file,"
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box d85821f54410d · claude-code-remote
    hash_before: 10839752357784d7d3763441d0f18da6110eb178
    hash_after: 10839752357784d7d3763441d0f18da6110eb178
    answered:
      - name: tests
        exit: 0
        said: green, 39 test(s) pass in 4 file(s); green, src/q passes; green, src/quack passes; green, src/config passes; green, src/
      - name: check
        exit: 0
        said: "src/quack/main.go:192:42: MagicNumber: 3 carries a meaning here. Name it in the constants block at the top of this file,"
    inputs:
      - name: design/tests-red
        hash: f196c5e02ca2a87c
        size: 1628
    def: ec253787263043a7
  - step: accept
    skipped: true
    why: the delivery's acceptance reads this ticket
  - step: view
    skipped: true
    why: the ask names no view the owner reads
reason: done
---

# Ask

`spec/config/level0.schema.json` comes off the `q.Cfg` registrations and each key's `q.Doc`. `spec/config/level0.json`, the default file, keys by instance and then by key, and keeps the values someone sets alone. The `migration` switches keep their block, as shared keys of the `migration` module.

The schema then says what the code declares. It waits for this phase, because the extension's own keys leave JavaScript here.

- `go test ./...` from the root passes
- a regeneration over the tree leaves `git diff` empty
- `spec/config/level0.json` holds no key at its built-in value
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

Every key the tree reads gets a Go declaration, the schema comes off the catalog, and each reader road takes the built-in value off the schema's `default` where no file sets the key. So the default file drops every key at its built-in value, and no reader changes behaviour.

| part | file | what changes |
|---|---|---|
| the options | `src/q/q.go`, `src/q/wiring.go` | `q.Unit(text)` and `q.Enum(values...)` join `q.Doc`. `Key` gains `Doc`, `Unit`, `Enum`, `Type`, the JSON type off the Go type, and `Default`, the built-in as a JSON literal |
| the declarations | `src/modules/settings/settings.go`, new | a table of sections, each key with its built-in, doc, unit and enum. Each built-in is the value the default file holds today, and each doc is the schema's `help` today. `settings.Of(section)` registers one section's keys |
| the loading | `src/quack/main.go`, `modules`; `spec/wiring.yaml` | a section with no module loads as an instance of its own name, of the type `settings.Of(section)`. The `work` and `log` instances join their section's keys to their own registration. The manager's `watchdog/beat` and `watchdog/lease` stay where they stand |
| the migration switches | `src/modules/migration/migration.go` | declares every `phaseN` key as shared, built-in `false`, beside the slice keys |
| the generator | `src/quack/schema.go`, new; `quack schema` and `quack schema --write` | loads the wiring into a catalog, writes one object a section and one member a key: `type`, `default`, `help` off the doc, `unit`, `enum`. It then lays the drawing members of `spec/config/draws.json` over each entry, sections and members in name order. It writes no `required` and no `comment` member |
| the drawing | `spec/config/draws.json`, new | the members the sidebar draws today, taken as they stand: `widget`, `icon`, `group`, `row`, `column`, the spans, `runs`, `gesture`, `asks` and the rest, and the entries that name no key, such as `bridge.hook`. [[spec/tickets/the-sidebar-renders-generically]] moves them onto the base files |
| the default file | `spec/config/level0.json` | keeps the `migration` block's values off their built-ins, and nothing else. Every `comment` member goes, since the doc carries the help |
| the JavaScript resolver | `.claude/skills/level0/lib/config.js`, `configOf`, `faultsIn` | a new export `builtInsOf(schema)` reads each `default`, and `configOf` answers it as the lowest layer, named `built-in`. `faultsIn` names a wrong type alone, since a missing key reads its built-in |
| the door's reads | `src/bridge/config.js`, `asks`, `whereFrom`, `asksText` | read the schema at the method root, and answer its `default` last, with the layer `built-in` |
| the sidebar | `src/extension/lib/widgets.js`, `valuesOf` | takes the schema third, and lays the built-ins under the two files |
| the slash commands | `.claude/skills/level0/lib/projection.js` | writes a command for every declared key, reading the built-in where the file holds none |
| the Go reader | `src/config/config.go`, `Where` | answers the schema's `default` last, with the layer `built-in`, so `Count`, `Value` and every Go importer read it |
| the LSP slice | `src/lsp/shadow.go` | reads `migration.lsp` through `config.Value`, so the built-in `old` answers |
| the check module | `src/modules/check/sweep.go`, `countOf` | reads the schema's `default` off `files/` last |
| the note | `spec/design_output/config.md`, the layers and the schema chapters | the built-in layer stands under the tracked file, the schema comes off the declarations, and `quack schema --write` writes it |

`src/scripts/work-stands.js` reads a switch off `main` as `=== true`. A switch the owner turns on differs from its built-in `false`, so it stays in the file, and that read stands unchanged.

What I weigh and assume:
- A table in one Go package over a module a section. Nineteen modules declaring keys and nothing else scatter one file's worth of knowledge. The sections become instances all the same, so the file keys by instance and then by key.
- A drawing overlay beside the schema, so the old sidebar keeps drawing through this phase. The next child moves it off, and the file leaves at the switch-over.
- The slice key follows the code's form, `migration/config/<slice>`, which every slice before this one takes.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- `src/modules/config/config.go`, `Registers`, which resolves over `c.Keys()`
- `src/quack/config.go`, `sharedKeys`, over `c.Keys()`
- `src/quack/main.go`, `modules` and `load`, which take the new module types
- `.claude/skills/level0/lib/config.js`, `configOf`, called from `src/scripts/cli-doors.js`, `src/bridge/findings.js` and `src/scripts/config-golden.js`, `readersOf`
- `.claude/skills/level0/lib/config.js`, `faultsIn`, called inside `configOf().faults`
- `src/bridge/config.js`, `asks`, called from `src/bridge/code.js`, `bash.js`, `plan.js`, `handover.js`, `agent.js`, `server.js`, `guidance.js`, `wait.js`, `stop.js`, `answer-read.js` and `ask.js`
- `src/bridge/config.js`, `asksText`, called from `src/scripts/copilot-shadow.js`, `src/bridge/cage-shadow.js`, `prose.js`, `server.js` and `src/scripts/config-golden.js`
- `src/bridge/config.js`, `whereFrom`, called from `src/bridge/binding.js` and `src/scripts/config-golden.js`
- `src/extension/lib/widgets.js`, `valuesOf`, called four times in `src/extension/sidebar.js`, `sidebarOf`, and in `src/scripts/config-golden.js`, `readersOf`
- `.claude/skills/level0/lib/projection.js`, the config entry's loop, run by `./RUNME.sh project`
- `src/config/config.go`, `Where` through `Count` and `Value`: `src/modules/index/lease.go`, `src/modules/index/ops.go`, `src/lsp/config.go`, `src/index/beats.go`, `src/tui/main.go`
- `src/lsp/shadow.go`, the slice read, which moves off `config.Map` onto `config.Value`
- `src/modules/check/sweep.go`, `countOf`, called from `sweepOf`
- `src/modules/migration/migration.go`, `Registers`, loaded by the wiring as `migration`

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- `src/q/keys_test.go`, `TestKeysCarryDocUnitEnumAndDefault`
- `src/quack/schema_test.go`, `TestSchemaStandsAsGenerated`, which decides the regeneration line
- `src/quack/schema_test.go`, `TestDefaultFileHoldsNoBuiltIn`, which decides the built-in line
- `src/quack/schema_test.go`, `TestEveryTrackedKeyIsDeclared`
- `src/config/config_test.go`, `TestWhereAnswersTheBuiltIn`
- `src/modules/check/sweep_test.go`, `TestCountReadsTheBuiltIn`
- `test/level0/config.test.js`, `a key no file sets resolves to its built-in`
- `test/level0/config-door.test.js`, `asks answers the built-in where no file sets the key`
- `test/level0/widgets.test.js`, `valuesOf lays the built-ins under the files`
- `test/level0/projection.test.js`, `a key at its built-in keeps its command`

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first draft, so no earlier review names a finding

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file, function and verb the approach names stands opened: `q.go`, `wiring.go` with `CfgIn` and `Keys`, `quack/main.go`, `quack/config.go`, `migration.go`, `modules/config/config.go`, `src/config/config.go`, `lib/config.js` with `configOf`, `bridge/config.js`, `widgets.js`, `projection.js`, `sweep.go`, `work-stands.js` and `lsp/shadow.go`
- the callers list comes off a search for each changed function across `src` and `.claude`
- `go test ./...` passing rides `./RUNME.sh check`; the regeneration line rides `TestSchemaStandsAsGenerated`; the built-in line rides `TestDefaultFileHoldsNoBuiltIn`; `./RUNME.sh check` exits 0 on the branch before the hand-back

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test test/level0/config.test.js test/level0/config-door.test.js test/level0/widgets.test.js test/level0/projection-builtin.test.js src/q src/quack src/config src/modules/check

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/q/keys_test.go
- src/quack/schema_test.go
- src/config/config_test.go
- src/modules/check/sweep_test.go
- test/level0/config.test.js
- test/level0/config-door.test.js
- test/level0/widgets.test.js
- test/level0/projection-builtin.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Every new case fails on its own assertion. The Go cases compile against stubs: `q.Unit` and `q.Enum` set nothing, the new `Key` fields stand empty, and `schemaText` answers nothing. `catalogOf` and `dottedOf` already stand whole, since the cases need them to read the catalog. What surprises me: `TestDefaultFileHoldsNoBuiltIn` passed at first, because an empty built-in matches no literal. So it now fails a declared key with no built-in as well. The manager's `watchdog.beat` and `watchdog.lease` read under their section name, with no instance, which is how the file holds them. The projection case stands in a file of its own, because `test/level0/projection.test.js` sits at the file ceiling.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the go test line rides `./RUNME.sh check`, which runs the Go folders; the regeneration line meets `TestSchemaStandsAsGenerated`; the built-in line meets `TestDefaultFileHoldsNoBuiltIn`; the check line is a checkpoint the hand answers at tests-green, since no red test decides the whole check
- the tests reach the disk alone: the Go cases write a temp root or read the tree read-only, and the JavaScript cases take `fakeDisk` from `src/doors/fake`

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept
- The approach answers the ask, and the eight red files fail on their own assertion.
- The regeneration line meets TestSchemaStandsAsGenerated, and the built-in line meets TestDefaultFileHoldsNoBuiltIn.
- The go test line rides the Go cases, and the check line stands a checkpoint at tests-green.
- Missed caller: src/quack/config.go configRows lists only keys the files hold.
- configAt feeds quack config and modeOf in src/quack/verbs.go, so ./RUNME.sh config drops every built-in key.
- Lay the catalog's Default under the files there, with the layer built-in.
- The draft's tests list names test/level0/projection.test.js, and the red case stands in projection-builtin.test.js.

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

go build ./... && ./RUNME.sh lint

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the files the draft's table names, plus what the gate and the check reached: src/modules/settings for the declarations, spec/wiring.yaml for the section instances, src/config Shared for the shared slice read, the size golden for the schema's new length, three new slash commands the projection writes, and the tests reading the default file whole, which now read it over the built-ins through underBuiltIns
- the change reaches no new door: the Go readers read the schema through the same file reads they held, the check module walks the schema text it already takes, and the JavaScript cases take fakeDisk
- each changed function carries a comment naming the-config-schema-gets-generated or the design_output chapter it implements
- each key's built-in, help, unit and options stand once, in its Go declaration; the schema and the slash commands come off it, the default file holds the migration block's values alone, and spec/design_output/config.md points at the generator instead of listing keys
- the gate's configRows point: quack config lays each declared key's built-in under the files, with the layer built-in, and the catalog now loads the manager beside the wiring there
- the gate's test list point: the projection case stands in test/level0/projection-builtin.test.js, which the tests-red record already names
- the drawn sections stand first in the schema in draws.json's order, so the sidebar keeps its group order; the draft said name order, and name order moves the engine group above the work group
- go test ./... fails on src/modules/index TestActionRowsCarryLabelAndIcon alone, the red test of the-sidebar-renders-generically, which its own implement step turns green

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh test test/level0/config.test.js test/level0/config-door.test.js test/level0/widgets.test.js test/level0/projection-builtin.test.js src/q src/quack src/config src/modules/check

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Every key the tree reads now has a Go declaration with its built-in value, its help, its unit and its options. The settings module declares the sections no module owns, and the migration module declares every phase switch as false. The command `go run ./src/quack schema --write` writes the schema off those declarations. It lays `spec/config/draws.json` over the entries the sidebar draws.

Every reader answers the schema's `default` where no file sets a key, under the layer `built-in`. So the default file keeps the migration block alone, and no reader changes what it answers.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- The change stays inside the config readers, the declarations and the tests reading the default file.
- No new door: each reader reads the schema through the file reads it held.
- Each changed function names this ticket or its design chapter.
- Each key's facts stand once, in its Go declaration.
- The design note points at the generator, and lists no key.
- The whole Go tree passes but one case, the red test of the sidebar ticket in this group.

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
