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
step: implement/change
process: [[spec/processes/standard]]
process_hash: 22b42ea1501e8967
group: the-foundation-closes-its-gaps
depends_on: [qtest-holds-a-module]
record:
  - step: design/draft
    hand: box d7e10c2f00cd · claude-code-remote
    hash_before: 0021c6a5274f7ab441ac241308a519decb197279
    hash_after: 0021c6a5274f7ab441ac241308a519decb197279
    inputs:
      - name: ask
        hash: 6406669fb6ef6554
        size: 872
      - name: [[spec/design_output/model]]
        hash: eb315d7a681bc4e4
        size: 74362
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d7e10c2f00cd · claude-code-remote
    hash_before: e1c5cff8e115ed94f00771ce4ac6f5ac1a8559ad
    hash_after: e1c5cff8e115ed94f00771ce4ac6f5ac1a8559ad
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/q fails
    inputs:
      - name: design/draft
        hash: 58296f0a043bc171
        size: 4966
    def: 08e16d07b0de477c
  - step: gate
    hand: box d7e10c2f00cd · claude-code-remote · helper-3
    hash_before: fcd4bd97fa3479140c65a53184b8269df01983f5
    hash_after: fcd4bd97fa3479140c65a53184b8269df01983f5
    inputs:
      - name: design/draft
        hash: 58296f0a043bc171
        size: 4966
      - name: design/tests-red
        hash: c7cf080aaa594786
        size: 1024
    def: dc4904ab364efa10
---

# Ask

A module declares local ports alone, with the tag `q:"<port>"` on an in-port, and spells no other module's name. `spec/wiring.yaml` names the instances to load and binds each port to a name, per [[spec/design_output/model#the-wiring-file]].

A module then stays local, and one file holds the layout. An alternative calculation is another module type in the wiring, so the `providers.*` keys leave.

- `go test ./...` from the root passes
- a case wires an out-port and an in-port to one standard name, and reads the value arrive
- a case wires an in-port port to port, and reads the name `<instance>/<port>` of its writer
- a case reads an out-port with no wire as `<instance>/<port>`
- a case loads one module type as two instances, each with its own config
- no module under `src/modules` spells another module's path, which `nomodule` holds
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

Six pieces, following spec/design_output/model#the-wiring-file and #a-name. One: src/q/wiring.go holds Wiring, a list of instances, each a name and a module type, and a map of wires from `<instance>.<port>` to a standard name, to `<instance>.<port>` of a writer, or to the mark built-in. ReadWiring reads that shape off YAML through src/yaml, with instances as a block map, since src/yaml reads no flow map. Two: Load(w, types) builds one catalog. For each instance it calls the type's register function on a fresh catalog, so each instance holds registrations of its own. It then renames them in place, so every Writer a module holds stays valid. An out-port takes the standard name its wire names, or `<instance>/<port>`. An in-port takes its wire: a standard name, the name of the writer a port-to-port wire names, or no name under built-in, where the field keeps its zero value. An in-port under `config/` binds to `<instance>/config/<key>` with no wire. Any other in-port with no wire answers a Fault of the new kind Unwired, naming the instance, the port and the file and line. Load answers every fault at once, and Check runs over the loaded catalog as it stands. Three: derivedOf's run reads the registration's inputs, so a rename reaches the run. Four: CfgIn(c, key, builtin, opts) declares a config key at the local name `config/<key>`, and Load files it under `<instance>/config/<key>`, so one type loads as two instances with a key each. The declaring registration writes the key until the-config-module-resolves-layers moves the writer to the config module. Five: the providers.* selection leaves. Alt, providerKey, pick's key reading, NoAlt and TwoActive go, and NewStore and Check drop their keys argument, because an alternative calculation is another module type in the wiring. Two registrations of one name answer Twice. Six: the analyzer NoName becomes NoModule, named nomodule, and refuses an import of a package under src/modules from another module package, a door, the index or a renderer. onlyq leaves a module path to it, so one import names one fault. spec/wiring.yaml stands with no instance and a header pointing at the model, because no module type registers yet. Assumed: the index reads spec/wiring.yaml at start once a module package stands to load, under reads-resolve-in-two-passes, since the index imports no module and the start's passes are that ticket's. Weighed: Load renames the registrations in place against copying them, since a copy leaves every Writer a module holds pointing at a name nobody reads.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/q/store.go: NewStore, which drops keys
src/q/check.go: Catalog.Check, pick, providerKey, which drop keys
src/q/q.go: Alt, derivedOf
src/q/qtest/qtest.go: Over, which calls Check and NewStore
src/index/door.go: Serve, which calls NewStore
src/imports/imports.go: NoName, onlyQ, Faults
src/imports/imports_test.go: the NoName cases and TestAModuleImportingAModulePasses
src/q/catalog_test.go: TestTwoActiveProvidersRefuseTheStart and the alt pick case
src/q/writer_test.go: TestCommitRefusesAnInactiveAlternative, which leaves, and the NewStore calls
src/q/store_test.go, src/q/why_test.go, src/q/action_test.go, src/ops/ops_test.go, src/watchdog/lease_test.go, src/tickets/tickets_test.go, src/index/v1_test.go, src/index/ops_test.go, src/index/topic_test.go, src/index/sweep_test.go: the NewStore and Check calls, which drop nil

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

src/q/wiring_test.go: TestAStandardNameCarriesTheValueFromOutPortToInPort
src/q/wiring_test.go: TestAPortToPortWireReadsTheWritersName
src/q/wiring_test.go: TestAnUnwiredOutPortReadsAsInstanceAndPort
src/q/wiring_test.go: TestOneTypeLoadsAsTwoInstancesEachWithItsConfig
src/q/wiring_test.go: TestAnUnwiredInPortAnswersAFault
src/q/wiring_test.go: TestReadWiringReadsInstancesAndWires
src/imports/imports_test.go: TestAModuleImportingAModuleIsNamed, the planted modules/work with its want comment under NoModule

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first draft

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

src/q/wiring.go
src/q/wiring_test.go
src/q/q.go
src/q/check.go
src/q/store.go
src/q/qtest/qtest.go
src/q/catalog_test.go
src/q/writer_test.go
src/q/store_test.go
src/q/why_test.go
src/q/action_test.go
src/ops/ops_test.go
src/watchdog/lease_test.go
src/tickets/tickets_test.go
src/index/door.go
src/index/v1_test.go
src/index/ops_test.go
src/index/topic_test.go
src/index/sweep_test.go
src/imports/imports.go
src/imports/imports_test.go
spec/wiring.yaml

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

opened spec/design_output/model at a name, the wiring file, config comes off the registrations and the build checks imports, src/q/q.go, src/q/check.go, src/q/store.go, src/yaml/yaml.go and src/imports/imports.go, and checked each claim there
the callers come off a grep for NewStore, Check, Alt, providerKey and NoName over src
each done_when line names its test: the four wiring cases decide the wires and the instances, TestAModuleImportingAModuleIsNamed decides nomodule, and go test and the check decide the first and last

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/q src/imports

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

src/q/wiring_test.go
src/imports/imports_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Every wiring case fails on its own assertion over the stubs: Load answers an empty catalog, so a seed finds no provider and an unwired out-port reads nil, and ReadWiring answers no instance. The planted modules/greedy imports modules/names, and the stub NoModule reports nothing. The surprise: src/yaml reads a dotted key such as queue.rows as one key, so the wiring keeps the port notation the model writes. CfgIn stands real already, since it registers a given at config/<key> and Load does the rest.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

every done_when line meets a case: the standard name, the port-to-port wire, the unwired out-port and the two instances each have a wiring case, TestAModuleImportingAModuleIsNamed decides nomodule, and go test and the check decide the rest as commands
the cases run over a catalog in memory, and the import case plants its packages in a folder of its own, so no door stands unfaked

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

pass
- the approach answers every done_when line: the six wiring cases in src/q/wiring_test.go and TestAModuleImportingAModuleIsNamed stand red on their own assertions under ./RUNME.sh branch test, and go test and the check decide the first and last lines
- the approach claims no module type registers yet, but src/modules/clock, env and files each hold Registers(c), on the local names minute, vars/<name> and files/<path...>. spec/wiring.yaml still stands empty here, since io-modules-own-their-names wires those instances, but the implement keeps Load renaming a family port whose local name carries a pattern segment
- the tests list names the planted modules/work for nomodule, and the case plants modules/greedy. It also leaves out TestABuiltInInPortKeepsItsZeroValue, which the file holds. The implement fixes the list in place
- derivedOf runs over its own closed inputs slice today, so the run reads the registration inputs as the approach says, or a rename never reaches it
- analyzers-read-the-io-flag plans nomodule and its case too. Its draft takes the NoModule this ticket lands, and adds no second one
- the model names the config declaration q.Cfg, and the code names it CfgIn beside GivenIn and DerivedIn. This is form, and waits for the push

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
