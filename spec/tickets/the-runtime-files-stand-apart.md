---
kind: [[ticket]]
state: closed
urgent: true
step: implement/person-1
steps:
  - name: design
    reads: [[spec/guidance/voice]]
    steps:
      - name: draft
        does: writes the approach the ask calls for
        from: anyone
        by: anyone
        input: ask
        evidence:
          - name: approach
            form: text
            says: the approach here where it takes minutes, or a link to the design output where it takes a note
      - name: review
        does: reads the approach against the ask
        not: draft
        on_fail: draft
        reads: [[spec/guidance/review/reviewing]]
        input: design/draft
        evidence:
          - name: verdict
            form: verdict
            says: pass or fail, with findings one a line
  - name: implement
    reads: [[spec/guidance/code/testing]]
    needs: ["branch test"]
    input: design/draft
    checklist: ["the change touches no file the ask leaves out", "every door the change reaches has a fake", "a comment names the approach the change implements"]
    steps:
      - name: tests-red
        does: writes the tests the ask calls for
        evidence:
          - name: tests
            form: command
            expects: assertion
            says: the tests you write fail on their own assertion
          - name: seen
            form: text
            says: what you see, and what surprises you
      - name: person-1
        does: answers the question the engine asks
        by: person
        to: engine
        asks: "verdict failed back 2 times: The four fixes the last verdict named land, and `./RUNME.sh check` answers 0.; `./RUNME.sh branch test` answers green, and `./RUNME.sh branch review` answers nothing to fix.; The walk covers the private folder, and a word in a private note comes back from a find.; The runtime half stands outside the rows, so the box record comes back from no find.; `PrivateFolderOwned` refuses an unowned spelling of the new folder, which I fed it and watched refuse.; The commit tracks no built binary, and the rule hiding it stands beside the language server's own.; `src/bridge/stop.js` reads the hold under the old folder, so `holdStands` answers false on every box.; `PrivateFolderOwned` passes a spelling of the old folder, which I fed it and watched pass.; No case holds `src/bridge/stop.js` against the hold folder `folders.js` owns.; No note under `spec/design_output` names either new folder, so the placement rule stands in code alone.; Every design note naming a moved file names its old place.; `spec/design_output/private.md` owns the private half, and its table still sends a reader to the old log.; `spec/guidance/working.md` sends every agent to the tools file at its old place.; `level0.js` and `level1.js` name the owner beside the session path, and no case holds them against `hand.js`.; `RETRO` stands exported and tested, and the branch writes under it nowhere.; No retro stands in the handover, and the group writes one at its own hand-back.; The rest of the branch serves the group's other children, and redesigns nothing this ask holds.; The fixes:; Take the hold path in `src/bridge/stop.js` from `folders.js`, and cover it with a case.; Make `PrivateFolderOwned` refuse a spelling of the old folder, so the next such reader fails.; Hold the session spellings in `level0.js` and `level1.js` against `hand.js` in a case.; Name the two folders and the placement rule in `spec/design_output/private.md`, and point the other notes there.; Point every note naming a moved file at its new place. A grep for the old folder over `spec` names them.; Fix `spec/guidance/working.md` first, because every agent reads it at its start."
        evidence:
          - name: answer
            form: text
            says: the answer, which the step behind this one reads
      - name: reflect
        does: names the class of error in the findings, and the fix for the class
        when: returned
        input: verdict
        evidence:
          - name: class
            form: text
            says: the class of error the findings describe, and the fix for the class
      - name: change
        does: makes the change
        reads: [[spec/guidance/code/code]]
        evidence:
          - name: lint
            form: command
            expects: 0
            says: the tree builds and lints
      - name: tests-green
        does: makes the tests pass
        input: tests-red
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
  - name: verdict
    does: reads every hunk against the ask and the approach
    not: implement
    on_fail: implement/reflect
    reads: [[spec/guidance/review/reviewing]]
    input: ["diff", "implement"]
    to: retro
    checklist: ["every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
    evidence:
      - name: read
        form: files
        says: every file you read, one a line
      - name: verdict
        form: verdict
        says: pass or fail, findings one a line
process: [[spec/processes/standard]]
process_hash: 838dd6d003506639
record:
  - step: design/draft
    hand: box a5e189c39e1d · claude-code-remote
    hash_before: 09ca2410b204c55f5c502c780c0ecc03caffcc1b
    hash_after: 5b5cc69fb9db050d50b9809cb4b4de470f3e6f85
  - step: design/review
    hand: box a5e189c39e1d · claude-code-remote · helper-2
    hash_before: 81a9b54a1f1379a9fe003f4b34e80cb0b96325c9
    hash_after: 81a9b54a1f1379a9fe003f4b34e80cb0b96325c9
    returns: 1
    why: The runtime list names five things, and the private folder holds more kinds. Name the rule that places a kind neither list names.; `.se/review` holds a git worktree, a second checkout of this tree. Put it in the runtime folder. Otherwise the rows carry every tracked file twice.; `.se/undo` holds both halves of every file an apply writes. Put it in the runtime folder. Otherwise a word standing in a note alone comes back from the journal too.; `.se/bin` holds the built binaries. The walk reads and hashes each one on every pass. Put it in the runtime folder.; The `Grep` and `Glob` doors answer off the same rows. A row under the worktree sends a reader to the wrong copy.; The rest of the approach answers the ask. The two named folders and the module owning the names stand.; The path-relative skip is right. The walk today matches a folder on its base name alone.
  - step: design/draft
    hand: box a5e189c39e1d · claude-code-remote
    hash_before: 5c26710f455cf8656f6a01aa23ecda4454b0a5c5
    hash_after: 5c26710f455cf8656f6a01aa23ecda4454b0a5c5
  - step: design/review
    hand: box a5e189c39e1d · claude-code-remote · helper-8
    hash_before: 8428ab77ad155b61fe810900a6db6445a9c38c9b
    hash_after: 8428ab77ad155b61fe810900a6db6445a9c38c9b
  - step: implement/tests-red
    hand: box dd2a59294365 · claude-code-remote
    hash_before: 036f308628588ccaff42ad5beb62a3f1dd0aacfb
    hash_after: 169b90378f249f6b1c08902a201fe2c1e631684f
    answered:
      - name: tests
        exit: 1
        said: assertion, 3 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box dd2a59294365 · claude-code-remote
    hash_before: 3c6b9c99216796a520ae1ea963e73909db60a5cf
    hash_after: 743c41ef573861fd0fe86730f01cdc1b5b6d7ab8
    answered:
      - name: lint
        exit: 0
        said: 78 stand at warning, which the panel draws and check allows.
  - step: implement/tests-green
    hand: box dd2a59294365 · claude-code-remote
    hash_before: 4dd7b64c73dfe12af221569923067aa12ae878f3
    hash_after: cc87c21c9986364012a8bcbc783503f7e01f1421
    answered:
      - name: tests
        exit: 0
        said: green, 804 test(s) pass in 65 file(s)
      - name: check
        exit: 0
        said: 78 stand at warning, which the panel draws and check allows.
  - step: verdict
    hand: box dd2a59294365 · claude-code-remote · helper-9
    hash_before: f36c7a1f0a1ae5def21f886694b82109bf505d85
    hash_after: f36c7a1f0a1ae5def21f886694b82109bf505d85
    returns: 1
    why: "`src/scripts/review.js` makes `.se`, then writes the survey under the runtime folder. `branch review` dies there.; `copilot-setup.js` makes `.se`, then writes the cloud mark under the runtime folder. The same class of error.; `level1.js` writes the hand's session file at the old path, and its two readers read the new one.; The change commit tracks the built binary `src/index/index`. The walk reads and hashes it on every pass.; `RETRO` stands exported and tested, and the branch writes under it nowhere. The retro verb takes it up later.; `src/lsp/serve.go`, `src/lsp/tree.go` and `src/doors/session.js` spell the runtime folder, and point at no owner.; `test/level0/folders.test.js` holds no case over the session file, so that drift passes green.; `./RUNME.sh check` answers 0 in the tree. The review verb dies before the worktree check runs.; The handover carries a surprises chapter, and a retro chapter waits on the group.; The walk, the skip rule and the placement rule each carry a case asserting a refusal.; The installer's move of a box's old places carries no case.; The rest of the branch splits files by topic for other tickets, and redesigns what this ask holds nowhere.; The fixes:; Make the runtime folder before each write into it, in `review.js` and in `copilot-setup.js`.; Bring the session path under the module's reach, and hold `level1.js` against it in a case.; Drop the built binary from git, and let the build write under the runtime bin.; Point `serve.go`, `tree.go`, `session.js` and `install.sh` at the module owning the name."
  - step: implement/reflect
    hand: box dd2a59294365 · claude-code-remote
    hash_before: 9ed9a571455d046499ecbd86f0c56c5338f546a1
    hash_after: 9ed9a571455d046499ecbd86f0c56c5338f546a1
  - step: implement/change
    hand: box dd2a59294365 · claude-code-remote
    hash_before: 2f31173bf1ee8d4cfda3827f95aa36d2b5a85bba
    hash_after: 324864c7ee28463668d4bf94f25f743549b09162
    answered:
      - name: lint
        exit: 0
        said: 79 stand at warning, which the panel draws and check allows.
  - step: implement/tests-green
    hand: box dd2a59294365 · claude-code-remote
    hash_before: 80d9a3936a6642ac28582ea1b91c04139c158c33
    hash_after: 377f7bdb7e6462e09b37743114e47b19a40c7477
    answered:
      - name: tests
        exit: 0
        said: green, 806 test(s) pass in 65 file(s)
      - name: check
        exit: 0
        said: 79 stand at warning, which the panel draws and check allows.
  - step: verdict
    hand: box dd2a59294365 · claude-code-remote · helper-14
    hash_before: 6dbbd9552ae7dd42eb9ee3a1c6367b4373c9f861
    hash_after: 6dbbd9552ae7dd42eb9ee3a1c6367b4373c9f861
    returns: 2
    why: The four fixes the last verdict named land, and `./RUNME.sh check` answers 0.; `./RUNME.sh branch test` answers green, and `./RUNME.sh branch review` answers nothing to fix.; The walk covers the private folder, and a word in a private note comes back from a find.; The runtime half stands outside the rows, so the box record comes back from no find.; `PrivateFolderOwned` refuses an unowned spelling of the new folder, which I fed it and watched refuse.; The commit tracks no built binary, and the rule hiding it stands beside the language server's own.; `src/bridge/stop.js` reads the hold under the old folder, so `holdStands` answers false on every box.; `PrivateFolderOwned` passes a spelling of the old folder, which I fed it and watched pass.; No case holds `src/bridge/stop.js` against the hold folder `folders.js` owns.; No note under `spec/design_output` names either new folder, so the placement rule stands in code alone.; Every design note naming a moved file names its old place.; `spec/design_output/private.md` owns the private half, and its table still sends a reader to the old log.; `spec/guidance/working.md` sends every agent to the tools file at its old place.; `level0.js` and `level1.js` name the owner beside the session path, and no case holds them against `hand.js`.; `RETRO` stands exported and tested, and the branch writes under it nowhere.; No retro stands in the handover, and the group writes one at its own hand-back.; The rest of the branch serves the group's other children, and redesigns nothing this ask holds.; The fixes:; Take the hold path in `src/bridge/stop.js` from `folders.js`, and cover it with a case.; Make `PrivateFolderOwned` refuse a spelling of the old folder, so the next such reader fails.; Hold the session spellings in `level0.js` and `level1.js` against `hand.js` in a case.; Name the two folders and the placement rule in `spec/design_output/private.md`, and point the other notes there.; Point every note naming a moved file at its new place. A grep for the old folder over `spec` names them.; Fix `spec/guidance/working.md` first, because every agent reads it at its start.
group: the-warnings-feed-a-refactorer
reason: became
successors: [the-private-split-reads-clean]
---

# Ask

**The gain.** A reader tells the three kinds of private file apart by the folder they stand in. The retro reads its own half and walks past the rest. The index answers a question over a private note the way it answers one over any other note.

**What breaks otherwise.** One folder name covers three purposes. The retro reads files nobody writes for it, and a question over a private note answers off the disk or answers nothing.

[[spec/design_input/the-runtime-files-stand-apart]] carries the ask.

- `.se` holds one folder for the retro's files and one for the runtime's
- every writer names the folder its files belong to
- the index walk covers the private folder and stands outside the runtime half
- a word standing in a private note alone comes back from a `find`
- `./RUNME.sh check` answers 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

Two named folders stand under the private folder. The rest of it keeps its
place. The folder a file stands in says which kind it is.

| kind | where it stands | who reads it |
|---|---|---|
| retro | `.se/retro` | the retro, as its own |
| runtime | `.se/run` | the box that wrote it |
| the rest | `.se` itself | the retro, and a question over the index |

One module owns the two names. Every writer takes its folder from there. A
reader finds the rule in one place, and a later kind lands beside it.

One question places a file the three kinds leave open: does a reader ask after
this file once the box dies? A yes puts it in the rest, and a no puts it in the
runtime folder. The retro folder takes what a retro writes and reads back.

So the runtime folder takes these, and a later one answering no joins them:

| what | why it stands there |
|---|---|
| `.se/review` | a git worktree, so the walk reads every tracked file a second time |
| `.se/undo` | both halves of every file an apply writes, so a word comes back off the journal |
| `.se/bin` | the built binaries, which the walk reads and hashes on every pass |
| `.se/index.db` | the rows themselves, which move under every question |
| `.se/log` | the box's log |
| `.se/hold` | the hold a step carries |
| `.se/tools.json` | where each tool stands on this box |
| `.se/box.json` | the box's own record |

The worktree matters most. `Grep` and `Glob` answer off the same rows, so a row
under it sends a reader to the wrong copy of a file.

The rest keeps the notes, the handover and the private tickets. A reader asks
after each of them.

The index walk drops the private folder from its skip list. It skips the runtime
folder in its place. A skip on a name alone reaches the wrong folder, so the
walk reads the path under the root. The rows then answer a `find` over a private
note.

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

pass

- The placement rule stands, and it answers for a kind both lists leave out.
- The runtime table names the worktree folder, the undo journal and the built binaries.
- The worktree stands outside the walk, so the rows carry one row a path.
- The undo journal stands outside the walk, so a word comes back off its note alone.
- The walk today matches a folder on its base name, so the path-relative skip is right.
- The `Grep` door answers out of the rows, which the approach reads right.
- One skip map serves the walk and the watch, so one change covers the two.
- The two named folders and the module owning the names answer the ask.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

./RUNME.sh branch test

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

The tests stand in a new file, `test/level0/folders.test.js`, and in the index's own Go tests. The module the tests import, `.claude/skills/level0/lib/folders.js`, holds the two names and the placement rule and reaches nothing. It stands now, because a test importing a module nobody wrote answers `build` where the step asks for `assertion`.

| what the test drives | how it fails today |
|---|---|
| the writers of the worktree, the journal, the binaries, the survey, the log, the box record and the hold, each under the runtime half | each names a folder straight under the private one |
| the hold folder, one path across the three modules spelling it | the three agree on the old path |
| the walk, over a private note | the walk skips the private folder whole |
| a `find` over a word standing in a private note alone | the rows carry no such note |
| the glob, over the notes outside the runtime half | the private note reaches no row |

These stand green already, and they hold the claim the change must keep:

| what the test drives | why it passes today |
|---|---|
| the runtime half read off the path, not off a folder's base name | the module owns the rule |
| the index binary, under the bin the survey names | one constant builds the other |
| the private tickets, in the rest | a reader asks after them once the box dies |
| the walk, outside the runtime half | the private folder covers it today |

What surprises me:

- `./RUNME.sh branch test` runs the JavaScript tests alone. The Go half of the red answers through `go test`, and lands in the check.
- The Go tests want `CGO_ENABLED=1` and the `sqlite_fts5` tag. `src/scripts/install.sh` carries both for the build, and no test command carries them.
- The hold folder stands spelled in a module of its own, so the move touches each. The tests hold them against one path, so a drift fails.
- The glob test counts the notes the fixture writes, so the fixture and that count move together.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches no file the ask leaves out: each one names a path under the private folder
- every door the change reaches has a fake: the tree rule runs over a fake tree
- a comment names the approach: every forced copy names the module owning it, beside the copy

## person-1

<!-- answers the question the engine asks -->

### answer

<!-- the answer, which the step behind this one reads -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches no file the ask leaves out: each one names a path under the private folder
- every door the change reaches has a fake: the tree rule runs over a fake tree
- a comment names the approach: every forced copy names the module owning it, beside the copy

## reflect

<!-- names the class of error in the findings, and the fix for the class -->

### class

<!-- the class of error the findings describe, and the fix for the class -->

<!-- the form is text -->

The class: a path moved one level deeper, and the line beside it stayed. Each finding is a caller that spells the private folder itself in place of taking it from the module.

| the shape | where it shows |
|---|---|
| a write takes the new path, and the `makeDir` beside it takes the old one | the review worktree, the cloud mark |
| a copy spelled in a plugin keeps the old path, and its readers take the new one | the hand's session file |
| a spelling in Go or in a door names the folder, and points at no owner | the language server, the index door, the session door |
| a case covers each moved writer but one, so the one that drifts passes green | the session file |

The fix for the class: no caller spells the folder. A module that imports takes the name from `folders.js`. A module that imports none of it carries the name with a comment naming that module, the way this tree already marks a forced copy. Every name the module owns then carries a case, so the next drift fails the check.

One finding stands outside the class: the change commit tracks a built binary. The fix is the ignore rule beside the one the language server's binary already carries.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches no file the ask leaves out: each one names a path under the private folder
- every door the change reaches has a fake: the tree rule runs over a fake tree
- a comment names the approach: every forced copy names the module owning it, beside the copy

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->

<!-- the form is command -->

./RUNME.sh lint

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches no file the ask leaves out: each one names a path under the private folder
- every door the change reaches has a fake: the tree rule runs over a fake tree
- a comment names the approach: every forced copy names the module owning it, beside the copy

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

./RUNME.sh branch test

### check

<!-- the check is green on the commit -->

<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

The private folder held three kinds of file under one name. It now holds two named folders, and `.claude/skills/level0/lib/folders.js` owns both names. Every writer of a file the box alone reads takes its folder from there.

| what moves | where it stands |
|---|---|
| the worktree, the journal, the binaries, the survey, the log, the box record, the hold | under the runtime folder |
| the pulled answers, the check's stamp, the rows, the standing files, the session | under the runtime folder |
| the notes, the handover, the private tickets, the vehicle records, the local config | where they stand |

The index walk drops the private folder from its skip list. It skips the runtime folder in its place. The skip reads the path the root holds, because a folder of that name stands elsewhere in the tree. A word standing in a private note alone now comes back from a `find`. The rows carry no binary, and no second copy of a tracked file.

The installer moves a box's old places over once, and drops what already stands in the new one. Without it, a box built before this change hands the walk the binaries and the journal it skips today.

A module that imports takes the name from the owner. A module that imports none of it carries the name with a comment naming the owner beside the copy. The `PrivateFolderOwned` rule refuses a spelling that names neither, so the next drift fails the check in place of passing green.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches no file the ask leaves out: each one names a path under the private folder
- every door the change reaches has a fake: the tree rule runs over a fake tree
- a comment names the approach: every forced copy names the module owning it, beside the copy

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->

<!-- the form is files -->

- .claude/skills/level0/hooks/level0.js
- .claude/skills/level0/lib/copilot-setup.js
- .claude/skills/level0/lib/folders.js
- .claude/skills/level0/lib/index.js
- .claude/skills/level0/lib/log.js
- .claude/skills/level0/lib/private.js
- .claude/skills/level0/lib/review.js
- .claude/skills/level0/lib/runs.js
- .claude/skills/level0/lib/servers.js
- .claude/skills/level0/lib/tools.js
- .claude/skills/level0/lib/tree.js
- .claude/skills/level0/lib/undo.js
- .claude/skills/level0/lib/voice.js
- .claude/skills/level1/hooks/level1.js
    - .gitignore
- .vale.ini
- .vscode/settings.json
- HANDOVER.md
- spec/config/styles/VoiceParagraph/Vocabulary.yml
- spec/design_input/the-agent-pulls-tickets.md
- spec/design_input/the-runtime-files-stand-apart.md
- spec/design_input/the-warnings-feed-a-refactorer.md
- spec/design_output/apply.md
- spec/design_output/copilot.md
- spec/design_output/editor.md
- spec/design_output/extension.md
- spec/design_output/index.md
- spec/design_output/level0.md
- spec/design_output/log.md
- spec/design_output/private.md
- spec/design_output/pull.md
- spec/design_output/review.md
- spec/design_output/stop.md
- spec/design_output/tools.md
- spec/design_output/tree.md
- spec/design_output/viewer.md
- spec/design_output/work.md
- spec/guidance/cloud.md
- spec/guidance/review/reviewing.md
- spec/guidance/tickets.md
- spec/guidance/working.md
- spec/tickets/a-pointer-names-its-heading.md
- spec/tickets/a-rule-carries-its-side.md
- spec/tickets/a-write-meets-its-hash.md
- spec/tickets/apply-lane-carries-a-hand.md
- spec/tickets/one-function-answers-the-hand.md
- spec/tickets/release-keeps-local-commits.md
- spec/tickets/the-hook-spawns-a-refactorer.md
- spec/tickets/the-one-answer-takes-shape.md
- spec/tickets/the-panel-draws-every-file.md
- spec/tickets/the-retro-runs.md
- spec/tickets/the-rule-shares-one-slug.md
- spec/tickets/the-runtime-files-stand-apart.md
- spec/tickets/the-warnings-feed-a-refactorer.md
- spec/vocabulary/terms.yml
- src/bridge/config.js
- src/bridge/server.js
- src/bridge/stop.js
- src/doors/session.js
- src/extension/editor-files.js
- src/extension/editor-process.js
- src/extension/editor.js
- src/extension/extension.js
- src/extension/lib/lsp.js
- src/index/door.go
- src/index/grep_test.go
- src/index/index.go
- src/index/index_test.go
- src/index/main.go
- src/index/watch.go
- src/lsp/schema-body.go
- src/lsp/schema.go
- src/lsp/serve.go
- src/lsp/tree.go
- src/lsp/tree_test.go
- src/scripts/cli-check.js
- src/scripts/cli-doors.js
- src/scripts/cli-read.js
- src/scripts/cli.js
- src/scripts/copilot.js
- src/scripts/guidance-hand.js
- src/scripts/hand.js
- src/scripts/install.sh
- src/scripts/pull-chapter.js
- src/scripts/pull-hand.js
- src/scripts/pull-route.js
- src/scripts/pull-writes.js
- src/scripts/pull.js
- src/scripts/review.js
- src/scripts/ticket.js
- src/scripts/tools.js
- src/scripts/tui.js
- src/scripts/viewer.js
- src/scripts/work-merge.js
- src/scripts/work-stands.js
- src/scripts/work.js
- src/stub/.claude/skills/level0/hooks/bridgehead.js
- test/contract/cloud-start.test.js
- test/contract/pull-payload.test.js
- test/contract/tree.test.js
- test/level0/answer.test.js
- test/level0/apply.test.js
- test/level0/ask-lint.test.js
- test/level0/bash.test.js
- test/level0/bridgehead.test.js
- test/level0/clicks.test.js
- test/level0/code-door.test.js
- test/level0/config.test.js
- test/level0/copilot-dispatch.test.js
- test/level0/copilot-runtime.test.js
- test/level0/copilot-setup.test.js
- test/level0/editor.test.js
- test/level0/folders.test.js
- test/level0/gesture.test.js
- test/level0/group.test.js
- test/level0/guidance-hand.test.js
- test/level0/guidance.test.js
- test/level0/hand.test.js
- test/level0/hooks.test.js
- test/level0/index.test.js
- test/level0/layer.test.js
- test/level0/level1.test.js
- test/level0/log.test.js
- test/level0/lsp.test.js
- test/level0/names.test.js
- test/level0/panel.test.js
- test/level0/paths.test.js
- test/level0/person-step.test.js
- test/level0/prepush.test.js
- test/level0/private.test.js
- test/level0/process.test.js
- test/level0/projection.test.js
- test/level0/pull-doors.js
- test/level0/pull-leaves.test.js
- test/level0/pull-steps.test.js
- test/level0/pull.test.js
- test/level0/reload.test.js
- test/level0/review.test.js
- test/level0/schema-notes.js
- test/level0/schema-route.test.js
- test/level0/schema-slots.test.js
- test/level0/schema-sweep.test.js
- test/level0/schema.test.js
- test/level0/serve.test.js
- test/level0/session-layer.test.js
- test/level0/sidebar.test.js
- test/level0/states.test.js
- test/level0/stop-door.test.js
- test/level0/stop-hold.test.js
- test/level0/stop.test.js
- test/level0/stub.test.js
- test/level0/ticket-verb.test.js
- test/level0/ticket.test.js
- test/level0/todo.test.js
- test/level0/tools-door.test.js
- test/level0/tools.test.js
- test/level0/trunk.test.js
- test/level0/unblock.test.js
- test/level0/vehicle.test.js
- test/level0/verbs.test.js
- test/level0/viewer.test.js
- test/level0/voiceverb.test.js
- test/level0/work-doors.js
- test/level0/work-group.test.js
- test/level0/work.test.js

## verdict

<!-- pass or fail, findings one a line -->

<!-- the form is verdict -->

fail

- The four fixes the last verdict named land, and `./RUNME.sh check` answers 0.
- `./RUNME.sh branch test` answers green, and `./RUNME.sh branch review` answers nothing to fix.
- The walk covers the private folder, and a word in a private note comes back from a find.
- The runtime half stands outside the rows, so the box record comes back from no find.
- `PrivateFolderOwned` refuses an unowned spelling of the new folder, which I fed it and watched refuse.
- The commit tracks no built binary, and the rule hiding it stands beside the language server's own.
- `src/bridge/stop.js` reads the hold under the old folder, so `holdStands` answers false on every box.
- `PrivateFolderOwned` passes a spelling of the old folder, which I fed it and watched pass.
- No case holds `src/bridge/stop.js` against the hold folder `folders.js` owns.
- No note under `spec/design_output` names either new folder, so the placement rule stands in code alone.
- Every design note naming a moved file names its old place.
- `spec/design_output/private.md` owns the private half, and its table still sends a reader to the old log.
- `spec/guidance/working.md` sends every agent to the tools file at its old place.
- `level0.js` and `level1.js` name the owner beside the session path, and no case holds them against `hand.js`.
- `RETRO` stands exported and tested, and the branch writes under it nowhere.
- No retro stands in the handover, and the group writes one at its own hand-back.
- The rest of the branch serves the group's other children, and redesigns nothing this ask holds.

The fixes:

- Take the hold path in `src/bridge/stop.js` from `folders.js`, and cover it with a case.
- Make `PrivateFolderOwned` refuse a spelling of the old folder, so the next such reader fails.
- Hold the session spellings in `level0.js` and `level1.js` against `hand.js` in a case.
- Name the two folders and the placement rule in `spec/design_output/private.md`, and point the other notes there.
- Point every note naming a moved file at its new place. A grep for the old folder over `spec` names them.
- Fix `spec/guidance/working.md` first, because every agent reads it at its start.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- one place holds each fact the change adds: `folders.js` owns the two names. Every JavaScript writer reads them off it. The Go, the shell and the plugin copies name that owner beside the copy. No note carries the fact at all. The notes still carry the old places, so the prose copy is wrong.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
