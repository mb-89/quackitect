---
kind: [[ticket]]
state: closed
steps:
  - name: sync
    does: takes trunk into the branch, so the box works on the latest
    when: cloud
    by: agent
    needs: ["branch sync"]
    evidence:
      - name: sync
        form: command
        expects: 0
        says: branch sync, so the branch carries trunk
  - name: split
    does: reads the standing children, and mints more where the goal needs them, each naming this group
    from: anyone
    by: anyone
    input: ask
    checklist: ["every child is small enough to review whole, or is a group itself", "the children add up to the goal, and nothing of the goal stands outside them", "a child that waits on another names it under depends_on", "each child names what it reads from its siblings, and the children land in that order", "a group whose diff grows past one review splits into a group of its own before it grows further"]
    evidence:
      - name: children
        form: list
        says: every child as a link, one a line, with its process
  - name: children
    by: children
    on_fail: split
  - name: accept
    gate: does the work of every child add up to the goal, and does every command of the route pass
    final: true
    does: reads the diff since its last verdict against the goal and every prose criterion, and names what falls short as points
    tags: ["review", "accept"]
    input: ["ask", "children"]
    evidence:
      - name: verdict
        form: verdict
        says: accept, accept with points naming a fix ticket a line, or reject with findings one a line
  - name: retro
    to: retro
    steps:
      - name: notes
        does: decides every private note on the box, and works what it mints into this group
        needs: ["retro"]
        evidence:
          - name: drained
            form: command
            expects: 0
            says: retro notes, which passes when the private folder is empty
      - name: write
        does: writes the retro over the box's own window
        input: ["children", "notes"]
        checklist: ["every fact the change adds stands in one place, and a note points at the file instead of repeating it", "every number the change adds carries a name in one place, and a copy a technical reason forces says so beside it", "every header the change writes says what its file is for, and counts nothing", "the chapter carries the run's owner prompts and errors off the transcript, each with its time", "the chapter says the role, and carries no name, address or path of the box"]
        evidence:
          - name: done
            form: list
            says: what was done, one line a ticket or a thing
          - name: well
            form: list
            says: what went well, and what made it go well
          - name: badly
            form: list
            says: what did not go well, each error of the run and each owner prompt turning it, with its time
          - name: improve
            form: list
            home: true
            says: how each bad line stops happening, each line naming its home as a link, a ticket in backticks or a path in backticks
          - name: thoughts
            form: text
            says: what the thoughts say that the actions do not, off the transcript
      - name: cloud
        does: names what the box lacked, met and leaves for a person
        when: cloud
        input: write
        evidence:
          - name: lacked
            form: list
            says: a tool, a host the proxy refused, a right the platform refused, an install, each with its moment
          - name: met
            form: list
            says: the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone
          - name: left
            form: list
            says: every person step parked, every ticket minted with no group, and what the handover says
process: [[spec/processes/group]]
process_hash: d9f9539fef3ec913
step: retro/cloud
record:
  - step: sync
    hand: box 8339730da099 · claude-code-remote
    hash_before: 8bc0fe6a95d04b62502f8563f3793623a75e0d55
    session: cse_01RM2uFRaD8apfsCAeTP7ifr
  - step: sync
    hand: box 8339730da099 · claude-code-remote
    hash_before: be7d268f318a5674c09c24d9b2a5a3f20fb49486
    hash_after: be7d268f318a5674c09c24d9b2a5a3f20fb49486
    answered:
      - name: sync
        exit: 0
        said: work/branches-and-pull-report-truly already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box 8339730da099 · claude-code-remote
    hash_before: fef8eea68c534eb7f4566a7ade10f2b07340dc2a
    hash_after: fef8eea68c534eb7f4566a7ade10f2b07340dc2a
    inputs:
      - name: ask
        hash: b4fb32242a53e4b3
        size: 443
    def: 19b6849b1f151cd5
  - step: children
    hand: the engine
    hash_before: 65da5b1220a2aaf9716263804690505dd3056946
    hash_after: 65da5b1220a2aaf9716263804690505dd3056946
  - step: accept
    hand: box 8339730da099 · claude-code-remote
    hash_before: dfc432f4bfb2c1b11f5f1d3ccce4aa958a392488
    hash_after: dfc432f4bfb2c1b11f5f1d3ccce4aa958a392488
    answered:
      - name: sync/sync
        exit: 0
        said: work/branches-and-pull-report-truly already carries every commit on main.
    inputs:
      - name: ask
        hash: b4fb32242a53e4b3
        size: 443
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box 8339730da099 · claude-code-remote
    hash_before: 2fdd8b0cf27bc203d6f845ece43d629066fadd6f
    hash_after: 2fdd8b0cf27bc203d6f845ece43d629066fadd6f
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
  - step: retro/write
    hand: box 8339730da099 · claude-code-remote
    hash_before: e0f005285d9916470e152e85562dbd34641c1a06
    hash_after: e0f005285d9916470e152e85562dbd34641c1a06
    inputs:
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: retro/notes
        hash: cd64de0d4d23e2c7
        size: 40
    def: e7ed0badf886b5b5
  - step: retro/cloud
    hand: box 8339730da099 · claude-code-remote
    hash_before: ece074629334ff52d873f4ba79d2948b312515a3
    hash_after: ece074629334ff52d873f4ba79d2948b312515a3
    inputs:
      - name: retro/write
        hash: be7262c3f79b6c34
        size: 3015
    def: 4da1ca5da87d5bbc
reason: done
---

# Ask

<!-- goal, as text: what these tickets add up to, for the hand that takes them -->

The branch and pull verbs report what happens. A Go test that fails to build reads build, and a refused commit or push stops the verb that claims it. An edit or a note survives a refused switch, an interrupted review and a doubled source. The pull hands the spawn to its tool and keeps an owner's word through the hand-back. It reads each ticket's front once a pass.

Done when every finding on the review list closes, done or with its reason.

# sync

<!-- takes trunk into the branch, so the box works on the latest -->

## sync

<!-- branch sync, so the branch carries trunk -->
<!-- the form is command -->

    ./RUNME.sh branch sync

# split

<!-- reads the standing children, and mints more where the goal needs them, each naming this group -->

## children

<!-- every child as a link, one a line, with its process -->
<!-- the form is list -->

- [[spec/tickets/became-refuses-itself]], trivial
- [[spec/tickets/branch-list-reads-trunk-waits]], trivial
- [[spec/tickets/cut-groups-check-the-push]], trivial
- [[spec/tickets/depends-on-reads-one-parser]], trivial
- [[spec/tickets/dispatch-remarks-branched-groups]], trivial
- [[spec/tickets/done-refuses-on-refused-commit]], trivial
- [[spec/tickets/engine-landings-report-refusals]], trivial
- [[spec/tickets/failed-switch-keeps-parked-notes]], trivial
- [[spec/tickets/fetch-names-the-real-fault]], trivial
- [[spec/tickets/fix-group-names-stay-unique]], trivial
- [[spec/tickets/go-build-failure-reads-build]], standard
- [[spec/tickets/hand-out-reads-parsed-fronts]], trivial
- [[spec/tickets/owner-says-hand-back-holds]], trivial
- [[spec/tickets/red-test-keeps-named-sources]], trivial
- [[spec/tickets/review-clears-stale-worktree]], trivial
- [[spec/tickets/take-back-reports-refusals]], trivial
- [[spec/tickets/tool-pull-finds-the-spawn]], trivial

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every child is one change to one verb, small enough to review whole
- the children cover each clause of the ask: build reads build, refused commits and pushes stop their verbs, edits and notes survive, the spawn reaches the tool, the owner word holds, fronts parse once
- no child waits on another, so none names depends_on
- no child reads a sibling, so their order is free
- the diff stands in one review, so no child splits off

# children

# accept

<!-- reads the diff since its last verdict against the goal and every prose criterion, and names what falls short as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept

# retro

## notes

<!-- decides every private note on the box, and works what it mints into this group -->

### drained

<!-- retro notes, which passes when the private folder is empty -->
<!-- the form is command -->

    ./RUNME.sh retro notes

## write

<!-- writes the retro over the box's own window -->

### done

<!-- what was done, one line a ticket or a thing -->
<!-- the form is list -->

- `review-clears-stale-worktree`: the real disk removes the empty folders under a folder, so a later review opens its worktree
- `take-back-reports-refusals`: a refused take-back names the refusal and pushes nothing
- `tool-pull-finds-the-spawn`: the pull tool finds the spawn past the work lines of a hand-back
- `go-build-failure-reads-build`: a build mark reads build before a FAIL line, so the frozen red case passes
- `engine-repairs-keep-refusals`: four engine repairs land through the helper that puts the held text back
- the group passes accept, with a second reading of the whole diff by a helper

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

- a red test before each fix, so each change carries its own proof
- the commit verb runs the check on each commit, so no push lands red
- a helper on the gate kept the second-hand rule, once it pulled through the shell

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->
<!-- the form is list -->

- 00:20 two tests for one fix put the files module past the ratio guard, and the check answered red
- 00:21 the box tried git stash to prove a red case, and the door refused it
- 00:26 the tests field named a bare go test, which answers ok where the leaf expects green
- 00:31 the stop tool answers that no hook serves it, so the turn could not end through it
- 00:31 to 00:55 the stop hook refused a stop line while a helper ran, five times
- 00:47 a helper called the pull tool, met still running, and its answer never reached the helper
- 00:50 the box joined a pull to a command before it, and the door refused the landing twice
- the review names three open faults: a failed fetch now stops every pull offline, a cut pushes a stale local branch where origin lacks it, and the pull reads depends_on without the branch prefix the branch verbs strip

### improve

<!-- how each bad line stops happening, each line naming its home as a link, a ticket in backticks or a path in backticks -->
<!-- the form is list -->

- fold the cases of one fix into one test before the commit, as `src/imports/ratio.go` counts
- name `./RUNME.sh branch test <file>` in a tests field, as `spec/guidance/code/tests.md` asks
- the stop tool takes its hook in the plugin, as `src/quack` registers it
- the stop hook reads a running helper before it holds the turn, in the hook under `src/quack`
- the helper prompt the pull prints names the shell verb, in `src/pull/pull_branch.go`
- the fetch fault in `src/pull/pull.go` lets an offline desk carry on, where the owner wants that
- the cut in `src/pull/pull_branch.go` cuts fresh where origin lacks the branch
- the pull reader of depends_on in `src/pull/pull_hand.go` strips the branch prefix

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The run held to one ticket at a time, and the slow part was the harness rather than the code. Each async tool answer and each held stop cost a turn. The review found nothing blocking, and its three open faults stand as improve lines for the next retro to mint.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every fact stands once: each fault points at the file that owns it
- the retro adds no number past the times the run carries
- the retro writes no file header
- the owner prompts and errors carry their times off the transcript
- the retro names the role alone, and no box name or path

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->
<!-- the form is list -->

- no tool, host, right or install was missing on this run

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->
<!-- the form is list -->

- a sync with main past the cold path at 00:44, which landed clean
- the ratio guard at 00:20, cleared by folding two tests into one
- the stop hook holding the turn while a helper ran, from 00:31 to 00:55
- the door on git stash and on a pull joined to a command before it

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->
<!-- the form is list -->

- no person step parked
- no ticket minted outside the group
- the handover names the pull request against main as the last step

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

The owner approves this group off the review fleet's list, which its review branch carries under `groups/branches-and-pull-report-truly.md`. Each child carries one finding, with its failure path and the verifier's note.

The route runs this way:

- `./RUNME.sh branch open` commits a marker on `main` and pushes it, so the box cuts `work/branches-and-pull-report-truly` off `main` by hand, as the branches of `#138` and `#140` did
- the high finding takes the standard route, so a red case proves the fault before the fix
- every other finding takes the trivial route, since the list's fix sketch is its design, and each meets a failing case before its fix
