---
kind: [[ticket]]
state: closed
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
depends_on: ["cage-libs-leave"]
step: implement/tests-green
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box b1ba21c2e626 · claude-code-remote
    hash_before: 81f5177a23131070707263f24214f41e69923202
    hash_after: 81f5177a23131070707263f24214f41e69923202
    inputs:
      - name: ask
        hash: 501f6e38c8f3a0b9
        size: 581
    def: c01ae0f2ace0cecb
  - step: design/tests-red
    hand: box b1ba21c2e626 · claude-code-remote
    hash_before: 8aaff978995a4fe2db0c99a9dfca317a8e04e79e
    hash_after: 8aaff978995a4fe2db0c99a9dfca317a8e04e79e
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/quack fails
    inputs:
      - name: design/draft
        hash: 4e094123a41b47c8
        size: 12053
    def: 08e16d07b0de477c
  - step: gate
    hand: box b1ba21c2e626 · claude-code-remote · helper-4
    hash_before: dd4f4df3e5c3ef31dccd10a014a040370a2050d7
    hash_after: dd4f4df3e5c3ef31dccd10a014a040370a2050d7
    inputs:
      - name: design/draft
        hash: 4e094123a41b47c8
        size: 12053
      - name: design/tests-red
        hash: 6a5b3855ecd529dc
        size: 1801
    def: dc4904ab364efa10
  - step: implement/change
    hand: box b1ba21c2e626 · claude-code-remote
    hash_before: 44412bb58fcb83e258e1dee99ece7210aecd8889
    hash_after: aa64f13c8ba75bb4ce682c064f1e14d8075abe5b
    answered:
      - name: lint
        exit: 0
        said: "src/voice/voice_test.go:1:1: FileCeiling: A file holds 600 lines, and the file holds 618. Split it by topic."
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box b1ba21c2e626 · claude-code-remote
    hash_before: ed3a7b8e3b7cc89cd0258df9a2b34ee5b39a949d
    hash_after: ed3a7b8e3b7cc89cd0258df9a2b34ee5b39a949d
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "   81.4  in all"
    inputs:
      - name: design/tests-red
        hash: 6a5b3855ecd529dc
        size: 1801
    def: ec253787263043a7
  - step: accept
    skipped: true
    why: the delivery's acceptance reads this ticket
  - step: view
    skipped: true
    why: the ask names no view the owner reads
reason: done
---

# Ask

The tree rules and the stop pool leave the plugin library with their tests, so each rule over two files runs in Go alone.

Four rules run in a JavaScript test alone, so a broken stop file or a stray runtime folder spelling slips past the Go check.

- `git ls-files .claude/skills/level0/lib/{tree,stop,rulefile,tested,servers}.js` answers nothing
- `git ls-files .claude/skills/level0/lib/{names,private,magic,size}.js` answers nothing
- `go test ./src/quack/... ./src/modules/check/...` passes a test of each rule the JavaScript alone held
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

1. The nine libraries leave: tree, stop, rulefile, tested, servers, names, private, magic and size.
2. No staying library imports a leaving one. Inside lib, only tree.js, stop.js and magic.js import the set, and each leaves.
3. The set reads folders.js, paths.js, tools.js and vale.js, which stay for later slices.
4. Go owns most rules already: check/tree.go, check/names.go, check/private.go, check/textfaults.go, hooks/stop, command/tested.go and command/private.go.
5. Four rules ran in tree.test.js alone: EveryModuleTested, StopFolderIsData, PrivateFolderOwned and InstallerHoldsTheNames.
6. EveryModuleTested leaves with no port, since it reads src/bridge, and src/bridge stands nowhere.
7. testing.md rule 5 and tree.md drop the EveryModuleTested clause, and keep the commit door's tested delta.
8. New src/modules/check/folders.go holds Moved, Renamed, Logged, Apart, privateFolderOwned, installerHoldsTheNames and loopNames.
9. folders.js drops MOVED, RENAMED, LOGGED and APART with a pointer at folders.go, since tree.js read them alone.
10. tools.js drops loopNames and its helpers, and tools.test.js drops its loop case, since tree.js called it alone.
11. check.Rules and the Install row of readers gain both folder rules, so the lint and the panel run them.
12. The escape word stays folders.js, since every Go copy names it. The parent's last slice moves it with folders.js.
13. The three install.sh marks read folders.go owns these names as, which loopNames reads.
14. StopFolderIsData ports to TestEveryStopFileReadsWhole in src/quack/stop_rules_test.go, as parent line 16 says.
15. That test globs spec/config/stop/*.yml, pools each file through stop.Pool, and a later file's claim ends the turn through stop.Decide.
16. stop_rules_test.go also takes the stop-rules.test.js cases, and the mechanical-check case through stop.KnowsCheck.
17. New check/tree_test.go holds a TreeOver case for each Go tree rule that tree.test.js alone tested.
18. check/folders_test.go holds the folders.test.js cases. src/quack/runtime_names_test.go holds its lsp door case over check.Moved and lsp.StandingFile.
19. private_test.go and tested_test.go under hooks/command gain the rows private.test.js and tested.test.js alone held.
20. command/private.go exports Nobody. src/quack/nobody_test.go holds Private.yml to it, in place of the vale.test.js case.
21. tree.test.js drops every case over a leaving library and the real git door. It keeps the count chain, session file and config cases.
22. The session-file case reads through text in place of here.read.
23. real-git.test.js drops its tree.test.js entry from KEPT, since that file reads git no more.
24. treeOf moves to test/contract/tree-of.js, which schema.test.js and ticket.test.js import until schema-libs-leave.
25. tested.test.js, private.test.js, stop-rules.test.js and folders.test.js leave whole.
26. The behaves case of tested.test.js moves to fake-paths.test.js, and its clock case to clock.test.js.
27. install.test.js drops its vale-ls case, and install.sh owns the vale-ls pin and the asset table alone.
28. setup_verb.go reads check.Extensions, and doctor_verb.go reads check.Settings, in place of their own copies.
29. Every Go comment and the Private.yml comment naming a leaving file name its Go owner.
30. tree, stop, private, config, level0, editor, extension, bash, lsp and doors under spec/design_output name the Go owner.
31. src/quack/tree_libs_test.go globs the nine libraries and the four leaving tests, and stays red until they leave.
Weighed: keeping the lists in folders.js for Go to parse. Go then reads JavaScript text, and the parent deletes that file anyway.
Weighed: the two folder rules as a test over this tree alone. The sweep then misses a stray spelling until a test run.
Weighed: porting EveryModuleTested onto src/extension. That moves its scope, and the owner decides scope, not this ticket.
Weighed: renaming tree.test.js. Its last cases leave with config-libs-leave and the parent's last slice.
Weighed: inlining treeOf in schema.test.js and ticket.test.js. Two copies then drift until schema-libs-leave.
Weighed: a Go copy of the vale-ls asset table. Nothing in Go downloads vale-ls, so the copy holds no reader.
Assumed: the index mirrors every tracked .go, .js and .sh file, so the sweep reads what git ls-files read.
Assumed: the privateNow gatherer cases take no port, since commitGuards in src/modules/hooks/commits.go gathers in Go.
Assumed: config-libs-leave takes the config cases left in tree.test.js, and the parent takes the session-file case.
Assumed: scripts-folder-leaves and this ticket rebase over each other on install.sh, install.test.js and the Install constant.
Assumed: the lint group accepts the edits to Private.yml, vale.test.js and clock.test.js.
Assumed: the hooks/command rows count toward done_when line 3 through the check, which runs go test over every module.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- test/contract/tree.test.js: every case over tree.js, servers.js, stop.js and tested.js, plus here, fakeTree and namesIn
- test/contract/tree.test.js: the session-file case, which reads here.read
- test/contract/folders.test.js: every case, reading privateFolderOwned, installerHoldsTheNames, treeOf, MOVED and RUN
- test/contract/schema.test.js: here and departing, which call treeOf
- test/contract/ticket.test.js: here, which calls treeOf
- test/contract/stop-rules.test.js: every case, reading pool
- test/contract/install.test.js: the vale-ls case, reading VALE_LS_VERSION, VALE_LS_RELEASES and valeLsAsset
- test/contract/vale.test.js: the nobody case, reading NOBODY
- test/contract/real-git.test.js: KEPT, naming tree.test.js
- test/level0/tested.test.js: every case, reading untestedIn, everyModuleTested, carriedIn, treeOf, behaves and fakeClock
- test/level0/private.test.js: every case, reading the private.js exports
- test/level0/tools.test.js: the loop reader case, reading loopNames
- .claude/skills/level0/lib/tools.js: loopNames, meets, markAbove, namesIn, bare, LOOP, MARK and PRIVATE_PATH
- .claude/skills/level0/lib/folders.js: MOVED, RENAMED, LOGGED and APART, read by tree.js alone
- src/modules/check/checker.go: Rules and readers, which gain privateFolderOwned and installerHoldsTheNames
- src/modules/check/textfaults.go: the rule-names comment naming size.js and magic.js
- src/modules/hooks/command/private.go: nobody, which turns into Nobody, plus the header and the carriedFrom and refusedPrivate comments
- src/modules/hooks/command/findings.go: the private half comment and the overLong comment
- src/modules/hooks/command/tested.go: header comment naming lib/tested.js
- src/modules/hooks/command/tested_test.go: header comment naming lib/tested.js
- src/modules/hooks/command/private_test.go: header comment naming lib/private.js
- src/modules/hooks/commits.go: the raw notes comment naming lib/private.js
- src/modules/hooks/answers.go: the stop tool input comment naming stopSpec in lib/stop.js
- src/modules/hooks/stops.go: the events comment naming lib/stop.js
- src/modules/hooks/stop/rules.go: header naming rulefile.js and pool in lib/stop.js
- src/modules/hooks/stop/vote.go: header naming lib/stop.js
- src/modules/hooks/stop/stop_test.go: header naming lib/stop.js
- src/modules/drafts/answer.go: header naming the stop line of lib/stop.js
- src/quack/setup_verb.go: editorExtensions, which reads check.Extensions
- src/quack/doctor_verb.go: editorSettings, which reads check.Settings
- src/scripts/install.sh: the RENAMED, MOVED and LOGGED marks, and the vale-ls pin comment
- spec/config/styles/VoiceVale/Private.yml: the header comment naming NOBODY in lib/private.js
- spec/guidance/code/testing.md: rule 5, naming EveryModuleTested
- spec/design_output: tree.md, stop.md, private.md, config.md, level0.md, editor.md, extension.md, bash.md, lsp.md and doors.md lines naming leaving files

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/quack/tree_libs_test.go: TestTheTreeLibrariesStandNowhere
- src/quack/stop_rules_test.go: TestEveryStopFileReadsWhole
- src/quack/stop_rules_test.go: TestEveryMechanicalStopRuleRunsACheckTheDoorHolds
- src/quack/stop_rules_test.go: TestTheShippedStopRulesKeepTheirYieldsAndRanks
- src/quack/runtime_names_test.go: TestTheLspDoorFileStandsAmongTheRuntimeNames
- src/quack/nobody_test.go: TestTheShapesRuleAndTheCommitDoorPassOneListOfNobodyUsers
- src/modules/check/folders_test.go: TestPrivateFolderOwnedRefusesASpellingNamingNoOwner
- src/modules/check/folders_test.go: TestAnImportAloneExcusesNoSpellingAndACommentAboveDoes
- src/modules/check/folders_test.go: TestInstallerHoldsTheNamesRefusesALoopApartFromItsList
- src/modules/check/folders_test.go: TestLoopNamesReadsEachLoopUnderItsMark
- src/modules/check/tree_test.go: TestSettingsNameBinariesRefusesAnotherBinaryAndAnInstallWithNoVale
- src/modules/check/tree_test.go: TestEditorDrawsWriteRulesRefusesItsOwnLevelAStyleAndAMissingConfig
- src/modules/check/tree_test.go: TestBiomeOnWindowsRefusesAPlainPath
- src/modules/check/tree_test.go: TestExtensionsOnOfferRefusesADroppedExtensionAndAStrangeFormatter
- src/modules/check/tree_test.go: TestNoLogDeletedRefusesALineReachingALog
- src/modules/check/tree_test.go: TestNothingPrivateTravelsRefusesTheBoxNamesAndPassesNobody
- src/modules/check/tree_test.go: TestSurveyNamesInstallsRefusesAToolTheSurveyMisses
- src/modules/check/tree_test.go: TestSurveyFindsNodeRefusesAnotherNodeAndAMissingSurvey
- src/modules/hooks/command/private_test.go: TestPrivateInReadsTheBridgesThreeChecks, gaining the number, home, box, longer-word, five-word, two-line and hyphen rows
- src/modules/hooks/command/private_test.go: TestAddedInReadsEachAddedLineWithItsPlace, gaining the deleted-file and hunk-number rows
- src/modules/hooks/command/tested_test.go: TestUntestedInReadsTheBridgesDelta, gaining the copy, editor, taken-away, stray, own-hunk, comment-trade and deleted rows
- src/modules/hooks/command/tested_test.go: TestAMoveOfAWholeBlockChangesNoCode, gaining the statement-inside-a-body row

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first: no review has read this draft

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- .claude/skills/level0/lib: tree, stop, rulefile, tested, servers, names, private, magic, size
- .claude/skills/level0/lib/folders.js
- .claude/skills/level0/lib/tools.js
- test/contract/tree.test.js
- test/contract/folders.test.js
- test/contract/stop-rules.test.js
- test/contract/schema.test.js
- test/contract/ticket.test.js
- test/contract/tree-of.js
- test/contract/install.test.js
- test/contract/vale.test.js
- test/contract/real-git.test.js
- test/contract/clock.test.js
- test/level0/tested.test.js
- test/level0/private.test.js
- test/level0/tools.test.js
- test/level0/fake-paths.test.js
- src/modules/check: folders.go, folders_test.go, tree_test.go, checker.go, textfaults.go
- src/modules/hooks/command: private.go, private_test.go, tested.go, tested_test.go, findings.go
- src/modules/hooks: commits.go, answers.go, stops.go
- src/modules/hooks/stop: rules.go, vote.go, stop_test.go
- src/modules/drafts/answer.go
- src/quack: tree_libs_test.go, stop_rules_test.go, runtime_names_test.go, nobody_test.go, setup_verb.go, doctor_verb.go
- src/scripts/install.sh
- spec/config/styles/VoiceVale/Private.yml
- spec/guidance/code/testing.md
- spec/design_output: tree.md, stop.md, private.md, config.md, level0.md, editor.md, extension.md, bash.md, lsp.md, doors.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file, function and verb named stands opened and checked: each lib import, tree.js RULES, tested.js, servers.js, folders.js, loopNames, check Rules and readers, stop.Pool, Decide, KnowsCheck, the Go private and tested tables, editorExtensions and editorSettings
- the callers come from git grep on each leaving file and export over hooks, lib, src, test, RUNME.sh, package.json, .github, .vale.ini, Go comments and spec notes, and no staying library imports a leaving one
- TestTheTreeLibrariesStandNowhere decides the two git ls-files lines, the new check and quack tests decide the go test line, and ./RUNME.sh check at tests-green decides the fourth
- the approach adds no config key, so no default file changes

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/tree_libs_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/quack/tree_libs_test.go
- src/quack/runtime_names_test.go
- src/quack/nobody_test.go
- src/modules/check/folders_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

TestTheTreeLibrariesStandNowhere fails on its assertion and names the nine libraries and the four leaving tests. The two folder rule tests fail on their assertions because the folders.go stubs answer nothing. TestLoopNamesReadsEachLoopUnderItsMark also fails on its assertion, for the same reason. TestTheLspDoorFileStandsAmongTheRuntimeNames fails because the check.Moved stub is nil. TestTheShapesRuleAndTheCommitDoorPassOneListOfNobodyUsers fails because the command.Nobody stub is nil. Some ported rows pass now because Go already holds the behavior. These are every tree_test.go case and the three stop folder tests. They also include the new private and tested rows and the statement-inside-a-body move row. One surprise: src/quack/stop_rules_test.go already existed, holding TestTheTreeHoldsACloudBoxDecides. The new cases join it, and it gains a header. Another surprise: a hyphenated run makes the NoteTextStaysHome Said repeat the raw token once per word, in Go and in the JS alike. So that row asserts the rule alone, as its JS case did. A third surprise: in Go, a dropped biome extension also strands the json formatter. That row therefore wants two findings. check.Extensions and check.Settings already stand, so they need no stub.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

Each go test done_when line meets a red test or a ported row. TestTheTreeLibrariesStandNowhere decides both git ls-files lines, and the check at tests-green decides the fourth.
The tests reach no door. Check cases seed Texts in memory, the command rows parse strings, and the quack cases read the tree through Glob and ReadFile.

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept. The approach answers the ask, and a red test decides every done_when line. TestTheTreeLibrariesStandNowhere fails on its own assertion over both git ls-files lines. The folders_test.go, runtime_names_test.go and nobody_test.go cases stand red on their stubs. The ported tree, stop, private and tested rows hold the rules Go already carries. No staying library imports a leaving one. Only tree.js, stop.js and magic.js import the set, and the only callers outside lib are tests, Go comments, notes, install.sh and Private.yml, each in the callers list. No open sibling takes overlapping work. scripts-folder-leaves touches install.sh, install.test.js and Install, and approach line 26 already names that rebase. Points the implementer fixes in place: (1) The stub adds Nobody beside nobody in command/private.go. Rename nobody to Nobody so the file spells one list, as approach line 20 says. (2) Approach line 13 turns the LOGGED mark into folders.go, and install.sh line 93 then loses its folders.js escape. PrivateFolderOwned would refuse that line. Keep folders.js named in that comment run. (3) privateFolderOwned also reads the file at check.Install. Then the root install.sh that scripts-folder-leaves lands stays under the rule.

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

go build ./... && go vet ./... && ./RUNME.sh lint

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The change touches only files the size list names, plus test/contract/tree-of.js which approach line 24 names, and test/level0/folders.test.js, which pins the folders.js exports the change cuts.
The new rules read the tree through TreeOver over Texts in memory, so each case reaches no door.
Each new function in folders.go carries a pointer to the-runtime-files-stand-apart, the design input the approach implements.
The folder lists stand in folders.go alone, and folders.js, setup_verb.go and doctor_verb.go now point at the Go owner.

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/tree_libs_test.go

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The nine tree and stop libraries under the level0 plugin lib folder leave, with tested.test.js, private.test.js, stop-rules.test.js and folders.test.js. Each rule they held runs in Go alone. New src/modules/check/folders.go holds the runtime folder lists and two rules over them, and the lint and the panel run both. The stop pool test globs every stop file through stop.Pool, so a broken stop file fails the Go check. command/private.go spells the nobody list once, and Private.yml points at it. The setup and doctor verbs read the editor lists from the check package. The notes and Go headers name each Go owner in place of the leaving file.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The tests-green leaf adds no edit past the landed change, whose files stand in the size list plus tree-of.js and the folders.js export case.
The green tests run over Texts in memory, strings and a disk glob, and reach no door.
Each changed Go function carries a pointer at the design input or note it implements.
The folder lists stand in folders.go alone, the nobody list in private.go alone, and the notes point at each Go owner.

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
