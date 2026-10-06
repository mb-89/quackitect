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
depends_on: git-and-process-doors-designed
step: gate
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box e97c7a20bbd2 · claude-code-remote
    hash_before: f28f8cdcb83250a9af04e62f0c3986fb2d51d48d
    hash_after: f28f8cdcb83250a9af04e62f0c3986fb2d51d48d
    inputs:
      - name: ask
        hash: 0ecf0b21dbd1a30f
        size: 430
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box e97c7a20bbd2 · claude-code-remote
    hash_before: ccaefa95b637fd1478e2e560e8e884fad8955468
    hash_after: ccaefa95b637fd1478e2e560e8e884fad8955468
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/git fails
    inputs:
      - name: design/draft
        hash: 8eaac3060915d948
        size: 12071
      - name: [[spec/design_output/doors]]
        hash: ffaadf7c3fe494dd
        size: 17605
    def: 08e16d07b0de477c
  - step: gate
    hand: box e97c7a20bbd2 · claude-code-remote · helper-4
    hash_before: af47504daf1a0e58709689cefea02c9e6866a989
    hash_after: af47504daf1a0e58709689cefea02c9e6866a989
    inputs:
      - name: design/draft
        hash: 8eaac3060915d948
        size: 12071
      - name: design/tests-red
        hash: e9b3cce58a3a8d57
        size: 1098
      - name: [[spec/design_output/doors]]
        hash: ffaadf7c3fe494dd
        size: 17605
    def: dc4904ab364efa10
  - step: implement/change
    hand: box e97c7a20bbd2 · claude-code-remote
    hash_before: a9acb9e4033e757abb1d80ab32c545d07fdf4a6e
    hash_after: a9acb9e4033e757abb1d80ab32c545d07fdf4a6e
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
  - step: design/tests-red
    skipped: true
    kept: 41b561c3a5a66cfc00d616284f0a6a4baf6c54aa
    why: its red tests stand as 41b561c3a landed them, and a later leaf passed since
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
The pull tests in memory, beside every other case, and a slow box slows the git door test alone.

<!-- breaks, as text: what breaks if it is never done -->
Each pull case drives a real repository, so a loaded box turns the cases red, and each case costs the battery real seconds.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- the cases in `src/pull/pull_test.go` run on `FakeGit`, and spawn no git
- the pull row of the family table in `spec/design_output/doors.md` names them as moved
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

The pull takes the doors that [[spec/design_output/doors#the-git-door-carries-writes]] and [[spec/design_output/doors#the-process-door]] name. The ask's word `FakeGit` means the chapter's `FakeRepo`, since `FakeGit` holds four reads alone.

This move builds `Repo` first. `src/modules/git/repo.go` holds the `Repo` interface, the real door over a `proc.Runner`, and `FakeRepo`. `git.NewRepo(root, run)` speaks one git command line an operation. `git.NewFakeRepo(tree, now)` keeps commits keyed by a SHA-1 of their content, refs, `HEAD`, an index, a config map and an origin `FakeRepo`. Its work tree stands on a `files.FakeDisk`.

The operations the pull needs, each with its git line today:
- `Head` for `rev-parse --abbrev-ref HEAD`, used by `Pulling`, `Pull` and `localWorkFault`
- `Resolve(ref)` for `rev-parse HEAD`, used by `tipOf`, `handedOverAt` and `marksHandoverTip`
- `Fetch(branch)` for `fetch origin <b>`, used by `fetched` and `pushed`
- `Count(from, to)` for `rev-list --count A..B`, used by `fetched` and `localWorkFault`, and it answers false on a missing ref
- `FastForward(ref)` for `merge --ff-only`, used by `fetched`
- `MergeBase(a, b)` for `merge-base`, used by `acceptBase` and `ReadyToMerge`
- `IsAncestor(a, b)` for `merge-base --is-ancestor`, used by `handBack`
- `Signature(ref)` for `log -1 --format=%G?`, used by `handFaults`, and the fake answers N
- `RemoteHeads(prefix)` for `ls-remote --heads origin work/*`, used by `cutForGroups`
- `Branch(name, at)` for `branch <b> main`, used by `cutForGroups`
- `Push(branch, upstream)`, answering `Pushed{OK, Moved, Err}`, for `push [-u] origin <b>`, used by `cutForGroups` and `tried`
- `Status(untracked)`, answering `[]Change`, for `status --porcelain` with `--untracked-files=no` or `-uall`, used by `localWorkFault` and `treeFiles`
- `Log(from, to, ancestry)`, answering `[]Commit{Hash, Subject}`, for `log --format=%H%x00%s since..HEAD` and `log --reverse --ancestry-path`, used by `commitsFor` and `redCommit`
- `Added(folder)` for `log --diff-filter=A --format=%ct --name-only -- spec/tickets`, used by `stoodHere`
- `Show(ref, path)` for `show <ref>:<path>`, used by `closedHere`, `landedOnTrunk` and `groupDone`
- `Config(key)` for `config user.name`, used by `HandOf`
- `Changed(commit)` for `show --name-status --format=` and `show --format= --name-only`, used by `landedTests` and `changedSince`
- `Diff(a, b)` for `diff -M --name-status` and `diff --name-only --diff-filter=d`, used by `goneSince` and `changedFiles`
- `Ignored(paths)` for `check-ignore --`, used by `tracked`
- `Tracked(path)` for `ls-files --error-unmatch`, used by `tracked`
- `Add(paths)` and `AddAll` for `add --` and `add -A`, used by `landing`
- `Reset(paths)` for `reset -q [--]`, used by `landing`
- `Commit(message, only)` for `commit -m [-- paths]`, used by `landing`, and it takes only the named paths' work-tree text
- `Unmerged` for `ls-files -u`, used by `unmergedFault`
- `StagedAdds(only)`, answering `[]Line{File, Line, Text}` with binary files skipped, for `diff --cached --unified=0`, used by `stagedFault`
- `Rebase(onto)` for `rebase` followed by `rebase --abort` on a conflict, used by `pushed`
- `Refs(prefix)`, answering `[]Ref{Name, Hash}`, for `for-each-ref refs/remotes/origin/work/`, used by `ReadyToMerge`

The draft adds these points to the chapter:
- The pull's `Git` interface and `Ran` leave, and `It.Git` takes `git.Repo`. Each caller reads typed fields, so the porcelain and name-status parsing leaves the pull.
- The `movedPush` regex moves into the real `Push`.
- `GitDoor` leaves. `OSShell` becomes `ShellOver(run proc.Runner, root)`, which runs `sh -c line` in the root and reads `NotStarted` as an error. `Shell` and `commandsRun` stay as they are.
- `files.Disk` gains `List(folder)`. `pull.TreeDisk` answers `pull.Disk` over a `files.Disk`, so the pull and `FakeRepo` share one work tree.
- The fake reads `.gitignore` lines that name a folder, a path or a `path.Match` glob.
- The fake reads only a move with unchanged content as a rename.
- The fake rebase replays one path at a time, keeping a whole path.

The fixture `cloudPull` seeds an origin `FakeRepo` through `Repo` operations and clones it onto `work/g`. It sets `user.name` and hands in `pull.TreeDisk` over the clone's tree. It also hands in `ShellOver` on a `FakeRunner` taught one program, `sh`. That `sh` runs `echo` and answers exit 127 on any other line. `twoChildren` in `pull_clear_test.go` then commits and pushes beta through `Repo`.

The chapter changes in three places:
- the Go door table gains the row `src/modules/git/repo.go`, `FakeRepo`, `repo_contract_test.go`, and drops the row for the pull's git and shell
- the family table drops the row for the pull over a real repository
- the operations table gains the reads it lacks: signature, ignored paths, tracked path, unmerged paths, staged adds, remote heads and the fast-forward

The real-wait guard then refuses any spawn back into these files. `FakeGit` stays for the index's cases.

I weighed a `FakeRunner` `git` program that reads argv over `FakeRepo`, and I refuse it. It leaves the call sites alone, but it builds a second git inside the fake, which the typed `Repo` exists to avoid. The cost of the route taken: every git call site in src/pull changes in one move. So implement/change lands `Repo` and its suite first, then the pull, one file at a time, green after each.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- `src/quack/ticket_doors.go` `pullHere`
- `src/pull/pull.go` `Pulling`
- `src/pull/pull.go` `Pull`
- `src/pull/pull.go` `fetched`
- `src/pull/pull_accept.go` `acceptBase`
- `src/pull/pull_back.go` `handBack`
- `src/pull/pull_back.go` `handFaults`
- `src/pull/pull_branch.go` `cutForGroups`
- `src/pull/pull_ephemeral.go` `localWorkFault`
- `src/pull/pull_ephemeral.go` `handedOverAt`
- `src/pull/pull_ephemeral.go` `marksHandoverTip`
- `src/pull/pull_hand.go` `stoodHere`
- `src/pull/pull_hand.go` `closedHere`
- `src/pull/pull_holds.go` `HandOf`
- `src/pull/pull_kept.go` `redCommit`
- `src/pull/pull_kept.go` `landedTests`
- `src/pull/pull_kept.go` `goneSince`
- `src/pull/pull_kept.go` `statusRows`
- `src/pull/pull_landed.go` `tracked`
- `src/pull/pull_landed.go` `landing`
- `src/pull/pull_landed.go` `unmergedFault`
- `src/pull/pull_landed.go` `stagedFault`
- `src/pull/pull_landed.go` `pushed`
- `src/pull/pull_landed.go` `tried`
- `src/pull/pull_ready.go` `ReadyToMerge`
- `src/pull/pull_ready.go` `landedOnTrunk`
- `src/pull/pull_ready.go` `groupDone`
- `src/pull/pull_writes.go` `tipOf`
- `src/pull/pull_writes.go` `commitsFor`
- `src/pull/pull_writes.go` `changedSince`
- `src/pull/pull_writes.go` `treeFiles`
- `src/pull/pull_writes.go` `changedIn`
- `src/pull/pull_writes.go` `changedFiles`
- `src/pull/pull_test.go` `cloudPull`
- `src/pull/pull_test.go` `gitIn`
- `src/pull/pull_test.go` `TestPull`
- `src/pull/pull_clear_test.go` `twoChildren`
- `src/modules/files/disk.go` `disk`, an implementer of `Disk`, which gains `List`
- `src/modules/files/disk.go` `FakeDisk`, an implementer of `Disk`, which gains `List`

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- `src/modules/git/repo_contract_test.go` `TestRepoNamesTheBranchHeadStandsOn`
- `src/modules/git/repo_contract_test.go` `TestRepoResolvesARefAndAnswersNoneForAMissingOne`
- `src/modules/git/repo_contract_test.go` `TestRepoReadsAFileAtARefAndNothingForAMissingPath`
- `src/modules/git/repo_contract_test.go` `TestRepoAddStagesThePathsAndAddAllSkipsIgnoredOnes`
- `src/modules/git/repo_contract_test.go` `TestRepoResetUnstagesThePathsAndLeavesTheWorkTree`
- `src/modules/git/repo_contract_test.go` `TestRepoCommitOfNamedPathsTakesTheirWorkTreeTextAlone`
- `src/modules/git/repo_contract_test.go` `TestRepoCommitWithNothingStagedRefuses`
- `src/modules/git/repo_contract_test.go` `TestRepoStatusNamesStagedChangedAndUntrackedPathsAndSkipsIgnoredOnes`
- `src/modules/git/repo_contract_test.go` `TestRepoIgnoredNamesThePathsTheIgnoreFileHoldsOut`
- `src/modules/git/repo_contract_test.go` `TestRepoTrackedAnswersWhetherTheIndexHoldsAPath`
- `src/modules/git/repo_contract_test.go` `TestRepoUnmergedNamesNoPathOnACleanIndex`
- `src/modules/git/repo_contract_test.go` `TestRepoStagedAddsNameEachAddedLineByFileAndLine`
- `src/modules/git/repo_contract_test.go` `TestRepoCountsTheCommitsOneRefStandsAheadOfAnother`
- `src/modules/git/repo_contract_test.go` `TestRepoMergeBaseNamesTheCommonCommit`
- `src/modules/git/repo_contract_test.go` `TestRepoIsAncestorAnswersWhetherOneCommitLeadsToAnother`
- `src/modules/git/repo_contract_test.go` `TestRepoLogListsTheCommitsOverARangeAlongTheAncestryPath`
- `src/modules/git/repo_contract_test.go` `TestRepoChangedNamesThePathsOneCommitChangesWithTheirStatus`
- `src/modules/git/repo_contract_test.go` `TestRepoDiffNamesThePathsTwoRefsDifferInAndReadsAMoveAsAMove`
- `src/modules/git/repo_contract_test.go` `TestRepoAddedNamesTheSecondEachPathUnderAFolderCameIn`
- `src/modules/git/repo_contract_test.go` `TestRepoSignatureReadsNoSignatureOnAnUnsignedCommit`
- `src/modules/git/repo_contract_test.go` `TestRepoConfigReadsAKeySetAndNothingForOneUnset`
- `src/modules/git/repo_contract_test.go` `TestRepoBranchCutsABranchAtARefAndRefusesOneStanding`
- `src/modules/git/repo_contract_test.go` `TestRepoPushMovesTheBranchOnOriginAndItsTrackingRef`
- `src/modules/git/repo_contract_test.go` `TestRepoPushRefusesABranchOriginMovedAndSaysItMoved`
- `src/modules/git/repo_contract_test.go` `TestRepoFetchMovesTheTrackingRefAndLeavesTheBranch`
- `src/modules/git/repo_contract_test.go` `TestRepoFastForwardMovesTheBranchAndRefusesADivergence`
- `src/modules/git/repo_contract_test.go` `TestRepoRebaseReplaysLocalCommitsOntoARef`
- `src/modules/git/repo_contract_test.go` `TestRepoRebaseThatConflictsLeavesTheBranchAsItStood`
- `src/modules/git/repo_contract_test.go` `TestRepoRemoteHeadsListsTheBranchesOriginHoldsUnderAPrefix`
- `src/modules/git/repo_contract_test.go` `TestRepoRefsListsTheTrackingRefsUnderAPrefixWithTheirCommits`
- `src/modules/files/disk_contract_test.go` `TestDiskListsEveryFileUnderAFolder`
- `src/pull/disk_contract_test.go` `TestDiskContract`, which gains a third arm over `TreeDisk` on a `files.FakeDisk`
- `src/pull/shell_test.go` `TestTheShellRunsALineThroughShInTheRootAndReadsAProgramThatNeverStartsAsAFault`
- `src/imports/clock_test.go` `TestEveryTestWaitingOnTheBoxStandsInTheDoorAudit`, which already stands and decides done_when lines one and two once the pull row leaves
- `src/pull/pull_test.go` `TestPull` and `src/pull/pull_clear_test.go`, which already stand and decide done_when line one by passing on the fakes

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/modules/git/repo.go
- src/modules/git/repo_contract_test.go
- src/modules/files/disk.go
- src/modules/files/disk_contract_test.go
- src/pull/pull_doors.go
- src/pull/door.go
- src/pull/disk_contract_test.go
- src/pull/shell_test.go
- src/pull/pull.go
- src/pull/pull_accept.go
- src/pull/pull_back.go
- src/pull/pull_branch.go
- src/pull/pull_ephemeral.go
- src/pull/pull_hand.go
- src/pull/pull_holds.go
- src/pull/pull_kept.go
- src/pull/pull_landed.go
- src/pull/pull_ready.go
- src/pull/pull_writes.go
- src/pull/pull_test.go
- src/pull/pull_clear_test.go
- src/quack/ticket_doors.go
- spec/design_output/doors.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- I opened every file the approach names: door.go, pull_doors.go, every git call site in src/pull, pull_test.go, pull_clear_test.go, ticket_doors.go, proc.go and its suite, git.go, files/disk.go, and clock.go with clock_test.go. `Repo` and `FakeRepo` stand only in the doors chapter, so their operations come off the call sites listed here.
- The callers list comes off a scan of every function in src/pull calling `it.Git.Run`, together with `pullHere`, the two test fixtures and the implementers of `files.Disk`. `commandsRun` stays unchanged, because `Shell` keeps its type.
- Done_when one: `TestPull` and the `pull_clear_test.go` cases pass on `FakeRepo` and `FakeRunner`. Done_when two: `TestEveryTestWaitingOnTheBoxStandsInTheDoorAudit` fails once the row leaves while a fixture still spawns. Done_when three: `./RUNME.sh check`.

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/modules/git/repo_contract_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/modules/git/repo_contract_test.go
- src/modules/files/disk_contract_test.go
- src/pull/shell_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Every Repo contract case fails on its own assertion against stub doors that answer zero values. Each case runs a real arm over a bare origin and two clones, and a fake arm over FakeRepo. The disk case fails under go test -tags contract, but branch test passes no build tag, so the verb never runs it. One case passed against a zero stub, so it now asserts its precondition first. The cases also fix choices the draft left open: Log answers newest first, Status reads two letters and a move reads R with its source.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

done_when one meets the Repo suite and the shell case, which fail now, and the pull cases turn onto them at implement; done_when two meets TestEveryTestWaitingOnTheBoxStandsInTheDoorAudit in src/imports/clock_test.go; done_when three is the check
the doors the tests reach are git, the disk and the process door, and FakeRepo, FakeDisk and FakeRunner stand for each

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept

The approach answers the ask: `Repo` and `FakeRepo` in src/modules/git carry every git line the src/pull call sites run, and `ShellOver` on a `FakeRunner` replaces `OSShell`. Done_when line one met a red test only once the pull row left the doors chapter, and nothing turned red while the row stood, so line two had none. The gate adds `TestThePullCasesSpawnNothingAndTheDoorsChapterListsThemNowhere` to src/pull/shell_test.go, on the red list already. It fails now on the `exec.Command` in `gitIn` and on the pull row of the doors chapter, and it passes once both leave. The Repo suite, the disk `List` case under the contract tag, which the check runs, and the shell case each fail on their own assertion against the stubs. The check decides line three.

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

the change touches the files the draft size names, plus src/modules/git/tree_test.go, a local tree so the suite imports no other module, and the person-run case folded into TestVerbRegistry, since the check went red on it
every door the change reaches has a fake: FakeRepo for git, FakeRunner for the shell, and FakeDisk and TreeDisk for the disk
each new file opens with a header naming the git door section of spec/design_output/doors.md, which names the approach
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
