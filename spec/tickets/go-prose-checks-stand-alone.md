---
kind: [[ticket]]
state: open
step: design/tests-red
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
group: node-leaves-the-boxes
record:
  - step: design/draft
    hand: box 77f4c295c43a · claude-code-remote
    hash_before: f6389a4cd5ce99fdc3e5c8f533637846b1148bc5
    hash_after: f6389a4cd5ce99fdc3e5c8f533637846b1148bc5
    inputs:
      - name: ask
        hash: 8e11a8a438953a0e
        size: 250
    def: 71651f49796eeda4
---

# Ask

The Go prose checks become the only copy, and wink leaves the tree.

The prose checks were the last reason Node runs at runtime.

- `go test ./...` from the root passes
- `git grep -n wink -- package.json` answers nothing
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

The Go vetoes in `src/prose` become the one reader of Vale's findings, and wink leaves with its two importers.

- `readsProse` in `src/bridge/prose.js` answers off `keptOf` in all mode alone. `longest`, `withoutFalseLength`, `withoutFalseOutside` and the word and cap readers leave with the wink import.
- `readsText` and `readThrough` in `src/bridge/findings.js` answer off `quack prose` in past mode alone.
- `readThrough` sends every file in one request, through a new `keptOver` in `src/scripts/quack-topic.js`, so a check pays one process.
- `keptOf` rides `keptOver`, and a list holding no finding answers itself with no process.
- `src/engine/tense.js` leaves, and `withContext` moves into `src/bridge/prose.js`, its last JavaScript caller.
- `lintedBy` in `src/scripts/prepush.js` and `readThroughTheReader` in `src/scripts/cli-read.js` hand `readThrough` the proc door `quack` needs.
- The LSP module's past veto calls `prose.ReadsAsPast` in Go. `Tools` drops its `Node` and `Tense` fields, and `tenseScript`, `tenseAt` and the `toolInputs` row for `tense.js` go.
- `package.json` names no dependency, and `package-lock.json` follows.
- The `modules` item leaves `src/scripts/install.sh`, since wink is its one package.
- The start road in `.claude/skills/level0/hooks/start.js` reads a fresh clone off the index binary in place of `node_modules`, since npm brings no folder now. Code 6 leaves `REASONS`, and code 7 says the road installs the tree.
- The tense reader and bridgehead sections of `spec/design_output/level0.md` follow, and so do the headers of `src/prose/prose.go` and `src/quack/prose.go`.

Weighed: the start road and the install's `modules` item stand outside the ask's words. Both read wink's folder, so a fresh cloud box breaks without the change. [[spec/tickets/install-drops-node]] takes the rest of `install.sh`.

Assumed: the quack binary stands wherever a reader runs, as [[spec/tickets/readers-take-the-go-topics]] assumes.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- `src/bridge/write.js`: `proseFaults` calls `readsProse`
- `src/bridge/bash.js`: `messageFaults` calls `readsProse`
- `src/bridge/answer-read.js`: `readsAnswer` calls `readsProse`
- `src/bridge/findings.js`: `findingsOver` calls `readsText` and `readThrough`
- `src/bridge/findings.js`: `voiceOver` calls `readsText`
- `src/scripts/prepush.js`: `lintedBy` calls `readThrough`
- `src/scripts/cli-read.js`: `readThroughTheReader` calls `readThrough`
- `src/modules/lsp/tools.go`: `vetoes` calls `pastReads`
- `src/modules/lsp/door.go`: `reads` fills `Node` and `Tense`
- `.claude/skills/level0/hooks/level0.js`: `startsOnce` runs `START` and reads `INSTALLED`
- `test/contract/paragraph.test.js` and `test/contract/process.test.js` call `withoutFalsePast`
- `test/level0/tense.test.js`, `test/level0/prose.test.js` and `test/level0/topic-readers.test.js` call the wink readers

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- `test/level0/topic-readers.test.js`: readThrough runs quack prose once over every file it reads
- `test/level0/topic-readers.test.js`: keptOf answers a list holding no finding with no process
- `test/contract/tree-extension.test.js`: npm reaches the extension alone, and the root names no dependency
- `test/contract/cloud-start.test.js`: a fresh clone carrying no index installs the tree, then starts the index
- `src/modules/lsp/tools_test.go`: TestTheTenseReaderDropsAPastRow, with no node call

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first draft

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- I open every file the approach names, and each function stands where it says
- a search for each changed name over `src`, `test` and `.claude` gives the callers list
- the first done line rides `go test ./...`, the second rides the tree-extension case, the third rides `./RUNME.sh check`

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
