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
depends_on: ["engine-and-doors-leave", "tree-libs-leave"]
step: implement/change
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box b1ba21c2e626 · claude-code-remote
    hash_before: 83c483f7cead5496f5e8138218a05323a38a627e
    hash_after: 83c483f7cead5496f5e8138218a05323a38a627e
    inputs:
      - name: ask
        hash: d12e682d5468fd5d
        size: 531
    def: c01ae0f2ace0cecb
  - step: design/tests-red
    hand: box b1ba21c2e626 · claude-code-remote
    hash_before: 7af54ed788b68eac17d57d5a4a76fe138f158fb1
    hash_after: 1d9c5c4800a04afd48df32e1915cc19aa337c1e9
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/quack fails
    inputs:
      - name: design/draft
        hash: c70846da0c1716dc
        size: 15506
    def: 08e16d07b0de477c
  - step: gate
    hand: box b1ba21c2e626 · claude-code-remote · helper-4
    hash_before: 449fba70cebace9f538e2941db414d732d3e8e2f
    hash_after: d6dc04f8f1ac5dabd322c1a9feb71e1dabee1afb
    inputs:
      - name: design/draft
        hash: c70846da0c1716dc
        size: 15506
      - name: design/tests-red
        hash: 839ab9fc1cab1fab
        size: 2586
    def: dc4904ab364efa10
---

# Ask

The note reader, the schema checks and the mint leave the plugin library. The Go note reader then reads every note alone.

Two readers of one note drift, and the extension tests read fronts through code no road runs.

- `git ls-files '.claude/skills/level0/lib/schema*.js'` answers nothing
- `git ls-files .claude/skills/level0/lib/{ticket,todo,slug,paths,vocabulary,snippets,helpers,refuse}.js` answers nothing
- `go test ./src/note/... ./src/modules/check/... ./src/projection/...` passes
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

1. Sixteen libraries leave: schema, schema-body, schema-fault, schema-mint, schema-read, schema-route, schema-table, schema-yaml, ticket, todo, slug, paths, vocabulary, snippets, helpers and refuse.
2. The front door leaves with src/doors/fake/front.js, test/contract/front.test.js and test/level0/front-writer.test.js, since the mint tests were its last readers.
3. No staying library imports a leaving one. Inside lib, the leaving set imports only itself and hash.js, which the last slice of plugin-libs-leave deletes.
4. The hooks, src/stub, src/scripts, src/extension, RUNME.sh, install.sh, package.json and .github import no leaving file.
5. Go owns most rules: src/note, src/yaml, check/schema.go, check/mint.go, check/rerouted.go, src/pull/hash.go, src/pull/pull_hand.go, command/todo.go, src/projection and src/prose.
6. Seven rule families run in JavaScript alone: nested keys, $ref, step keywords, slots, data schemas, chapter tables and nested chapters.
7. src/yaml gains a line reader naming each key by its path, as keyed in schema-yaml.js writes it.
8. note.FrontOf fills Front.Lines with every nested path, and LineKeys keeps the top keys alone for placeholderFaults.
9. check/schema.go walks items and nested properties, resolves $ref across every schema, and reads x-names, x-earlier, x-leaf, x-fields, x-prefix and x-words.
10. New check/route.go holds the slot checks: an input naming no earlier step or field, and an output no later step reads.
11. check reads data schemas beside note schemas, and the sweep and Over check each file a data schema governs, such as spec/processes.
12. chaptersWanted nests a chapter for each step and evidence field, with the checked chapter under a leaf asking a checklist.
13. New check/table.go holds the chapter table rule: the heads, and each row naming an item of namesOf in order.
14. check/paths.go reads a double star with a slash as zero or more folders, as globOf in paths.js reads it.
15. export.go exports SlugOf, so src/quack drives spec/config/slug.yaml through the one Go slug.
16. test/contract ticket, schema-bless, handover-words, retro-route and vocabulary tests leave whole, with tree-of.js.
17. test/level0 todo, paths and writes-here tests leave whole, and their rows no Go test holds port to Go.
18. schema.test.js keeps its underscore draft Vale case alone, and drops every case over a leaving library or door.
19. guidance-tags.test.js drops its schema case and the schema.js import. guidance-lib-leaves deletes the file with its listOf case.
20. process.test.js reads each minted route off src/quack/testdata/minted.golden.json, in place of mintedNote, processHash and fakeFront.
21. A quack test mints every shipped route through withRoute and check.Minted, and fails where the golden drifts. The -update flag writes it again.
22. src/note/testdata/fronts.golden.json holds each ticket text the extension fakes seed, with the front the Go reader answers.
23. v1-index.js reads fronts off that golden, and throws with the -update line where a text stands missing, as drawnOf does.
24. yaml.Doc gains MarshalJSON in key order, so the golden writer and checker marshal a front directly.
25. v1-index.js drops readYaml. sidebar-views.test.js hands views/bases through given, as sidebar-v1.test.js does.
26. lens-v1.test.js and drawing-page.test.js read steps off ticketDrawn. lens-actions.test.js drops the imports line, since no extension code calls it.
27. The doors.md chapter A script guards its main goes with runsHere, which nothing calls.
28. ruled.js and every Go comment naming a leaving file name its Go owner.
29. schema.md, vocabulary.md, doors.md, bash.md, private.md, tree.md, level0.md and migration.md name the Go owner of each leaving file.
30. The javascript-leaves inventory rows of each leaving file and test name schema-libs-leave and the fate this approach gives them.
31. A Discussion line on guidance-lib-leaves names the guidance-tags.test.js hand-off. One on plugin-libs-leave says schema.test.js and ticket.test.js read the git door no more.
32. The implement step mints se-front-leaves in javascript-leaves, since se-front loses its last caller with the front door.
33. src/quack/schema_libs_test.go globs the leaving libraries, the front door, its fake and the leaving tests, and stays red until they leave.
34. A second case there globs every test file, reads each through os.ReadFile, and refuses an import of a leaving file.
Weighed: a child ticket for the Go checker port. It adds a draft, a gate and a review for work this draft already maps.
Weighed: retiring the seven rule families with no port. A typo in a step path or a nested key then passes, and nobody hears.
Weighed: a JavaScript front reader kept in v1-index.js. The parent refuses it, since two readers of one note drift.
Weighed: a stdout flag on the mint verb for process.test.js. A spawn per route breaks the one Vale run the case asserts.
Weighed: retiring se-front here. It reaches install.sh, the stamp verb and the review worktree, past the ask.
Weighed: keeping runsHere for a future script. No script calls it, so the rule guards nothing.
Assumed: the lint group accepts the edits to schema.test.js, process.test.js and ruled.js.
Assumed: tests-red runs the Go sweep over the tree, and names every note the ported rules refuse before the gate.
Assumed: spec/design_input stays untouched, since it holds the owner input.
Assumed: the tree-wide schema and vocabulary cases live in src/quack, since a module test reads no disk.
Assumed: whichever of this ticket and guidance-lib-leaves lands second deletes guidance-tags.test.js.
Assumed: TestATodoStandsBeforeTheRowItNames in src/modules/queue holds the order taggedFirst answered.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- .claude/skills/level0/lib: every leaving file, read by the leaving set and by tests alone
- src/doors/front.js: front, read by front.test.js and front-writer.test.js
- src/doors/fake/front.js: fakeFront, read by schema.test.js, ticket.test.js, process.test.js and front.test.js
- test/contract/schema.test.js: every case but the underscore draft, reading schema.js, schema-mint.js, fakeFront, treeOf and the git door
- test/contract/process.test.js: minted, reading processHash, readYaml, schemasFrom, mintedNote and fakeFront
- test/contract/guidance-tags.test.js: the tags case, reading checkNote and readYaml
- test/contract/ticket.test.js: every case
- test/contract/schema-bless.test.js: every case
- test/contract/handover-words.test.js: the owner words case
- test/contract/retro-route.test.js: the backlog case
- test/contract/vocabulary.test.js: every case, reading slug.js, vocabulary.js and readYaml
- test/contract/front.test.js: every case
- test/contract/drawing-page.test.js: FRONT, reading readNote
- test/contract/tree-of.js: treeOf, reading isDraft
- test/contract/ruled.js: the Vale glob comment naming lib/paths.js
- test/level0/v1-index.js: frontOf and the views/bases answer, reading readNote and readYaml
- test/level0/lens-v1.test.js: the held ticket case, reading readNote
- test/level0/lens-actions.test.js: doorOf, whose imports hands noteSchema
- test/level0/sidebar-views.test.js: doorOf and shadowDoorOf, seeding spec/views/work.base
- test/level0: fields-to-fill, lens, route-host, logbook, sidebar, sidebar-work and sidebar-writes tests: v1Over, through the fronts golden
- test/level0/todo.test.js, paths.test.js, writes-here.test.js, front-writer.test.js: every case
- src/modules/check/schema.go: schemasIn, frontFaults, fieldFaults, schemaFaults, noteFaults and the folderFault comment
- src/modules/check/schema-body.go: bodyFaults, chaptersWanted and sectionFaults
- src/modules/check/checker.go: Over and Sweep, which reach data files
- src/modules/check/paths.go: globOf and splitKeeping
- src/modules/check/restated.go: slugOf
- src/modules/check/export.go: the exported var block
- src/modules/check/owned.go: the Front.Lines readers, whose top keys stay
- src/note/note.go: FrontOf, and the sectionAt comment
- src/yaml/yaml.go: Read, Doc, and the quotedWhole and flowItems comments
- src/quack/verb_mint.go: withRoute, read by the golden writer, and the fieldsIn comment
- src/modules/check: mint.go, mint_test.go, mint_refusal_test.go, rerouted.go, rerouted_test.go, schema_test.go comments
- src/modules/hooks/write: refuse.go and door.go comments
- src/modules/hooks/command: todo.go, todo_test.go, private.go and refuse.go comments
- src/modules/hooks/writes.go and src/modules/hooks/stop/tickets.go comments
- src/modules/drafts/prose.go comments
- src/modules/tickets/drawn.go: the entriesIn and entryNamed comments
- src/branches/dispatch_write.go and dispatch_write_test.go: the processHash and canonicalOf comments
- src/pull: hash.go, walk.go, pull_hand.go and process_test.go comments
- src/quack/ticket_todo.go: the TODO comment
- src/prose: words.go and finding.go comments
- src/projection: projection.go, snippets.go, vocabulary.go and yaml.go comments
- spec/design_output: schema.md, vocabulary.md, doors.md, bash.md, private.md, tree.md, level0.md and migration.md lines naming leaving files
- spec/tickets/javascript-leaves.md: the inventory rows
- spec/tickets/guidance-lib-leaves.md and plugin-libs-leave.md: Discussion

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/quack/schema_libs_test.go: TestTheSchemaLibrariesStandNowhere
- src/quack/schema_libs_test.go: TestNoTestImportsALeavingSchemaFile
- src/yaml/yaml_test.go: TestReadLinesNamesEveryKeyByItsPath
- src/yaml/yaml_test.go: TestADocMarshalsItsKeysInOrder
- src/note/note_test.go: TestTheFrontHoldsTheLineOfEveryNestedKey
- src/note/note_test.go: TestEveryFrontGoldenMatchesTheReader
- src/quack/fronts_golden_test.go: TestTheFrontGoldenReadsEveryTextAgain
- src/quack/minted_golden_test.go: TestEveryShippedRouteMintsItsGolden
- src/quack/minted_golden_test.go: TestTheMintedGoldenMintsEveryRouteAgain
- src/modules/check/route_test.go: TestAFaultNestedTwoListsDeepNamesItsLine
- src/modules/check/route_test.go: TestAPathNamingNoStepIsRefusedWithTheStepsItHolds
- src/modules/check/route_test.go: TestAnOrphanFieldOnAStepIsRefused
- src/modules/check/route_test.go: TestARecordEntryNamesAStepThatStands
- src/modules/check/route_test.go: TestAnInputNamingNoEarlierStepIsRefused
- src/modules/check/route_test.go: TestAnOutputNothingReadsIsRefused
- src/modules/check/route_test.go: TestARefReadsTheShapeAnotherSchemaHolds
- src/modules/check/route_test.go: TestAProcessFileReadsUnderItsDataSchema
- src/modules/check/route_test.go: TestEveryDepartureCarriesTheShapeThePanelDraws
- src/modules/check/schema_test.go: TestAChapterMissingForAnEvidenceFieldIsRefused
- src/modules/check/table_test.go: TestAChapterTableOpensWithItsHeadsAndNamesItemsInOrder
- src/modules/check/paths_test.go: TestAGlobReadsOneFolderDeepAndADoubleStarReadsPastIt
- src/modules/check/paths_test.go: TestAnUnderscoreParksADraftAtAnyDepth
- src/modules/hooks/write/door_test.go: TestRelativeToReadsEitherSeparatorAndEitherDriveCase
- src/modules/hooks/command/todo_test.go: TestTaggedInReadsTheTodoTag, gaining the no-front and empty rows
- src/modules/hooks/command/todo_test.go: TestRefusedTodoCountsTheNotes, gaining the every-file, off-flag and push-gate asserts
- src/pull/writes_here_test.go: TestWritesHereReadsEachHandAgainstTheStepBy
- src/pull/routes_test.go: TestTheRetroRouteHoldsBacklogAfterAudit
- src/quack/shipped_schemas_test.go: TestEveryNoteSchemaNamesItsKindAChapterAndItsPaths
- src/quack/shipped_schemas_test.go: TestEveryKindMintsANoteTheCheckerPasses
- src/quack/shipped_schemas_test.go: TestEveryShippedProcessPassesItsSchemaAndMintsACleanTicket
- src/quack/shipped_schemas_test.go: TestTheRouteStandsInOnePlaceAndTheProcessNamesIt
- src/quack/shipped_schemas_test.go: TestBothTicketFoldersStandUnderOneSchemaAndNoSchemaNamesAGroup
- src/quack/shipped_schemas_test.go: TestTheTicketSchemaTakesFixAndBlessAsBooleans
- src/quack/shipped_schemas_test.go: TestAHandoverLackingTheOwnersWordsDrawsAFinding
- src/quack/shipped_schemas_test.go: TestTheTicketAndGuidanceSchemasAdmitTags
- src/quack/vocabulary_lists_test.go: TestTheSlugAnswersEveryCaseTheSourceHolds
- src/quack/vocabulary_lists_test.go: TestNoTermPointsAtANote
- src/quack/vocabulary_lists_test.go: TestEveryTermSaysWhatItMeansInListedWords
- src/quack/vocabulary_lists_test.go: TestTheTableOfEndingsReachesEveryCaseItNames
- src/quack/vocabulary_lists_test.go: TestTheCoreHoldsTheStandardTheSeedAndTheCommonWords
- src/quack/vocabulary_lists_test.go: TestEverySwapWritesAWordTheListsHold

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first: no review has read this draft

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- .claude/skills/level0/lib: schema, schema-body, schema-fault, schema-mint, schema-read, schema-route, schema-table, schema-yaml, ticket, todo, slug, paths, vocabulary, snippets, helpers, refuse
- src/doors/front.js
- src/doors/fake/front.js
- test/contract: front.test.js, ticket.test.js, schema-bless.test.js, handover-words.test.js, retro-route.test.js, vocabulary.test.js, tree-of.js
- test/contract/schema.test.js
- test/contract/process.test.js
- test/contract/guidance-tags.test.js
- test/contract/drawing-page.test.js
- test/contract/ruled.js
- test/level0: todo.test.js, paths.test.js, writes-here.test.js, front-writer.test.js
- test/level0/v1-index.js
- test/level0/lens-v1.test.js
- test/level0/lens-actions.test.js
- test/level0/sidebar-views.test.js
- test/level0: lens.test.js, fields-to-fill.test.js, where a seeded text takes its golden name
- src/yaml: yaml.go, value.go, yaml_test.go
- src/note: note.go, note_test.go, testdata/fronts.golden.json
- src/modules/check: schema.go, schema-body.go, checker.go, paths.go, restated.go, export.go, route.go, route_test.go, table.go, table_test.go, paths_test.go, schema_test.go
- src/modules/check comments: mint.go, mint_test.go, mint_refusal_test.go, rerouted.go, rerouted_test.go
- src/modules/hooks/write: door.go, door_test.go, refuse.go
- src/modules/hooks/command: todo.go, todo_test.go, private.go, refuse.go
- src/modules/hooks: writes.go, stop/tickets.go
- src/modules/drafts/prose.go
- src/modules/tickets/drawn.go
- src/branches: dispatch_write.go, dispatch_write_test.go
- src/pull: hash.go, walk.go, pull_hand.go, process_test.go, routes_test.go, writes_here_test.go
- src/prose: words.go, finding.go
- src/projection: projection.go, snippets.go, vocabulary.go, yaml.go
- src/quack: schema_libs_test.go, fronts_golden_test.go, minted_golden_test.go, testdata/minted.golden.json, shipped_schemas_test.go, vocabulary_lists_test.go, verb_mint.go, ticket_todo.go
- spec/design_output: schema.md, vocabulary.md, doors.md, bash.md, private.md, tree.md, level0.md, migration.md
- spec/tickets: javascript-leaves.md inventory, guidance-lib-leaves.md and plugin-libs-leave.md Discussion, and the minted se-front-leaves.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file, function and verb named stands opened and checked: each lib import, the front door and fake, checkNote, checkData, refersFaults, slotFaults, tableFaults, globOf, the Go checker, note.FrontOf, yaml.Read, StemsIn, prose.Words, writesHere, RefusedTodo, withRoute, check.Minted, the drawn golden and v1-index
- the callers come from git grep on each leaving file and export over hooks, lib, src with src/extension, test, RUNME.sh, install.sh, package.json, .github, Go comments and spec notes
- TestTheSchemaLibrariesStandNowhere decides the two git ls-files lines, the new note and check tests decide the go test line, and ./RUNME.sh check at tests-green decides the fourth
- the approach adds no config key, so no default file changes

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/schema_libs_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/quack/schema_libs_test.go
- src/quack/minted_golden_test.go
- src/quack/shipped_schemas_test.go
- src/modules/check/route_test.go
- src/modules/check/schema_test.go
- src/modules/check/table_test.go
- src/modules/check/paths_test.go
- src/yaml/yaml_test.go
- src/note/note_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

TestTheSchemaLibrariesStandNowhere fails on its assertion and names every leaving library, door and test.
TestNoTestImportsALeavingSchemaFile names drawing-page, guidance-tags, process, schema, lens-actions, lens-v1 and v1-index.
Every new check case fails on its assertion, since the sweep answers nothing past the top keys. These are the nested keys, the step paths, the record, the slots, the ref, the data schema, the nested chapters and the table.
In paths_test, the zero-folder double star row fails, and the other glob rows pass.
TestReadLinesNamesEveryKeyByItsPath fails against the ReadLines stub, which answers nil.
TestADocMarshalsItsKeysInOrder fails because a Doc marshals as an empty object today.
TestTheFrontHoldsTheLineOfEveryNestedKey fails on its assertion.
TestEveryFrontGoldenMatchesTheReader and TestEveryShippedRouteMintsItsGolden stay red, since neither golden file exists yet.
The two golden writers skip unless the update flag is set, as their drawn twin does. One update run of the minted writer turned its checker green, and the file left again afterwards.
TestTheTicketSchemaTakesFixAndBlessAsBooleans fails on the nested bless row alone.
These ported rows pass now because Go already holds them: the departure shape, the underscore, the write door RelativeTo, the todo rows, writesHere and the retro backlog.
The shipped schema cases also pass, other than bless, and so do all six word list cases.
Surprise one: check.SlugOf already stands exported, so approach line 15 has no work left.
Surprise two: the write door holds a second RelativeTo beside the one in check.
Surprise three: the note test reads its golden through os.ReadFile, since an embed of a missing file breaks the build.
Surprise four: routeSchema and routedSchema already exist in check tests, so the new schema takes the name ticketRouteSchema.
The ReadLines stub is the only production change.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

TestTheSchemaLibrariesStandNowhere decides both git ls-files lines. The new check, note and yaml tests decide the go test line, and the check at tests-green decides the last.
The tests reach no door. Check cases seed Texts in memory, and quack cases read the tree through Glob and ReadFile with no exec.

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept. The approach answers the ask, and a red test decides every done_when line. Every library the done_when globs name stands tracked, and approach line one names each of them. A git grep over .claude, src, test, package.json, RUNME.sh, install.sh and .github finds no importer of a leaving library outside the leaving set and the tests the approach deletes or rewrites. The hooks, src/extension, src/scripts and src/stub import none of them. The Go owners the approach relies on exist: src/note, src/yaml, check/schema.go, check/mint.go, check/rerouted.go, check.Minted, check.SlugOf, withRoute in verb_mint.go, src/pull/hash.go, src/pull/pull_hand.go, command/todo.go, src/projection and src/prose. The red tests exist and fail on their own assertions. TestTheSchemaLibrariesStandNowhere decides both git ls-files lines, the note and check tests decide the go test line, and the check at tests-green decides the last. Points the implementer fixes in place: (1) Approach line fifteen and src/modules/check/export.go in size carry no work, since check.SlugOf already stands exported, so drop both. (2) TestNoTestImportsALeavingSchemaFile reads only test/. Widen its glob over src/extension, src/scripts, src/stub and .claude/skills/level0/hooks. (3) The callers list sends logbook, route-host, sidebar, sidebar-work and sidebar-writes through v1Over and the fronts golden, and size leaves them out. Run them against the golden, and add any of them that changes to size. Seed every text they read into src/note/testdata/fronts.golden.json before the update run. (4) The write door holds a second RelativeTo beside the one in check. Point the door.go comment at one Go owner, and park the duplicate as a private note. (5) Approach line thirty retargets the inventory table rows, which still name plugin-libs-leave for every leaving library. Move the leaving tests out of the per-ticket lists under plugin-libs-leave, branch-scripts-leave, pull-scripts-leave, ticket-scripts-leave and engine-and-doors-leave too. (6) Once schema-route.js leaves, hash.js has no importer. Add a Discussion line on plugin-libs-leave saying hash.js stands orphaned.

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

[[spec/tickets/engine-and-doors-leave]] leaves `src/doors/front.js`, `src/doors/fake/front.js` and `test/contract/front.test.js` standing, since the schema-mint tests pass in the fake front. This ticket takes the front door once those tests leave.
