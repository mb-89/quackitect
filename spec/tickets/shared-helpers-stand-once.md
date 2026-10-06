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
group: engine-verbs-hold
step: gate
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 57a5a484096e · claude-code-remote
    hash_before: cb95af260d146cb7675650a73d0d88ac4a1475e6
    hash_after: cb95af260d146cb7675650a73d0d88ac4a1475e6
    inputs:
      - name: ask
        hash: abb7dfca8a237c09
        size: 371
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box 57a5a484096e · claude-code-remote
    hash_before: 1280a1dd1da6af2fd62c7428989b51e97598e10f
    hash_after: 1280a1dd1da6af2fd62c7428989b51e97598e10f
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/yaml fails
    inputs:
      - name: design/draft
        hash: 3041511ebe33f68f
        size: 5066
    def: 08e16d07b0de477c
---

# Ask

Each helper stands in one package, so a fix to it reaches every caller.

Copies of the same helper drift apart, as `truthy` already reads two types across its copies.

- `go test ./src/modules/check/` passes a case where the check refuses a function body that stands in another package.
- `git grep -c 'func truthy' -- src` finds one copy, and `./RUNME.sh check` exits 0.

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

Two parts: one rule that refuses a copied body, and one home for `truthy`.

The rule. A new file src/modules/check/twins.go holds `HelperStandsOnce` and `helperTwins(tree)`. It reads every tracked Go file the tree holds, past `_test.go`, and parses it with go/parser, as syntax.go already does. For each top-level function, it prints the body through go/printer with each parameter and local name renamed to its place: v0, v1, and so on. A body under `twinFloor` statements passes, so a one-line getter draws nothing. Two bodies with the same print in two folders draw an error on the later path. The message names the other function and its package, and tells the reader to call that one. The rule joins `Rules` in src/modules/check/checker.go. `Checker.Over` reads the findings for its own path through a cache keyed on the Go texts, as `rulesOnce` does for the guidance pairs.

The helper. `truthy(said any) bool` joins src/yaml/value.go beside `AsString`, exported as `var Truthy = truthy`, so the grep the ask names finds one copy. It answers false for nil, false, zero, NaN and the empty string, and true for the rest. src/yaml imports no tree package, and onlyq lists it in pureTree, so every module may call it. Each copy leaves, and its callers call `yaml.Truthy`. src/branches/group.go, src/modules/tickets/drawn.go, src/modules/hooks/cage.go, src/modules/hooks/stop/rules.go, src/quack/probe_cold.go and src/voice/voice.go drop theirs as they stand. src/projection/value.go keeps its Null mark in its own caller: `said != (Null{}) && yaml.Truthy(said)`, under a name of its own. src/pull/pull_holds.go reads a string flag, so it renames to `flagOn`, and its yaml callers move to `yaml.Truthy(entry.Get(...))`.

The rule lands at error, and this change folds every exact twin it names, so the check stays green on the commit. Truthy takes the union of the copies, and no caller leans on the cases where they differed.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/branches/done.go (*Doors) closing read at line 60
src/branches/group.go hash read at line 255
src/branches/route.go entry read at lines 374-375
src/branches/test.go hash read at line 171
src/pull/pull_holds.go AgentOf
src/pull/pull_hand.go skipped read at line 522
src/pull/pull_kept.go kept read at line 98
src/pull/pull_bless.go blessed read at line 57
src/pull/pull.go skipped read at line 393
src/pull/pull_stale.go skipped read at line 203
src/pull/pull_back.go hand-back read at line 37
src/projection/faults.go typed read at line 30
src/projection/entries.go target, key, writes and entry reads at lines 25, 48, 71, 123
src/projection/commands.go properties, group and help reads at lines 148, 186, 273
src/modules/hooks/cage.go needs read at line 93
src/modules/hooks/stop/rules.go Yields and Beside at line 172
src/modules/hooks/fold.go cloud and results reads at lines 365, 484
src/modules/hooks/stops.go background, mine and cloud reads at lines 138, 171, 374
src/modules/tickets/drawn.go step, does, when, skipped and name reads at lines 159, 206, 219, 222, 227, 291
src/modules/tickets/red.go skipped read at line 36
src/quack/probe_cold.go parent_tool_use_id read at line 93
src/quack/doctor_verb.go OK read at line 211
src/voice/voice.go meta, sidechain, rule and Fixable reads at lines 382, 385, 403, 573, 730
src/modules/check/checker.go treeFaults (through Rules)
src/modules/check/checker.go (*Checker).Over
src/modules/check/checker.go (*Checker).Sweep

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

src/modules/check/twins_test.go TestTheCheckRefusesABodyStandingInAnotherPackage
src/modules/check/twins_test.go TestABodyRenamedOnlyStillReadsAsACopy
src/modules/check/twins_test.go TestAShortBodyAndATestFilePass
src/yaml/yaml_test.go TestTruthyReadsEachKind

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

src/modules/check/twins.go
src/modules/check/twins_test.go
src/modules/check/checker.go
src/modules/check/testdata/tree.golden.json
src/yaml/value.go
src/yaml/yaml_test.go
src/branches/group.go
src/modules/tickets/drawn.go
src/modules/hooks/cage.go
src/modules/hooks/stop/rules.go
src/modules/hooks/fold.go
src/modules/hooks/stops.go
src/modules/tickets/red.go
src/branches/done.go
src/branches/route.go
src/branches/test.go
src/quack/probe_cold.go
src/quack/doctor_verb.go
src/voice/voice.go
src/projection/value.go
src/projection/faults.go
src/projection/entries.go
src/projection/commands.go
src/pull/pull_holds.go
src/pull/pull_hand.go
src/pull/pull_kept.go
src/pull/pull_bless.go
src/pull/pull.go
src/pull/pull_stale.go
src/pull/pull_back.go
every other Go file the new rule names, fixed in the same change

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

Each of the eight truthy copies, yaml value.go AsString, imports.go onlyQ and pureTree, check syntax.go, restated.go rulesOnce, and checker.go Over, Rules and Sweep stand opened and read.
A grep for truthy( over src gives every caller, line by line; Rules and Over give the check's callers.
The check line is TestTheCheckRefusesABodyStandingInAnotherPackage; `git grep -c 'func truthy' -- src` answers one copy, the renamed projection and pull helpers among none; ./RUNME.sh check runs the battery.

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/yaml/yaml_test.go src/modules/check/twins_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

src/yaml/yaml_test.go
src/modules/check/twins_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The sweep draws no rule on a body standing in two packages, renamed or not, and the stub truthy reads every value false. The short body and test file case passes already, and it guards the rule against false hits. The grep line waits for tests-green, since the eight copies still stand.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The check line meets TestTheCheckRefusesABodyStandingInAnotherPackage, the grep and check line wait for tests-green, and TestTruthyReadsEachKind decides the shared helper.
The check cases run over the fake index in q/qtest, and the yaml case reads pure values, so no case reaches a door.

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

The ask's grep reads the name with its case. So `src/yaml` keeps the one `func truthy`, and exports it as `var Truthy = truthy` for every other package.
