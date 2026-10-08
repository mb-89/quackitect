---
kind: [[ticket]]
state: closed
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
group: examples-run-as-tests
depends_on: ["example-harness-runs-on-fakes", "example-run-verb-clones"]
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 23ee163eaf36 · claude-code-remote
    hash_before: e20a2068af3875998c2476044a1ed6f56f4fbda0
    hash_after: e20a2068af3875998c2476044a1ed6f56f4fbda0
    inputs:
      - name: ask
        hash: b32b5aa231316757
        size: 777
      - name: [[spec/design_output/examples]]
        hash: 5245c4fe35ade37e
        size: 8237
    def: c01ae0f2ace0cecb
  - step: design/tests-red
    hand: box 23ee163eaf36 · claude-code-remote
    hash_before: d387e7164ece2bdbdd8e868d013a67d49068df12
    hash_after: d387e7164ece2bdbdd8e868d013a67d49068df12
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/examples fails
    inputs:
      - name: design/draft
        hash: 42d25d2c30ab4573
        size: 3668
    def: 08e16d07b0de477c
  - step: gate
    hand: box 23ee163eaf36 · claude-code-remote · helper-4
    hash_before: 67d1f2e61e5cae0c142da1788349a338c54ab371
    hash_after: 67d1f2e61e5cae0c142da1788349a338c54ab371
    inputs:
      - name: design/draft
        hash: 42d25d2c30ab4573
        size: 3668
      - name: design/tests-red
        hash: 6e5266e5a67686d0
        size: 997
    def: dc4904ab364efa10
  - step: implement/change
    hand: box 23ee163eaf36 · claude-code-remote
    hash_before: c945ac8dbf87eb109bd72072d0e829674a413881
    hash_after: c945ac8dbf87eb109bd72072d0e829674a413881
    answered:
      - name: lint
        exit: 0
        said: ""
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box 23ee163eaf36 · claude-code-remote
    hash_before: 79c62a96552a3aa8b541c7920f4804f383797e01
    hash_after: 909c84573dd37806272e057e8dc280c61836bb25
    answered:
      - name: tests
        exit: 0
        said: green, src/tui/tutorial passes; green, src/modules/examples passes; green, src/quack passes
      - name: check
        exit: 0
        said: "   88.1  in all"
    inputs:
      - name: design/tests-red
        hash: 6e5266e5a67686d0
        size: 997
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

The window holds an explorer as pyqtgraph's does: the examples by chapter, the selected one's prose and calls, its last verdict, and a Run key. [[spec/design_output/examples#the-tutorial-tab]]

The examples stand as files a user has to find by hand, and the tutorial reaches nobody.

- `./RUNME.sh tui tutorial` opens a tab holding the tree of examples by chapter, with the developer chapters under a section of their own
- the main view draws the selected file's prose and calls
- each row carries its last pass or fail off `.se/.runtime/examples.json`
- F5 starts the selected example as `./RUNME.sh example run` does
- each line holds a case in `src/tui`, and `./RUNME.sh check` exits 0

the Tutorial tab in `./RUNME.sh tui`, showing each example with its last verdict

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

The tab reads one index name, and F5 posts one action, so the window reads no file and runs no process of its own.

- A module `src/modules/examples` registers in `projected` in `src/quack/main.go`, beside `holds` and `views`. Its derived name `examples/rows` reads `files/<path...>`. Each file under `spec/examples/<chapter>/` becomes one row through `example.Read`: the path, the chapter, the dev mark, the title, the keywords, the interface, the body, and the last verdict and miss off `.se/.runtime/examples.json`. A row the file holds no verdict for carries none.
- The same module registers the action `examples/run`, taking a path. It answers one request to the node module, `run` with `example run <path>`, as `bless/set` does in `src/modules/holds`. So the run starts off the window, against the real tree, and the window holds no terminal of its own. The run verb sees no terminal on its input, so it runs straight through.
- A package `src/tui/tutorial` holds the tab. `New(source)` takes the catalog and the caller, as the work tab does. The tab watches `examples/rows`, so a new verdict redraws the marks. `Left` draws the user chapters, then a `developer` heading over the `9xx_dev` chapters. Each chapter is a heading row, and each example a row under it, with a mark of pass, fail, or a blank before its first run. `Detail` draws the selected file: the title, then the body with the front cut off, each fenced block in the call style, headings bold, and the rest wrapped through `RenderParts`. F5 posts `examples/run` with the selected path, and the notice says the run starts and where its clone stands.
- `tuiTabs` in `src/quack/tui_verb.go` gains `tutorial`, and `newModelOver` in `src/tui/main.go` adds the tab after `work`, so `./RUNME.sh tui tutorial` opens it. `ExampleCovers` then names `tui tutorial` until an example shows the tab.
- `Narrow` stays a plain word match on the title here, and the search ticket owns the two modes and the highlight.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/quack/main.go projections, which registers every module in projected
- src/tui/main.go newModelOver, which builds the tab list
- src/quack/tui_verb.go tuiTabs and the TabNamed words, which open a tab by name
- src/modules/check/coverage.go exampleCovers, which reads tuiTabs

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/modules/examples/examples_test.go TestTheRowsReadEachExampleWithItsChapterAndVerdict
- src/modules/examples/examples_test.go TestRunAsksTheNodeModuleForTheExampleRun
- src/tui/tutorial/tab_test.go TestTheTreeHoldsTheUserChaptersThenTheDeveloperSection
- src/tui/tutorial/tab_test.go TestTheMainViewDrawsTheSelectedProseAndCalls
- src/tui/tutorial/tab_test.go TestEachRowCarriesItsLastVerdict
- src/tui/tutorial/tab_test.go TestF5PostsTheSelectedExampleRun
- src/quack/tui_verb_test.go TestTuiNamesTheTutorialTab

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/modules/examples/examples.go
- src/modules/examples/examples_test.go
- src/quack/main.go
- src/quack/tui_verb.go
- src/quack/tui_verb_test.go
- src/tui/main.go
- src/tui/tutorial/tab.go
- src/tui/tutorial/tab_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file named stands opened: frame.Tab in src/tui/frame/tabs.go, newModelOver in src/tui/main.go, work.Tab and its posts in src/tui/work/actions.go, registry.Catalog and Fake, holds.Registers with its node request, projected in src/quack/main.go, tuiTabs, RenderParts and draw.Wrap
- the callers list names the module list, the tab list, the tab words and the coverage rule reading them
- each done_when line names its test: the chapters and the developer section, the main view, the verdict marks, F5, the tab word, and the check run itself
- the approach adds no config key

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/modules/examples/examples_test.go src/tui/tutorial/tab_test.go src/quack/tui_verb_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/modules/examples/examples_test.go
- src/tui/tutorial/tab_test.go
- src/quack/tui_verb_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The cases run over stubs: the module answers no row and no run, and the tab draws nothing and posts nothing, so each fails on its own assertion. The tab cases hand the rows in as the watch does, through a registry.Change, and drive F5 through the window, so the key reaches the tab the way a person presses it. No Markdown renderer stands in the window, so the main view draws the body through RenderParts and marks the fenced blocks itself.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each done_when line meets a red case: the chapters and the developer section, the main view, the verdict marks, F5, the tab word, and the check at the end
- every door the tests reach has a fake: the catalog, the watch and the caller through registry.Fake, and the index through q/qtest

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

go build ./... && go vet ./src/tui/... ./src/modules/examples/ ./src/quack/

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- files: the change touches the draft's size list, plus src/tui/window_test.go, whose strip case pins the tab order the draft changes
- doors: the tab reads and posts through the Source the work tab takes, whose fake is registry.Fake, and the module reads files through the index, whose fake is qtest
- approach: each new function carries a pointer at spec/design_output/examples, the tab at the-tutorial-tab and the narrow at the-search
- one place: RowsName and RunName stand in the module, and the tab spells them again with a comment naming the owner, as the work tab does

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh branch test src/tui/tutorial/tab_test.go src/modules/examples/examples_test.go src/quack/tui_verb_test.go

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The window gains a tutorial tab, opened by ./RUNME.sh tui tutorial. A new module, src/modules/examples, reads every file under spec/examples into one row each under examples/rows. Each row holds its chapter, a developer mark, the title, the keywords, the interface, the body and the last verdict the harness wrote. Its action examples/run hands the node module the run verb, so a run starts off the window in a clone of its own. The tab in src/tui/tutorial watches the rows. It draws the user chapters, then a developer heading over the developer chapters, each row with a pass, a fail or a blank mark. The main view draws the selected title, its miss, then its prose and its calls with the front cut off. F5 posts the run of the selected example, and the answer stands as the notice. The window's import table and the design table of its packages gain the tutorial row. The strip case names the tab after work.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- files: past the draft's list, the change touches src/tui/window_test.go for the tab order, and src/imports with spec/design_output/tui.md for the import row
- doors: the tab reads through registry.Fake in its cases, and the module through qtest
- approach: each new function carries a pointer at spec/design_output/examples
- one place: the names stand in the module, and the tab spells them again under a comment naming the owner

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
