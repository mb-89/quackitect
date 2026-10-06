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
    hand: box add8d8d0dd3d · claude-code-remote
    hash_before: d0ce30ea438baf8af039b5a4c32b736d7c03d16c
    hash_after: 9ed48d7dacecb407a7947917498b7e235226c7af
    inputs:
      - name: ask
        hash: acdc248052365f28
        size: 635
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box add8d8d0dd3d · claude-code-remote
    hash_before: 1b96f8fab62a95d4bf6c5e063675074e461d1b20
    hash_after: 1b96f8fab62a95d4bf6c5e063675074e461d1b20
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/owns fails
    inputs:
      - name: design/draft
        hash: 70af77eecb1a5860
        size: 3573
    def: 08e16d07b0de477c
  - step: gate
    hand: box add8d8d0dd3d · claude-code-remote · helper-4
    hash_before: d40279ffb19c26e3fbce4378c5210cead009716e
    hash_after: d40279ffb19c26e3fbce4378c5210cead009716e
    inputs:
      - name: design/draft
        hash: 70af77eecb1a5860
        size: 3573
      - name: design/tests-red
        hash: c8f29294cd586466
        size: 824
    def: dc4904ab364efa10
---

# Ask

The JavaScript outside `src/doors`, under `src/extension`, `src/scripts` and `prototype`, reaches timers, the network and `node:` modules through the doors that own them, so the JavaScript doors can drop report.

A timer or a fetch outside its door slips past every fake, and the JavaScript doors stand at report for good.

- `./RUNME.sh doors` lists no walk-around in a JavaScript file that is no test
- the drawing code running in the page reads its timers off a door or a declaration that names the page as its own outside, and `./RUNME.sh doors` shows which
- `./RUNME.sh test` passes over every file the change touches

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

Two declarations, and the rest moves onto the doors.

| where | what it reaches | the change |
|---|---|---|
| `src/extension/drawing/route.mjs` | the page's timers and time, inside a bundle of the webview sources | `src/extension/drawing/owns.yaml` declares the page as its own outside, owning those names, with `route.mjs` as its file. The bundle runs in the editor's page, where no node door reaches, and nobody edits it by hand |
| `prototype/trace-view` | timers and `node:child_process` | `prototype/trace-view/owns.yaml` declares the prototype as its own outside, since it runs alone and ships nowhere |
| `src/doors/awake.js`, `src/doors/proc.js` | timers | each takes the clock door, as a door standing on another does |
| `src/bridge/wait.js`, `src/scripts/probe-clear.js`, `src/scripts/probe-dry.js` | timers | each takes the clock door off the hand its root builds |
| `src/scripts/copilot.js` | `fetch` | takes the http door |
| `src/extension/editor.js`, `src/extension/lib/lsp.js`, `src/extension/lib/settle.js` | timers and time | each takes the clock door off the hand the extension's activation builds |
| `src/extension/editor-files.js`, `src/extension/editor-index.js`, `src/extension/editor-process.js` | `node:fs`, `fetch`, `node:http` | each takes the disk, http or wire door off that same hand |

The extension's activation stands as a root, as the command line does, and builds every door once. The assumption: the packaged extension reaches `src/doors`, as `src/scripts` does today. Where it does not, the bundle step carries the doors in.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/doors/awake.js and src/doors/proc.js: every caller building them, which the root names
src/bridge/wait.js wait
src/scripts/probe-clear.js, src/scripts/probe-dry.js, src/scripts/copilot.js: their mains
src/extension/editor.js activate: the root that builds the hand
src/extension/lib/settle.js, src/extension/lib/lsp.js, src/extension/editor-files.js, src/extension/editor-index.js, src/extension/editor-process.js: every caller in the extension
src/owns: reads the two new declarations, unchanged

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

test/contract/awake.test.js and test/contract/proc.test.js: the door built over the real clock
test/level0/settle.test.js: settles on the fake clock with no wall wait
test/level0/lsp.test.js: the lsp client times out on the fake clock
test/level0/editor-doors.test.js: the activation builds every door once and hands it on
test/level0/probe-dry.test.js and test/level0/probe-clear.test.js: the probe waits on the fake clock
test/level0/copilot.test.js: copilot fetches through the fake http door
src/owns/tree_test.go TestEveryDoorNamesAPlantedWalk: covers the two new declarations, unchanged

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

src/extension/drawing/owns.yaml
prototype/trace-view/owns.yaml
src/doors/awake.js
src/doors/proc.js
src/bridge/wait.js
src/scripts/probe-clear.js
src/scripts/probe-dry.js
src/scripts/copilot.js
src/extension/editor.js
src/extension/editor-files.js
src/extension/editor-index.js
src/extension/editor-process.js
src/extension/lib/lsp.js
src/extension/lib/settle.js
the tests the tests list names

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

opened `src/scripts/bundle.js`, the head of `route.mjs`, `src/doors/owns.yaml` and the walk list in `src/modules/check/textfaults.go`, and each claim stands there
the callers list names each file `./RUNME.sh doors` lists in production JavaScript, and the root building each hand
the first done_when line falls to `./RUNME.sh doors`, the second to the two declarations it lists, the third to `./RUNME.sh test` over the tests list

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/owns

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

src/owns/scripts_tree_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The case reads every production script of the tree and names each walk-around past a marked line. It names the same walk-arounds `./RUNME.sh doors` lists for production JavaScript, so it decides the first done_when line, and goes green once the two declarations land and each file takes its door. It stands in a file of its own, because the red list leaves a whole file out of the check, and `tree_test.go` keeps its green cases inside it. The module tests the draft names already exist, and change with the code.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the case names its claim and asserts it per walk-around, naming the file, line and door
the case reads the tree and writes nothing
the case goes red on each walk-around the change removes, as the run shows

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

pass with findings
- extension-root-is-activate: the draft names `src/extension/editor.js activate` as the root, but `activate` stands in `src/extension/extension.js`, the package main, which builds the editor door through `editorDoor` and requires `lib/settle.js` and `lib/lsp.js`; add `extension.js` and `test/level0/editor.test.js` to callers and size
- doors-lists-declared-outsides: `./RUNME.sh doors` prints a declaration only through its `contract` line in `walksOver`, so a page or prototype declaration with no contract test stands silent, and no red case decides the second done_when line; make the verb print each declared outside and its files, with a red case in `src/quack/verb_doors_test.go`, and list each prototype file under `files`, since `files` takes files and no folder
- extension-loads-doors-async: the extension loads as CommonJS and reaches the ESM doors only by `await import` off `homeOf` in `editor-process.js`, which itself calls `realpathSync` from `node:fs`; name how activation awaits the doors before it builds the hand, and mark the `realpathSync` line with its reason
- tests-list-misses-callers: the tests list leaves out `test/level0/wait.test.js` for `src/bridge/wait.js`, and `test/contract/editor-files.test.js` and `test/contract/editor-index.test.js`, which change with the extension files

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
