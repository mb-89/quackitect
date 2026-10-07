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
        checklist: ["every file, function and verb the approach names stands opened, and each claim checked there", "the callers list names every caller of what the approach changes", "every done_when line names the test that decides it", "every config key the approach adds names each default file it lands in"]
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
process_hash: c671f20a6ae2a4a6
group: javascript-leaves
depends_on: ["tree-libs-leave"]
step: gate
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box b1ba21c2e626 · claude-code-remote
    hash_before: 8c06217f9ef4272004e7960e0c9015664acb8076
    hash_after: 8c06217f9ef4272004e7960e0c9015664acb8076
    inputs:
      - name: ask
        hash: c28f6d7555e8edae
        size: 369
    def: c01ae0f2ace0cecb
  - step: design/tests-red
    hand: box b1ba21c2e626 · claude-code-remote
    hash_before: 3f7b91bccec44914d3dc6145de242ca71aed7440
    hash_after: 3f7b91bccec44914d3dc6145de242ca71aed7440
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/quack fails
    inputs:
      - name: design/draft
        hash: f5412ff3e27f4a4a
        size: 7883
    def: 08e16d07b0de477c
---

# Ask

The config reader and its layers leave the plugin library, so src/modules/config answers every key alone.

The JavaScript config reader keeps a second copy of the layers, and a key changes in two languages.

- `git ls-files .claude/skills/level0/lib/{config,layer}.js` answers nothing
- `go test ./src/modules/config/...` passes
- `./RUNME.sh check` exits 0

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

1. config.js and layer.js leave the plugin library, with test/level0/config.test.js and test/level0/layer.test.js.
2. No staying library or hook imports either file. Only config.js imports layer.js, and both leave.
3. Go owns the layers already: q.AtRest and q.Settled in src/q/layers.go, and config.Rows in src/modules/config/keys.go.
4. Go owns the verb rules: configFaults, coerced and settingAt in src/quack/verb_config.go. projection.Inherits owns the root join.
5. q.EnvOf kebabs each segment before it shouts, so stop.mostInARow reads SE_STOP_MOST_IN_A_ROW as config.md says.
6. Today q.EnvOf names SE_STOP_MOSTINAROW for the camel spelling and SE_STOP_MOST_IN_A_ROW for the kebab one, so one key names two variables.
7. src/modules/config/env_test.go gains the camel rows. keys_test.go gains a Rows case over a key the local file alone names.
8. configRows in src/quack/config.go reads a local file holding no JSON as empty, as orderedAt and src/config already do.
9. verb_config_test.go gains a coerced table, a write of an undeclared key into a root with no .se folder, and two shipped-tree cases.
10. The shipped cases read treeRoot. configFaults names nothing, no judge section stands, and every declared key names a variable of its own.
11. projection_test.go gains a table over Inherits: either root answers Exists, a lone file comes down, and the union keeps the work entry.
12. tree.test.js drops its schema-fault and variable cases and the config.js import. It spells TRACKED and SCHEMA with a pointer at src/q/layers.go.
13. tree-extension.test.js reads TRACKED and valuesOf from src/extension/lib/widgets.js, and spells SCHEMA as test/level0/v1-index.js does.
14. Its widget case checks each drawn key against valuesOf over the tracked file and the schema, in place of flatten and underBuiltIns.
15. The comments naming the level0 lib or layer.js in verb_config.go, projection/tree.go and Layered in guidance.go name their Go owner.
16. config.md names the Go owner in each section naming a config.js function, and drops the keyOf direction, since Go reads no variable back.
17. extension.md drops its fold-together bullet. rationales/extension.md names settingAt, migration.md drops lib/config.js, and work.md names flatten in src/branches/stands.go.
18. src/quack/config_libs_test.go globs both libraries and both leaving tests through filepath.Glob, and stays red until they leave.
Weighed: keeping q.EnvOf and rewriting config.md to SE_STOP_MOSTINAROW. That breaks the documented name a person sets, and keeps two variables for one key.
Weighed: porting the case where the local file beats the variable. Go and config.md put the variable first, so that JavaScript case leaves with no port.
Weighed: porting the method root config join of configOf. No live caller hands it a stack, and no Go config reader joins the method root.
Weighed: porting the editor schema case of tree.test.js to Go. It reads two constants alone, and the parent slice decides the rest of that file.
Weighed: fixing the layer order line in src/projection/commands.go here. It says the local file beats the variable, and the fix regenerates every command file, so a note takes it.
Weighed: renaming src/bridge/config.js in the Drop comment of src/config/config.go. That names no leaving library, so a note takes it.
Assumed: keysOf, typeOf, builtInsOf and underBuiltIns take no port, since the catalog declares every key and Rows lays the built-ins.
Assumed: layered and its layer field take no port, since no code reads the layer of a listed entry.
Assumed: the same-root case of inherits takes no port, since verb_project.go skips Inherits where both roots match.
Assumed: guidance-lib-leaves edits the comment at guidance.go line 37 and this ticket the one at line 54, so the two rebase over one file.
Assumed: the parent last slice takes the session-file case and the count chain case left in tree.test.js.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- test/level0/config.test.js: every case, reading configOf, flatten, varOf, keyOf, keysOf, coerce, faultsIn, underBuiltIns, LOCAL and TRACKED
- test/level0/layer.test.js: every case, reading configOf, deeply, inherits, layered and rooted
- test/contract/tree.test.js: the schema-fault and variable cases, reading configOf, faultsIn, flatten, keyOf and varOf
- test/contract/tree.test.js: the count chain and editor schema cases, reading SCHEMA and TRACKED
- test/contract/tree-extension.test.js: the widget key case, reading flatten and underBuiltIns
- test/contract/tree-extension.test.js: the grid, draw and command cases, reading SCHEMA and TRACKED
- .claude/skills/level0/lib/config.js: configOf and underBuiltIns, which read deeply from layer.js
- src/q/layers.go: EnvOf, called by AtRest in the same file
- src/config/config.go: EnvOf and Where, which call q.EnvOf
- src/modules/config/config.go: EnvOf, which calls q.EnvOf
- src/quack/config.go: configRows, which configAt in src/quack/main.go calls
- src/quack/main.go: configAt, read by configVerb and configLevel in src/quack/verb_config.go
- src/quack/verb_config.go: the configFaults, settingAt and coerced comments naming the level0 lib
- src/projection/tree.go: the header, Tree and layerParsed comments naming layer.js
- src/modules/guidance/guidance.go: the Layered comment naming inherits in the level0 lib
- spec/design_output/config.md: scope, a key names a path, a variable names a key, the schema says the type, the resolver holds the layers
- spec/design_output/extension.md: the open bullet naming lib/config.js
- spec/design_output/migration.md: the config resolution row naming lib/config.js
- spec/design_output/work.md: the readWork line naming flatten in the one resolver
- spec/rationales/extension.md: the folder-is-the-unit paragraph naming lib/config.js

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/quack/config_libs_test.go: TestTheConfigLibrariesStandNowhere
- src/modules/config/env_test.go: TestAKeyNamesOneVariableHoweverItsLeafIsSpelled
- src/modules/config/keys_test.go: TestRowsReadEveryLeafOfBothFilesPastTheComment
- src/quack/config_test.go: TestConfigRowsReadALocalFileHoldingNoJSONAsEmpty
- src/quack/verb_config_test.go: TestCoercedTypesATextAsTheCatalogSays
- src/quack/verb_config_test.go: TestConfigWritesAKeyTheCatalogLeavesOutAsItsText
- src/quack/verb_config_test.go: TestTheShippedConfigCarriesNoTypeFaultAndNoJudge
- src/quack/verb_config_test.go: TestEveryShippedKeyNamesAVariableOfItsOwn
- src/projection/projection_test.go: TestInheritsReadsTheWorkRootOverTheMethodRoot

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first: no review has read this draft

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- .claude/skills/level0/lib/config.js
- .claude/skills/level0/lib/layer.js
- test/level0/config.test.js
- test/level0/layer.test.js
- test/contract/tree.test.js
- test/contract/tree-extension.test.js
- src/q/layers.go
- src/modules/config/env_test.go
- src/modules/config/keys_test.go
- src/quack/config.go
- src/quack/config_test.go
- src/quack/verb_config.go
- src/quack/verb_config_test.go
- src/quack/config_libs_test.go
- src/projection/tree.go
- src/projection/projection_test.go
- src/modules/guidance/guidance.go
- spec/design_output/config.md
- spec/design_output/extension.md
- spec/design_output/migration.md
- spec/design_output/work.md
- spec/rationales/extension.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file, function and verb named stands opened and checked: config.js, layer.js, q.EnvOf, AtRest, Kebab, Rows, leavesOf, configRows, configAt, configFaults, coerced, settingAt, Inherits, valuesOf, Layered and the config verb
- the callers come from git grep on both files and every export over hooks, lib, src, src/extension, test, RUNME.sh, package.json, .github, Go comments and notes
- TestTheConfigLibrariesStandNowhere decides the git ls-files line, the env and keys tests decide go test ./src/modules/config, and ./RUNME.sh check at tests-green decides the third
- the approach adds no config key, so no default file changes

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/config_libs_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/quack/config_libs_test.go
- src/quack/config_test.go
- src/quack/verb_config_test.go
- src/modules/config/env_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

TestTheConfigLibrariesStandNowhere fails on its assertion and names config.js, layer.js and both leaving tests.
TestAKeyNamesOneVariableHoweverItsLeafIsSpelled fails because q.EnvOf answers SE_STOP_MOSTINAROW and SE_PLAN_EVERYCALLS.
Its Rows row also fails, since SE_STOP_MOST_IN_A_ROW answers no row for stop.mostInARow today.
TestEveryShippedKeyNamesAVariableOfItsOwn fails on its assertion and names every shipped camel key.
TestConfigRowsReadALocalFileHoldingNoJSONAsEmpty fails because configRows answers a parse error.
Some rows pass now because Go already holds the behavior.
TestRowsReadEveryLeafOfBothFilesPastTheComment and TestCoercedTypesATextAsTheCatalogSays pass now.
TestConfigWritesAKeyTheCatalogLeavesOutAsItsText and TestTheShippedConfigCarriesNoTypeFaultAndNoJudge pass now.
TestInheritsReadsTheWorkRootOverTheMethodRoot passes now, so src/projection stands green.
One surprise: the config module declares keys like watchdog.lease with no instance.
The first variable case read off Instance and Local, and wanted SE__WATCHDOG_LEASE.
The variable case therefore kebabs each dotted segment instead.
No stub was needed, since every Go owner already exists.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

TestTheConfigLibrariesStandNowhere decides the git ls-files line, and env_test decides the go test line. The check at tests-green decides the third.
The tests reach no door. Module rows run in memory, and the quack cases use temp roots and read the tree through Glob and ReadFile.

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
