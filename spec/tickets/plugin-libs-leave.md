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
group: javascript-leaves
depends_on: ["level0-hooks-forward-to-go", "bridge-library-leaves", "ticket-scripts-leave", "extension-imports-stay-inside", "cage-libs-leave", "tree-libs-leave", "schema-libs-leave", "config-libs-leave", "stub-settings-shim-runs-in-go", "guidance-lib-leaves", "engine-and-doors-leave", "scripts-folder-leaves"]
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box b1ba21c2e626 · claude-code-remote
    hash_before: 91da51c15ab79d9ae30a7b98749f4042820ae4e5
    hash_after: dddeed8fe5bad8f8f301b74ccbc7dd84acd69756
    inputs:
      - name: ask
        hash: 283da134d28cade9
        size: 373
    def: c01ae0f2ace0cecb
  - step: design/tests-red
    hand: box b1ba21c2e626 · claude-code-remote
    hash_before: 4e9e106c506f7089c85d744e19d33330e235b575
    hash_after: 5e35fa775b57a4648c224816a191979d10bb833b
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/quack fails
    inputs:
      - name: design/draft
        hash: 241e02b0d2b87535
        size: 6760
    def: 08e16d07b0de477c
---

# Ask

The level zero libraries that hold logic leave with their tests, so the plugin holds the thin hooks and their glue alone.

Every cage rule keeps a JavaScript twin, and a rule changes in two languages.

- `git ls-files .claude/skills/level0/lib` names the lint group's `vale.js` alone, or nothing
- `go test ./src/modules/...` passes
- `./RUNME.sh check` exits 0

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

1. The ask splits. Six children take the libraries in import order, and this ticket lands the last slice.
2. src/quack/plugin_libs_test.go globs .claude/skills/level0/lib/*.js through filepath.Glob, and stays red while a file past vale.js stands.
3. The last slice deletes folders, log, index, index-tools, tools, pull, apply, undo, review, runs and hash.
4. Go owners: src/index/binary.go, src/index/tools.go, src/quack/survey.go, src/quack/verb_log.go, src/pull, src/modules/edits, src/quack/check.go.
5. The slice waits on every child, engine-and-doors-leave and scripts-folder-leaves, since src/engine, src/doors and bundle.js import these.
6. test/level0 folders, log, index and level1 tests leave whole, since each reads a leaving library alone.
7. index-tools.test.js keeps its pull-tool.js register cases, and drops the cases over index-tools.js.
8. index-tools.test.js and pull-spawn-hook.test.js spell PULL_CALL, as pull-tool.js already does.
9. lsp.test.js and test/contract/ruled.js spell the index binary path, with a pointer at src/index/binary.go.
10. src/engine/tools.js takes the survey pieces the Vale door reads, with a pointer at src/quack/survey.go.
11. tools.test.js imports those pieces from src/engine/tools.js.
12. The install case over rebuilt ports to src/quack/install_test.go, and install.test.js drops it.
13. tree.test.js drops the session-file case reading lib/pull.js. pull-tool.js and src/pull own the name.
14. Every Go comment and design note naming a leaving file names its Go owner.
15. tested.go keeps lib in its source pattern, since vale.js stays there.
16. StopFolderIsData: tree-libs-leave ports it to TestEveryStopFileReadsWhole in src/quack/stop_rules_test.go, before the rule leaves.
17. TestTheRulesReadAsThePoolReadsThem already holds that rule's second-file half, through stop.Pool.
Children: cage-libs-leave takes bash.js, its readers, trunk, cloud and markers onto src/modules/hooks/command.
Children: tree-libs-leave takes tree, stop, rulefile, tested, servers, names, private, magic and size, and ports their rules to Go.
Children: schema-libs-leave takes the eight schema files, ticket, todo, slug, paths, vocabulary, snippets, helpers and refuse.
Children: config-libs-leave takes config.js and layer.js onto src/modules/config.
Children: stub-settings-shim-runs-in-go moves the shimSettings call in src/stub/RUNME.sh onto a Go verb.
Children: guidance-lib-leaves takes guidance.js, its three contract tests and its cold path entry.
Weighed: one change over every library. It reaches the engine, extension tests, the stub and the lint group, past one review.
Weighed: cutting the engine and door imports in place. Those files leave in engine-and-doors-leave, so the edit buys nothing.
Weighed: a JavaScript front reader kept as an extension test helper. It keeps a YAML parser as test lines.
Weighed: retiring StopFolderIsData with no port. A broken stop file then drops out of the pool and nobody hears.
Assumed: the six children stand minted in javascript-leaves on the standard process, with depends_on set.
Assumed: engine-and-doors-leave depends on cage-libs-leave in place of this ticket, so no cycle stands.
Assumed: the lint group accepts edits to src/engine/tools.js and test/contract/ruled.js.
Assumed: scripts-folder-leaves takes the hashText import of src/scripts/bundle.js.
Assumed: no route reaches the archive and naming cases of log.test.js, so they leave with no Go port.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/engine/tools.js: survey, readTools, whereIs, which import RUN, BIN, TOOLS, WANTED and the survey readers
- test/contract/ruled.js: the Vale run, which reads BIN from lib/index.js
- test/level0/lsp.test.js: the server ask case, which reads BIN as INDEX
- test/level0/index-tools.test.js: every case, reading binaryOf, callsIndexTool, registersIndexTools and PULL_CALL
- test/level0/pull-spawn-hook.test.js: the spawn case, which reads PULL_CALL
- test/level0/tools.test.js: every case reading lib/tools.js exports
- test/contract/install.test.js: the rebuild case, which reads rebuilt
- test/contract/tree.test.js: the session-file case, which reads the text of lib/pull.js
- test/level0/folders.test.js, log.test.js, index.test.js, level1.test.js: every case
- src/doors/index.js, log.js, front.js, fake/index.js, fake/log.js: imports, gone with engine-and-doors-leave
- src/engine/group.js and named.js: imports of folders, apply and runs, gone with engine-and-doors-leave
- src/scripts/bundle.js: stampOf, which reads hashText, taken by scripts-folder-leaves
- Go comments in src/branches, src/index, src/modules/edits, src/modules/hooks, src/pull, src/quack and src/voice naming leaving files
- spec/design_output: apply.md, extension.md, level0.md, log.md, migration.md and work.md lines naming leaving files
- spec/tickets/engine-and-doors-leave.md and test-lines-stay-under-code.md: depends_on

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/quack/plugin_libs_test.go: TestThePluginLibrariesHoldTheValeLibraryAlone
- src/quack/install_test.go: TestEveryBuiltBinaryRebuildsWhenItsSourceMovesAhead

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first: no review has read this draft

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- .claude/skills/level0/lib/folders.js
- .claude/skills/level0/lib/log.js
- .claude/skills/level0/lib/index.js
- .claude/skills/level0/lib/index-tools.js
- .claude/skills/level0/lib/tools.js
- .claude/skills/level0/lib/pull.js
- .claude/skills/level0/lib/apply.js
- .claude/skills/level0/lib/undo.js
- .claude/skills/level0/lib/review.js
- .claude/skills/level0/lib/runs.js
- .claude/skills/level0/lib/hash.js
- test/level0/folders.test.js
- test/level0/log.test.js
- test/level0/index.test.js
- test/level0/level1.test.js
- test/level0/index-tools.test.js
- test/level0/pull-spawn-hook.test.js
- test/level0/lsp.test.js
- test/level0/tools.test.js
- test/contract/install.test.js
- test/contract/tree.test.js
- test/contract/ruled.js
- src/engine/tools.js
- src/quack/plugin_libs_test.go
- src/quack/install_test.go
- Go files whose comments name a leaving file, under src/branches, src/index, src/modules, src/pull, src/quack, src/voice
- spec/design_output/apply.md, extension.md, level0.md, log.md, migration.md, work.md
- spec/tickets: the six children, engine-and-doors-leave and test-lines-stay-under-code

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file, function and verb named stands opened and checked: every lib import, tree.js rules, stop.Pool, shimSettings, the cold path and the Go owners
- the callers come from git grep on each leaving file over imports, comments, RUNME.sh, src/stub, .github, .vale.ini, package.json and notes
- TestThePluginLibrariesHoldTheValeLibraryAlone decides the first line, go test ./src/modules/... the second, and ./RUNME.sh check at tests-green the third
- the approach adds no config key, so no default file changes

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/plugin_libs_test.go src/quack/install_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/quack/plugin_libs_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

TestThePluginLibrariesHoldTheValeLibraryAlone fails on its assertion and names apply, folders, hash, index-tools, index, log, pull, review, runs, tools and undo.
TestEveryBuiltBinaryRebuildsWhenItsSourceMovesAhead passes today. It reads install.sh and holds every binary in stampPackages to a stamp fresh case.
Surprise one: test/contract/install.test.js holds no rebuilt case any more, since scripts-folder-leaves dropped it. Approach line twelve reads stale, and tools.test.js holds the last two readers of rebuilt.
Surprise two: src/quack/stamp_verb.go owns the rebuild decision, and its fake-door tests already stand, so the new test covers the install wiring alone.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- TestThePluginLibrariesHoldTheValeLibraryAlone decides line one, go test ./src/modules/... line two, and ./RUNME.sh check at tests-green line three.
- Both tests read tracked files and reach no door, so no fake applies.

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

The gate accepts, and implement carries these points. The gate verdict holds them file by file.

- `PrivateFolderOwned` in `src/modules/check/folders.go` names `lib/folders.js` as owner, and lets a copy pass only beside that word. Give the rule a Go owner, and change its fixtures in `folders_test.go` and every copy's comment in the same change.
- Those copies stand outside Go too: `install.sh`, the stub's `RUNME.sh` and `bridgehead.js`, the hooks `level0.js` and `pull-tool.js`, and five extension files. Item fourteen reaches every source file and the installer.
- `tree.md` and `private.md` name `tools.js` and `folders.js`, and join the design notes item fourteen points at Go.
- `level1.test.js` drives the hook `pull-tool.js` in four cases and the `handedBack` helper. Keep those, as item seven keeps its cases, and drop the cases over `lib/pull.js` alone.
- `src/engine/tools.js` takes `surveyOf`, `pathOf`, `guesses` and `TOOLS` beside `readTools` and `whereIs`, and nothing more. `survey`, `writeSurvey`, `installedTools` and `rebuilt` leave with their `tools.test.js` cases, since Go owns each.
- `tree.test.js` keeps the half of its session case that holds `pull-tool.js` to no session file.
- Items twelve, sixteen and seventeen, and the callers row naming the door files, read stale: those landed in the children.
- The gate rewrote the red test on `git ls-files`, as done_when line one reads.

The case `a stop file short of a field is refused` in `test/contract/tree.test.js` still runs `StopFolderIsData` once [[spec/tickets/bridge-library-leaves]] removes `findings.js`. Deleting the rule takes that case with it, or ports it to Go first.

The row naming `src/doors/front.js` as gone with [[spec/tickets/engine-and-doors-leave]] reads wrong. The front door, its fake and `front.test.js` stay there, since the schema-mint tests pass in the fake front, and [[spec/tickets/schema-libs-leave]] takes the front door. The git door, its fake, `git.test.js` and `real-git.test.js` stay too, and this ticket takes them once its library tests leave.

[[spec/tickets/schema-libs-leave]] deletes `test/contract/ticket.test.js`, and cuts `test/contract/schema.test.js` to its underscore draft case. Neither reads the git door any more, and `real-git.test.js` keeps no entry for either.

Once `schema-route.js` leaves, `.claude/skills/level0/lib/hash.js` stands orphaned: no JavaScript file imports it. Delete it here, and point the Go comments naming `hashText` in it at `src/pull/hash.go`.
