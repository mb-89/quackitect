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
    hash_before: b5680e77ee230f8b73355a14f134ac766e463514
    hash_after: b5680e77ee230f8b73355a14f134ac766e463514
    inputs:
      - name: ask
        hash: e49fe9ae20a28e13
        size: 542
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box e97c7a20bbd2 · claude-code-remote
    hash_before: 09b0bf0989775b256ba0a483f53c96a8f9b79815
    hash_after: 09b0bf0989775b256ba0a483f53c96a8f9b79815
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/git fails
    inputs:
      - name: design/draft
        hash: 959f88c063abaa29
        size: 11380
      - name: [[spec/design_output/doors]]
        hash: ffaadf7c3fe494dd
        size: 17605
      - name: [[spec/tickets/pull-meets-fake-git]]
        hash: 0ecf0b21dbd1a30f
        size: 430
    def: 08e16d07b0de477c
  - step: design/tests-red
    hand: the engine
    stale: [[spec/design_output/doors]]
  - step: design/tests-red
    hand: box e97c7a20bbd2 · claude-code-remote
    hash_before: 3770de8c7370cdaba7fa7eb33fd264efc033afcc
    hash_after: 3770de8c7370cdaba7fa7eb33fd264efc033afcc
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/quack fails
    inputs:
      - name: design/draft
        hash: 959f88c063abaa29
        size: 11380
      - name: [[spec/design_output/doors]]
        hash: 8f2f939387c0fe86
        size: 17697
      - name: [[spec/tickets/pull-meets-fake-git]]
        hash: 0ecf0b21dbd1a30f
        size: 430
    def: 08e16d07b0de477c
  - step: design/tests-red
    hand: the engine
    stale: [[spec/design_output/doors]]
  - step: design/tests-red
    hand: box e97c7a20bbd2 · claude-code-remote
    hash_before: d1406684077fa884832325dc2e6e7b25418dc3d4
    hash_after: d1406684077fa884832325dc2e6e7b25418dc3d4
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/quack fails
    inputs:
      - name: design/draft
        hash: 959f88c063abaa29
        size: 11380
      - name: [[spec/design_output/doors]]
        hash: 743d741e7e16080f
        size: 18226
      - name: [[spec/tickets/pull-meets-fake-git]]
        hash: 0ecf0b21dbd1a30f
        size: 430
    def: 08e16d07b0de477c
  - step: design/tests-red
    hand: the engine
    stale: [[spec/design_output/doors]]
  - step: design/tests-red
    hand: box e97c7a20bbd2 · claude-code-remote
    hash_before: 629121f2d84f853b2b3be8509c44b5604111976a
    hash_after: 629121f2d84f853b2b3be8509c44b5604111976a
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/quack fails
    inputs:
      - name: design/draft
        hash: 959f88c063abaa29
        size: 11380
      - name: [[spec/design_output/doors]]
        hash: cc0e07111bce8fc0
        size: 18378
      - name: [[spec/tickets/pull-meets-fake-git]]
        hash: 0ecf0b21dbd1a30f
        size: 430
    def: 08e16d07b0de477c
  - step: design/tests-red
    hand: the engine
    stale: [[spec/design_output/doors]]
  - step: design/tests-red
    hand: box e97c7a20bbd2 · claude-code-remote
    hash_before: 71a55874e6f1fb3b757c622ebbefa07368d10556
    hash_after: 71a55874e6f1fb3b757c622ebbefa07368d10556
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/quack fails
    inputs:
      - name: design/draft
        hash: 959f88c063abaa29
        size: 11380
      - name: [[spec/design_output/doors]]
        hash: 64a2083d276c869a
        size: 18222
      - name: [[spec/tickets/pull-meets-fake-git]]
        hash: 0ecf0b21dbd1a30f
        size: 430
    def: 08e16d07b0de477c
  - step: design/tests-red
    hand: the engine
    stale: [[spec/design_output/doors]]
  - step: design/tests-red
    hand: box e97c7a20bbd2 · claude-code-remote
    hash_before: 85a8a5238d3603c3c4fabb083ef90cb3d8925c60
    hash_after: 85a8a5238d3603c3c4fabb083ef90cb3d8925c60
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/quack fails
    inputs:
      - name: design/draft
        hash: 959f88c063abaa29
        size: 11380
      - name: [[spec/design_output/doors]]
        hash: 7af5758d17a81458
        size: 18235
      - name: [[spec/tickets/pull-meets-fake-git]]
        hash: 0ecf0b21dbd1a30f
        size: 430
    def: 08e16d07b0de477c
  - step: design/tests-red
    hand: the engine
    stale: [[spec/design_output/doors]]
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
The commit and ticket verbs test in memory, beside every other case, and a slow box slows the git door test alone.

<!-- breaks, as text: what breaks if it is never done -->
Each commit and ticket verb case builds a repository through real git, so a loaded box turns the cases red, and each case costs the battery real seconds.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- the cases in `src/quack/commit_test.go` and the ticket verbs cases building a repository run on `FakeGit`, and spawn no git
- the quack repository row of the family table in `spec/design_output/doors.md` names them as moved
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

This move takes the `Repo` that [[spec/design_output/doors#the-git-door-carries-writes]] names, after [[spec/tickets/pull-meets-fake-git]] builds it. The ask's word `FakeGit` means `FakeRepo`, since `FakeGit` holds four reads alone.

The verbs keep reading the work tree through `os` and `rootDisk`. So `NewFakeRepo` and `Clone` take a `files.Disk` in place of a `*files.FakeDisk`. A case hands `files.NewDisk(root)` over its own folder, and the verb and the fake read one tree. `fakeWorld` gains a twin over a folder, so every contract case runs on that arm too.

The seams:
- `landingDoors` gains `git git.Repo`, and `landingHere` fills it with `git.NewRepo(root, proc.Real)`.
- `gitRun`, `gitRan` and `saidBy` leave, and `markedUnmerged`, `stagedMarkers`, `movedFrom`, `stagable`, `takesBack` and `unstages` become methods of `landingDoors`.
- `pullHere`, `ticketBless`, `ticketOpen`, `ticketNote`, `ticketPull`, `ticketUpdate` and `mintVerb` take `repoAt func(root string) git.Repo`. Each `init` hands `realRepo` from `ticket_doors.go`.
- `gitIn` leaves, and `copiedBase` takes the `Repo`.

Each git line the verbs run today, and its operation:
- `rev-parse --abbrev-ref HEAD` in `lands`, `pushVerb` and `mintVerb`: `Head`
- `rev-parse HEAD` in `pushVerb`: `Resolve(HEAD)`
- `ls-files -u` in `markedUnmerged`: `Unmerged`
- `add -A [-- paths]` in `lands`: `AddAll` or `Add(paths)`
- `add -A from to` in `renaming`: `Add([from, to])`
- `diff --cached --unified=0 [-- paths]` in `stagedMarkers`: `StagedAdds(only)`
- `diff --cached --name-only --no-renames [-- paths]` in `lands`: new `Staged(only)`, each `Path` and `From`
- `diff --cached --name-status -M` in `movedFrom`: new `Staged(nil)`
- `ls-files --cached -- path` in `stagable`: `Tracked(path)`
- `commit -m message [-- paths]` in `lands`: `Commit(message, only)`
- `push origin branch` in `lands` and `pushVerb`: `Push(branch, false)`
- `rev-parse --verify -q HEAD^2` in `takesBack`: `Resolve(HEAD^2)`
- `reset -q --soft HEAD~1` in `takesBack`: new `SoftReset(ref)`
- `update-ref MERGE_HEAD sha` in `takesBack`: new `UpdateRef(name, hash)`
- `reset -q -- paths`, or `-- .`, in `unstages`: `Reset(paths)`, with the verb passing `.` on an empty list
- `log --format=%H -- path` in `copiedBase`: new `History(path)`, newest first
- `show sha:path` in `copiedBase`: `Show(sha, path)`
- `ticket bless` and `ticket open` reach git through `pull.It.Git`, which move 1 types as `git.Repo`

The fixtures need two more operations, which the chapter already lists: `Switch(name, create)` and `Merge(ref)`, answering the paths that conflict.

The operations move 1 holds take new contract cases where the quack verbs lean on git's behaviour:
- `Add` stages a deletion and a folder move, and refuses a path standing nowhere.
- `Tracked` answers true for a folder holding a tracked path.
- `Resolve` reads a parent suffix.
- `Reset` of paths leaves a merge standing.
- `Commit` mid-merge lands two parents.
- `Commit` refuses where `user.useConfigOnly` stands and no email does.
- `Push` refuses with no origin.
- `Head` answers a fault before the first commit.

Five cases lean on a refusal the fake holds no road to: a lock file, a hook, a broken remote URL. Each takes a refusal git and the fake share:
- the index lock case stages a path standing nowhere
- the commit hook case and the open hook case commit with no identity
- the remote URL case pushes from a repository with no origin
Push and mint fixtures commit a file in place of `--allow-empty`.

`landingRepo` builds both the folder and the origin through `FakeRepo`. So `push_test.go` and `rename_test.go` move with it, though the ask leaves them out. `blessTree`, `openTree`, `mintTree` and the history in `runsJSCases` build a `FakeRepo` over the case's folder. `TestLandingRepoStandsUnderAShortFolder` reads the root alone, since the origin stands in memory.

The family row for the quack verbs over a repository leaves the chapter. `codec_test.go` reads this tree's own files and builds no repository, so its span joins the twins and goldens row. The operations table gains the index's changes against HEAD and the log of one path.

I refuse moving the verbs' own disk reads onto a `files.FakeDisk` in this move. It would meet testing rule 12 whole, but it touches every landing and ticket verb past git. The cost of the route taken: the cases still write a temporary folder, and the fake reads a real disk. A real disk spawns nothing and waits on no process, so the guard and the ask hold.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/modules/git/repo.go NewFakeRepo
- src/modules/git/repo.go FakeRepo.Clone
- src/modules/git/repo_contract_test.go worlds
- src/modules/git/repo_contract_test.go fakeWorld
- src/pull/pull_test.go cloudPull
- src/quack/commit.go init
- src/quack/commit.go landingHere
- src/quack/commit.go gitRun
- src/quack/commit.go saidBy
- src/quack/commit.go lands
- src/quack/commit.go takesBack
- src/quack/commit.go unstages
- src/quack/commit.go markedUnmerged
- src/quack/commit.go stagedMarkers
- src/quack/commit.go movedFrom
- src/quack/commit.go stagable
- src/quack/push.go init
- src/quack/push.go pushVerb
- src/quack/rename.go init
- src/quack/rename.go renaming
- src/quack/ticket_doors.go gitIn
- src/quack/ticket_doors.go pullHere
- src/quack/ticket_bless.go init
- src/quack/ticket_bless.go ticketBless
- src/quack/ticket_open.go init
- src/quack/ticket_open.go ticketOpen
- src/quack/ticket_note.go init
- src/quack/ticket_note.go ticketNote
- src/quack/ticket_pull.go init
- src/quack/ticket_pull.go ticketPull
- src/quack/ticket_update.go init
- src/quack/ticket_update.go ticketUpdate
- src/quack/ticket_update.go copiedBase
- src/quack/verb_mint.go init
- src/quack/verb_mint.go mintVerb
- src/quack/landing_test.go fakeLanding
- src/quack/landing_test.go landingRepo
- src/quack/landing_test.go gitDoes
- src/quack/landing_test.go TestLandingRepoStandsUnderAShortFolder
- src/quack/commit_test.go headSubject
- src/quack/commit_test.go stagedNames
- src/quack/commit_test.go originSubject
- src/quack/commit_test.go conflicted
- src/quack/commit_test.go TestCommitVerb
- src/quack/commit_test.go TestCommitVerbDesk
- src/quack/commit_test.go TestCommitVerbMoves
- src/quack/commit_test.go TestCommitVerbGates
- src/quack/push_test.go TestPushVerb
- src/quack/rename_test.go TestRenameMoves
- src/quack/rename_test.go TestRenameVerb
- src/quack/ticket_bless_test.go blessTree
- src/quack/ticket_bless_test.go blessSubject
- src/quack/ticket_bless_test.go TestTicketBless
- src/quack/ticket_open_test.go openTree
- src/quack/ticket_open_test.go openGit
- src/quack/ticket_open_test.go TestTicketOpen
- src/quack/ticket_route_test.go runsJSCases
- src/quack/ticket_route_test.go gitsIn
- src/quack/ticket_update_test.go TestTicketUpdateVerb
- src/quack/ticket_fill_test.go TestTicketFillVerb
- src/quack/verb_mint_test.go mintTree
- src/quack/verb_mint_test.go TestMintVerb

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/modules/git/repo_contract_test.go TestRepoStagedNamesTheIndexChangesAgainstHeadAndReadsAStagedMoveAsAMove
- src/modules/git/repo_contract_test.go TestRepoAddOfARemovedPathStagesItsDeletionAndAMovedFolderStagesBothSides
- src/modules/git/repo_contract_test.go TestRepoAddOfAPathStandingNowhereRefusesAndNamesThePath
- src/modules/git/repo_contract_test.go TestRepoTrackedAnswersTrueForAFolderHoldingATrackedPath
- src/modules/git/repo_contract_test.go TestRepoResolvesAParentByItsSuffixAndNoSecondParentOnAPlainCommit
- src/modules/git/repo_contract_test.go TestRepoSwitchMovesHeadAndTheWorkTreeAndCutsABranchOnAsk
- src/modules/git/repo_contract_test.go TestRepoMergeOfAPathOneSideAloneChangesLandsClean
- src/modules/git/repo_contract_test.go TestRepoMergeThatConflictsNamesThePathLeavesItUnmergedAndMarksTheWorkTree
- src/modules/git/repo_contract_test.go TestRepoResetOfPathsMidMergeLeavesTheMergeStanding
- src/modules/git/repo_contract_test.go TestRepoCommitMidMergeConcludesItWithTwoParents
- src/modules/git/repo_contract_test.go TestRepoSoftResetMovesHeadBackAndKeepsTheChangeStaged
- src/modules/git/repo_contract_test.go TestRepoUpdateRefOfMergeHeadOpensTheMergeAgain
- src/modules/git/repo_contract_test.go TestRepoCommitWhereNoIdentityStandsRefusesAndLeavesTheIndex
- src/modules/git/repo_contract_test.go TestRepoPushWithNoOriginRefusesAndSaysWhy
- src/modules/git/repo_contract_test.go TestRepoHeadBeforeTheFirstCommitAnswersAFault
- src/modules/git/repo_contract_test.go TestRepoHistoryListsTheCommitsTouchingAPathNewestFirst
- src/modules/git/repo_contract_test.go worlds, which gains a FakeRepo over a real folder, so every case above and move 1's run on it
- src/quack/commit_test.go TestCommitVerbDesk, case: a path git cannot stage names what git says, and commits nothing, in place of the index lock case
- src/quack/commit_test.go TestCommitVerbDesk, case: a commit git refuses lands nothing, and the staging comes back, now refused for no identity
- src/quack/ticket_open_test.go TestTicketOpen, case: a commit git refuses leaves the draft standing, in place of the hook case
- src/quack/push_test.go TestPushVerb, case: a push from a repository with no origin names what git says, in place of the broken URL case
- done_when 1, decided by existing tests passing on FakeRepo: src/quack/commit_test.go TestCommitVerb, TestCommitVerbDesk, TestCommitVerbMoves, TestCommitVerbGates; src/quack/ticket_bless_test.go TestTicketBless; src/quack/ticket_open_test.go TestTicketOpen; src/quack/ticket_update_test.go TestTicketUpdateVerb; src/quack/verb_mint_test.go TestMintVerb; and, through landingRepo, src/quack/push_test.go TestPushVerb and src/quack/rename_test.go TestRenameMoves and TestRenameVerb
- done_when 1 and 2, decided by src/imports/clock_test.go TestEveryTestWaitingOnTheBoxStandsInTheDoorAudit, which fails once the row leaves while any of these test files still calls exec
- done_when 3, decided by ./RUNME.sh check

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/modules/git/repo.go
- src/modules/git/repo_contract_test.go
- src/quack/commit.go
- src/quack/push.go
- src/quack/rename.go
- src/quack/ticket_doors.go
- src/quack/ticket_bless.go
- src/quack/ticket_open.go
- src/quack/ticket_note.go
- src/quack/ticket_pull.go
- src/quack/ticket_update.go
- src/quack/verb_mint.go
- src/quack/landing_test.go
- src/quack/commit_test.go
- src/quack/push_test.go
- src/quack/rename_test.go
- src/quack/ticket_bless_test.go
- src/quack/ticket_open_test.go
- src/quack/ticket_route_test.go
- src/quack/verb_mint_test.go
- spec/design_output/doors.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- I opened every file the approach names: repo.go, its contract suite, files/disk.go, clock.go, commit.go, push.go, rename.go, ticket_doors.go, and the bless, open, route, update and mint verbs. I also opened the seven test files of the family row, plus push_test.go, rename_test.go and the shared helpers. Each git line above comes from a grep of exec.Command and gitRun in src/quack.
- The callers list comes from a grep of gitRun, gitIn, pullHere, landingHere, fakeLanding, landingRepo and each twin constructor. It also names NewFakeRepo's callers, whose type widens. ticket_note_test.go keeps the registry and its real repoAt, so it stands unchanged.
- done_when 1 rests on the quack cases passing on FakeRepo, and on the real-wait guard once the row leaves. done_when 2 rests on the same guard reading doors.md. done_when 3 rests on ./RUNME.sh check.

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/repos_moved_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/modules/git/repo_contract_test.go
- src/quack/repos_moved_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The step went stale twice, each time a sibling ticket added a row to the doors chapter. The rerun still fails on its own assertion: each repository test file in src/quack still spawns git, and the doors chapter still lists them. It turns green once the verbs take Repo and their row leaves the chapter.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- done_when one and two meet TestTheQuackRepositoryCasesSpawnNothingAndTheDoorsChapterListsThemNowhere, red now, and done_when three is the check
- the doors the tests reach are git and the disk, and FakeRepo and a local tree stand for each

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
