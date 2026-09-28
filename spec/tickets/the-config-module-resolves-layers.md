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
depends_on: [projections-read-the-mirror, the-manager-becomes-a-module, reads-resolve-in-two-passes]
record:
  - step: design/draft
    hand: box d7e2ac6b84cc · claude-code-remote
    hash_before: 788506af379e10011e75ee2a84cf677a96846b59
    hash_after: 788506af379e10011e75ee2a84cf677a96846b59
    inputs:
      - name: ask
        hash: 453697f99f171291
        size: 1001
      - name: [[spec/design_output/model]]
        hash: eb315d7a681bc4e4
        size: 74362
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d7e2ac6b84cc · claude-code-remote
    hash_before: 35ad34a273f86697bfdb84872414526dc4ce0fe4
    hash_after: 35ad34a273f86697bfdb84872414526dc4ce0fe4
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/config fails
    inputs:
      - name: design/draft
        hash: dfe6ac5c2a96ea79
        size: 6161
    def: 08e16d07b0de477c
  - step: design/draft
    hand: the engine
    stale: [[spec/design_output/model]]
  - step: design/draft
    hand: box d7e2ac6b84cc · claude-code-remote
    hash_before: 7233c36db8620984b3439f3cfd22e8af3c3b232c
    hash_after: 7233c36db8620984b3439f3cfd22e8af3c3b232c
    inputs:
      - name: ask
        hash: 453697f99f171291
        size: 1001
      - name: [[spec/design_output/model]]
        hash: 1717325681c1003e
        size: 74654
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d7e2ac6b84cc · claude-code-remote
    hash_before: eb09a917d66c5d3de6705d3283bb626ae06c53a6
    hash_after: eb09a917d66c5d3de6705d3283bb626ae06c53a6
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/config fails
    inputs:
      - name: design/draft
        hash: dfe6ac5c2a96ea79
        size: 6161
    def: 08e16d07b0de477c
  - step: gate
    hand: box d7e2ac6b84cc · claude-code-remote · helper-6
    hash_before: ead86e5949ea71e8509aae7250949e580c9e1071
    hash_after: ead86e5949ea71e8509aae7250949e580c9e1071
    inputs:
      - name: design/draft
        hash: dfe6ac5c2a96ea79
        size: 6161
      - name: design/tests-red
        hash: 852fe43a4ea64b36
        size: 986
    def: dc4904ab364efa10
---

# Ask

The config module stands under `src/modules/config`, loaded always, per [[spec/design_output/model#the-config-module]]. It owns every `<instance>/config/<key>`, and resolves each key off its layers: override, context, environment, local, default and built-in. A declaring module names its keys locally, and reads them like any other input.

A key then answers one value off one resolver, and a script's own values leave with the script, even on a crash.

- `go test ./...` from the root passes
- a case declares `weight` in a module, and reads `<instance>/config/weight` as its input
- a case lets a context's lease run out, and reads the layer below
- a case nests two contexts, and reads the inner one win and hand back on exit
- a case opens two unrelated contexts on one key, and reads the refusal naming the holder
- a case sets a shared key in every other layer, and reads the default file's value
- a case sets an override over a context, and reads the override win
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

One, q.CfgIn registers a derived key at `config/<key>`, typed by its built-in value, reading the absolute name `config/values`.
Two, bind renames the key to `<instance>/config/<key>` and leaves `config/values` as it stands.
Three, the key's run decodes its own entry of `config/values` into its type, and answers the built-in value where none stands.
Four, a new option q.Shared() marks a shared key.
Five, Catalog.Keys() lists each key with its instance, local name and shared mark.
Six, an input tagged `,optional` passes the check with no writer, and reads its zero value.
Seven, ProjectIn hands q.Optional() on to its files input, so a projection with no watch reads its default.
Eight, q.GuardIn registers a fold whose step answers an error, so Land refuses loudly and keeps the state.
Nine, the config module keeps its two projections, and adds the guarded fold `config/held` for contexts and overrides.
Ten, an open names its handle, holder, parent and values, and carries the live leases its opener read.
Eleven, the fold refuses an open that sets a key a live unrelated context holds, and names that holder.
Twelve, the config module adds the derived `config/values`, reading both projections, `env/<name>`, `index/leases` and `config/held`, each optional.
Thirteen, it walks Catalog.Keys() through the catalog it captured at registration.
Fourteen, each key takes the override, then the innermost live context, then environment, local file, default file.
Fifteen, a shared key reads the default file alone.
Sixteen, a context whose lease part is missing from `index/leases` drops out, so readers take the layer below.
Seventeen, the environment layer reads the variable src/config.EnvOf names for `<instance>.<key>`.
Eighteen, the manager registers `index/leases`, and each tick commits the parts whose lease still holds.
Nineteen, quack main registers the config module into q.Main beside the manager, after the wiring loads, whatever the wiring holds.
Weighed: CfgIn only declares, and the config module writes one family `<instance>/config/<key>`. A family carries one type, so the check would lose the per-key type an input reads.
Assumed: a client holding and renewing a context lease, and the quack cfg verbs, come in a later ticket.
Assumed: an absent `index/leases` reads every context as live.
Assumed: context and override values travel as JSON literals, as the command line hands text.
Assumed: the default file and the local file key by instance and then key, as the model says.
Assumed: the env layer reading env/<name> as one map waits on the family-map input tickets-becomes-a-module builds.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/q/wiring.go: CfgIn, registers a derived key reading config/values in place of a given
src/q/wiring.go: bind, leaves an absolute input unrenamed while it still renames config/<key>
src/q/q.go: derivedOf, reads the optional tag and the absolute mark off a field
src/q/q.go: foldOf, gains a guarded twin whose step answers an error (GuardIn)
src/q/check.go: inputFaults, skips NoName for an optional input with no writer
src/q/projection.go: ProjectIn, hands q.Optional() on to its files/<path...> input
src/q/wiring_test.go: TestOneTypeLoadsAsTwoInstancesEachWithItsConfig, seeds config/values in place of the key's own hand
src/q/qtest/qtest.go: New, provides config/values as a seedable input beside cfg/<key...>
src/modules/config/config.go: Registers, adds config/held and config/values beside the two projections
src/modules/index/manager.go: Registers, adds index/leases
src/modules/index/manager.go: ticks, commits the live leases after dog.Check
src/modules/index/lease.go: Dog, gains Live, the parts whose lease still holds
src/modules/index/manager_test.go: catalogued and TestIndexNamesNameEachNameItsProviderAndState, config/depth now reads as derived
src/quack/main.go: main, registers config.Registers(q.Main) always, after wired
src/quack/main.go: projected and load, config.Registers leaves the watch branch
src/quack/described_test.go: TestEveryModuleDescribesWhatItExposes, registers config.Registers beside projected
src/quack/manager_test.go: TestTheIndexLoadsTheManagerWithNoOtherModule, loads the config module too

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

./...: go test ./... from the root
src/modules/config/config_test.go: TestADeclaredKeyReadsItsInstanceConfigAsInput
src/modules/config/config_test.go: TestAContextPastItsLeaseReadsTheLayerBelow
src/modules/config/config_test.go: TestAnInnerContextWinsAndHandsBackOnExit
src/modules/config/config_test.go: TestTwoUnrelatedContextsOnOneKeyRefuseNamingTheHolder
src/modules/config/config_test.go: TestASharedKeyReadsTheDefaultFileAlone
src/modules/config/config_test.go: TestAnOverrideWinsOverAContext
src/q/wiring_test.go: TestAKeyReadsItsEntryOfTheResolvedValues
src/q/catalog_test.go: TestAnOptionalInputWithNoWriterPassesTheCheck
src/q/store_test.go: TestAGuardedFoldRefusesAndKeepsItsState
src/modules/index/lease_test.go: TestALeasePastItsTermLeavesIndexLeases
RUNME.sh: ./RUNME.sh check

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first draft

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

src/q/wiring.go
src/q/q.go
src/q/check.go
src/q/projection.go
src/q/wiring_test.go
src/q/catalog_test.go
src/q/store_test.go
src/q/qtest/qtest.go
src/modules/config/config.go
src/modules/config/config_test.go
src/modules/index/manager.go
src/modules/index/lease.go
src/modules/index/lease_test.go
src/modules/index/manager_test.go
src/quack/main.go
src/quack/described_test.go
src/quack/manager_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

opened the ticket, the five model chapters, config.md, both config packages, wiring.go, q.go, store.go, check.go, projection.go, qtest, manager.go, lease.go, main.go and imports.go, checked each claim at its line, and ran go test on src/q and src/modules/index to see which tests stand red
the callers list comes off greps over src for CfgIn, the cfg and config prefixes, projected, config.Registers, config.Tracked and the lease functions, plus the quack tests that call load and the manager's catalogued test
each done_when line maps to one test: go test and the check each have a line, and each of the six case lines maps to one test in src/modules/config/config_test.go, which the q, qtest and lease cases back

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/modules/config/config_test.go src/q/wiring_test.go src/q/catalog_test.go src/q/store_test.go src/modules/index/lease_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

src/modules/config/config_test.go
src/q/wiring_test.go
src/q/catalog_test.go
src/q/store_test.go
src/modules/index/lease_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Each case fails on its own assertion over stubs: GuardIn and Shared in q, Resolved in wiring.go, Live on the dog, and the change kinds in the config module. The five context and override cases fail in one lands helper, since config/held names no fold yet. config/values falls under the projection family config/<path...> today, so the build registers it by its exact name. No test outside these changes state.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

every done_when line meets a failing case: six config cases decide the six case lines, and go test and the check stand as commands
the config cases seed files, env and index/leases through a writer of their own over qtest.Over, and reach no door

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- env-layer-reads-its-variables: the draft's assumption that the environment layer waits on a family-map input is stale, since tickets-becomes-a-module stands closed and input.family in src/q/q.go reads map[string]T over a family such as env/<name>. Build the environment layer in this change, and add a case to src/modules/config/config_test.go where an env/SE_ value beats the local file. TestASharedKeyReadsTheDefaultFileAlone seeds env yet passes with no environment layer at all, so no case decides the layer the ask names.
- config-spells-the-env-name: step Seventeen reads the variable src/config.EnvOf names, and the onlyq analyzer keeps src/config out of a module. The config module spells the SE_ name itself, with a pointer at EnvOf, the way config.go already spells Tracked and Local.

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

- `env-layer-reads-its-variables` folds into this change. The environment layer sits inside `config/values`, so it lands with step Twelve, not after it.
- The draft's last assumption no longer holds: `input.family` in `src/q/q.go` reads `env/<name>` as one map today.
- `TestAnEnvValueBeatsTheLocalFile` in `src/modules/config/config_test.go` joins the red cases, and step Seventeen turns it green.
- Step Seventeen names the variable through `EnvOf` in `src/modules/config/config.go`, which `config-spells-the-env-name` adds.
