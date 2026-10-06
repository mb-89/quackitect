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
group: doors-declare-what-they-own
step: implement/change
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 86086f797ef7 · claude-code-remote
    hash_before: 745b3854dd9a5283637173dc78d0ca705cc8f6ea
    hash_after: 9a738cdceedde0458942ac46b981282df8039e8c
    inputs:
      - name: ask
        hash: 8eacce0f20b584e2
        size: 1278
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box 86086f797ef7 · claude-code-remote
    hash_before: 42379a37654ed05860308c5f296594c37de4c711
    hash_after: 42379a37654ed05860308c5f296594c37de4c711
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/owns fails
    inputs:
      - name: design/draft
        hash: 71e1166244e6076f
        size: 2764
      - name: [[spec/design_output/doors]]
        hash: 38bae238e57a16af
        size: 10261
    def: 08e16d07b0de477c
  - step: gate
    hand: box 86086f797ef7 · claude-code-remote · helper-4
    hash_before: b4f0752fbb1f1ba72c5f2d3f1e3d08b66713362d
    hash_after: b4f0752fbb1f1ba72c5f2d3f1e3d08b66713362d
    inputs:
      - name: design/draft
        hash: 71e1166244e6076f
        size: 2764
      - name: design/tests-red
        hash: ecab8a8b14de3f80
        size: 1458
      - name: [[spec/design_output/doors]]
        hash: 38bae238e57a16af
        size: 10261
    def: dc4904ab364efa10
---

# Ask

Every door, Go and JS, declares what it owns beside itself, and one guard reads those declarations. A new door adds its declaration and nothing else, and a primitive slips past no hand-kept list.

Without it, `time`, `context` and every primitive missing from `outside` and `impure` pass everywhere, so a call walks around its door unseen.

- every q.IO() module and every file under src/doors carries one declaration of the packages and the shared-package functions or globals it owns, which `go test ./src/imports/...` and the JS guard's test read
- `outside` and `impure` in src/imports/imports.go derive from the declarations, or fall away
- a go/analysis analyzer beside onlyq in src/imports, and a JS guard beside DoorsOnly, name an owned primitive used outside its door, and their tests plant one passing and one failing case per door
- the marker `level0: OutsideInDoors - <reason>` passes a line, and the guard lists every marked line
- `./RUNME.sh check` runs the guard, in report mode while walk-arounds remain: it lists them and stays green
- the lsp IO module serves the guard's findings as editor diagnostics, and a test under src/modules/lsp proves one
- the doors note, the model note and spec/vocabulary/terms.yml read door and IO module as one term

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

[[spec/design_output/doors#a-door-declares-what-it-owns]]. A new pure package src/owns parses every owns.yaml and finds walk-arounds: Go through go/parser, with an import of a whole-owned package or a selector on a member-owned one; JS through a scan that skips comments and strings. The check module's textFaults adds WalksAroundADoor over .go and .js files, at error for a refusing door and as a hint in an editor buffer for a door at report. A tree rule DoorDeclares names a q.IO() package or a src/doors file that no declaration covers, and an owns.yaml that reads as no declaration. src/imports adds the walkaround analyzer, and ioonly's outside and onlyq's impure derive from the declarations. ./RUNME.sh doors lists each door, its walk-arounds and its marked lines. Every door stands at report until its own child migrates it.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/imports/imports.go reachesOut, pastQ: read the derived lists
- src/imports/tree_test.go TestTheTreeHoldsTheImportRules: runs walkaround over the tree
- src/modules/check/textfaults.go textFaults: adds the walk-arounds
- src/modules/check/checker.go Rules: adds DoorDeclares
- src/modules/lsp/tools.go textFaults: draws them, unchanged
- src/quack/lsp.go lspChecks: hands TextFaults across, unchanged
- src/quack/verb_doors.go doorsVerb: lists walk-arounds and marked lines

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/owns/owns_test.go: the declaration's form, the Go and JS walk per door, the marker with and without a reason, report
- src/owns/tree_test.go TestEveryDoorRefusesAPlantedWalk: per real declaration, a planted file outside the door names a walk, and one inside names none
- src/imports/walkaround_test.go: the analyzer over a planted tree
- src/imports/imports_test.go TestTheListsComeOffTheDeclarations
- src/modules/check/doors_test.go: WalksAroundADoor and DoorDeclares
- src/quack/verb_doors_test.go: the walk-arounds and marked lines listed
- src/quack/lsp_test.go TestAWalkAroundDrawsAsADiagnostic

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/owns/owns.go
- src/owns/golang.go
- src/owns/script.go
- src/owns/*_test.go
- src/imports/imports.go
- src/imports/walkaround.go
- src/imports/*_test.go
- src/modules/check/doors.go
- src/modules/check/textfaults.go
- src/modules/check/checker.go
- src/quack/verb_doors.go
- src/quack/lsp_test.go
- owns.yaml in each door's folder
- spec/design_output/doors.md
- spec/design_output/model.md
- spec/vocabulary/terms.yml

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the files and functions named stand opened: imports.go, tree_test.go, textfaults.go, checker.go, sweep.go, lsp.go, tools.go, verb_lint.go, verb_doors.go
- the callers cover every reader of outside, impure, textFaults and the doors verb
- each done_when line maps to a test above, and ./RUNME.sh check decides the report mode

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/owns/owns_test.go src/owns/tree_test.go src/imports/walkaround_test.go src/modules/check/doors_test.go src/quack/verb_doors_test.go src/quack/lsp_doors_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/owns/owns_test.go
- src/owns/tree_test.go
- src/imports/walkaround_test.go
- src/modules/check/doors_test.go
- src/quack/verb_doors_test.go
- src/quack/lsp_doors_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Every new case fails on its own assertion over the stub, and the old cases stay green. A first planting of net/smtp passed the module case already, since impure names net and its subpackages, so the cases plant expvar, which publishes over HTTP and stands in no hand-kept list. The lsp case stands in src/quack, beside the wiring, because the lsp IO module reads the check module through ports quack hands in, so only there does a test drive the real rule into a diagnostic.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each done_when line meets a red case: declarations by TestEveryIOModuleAndDoorDeclares, derived lists by the two ListComes cases, the guards by the walkaround and WalksAroundADoor cases with per-door plants in TestEveryDoorNamesAPlantedWalk, the marker by the Marked cases, report mode by the report cases and the doors verb, the lsp by lsp_doors_test.go, the one term by the accept gate reading the notes
- every door the tests reach is planted text in memory or a temp folder, so no case reaches a real clock, disk or process past reading the tree's own declarations

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- door-lists-take-whole-packages: ioonly's outside and onlyq's impure must derive from owns.Whole, never owns.Packages, since clock owns time and context by member and two dozen core and module files import them for time.Duration; impure's non-door floor (io/fs, syscall, unsafe, plugin, runtime/cgo, database/sql, log/syslog, io/ioutil) stays refused or a declaration names it, so nothing falls through
- owns-joins-the-pure-tree: src/modules/check importing quackitect/src/owns falls to onlyq unless pureTree in src/imports/imports.go names src/owns, and the draft's callers list misses pastQ's pureTree
- doors-only-reads-the-declarations: the Vale rule DoorsOnly keeps its own hand-kept list of node: imports, Date.now, new Date() and Math.random beside the new guard, and the design names no fate for it; derive it, retire it, or say why it stays
- draft-lists-match-red-tests: the draft's tests list names src/imports/imports_test.go and src/quack/lsp_test.go, while the red cases stand in walkaround_test.go and src/quack/lsp_doors_test.go, and its size list misses src/quack/verb_doors_test.go and lsp_doors_test.go; the done_when line naming src/modules/lsp reads as met by src/quack/lsp_doors_test.go, because only quack wires the real check module into the lsp IO module, and the accept gate takes it so

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
