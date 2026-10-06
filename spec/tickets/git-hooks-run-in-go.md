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
group: javascript-leaves
step: implement/change
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box fb4ccb7cacc7 · claude-code-remote
    hash_before: af12ed6a879723291bba68d79666c8aaaf615eed
    hash_after: af12ed6a879723291bba68d79666c8aaaf615eed
    inputs:
      - name: ask
        hash: e2dfc6797d0ea176
        size: 507
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box fb4ccb7cacc7 · claude-code-remote
    hash_before: d3a14c4637a8e94dd84d9a83dd5dd377d0aa6000
    hash_after: d3a14c4637a8e94dd84d9a83dd5dd377d0aa6000
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/quack fails
    inputs:
      - name: design/draft
        hash: c992789f728d4f06
        size: 5765
    def: 08e16d07b0de477c
  - step: gate
    hand: box fb4ccb7cacc7 · claude-code-remote · helper-4
    hash_before: 0ef74deab922eec9b7aad93e26cf151883363095
    hash_after: 0ef74deab922eec9b7aad93e26cf151883363095
    inputs:
      - name: design/draft
        hash: c992789f728d4f06
        size: 5765
      - name: design/tests-red
        hash: 7e42663b12491bc4
        size: 962
    def: dc4904ab364efa10
---

# Ask

The git hooks run the Go binary, so a commit and a push need no Node, and the pre-push road stops loading the work scripts.

`.githooks/pre-push` keeps `work-free.js`, and through it the whole work cluster, loaded.

- `git ls-files src/scripts/precommit.js src/scripts/prepush.js` answers nothing
- `git grep -n node -- .githooks` answers nothing
- `go test ./src/quack/...` passes a test of each refusal the pre-commit and pre-push hooks gave, through the hook verb
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

One verb, `se-index hook <event>`, answers both git hooks, and `copilot-hooks-run-in-go` adds its Copilot events to the same verb later. This ticket lands the git events alone.

1. `.githooks/pre-commit` and `.githooks/pre-push` run `"$here/.se/.runtime/bin/se-index" verb "$here/src/scripts" hook <event>`, passing stdin on. They exit 0 where no binary stands, as they exit 0 today where no node stands. No line names node.
2. `src/quack/hook_verb.go` registers `hook`, reads the event word, builds the hooks `Door` over the real git and disk, and prints the refusal to stderr with exit 1, or exits 0.
3. `src/modules/hooks/githooks.go` holds `PreCommit(root, settings)` and `PrePush(root, refs, settings)`. Each runs the rules `precommit.js` and `prepush.js` hold, in their order.
4. pre-commit: the marker opener on an added line (new `command.MarkedIn` and `command.RefusedMarker` in `src/modules/hooks/command/markers.go`), then the private delta, then the tested delta. `privateDelta` and `testedDelta` in `commits.go` lose their `CommitIn` gate to `commitGuards`, so the Bash door and the hook run one body.
5. pre-push, over the refs on stdin: a deleted version branch (`command.VersionRefusal`, the text `VersionGuard` builds, now fed by ref), a cloud push to trunk (`command.CloudLeavesTrunk`), a red battery on trunk (`command.Battery` and `command.RedBattery`), an unchecked tip (the stamp's sha, or its descendant where only `spec/tickets` changed since, and skipped where `.github/workflows/check.yml` stands), a work branch another box holds, a stale hold a plain push leaves in place, and a todo tag in the pushed range (the `todoOnPush` body, fed by a range in place of `HEAD --not --remotes`).
6. The battery, unchecked, hold and stale rules run for an agent's push alone: `SE_ENGINE=1`, a cloud box, or `CLAUDECODE`. The owner's own terminal pushes ungated, as `agentPushes` holds it today.
7. The hold and its age come off `src/branches`: `heldIn` gains an exported `branches.HandIn(text) string`, and the stale span gains `branches.StaleSpan(config)` beside `staleSpan`. The hooks module imports branches, and branches imports no hooks package but `brief`, so no cycle forms.
8. `src/scripts/precommit.js`, `src/scripts/prepush.js`, `test/level0/precommit.test.js`, `test/level0/prepush.test.js` and `test/level0/warnings.test.js` leave. `lintedBy` leaves with them, since only a test calls it.

Weighed: one Go body for each rule over two doors, against a second copy in the hook. Assumed: the binary on the box stands built from this tree, as `RUNME.sh` assumes it already.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- .githooks/pre-commit: the hook body, calls precommit.js
- .githooks/pre-push: the hook body, calls prepush.js
- test/level0/precommit.test.js: imports holds, merging, boxOf, notesOf
- test/level0/prepush.test.js: imports holds, refsIn and the readers
- test/level0/warnings.test.js: imports holds, refsIn
- test/contract/outside-in-doors.test.js: lists both scripts
- src/modules/hooks/commits.go: commitGuards, calls privateDelta, testedDelta, todoOnPush
- src/modules/hooks/command/guards.go: VersionGuard, whose refusal text the ref road shares
- src/branches/group.go: heldIn, which HandIn wraps
- src/branches/free.go: staleSpan, which StaleSpan serves
- src/quack/doctor_verb.go: hooksFolder, whose comment names precommit.js as the owner
- spec/design_output/private.md: the table row and test line naming precommit.js
- spec/design_output/migration.md: the row naming precommit.js and prepush.js

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/quack/hook_verb_test.go: TestHookPreCommitRefusesAMarker
- src/quack/hook_verb_test.go: TestHookPreCommitRefusesAPrivateDelta
- src/quack/hook_verb_test.go: TestHookPreCommitRefusesAnUntestedChange
- src/quack/hook_verb_test.go: TestHookPreCommitPassesACleanDelta
- src/quack/hook_verb_test.go: TestHookPrePushRefusesAVersionDelete
- src/quack/hook_verb_test.go: TestHookPrePushRefusesACloudPushToTrunk
- src/quack/hook_verb_test.go: TestHookPrePushRefusesARedBatteryOnTrunk
- src/quack/hook_verb_test.go: TestHookPrePushRefusesAnUncheckedTip
- src/quack/hook_verb_test.go: TestHookPrePushRefusesABranchAnotherBoxHolds
- src/quack/hook_verb_test.go: TestHookPrePushRefusesAPlainPushOntoAStaleHold
- src/quack/hook_verb_test.go: TestHookPrePushRefusesATodoTag
- src/quack/hook_verb_test.go: TestHookPrePushLetsTheOwnersTerminalThrough
- src/quack/hook_verb_test.go: TestHookPrePushLetsARedWorkBranchThroughUnderCI
- src/quack/hook_verb_test.go: TestGitHooksNameNoNode, for the git grep line
- src/quack/hook_verb_test.go: TestHookScriptsLeave, for the git ls-files line

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- .githooks/pre-commit
- .githooks/pre-push
- src/quack/hook_verb.go
- src/quack/hook_verb_test.go
- src/modules/hooks/githooks.go
- src/modules/hooks/commits.go
- src/modules/hooks/command/markers.go
- src/modules/hooks/command/guards.go
- src/modules/hooks/command/trunk.go
- src/branches/group.go
- src/branches/free.go
- src/quack/doctor_verb.go
- src/scripts/precommit.js
- src/scripts/prepush.js
- test/level0/precommit.test.js
- test/level0/prepush.test.js
- test/level0/warnings.test.js
- test/contract/outside-in-doors.test.js
- spec/design_output/private.md
- spec/design_output/migration.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- opened .githooks/*, precommit.js, prepush.js, commits.go, command/{private,tested,todo,trunk,guards}.go, branches/{group,free,held}.go, push.go, RUNME.sh and runs.js, and checked each name there
- the callers come off a git grep over both script names and the Go functions the approach changes
- each done_when line maps to a test: ls-files to TestHookScriptsLeave, the node grep to TestGitHooksNameNoNode, each refusal to its TestHook case, and the check to ./RUNME.sh check at tests-green

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/quack/hook_verb_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/quack/hook_verb_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Eleven refusal cases and the two tree cases fail on their own assertion against a stub verb that exits 0. The owner's terminal case and the clean delta case pass already, since the stub refuses nothing. The tests run real git in a temporary repository with a bare origin, as the push and commit verb tests do, and the clock comes in through the doors, so a stale hold needs no faked commit date. A treeRoot constant already stood in codec_test.go, and the tree cases take it.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each done_when line meets a red test: ls-files in TestHookScriptsLeave, the node grep in TestGitHooksNameNoNode, each refusal in its TestHook case, and the check at tests-green, where the hand answers it
- git runs real in a temporary repository, the way the landing tests reach it, and the clock, the environment and stdin each come in as a door the test sets

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- hook-markers-reuse-land-check: the approach adds a fourth Go marker scan as command.MarkedIn and command.RefusedMarker, beside markedIn and mergeRefusal in src/branches/land.go, stagedFault in src/pull/pull_landed.go and mergeRefusal in src/quack/commit.go. The hooks module imports branches under item 7 anyway, so export the branches pair and call it, and drop src/modules/hooks/command/markers.go from the size.
- hook-holds-gate-every-push: item 6 gates the hold and stale rules on an agent's push and says agentPushes holds it so today, but prepush.js gates the battery and unchecked rules alone on engine, and runs the hold, stale, cloud-trunk and todo rules for every push. Keep the hold and stale rules ungated, and add a case where the owner's terminal meets a held branch.
- hook-finds-the-exe-binary: both hooks name .se/.runtime/bin/se-index alone, while RUNME.sh takes se-index.exe first where it stands. Mirror that line in each hook, so a Windows desk keeps its gate.
- vale-drops-hook-scripts: .vale.ini carries a glob naming precommit and prepush, a caller the callers list misses. Drop both names from that glob when the scripts leave.

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
