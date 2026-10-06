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
group: code-is-pure-tests-behave
step: design/tests-red
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 37997ca97a74 · claude-code-remote
    hash_before: 713ee8631d99f8135d7445fd16fed311674562df
    hash_after: 713ee8631d99f8135d7445fd16fed311674562df
    inputs:
      - name: ask
        hash: 3856e19de93035cd
        size: 649
    def: 7883b3d10633c780
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
Every reach to the outside lives in a declared door or carries a marker with its reason: files, processes, network, clock, random numbers, git and the index. A pure function then tests with no box.

<!-- breaks, as text: what breaks if it is never done -->
The doors-declare-what-they-own guard holds what its declarations name. A reach no door declares walks around the guard unseen.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- the Discussion holds a table of the seven outside kinds, each with its door on `origin/main` and its guard case, or the gap
- for each gap the guard names an unmarked reach outside a door, which `go test ./src/imports` decides
- each new guard case fires on a planted reach
- `./RUNME.sh check` stands green

<!-- view, as text: the view the owner reads the change in and the number there, in the owner's words, or none -->
none

<!-- from, as text: handover where the ask comes off a handover line, so the owner reads it first, or none -->
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

The change builds on `src/owns` and the `owns.yaml` declarations of the doors-declare-what-they-own group, and adds only the gaps the Discussion table names. Assumption: that group merges into `main` before tests-red, and tests-red opens on `./RUNME.sh branch sync`; the tests name `src/owns` and build on no branch without it.

1. Declare what a door already reaches, each at `report`, so the check stays green and `./RUNME.sh doors` lists the walk-arounds for the migration tickets:
   - files: `src/modules/files/owns.yaml` owns `path/filepath.Abs`, `EvalSymlinks`, `Glob`, `Walk` and `WalkDir`.
   - network: `src/index` and `src/tui/registry` own `net/http/httptest`.
   - random numbers: `src/index`, `src/modules/hooks`, `src/modules/lsp` and `src/modules/mcp` own `crypto/rand`, the token each reads.
   - the index: `src/index` owns `database/sql`, and `src/quack` and `src/tui` own the reach members `quackitect/src/index.Ask`, `Open`, `Dial`, `StartBus`, `Serve`, `ServeManaged` and `Main`, which the member form of a `go` name already holds.
2. Add a `run` key to a declaration: the programs a door runs. `src/modules/git` declares `run: [git]`; `src/branches`, `src/pull`, `src/quack` and `src/index` declare it at `report`. `goWalks` reads a run in argv form: a run name opening a `[]string` literal, or a call argument with another argument after it. A comparison, a map key and a struct field naming `git` run nothing, and walk nowhere.
3. Add `owns.Unheld`, the Go names reaching the outside that no door may own: `math/rand`, `math/rand/v2`, `io/ioutil`, `crypto/tls`, `net/rpc`, `net/smtp`, `os/user`, `log/syslog`, `plugin`. `Walks` names every use of one as a walk-around of no door, never at report, so an unmarked use refuses at once; no Go file imports one today. The `level0: OutsideInDoors - <why>` marker passes it. `floor` in `src/imports/imports.go` becomes `owns.Unheld` plus the names onlyq refuses a module beyond the outside (`io/fs`, `unsafe`, `runtime/cgo`), so the list stands once.
4. `owns.Kinds` maps each of the seven kinds onto its Go names, and a tree test holds every name declared by a door or held in `Unheld`, so a kind gaining a name meets the guard.
5. `spec/design_output/doors.md#a-door-declares-what-it-owns` gains the `run` row and the `Unheld` paragraph.

The JavaScript side stays out: the javascript-leaves group deletes it, and `DoorsOnly` holds it until then.

Weighed: one `random` door module against declaring `crypto/rand` on the four doors reading a token. Four doors each need a token once at start, and a door module costs a fake and a contract test for one call; the declarations cost four lines. The strongest objection: `Unheld` refusing at once breaks a hand importing `math/rand` tomorrow. Answer: that is the ask, and the marker names its way through.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/imports/walkaround.go WalkFaults, through owns.Walks
- src/modules/check/doors.go walkFaults, through owns.Walks
- src/modules/check/doors.go doorsOf, through owns.Read
- src/quack/verb_doors.go walksOver, through owns.Read and owns.Walks
- src/imports/imports.go Doors, through owns.Read
- src/imports/imports.go pastQ, through impure and floor
- src/imports/imports_test.go TestEveryPureReaderImportsThePureLibraryAlone, through impure

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/imports/walkaround_test.go TestARandomReadNoDoorOwnsIsNamed
- src/imports/walkaround_test.go TestAMarkedRandomReadIsNamedByNone
- src/imports/walkaround_test.go TestATokenReadOutsideItsDoorsIsNamed
- src/imports/walkaround_test.go TestAFilepathWalkOutsideTheFilesDoorIsNamed
- src/imports/walkaround_test.go TestAnIoutilReadIsNamed
- src/imports/walkaround_test.go TestAnHttptestServerOutsideTheNetworkDoorsIsNamed
- src/imports/walkaround_test.go TestAGitRunOutsideTheGitDoorIsNamed
- src/imports/walkaround_test.go TestAGitWordThatRunsNothingIsNamedByNone
- src/imports/walkaround_test.go TestAnIndexAskOutsideTheIndexDoorIsNamed
- src/imports/walkaround_test.go TestASQLOpenOutsideTheIndexIsNamed
- src/owns/owns_test.go TestARunKeyReadsAsTheProgramsADoorRuns
- src/owns/tree_test.go TestEveryOutsideKindNamesADoorOrUnheld

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/owns/owns.go
- src/owns/golang.go
- src/owns/owns_test.go
- src/owns/tree_test.go
- src/imports/imports.go
- src/imports/walkaround_test.go
- src/modules/files/owns.yaml
- src/modules/git/owns.yaml
- src/modules/hooks/owns.yaml
- src/modules/lsp/owns.yaml
- src/modules/mcp/owns.yaml
- src/index/owns.yaml
- src/tui/registry/owns.yaml
- src/tui/owns.yaml
- src/quack/owns.yaml
- src/pull/owns.yaml
- src/branches/owns.yaml
- spec/design_output/doors.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

every file the approach names stands opened on origin/work/doors-declare-what-they-own: walkaround.go, owns.go, golang.go, imports.go and every owns.yaml, and each use count comes off git grep there
the callers come off a git grep for owns.Walks, owns.Read, impure and floor on that branch, each with its enclosing function
done_when 1 is the Discussion table; done_when 2 and 3 meet the walkaround_test.go cases on planted packages under go test ./src/imports; done_when 4 meets ./RUNME.sh check at tests-green

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->

<!-- the form is list -->

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

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

The seven outside kinds, read off the Go declarations of `origin/work/doors-declare-what-they-own`. The `owns.yaml` declarations and `src/owns` stand on that branch alone, and none of them stands on `origin/main` yet.

| kind | door | guard case | gap |
|---|---|---|---|
| files | `src/modules/files`, and every door owning `os` | the walk-around of `os` | `path/filepath.Abs`, `EvalSymlinks`, `Glob`, `Walk` and `WalkDir` read the disk, and `io/ioutil` reads and writes it, with no door owning them |
| processes | `src/modules/git`, `src/vehicle`, `src/pull`, `src/quack`, `src/index` own `os/exec`, and `src/index` owns `os/signal` and `syscall` | the walk-around of `os/exec` | `plugin` loads code, with no door owning it |
| network | `src/modules/hooks`, `src/modules/mcp`, `src/modules/lsp`, `src/index`, `src/tui/frame`, `src/tui/registry` own `net` and `net/http` | the walk-around of `net/http` | `net/http/httptest` opens a port, and `crypto/tls`, `net/rpc` and `net/smtp` dial out, with no door owning them |
| clock | `src/modules/clock` owns the `time` and `context` members reading the time now | `TestAWalkAroundTheClockIsNamed` | none |
| random numbers | none | none | `crypto/rand`, read for a token in `src/index`, `src/modules/hooks`, `src/modules/lsp` and `src/modules/mcp`, and `math/rand` and `math/rand/v2` |
| git | none of its own: every door owning `os/exec` runs it | none | a run of `git` outside `src/modules/git` passes, from `src/branches`, `src/pull`, `src/quack` and `src/index` |
| the index | `src/index` owns its packages whole | none | `database/sql` and the reach functions of `src/index` (`Ask`, `Open`, `Dial`, `StartBus`, `Serve`, `ServeManaged`, `Main`) stand owned by no door |
