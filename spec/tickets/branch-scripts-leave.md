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
depends_on: ["copilot-hooks-run-in-go", "git-hooks-run-in-go", "probes-leave-node", "bridge-library-leaves"]
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box b1ba21c2e626 · claude-code-remote
    hash_before: 70e525892a4058f4abc2757a97651a8f9da9eb35
    hash_after: 70e525892a4058f4abc2757a97651a8f9da9eb35
    inputs:
      - name: ask
        hash: 13b6271a6373fb9e
        size: 652
    def: c01ae0f2ace0cecb
---

# Ask

The branch scripts and the command line glue leave with their tests, since the branch verbs already run in Go. A behaviour a deleted test held and no Go test holds gains a Go test through the verb.

The work scripts stay as dead twins of `src/branches`, and their tests cost every check.

- `git ls-files 'src/scripts/work*.js' src/scripts/serve.js src/scripts/brand.js src/scripts/editor.js src/scripts/go-source.js src/scripts/cli-go.js src/scripts/cli-main.js src/scripts/cli-doors.js src/scripts/tui-build.js src/scripts/battery.js src/scripts/graph.js` answers nothing
- `go test ./src/branches/...` passes
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

1. The eight standing files leave: cli-doors, cli-main, editor, go-source, graph, work-free, work-read and work-stands.
2. `cli-doors.test.js`, `cli-exit.test.js`, `editor.test.js`, `stand.test.js` and `git-batch.test.js` leave with them.
3. `browser.js`, `trust.js` and `vehicle.js` read `env.USERPROFILE || env.HOME || ""` in place.
4. Each of those three lines carries a comment naming `HomeIn` in `src/vehicle/vehicle.go` as the owner.
5. `drawnOf` in `src/modules/tickets/drawn.go` writes `testdata/drawn.golden.json` under an `-update` flag.
6. Each golden entry holds a ticket text and the drawing Go answers for it.
7. `v1Over` in `test/level0/v1-index.js` answers `tickets/drawn/<path>` from the golden entry whose text matches.
8. `v1Over` throws on a text the golden lacks, so a new case names its missing fixture.
9. `test/level0/drawn-twin.js` leaves, so `v1-index.js` no longer imports `graph.js`, `chapter.js` or `pull-route.js`.
10. Every test whose ticket the fake index draws takes its text from the golden.
11. `lens-v1.test.js` and `drawing-page.test.js` read the expected graph off the golden in place of `graphIn`.
12. `drawing-edit.test.js` takes a literal graph marking the reached steps in place of `graphOf`.
13. `lens-actions.test.js` drops the `graph.js` emitter and its `imports` fake, which the extension never calls.
14. `lens-v1.test.js` and `sidebar-writes.test.js` run their source grep through `git(proc(), root)` from `src/doors`.
15. `front.test.js` and `http.test.js` each drop their one case on the hand cli-doors builds.
16. `outside-in-doors.test.js` drops the cli-doors root and the two cases reading `it`.
17. `git.test.js` drops its two batch cases, since `framed` and `namesIn` leave with work-read.
18. `batch` and `BATCH_ASKS` leave `src/doors/git.js` and the fake, since work-stands was their one caller.
19. `go-stamp.test.js` drops its BUILDS case and keeps the fresh-and-stale case of `go-stamp.sh`.
20. The `case` in `go-stamp.sh` becomes the package owner, and `.vale.ini` drops `go-source` from its glob.
21. New Go tests hold what `stand.test.js` and `cli-doors.test.js` held and no Go test holds.
22. `TestStaleSpanReadsTheConfigOrTheDefault` gains a row where an unreadable span falls to the default.
23. A comment naming a leaving or gone file as an owner names the Go owner instead.
24. Where the Go file itself owns the behaviour, the comment drops its clause naming the script.
25. `work.md`, `review.md`, `level0.md`, `lsp.md`, `index.md`, `tui.md` and `migration.md` point at the Go owners.
Weighed: a Go-written golden against a JavaScript drawing twin in the test helpers. The golden leaves no second drawing.
Weighed: spawning `se-index` from the extension tests against the golden. A spawn puts a real door in every unit case.
Weighed: a Go case running `go-stamp.sh` against keeping its JavaScript case. The script stays until scripts-folder-leaves, which ports both.
Weighed: deleting the http, front and git contract tests as the inventory says. The check's doors part refuses a door with no contract test.
Weighed: three scripts spelling the home rule in place against one shared home. The three leave under later tickets with no order between them.
Assumed: the owner accepts edits to the lint group's `outside-in-doors.test.js` and `.vale.ini`.
Assumed: engine-and-doors-leave deletes `src/doors/http.js` and the contract tests that stay here.
Assumed: the extension tests that stay keep `v1-index.js`, since they are its only importers.
Assumed: `design_input` notes and `spec/pages` stay untouched, since they hold the owner's input.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/scripts/browser.js: cacheOf, which reads homeIn off editor.js
- src/scripts/trust.js: main, which reads homeIn off editor.js
- src/scripts/vehicle.js: registerDirs, which reads homeIn off editor.js
- src/scripts/work-free.js: freeIn, freeNow, staleClaim and staleSpan, which read work-stands.js
- src/scripts/work-stands.js: the batch reads, which read framed, asText, namesIn, REF_FORMAT and refsIn off work-read.js
- src/doors/git.js: batch, which only work-stands.js calls
- src/doors/fake/git.js: the BATCH_ASKS re-export
- test/contract/cli-doors.test.js: every case
- test/contract/front.test.js: the case reading it.front
- test/contract/http.test.js: the case reading it.http
- test/contract/outside-in-doors.test.js: ROOTS, and the two cases reading it.pid, it.node and it.index
- test/level0/lens-v1.test.js: the doors.git.run grep case, and the graph case reading graphIn
- test/level0/sidebar-writes.test.js: the doors.git.run grep case
- test/level0/cli-exit.test.js: every case, which reads exitsDrained
- test/level0/editor.test.js: every case, which reads homeIn
- test/contract/go-stamp.test.js: the case reading BUILDS
- src/scripts/go-stamp.sh: the package case, whose comment names BUILDS
- test/contract/drawing-page.test.js: the graph, press and pointer cases, which read graphIn
- test/level0/drawing-edit.test.js: REACHED, which reads graphOf
- test/level0/lens-actions.test.js: the fake door's imports, which hands the graph.js emitter
- test/level0/drawn-twin.js: drawnOf, which reads graphIn and LEAF
- test/level0/v1-index.js: v1Over, which answers tickets/drawn off drawnOf
- test/level0/fields-to-fill.test.js: each case the fake index draws a ticket for
- test/level0/lens.test.js: each case the fake index draws a ticket for
- test/level0/route-host.test.js: each case the fake index draws a ticket for
- test/level0/stand.test.js: every case, which reads work-free.js and work-stands.js
- test/contract/git.test.js: the two batch cases, which read framed, asText and namesIn
- test/level0/git-batch.test.js: every case, which reads framed and BATCH_ASKS
- src/stub/.claude/skills/level0/hooks/bridgehead.js: the comment naming homeIn in editor.js
- src/vehicle/vehicle.go: the HomeIn comment
- src/pull/pull_doors.go: the It comments naming cli-doors.js
- src/quack/hookprobe.go: healthWait, whose comment names HEALTH_WAIT in cli-doors.js
- src/quack: stub_verb, vehicle_verb, verb_config, verb_doors, verb_rules and retro_collect, comments naming cli-doors.js
- src/modules/tickets/drawn.go, graph.go and src/quack/verb_graph_test.go: comments naming graph.js
- src/branches/free.go, stands.go, src/modules/git/git.go, src/modules/tickets/tickets.go, src/pull/pull_ready.go: comments naming the work scripts
- src/branches, src/modules/work, src/modules/queue, src/modules/verbs, src/pull and src/quack: comments naming scripts already gone

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/modules/tickets/drawn_test.go: TestEveryDrawnGoldenMatchesTheProjection
- src/branches/free_test.go: TestAStaleClaimWaitingOnADependencyStaysOutOfTheTrigger
- src/branches/free_test.go: TestATreeWithNoClockReadsNoClaimStale
- src/branches/free_test.go: TestADependencyClosedOnItsBranchHoldsItsDependentUntilTrunkCarriesIt
- src/quack/ticket_doors_test.go: TestThePullTakesItsCapAndMarginOffTheConfig

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/scripts/cli-doors.js
- src/scripts/cli-main.js
- src/scripts/editor.js
- src/scripts/go-source.js
- src/scripts/graph.js
- src/scripts/work-free.js
- src/scripts/work-read.js
- src/scripts/work-stands.js
- src/scripts/browser.js
- src/scripts/trust.js
- src/scripts/vehicle.js
- src/scripts/go-stamp.sh
- src/doors/git.js
- src/doors/fake/git.js
- .vale.ini
- test/contract/cli-doors.test.js
- test/contract/front.test.js
- test/contract/http.test.js
- test/contract/git.test.js
- test/contract/outside-in-doors.test.js
- test/contract/go-stamp.test.js
- test/contract/drawing-page.test.js
- test/level0/cli-exit.test.js
- test/level0/editor.test.js
- test/level0/stand.test.js
- test/level0/git-batch.test.js
- test/level0/drawn-twin.js
- test/level0/v1-index.js
- test/level0/drawing-edit.test.js
- test/level0/lens-v1.test.js
- test/level0/lens-actions.test.js
- test/level0/lens.test.js
- test/level0/fields-to-fill.test.js
- test/level0/route-host.test.js
- test/level0/sidebar-writes.test.js
- src/modules/tickets/drawn.go
- src/modules/tickets/drawn_test.go
- src/modules/tickets/testdata/drawn.golden.json
- src/branches/free_test.go
- src/branches/hook_reads_test.go
- src/quack/ticket_doors_test.go
- src/stub/.claude/skills/level0/hooks/bridgehead.js
- src/vehicle/vehicle.go
- the Go files whose comments name a leaving or gone script, as the callers list names them
- spec/design_output/work.md
- spec/design_output/review.md
- spec/design_output/level0.md
- spec/design_output/lsp.md
- spec/design_output/index.md
- spec/design_output/tui.md
- spec/design_output/migration.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- Every file, function and verb the approach names stands opened, and each claim checked there, among them `HomeIn`, `drawnOf`, `freeIn`, `staleClaim`, `StaleSpan` and `goGate`.
- The callers list names every importer git grep finds of each of the eight files, the helper chain behind them, and every comment naming them as an owner.
- `git ls-files` decides the first done_when line, the new branch tests the second, and `./RUNME.sh check` the third.
- The approach adds no config key, so no default file changes.

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
