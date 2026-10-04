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
group: check-verbs-run-in-go
step: implement/tests-green
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 233780cb27f2 · claude-code-remote
    hash_before: 3e27391efef254348b64ec785ade27a94fda6853
    hash_after: 3e27391efef254348b64ec785ade27a94fda6853
    inputs:
      - name: ask
        hash: 75ff9ec428e07488
        size: 668
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box 233780cb27f2 · claude-code-remote
    hash_before: 82cc3aa75c2fcf4c694ab197cf76a12892db6310
    hash_after: 82cc3aa75c2fcf4c694ab197cf76a12892db6310
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/tickets fails
    inputs:
      - name: design/draft
        hash: 674e82fa573d841e
        size: 5635
    def: 08e16d07b0de477c
  - step: gate
    hand: box 233780cb27f2 · claude-code-remote · helper-4
    hash_before: ca5d0b95f81ae1d2f1dd386ee9628f6788e5b8c9
    hash_after: ca5d0b95f81ae1d2f1dd386ee9628f6788e5b8c9
    inputs:
      - name: design/draft
        hash: 674e82fa573d841e
        size: 5635
      - name: design/tests-red
        hash: 7ca9e2bd5154678d
        size: 874
    def: dc4904ab364efa10
  - step: implement/change
    hand: box bf0e991d1270 · claude-code-remote
    hash_before: 0a67250b468653611c492341dce1686815bfd1c6
    hash_after: 3f8215f8bb1754fb6b912d62c9c748c399a97a7b
    answered:
      - name: lint
        exit: 0
        said: "   65.3  in all"
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box bf0e991d1270 · claude-code-remote
    hash_before: 7d9f7f507f53a64be40038ff52a19f4bcbedf872
    hash_after: 7d9f7f507f53a64be40038ff52a19f4bcbedf872
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/tickets passes; green, src/quack passes
      - name: check
        exit: 0
        said: "   69.6  in all"
    inputs:
      - name: design/tests-red
        hash: 7ca9e2bd5154678d
        size: 874
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

The verbs check and test run in Go, each registered in its own file under `src/quack`, and their JavaScript leaves the tree.

The check and the test runner answer in Go, the language the modules they run are written in. Until it lands, these verbs start node, and `check-verb.js`, the battery and `red-list.js` stay in the tree.

- `go test ./src/quack ./src/modules/...` passes, with a case for every road the verbs' JavaScript tests cover
- `./RUNME.sh <verb>` reaches no node for each of check and test
- `ls src/scripts/verbs` names none of check and test
- a search of `src` names no importer of a JavaScript module this group deletes
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

The check and the test verb register from their own files under src/quack, and the battery runs in Go. A battery part whose logic another group's verb owns runs as that verb through quack's own road, a child process of the same binary, so it lands in Go the day that group ports it, and this group edits none of their Go.

The parts, in order, as check-verb.js runs them:

| part | Go home |
|---|---|
| tests | the test runner in Go: node --test over the unit and the contract globs, the red list apart, the battery reporter, the spawn tally |
| level0, beside | the verb probe dry --working, through the road, and a line alone on Windows |
| go | go test -tags contract with the red Go tests skipped, then gofmt -l src, in Go |
| doors | the verb doors, through the road |
| projections | the verb project --check, through the road; project.js gains the flag, which answers projectionsHold |
| plugin | claude plugin validate .claude/skills/level0, in Go, and a line where claude stands nowhere |
| server | the health call in Go, off the vehicle pointer's port |
| rules | the verb lint over the words, through the road; lint writes what it found to the file SE_LINT_FOUND names, so the stamp counts the warnings and check --errors prints the findings at error |

The stamp, the battery's report, the parts' table and the budget warning port to Go in the same shapes, so prepush, push, retro and the trunk guard read them unchanged. The red list ports into the tickets module as RedList and RedRows, off the walk and the chapter fields it holds. The test verb with words runs branch test over them through the road, under a fresh tally.

The tests part spawns node --test, since the JavaScript tests run on node's runner. I read the done_when line ./RUNME.sh test reaches no node as: quack hands neither verb to a node program. The JavaScript test files stay node's to run until they leave the tree.

The JavaScript that leaves: verbs/check.js, verbs/test.js, check-verb.js, red-list.js (redListOf moves into pull-kept.js), cli-stamp.js, and the battery parts no remaining module imports: level0Runs, goHolds, skipOf, pluginHolds, serverHolds and serverRead in cli-check.js, probeApart in probe-dry.js, goGate and formatFaults in cli-go.js, batteryOf, partsSaid, partsTimed, spawnsIn and their helpers in battery.js. work-review.js and work-merge.js run the check through the quack binary in place of node.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- RUNME.sh: the quack road, which hands check and test to the registry
- src/quack/verbs.go verbs: the road reaching the registered twins
- src/scripts/work-review.js checkIn: the check in a review worktree
- src/scripts/work-merge.js checkSays: check --errors over the merged tree
- src/scripts/pull-kept.js keptRed: redListOf, which moves into the file
- src/scripts/verbs/project.js run: gains --check for the projections part
- src/scripts/cli-read.js lint: writes its findings where SE_LINT_FOUND points
- src/scripts/verbs/doors.js and src/scripts/verbs/probe.js: run as parts, unchanged
- test/level0/check-verb.test.js, red-list.test.js, cli-stamp.test.js, check-server.test.js, battery.test.js, outside-hand.test.js, work-merge-cloud.test.js, work-doors.js, review.test.js: the cases over removed code leave or move to Go
- test/contract/cli-verbs.test.js and verb-programs.test.js: drop check and test

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/modules/tickets/red_test.go TestRedList: past tests-red and short of tests-green, an inserted tests-red-2, a closed ticket
- src/modules/tickets/red_test.go TestRedRows: bare rows, backticks, list marks, comma-joined rows, a leaf with no list
- src/quack/battery_test.go TestBatteryReport: rows, slowest, files, red, spawns, the report, the parts' table and the budget warning
- src/quack/battery_test.go TestStamp: green and red stamps, ticket prose holds no push, the runs kept at one commit
- src/quack/check_test.go TestCheckParts: order, a red part leaves the rest unrun, level0 beside after the tests, the sub-verbs each part runs
- src/quack/check_test.go TestCheckErrors: quiet parts, the red cases and the findings at error
- src/quack/check_test.go TestTestArgv: every test file but the red ones, the globs where none stands red
- src/quack/check_test.go TestServerRead and TestGoGate: the server's three answers, the skip off red Go files, gofmt faults
- src/quack/check_test.go TestCheckRegisters: check and test stand in the registry

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/modules/tickets/red.go
- src/modules/tickets/red_test.go
- src/quack/check.go
- src/quack/check_test.go
- src/quack/battery.go
- src/quack/battery_test.go
- src/quack/testverb.go
- src/scripts/verbs/check.js (leaves)
- src/scripts/verbs/test.js (leaves)
- src/scripts/check-verb.js (leaves)
- src/scripts/red-list.js (leaves)
- src/scripts/cli-stamp.js (leaves)
- src/scripts/cli-check.js
- src/scripts/cli-go.js
- src/scripts/battery.js
- src/scripts/probe-dry.js
- src/scripts/pull-kept.js
- src/scripts/cli-read.js
- src/scripts/verbs/project.js
- src/scripts/work-review.js
- src/scripts/work-merge.js
- the JavaScript tests the callers list names

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file, function and verb the approach names stands opened: check-verb.js, red-list.js, cli-check.js, cli-stamp.js, battery.js, cli-go.js, work-test.js, probe.js, probe-dry.js, cli-read.js lint, registry.go, verbs.go, twins.go, drawn.go
- the callers come off a search of src and test for each removed module and program path
- each done_when line meets a test: go test over src/quack and src/modules/tickets; TestCheckRegisters for the road; ls and a search for the removal; the check for the last line

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/modules/tickets/red_test.go src/quack/battery_test.go src/quack/check_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/modules/tickets/red_test.go
- src/quack/battery_test.go
- src/quack/check_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Every case fails on its assertion over stubs that compile. The first run of TestCheckParts panicked on a part the stub never returns, so a missing part now answers -1 and the case fails on its assertion. The surprise: the red list in Go reads the same walk and chapter fields the tickets module draws with, so the port is small.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each done_when line meets a red test: the Go cases for the roads, TestCheckRegisters for the road to node, and the removal and the check as checkpoints the implement step answers
- every door the check reaches rides in checkDoors, and the tests drive a fake of each: verb, process, health call, clock

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

pass with findings
- check-go-cases-cover-budget: the first done_when line asks a Go case for every road the JavaScript tests cover, and no red Go case reads battery.budget off the config (check-verb.test.js budgetOf), the warn line the log takes past the budget, the CGO_ENABLED=0 environment goGate runs under (goEnvOf), the port off the vehicle pointer (portHere), the level0 red line the check shouts, or the test verb with words handing its names to branch test under a fresh tally (cli-verbs.test.js namedTests); add a case for each before tests-green closes
- check-node-reading-owner-confirms: the draft reads the done_when line ./RUNME.sh <verb> reaches no node as quack hands neither verb to a node program, while the tests part spawns node --test and the level0, doors, projections and rules parts reach node through the road until their groups port; the owner confirms that reading, or the line changes in the ask
- check-port-callers-complete: the callers list misses test/level0/pull-fields.test.js (expectedRed), test/level0/cli-reporter.test.js (TEST_PARTS, testArgv), test/level0/probe-dry.test.js (probeApart, which the draft removes), test/contract/stub.test.js and test/level0/stub.test.js (verbs/check.js), test/level0/work-group.test.js and test/level0/bash.test.js (the node verbs/check.js command); the implement step moves or drops each

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh check

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches no file the ask leaves out: every file stands on the draft size list, on the callers list the gate completed in the Discussion, or carries a call to the check or test verb a search of src found, which are commit-verb.js and its cases
- every door the change reaches has a fake: the review, merge and commit cases drive the quack road over the fake process door, and the lint file write rides the disk door
- a comment names the approach: roadArgv, quackArgv, the review call and lintFoundOf each link the ticket or the battery section they implement
- every fact the change adds stands in one place: roadArgv owns the quack road for JavaScript, CHECK in work-doors.js owns the merge key for its cases, and goVerbs owns the list of verbs quack registers for the contracts

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh branch test src/modules/tickets/red_test.go src/quack/battery_test.go src/quack/check_test.go

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The check and the test verb answer in Go, and quack runs them on every road. The lint writes its findings to the file the check names, and project --check reads every target and writes none, so each part the Go check hands a node verb answers whole. The review worktree builds its own quack and runs check through the verb road. The merge and the commit verb run check and test through the same road, which roadArgv in verb-run.js owns. The node programs check.js and test.js leave, with check-verb.js, red-list.js and cli-stamp.js. The battery, gate and probe parts no module imports leave too. The red list reader moves into pull-kept.js, and Go cases take over the cases over removed code. A Go case now holds the quiet Go gate naming each failing test.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches no file the ask leaves out: each file stands on the size list or the callers list, or calls the check or test verb
- every door the change reaches has a fake: the road cases drive the fake process door
- a comment names the approach: each new function links its ticket or its design section
- every fact the change adds stands in one place: roadArgv owns the road, and goVerbs owns the Go verb list

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

The callers the draft missed, off [[spec/tickets/check-port-callers-complete]]. The implement step moves or drops the cases each names over removed code:

- test/level0/pull-fields.test.js: `expectedRed`, which moves to the Go red list
- test/level0/cli-reporter.test.js: `TEST_PARTS` and `testArgv`
- test/level0/probe-dry.test.js: `probeApart`, which the draft removes
- test/contract/stub.test.js: the program path of verbs/check.js
- test/level0/stub.test.js: the program path of verbs/check.js
- test/level0/work-group.test.js: the command that runs verbs/check.js on node
- test/level0/bash.test.js: the command that runs verbs/check.js on node

The box searched src and test for every module and program path the draft removes. The golden at src/quack/testdata/tree.golden.json names them in ticket text alone, and test/level0/pull-kept.test.js names red-list in a link alone, so neither imports the code that leaves.
