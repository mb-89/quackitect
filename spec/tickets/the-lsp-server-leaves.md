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
group: lsp-door-switches-over
depends_on: ["lsp-module-serves-the-features","lsp-module-draws-the-tools"]
record:
  - step: design/draft
    hand: box d8922c5f7ed7 · claude-code-remote
    hash_before: 61ae1d4a1783960d885a8d54d0dcd555152035e8
    hash_after: f12a9c68e8c06aa796c538a3fd07f559e79a8876
    inputs:
      - name: ask
        hash: cd2c7ff40c7ad82d
        size: 226
    def: 71651f49796eeda4
  - step: design/tests-red
    hand: box d893e0ab0f106 · claude-code-remote
    hash_before: 8c53b6f45f3696591d3ad710fb753991407c97ff
    hash_after: 261bc6e002b60a79730cb71dcda45a014d2832ad
    answered:
      - name: tests
        exit: 1
        said: assertion, 6 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: 2daa6e613ad1a13f
        size: 3685
      - name: [[spec/tickets/lsp-module-serves-the-features]]
        hash: 95ea1cdfa0608ff2
        size: 25715
      - name: [[spec/tickets/lsp-module-draws-the-tools]]
        hash: ca27b08b2eb5acbe
        size: 15910
    def: 08e16d07b0de477c
  - step: gate
    hand: box d893e0ab0f106 · claude-code-remote
    hash_before: 55cafb42f851f33f7cc26347a569c25a48b22ab9
    hash_after: 55cafb42f851f33f7cc26347a569c25a48b22ab9
    inputs:
      - name: design/draft
        hash: 2daa6e613ad1a13f
        size: 3685
      - name: design/tests-red
        hash: f64de9f42fa5bedc
        size: 1458
      - name: [[spec/tickets/lsp-module-serves-the-features]]
        hash: 95ea1cdfa0608ff2
        size: 25715
      - name: [[spec/tickets/lsp-module-draws-the-tools]]
        hash: ca27b08b2eb5acbe
        size: 15910
    def: dc4904ab364efa10
  - step: implement/change
    hand: box d893e0ab0f106 · claude-code-remote
    hash_before: cfcdc416b9b7abb4774714e35f7bb858c376dbfe
    hash_after: cfcdc416b9b7abb4774714e35f7bb858c376dbfe
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
    def: f150b8c0dc20fe45
---

# Ask

`migration/config/slices/lsp` moves to `new`, and the LSP's own server, port and index client leave the tree.

A second server drifts from the model.

- `git grep -n 'lsp.json' src` answers nothing
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

The editor starts `quack lsp` off the index binary, and `src/lsp` leaves whole once its two children land: the features in [[spec/tickets/lsp-module-serves-the-features]] and the tool rows in [[spec/tickets/lsp-module-draws-the-tools]].

| what | the change |
|---|---|
| the slice | `migration.lsp` reads `new` in `spec/config/level0.json` |
| the editor | `serverAsk` in `src/extension/lib/lsp.js` starts `.se/.runtime/bin/se-index` with `lsp`, the binary `BIN` in `.claude/skills/level0/lib/index.js` names |
| the server | `src/lsp` leaves: `serve.go` and its `lsp.json`, `port.go` and its `panel.json`, `indexed.go`, `shadow.go`, `watch.go`, and the stdio server |
| the port client | `src/scripts/cli-served.js` leaves |
| the lint | `readingFor` in `src/scripts/cli-read.js` reads `check/sweep` through `topicOf` in `src/scripts/quack-topic.js`, keeps the rows under the paths it asks, and adds `findingsOver` and `aloneOver` beside it. The JavaScript `treeFaults` and `schemaFaults` reads leave it |
| the standing file | `StandingFile` in `src/modules/lsp/lsp.go` names `.se/.runtime/lsp-door.json`, and `folders.js` and the clean list in `install.sh` name it |
| the build | `install.sh` drops the `se-lsp` build, `lsp_here` and `get_lsp`. `go-source.js`, `tools.js`, the hook's skip list and `Wanted` in `src/modules/check/tree.go` drop the name |
| the doctor | the `se-lsp lsp` row becomes `quack lsp`, and `lsp-probe.js` starts the index binary with `lsp` |
| the twin goldens | `TestTwinGoldens` moves from `src/lsp/twins_test.go` into `src/modules/check` |
| the notes | `spec/design_output/lsp.md` describes the module, and `editor.md`, `level0.md`, `doors.md` and `migration.md` point at it |

Weighed: keeping `se-lsp check` for the lint against reading the sweep. The sweep holds the same rules, so a second reader of the tree would stay for the lint alone. Assumed: the owner turned `phase7switch` on after reading a clean shadow.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/extension/lib/lsp.js serverAsk, clientOf
- src/extension/extension.js and src/extension/editor.js, which start the client off serverAsk
- src/scripts/cli-read.js readingFor, lint
- src/scripts/cli-served.js serverFaults, privateRow
- src/scripts/cli-doors.js lsp
- src/scripts/cli-check.js the doctor rows
- src/scripts/lsp-probe.js lspProbe
- src/scripts/go-source.js the binary map
- src/scripts/install.sh lsp_here, get_lsp, the skip and describe cases, the clean list
- .claude/skills/level0/lib/tools.js the tool list
- .claude/skills/level0/lib/folders.js the runtime names
- .claude/skills/level0/hooks/level0.js the install skip list
- src/modules/check/tree.go Wanted
- src/modules/check/export.go and check_test.go, the comments naming src/lsp
- src/modules/lsp/lsp.go StandingFile, Listen
- src/quack/main.go lspVerb
- test/contract one-reading, cli-check-doors, outside-in-doors, install, cloud-start, fetching
- test/level0 lsp, doctor-hooks, go-source, check-twins, magic, tools

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- test/contract/no-old-server.test.js no source names lsp.json or se-lsp
- test/level0/lsp.test.js the editor starts quack lsp off the index binary
- test/level0/lint-sweep.test.js the lint reads the check sweep through quack
- src/modules/lsp/lsp_test.go TestTheListenWritesTheDoorFile
- src/modules/check/twins_test.go TestTwinGoldens

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file the approach names stands opened, and each claim checked there, the standing file clash among them
- the callers list names every file a git grep for se-lsp, src/lsp, panel.json and cli-served finds
- the lsp.json line meets test/contract/no-old-server.test.js, and the check line meets ./RUNME.sh check

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test test/contract/no-old-server.test.js test/level0/lsp.test.js test/level0/lint-sweep.test.js src/modules/lsp/lsp_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- test/contract/no-old-server.test.js
- test/level0/lsp.test.js
- test/level0/lint-sweep.test.js
- src/modules/lsp/lsp_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Each case fails on its own assertion. The sweep finds lsp.json, se-lsp and cli-served across install.sh, folders.js, tools.js, the hook, the doctor, the probe, the extension and six test files, and src/lsp stands. The editor asks for se-lsp, not se-index. sweepRowsOf stands as a stub answering an empty list, so the lint cases see no rows and no null. The listen writes lsp.json, so the door file reads nothing. What surprises: no JSON topic answers the sweep yet, since dump writes a file, so the lint case fakes a quack sweep verb, which the implement step adds beside config and log. TestTwinGoldens stands green and only moves, so it takes no red case; it leaves src/lsp at the implement step for src/quack, beside the other twin cases, since a check module test may not run node or git. tree.golden.json in src/quack names the old names too, and its regeneration rides the implement step.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the lsp.json line meets no-old-server.test.js, which fails, and the check line meets ./RUNME.sh check at the build
- the lint case fakes quack through its disk and proc doors, and the editor and door file cases touch no editor and only a temp folder

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept
the approach answers the ask, and the red cases decide the lsp.json line, the editor start, the lint sweep and the door file, with the check line at the build; two calls ride the implement step in place: TestTwinGoldens moves to src/quack beside the other twin cases, since a check module test may not run node or git, and quack gains a sweep verb printing check/sweep as JSON, which sweepRowsOf reads through topicOf

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint src/scripts/cli-read.js src/scripts/quack-topic.js src/scripts/cli-check.js src/scripts/install.sh src/extension/lib/lsp.js src/quack/sweep.go src/quack/main.go src/modules/lsp/tools.go src/modules/lsp/lsp.go src/bridge/findings.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the files the draft names, plus src/quack/sweep.go for the verb the lint reads, and src/quack/check_twins_test.go, where the twin case lands in place of src/modules/check
- the lint case fakes quack through its disk and proc doors, and the sweep verb case fakes the index ask
- each new file and function points at the ticket or its design section
- the door file name stands in StandingFile, and folders.test.js holds it to MOVED, which the install list meets through installerHoldsTheNames

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
