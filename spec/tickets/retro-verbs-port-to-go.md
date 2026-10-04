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
group: retro-verbs-run-in-go
step: gate
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 08f4218ba236 · claude-code-remote
    hash_before: c37e3a88dbdf0990f82395bc2d7f2a863cee45cb
    hash_after: c37e3a88dbdf0990f82395bc2d7f2a863cee45cb
    inputs:
      - name: ask
        hash: f1ff445a4ded1e1b
        size: 590
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box 08f4218ba236 · claude-code-remote
    hash_before: d955e149423e150e3bbd41abd679876e55ca6f02
    hash_after: d955e149423e150e3bbd41abd679876e55ca6f02
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/quack fails
    inputs:
      - name: design/draft
        hash: 7b71d5990ac50ca7
        size: 4884
    def: 08e16d07b0de477c
---

# Ask

The verbs retro run in Go, each registered in its own file under `src/quack`, and their JavaScript leaves the tree.

The retro verbs run in Go beside `retro notes`, the twin that already stands. Until it lands, these verbs start node, and `retro*.js` stay in the tree.

- `go test ./src/quack ./src/modules/...` passes, with a case for every road the verbs' JavaScript tests cover
- `./RUNME.sh <verb>` reaches no node for each of retro
- `ls src/scripts/verbs` names none of retro
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

Each retro sub-verb registers itself from its own file under src/quack, through register("retro <sub>", ...), the way twins.go registers retro notes. The verbs mode stands at new by default, so twinOf hands each one to Go and no node starts.

- One file a verb: retro_audit.go, retro_backlog.go, retro_collect.go, retro_timeline.go, retro_chapters.go, retro_read.go, retro_matrix.go, retro_effect.go, retro_classes.go, retro_mint.go, retro_new.go, retro_score.go. retro_usage.go registers the bare retro and prints the usage as retro.js does, exit 0 bare and 2 on an unknown word.
- Support files register nothing: retro_home.go holds the retro folder, its input folder and the timed sources; retro_findings.go, retro_report.go and retro_outside.go hold what several verbs read.
- Every Go name in these files starts with retro, so no sibling group porting into package main in parallel meets a clash.
- Each verb prints what its JavaScript prints, byte for byte, and exits as it does. The Go cases port every JavaScript case of the retro tests one for one.
- retro new and retro mint reach the mint and the pull through ./RUNME.sh mint and ./RUNME.sh ticket pull as child processes, as runIn in mint.js does today. Those verbs belong to other groups of phase 11, and this group ports none of them.
- The JavaScript leaves: src/scripts/verbs/retro.js, src/scripts/retro.js, retro-collect.js, retro-new.js, retro-outside.js, retro-score.js, every file of src/engine/retro, and test/level0/retro-*.test.js but retro-notes-pull.test.js, which tests the pull. battery.js, process.js, pull.js and group.js stay, since other JavaScript imports them.
- The shared lines this forces: verb-programs.test.js drops its retro import, cli-mint-callers.test.js drops the retro caller, contract/experiment.test.js reads the experiment path as a literal, and level0/experiment.test.js keeps its process case and gives its two audit cases to Go.

Weighed: one Go file holding every sub-verb reads shorter, and the registry design refuses it, since it puts one verb in one file. Assumed: this box decides the owner-read step, as rule 6 of the cloud guidance says.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/scripts/verbs/retro.js run: the node road for retro, which leaves
- src/quack/twins.go nodeAccept: hands a registered retro verb to goAnswer, so the index actions retro/* answer in Go
- src/quack/verbs.go roadOf and twinOf: route ./RUNME.sh retro <sub> to the registered twin
- src/modules/verbs/retro.go RetroVerbs: the action list, unchanged
- spec/processes/retro.yaml and group.yaml: name the retro verbs as needs, unchanged
- test/contract/verb-programs.test.js: imports verbs/retro.js
- test/contract/cli-mint-callers.test.js: imports newRetro
- test/contract/experiment.test.js: imports EXPERIMENT
- test/level0/experiment.test.js: imports openTrials and EXPERIMENT

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/quack/retro_usage_test.go: TestRetroUsageNamesEveryVerb, off retro-usage.test.js
- src/quack/retro_audit_test.go: one case a title of the two audit cases in level0/experiment.test.js
- src/quack/retro_backlog_test.go: one case a title of retro-backlog.test.js
- src/quack/retro_collect_test.go: one case a title of retro-collect.test.js, retro-collect-median.test.js and retro-outside.test.js
- src/quack/retro_timeline_test.go, retro_chapters_test.go, retro_matrix_test.go: one case a title of retro-matrix.test.js
- src/quack/retro_read_test.go: one case a title of retro-read.test.js
- src/quack/retro_classes_test.go: one case a title of retro-classes.test.js
- src/quack/retro_effect_test.go: one case a title of retro-effect.test.js
- src/quack/retro_mint_test.go: one case a title of retro-mint.test.js
- src/quack/retro_new_test.go: one case a title of retro-new.test.js
- src/quack/retro_score_test.go: TestRetroScoreCountsOpenImprovements, a case the JavaScript lacks
- src/quack/retro_registry_test.go: TestEveryRetroVerbRegisters, every name of RetroVerbs answers a registered twin, which decides the reaches-no-node line

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first draft

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/quack/retro_*.go and their _test.go files, new
- src/scripts/verbs/retro.js, src/scripts/retro*.js, src/engine/retro/*.js, test/level0/retro-*.test.js but retro-notes-pull, removed
- test/contract/verb-programs.test.js, cli-mint-callers.test.js, experiment.test.js and test/level0/experiment.test.js, edited

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file, function and verb the approach names stands opened: retro.js, each engine/retro file's imports, twins.go nodeAccept, verbs.go twinOf and roadOf, registry.go, and migration.verbs at new in the config
- the callers list names every importer a search of src and test finds for the files that leave
- every done_when line names its test: go test is the battery, TestEveryRetroVerbRegisters decides reaches-no-node, and the ls, the importer search and ./RUNME.sh check run at implement/tests-green

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/quack

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/quack/retro_audit_test.go
- src/quack/retro_backlog_test.go
- src/quack/retro_chapters_test.go
- src/quack/retro_classes_test.go
- src/quack/retro_collect_test.go
- src/quack/retro_effect_test.go
- src/quack/retro_findings_test.go
- src/quack/retro_matrix_test.go
- src/quack/retro_mint_test.go
- src/quack/retro_new_test.go
- src/quack/retro_outside_test.go
- src/quack/retro_read_test.go
- src/quack/retro_report_test.go
- src/quack/retro_score_test.go
- src/quack/retro_timeline_test.go
- src/quack/retro_usage_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Every case fails on its own assertion, over stubs that register each verb and answer nothing. The test files split one a source file, so the outside, findings and report cases stand in files of their own, against the draft's list.

What surprised:

- The JavaScript keeps the written order of JSON keys, and the dispositions, a chapter's lines, the battery parts and the classes print in it. The Go port decodes with order kept.
- A child pull loses the queue pass retro new handed the pull in process. The decision: the pull lets a ticket through where SE_MINTED in its env names it, and Go retro new sets it. Weighed: leaving the pull out breaks the hand-out with no second command, and a Go write of the hold reaches into the pull's own state. The cost: a hand can set the variable itself, which a note parks for the retro.
- retro new through the mint and ticket open now lands the open as a commit, puts a cloud box's retro into its group, and refuses a bad why line after the draft stands. A test names each change.
- level0/experiment.test.js leaves whole: its third case reads only the constant, and the contract test reads the route's person step already.
- Three JavaScript cases assert nothing a stub misses, so each Go case adds one assertion that starts red.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every done_when line meets a failing test: the go test line meets every case here, reaches-no-node meets TestEveryRetroVerbRegisters with TestRetroUsageExitsTwoOnAWordNoVerbAnswers, and the ls, the importer search and the check stand as checkpoints at tests-green
- every door has a fake: collect and backlog take a fake trunk and a fake move, new and mint take a fake child runner, and the rest read a temp tree

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
