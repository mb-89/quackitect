---
kind: [[ticket]]
state: open
step: design/tests-red-2
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
      - name: draft-2
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
      - name: tests-red-2
        does: writes the tests the ask calls for
        tags: ["code", "testing"]
        needs: ["branch test"]
        input: draft-2
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
    input: ["design/draft", "design/tests-red", "design/draft-2", "design/tests-red-2"]
    evidence:
      - name: verdict
        form: verdict
        says: accept, accept with points naming a fix ticket a line, or reject with findings one a line
  - name: implement
    tags: ["code", "testing"]
    needs: ["branch test"]
    input: ["design/draft", "gate", "design/draft-2"]
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
        input: ["design/tests-red", "design/tests-red-2"]
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
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 3cd847cb11c · claude-code-remote
    hash_before: 73023d1f42ba477dfdcf5e373fd1d175c9fdf5f0
    hash_after: 73023d1f42ba477dfdcf5e373fd1d175c9fdf5f0
    inputs:
      - name: ask
        hash: 776b5067add31866
        size: 564
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box 3cd847cb11c · claude-code-remote
    hash_before: 9c7ad401858b54f8a49d51a75aacb334d2ed2773
    hash_after: 9c7ad401858b54f8a49d51a75aacb334d2ed2773
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/drafts fails
    inputs:
      - name: design/draft
        hash: 8ea120ae6b470908
        size: 5619
    def: 08e16d07b0de477c
  - step: design/tests-red
    hand: the engine
    stale: design/draft
  - step: design/tests-red
    hand: box 3e46c581114 · claude-code-remote
    hash_before: 7747a5efb88138c16bbbcffb15d6f262e9ed8e0e
    hash_after: de9562fa10eb7d43ef573ee942f7da37ae1bacf0
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/drafts fails
    inputs:
      - name: design/draft
        hash: e3591594fa1ad743
        size: 5641
    def: 08e16d07b0de477c
  - step: gate
    hand: box 3e46c581114 · claude-code-remote
    hash_before: 1b2dd2482b42e850107cef2158e2615e313cd7b9
    hash_after: 1b2dd2482b42e850107cef2158e2615e313cd7b9
    returns: 1
    why: "step 5 clashes with the import rule: noModule in src/imports/imports.go refuses one module importing another, and ownModule passes a module's own subpackages alone, so src/modules/drafts reading the finding body out of src/modules/hooks/write fails TestTheTreeHoldsTheImportRules. The draft's assumption names hooks/stop and views, and neither imports another module. Give the body a home outside src/modules that both IO modules reach, such as src/prose, and name it in the size; the first done_when line names a case of src/quack, and go test ./src/quack/... runs no case over the table: TestTheDraftCasesAnswerOffTheModule stands in src/modules/drafts, and the quack cases check the wiring alone. Run the table through the wired module in a quack case, with the Lint seam handed in so the case fakes Vale, or say which case decides the line; the draft names Holds.Asked where the tests name Questions, and its tests list names fold_test.go where the red list names questions_test.go. Match the draft to the tests"
  - step: design/draft-2
    hand: box 3e46c581114 · claude-code-remote
    hash_before: 7e9c210a362a7270b8b284e51457896fff9f8de5
    hash_after: 7e9c210a362a7270b8b284e51457896fff9f8de5
    inputs:
      - name: ask
        hash: 776b5067add31866
        size: 564
    def: 2fcb4abe3d77d8a2
group: go-cage-switches-over
depends_on: ["tools-keep-their-own-names"]
---

# Ask

The prose check and the answer check answer off the Go side, with the findings the bridge gives.

`readsDraft` and `readsAnswer` run in the bridge alone. Two readers of one voice drift apart unless one case table holds them.

- the Go prose check and answer check answer the findings one case table names, in a case of `src/quack`. `go test ./src/quack/...` decides it
- the JavaScript readers answer the same table, in `test/level0/answer-read.test.js`. `node --test test/level0/answer-read.test.js` decides it
- `./RUNME.sh check` exits 0

view: none

from: none

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

A new IO module `src/modules/drafts` answers `check_prose` and `check_answer` under their tool names, off the wiring until the flip, as `src/modules/search` does. The quack side hands it Vale through a seam, so a case feeds it rows.

1. `src/modules/drafts/drafts.go` registers `drafts/check_prose` and `drafts/check_answer` with `q.ToolName`, `q.Doc`, `q.IO()` and the inputs `proseSpec` and `checkSpec` declare. Each lists one request to the module.
2. `Outside` holds the seams: `Lint(text, name)` answering the kept rows with message and severity, whether a Vale stands and whether it ran; `Asked()` answering the owner's question count; `Bands()` answering `answer.words`, `answer.warnAt` and `answer.ceiling`.
3. `src/modules/drafts/prose.go` answers `check_prose` as `readsDraft` does: no path, no text, a code path reading nothing, a missing Vale, a Vale that ran nowhere, then the findings framed as `answerFindings` frames them.
4. `src/modules/drafts/answer.go` ports `stopsAlone`, `tableFaults`, `needsFaults`, `lengthFaults`, `proseWordsIn`, `wordsIn`, `scoreOf` and `bandOf` off `.claude/skills/level0/lib/answer.js` and `stop.js`, and answers `check_answer` as `checksAnswer` in `src/bridge/tools.js` does. Each finding takes its trimmed line as context, as `withContext` gives it.
5. The finding body moves into `src/modules/hooks/write` as one function beside `PlaceOf`, with the context line optional. `hooks.RefusedVoice` and the drafts answer both read it, so the body stands once.
6. `src/quack/drafts.go` wires the seams: `Lint` reads `heardOver` as it stands, since it already answers the kept rows with message and severity. `Bands` reads the settings. `Asked` reads the count through `store.OnCommit`, as `reportsHeard` in `src/quack/finds.go` does.
7. `Holds.prompted` in `src/modules/hooks/fold.go` keeps `Asked`, the question count of the owner's prompt, off `questionsIn` in `answer.js`, ported once into the hooks package.
8. One case table, `src/modules/drafts/testdata/draft-cases.json`, holds each case: the tool, its input, the rows Vale answers past the vetoes, the question count, and the text the bridge answers. `src/quack/drafts_test.go` and `test/level0/answer-read.test.js` each answer it.

Boundaries with sibling tickets:
- level0-tools-leave-the-bridge drops `check_prose` and `check_answer` from the bridge's `TOOLS`, and wires the module
- `gatesAnswer` and `answerRides` stay in the bridge, since the turn's end gate is no tool call

What I weigh: Vale runs once, in `heardOver`, so the commit voice, the write door and the drafts read one lint. The case table holds rows past the vetoes, so it tests the answer shape and leaves the vetoes to `src/prose` tests.

I assume: a module may import the hooks subpackages and `src/yaml`, as `hooks/stop` and `views` do. The research pass says a module imports q alone, and the tree says otherwise.

Risks:
- the JS cases feed raw rows to a fake Vale and the vetoes run over them, so a table row a veto drops reads differently on the two sides. Every table row carries a rule no veto reads.
- `questionsIn` ports beside its JS twin until the bridge leaves, so two readers stand for one release

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/modules/hooks/writes.go: RefusedVoice, which reads the moved finding body
src/modules/hooks/write: PlaceOf's file, which gains the finding body
src/modules/hooks/fold.go: Holds.prompted, which keeps Asked
src/quack/command.go: heardOver, which the drafts seam reads, unchanged
src/quack/accepts.go: accepts, which gains the drafts case
src/quack/main.go: modules, which gains drafts.Module
src/bridge/prose.js: readsDraft, which the table checks, unchanged
src/bridge/tools.js: checksAnswer, which the table checks, unchanged
test/level0/answer-read.test.js: the cases, which read the shared table

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

src/quack/drafts_test.go: TestTheDraftCasesAnswerOffTheModule
src/modules/drafts/drafts_test.go: TestAProseCheckNamingNoPathSaysWhy
src/modules/drafts/drafts_test.go: TestAProseCheckOverCodeReadsClean
src/modules/drafts/drafts_test.go: TestAProseCheckWithNoValeReadsClean
src/modules/drafts/drafts_test.go: TestAnAnswerCheckOnTheStopLineReadsClean
src/modules/drafts/drafts_test.go: TestAnAnswerMissingTheQuestionTableNamesIt
src/modules/drafts/drafts_test.go: TestAnAnswerStoppingWithoutTheNeedsTableNamesIt
src/modules/drafts/drafts_test.go: TestAnAnswerPastTheCeilingReadsRewrite
src/modules/hooks/fold_test.go: TestAnOwnersPromptKeepsItsQuestionCount
src/modules/hooks/writes_test.go: TestTheRefusalBodyReadsAsBefore
test/level0/answer-read.test.js: the bridge answers every case of draft-cases.json

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

src/modules/drafts/drafts.go, new
src/modules/drafts/prose.go, new
src/modules/drafts/answer.go, new
src/modules/drafts/drafts_test.go, new
src/modules/hooks/write/ the file holding PlaceOf
src/modules/hooks/writes.go
src/modules/hooks/fold.go
src/modules/hooks/fold_test.go
src/quack/drafts.go, new
src/quack/drafts_test.go, new
src/quack/accepts.go
src/quack/main.go
src/modules/drafts/testdata/draft-cases.json, new
test/level0/answer-read.test.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

every name the approach carries stands opened: readsDraft, readsAnswer, checksAnswer, answerFindings, withContext, heardOver, RefusedVoice, Holds.prompted, reportsHeard, search.Registers and accepts, and two research claims fell there
the callers list names each reader of the moved body, the fold, the seam and the wiring, and the two bridge readers the table checks
the Go done_when line rests on TestTheDraftCasesAnswerOffTheModule, the JS line on answer-read.test.js, and the check line on ./RUNME.sh check

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/modules/drafts/drafts_test.go src/quack/drafts_test.go src/modules/hooks/questions_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/modules/drafts/drafts_test.go
- src/quack/drafts_test.go
- src/modules/hooks/questions_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Every new case fails on its own assertion, against a stub module that registers nothing and answers an empty text, and a `Questions` field on `Holds` that nothing sets yet.

The table `src/modules/drafts/testdata/draft-cases.json` carries the bridge's own answers, and `test/level0/answer-read.test.js` answers every case green. So the JS done_when line holds from this step on, and pins the bridge the Go side ports. The table moved under the module's testdata in io-answers-take-result-shape: the module test read it through os, which the import rule refuses a module. It now rides in through embed, and the JS reader imports it as JSON.

What surprises me:
- the write door's CODE pattern names JavaScript and JSON paths alone, so a `.go` path reads as prose and Vale's rows stand. The code case takes `src/a.js`, and a case pins that a Vale running nowhere reads a `.go` path clean.
- `check_prose` answers through `answerFindings`, so a clean note reads "No finding stands in this answer", naming an answer. The table pins that wording, and the port keeps it.
- the table case runs in the module test over a fake Lint, since quack's Vale is the real one. The quack cases check the wiring alone: the module loads, and a tree with no Vale answers the bridge's line.
- `Holds.Asked` names something else already, so the count takes the name `Questions`.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the Go done_when line meets TestTheDraftCasesAnswerOffTheModule, the JS line the table cases in answer-read.test.js, green already, and the check line waits for tests-green
- the module cases run over a fake Lint, question count and bands, the quack cases over a temp tree with no Vale, and the fold case over stepper

## draft-2

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->
<!-- the form is text -->

A new IO module `src/modules/drafts` answers `check_prose` and `check_answer` under their tool names, off the wiring until the flip, as `src/modules/search` does. The quack side hands it Vale through a seam, so a case feeds it rows.

1. `src/modules/drafts/drafts.go` registers `drafts/check_prose` and `drafts/check_answer` with `q.ToolName`, `q.Doc`, `q.IO()` and the inputs `proseSpec` and `checkSpec` declare. Each lists one request to the module.
2. `Outside` holds the seams: `Lint(text, name)` answering the kept rows with message and severity, whether a Vale stands and whether it ran; `Questions()` answering the owner's question count; `Bands()` answering `answer.words`, `answer.warnAt` and `answer.ceiling`.
3. `src/modules/drafts/prose.go` answers `check_prose` as `readsDraft` does: no path, no text, a code path reading nothing, a missing Vale, a Vale that ran nowhere, then the findings framed as `answerFindings` frames them.
4. `src/modules/drafts/answer.go` ports `stopsAlone`, `tableFaults`, `needsFaults`, `lengthFaults`, `proseWordsIn`, `wordsIn`, `scoreOf` and `bandOf` off `.claude/skills/level0/lib/answer.js` and `stop.js`, and answers `check_answer` as `checksAnswer` in `src/bridge/tools.js` does. Each finding takes its trimmed line as context, as `withContext` gives it.
5. The finding body moves into `src/prose/finding.go`: a `Finding` with its place, rule, message, the cut text it wrote and an optional context line, and `Body(where, found)`, the lines each finding takes and the Hold line. `hooks.RefusedVoice` and the drafts answer both read it, each with its own opening, so the body stands once. `src/prose` stands outside `src/modules`, so both IO modules import it past the noModule rule. The caller cuts the wrote text, so `src/prose` reads no hooks package.
6. `src/quack/drafts.go` wires the seams in `draftsOutside(root, store, lint)`: `accepts` hands it `heardOver` as it stands, since that already answers the kept rows with message and severity. `Bands` reads the settings. `Questions` reads the count through `store.OnCommit`, as `reportsHeard` in `src/quack/finds.go` does.
7. `Holds.prompted` in `src/modules/hooks/fold.go` keeps `Questions`, the question count of the owner's prompt, off `questionsIn` in `answer.js`, ported once into the hooks package. `Holds.Asked` names another thing already.
8. One case table, `src/modules/drafts/testdata/draft-cases.json`, holds each case: the tool, its input, the rows Vale answers past the vetoes, the question count, and the text the bridge answers. The module test embeds it over a fake `Lint`. `src/quack/drafts_test.go` runs it through the wired module, with `draftsOutside` over a `Lint` the case fakes. `test/level0/answer-read.test.js` answers it on the bridge.

Boundaries with sibling tickets:
- level0-tools-leave-the-bridge drops `check_prose` and `check_answer` from the bridge's `TOOLS`, and wires the module
- `gatesAnswer` and `answerRides` stay in the bridge, since the turn's end gate is no tool call
- io-answers-take-result-shape wraps the module's text answer as the tool's result in `Door.calls`

What I weigh: Vale runs once, in `heardOver`, so the commit voice, the write door and the drafts read one lint. The body in `src/prose` sits beside the vetoes it frames, and no module owns it, so two modules read one body past the import rule.

I assume: an IO module may import a package outside `src/modules`, since onlyQ spares an IO module and noModule reads modules alone.

Risks:
- the JS cases feed raw rows to a fake Vale and the vetoes run over them, so a table row a veto drops reads differently on the two sides. Every table row carries a rule no veto reads.
- `questionsIn` ports beside its JS twin until the bridge leaves, so two readers stand for one release

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/modules/hooks/writes.go: RefusedVoice, which reads the body out of src/prose
- src/modules/hooks/write/refuse.go: PlaceOf, which the body's place takes over
- src/modules/hooks/fold.go: Holds.prompted, which keeps Questions
- src/quack/command.go: heardOver, which accepts hands the drafts seam, unchanged
- src/quack/accepts.go: accepts, which gains the drafts case
- src/quack/main.go: modules, which gains drafts.Module
- src/bridge/prose.js: readsDraft, which the table checks, unchanged
- src/bridge/tools.js: checksAnswer, which the table checks, unchanged
- test/level0/answer-read.test.js: the cases, which read the shared table

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/modules/drafts/drafts_test.go: TestTheDraftCasesAnswerOffTheModule
- src/modules/drafts/drafts_test.go: TestEachCheckLintsAsTheFileItReads
- src/modules/drafts/drafts_test.go: TestAnotherVerbMeetsARefusal
- src/quack/drafts_test.go: TestTheDraftCasesAnswerOffTheWiredModule
- src/quack/drafts_test.go: TestTheDraftsModuleLoads
- src/quack/drafts_test.go: TestQuackAnswersAnAnswerCheckWithNoValeAsTheBridgeDoes
- src/modules/hooks/questions_test.go: TestAnOwnersPromptKeepsItsQuestionCount
- src/modules/hooks/questions_test.go: TestAHelpersPromptKeepsNoQuestion
- src/prose/finding_test.go: TestTheBodyNamesEachFindingAndTheHold
- src/modules/hooks/writes_test.go: TestTheRefusalBodyReadsAsBefore
- test/level0/answer-read.test.js: the bridge answers every case of draft-cases.json

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- step 5 clashes with the import rule: the body moves to src/prose, outside src/modules, which both IO modules import past noModule
- the first done_when line runs no quack case over the table: TestTheDraftCasesAnswerOffTheWiredModule in src/quack runs it through the wired module, with draftsOutside over a faked Lint
- Asked against Questions, and fold_test against questions_test: the draft names Questions and questions_test.go, as the tests do

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/modules/drafts/drafts.go
- src/modules/drafts/prose.go, new
- src/modules/drafts/answer.go, new
- src/modules/drafts/drafts_test.go
- src/prose/finding.go, new
- src/prose/finding_test.go, new
- src/modules/hooks/writes.go
- src/modules/hooks/writes_test.go
- src/modules/hooks/fold.go
- src/modules/hooks/questions_test.go
- src/quack/drafts.go, new
- src/quack/drafts_test.go
- src/quack/accepts.go
- src/quack/main.go
- src/modules/drafts/testdata/draft-cases.json
- test/level0/answer-read.test.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- I opened noModule, onlyQ and ownModule in src/imports/imports.go, PlaceOf in hooks/write/refuse.go, RefusedVoice in hooks/writes.go, src/prose, both drafts test files and questions_test.go
- the callers list names each reader of the moved body, the fold, the seam and the wiring, and the two bridge readers the table checks
- the Go done_when line rests on TestTheDraftCasesAnswerOffTheWiredModule in src/quack, the JS line on answer-read.test.js, and the check line on ./RUNME.sh check

## tests-red-2

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

reject
- step 5 clashes with the import rule: noModule in src/imports/imports.go refuses one module importing another, and ownModule passes a module's own subpackages alone, so src/modules/drafts reading the finding body out of src/modules/hooks/write fails TestTheTreeHoldsTheImportRules. The draft's assumption names hooks/stop and views, and neither imports another module. Give the body a home outside src/modules that both IO modules reach, such as src/prose, and name it in the size
- the first done_when line names a case of src/quack, and go test ./src/quack/... runs no case over the table: TestTheDraftCasesAnswerOffTheModule stands in src/modules/drafts, and the quack cases check the wiring alone. Run the table through the wired module in a quack case, with the Lint seam handed in so the case fakes Vale, or say which case decides the line
- the draft names Holds.Asked where the tests name Questions, and its tests list names fold_test.go where the red list names questions_test.go. Match the draft to the tests

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

- A research pass for the draft, read only and not yet checked by a gate:
  - A new IO module `src/modules/drafts` registers `drafts/check_prose` and `drafts/check_answer` under their tool names, off the wiring until the flip, as `src/modules/search` does.
  - `src/modules/drafts/answer.go` ports the answer shape checks off `.claude/skills/level0/lib/answer.js`, `voice.js`, `stop.js`, `refuse.js` and `src/engine/tense.js`, since a module imports q alone.
  - `heardOver` in `src/quack/command.go` splits into `valeRows` and `keptOver`, so `src/quack/drafts.go` wires the lint seam.
  - `Holds.prompted` in `src/modules/hooks/fold.go` keeps the owner's question count, which the answer check reads through `store.OnCommit`, as `reportsHeard` in `src/quack/finds.go` does.
  - One case table, `src/modules/drafts/testdata/draft-cases.json`, holds the bridge's answers. `src/quack/drafts_test.go` and `test/level0/answer-read.test.js` each answer it.
  - Risk: the refusal body and `cut` then stand twice, in `hooks.RefusedVoice` and in `drafts`.
