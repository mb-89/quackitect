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
group: go-cage-switches-over
step: gate
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box d891eb165fd6 · claude-code-remote
    hash_before: f025a48123b54193dac48a48857ba75281782bae
    hash_after: f025a48123b54193dac48a48857ba75281782bae
    inputs:
      - name: ask
        hash: 3c86df4df802db9d
        size: 750
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d891eb165fd6 · claude-code-remote
    hash_before: 4fd23bf69161a851b60c8b37cb98e611e061db90
    hash_after: 4fd23bf69161a851b60c8b37cb98e611e061db90
    answered:
      - name: tests
        exit: 1
        said: assertion, 2 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: 31dfa12d59625063
        size: 2665
    def: 08e16d07b0de477c
---

# Ask

The hooks door answers an owner's prompt: it puts the answer-first line in front, and writes the prompt's row to the session log.

`submitsPrompt` in `src/bridge/server.js` writes the row and rewrites the prompt. The door has no `event` effect and no log writer, so the viewer and the retro go blind without the bridge.

- a prompt submit answers an `event` effect opening on the answer-first line, in a case of `src/modules/hooks`. `go test ./src/modules/hooks/...` decides it
- the prompt lands as a row of the session log, in a case of `src/modules/hooks`
- `stepOf` in the cage maps the `event` effect, in a case of `test/level0/cage.test.js`. `node --test test/level0/cage.test.js` decides it
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

The holds fold names the prompt's row and its rewrite, and the door writes the row and answers the rewrite as an event effect, as `onPromptSubmit` in src/bridge/answer.js does.

1. `prompted` in src/modules/hooks/fold.go already opens the owner's demand. The prompt submit now also says a row, prompt for an owner and agent for anything else, and the rewrite for an owner's prompt. The rewrite puts `warns` of the prompt's why in front of the text, and drops `before` off the event.
2. The door gains an event effect kind. `Door.Hook` answers the rewrite as an event effect carrying the rewritten fields.
3. A row writer in the hooks module appends each row the folds name to the session log, in the shape `Row` in src/modules/log/log.go reads. It writes through the module's own disk, as the marks do, under a pointer at the folder's owner.
4. `stepOf` in cage.js maps an event effect to an answer carrying the event, the shape level0.js reads off the bridge today.

A prompt naming a note and the questions a prompt asks stay with the bridge until the flip, as the fold says today. They join the brief's flip ticket as points if the gate asks. What I weigh: one writer of rows in Go serves the spawn and the clear ports after this one. I assume the log's reader takes a row a Go writer appends beside the bridge's rows.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/modules/hooks/fold.go: stepHolds and prompted
- src/modules/hooks/hooks.go: Door.Hook and Effect
- src/modules/hooks/rows.go, new: the row writer
- .claude/skills/level0/hooks/cage.js: stepOf
- .claude/skills/level0/hooks/level0.js: door, which reads stepOf
- src/modules/log/log.go: Row, which the writer fills

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/modules/hooks/prompt_test.go: TestAnOwnersPromptAnswersTheEventOpeningOnTheAnswerFirstLine
- src/modules/hooks/prompt_test.go: TestAPromptLandsAsARowOfTheSessionLog
- src/modules/hooks/prompt_test.go: TestAHelpersHandBackLandsAsAnAgentRowAndPasses
- test/level0/cage.test.js: an event effect answers the rewritten event

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/modules/hooks/fold.go
- src/modules/hooks/hooks.go
- src/modules/hooks/rows.go, new
- src/modules/hooks/prompt_test.go, new
- .claude/skills/level0/hooks/cage.js
- test/level0/cage.test.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- opened onPromptSubmit and warns in answer.js, the Row type in the log module, the session log path in src/quack/log.go, prompted in fold.go and stepOf in cage.js, and each claim holds there
- the callers list names the fold, the door, the new writer, the cage's step and the Row it fills
- the first done line meets the rewrite case, the second the row cases, the third the cage case, and the fourth the check

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/modules/hooks/prompt_test.go test/level0/cage.test.js

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/modules/hooks/prompt_test.go
- test/level0/cage.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Three Go cases red on their own assertion. The door answers pass to an owner's prompt, and it writes no row of the session log for a prompt or a hand-back. The cage case reds too, since `stepOf` drops an event effect.

What surprises me: the cage test file stands red for the clear port already, so both ports share one red file until their tests-green steps close.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the first done line meets the rewrite case, the second the two row cases, the third the cage case, and the fourth the check at tests-green
- the cases reach a temp tree and the fake index the package already uses, and the cage case reaches no door

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
