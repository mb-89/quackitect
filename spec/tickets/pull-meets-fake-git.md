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
step: design/tests-red
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
