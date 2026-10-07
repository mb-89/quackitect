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
depends_on: ["level0-hooks-forward-to-go"]
step: implement/change
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box b1ba21c2e626 · claude-code-remote
    hash_before: ece632a1d59398afb06e28d4eb3429c4ed450c79
    hash_after: ece632a1d59398afb06e28d4eb3429c4ed450c79
    inputs:
      - name: ask
        hash: 59a99ef00dc8c07d
        size: 670
    def: c01ae0f2ace0cecb
  - step: design/tests-red
    hand: box b1ba21c2e626 · claude-code-remote
    hash_before: 0099696b029efbb65f5b3a3bf8ca4e602a9a202a
    hash_after: a4b8278e09a071cc4b7ac742b538ae6577b1cad9
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/quack fails
    inputs:
      - name: design/draft
        hash: efa37dc7bbdc7e34
        size: 7401
    def: 08e16d07b0de477c
  - step: gate
    hand: box b1ba21c2e626 · claude-code-remote · helper-4
    hash_before: f064b6b3e682e81935666eb1f4fad8f103ab2a45
    hash_after: f064b6b3e682e81935666eb1f4fad8f103ab2a45
    inputs:
      - name: design/draft
        hash: efa37dc7bbdc7e34
        size: 7401
      - name: design/tests-red
        hash: 565ee4c834c9a880
        size: 1177
    def: dc4904ab364efa10
---

# Ask

The cage's command readers leave the plugin library with their tests, so each cage rule lives in Go alone under src/modules/hooks/command.

Each cage rule keeps a JavaScript twin that no hook runs, so a rule changes in two languages and its tests cost every check.

- `git ls-files '.claude/skills/level0/lib/bash*.js' .claude/skills/level0/lib/{code,commit-reads,git-writes,pulled,scripted}.js` answers nothing
- `git ls-files .claude/skills/level0/lib/{shell-values,tokens,verb-line,trunk,cloud,markers}.js` answers nothing
- `go test ./src/modules/hooks/...` passes a Go test for every cage case a deleted JavaScript test held
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

1. The thirteen cage libraries leave: bash, bash-test, code, commit-reads, git-writes, pulled, scripted, shell-values, tokens, verb-line, trunk, cloud, markers.
2. No staying library imports a leaving one. Inside lib, the leaving set imports only itself, names.js, private.js, vale.js, folders.js and group.js.
3. test/level0/trunk.test.js and markers.test.js leave whole, since each reads a leaving library alone.
4. test/level0/cloud-desk.test.js drops its three cloud cases and moves by git mv to test/level0/ticket-folders.test.js.
5. Its two folder cases stay, since they read apply.js, folders.js and named.js, which later slices take.
6. writes-here.test.js drops the inCloud import and its cloud case. Its writesHere cases stay with ticket.js.
7. fixtures.js drops OPENS, PARTS, SHUTS and conflicted, since markers.test.js alone reads them.
8. src/doors/fake/git.js spells const TRUNK = main, with a pointer at Trunk in src/modules/hooks/command/trunk.go.
9. tree.test.js drops the VERBS case and its bash.js import. src/quack/verb_line_test.go holds that case in Go.
10. describe.go exports LineVerbs, a copy of lineVerbs, so the quack test reads the line verbs through the interface.
11. New command/cloud.go holds CloudVariables and InCloud(get func(string) string). quack commandSettings calls it, and its own cloudVariables leave.
12. trunk_test.go gains the missing trunk.test.js rows in its two existing table tests.
13. New command/guards_test.go holds one VersionGuard table over every delete, force and plain-push row.
14. findings_test.go drops its two VersionGuard asserts, and its test becomes TestTheBlessGuardReadsTheBlessAndTheHand.
15. commits_test.go gains a desk guard table over cloud and branch: work, main, claude/a-thing, cloud on work.
16. check/markers_test.go turns into a table and gains the lone-closer row. branches/hook_reads_test.go gains the unmerged and empty rows.
17. Every Go comment naming a leaving file drops the off-lib clause, since the Go file now owns the rule.
18. bash.md, level0.md, lsp.md, migration.md, private.md and work.md name the Go owner in place of each leaving file.
19. src/quack/cage_libs_test.go globs the leaving libraries and the two leaving tests, plus cloud-desk.test.js, and stays red until they leave.
Weighed: adding cloud rows to src/quack/hooks_test.go alone. done_when names go test ./src/modules/hooks, so the rule moves under command.
Weighed: keeping a JS VERBS copy in tree.test.js with a pointer. That keeps a twin the owner asks gone.
Weighed: driving the wired door describe from quack. The world store may list verb tools, so the line names tools, not verbs.
Weighed: keeping cloud-desk.test.js by name. Its cases then hold no cloud and no desk, which misleads a reader.
Assumed: the markers cases count by their Go owners in src/modules/check, src/branches and src/pull, which ./RUNME.sh check runs.
Assumed: the stagesIn case takes no port. Go reads stages through Repo.Show in branches/sync.go, and repo_contract_test holds Unmerged.
Assumed: the named merge in deskRefusal belongs to the pull, and port_d_desk_test.go and deskRefused in src/pull hold it.
Assumed: the cloudHere flag-first case stands held by TestADeskPassStandsOnThisBoxWhateverTheEnvironmentSays in src/pull.
Assumed: src/pull and src/branches keep their own cloudVars, since the import rule refuses one module importing another.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/doors/fake/git.js: refOf behind fakeTrunk, which reads TRUNK from lib/trunk.js
- test/contract/tree.test.js: the verb case, which reads VERBS from lib/bash.js
- test/level0/cloud-desk.test.js: onDesk, cloudHere and deskRefusal cases reading lib/cloud.js
- test/level0/writes-here.test.js: the cloud test case, which reads inCloud from lib/cloud.js
- test/level0/trunk.test.js: every case, reading landsOnTrunk, touchesGit, versionRefs and refusedVersion
- test/level0/markers.test.js: every case, reading markersIn, markedIn, stagesIn, mergeRefusal and unmergedFault
- test/level0/fixtures.js: OPENS, PARTS, SHUTS and conflicted, read by markers.test.js alone
- src/quack/command.go: commandSettings, which reads cloudVariables, and the comment naming lib/cloud.js
- src/quack/hooks_test.go: TestTheCommandSettingsReadTheRootAndTheBox, which reads cloudVariables
- src/modules/hooks/describe.go: lineVerbs, which gains the exported LineVerbs
- src/modules/hooks/command: findings.go, gitwrites.go, pulled.go, scripts.go, reads.go, tokens.go, writes.go, voice.go, trunk.go, guards.go headers
- src/modules/hooks/command/trunk_test.go: header comment naming lib/trunk.js
- src/modules/hooks/command/findings_test.go: TestTheGuardsReadTheBlessAndTheVersions, whose version asserts move to guards_test.go
- src/modules/lsp/tools.go: the two comments naming lib/code.js
- spec/design_output: bash.md, level0.md, lsp.md, migration.md, private.md and work.md lines naming leaving files

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/quack/cage_libs_test.go: TestTheCageLibrariesStandNowhere
- src/quack/verb_line_test.go: TestEveryVerbTheBashLineNamesStandsRegistered
- src/modules/hooks/command/cloud_test.go: TestInCloudReadsEitherVariableAndAFlatValueReadsFalse
- src/modules/hooks/command/guards_test.go: TestTheVersionGuardReadsEveryVersionWrite
- src/modules/hooks/command/trunk_test.go: TestTouchesGitReadsNestedGit, gaining the read-only and quoted rows
- src/modules/hooks/command/trunk_test.go: TestLandsOnTrunkReadsTheBridgesLanding, gaining the nested, flag, verb and bare-push rows
- src/modules/hooks/commits_test.go: TestTheDeskGuardRefusesAWorkBranchOffTheCloudAlone
- src/modules/check/markers_test.go: TestMarkerLinesNameEachMarkOfAMerge, as a table gaining the lone-closer row
- src/branches/hook_reads_test.go: TestMergeRefusalNamesEachUnmergedPathAndMarker, as a table gaining the unmerged and empty rows

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first: no review has read this draft

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- .claude/skills/level0/lib: bash, bash-test, code, commit-reads, git-writes, pulled, scripted, shell-values, tokens, verb-line, trunk, cloud, markers
- test/level0/trunk.test.js
- test/level0/markers.test.js
- test/level0/cloud-desk.test.js, moved to test/level0/ticket-folders.test.js
- test/level0/writes-here.test.js
- test/level0/fixtures.js
- test/contract/tree.test.js
- src/doors/fake/git.js
- src/modules/hooks/command: cloud.go, cloud_test.go, guards.go, guards_test.go, findings.go, findings_test.go, gitwrites.go, pulled.go, reads.go, scripts.go, tokens.go, trunk.go, trunk_test.go, voice.go, writes.go
- src/modules/hooks/describe.go
- src/modules/hooks/commits_test.go
- src/modules/check/markers_test.go
- src/branches/hook_reads_test.go
- src/modules/lsp/tools.go
- src/quack/command.go
- src/quack/hooks_test.go
- src/quack/verb_line_test.go
- src/quack/cage_libs_test.go
- spec/design_output: bash.md, level0.md, lsp.md, migration.md, private.md, work.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file, function and verb named stands opened and checked: each lib import, the Go guards, deskGuard, MergeRefusal, markerLines, describe.go, registry
- the callers come from git grep on each leaving file over hooks, src, test, RUNME.sh, .github, package.json, .vale.ini, Go comments and notes
- TestTheCageLibrariesStandNowhere decides the first two lines, go test ./src/modules/hooks/... with the new rows the third, and ./RUNME.sh check at tests-green the fourth
- the approach adds no config key, so no default file changes

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/cage_libs_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/quack/cage_libs_test.go
- src/quack/verb_line_test.go
- src/modules/hooks/command/cloud_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

TestTheCageLibrariesStandNowhere fails on its own assertion. It names the thirteen leaving libraries, trunk.test.js, markers.test.js and cloud-desk.test.js. TestEveryVerbTheBashLineNamesStandsRegistered fails on its assertion, since the LineVerbs stub answers nil. TestInCloudReadsEitherVariableAndAFlatValueReadsFalse fails on its true rows, since the InCloud stub answers false. The ported rows pass now, since Go already holds them: the trunk rows, the version guard, the desk guard, the lone-closer marker row and the MergeRefusal table. The version asserts leave findings_test.go, and its test reads TestTheBlessGuardReadsTheBlessAndTheHand.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- TestTheCageLibrariesStandNowhere fails on both git ls-files lines, the ported rows and the two red stubs decide the go test line, and the check at tests-green decides the fourth
- no test reaches a door: the red case globs the disk with no exec, the desk guard reads a taught git func, and the rest run over strings in memory

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept. The approach answers the ask, and a red test decides every done_when line: TestTheCageLibrariesStandNowhere fails on its own assertion over both git ls-files lines, the InCloud and LineVerbs tests stand red on their stubs, and the ported Go rows hold the trunk, markers and cloud-desk cases. No staying library imports a leaving one, and every caller outside lib stands in the callers list. Points the implementer fixes in place: (1) describe.go spells lineVerbs once, so LineVerbs returns lineVerbs, or slices.Clone of it, and spells no second list, where approach line 10 says a copy. (2) src/pull/pull_landed_test.go names test/level0/cloud-desk.test.js in its header and stands outside the size list, so it takes the comment pass of approach line 17. (3) Form: approach line 2 counts group.js inside lib, and the leaving set reads it from src/engine/group.js.

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
