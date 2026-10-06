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
    hash_before: c69d3825b31fdb27b0ea907b43b03383c501f675
    hash_after: c69d3825b31fdb27b0ea907b43b03383c501f675
    inputs:
      - name: ask
        hash: 7cb116066181fffb
        size: 407
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box fb4ccb7cacc7 · claude-code-remote
    hash_before: 3b2dfa04ec460911ce6f0ea5509dc618e5f6299c
    hash_after: 3b2dfa04ec460911ce6f0ea5509dc618e5f6299c
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/quack fails
    inputs:
      - name: design/draft
        hash: 71b107baaebbbb4d
        size: 3908
    def: 08e16d07b0de477c
  - step: gate
    hand: box fb4ccb7cacc7 · claude-code-remote · helper-4
    hash_before: 98e8b9acc6e1fd47bc833fb636eedf5c1ed1f298
    hash_after: 98e8b9acc6e1fd47bc833fb636eedf5c1ed1f298
    inputs:
      - name: design/draft
        hash: 71b107baaebbbb4d
        size: 3908
      - name: design/tests-red
        hash: 345c545bd2b0dce5
        size: 996
    def: dc4904ab364efa10
---

# Ask

A session starts through the Go binary or the install script, and no start road imports a door or the hook module from `src/scripts`.

The session start keeps `boot.js` and the disk and process doors in the tree.

- `git ls-files src/scripts/boot.js` answers nothing
- `git grep -n "src/scripts/boot" -- .claude src` answers nothing
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

1. src/scripts/install.sh gains a boot word, read right after bin is set and before the runtime folder moves.
2. The boot word exits 0 where neither CLAUDE_CODE_REMOTE nor SE_CLOUD is set.
3. It exits 0 where the plugin manifest stands, at the path pluginTarget in src/quack/brand.go names.
4. Otherwise it runs the install under the session skip list plus the caller's SE_INSTALL_SKIP.
5. It answers 0 whatever that install answers, so a failed install holds no session up.
6. Its comments name no node, since test/contract/install.test.js refuses that word in install.sh.
7. The SessionStart hook in .claude/settings.json runs `sh install.sh boot` under the project folder, and keeps its timeout.
8. The hooks comment in .claude/settings.json names the boot word.
9. src/scripts/boot.js goes, the only start road importing the hook module and the doors.
10. src/doors/disk.js and src/doors/proc.js stay, since many scripts and tests still import them.
11. test/level0/hooks.test.js drops its boot and settings cases, and its other cases stay.
12. src/quack/session_start_test.go carries those cases in Go and runs the real install.sh in a temporary tree.
13. spec/design_output/level0.md names the boot word under The boot hook.
Weighed: a Go boot verb needs a binary a fresh clone lacks, so install.sh holds the boot.
Weighed: a separate boot script fails the second grep line, so the boot rides install.sh as a word.
Weighed: the skip list stands in install.sh too, and a Go test pins it to installSkip in probe_cold.go.
Assumed: the ask's line on keeping boot.js and the doors names today's cause, and binds the change to nothing.
Assumed: start.js keeps INSTALL_SKIP and STARTING until level0-hooks-forward-to-go moves them.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- .claude/settings.json: the SessionStart hook
- .claude/settings.json: the hooks comment
- test/level0/hooks.test.js: imports boots, INSTALL_SKIP and STARTING
- spec/design_output/level0.md: The boot hook
- src/scripts/install.sh: its top level, gains the boot word
- RUNME.sh: runs install.sh with no word, unchanged
- src/quack/probe_cold.go: coldTree runs install.sh with no word, and installSkip pins the boot list
- src/quack/brand.go: pluginTarget names the manifest the boot word reads
- src/quack/commit.go: coldPath lists install.sh
- test/contract/install.test.js: refuses node in install.sh
- .claude/skills/level0/hooks/start.js: INSTALL_SKIP and STARTING stay for the forwarder sibling

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/quack/session_start_test.go: TestNoTrackedFileNamesTheNodeBoot
- src/quack/session_start_test.go: TestTheSessionStartHookRunsTheInstallBootWord
- src/quack/session_start_test.go: TestTheBootHookWaitsOutTheStartSpan
- src/quack/session_start_test.go: TestTheBootRunsNoInstallWhereTheManifestStands
- src/quack/session_start_test.go: TestTheBootRunsNoInstallOffACloudBox
- src/quack/session_start_test.go: TestTheBootRunsTheInstallOnACloudBoxLackingTheManifest
- src/quack/session_start_test.go: TestTheBootRunsTheInstallOnABoxSECloudMarks
- src/quack/session_start_test.go: TestTheBootAnswersZeroWhereTheInstallFails
- src/quack/session_start_test.go: TestTheBootSkipsWhatTheColdProbeSkips
- src/quack/session_start_test.go: TestTheBootReadsTheManifestTheBrandWrites

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/scripts/boot.js
- src/scripts/install.sh
- .claude/settings.json
- test/level0/hooks.test.js
- src/quack/session_start_test.go
- spec/design_output/level0.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- a helper opened boot.js, settings.json, hooks.test.js, install.sh, start.js, probe_cold.go, commit.go, brand.go and level0.md, and I checked the hook line, installSkip, pluginTarget and the doors' other importers
- the callers come off a git grep for boot, SessionStart, INSTALL_SKIP, STARTING, install.sh and the door imports
- TestNoTrackedFileNamesTheNodeBoot decides lines one and two, a live probe cold line three, and a live check line four

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/quack/session_start_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/quack/session_start_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

All ten tests fail on their own assertion, and the test file stands alone in the change.

- Each install case copies install.sh into a short temporary tree, with a fake index that writes down the skip list it meets.
- The environment builds from nothing, because this box sets CLAUDE_CODE_REMOTE and would read as a cloud box.
- install.sh ignores its words today, so the two cases running the install first check the word is read, or they pass for the wrong reason.
- The start span comes off STARTING in start.js, which Go holds no constant for. The forwarder sibling moves it, and this test then needs a new source.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- TestNoTrackedFileNamesTheNodeBoot fails on lines one and two, a live probe cold answers line three, and a live check line four
- the install runs against a fake index in a temporary tree, with every want skipped, so no case reaches the network

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- boot-span-outlives-start-js: TestTheBootHookWaitsOutTheStartSpan in src/quack/session_start_test.go reads STARTING out of .claude/skills/level0/hooks/start.js, and level0-hooks-forward-to-go deletes start.js with no callers line for this test, so the test reads the start span from wherever the forwarder lands it in Go

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
