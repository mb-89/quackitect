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
step: implement/tests-green
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box b1ba21c2e626 · claude-code-remote · helper-5
    hash_before: a128adb602a6ce7e64a7caf8913f606cd9caa06c
    hash_after: a128adb602a6ce7e64a7caf8913f606cd9caa06c
    inputs:
      - name: ask
        hash: caadc88f131860c5
        size: 493
    def: c01ae0f2ace0cecb
  - step: design/tests-red
    hand: box b1ba21c2e626 · claude-code-remote
    hash_before: 7a8761b9636601f1c076754f1c469b74c3be32fd
    hash_after: ebdc029dd93de8b65de3735063332fe27e498bd2
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/quack fails
    inputs:
      - name: design/draft
        hash: d17ce41170ddc790
        size: 6505
    def: 08e16d07b0de477c
  - step: gate
    hand: box b1ba21c2e626 · claude-code-remote
    hash_before: 4a599c6e92cc8bd2fba8b10fae5cc2c956b2c485
    hash_after: 166f24f6f253eff548c9175a15b19970b4451fb9
    inputs:
      - name: design/draft
        hash: d17ce41170ddc790
        size: 6505
      - name: design/tests-red
        hash: 908215df2f5f3c67
        size: 1972
    def: dc4904ab364efa10
  - step: implement/change
    hand: box b1ba21c2e626 · claude-code-remote
    hash_before: 2f461e12905976e9633716f41a6b96449c8422ce
    hash_after: 6e95814eb1e9f821195fdb7d3c9f5502713fafdf
    answered:
      - name: lint
        exit: 0
        said: ""
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box b1ba21c2e626 · claude-code-remote
    hash_before: 8571d5037cc9e8706a0b100083a154dd5221cc92
    hash_after: 8571d5037cc9e8706a0b100083a154dd5221cc92
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes; green, src/vehicle passes
      - name: check
        exit: 0
        said: "   62.0  in all"
    inputs:
      - name: design/tests-red
        hash: 908215df2f5f3c67
        size: 1972
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

A stub enables the plugin through a Go verb, so the stub runs no Node and lib/vehicle.js leaves with its tests.

Every stub session imports lib/vehicle.js through Node, so the library stays and a box with no Node loads no plugin.

- `git ls-files .claude/skills/level0/lib/vehicle.js` answers nothing
- `git grep -n 'node -e' -- src/stub` answers nothing
- `go test ./src/vehicle/... ./src/quack/...` passes a test of the settings shim through the verb
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

1. src/vehicle/pure.go gains ShimSettings(text, vehicle, brand) as the Go port of shimSettings, and SettingsLocal beside Settings.
2. ShimSettings keeps every standing key, adds the directory marketplace under the brand, and appends level0@brand once.
3. src/vehicle/stub.go gains EnablePlugin(disk, work, method), which reads the name field of vehicle.json in the work root as the brand.
4. EnablePlugin makes the .claude folder and writes .claude/settings.local.json in the work root only where the text changes.
5. EnablePlugin refuses a work root whose record names no brand, and writes nothing.
6. vehicleTwin in src/quack/vehicle_verb.go gains the enable word, which calls EnablePlugin over pair.Work and pair.Method.
7. The verb writes the method root with forward slashes, as the register spells a path.
8. src/stub/RUNME.sh drops the node block and runs the vehicle binary with verb, its scripts folder, vehicle and enable.
9. The shim sets SE_WORK_ROOT to the stub for that call, takes se-index.exe where it stands, and discards the output.
10. A missing binary or a failed call prints the standing fallback line, and the shim still hands every argument on.
11. .claude/skills/level0/lib/vehicle.js leaves, since only test/level0/vehicle.test.js and the shim read it.
12. test/level0/vehicle.test.js leaves whole, since src/vehicle/vehicle_test.go already holds a Go case for each of its seven cases.
13. hookprobe.go reads vehicle.Settings and vehicle.SettingsLocal in place of its own two spellings.
14. probe_cold.go takes vehicle.PortBase and vehicle.Pointer in place of its twins naming the library.
15. probe_verb.go takes vehicle.PluginFolder in place of its twin naming the library.
16. pure.go drops the two comment clauses naming lib/vehicle.js, since the Go file now owns each rule.
17. level0.md names src/vehicle/pure.go and hooksNamed in src/quack/hookprobe.go as owners of the settings names.
18. level0.md under a-stub-names-its-vehicle says the shim runs vehicle enable, which writes settings.local.json.
19. vehicle.md names PortBase in src/vehicle/pure.go, and names src/vehicle/shim_contract_test.go in place of the gone stub.test.js.
20. Red: src/quack/stub_settings_test.go globs lib/vehicle.js and the JS test through filepath.Glob.
21. The same test reads src/stub/RUNME.sh and refuses node -e. It decides done_when lines one and two.
22. Red: a table test in src/quack/vehicle_verb_test.go drives vehicle enable through vehicleRun. It decides line three.
23. Its rows: no settings file, a file with other keys and a standing entry, a broken file, a second run, and a stub with no record.
24. Edge: a contract case seeds a fake binary that records its argv and work root, then runs the real shim.
25. ./RUNME.sh check at tests-green decides line four.
Weighed: the shim calling sh RUNME.sh vehicle enable first. Each stub command then runs install.sh twice, so the shim calls the binary as editor-process.js does.
Weighed: folding the enable into every verb the binary runs from a stub. The write then hides behind every verb, and no verb names it.
Weighed: a pure ShimSettings test in src/vehicle beside the verb table. tests.md asks one test a behavior, and the verb reaches every edge.
Weighed: comment-only pointers in probe_cold.go and probe_verb.go. The Go constants already stand, so a second spelling only drifts.
Assumed: a vehicle found on a road mostly holds a built binary. Where it holds none, the fallback line prints and the exec builds it.
Assumed: enabledPlugins keeps the list shape the JS writes. The client may read an object there, so the session parks that doubt as a note.
Assumed: SELF_TEST and TESTING leave with the library, since no file reads either.
Assumed: probe_cold_test.go keeps lib/vehicle.js as a path off the cold path, since the case reads a string and no file.
Assumed: a stub made earlier keeps its node shim until the vehicle updates it, which the ask leaves out.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/stub/RUNME.sh: the node -e block, which imports shimSettings from lib/vehicle.js
- test/level0/vehicle.test.js: every case, reading entryOf, identityOf, importsOf, modulesOf, onlyVehicle, portOf, registers, resolves, rootKey and same
- src/quack/vehicle_verb.go: vehicleTwin, which gains the enable word
- src/vehicle/shim_contract_test.go: shimStub and runShim, which run the real src/stub/RUNME.sh
- src/vehicle/stub.go: StubInto, which copies the src/stub template into each new stub
- src/quack/hookprobe.go: settingsFile and settingsLocalFile, read by settingsFiles
- src/quack/probe_cold.go: portBase and vehiclePointer, whose comments name lib/vehicle.js
- src/quack/probe_verb.go: pluginFolder, whose comment names lib/vehicle.js
- src/vehicle/pure.go: the file header and the relative regexp comment naming lib/vehicle.js
- src/quack/probe_cold_test.go: TestAPathElsewhereSitsOffTheColdPath, which holds the path as a string
- src/quack/check.go: the test/level0/*.test.js glob, which drops the deleted test
- spec/design_output/level0.md: the settings table paragraph and a-stub-names-its-vehicle
- spec/design_output/vehicle.md: the-register-holds-the-port and two-roads-to-the-vehicle

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/quack/stub_settings_test.go: TestTheStubRunsNoNodeAndTheVehicleLibraryStandsNowhere
- src/quack/vehicle_verb_test.go: TestVehicleVerbEnableNamesTheVehicleAMarketplaceAndEnablesTheBrand
- src/vehicle/shim_contract_test.go: TestTheShimEnablesThePluginThroughTheVehicleBinary

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first: no review has read this draft

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- .claude/skills/level0/lib/vehicle.js
- test/level0/vehicle.test.js
- src/stub/RUNME.sh
- src/vehicle/pure.go
- src/vehicle/stub.go
- src/vehicle/shim_contract_test.go
- src/quack/vehicle_verb.go
- src/quack/vehicle_verb_test.go
- src/quack/stub_settings_test.go
- src/quack/hookprobe.go
- src/quack/probe_cold.go
- src/quack/probe_verb.go
- spec/design_output/level0.md
- spec/design_output/vehicle.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file, function and verb named stands opened: vehicle.js, the stub shim, pure.go, stub.go, RootsHere, vehicleTwin, vehicleRootHere, verbRoad, hookprobe.go, probe_cold.go and probe_verb.go
- the callers come from git grep on vehicle.js, lib/vehicle, shimSettings and node -e over hooks, lib, src, test, RUNME.sh, install.sh, package.json, .github and notes
- the stub settings test decides lines one and two, the enable verb table line three, and ./RUNME.sh check at tests-green line four
- the approach adds no config key, so no default file changes

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/stub_settings_test.go src/quack/vehicle_verb_test.go src/vehicle/shim_contract_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/quack/stub_settings_test.go
- src/quack/vehicle_verb_test.go
- src/vehicle/shim_contract_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

TestTheStubRunsNoNodeAndTheVehicleLibraryStandsNowhere fails on its assertion, naming lib/vehicle.js, the JS test and the node -e block in the shim.
TestVehicleVerbEnableNamesTheVehicleAMarketplaceAndEnablesTheBrand fails on every row: the fresh rows find no settings file, the seeded rows find their seed text unchanged, and the refusal rows find a zero exit.
Its expected text comes from a run of the real shimSettings under node: two-space indent, a trailing newline, standing keys in their order, the marketplace merged or added last, and level0@brand once.
The second run row pins the file's mtime with os.Chtimes and asserts it stands, so the no-rewrite case takes no timer.
The draft's no-record row splits in two: a stub with no vehicle.json, and a record naming no brand, for approach item five.
TestTheShimEnablesThePluginThroughTheVehicleBinary fails on its assertion: the fake binary at .se/.runtime/bin/se-index never hears the call.
Surprise one: the shim test sits under the contract build tag, so a bare go test answers no tests to run, and the check passes the tag.
Surprise two: vehicle enable falls through to vehicleHere today and exits zero, so the refusal rows fail on their assertion and not on usage.
Surprise three: the standing contract tests pass with the node block in place, since their vehicles hold no lib/vehicle.js, so no test ever ran the node path.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every done_when line meets a red test: the stub settings test decides lines one and two, the enable verb table line three, and ./RUNME.sh check at tests-green line four
- every door the tests reach has a fake: temp work and method roots, a temp stub, and a fake se-index script recording its argv and SE_WORK_ROOT

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

go build ./...

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- The change touches the files the draft names, plus the check.go comment the gate named.
- EnablePlugin reads and writes through the vehicle disk door, and the verb table runs it on temp roots, and the contract case on a fake binary.
- Each new Go function points at a-stub-names-its-vehicle in the level zero design note.
- The settings names stand in src/vehicle/pure.go alone, the quack names alias them, and each design note points at the Go owner.

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/stub_settings_test.go src/quack/vehicle_verb_test.go src/vehicle/shim_contract_test.go

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

A stub enables the plugin through `vehicle enable`, a Go verb, and runs no Node. The verb reads the brand off the stub's `vehicle.json`. It names the vehicle a directory marketplace in `.claude/settings.local.json` and enables `level0` under that brand once, keeping every standing key. It writes only where the text changes. The stub's shim calls the vehicle binary for it, and prints the old fallback line where the binary is missing or fails. `lib/vehicle.js` leaves with its test, and the quack names for the settings, port and pointer now alias the Go owners in `src/vehicle/pure.go`.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- The change touches the files the draft names, plus the check.go comment the gate named.
- The verb table runs on temp roots, and the contract cases on a fake binary.
- Each new Go function points at a-stub-names-its-vehicle in the level zero note.
- The settings names stand in src/vehicle/pure.go alone, and each note points there.

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

The gate accepts, and implement carries these points:

- Keep settingsFile, settingsLocalFile, portBase, vehiclePointer and pluginFolder as aliases of the vehicle constants. hookprobe_test.go, doctor_verb.go, doctor_verb_test.go, check.go, check_test.go and probe_cold.go read them, and change nowhere then.
- Point the comment in src/quack/check.go naming vehicle.js at Pointer in src/vehicle/pure.go.
- The gate fixed three test gaps: the no-node test walks all of src/stub, the enable table holds a stale-path row, and a contract case holds the fallback where the binary fails. That case passes today, and guards the change.
- A vehicle with no built binary enables on the second shim call, since the first call's exec builds the binary. The approach takes that cost over a second install on every call.
- The enabledPlugins shape stays the private note enabled-plugins-shape, which the retro decides.
