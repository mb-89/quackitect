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
depends_on: ["branch-scripts-leave", "pull-scripts-leave", "ticket-scripts-leave", "session-start-leaves-node"]
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box b1ba21c2e626 · claude-code-remote
    hash_before: f064b6b3e682e81935666eb1f4fad8f103ab2a45
    hash_after: 392d27643cb58a10d9fafdc6df37169140641518
    inputs:
      - name: ask
        hash: 184db4f157325a2e
        size: 428
    def: c01ae0f2ace0cecb
---

# Ask

`src/scripts` leaves the tree. The install script, the stamp, the test reporter, the bundle, the browser, trust and the golden harnesses each take a home or become a Go verb.

A folder of scripts stands, and the owner reads it as the road for new code.

- `git ls-files src/scripts` names the lint group's `cli-read.js` and `styles.js` alone, or nothing
- `./RUNME.sh probe cold` exits 0
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

1. install.sh moves to the tree root beside RUNME.sh, and its root line reads its own folder.
2. RUNME.sh, the settings.json boot hook, copilotsetup.go with its workflow, merge.go, probe_cold.go and check.go name the root install.sh.
3. Install in src/modules/check/tree.go, INSTALL in lib/tree.js and INSTALL in hooks/level0.js name install.sh.
4. RUNME.sh drops the dead node road to src/scripts/verbs and names install.sh where no binary stands.
5. go-stamp.sh leaves for a box verb stamp in src/quack/stamp_verb.go: stamp fresh or stamp write, over se-index or se-front.
6. The stamp verb runs go list -m and go list -deps through the process door, and hashes with index.HashText.
7. index_here and front_here in install.sh ask se-index stamp fresh, and get_index and get_front run stamp write.
8. bundle.js leaves for a box verb bundle in src/quack/bundle_verb.go, which runs esbuild through npx under the webview.
9. The bundle stamp hashes the route sources and the lock with index.HashText, which matches hashText, so the shipped banner reads unchanged.
10. bundle here answers 0 where the first line of route.mjs names the stamp, else 1.
11. browser.js leaves, and testsRun hands node PLAYWRIGHT_CHROMIUM off browserFrom in browser.go.
12. drawing-page.test.js reads PLAYWRIGHT_CHROMIUM and spells the webview and drawing paths itself.
13. battery-reporter.js moves to test/battery-reporter.js, since node --test loads a module, and check.go names it there.
14. trust.js and trust.test.js leave with no twin, since nothing runs them and the setup block in level0.md writes the flag.
15. go-stamp.test.js, drawing-bundle.test.js and drawing-shipped.test.js leave, and Go tests hold their behaviours.
16. install.test.js reads the root install.sh, drops its rebuild case, and its RUNME case reads the missing-binary line.
17. outside-in-doors.test.js drops trust.js, and .vale.ini drops the trust-bundle section and narrows the cli glob to cli*.
18. stamp and bundle register off the verb table, as start does, and registry_test.go spells both.
19. drawing, level0, lsp, index, tree, vehicle, work and migration design lines name the root install.sh or the Go verbs.
20. The tui_verb.go comments naming the gone tui-build.js and cli-go.js name their Go owner.
21. A Discussion line on test-lines-stay-under-code says the drawing and stamp tests left here.
22. A free ticket on main asks the owner to point the cloud environment setup line at the root install.sh, with the exact line to paste.
Weighed: moving bundle.js into the webview as JavaScript. The Go verb keeps one stamp, which the shipped-banner case needs anyway.
Weighed: folding install.sh into RUNME.sh. RUNME carries the verb road and the editor open, and a boot word would collide.
Weighed: porting the downloads of install.sh into the setup verb. The install brings Go before any binary stands, so a later ticket shrinks it.
Weighed: reusing the tui import walk for the stamp. The walk drops embedded files such as lemmas.yml, and go list names them.
Weighed: a Go trust verb. The setup runs before any binary stands, so a verb there runs nowhere.
Weighed: moving browser.js beside drawing-page.test.js. A JavaScript copy repeats browserFrom, which Go owns.
Weighed: reading the junit output of node in Go in place of the reporter. Node 22 junit names no file, so the reporter stays JavaScript.
Weighed: listing bundle and stamp in the verb table. Each adds a tool every session sees, for an install or maintainer step.
Weighed: a shim left at src/scripts/install.sh for the old setup line. It keeps the folder the ask removes, so the free ticket carries the edit instead.
Weighed: splitting into an install child and a drawing child. One red case decides the folder, and each part stays small.
Assumed: until the owner edits the setup line, its or-true and the boot hook in settings.json hold the install.
Assumed: the first install after the change rebuilds both binaries once, since the cksum stamps differ from the Go hash.
Assumed: the lint group accepts the edits to .vale.ini and outside-in-doors.test.js.
Assumed: the typed-mod group accepts the one INSTALL constant edit in hooks/level0.js.
Assumed: plugin-libs-leave keeps tools.js with its go-stamp comment and case until it deletes them.
Assumed: a hand run of drawing-page.test.js outside the check skips where PLAYWRIGHT_CHROMIUM stands unset.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- RUNME.sh: the install line and the node road to src/scripts/verbs
- .claude/settings.json: the SessionStart hook running the install boot word
- .github/workflows/copilot-setup-steps.yml: the install step
- src/quack/copilotsetup.go: the workflow text naming the install
- .claude/skills/level0/hooks/level0.js: down, which runs INSTALL on a cloud box
- .claude/skills/level0/lib/tree.js: INSTALL, which the install rules read
- src/modules/check/tree.go: Install, which settingsNameBinaries, surveyNamesInstalls and the installer rule read
- src/branches/merge.go: installs
- src/quack/check.go: readyOf through installer, testArgv through reporter, and testsRun
- src/quack/checkdoors.go: checkDoorsOf
- src/quack/probe_cold.go: coldPath and the install run in the cold box
- src/scripts/install.sh: index_here, get_index, front_here and get_front, which call go-stamp.sh
- src/quack/tui_verb.go: comments naming tui-build.js and cli-go.js
- test/level0/battery-reporter.test.js: the rowOf import
- test/contract/drawing-page.test.js: the browserFrom, OUT and WEBVIEW imports
- test/contract/drawing-bundle.test.js: every case, which reads bundle and WEBVIEW
- test/contract/drawing-shipped.test.js: every case, which reads OUT, ENTRY, WEBVIEW and stampOf
- test/contract/go-stamp.test.js: the fresh and stale case over go-stamp.sh
- test/level0/trust.test.js: every case
- test/contract/install.test.js: root path, the rebuild case reading rebuilt, and the RUNME case
- test/contract/outside-in-doors.test.js: ROOTS naming trust.js
- .vale.ini: the trust-bundle section and the cli, vehicle-verb and mint-verb section
- src/quack/session_start_test.go: bootTree and bootHookLine
- src/quack/probe_cold_test.go: the cold path cases naming install.sh
- src/quack/check_test.go: TestTestArgv, which names trust.test.js as red
- src/branches/port_e_helpers_test.go: peMergeTree
- src/branches/port_e_mergecloud_test.go: TestPEMergeInstallsBeforeTheCheck
- spec/design_output: drawing.md, level0.md, lsp.md, index.md, tree.md, vehicle.md, work.md, migration.md lines naming the scripts
- spec/tickets/test-lines-stay-under-code.md: Discussion

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/quack/scripts_folder_test.go: TestTheScriptsFolderHoldsTheLintFilesAlone
- src/quack/stamp_verb_test.go: TestTheSourceStampReadsFreshAfterAWriteAndStaleOnceASourceMoves
- src/quack/stamp_verb_test.go: TestTheStampReadsTheFilesGoListsForTheBinaryNamed
- src/quack/stamp_verb_test.go: TestTheStampVerbRefusesAWordOrBinaryItKnowsNot
- src/quack/bundle_verb_test.go: TestTheShippedDrawingNamesTheStampItsSourcesGive
- src/quack/bundle_verb_test.go: TestTheDrawingStampMovesWithASourceUnderTheWebviewAndHoldsOtherwise
- src/quack/bundle_verb_test.go: TestTheBundleRunsEsbuildOverTheEntryWithTheStampAsItsBanner
- src/quack/bundle_verb_test.go: TestBundleHereAnswersWhetherTheBannerNamesTheStamp
- src/quack/bundle_verb_test.go: TestTheBundleNamesTheInstallWhereEsbuildStandsNowhere
- src/quack/bundle_verb_test.go: TestTheInsetLoadsTheDrawingFromInsideTheExtension
- src/quack/check_test.go: TestTheTestRunHandsNodeTheBrowserTheBoxHolds
- src/quack/session_start_test.go: TestTheInstallRebuildsTheIndexOnlyWhereTheStampVerbReadsItStale
- src/quack/registry_test.go: TestEveryVerbResolvesToARegisteredAnswer, which gains the stamp and bundle rows

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first: no review has read this draft

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- install.sh
- src/scripts: install.sh, go-stamp.sh, bundle.js, browser.js, trust.js, battery-reporter.js
- test/battery-reporter.js
- test/level0/trust.test.js
- test/level0/battery-reporter.test.js
- test/contract: go-stamp, drawing-bundle, drawing-shipped, drawing-page, install, outside-in-doors tests
- RUNME.sh
- .claude/settings.json
- .claude/skills/level0/hooks/level0.js
- .claude/skills/level0/lib/tree.js
- .github/workflows/copilot-setup-steps.yml
- .vale.ini
- src/quack: copilotsetup.go, check.go, checkdoors.go, check_test.go, probe_cold.go, probe_cold_test.go, session_start_test.go, registry_test.go, tui_verb.go
- src/quack: stamp_verb.go, stamp_verb_test.go, bundle_verb.go, bundle_verb_test.go, scripts_folder_test.go
- src/modules/check/tree.go
- src/branches: merge.go, port_e_helpers_test.go, port_e_mergecloud_test.go
- spec/design_output: drawing.md, level0.md, lsp.md, index.md, tree.md, vehicle.md, work.md, migration.md
- spec/tickets/test-lines-stay-under-code.md
- spec/tickets: the free ticket for the setup line

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file, function and verb the approach names stands opened, and each claim checked there
- the callers list names every importer, runner and path constant of the six leaving scripts
- TestTheScriptsFolderHoldsTheLintFilesAlone decides the first line, and probe cold and the check stand as tests-green checkpoints
- no config key is added

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
