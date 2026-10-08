---
kind: [[ticket]]
state: open
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
depends_on: ["engine-and-doors-leave", "scripts-folder-leaves", "plugin-libs-leave"]
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box b1ba21c2e626 · claude-code-remote
    hash_before: c31acfa7df253e30a25e28d6f1783ad436af43c9
    hash_after: c31acfa7df253e30a25e28d6f1783ad436af43c9
    inputs:
      - name: ask
        hash: a26473f140d6ac61
        size: 381
    def: c01ae0f2ace0cecb
  - step: design/tests-red
    hand: box b1ba21c2e626 · claude-code-remote
    hash_before: 8a10018275c66eb9d580fd6ea39971fb3230dacf
    hash_after: 037fca2393284a75d5d5a30dc260e3734a84665a
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/quack fails
    inputs:
      - name: design/draft
        hash: f851464d50688d2a
        size: 9882
    def: 08e16d07b0de477c
  - step: gate
    hand: box b1ba21c2e626 · claude-code-remote · helper-4
    hash_before: 026ff08db724afe4b94dd0e07676db78070b96d4
    hash_after: 026ff08db724afe4b94dd0e07676db78070b96d4
    inputs:
      - name: design/draft
        hash: f851464d50688d2a
        size: 9882
      - name: design/tests-red
        hash: 6568a71d0caae0ac
        size: 1045
    def: dc4904ab364efa10
  - step: implement/change
    hand: box b1ba21c2e626 · claude-code-remote
    hash_before: 17491c0187fda9a98b16c2c0617742318889430e
    hash_after: 7c3bdb74bdb0656804a1cf83605f0fc67538c873
    answered:
      - name: lint
        exit: 0
        said: ""
    def: f150b8c0dc20fe45
---

# Ask

A check holds test code at or under one line per line of code, per language, so the tests cost no more than the code they guard.

The JavaScript tests outgrow the code that stays, and a check spends its time on them.

- `go test ./src/quack/...` passes a test of the ratio refusal
- `./RUNME.sh check` names no language whose test lines pass its code lines, and exits 0

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

1. src/quack/check_lines.go gains linesHold(d checkDoors), the lines part, and partsOf in src/quack/check.go names it after rules, leading nothing.
2. The part lists files through d.git with ls-files -z --cached --others --exclude-standard, as listedDisk in src/quack/verb_lint.go lists them, and reads each through d.text.
3. One table in check_lines.go owns the languages: Go takes .go, JavaScript takes .js, .mjs, .cjs, .ts and .tsx, and shell takes .sh.
4. JavaScript and TypeScript count as one language, so level-zero-becomes-a-typed-mod moves the hooks to TypeScript and the count holds.
5. A Go test line stands in a _test.go file, or in any file under a testdata folder or test/replay, the fixtures Go tests read.
6. A JavaScript test line stands in a JavaScript file under test/. Every other file of a language counts as code, src/doors/fake and prototype/trace-view among them.
7. The part counts every line as wc -l counts it, blank and comment lines alike, so no language needs a comment grammar.
8. It prints one row a language: the name, the test lines and the code lines.
9. A language whose test lines pass its code lines refuses with `<language> holds <t> test lines over <c> code lines. Cut each test repeating a behaviour, per spec/guidance/code/tests.md.`, and the part exits 1.
10. With every language at or under its code, the part exits 0.
11. spec/guidance/code/tests.md rule 6 keeps its instruction and links check_lines.go, which holds the floor a language.
12. Go passes today and JavaScript fails, so the steps below bring JavaScript under.
13. test/level0/fixtures.js leaves, since no file imports it.
14. These leave whole, since each pins the tree's own text or guards a road that left: contract/commands.js, fetching.js, install.test.js, cli-verbs, verb-programs, skills, check-workflow, dispatch-workflow, go-module, experiment, tree, sidebar-reads-no-file, extension-spawns-no-verb, desk-start, level0/battery-reporter.test.js and level0/styles.test.js.
15. work-buttons.test.js drops its verb case, which reads commands.js.
16. The Vale rule cases leave JavaScript: src/modules/lsp/rules_contract_test.go holds them as one table of path, text, rule and fires, over one Vale run, under the contract tag.
17. That table runs lsp.ToolsAt over a temp root holding the tree's .vale.ini and styles, each probe under the path its section reads, as ruled.js lays them out.
18. paragraph, shape, vale-fix, outside-in-doors, schema and process tests leave with ruled.js. vale.test.js keeps its door case alone, so ./RUNME.sh doors still holds.
19. disk.test.js, proc.test.js and wire.test.js stay, since doorsVerb refuses a door under src/doors with no contract test.
20. The extension's tests hold each behaviour once, through activate with the fake vscode and the fake index.
21. sidebar-v1, sidebar-writes, sidebar-work and sidebar-views fold into sidebar.test.js, and lens-v1 and lens-actions into lens.test.js, each keeping a case no other case holds.
22. A case reading source text, as the lens-v1 verb program folder case, leaves with the fold.
23. The hook tests fold: level1, pull-spawn-hook and index-tools into one pull-tool test, and door-clear, door-spawn and caged-door into one level0 hook table.
24. Where JavaScript still stands over, a case on a lib module leaves where an extension case holds its behaviour, largest file first: panel, route-host, clicks, fields-to-fill, tree-extension.
25. Every test this change adds reads no clock and sleeps nowhere.
26. TestTestArgv in src/quack/check_test.go names a standing red sample in place of battery-reporter.test.js.
27. doors.md names rules_contract_test.go where it names ruled.js, the rule cases of vale.test.js, outside-in-doors.test.js and tree.test.js. vehicle.md drops fetching.js.
28. The javascript-leaves inventory under Discussion names the fate this approach gives each test file.
29. Red: src/quack/check_lines_test.go drives the lines part over a temp root and a faked git. It decides done_when line one.
30. ./RUNME.sh check at tests-green decides line two.
Weighed: per module, as rule 6 reads. Eighteen Go packages stand over today, src/quack and src/branches among them, so the ask counts per language.
Weighed: code lines net of comments and blanks. Each language then needs its own comment grammar, and both sides carry comments alike, so the two counts move together.
Weighed: the count inside the rules part, through lint. The lint takes paths, a language count reads the whole tree, and the index sweep answers no rows here, as index-sweep-answers-nothing says.
Weighed: a config key for the ratio. Rule 6 fixes one test line a code line, and a knob invites raising it.
Weighed: deleting disk.test.js and proc.test.js, as the inventory says. doorsVerb then refuses both doors, and remaining-js-names-its-reason decides the doors.
Weighed: an exemption for the lint group's tests. It lets the tests the ask names stand over, so the rule cases move to Go, where the lint verb runs Vale.
Assumed: only tests reach src/doors/vale.js, src/scripts/styles.js, src/engine/tools.js and lib/vale.js, so cutting their rule cases leaves no live road untested.
Assumed: the group ask leaves the lint scripts to the lint-without-vale group. Steps 16 to 18 move that group's rule tests, which the owner reads before tests-red.
Assumed: the plan lands JavaScript under its code without prototype/trace-view, so that folder leaving keeps the check green.
Assumed: the fold keeps sidebar.test.js and lens.test.js under the file ceiling, split by topic where one passes it.
Assumed: the Vale rule cases move to a Go table, since the owner says JavaScript leaves wherever nothing requires it, and the Vale door keeps its door case. No lint-without-vale ticket stands to take them.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/quack/check.go: partsOf, which gains the lines part
- src/quack/check_test.go: TestCheckParts, whose part list gains lines
- src/quack/check_test.go: TestTestArgv, whose red sample battery-reporter.test.js leaves
- src/quack/check_battery_test.go: TestBatteryRun, whose lead case reads every part partsOf names
- src/quack/verb_doors.go: doorsVerb, which wants a contract test for each door under src/doors
- test/contract/work-buttons.test.js: the verb case, which imports commands from commands.js
- test/contract/cli-verbs.test.js, skills.test.js and verb-programs.test.js: every case, reading commands.js
- test/contract/install.test.js: every case, reading fetching.js
- test/contract/vale.test.js, paragraph.test.js, shape.test.js, vale-fix.test.js, outside-in-doors.test.js, schema.test.js and process.test.js: every case, reading ruled.js
- test/level0/sidebar.test.js and lens.test.js: the cases the fold brings in, reading v1-index.js
- spec/guidance/code/tests.md: rule 6
- spec/design_output/doors.md: the outside-in paragraph, the contract suite table and a-rule-test-spawns-once
- spec/design_output/vehicle.md: the fresh vehicle paragraph naming fetching.js
- spec/tickets/javascript-leaves.md: the test inventory rows naming this ticket

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/quack/check_lines_test.go: TestTheLinesPartRefusesALanguageWhoseTestsOutgrowItsCode
- src/modules/lsp/rules_contract_test.go: TestEachProseRuleFiresOnItsProbeAndStaysQuietOnItsTwin

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first: no review has read this draft

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/quack/check.go
- src/quack/check_lines.go
- src/quack/check_lines_test.go
- src/quack/check_test.go
- src/modules/lsp/rules_contract_test.go
- spec/guidance/code/tests.md
- spec/design_output/doors.md
- spec/design_output/vehicle.md
- spec/tickets/javascript-leaves.md
- test/level0/fixtures.js
- test/level0/battery-reporter.test.js
- test/level0/styles.test.js
- test/contract/commands.js
- test/contract/fetching.js
- test/contract/install.test.js
- test/contract/cli-verbs.test.js
- test/contract/verb-programs.test.js
- test/contract/skills.test.js
- test/contract/check-workflow.test.js
- test/contract/dispatch-workflow.test.js
- test/contract/go-module.test.js
- test/contract/experiment.test.js
- test/contract/tree.test.js
- test/contract/sidebar-reads-no-file.test.js
- test/contract/extension-spawns-no-verb.test.js
- test/contract/desk-start.test.js
- test/contract/work-buttons.test.js
- test/contract/ruled.js
- test/contract/vale.test.js
- test/contract/paragraph.test.js
- test/contract/shape.test.js
- test/contract/vale-fix.test.js
- test/contract/outside-in-doors.test.js
- test/contract/schema.test.js
- test/contract/process.test.js
- test/level0/sidebar.test.js
- test/level0/sidebar-v1.test.js
- test/level0/sidebar-writes.test.js
- test/level0/sidebar-work.test.js
- test/level0/sidebar-views.test.js
- test/level0/lens.test.js
- test/level0/lens-v1.test.js
- test/level0/lens-actions.test.js
- test/level0/level1.test.js
- test/level0/pull-spawn-hook.test.js
- test/level0/index-tools.test.js
- test/level0/door-clear.test.js
- test/level0/door-spawn.test.js
- test/level0/caged-door.test.js
- test/level0/panel.test.js
- test/level0/route-host.test.js
- test/level0/clicks.test.js
- test/level0/fields-to-fill.test.js
- test/contract/tree-extension.test.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file, function and verb named stands opened: check.go partsOf, checkDoors and text, checkdoors.go's git door, check_test.go checkFake, TestCheckParts and TestTestArgv, verb_doors.go doorsVerb, textfaults.go sizeFaults, verb_lint.go listedDisk, lsp door.go ToolsAt, tests.md, doors.md, vehicle.md, the javascript-leaves inventory, and each JS test named at its header and imports
- the callers come from git grep on partsOf, checkFake, battery-reporter.test.js, commands.js, fetching.js, ruled.js, v1-index.js and every leaving file name over src, test and spec outside spec/tickets
- check_lines_test.go decides done_when line one, and ./RUNME.sh check at tests-green line two
- the approach adds no config key, so no default file changes

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/check_lines_test.go src/modules/lsp/rules_contract_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/quack/check_lines_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

TestTheLinesPartRefusesALanguageWhoseTestsOutgrowItsCode fails on its assertion in all seven rows, since no part answers to the name lines.
TestEachProseRuleFiresOnItsProbeAndStaysQuietOnItsTwin passes today over the real Vale, with the rule cases of the seven JavaScript test files in one table.
The door case and the no-binary case stay in the JavaScript Vale test, as the draft says.
Surprise one: a shape case filtered on a rule prefix the Vale reader strips, so it could never fail. The Go row holds every rule quiet there.
Surprise two: the table holds firing alone, so exact counts, severities and line numbers stay unported.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- check_lines_test.go decides done_when line one, and ./RUNME.sh check at tests-green line two.
- The lines test runs on the check's fake doors over a temp root, and the rule table on a temp root over the real Vale under the contract tag.

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

- The change touches the files the draft names, plus contract/sidebar.test.js and pull.md, which pinned or named files that leave.
- The lines part runs on the check's doors, and its test on their fakes.
- check_lines.go points at rule six of the test guidance.
- One table in check_lines.go owns the languages, and tests.md points there.

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

- [[spec/tickets/scripts-folder-leaves]] takes the stamp and drawing bundle tests out of `test/contract`, and the stamp and bundle verb tests under `src/quack` hold their behaviours.
