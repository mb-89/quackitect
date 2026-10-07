---
kind: [[ticket]]
state: open
step: gate
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
depends_on: ["example-tutorial-tab-draws"]
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 23ee163eaf36 · claude-code-remote
    hash_before: 1e82a2043f8aa84c1901b87e36db3ee5a42132c0
    hash_after: 1e82a2043f8aa84c1901b87e36db3ee5a42132c0
    inputs:
      - name: ask
        hash: cbde1a14dc72bbf9
        size: 629
      - name: [[spec/design_output/examples]]
        hash: 5245c4fe35ade37e
        size: 8237
    def: c01ae0f2ace0cecb
  - step: design/tests-red
    hand: box 23ee163eaf36 · claude-code-remote
    hash_before: dc59c52ecdc209add95d2ea475ec7c558c643058
    hash_after: dc59c52ecdc209add95d2ea475ec7c558c643058
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/tui/tutorial fails
    inputs:
      - name: design/draft
        hash: 2c01e3f3b017de14
        size: 3315
      - name: [[spec/design_output/examples]]
        hash: 5245c4fe35ade37e
        size: 8237
    def: 08e16d07b0de477c
---

# Ask

A user finds the example for a thing by its title or by a word inside it, and sees the word where it stands. [[spec/design_output/examples#the-search]]

A user scrolls the whole tree for the one example they want.

- title mode shrinks the tree to the examples whose title matches
- content mode keeps each example whose title, keywords or body matches, and the main view highlights every match
- a key in the filter pane turns the mode over, and clearing the search brings the tree back with the selection held
- each line holds a case in `src/tui`, and `./RUNME.sh check` exits 0

the Tutorial tab's search, in both modes

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

All in src/tui/tutorial/tab.go, after [[spec/design_output/examples#the-search]].

1. The tab holds a `content bool` beside `word`; title mode is the zero value.
2. `kept()` reads one pure function `matches(row, word, content)`: title mode tests the lowered title, content mode the lowered title, each keyword and the body. The tree already drops a chapter holding no kept row, since `Left` draws headings off the kept rows alone.
3. A new Act in `Keys`, `alt+m`, with `Under: true`, so it works while the filter line takes letters (the `alt+l` pattern in src/tui/log/tab.go). It flips `content` and calls `Move(m, 0)`, so the selection lands on a kept row. `alt+m` stands free across src/tui.
4. `Left` opens with a dim line naming the mode, `title search` or `content search`, while `word` stands non-empty. The footer cannot carry it: `RenderMarks` reads the marks of `Tabs[0]`, the log.
5. `Detail` in content mode with a word wraps each line through `draw.Wrap(line, w)` itself and hands each wrapped line as a `Drawn` part, every case-blind match rendered in a `matchStyle` (reverse video) and the rest in the line's own style. The title line takes the same light. Title mode draws as it stands. Cost: a match the wrap splits lights on each half apart; the keywords stay unlit, because `Detail` draws none.
6. `Narrow` keeps its body: an empty word keeps every row, and `Move(m, 0)` holds `At` where it stands, so clearing brings the tree back with the selection held. Its comment drops the line saying the search ticket owns the modes.

Assumptions: a match is a case-blind substring, as `kept()` reads it today; the mode survives a cleared line, so the next search runs in the mode the user set.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/tui/frame/filterpane.go Model.Narrow, calling Tab.Narrow
- src/tui/frame/model.go Model.Update, calling Tab.Keys for an Under act
- src/tui/frame/keys.go Model bands, calling Tab.Keys for the help
- src/tui/frame/model.go Model.LoadPane, calling Tab.Detail
- src/tui/frame/model.go Model.View, calling Tab.Left
- src/tui/tutorial/tab.go Tab.Move and Tab.Left, calling kept

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/tui/tutorial/tab_test.go TestTitleModeKeepsTheExamplesWhoseTitleMatches
- src/tui/tutorial/tab_test.go TestContentModeKeepsTitleKeywordsOrBodyMatches
- src/tui/tutorial/tab_test.go TestContentModeLightsEveryMatchInTheMainView
- src/tui/tutorial/tab_test.go TestAltMTurnsTheModeOverUnderTheFilterPane
- src/tui/tutorial/tab_test.go TestClearingTheSearchBringsTheTreeBackWithTheSelectionHeld

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/tui/tutorial/tab.go
- src/tui/tutorial/tab_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- opened tab.go, frame/filterpane.go, frame/part.go, frame/tabs.go, frame/keys.go, frame/model.go, frame/footer.go, draw/wrap.go and tab_test.go, and checked each claim there
- the callers list names the frame call sites of Narrow, Keys, Detail and Left, found by grep over src/tui/frame, and the two in-tab callers of kept
- done_when 1 meets TestTitleModeKeepsTheExamplesWhoseTitleMatches; 2 meets TestContentModeKeepsTitleKeywordsOrBodyMatches and TestContentModeLightsEveryMatchInTheMainView; 3 meets TestAltMTurnsTheModeOverUnderTheFilterPane and TestClearingTheSearchBringsTheTreeBackWithTheSelectionHeld; 4 meets those cases and ./RUNME.sh check
- the approach adds no config key

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/tui/tutorial/tab_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/tui/tutorial/tab_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Each new case fails on its own assertion, and the four cases standing before pass. Title and content cases miss the mode line on the tree. alt+m falls through to the text input and types an m, so the line reads boxm. Clearing finds the selection on the first row, since content mode never keeps the keyword row. The light case counts no lit match. A surprise: no test in src/tui forces a colour profile, so a lit match reads as plain text. A TestMain sets the ANSI profile once before any case, which keeps the cases parallel.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- done_when 1 meets TestTitleModeKeepsTheExamplesWhoseTitleMatches, 2 meets TestContentModeKeepsTitleKeywordsOrBodyMatches and TestContentModeLightsEveryMatchInTheMainView, 3 meets TestAltMTurnsTheModeOverUnderTheFilterPane and TestClearingTheSearchBringsTheTreeBackWithTheSelectionHeld, and 4 meets those cases with ./RUNME.sh check at implement
- the tests reach the registry door alone, through registry.Fake, which the window helper already hands the tab

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
