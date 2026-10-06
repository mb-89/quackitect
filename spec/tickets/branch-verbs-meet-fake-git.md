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
group: unfaked-doors-take-fakes
depends_on: pull-meets-fake-git
step: design/tests-red
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box e97c7a20bbd2 · claude-code-remote
    hash_before: 5a68abe1b8213189dc9b2d0bdfd4abdaa850de85
    hash_after: 366b69287c1f89c454b00a6b99517bd102cd0a16
    returns: 1
    why: the branch verbs run some twenty-seven git subcommands, pushes, merges and worktrees among them, and FakeGit holds four reads, so the move waits on git-and-process-doors-designed in unfaked-doors-take-fakes
  - step: design/draft
    hand: box e97c7a20bbd2 · claude-code-remote · helper-11
    hash_before: 6ccfbf9698e86cbd9a84d1626c28bb9b41760204
    hash_after: 6ccfbf9698e86cbd9a84d1626c28bb9b41760204
    inputs:
      - name: ask
        hash: de20b0a5f70293da
        size: 575
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box e97c7a20bbd2 · claude-code-remote
    hash_before: 2fd1cd2681bf683029393a04ba6bad006741f98e
    hash_after: 2fd1cd2681bf683029393a04ba6bad006741f98e
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/branches fails
    inputs:
      - name: design/draft
        hash: 633272e4648e13cc
        size: 8721
      - name: [[spec/design_output/doors]]
        hash: 8f2f939387c0fe86
        size: 17697
    def: 08e16d07b0de477c
  - step: gate
    hand: box e97c7a20bbd2 · claude-code-remote · helper-5
    hash_before: 41fc7b0e818feb44683f1939cb36008b4fb98742
    hash_after: 41fc7b0e818feb44683f1939cb36008b4fb98742
    inputs:
      - name: design/draft
        hash: 633272e4648e13cc
        size: 8721
      - name: design/tests-red
        hash: 8a0ced81fe1fc8ae
        size: 922
      - name: [[spec/design_output/doors]]
        hash: 8f2f939387c0fe86
        size: 17697
    def: dc4904ab364efa10
  - step: implement/change
    hand: box e97c7a20bbd2 · claude-code-remote
    hash_before: 054e2cf47eefae271de2c866f0dcea81aa337475
    hash_after: 054e2cf47eefae271de2c866f0dcea81aa337475
    answered:
      - name: lint
        exit: 0
        said: "test/level0/work-stands.test.js:16:1: correctness/noUnusedImports: Several of these imports are unused."
    def: f150b8c0dc20fe45
  - step: design/tests-red
    hand: the engine
    stale: [[spec/design_output/doors]]
  - step: gate
    hand: the engine
    stale: [[spec/design_output/doors]]
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
The branch verbs test in memory, beside every other case, and a slow box slows the git door test alone.

<!-- breaks, as text: what breaks if it is never done -->
Each branch verb case builds a bare origin and a clone through real git, so a loaded box turns the cases red, and each case costs the battery real seconds.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- the cases in `src/branches/tree_test.go`, `src/branches/dispatch_test.go` and `src/branches/dispatch_write_test.go` run on `FakeGit` and a fake process, and spawn no git
- the branch verbs row of the family table in `spec/design_output/doors.md` names them as moved
- `./RUNME.sh check` stands green

<!-- view, as text: the view the owner reads the change in and the number there, in the owner's words, or none -->
none

<!-- from, as text: handover where the ask comes off a handover line, so the owner reads it first, or none -->
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

The branch verbs take the three doors [[spec/design_output/doors#the-git-door-carries-writes]] names, and the tree fixture moves onto their fakes, so every case in src/branches runs in memory.

- Doors in src/branches/doors.go gains Repo (git.Repo), Run (proc.Runner) and Disk (files.Disk). git, quiet, loud and batch call Repo's typed operations in place of an argv. rawEnv, run, raw and verb call Run with a proc.Command. exists, read, write, remove, names, filesUnder, link, unlink and readFile go through Disk. src/quack/branch.go fills the real three: git.NewRepo over the work root, proc.Real, files.NewDisk.
- Repo and FakeRepo arrive with move 1, pull-meets-fake-git, and moves 2 and 3 grow them. This move adds the operations the branch verbs run that the doors chapter's table lacks, each with a contract case on both sides: a commit off a tree onto a parent that moves no ref (commit-tree in take.go openGroup), the commits a trunk carries by patch (cherry in merge.go), the refs origin holds under a prefix (ls-remote in merge.go), a path restored from HEAD (checkout -- in take.go), and many files at refs in one ask (cat-file --batch in doors.go batch). The chapter's operations table gains those rows.
- files.Disk gains List, every file under a folder as slash paths, and Link, a path aliased under another. The real disk lists by a walk and links by a symlink, the fake keeps an alias. Both gain contract cases in disk_contract_test.go. The review verb's worktree stands under the work root, so its links stay inside Disk.
- The tree fixture in tree_test.go builds an origin FakeRepo and a clone FakeRepo over a FakeDisk, and a FakeRunner taught `false` for Runme, plus `go`, `node` and the se-index binary where a case of the test and review verbs needs them, each answering canned output. It teaches the runner no `git`, so a git spawn answers NotStarted and turns the case red. land, branch, write and read call FakeRepo and FakeDisk. Each case's own one.git argv becomes the Repo read it asks: rev-parse a ref resolved, rev-list --count ahead and behind, show a file at a ref, log the log over a range, worktree list the worktrees.
- The fixture serves every test file in the package, so the move covers the package, past the three files the guard names today. The family table drops the branch verbs row, and the door table's branch verbs row names Repo, the Runner and FakeDisk.

The fake merges a path whole where git merges hunks. A case in merge_test.go or port_d_sync_test.go needing a merge of lines moves into repo_contract_test.go as a door case.

Assumption: the done_when line naming FakeGit reads as FakeRepo, since the chapter retires FakeGit once its cases move. Weighed and refused: a FakeRunner `git` program that reads argv over FakeRepo. It leaves the verbs untouched, but it grows a second git inside the fake, which the chapter's typed Repo exists to avoid. Cost of the route taken: every verb file and every fixture file changes in one move, so implement/change lands the doors first, then the fixture, then the cases a file at a time, green after each. Implement waits on pull-meets-fake-git landing Repo and FakeRepo in code.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/quack/branch.go branchDoors, which builds Doors for the branch, dispatch and cloud verbs
- src/branches/doors.go fetch here head quiet loud git batch run raw rawEnv verb exists read write remove names filesUnder link unlink readFile methodAt
- src/branches/dispatch_write.go land opens processAt remoteRows schemas writeState
- src/branches/done.go finish leaves ready
- src/branches/escalate.go escalate inserted journaled landed landedAll pushed takenOf tried
- src/branches/fix.go addedHere
- src/branches/free.go stuckIn
- src/branches/guidance.go alwaysOn guidanceText stepNotes
- src/branches/hand.go boxIDHere boxOf handOf holdOf
- src/branches/held.go heldHere letGo
- src/branches/land.go landedAlone stagedFault
- src/branches/merge.go checkSays closeVerb conflicted filed installs marks marksTrunk merge mergeCloud movedOnTrunk pullCarrying
- src/branches/review.go checkOn firstCommit gather refFor show
- src/branches/route.go closedHere
- src/branches/stands.go baseOnTrunk branchesIn mergedHere notesIn parkedHere pathsIn readWork refsHere standingIn textAt ticketsOn unpushed
- src/branches/sync.go frontSettles ownIn settles sync unmerged
- src/branches/take.go claimGroup markOff onBranch openGroup parkedFiles standsOpen
- src/branches/test.go changedFiles goTestNames putBack redTest setAside sinceOf testVerb
- src/branches/unblock.go noteAt unblock
- src/branches/tree_test.go newTree desk sh git write land branch read, the fixture every test file in the package calls
- src/modules/files/disk.go Disk, whose implementers disk and FakeDisk gain List and Link

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/branches/doors_test.go TestATakeAndADispatchRunOnTheFakesAndSpawnNoGit
- src/modules/git/repo_contract_test.go TestRepoCommitsATreeOntoAParentAndMovesNoRef
- src/modules/git/repo_contract_test.go TestRepoNamesTheCommitsATrunkCarriesByPatch
- src/modules/git/repo_contract_test.go TestRepoListsTheRefsOriginHoldsUnderAPrefix
- src/modules/git/repo_contract_test.go TestRepoRestoresAPathFromHead
- src/modules/git/repo_contract_test.go TestRepoReadsManyFilesAtRefsInOneAsk
- src/modules/files/disk_contract_test.go TestDiskListsEveryFileUnderAFolder
- src/modules/files/disk_contract_test.go TestDiskLinksAPathAndTheUnlinkLeavesItsTarget
- src/imports/clock_test.go TestEveryTestWaitingOnTheBoxStandsInTheDoorAudit, standing, decides done_when lines one and two once the family row leaves

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/branches/dispatch_write.go
- src/branches/done.go
- src/branches/doors.go
- src/branches/escalate.go
- src/branches/fix.go
- src/branches/free.go
- src/branches/guidance.go
- src/branches/hand.go
- src/branches/held.go
- src/branches/land.go
- src/branches/merge.go
- src/branches/review.go
- src/branches/route.go
- src/branches/stands.go
- src/branches/sync.go
- src/branches/take.go
- src/branches/test.go
- src/branches/unblock.go
- src/branches/branch_test.go
- src/branches/dispatch_fire_test.go
- src/branches/dispatch_test.go
- src/branches/dispatch_write_test.go
- src/branches/done_test.go
- src/branches/doors_test.go
- src/branches/escalate_test.go
- src/branches/free_test.go
- src/branches/guidance_test.go
- src/branches/held_test.go
- src/branches/list_test.go
- src/branches/merge_test.go
- src/branches/port_a_close_test.go
- src/branches/port_a_fixtures_test.go
- src/branches/port_a_leave_test.go
- src/branches/port_a_rows_test.go
- src/branches/port_a_take_test.go
- src/branches/port_a_usage_test.go
- src/branches/port_b_fixtures_test.go
- src/branches/port_b_group_test.go
- src/branches/port_b_take_test.go
- src/branches/port_b_waits_test.go
- src/branches/port_c_done_test.go
- src/branches/port_c_fix_test.go
- src/branches/port_c_fixtures_test.go
- src/branches/port_c_held_test.go
- src/branches/port_d_desk_test.go
- src/branches/port_d_list_test.go
- src/branches/port_d_orphan_test.go
- src/branches/port_d_stands_test.go
- src/branches/port_d_switch_test.go
- src/branches/port_d_sync_test.go
- src/branches/port_e_helpers_test.go
- src/branches/port_e_marker_test.go
- src/branches/port_e_open_test.go
- src/branches/port_f_escalate_test.go
- src/branches/port_f_guidance_test.go
- src/branches/port_f_review_test.go
- src/branches/port_f_testverb_test.go
- src/branches/port_f_unblock_test.go
- src/branches/review_test.go
- src/branches/sync_test.go
- src/branches/take_test.go
- src/branches/test_test.go
- src/branches/tree_test.go
- src/branches/unblock_test.go
- src/quack/branch.go
- src/modules/git/repo.go
- src/modules/git/repo_contract_test.go
- src/modules/files/disk.go
- src/modules/files/disk_contract_test.go
- spec/design_output/doors.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file, function and verb the approach names stands opened: doors.go Doors and its methods, tree_test.go newTree, quack/branch.go branchDoors, proc.go Runner and FakeRunner, files/disk.go Disk and FakeDisk, git.go FakeGit, imports/clock.go UnauditedWaits, and the commit-tree, cherry, ls-remote, checkout and cat-file call sites; Repo and FakeRepo stand in the doors chapter alone, so their operations come off its table
- the callers list comes off a scan of every function in src/branches calling a door method that changes, beside branchDoors in src/quack and the Disk implementers
- done_when one and two: TestEveryTestWaitingOnTheBoxStandsInTheDoorAudit fails once the family row leaves while a fixture still calls exec, and TestATakeAndADispatchRunOnTheFakesAndSpawnNoGit fails where a verb reaches git through a runner taught no git; done_when three: ./RUNME.sh check

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/branches/doors_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/modules/git/repo_contract_test.go
- src/modules/files/disk_contract_test.go
- src/branches/doors_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The five new Repo cases fail on all three arms against stubs, and the disk link case fails under the contract tag. The guard in src/branches/doors_test.go fails while three test files call exec and the doors chapter lists them. The other branch test files reach git through the shared tree fixture, which the guard cannot see, so implement moves that fixture too. RemoteHeads answers names alone, so the hand-back of a pull ref needs RemoteRefs with hashes.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

done_when one and two meet TestTheBranchVerbCasesSpawnNothingAndTheDoorsChapterListsThemNowhere, red now; done_when three is the check
the doors the tests reach are git, the disk and the process door, and FakeRepo, FakeDisk and FakeRunner stand for each

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- fixture-spawn-guard-runs-live: TestTheBranchVerbCasesSpawnNothingAndTheDoorsChapterListsThemNowhere reads test files for exec.Command and time.Sleep alone, so a tree fixture filling Doors with git.NewRepo or proc.Real passes it and still spawns git through repo.go; done_when one wants the runtime case the draft named, TestATakeAndADispatchRunOnTheFakesAndSpawnNoGit, a take and a dispatch over a FakeRunner taught no git, which tests-red left out

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change touches the files the draft size names; it departs by adding fourteen Repo operations the verbs needed, each with its contract case, and the runtime spawn case the gate point asked for
every door the change reaches has a fake: FakeRepo for git, FakeRunner for the processes, FakeDisk for the disk
each changed door file points at the git door section of spec/design_output/doors.md, which names the approach
the git operations stand once, in src/modules/git/repo.go, and the doors chapter names them in its operations table

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
