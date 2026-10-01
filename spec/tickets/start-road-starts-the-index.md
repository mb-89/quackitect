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
depends_on: ["level0-tools-leave-the-bridge"]
step: gate
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 40b0ad3f11a · claude-code-remote
    hash_before: 6b0076dabc754f21a1104f6338c36cd2b7895dad
    hash_after: 6b0076dabc754f21a1104f6338c36cd2b7895dad
    inputs:
      - name: ask
        hash: 5f7a3192a0b5560c
        size: 635
      - name: [[spec/tickets/the-bridge-server-leaves]]
        hash: f6037bc7affa843e
        size: 247
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box 40b0ad3f11a · claude-code-remote
    hash_before: c33dacc84f08b2d6d12b59ea43eb1a961cfe7d0b
    hash_after: c33dacc84f08b2d6d12b59ea43eb1a961cfe7d0b
    answered:
      - name: tests
        exit: 1
        said: assertion, 14 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: 4fcf6bcca651be1f
        size: 4130
    def: 08e16d07b0de477c
---

# Ask

Every start road, the stub, the serve verb, the extension and the reload watcher start and probe the index alone.

The start hook, the stub's `serveOf`, the serve verb and the extension spawn `src/bridge/server.js`. Its removal breaks every start, so [[spec/tickets/the-bridge-server-leaves]] waits.

- `git grep -l src/bridge/server.js -- .claude src/scripts src/stub src/extension spec/config .vscode` answers nothing
- a cold start on a cloud box reaches the hooks door, in a case of `test/contract/cloud-start.test.js`. `node --test test/contract/cloud-start.test.js` decides it
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

Every road runs the index binary at `BIN` under the method root, with `standing`. That verb starts `serve` where no door answers, and `serve` listens on the hooks door and writes `.se/.runtime/hooks.json`. So `standing` is the start and the probe in one call.

1. The start road in `start.js` keeps its guards and its install. It drops the server self-test and the spawn. Where no binary stands, it runs the install again with `go index` off the skip list, so a cloud box builds the index. It then runs the binary with `standing` in the work root, and exits 8 with the binary's stderr where that fails. Code 9 reads: the install builds no index.
2. `INSTALL_SKIP` drops `go index`, since the index is now what the road starts.
3. The serve verb's `detachedStart` and `servesHere` run the same `standing`, and name the hooks door's port off the standing file. The `--inspect` road leaves, since a Go door takes no node inspector.
4. The stub's `serveOf` runs the vehicle's binary with `standing`, detached as before.
5. The extension's `startProcess` respawns the binary with `serve`, adopts a door the standing file names, and stops it with `stop`. Its debug road leaves with the node launch. A window reload adopts the standing door, which is the reload watcher the ask names.
6. The hook button in `draws.json`, `level0.schema.json` and the readers golden names the binary under `runs`, and drops `pauses`.
7. `.vscode/launch.json` drops the node launch of the server.
8. The cold probe's `COLD_PATH` names `src/quack/` and `src/modules/hooks/` in place of the server.

What I weigh: the bridge still answers the brief until the next child flips it. Both land in this group's one pull request, so `main` never holds the gap. I assume the gap on the branch costs this box's sessions their brief for one commit.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- .claude/skills/level0/hooks/start.js: START, REASONS, INSTALL_SKIP
- .claude/skills/level0/hooks/level0.js: starts, which runs START
- src/scripts/serve.js: portIn, probeOf, detachedStart, servesHere, serving
- src/scripts/verbs/serve.js: serveBridge
- src/scripts/pull.js and the take: serving, after a branch take
- src/stub/.claude/skills/level0/hooks/bridgehead.js: serveOf
- src/extension/editor-process.js: startProcess, adoptsProcess, stopProcess
- spec/config/draws.json: bridge.hook.runs
- spec/config/level0.schema.json and src/quack/testdata/readers.schema.json: the runs example
- .vscode/launch.json: the server launch
- src/scripts/probe-cold.js: COLD_PATH

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- test/contract/cloud-start.test.js: a cold start on a cloud box reaches the hooks door
- test/contract/cloud-start.test.js: a box with no index builds it, then starts it
- test/contract/cloud-start.test.js: an index failing its standing answers 8 with its stderr
- test/level0/serve.test.js: the serve verb runs the index standing and names the door's port
- test/level0/bridgehead.test.js: serveOf runs the vehicle's index standing
- test/contract/start-road-starts-the-index.test.js: no start road names src/bridge/server.js

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- .claude/skills/level0/hooks/start.js
- src/scripts/serve.js
- src/scripts/verbs/serve.js
- src/stub/.claude/skills/level0/hooks/bridgehead.js
- src/extension/editor-process.js
- spec/config/draws.json
- spec/config/level0.schema.json
- src/quack/testdata/readers.schema.json
- .vscode/launch.json
- src/scripts/probe-cold.js
- spec/design_output/level0.md, the start road chapters
- test/contract/cloud-start.test.js, test/level0/serve.test.js, test/level0/cli-serve.test.js, test/level0/bridgehead.test.js, test/level0/start-constants.test.js
- test/contract/start-road-starts-the-index.test.js, new

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- opened start.js, level0.js starts, serve.js, verbs/serve.js, serveOf, editor-process.js, draws.json, probe-cold.js, src/index answers.go standing and stop, and quack main.go Listen
- the callers list comes off git grep for server.js and for each changed export across src, .claude and spec/config
- the grep line is decided by the new contract test, the cold start by its cloud-start case, the check by ./RUNME.sh check

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- test/contract/cloud-start.test.js
- test/contract/start-road-starts-the-index.test.js
- test/level0/serve.test.js
- test/level0/cli-serve.test.js
- test/level0/bridgehead.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The cloud-start cases fail on their assertions, since the road still self-tests and spawns the bridge server. The serve fakes answer a node run as nothing answering, so the old bridge probe fails on the case's own assertion. The cold case drives the real index over a fresh temp root, and stops it after with the index's own stop verb. The command field reads the first word of the last line, so a bare node run reads as its duration and the branch test verb answers it.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the grep line meets the new contract test, the cold start meets its cloud-start case, and the check stays the green leaf's command
- the road runs the real node and a fake index script, the serve cases run the fake disk and process, and the cold case drives the real index as a contract test

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

- A research pass for the draft, read only and not yet checked by a gate:
  - `START` in `.claude/skills/level0/hooks/start.js` spawns `.se/.runtime/bin/se-index serve` detached, removes a stale `hooks.json` first, and polls for it to stand. `INSTALL_SKIP` drops go and the index.
  - `src/scripts/serve.js` probes the index's `standing` method off `index.json`, and the serve verb starts `se-index serve`.
  - The stub's `serveOf` runs the vehicle's `se-index standing`.
  - `src/extension/editor-process.js` respawns `se-index serve`, and `.vscode/launch.json` launches `src/quack serve`.
  - `COLD_PATH` in `src/scripts/probe-cold.js` names `src/modules/hooks/`.
  - A new `test/contract/start-roads-name-no-bridge.test.js` runs the ask's own `git grep`.
  - Risk: a cold Go build may outrun the start wait on a fresh cloud box.
