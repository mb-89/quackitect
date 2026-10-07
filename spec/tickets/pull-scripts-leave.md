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
depends_on: ["branch-scripts-leave"]
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box b1ba21c2e626 · claude-code-remote
    hash_before: 2e2636029a8ff4a4197b3152cba4e26588d768bc
    hash_after: 2e2636029a8ff4a4197b3152cba4e26588d768bc
    inputs:
      - name: ask
        hash: e617375ba72d869f
        size: 447
    def: c01ae0f2ace0cecb
---

# Ask

The pull scripts leave with their tests, since the pull runs in Go. A behaviour a deleted test held and no Go test holds gains a Go test through the verb.

The pull scripts stay as dead twins of `src/pull`, and their tests cost every check.

- `git ls-files 'src/scripts/pull*.js' src/scripts/process.js src/scripts/tool-call.js src/scripts/quack-topic.js` answers nothing
- `go test ./src/pull/...` passes
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

1. The nine scripts the first done_when line names leave.
2. chapter.js, guidance-hand.js, ephemeral.js and held-tests.js leave with them, since each imports a leaving script.
3. pull-route.js and guidance-hand.js import each other, so the two can only leave in one commit.
4. A Discussion line on ticket-scripts-leave says its scope shrinks to ticket-route.js and vehicle.js.
5. pull-hand-of, landed, tool-call, chapter and held-tests tests leave, and so do the orphan helpers pull-doors.js, pull-schema.js and quack-doors.js.
6. New Go tests in pull_landed_test.go hold the landing cases landed.test.js held, through `ticket pull --pass`.
7. The marker refusal case holds the put-back and the unlanded rows that the hook refusal case held.
8. pull_hand_test.go holds the box id, identity, owner's word and cloud-variable cases.
9. pull_test.go and pull_clear_test.go hold the tool-call wording, the spawn prompt and the chapter rows.
10. routes_test.go reads the tree's processes through ProcessAt, LeafOf and StepPathOf, one test per route case in process.test.js.
11. process.test.js keeps only its Vale case on the minted routes, and reads each route with lib's readYaml and processHash.
12. keptOf, keptOver, topicOf, PAST and REFUSES move into test/contract/ruled.js, beside the Vale run they filter.
13. paragraph.test.js and process.test.js import keptOf from ruled.js.
14. schema.test.js spells spec/processes itself, and schema-bless.test.js drops its HARNESS case.
15. tree.test.js reads the session file's spelling out of marks.go in place of SESSION.
16. folders.test.js drops BOX and SESSION. cloud-desk.test.js drops its push case.
17. level1.test.js reads CLAUDE_CODE_REMOTE off the env, and a Go test owns the HARNESS_KEYS copy check.
18. guidance-tags.test.js drops the unreached case, and guidance_test.go in quack holds it over guidanceRows.
19. TestTestArgv in check_test.go names logbook.test.js in place of chapter.test.js.
20. Every Go comment and design note naming a leaving script names its Go owner.
Weighed: flipping the order with ticket-scripts-leave. The pull-route and guidance-hand cycle breaks either order.
Weighed: inlining callOf and the three regexes into the dead twins. That edits code that only its tests run.
Weighed: a Go-written golden of minted routes for the Vale case. Tests rule five keeps tree content out of a golden.
Weighed: porting the Vale case to Go. No Go test runs real Vale, and the lint group keeps that door in JavaScript.
Assumed: taking guidance-hand.js, ephemeral.js, chapter.js and held-tests.js here, since a cloud box decides its group's scope.
Assumed: the lint group accepts edits to ruled.js and paragraph.test.js.
Assumed: the schema-bless HARNESS case moves to Go over Go's own lists, since lib/cloud.js leaves later.
Assumed: vale.test.js keeps the ephemeral.js path as a fixture label, which needs no file.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/scripts/pull-route.js: imports pull-cap, pull-hand-of, quack-topic, tool-call, pull-spawn and guidance-hand
- src/scripts/pull-cap.js: imports asOf and writeHold from guidance-hand.js
- src/scripts/pull-landed.js: takenOf, which reads holdsIn from ephemeral.js
- src/scripts/pull-spawn.js: spawnPrompt, which reads callOf
- src/scripts/chapter.js: lines, which reads ANSWERED, COMMENT and FENCE from pull-route.js
- src/scripts/guidance-hand.js: imports agentOf, BOX, handOf, leafOf and leavesOf
- src/scripts/ephemeral.js: ASKS, which read callOf from tool-call.js
- src/scripts/held-tests.js: heldTests, which reads holdsIn from ephemeral.js
- test/level0/pull-hand-of.test.js: every case
- test/level0/landed.test.js: every case
- test/level0/tool-call.test.js: every case
- test/level0/chapter.test.js: every case
- test/level0/held-tests.test.js: every case
- test/level0/cloud-desk.test.js: the case reading pushed, and its comment naming handDoors
- test/level0/folders.test.js: the two runtime writer cases reading BOX and SESSION
- test/level0/level1.test.js: the harness env case reading agentOf and HARNESS
- test/contract/process.test.js: every case, which reads leafOf, processAt, askRows, schemasHere, readsFor and keptOf
- test/contract/paragraph.test.js: the past tense case reading keptOf and PAST
- test/contract/schema.test.js: the two process cases reading PROCESSES
- test/contract/schema-bless.test.js: the case reading HARNESS
- test/contract/tree.test.js: the session file case reading SESSION
- test/contract/guidance-tags.test.js: the case reading unreached
- test/contract/ruled.js: rulesIn, which gains keptOf beside the Vale run
- src/quack/check_test.go: TestTestArgv, which names test/level0/chapter.test.js
- test/level0/pull-doors.js, pull-schema.js and quack-doors.js: orphan helpers no file imports
- src/branches/dispatch_write.go: the route comment naming processAt in process.js
- src/branches/hand.go and land.go: header comments naming pull-hand-of.js and pull-landed.js
- src/modules/check/group.go: the leaf comment naming leafOf and stepPathOf
- src/modules/guidance/guidance.go and guidance_test.go: comments naming guidance-hand.js and pull-route.js
- src/modules/hooks/command/guards.go: the comment naming pull-bless.js and pull-hand-of.js
- src/modules/hooks/command/tested.go: HeldTests, whose comment names guidance-hand.js
- src/modules/hooks/marks.go: the header and harnesses comments naming pull-hand-of.js
- src/modules/hooks/stopfacts.go: the header naming ephemeral.js
- src/modules/tickets/drawn.go: three comments naming pull-route.js
- src/pull: process.go, pull_cap.go, pull_holds.go, pull_landed.go, pull_route.go, pull_ephemeral.go, pull_chapter.go, pull_commands.go headers
- src/pull/process_test.go: the header naming process.js
- src/quack: retro_mint.go, verb_mint.go, ticket_fill.go, retro_collect.go, retro_collect_cloud.go comments naming leaving scripts
- spec/design_output: pull.md, work.md, extension.md, lsp.md, migration.md, stop.md lines naming leaving scripts or tests
- spec/tickets/ticket-scripts-leave.md: Discussion, since its guidance-hand.js and ephemeral.js leave here

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/pull/pull_landed_test.go: TestAPassStagesTheHandsJournaledPathsAndLeavesASiblingsEditOut
- src/pull/pull_landed_test.go: TestAPassStagesNoPathGitIgnoresStandingNowhereOrMarkedUnlanded
- src/pull/pull_landed_test.go: TestAPassWhileGitListsAnUnmergedPathWritesNothingAndNamesIt
- src/pull/pull_landed_test.go: TestAPassWhoseStagedDeltaAddsAMarkerPutsTheTicketBackAndSaysWhereItStays
- src/pull/pull_landed_test.go: TestAStepTheEngineSkipsCommitsTheTicketAloneAndLeavesTheTreeOut
- src/pull/pull_landed_test.go: TestAPrivateNotesPassLandsOnDiskAndCommitsNothing
- src/pull/pull_landed_test.go: TestADeskPassStandsOnThisBoxWhateverTheEnvironmentSays
- src/pull/pull_hand_test.go: TestAWorkRootWithNoBoxFileTakesTheIdentityUnderTheMethodRoot
- src/pull/pull_hand_test.go: TestTheBoxIDReadsTheBoxFileThenTheIdentityAndWritesNothing
- src/pull/pull_hand_test.go: TestTheOwnersWordSendsAnAgentsHandIntoAPersonStep
- src/pull/pull_hand_test.go: TestEveryCloudVariableNamesAHarness
- src/pull/pull_test.go: TestASecondPullNamesTheHandBackAsAToolCallWithItsWords
- src/pull/pull_test.go: TestASpawnPromptNamesTheToolCallsAndNoShellVerb
- src/pull/pull_test.go: TestAHandBackCountsNoFencedRowAsText
- src/pull/pull_test.go: TestAHandBackOnATicketWithNoChapterForItsLeafStandsRefused
- src/pull/pull_clear_test.go: TestTheClearsTicketsHandBackThroughTheToolAndNameNoShellVerb
- src/pull/routes_test.go: TestTheQuestionRouteOpensAtAStepWaitingForAPerson
- src/pull/routes_test.go: TestThePersonRouteOpensAtAPersonStepAndAnyHandCarriesOn
- src/pull/routes_test.go: TestTheGroupRouteReadsItsChildrenThroughAFinalAcceptance
- src/pull/routes_test.go: TestTheStandardRouteGatesTheDesignOnceAndHandsOnToTheRetro
- src/pull/routes_test.go: TestTheRetroRouteEndsOnTheReportThenTheMint
- src/pull/routes_test.go: TestTheRetroAuditReadsWholeAndCollectNamesTheScriptsFolder
- src/pull/routes_test.go: TestTheGroupsWriteStepAsksThePromptsAndErrorsWithTheirTimes
- src/pull/routes_test.go: TestTheReaderRuleHandsEachGroupChapterByItsClose
- src/pull/routes_test.go: TestTheStandardRouteAsksForTheViewInTheOwnersWords
- src/pull/routes_test.go: TestTheNoteRouteAsksForTheOwnersQuotedWords
- src/pull/routes_test.go: TestTheStandardRouteOpensOnTheOwnersReadOffAHandover
- src/quack/guidance_test.go: TestTheStandardGateReadsTheDesignReviewNoteAlone
- src/quack/guidance_test.go: TestEveryGuidanceNoteUnderASubfolderReachesSomeLeaf
- src/quack/hooks_folder_test.go: TestEveryKeyThePullToolForwardsNamesAHarness
- src/modules/hooks/command/tested_test.go: TestHeldTestsComeBackOnceAndAHoldWithNoTicketAddsNone

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first: no review has read this draft

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/scripts/process.js
- src/scripts/pull-cap.js
- src/scripts/pull-hand-of.js
- src/scripts/pull-landed.js
- src/scripts/pull-push.js
- src/scripts/pull-route.js
- src/scripts/pull-spawn.js
- src/scripts/quack-topic.js
- src/scripts/tool-call.js
- src/scripts/chapter.js
- src/scripts/guidance-hand.js
- src/scripts/ephemeral.js
- src/scripts/held-tests.js
- test/level0/pull-hand-of.test.js
- test/level0/landed.test.js
- test/level0/tool-call.test.js
- test/level0/chapter.test.js
- test/level0/held-tests.test.js
- test/level0/pull-doors.js
- test/level0/pull-schema.js
- test/level0/quack-doors.js
- test/level0/cloud-desk.test.js
- test/level0/folders.test.js
- test/level0/level1.test.js
- test/contract/process.test.js
- test/contract/paragraph.test.js
- test/contract/ruled.js
- test/contract/schema.test.js
- test/contract/schema-bless.test.js
- test/contract/tree.test.js
- test/contract/guidance-tags.test.js
- src/pull/pull_landed_test.go
- src/pull/pull_hand_test.go
- src/pull/routes_test.go
- src/pull/pull_test.go
- src/pull/pull_clear_test.go
- src/pull/process_test.go
- src/pull/process.go
- src/pull/pull_cap.go
- src/pull/pull_holds.go
- src/pull/pull_landed.go
- src/pull/pull_route.go
- src/pull/pull_ephemeral.go
- src/pull/pull_chapter.go
- src/pull/pull_commands.go
- src/quack/guidance_test.go
- src/quack/hooks_folder_test.go
- src/quack/check_test.go
- src/quack/retro_mint.go
- src/quack/verb_mint.go
- src/quack/ticket_fill.go
- src/quack/retro_collect.go
- src/quack/retro_collect_cloud.go
- src/modules/hooks/command/tested_test.go
- src/modules/hooks/command/tested.go
- src/modules/hooks/command/guards.go
- src/modules/hooks/marks.go
- src/modules/hooks/stopfacts.go
- src/modules/guidance/guidance.go
- src/modules/guidance/guidance_test.go
- src/modules/tickets/drawn.go
- src/modules/check/group.go
- src/branches/dispatch_write.go
- src/branches/hand.go
- src/branches/land.go
- spec/design_output/pull.md
- spec/design_output/work.md
- spec/design_output/extension.md
- spec/design_output/lsp.md
- spec/design_output/migration.md
- spec/design_output/stop.md
- spec/tickets/ticket-scripts-leave.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every script, test, helper, Go owner and verb named here stands opened, among them landed, pushed, HandOf, BoxIDHere, spawnPrompt, CallOf, ChapterOf, HeldTests and guidanceRows
- the callers come from a git grep on each leaving file, over imports, comments, RUNME.sh, .github, .vale.ini, package.json, src/stub and design notes
- git ls-files decides the first done_when line, the new src/pull tests the second, and ./RUNME.sh check the third
- the approach adds no config key, so no default file changes

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
