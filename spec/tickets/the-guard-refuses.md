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
group: doors-declare-what-they-own
depends_on: ["go-waits-on-events", "quack-waits-on-the-clock", "quack-reaches-the-box-through-doors", "javascript-reaches-through-doors", "go-tests-meet-the-doors", "test-walks-move-onto-fakes"]
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box dcf1ea3c64fd · claude-code-remote
    hash_before: 45cf891d892c9e1f8a8e644ddd18e47dcf1c39a6
    hash_after: 45cf891d892c9e1f8a8e644ddd18e47dcf1c39a6
    inputs:
      - name: ask
        hash: d521b63d31f8a074
        size: 715
    def: c01ae0f2ace0cecb
  - step: design/tests-red
    hand: box dcf1ea3c64fd · claude-code-remote
    hash_before: 905a17180ff27c777798243b8ab7706ff68a6f3e
    hash_after: 905a17180ff27c777798243b8ab7706ff68a6f3e
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/owns fails
    inputs:
      - name: design/draft
        hash: bfe420c6747c2284
        size: 3869
    def: 08e16d07b0de477c
  - step: gate
    hand: box dcf1ea3c64fd · claude-code-remote · helper-4
    hash_before: 71d3b35dc119a3ba851edeac9e69808f33196167
    hash_after: 71d3b35dc119a3ba851edeac9e69808f33196167
    inputs:
      - name: design/draft
        hash: bfe420c6747c2284
        size: 3869
      - name: design/tests-red
        hash: 513eb42eb823afcb
        size: 1034
    def: dc4904ab364efa10
  - step: implement/change
    hand: box dcf1ea3c64fd · claude-code-remote
    hash_before: 7830e3eb3c190042b2a17b5fc03765f0bb555b69
    hash_after: 630ca21903ba7ba1f3886f748af1a896cdf76095
    answered:
      - name: lint
        exit: 0
        said: "test/level0/outside-hand.test.js:14:1: correctness/noUnusedVariables: This variable CLOUD is unused."
    def: f150b8c0dc20fe45
---

# Ask

The guard refuses every walk-around, in the check, at the push, in CI and in the editor, and the guidance carries the rule, so a new walk-around never lands.

While every door stands at report, a walk-around lands unseen, and the list grows back as fast as the children shrink it.

- `./RUNME.sh doors` lists no walk-around, and no `owns.yaml` holds `report`
- a planted walk-around fails `./RUNME.sh check`, and a test proves it
- `DoorsOnly` retires as the doors note says, once a declaration owns `Math.random` and the guard refuses an undeclared `node:` module
- `spec/guidance/code/code`, `spec/guidance/code/testing`, the doors note and the model note carry the rule, and `./RUNME.sh check` passes

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

The guard already refuses a walk from a door that holds no report flag. The lint's WalksAroundADoor marks it an error, so the check, the commit, the push, CI and the editor refuse it, and the doors part of the check exits red. So the work clears the twelve production walks, drops report, closes the one gap the JavaScript leaves, and retires DoorsOnly.

1. The index door names its serving files. The index is the server, and actions.go, bus.go, main.go, ops.go, tools.go, v1.go, detach_unix.go and detach_windows.go serve its socket, its bus and its detach. src/index/owns.yaml names them under files beside door.go, so the net, net/http and syscall uses there stand held. Vale's OutsideInDoors still keeps os in door.go alone. Cost: a new serving file needs a line in the declaration, which is the refusal doing its work.
2. The process door owns its own wait. proc.go bounds a run with context.WithTimeout, and FakeRunner falls back to time.After. src/proc/owns.yaml adds both names under go, beside the clock door, since the doors note lets several doors own one name.
3. Every owns.yaml drops report: true. A door with no report refuses each walk.
4. A random door owns Math.random. src/doors/owns.yaml gains random with js [Math.random] and files [], so every call walks around it until a door file stands. No tracked script calls it today.
5. jsWalks in src/owns/script.go names a node: module no door declares as a walk around no door, past the pure modules DoorsOnly passes: path, url, test, assert and assert/strict. No such import stands today.
6. DoorsOnly retires as the doors note says: spec/config/styles/VoiceVale/DoorsOnly.yml, its lines in .vale.ini and test/contract/outside-in-doors.test.js leave together.
7. The rule lands in the notes. The doors note drops the report and DoorsOnly paragraphs for one line: a walk around a door fails the check, and the marker naming its reason is the one escape. The model note's IO module chapter and spec/guidance/code/code and spec/guidance/code/testing carry the same rule, each with a link to the doors note.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/modules/check/doors.go walkFaults, through owns.Walks and owns.Read
src/imports/walkaround.go WalkFaults, through owns.Walks
src/imports/imports.go the doors read, through owns.Read
src/quack/verb_doors.go walksOver, through owns.Walks and owns.Read
src/quack/check.go the doors part, through the doors verb

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

src/owns/owns_test.go TestANodeModuleNoDoorDeclaresIsAWalk
src/owns/owns_test.go TestAPureNodeModuleIsNoWalk
src/owns/tree_test.go TestNoDoorStandsAtReport
src/owns/tree_test.go TestTheRandomDoorOwnsMathRandomAndHoldsNoFile
src/modules/check/doors_test.go TestAWalkAroundStandsAtErrorInTheLint, which stands already and decides the planted walk

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

src/index/owns.yaml
src/proc/owns.yaml
src/doors/owns.yaml
every other owns.yaml holding report: true
src/owns/script.go
src/owns/owns_test.go
src/owns/tree_test.go
spec/config/styles/VoiceVale/DoorsOnly.yml
.vale.ini
test/contract/outside-in-doors.test.js
spec/design_output/doors.md
spec/design_output/model.md
spec/guidance/code/code.md
spec/guidance/code/testing.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

every file, function and verb the approach names stands opened: walksOver, owns.Walks, jsWalks, the owns declarations, the DoorsOnly rule and its test, and the doors note's retirement paragraph.
the callers list names the lint, the analyzer, the doors verb and the check part, each a caller of owns.Walks or owns.Read.
the first done_when line falls to ./RUNME.sh doors and TestNoDoorStandsAtReport, the second to TestAWalkAroundStandsAtErrorInTheLint and the check's doors part, the third to TestANodeModuleNoDoorDeclaresIsAWalk and TestTheRandomDoorOwnsMathRandomAndHoldsNoFile, and the fourth to ./RUNME.sh check with a read of the four notes.
the approach adds no config key.

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/owns

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

src/owns/owns_test.go
src/owns/tree_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

TestANodeModuleNoDoorDeclaresIsAWalk fails because jsWalks names no module that no door owns. TestTheRandomDoorOwnsMathRandomAndHoldsNoFile fails because no random door stands. TestNoDoorStandsAtReport names every door, each of which holds report today. TestAPureNodeModuleIsNoWalk passes already, as it guards the exception the change keeps. The surprise: the watch and wall doors this group adds took report too, by the pattern of the doors beside them, and this change drops it with the rest.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

every done_when line meets a red test or a check: the first meets TestNoDoorStandsAtReport and the doors verb, the second the standing lint test and the check doors part, the third the module and random door tests, and the fourth ./RUNME.sh check with a read of the four notes.
every door the tests reach has a fake: the owns tests read planted texts and the tree tests read the tree through the walk tests already use.

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- skill-scripts-meet-the-guard: the guard skips every path holding a .claude part (walkPasses in src/modules/check/textfaults.go, read by walkFaults and by walksOver in src/quack/verb_doors.go), so DoorsOnly alone guards the scripts under .claude/skills today, the level0 lib among them. Retiring it leaves those scripts unguarded, against the owner's word that the JS door rules cover the level0 hooks. Let the doors walk read .claude/skills, and declare what the hooks reach, before the group closes.
- fake-vscode-names-its-door: the draft says no undeclared impure node: import stands, and src/doors/fake/vscode.js imports node:module, held by no door in src/doors/owns.yaml. Once jsWalks names an undeclared module, that line walks around no door and the check goes red. Name the file under a door owning node:module, or mark the line.
- page-owns-math-random: src/extension/drawing/route.mjs calls Math.random, and the page door holding it as its own outside leaves Math.random out of its js list. Once the random door owns Math.random, that call walks around random and the check goes red. Add Math.random to src/extension/drawing/owns.yaml.
- doorless-walk-names-no-door: walksSays in src/modules/check/doors.go and walkLine in src/quack/verb_doors.go join the walk's doors, and a walk around no door reads 'walks around .' with an empty list. Word that case as a module no door declares. The draft's size leaves both files out.
- doorsonly-leaves-every-note: spec/design_output/extension.md and spec/rationales/testing.md still name DoorsOnly and its pure modules, and the draft's size leaves both out. Carry the retirement into each, beside the doors note and the model note.

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change touches the files of the draft size, past two the draft left out: spec/design_output/migration.md and the model note analyzer line, which named the retired Vale rule, and the outside rule contract test keeps its file and drops the three pieces naming DoorsOnly, since the same file holds the contract of OutsideInDoors
the random door holds no file, so it has no fake by design: every call of Math.random walks around it until a door file and its fake stand; every other door the change reaches keeps the fake it had
the comments name the approach: pureModules and moduleOf in src/owns/script.go point at the doors note section the guard follows
the pure module list stands once, in src/owns/script.go, and the doors note and the testing rationale point at it; the report key, now carried by no door, stays as a parked note, report-key-retires, for the retro

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
