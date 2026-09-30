---
kind: [[ticket]]
state: closed
step: retro/cloud
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
    checklist: ["every child is small enough to review whole, or is a group itself", "the children add up to the goal, and nothing of the goal stands outside them", "a child that waits on another names it under depends_on"]
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
            says: how each bad line stops happening, named by its home
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
process_hash: 5d4a884bfb2491ff
record:
  - step: sync
    hand: box d889b5fc6cd8 · claude-code-remote
    hash_before: 29658dea603ac6cbf84d805c464b7e6e53cb920a
    hash_after: 8471d58f01d05a53f4e54fe7daf0226b512fb07a
  - step: sync
    hand: box d88aea6eafd6 · claude-code-remote
    hash_before: 8471d58f01d05a53f4e54fe7daf0226b512fb07a
    hash_after: 85d2fb604a52036b9449eaebaae4b4a50ed8bc61
  - step: sync
    hand: box d88cc0681fd4 · claude-code-remote
    hash_before: 85d2fb604a52036b9449eaebaae4b4a50ed8bc61
  - step: sync
    hand: box d88cc0681fd4 · claude-code-remote
    hash_before: 611f0c7e6a89d7343e4c5db62b48d7083ed25b81
    hash_after: 611f0c7e6a89d7343e4c5db62b48d7083ed25b81
    answered:
      - name: sync
        exit: 0
        said: work/tui-shell-switches-over already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box d88cc0681fd4 · claude-code-remote
    hash_before: f2932f9ef102997c8ce2984e9598efb68f5c1c58
    hash_after: f2932f9ef102997c8ce2984e9598efb68f5c1c58
    inputs:
      - name: ask
        hash: 0b88c45282ea1a19
        size: 336
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: e122785976621597
        size: 10947
    def: cb8f90bc86fc7d39
  - step: children
    hand: the engine
    hash_before: 647f24fdbaf124ecdf0e2852ca69001259305e4d
    hash_after: 647f24fdbaf124ecdf0e2852ca69001259305e4d
  - step: accept
    hand: box d88cc0681fd4 · claude-code-remote
    hash_before: 998707f51fad19b4e7f3fac5987a22b62f33ecd3
    hash_after: 998707f51fad19b4e7f3fac5987a22b62f33ecd3
    answered:
      - name: sync/sync
        exit: 0
        said: work/tui-shell-switches-over already carries every commit on main.
    inputs:
      - name: ask
        hash: 0b88c45282ea1a19
        size: 336
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: e122785976621597
        size: 10947
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box d88cc0681fd4 · claude-code-remote
    hash_before: 3b62eeb5472069e261f349fc95f76c91f3cf2db8
    hash_after: 3b62eeb5472069e261f349fc95f76c91f3cf2db8
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
  - step: retro/write
    hand: box d88cc0681fd4 · claude-code-remote
    hash_before: 9027734c541dad152c2e01726164e5f89120b4ca
    hash_after: 9027734c541dad152c2e01726164e5f89120b4ca
    inputs:
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: retro/notes
        hash: 310d2ddd3fe31ac9
        size: 36
    def: 1246a42e29e7ae98
  - step: retro/cloud
    hand: box d88cc0681fd4 · claude-code-remote
    hash_before: 6d2911e19d836cfa01169c44a6d924c3fb3856fe
    hash_after: 6d2911e19d836cfa01169c44a6d924c3fb3856fe
    inputs:
      - name: retro/write
        hash: 76967bf04ce1c98d
        size: 2830
    def: 4da1ca5da87d5bbc
depends_on: ["tui-shell-lands-in-shadow", "quack-verbs-switch-over", "read-topics-switch-over"]
enabled_by: migration.phase6switch
cloud: true
reason: done
---

# Ask

Phase 6 of [[spec/design_input/the-migration-runs-in-slices#the-phases]], switched over. The slice's key under `migration/config/slices/` moves to `new`, and the old path leaves the tree. The group waits for `migration.phase6switch` to read true in the tracked config on `main`.

Done when the window reads its data off the index alone.

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

- [[spec/tickets/v1-watch-streams-changes]] standard
- [[spec/tickets/v1-watch-sends-changes]] standard
- [[spec/tickets/the-work-tab-reads-v1]] standard
- [[spec/tickets/the-work-keys-call-actions]] standard
- [[spec/tickets/the-log-tab-reads-v1]] standard
- [[spec/tickets/the-tui-data-paths-leave]] standard
- [[spec/tickets/log-approach-matches-tree]] trivial
- [[spec/tickets/log-tab-takes-its-rows]] trivial
- [[spec/tickets/rows-cloud-matches-branches]] trivial
- [[spec/tickets/rows-todo-folds-overrides]] trivial
- [[spec/tickets/watch-callers-name-opens-on]] trivial
- [[spec/tickets/watch-refuses-before-it-streams]] trivial
- [[spec/tickets/work-tab-callers-complete]] trivial
- [[spec/tickets/work-tab-waits-sends-changes]] trivial

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each standard child is one piece of the window, and each trivial one is a finding a review minted
- the children add up to the goal: the watch, both tabs' reads, the keys' posts, and the switch with the compares gone. Every child stands closed, so nothing stands outside them
- the switch names the three reads it waits on under depends_on, and each tab names the watch

# children

# accept

<!-- reads the diff since its last verdict against the goal and every prose criterion, and names what falls short as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept

What I weigh:

- the goal holds: the work tab and the log tab read work/rows, work/open-tasks and log/rows over the /v1 watch, the keys post to /v1/actions, and the window holds no compare
- the grep line answers nothing, and ./RUNME.sh check exits 0 on 998707f51
- branch review saw one JS contract case time out while it booted an index. The same file passes alone, and two full checks on this code pass, so I read it as load on the review's run
- the window still reads the ticket schema and the colours off the disk. Both are config the tab weighs a value with, not rows it draws, so they stand outside this goal
- tree.golden.json carries drift from tickets past this group, because its generator reads every ticket. The merge reads that difference

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

- the-work-keys-call-actions: gate, change, tests-green and view. The work tab posts its four actions and writes no file
- the-tui-data-paths-leave: tests-red again, gate, change and tests-green. The window slice builds in as new, and the compares leave
- the group: sync, split and accept

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

- the red tests the earlier box wrote named every post, so the change went green on the first build
- the gate rows named the callers the drafts missed, so the builder fixed them in place and spent no round
- the generators wrote the schema, the command file and the size golden, so no generated file took a hand edit

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->
<!-- the form is list -->

- 07:44 branch take with the work/ prefix answered no free todo, and the bare group name took it
- 07:52 the classifier refused go vet and go test after an rm of tracked test files. The window cases built on newModel held the live index catalog, so a key could post to an index on the box
- 07:55 the pull tool ran from a sub folder and failed to find its script, and it did so again at 08:40
- 08:20 go test -update over quack rewrote tree.golden.json with drift from every ticket, and the shell write back stood refused
- 08:21 a quack test refused the tracked config holding window at its built-in value
- 08:30 the commit hook refused code in frame, log and work with no test beside it, since a deleted test counts for nothing
- 08:40 branch review timed out one contract case that booted an index, and it passed alone
- no owner prompt came during the run

### improve

<!-- how each bad line stops happening, named by its home -->
<!-- the form is list -->

- the branch take verb takes a name with the work/ prefix as the bare name
- the level0 plugin runs the pull tool from the tree root, whatever folder the shell stands in
- editWindow in src/tui/workedit_test.go hands the tab a fake, and it does so now
- src/quack/golden_test.go writes only the rows a narrow run names, so an update carries no other ticket's drift
- the approach of a switch ticket names the tracked key leaving the file, since the schema holds the built-in
- a draft deleting a package's last test names the case it adds beside the code

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The run weighed two costs of a large golden. A shell write back past the door breaks a rule, and a hand write of four hundred kilobytes invites an error. So the rewrite stays, named for the merge. The view step on a cloud box has no terminal, so a window-level case driving the chord stands in for the person's look.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- one place: the key's mode stands in migration.go, and the notes point at actions.go
- numbers: callWait names the wait in registry/v1.go, and keyWithin and postWithin name each case's wait
- headers: each new file opens on what it is for, and counts nothing
- the chapter carries the run's errors with their times, and no owner prompt came
- the chapter names roles, and carries no name or path of the box

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->
<!-- the form is list -->

- no terminal a person watches, at the view step of the-work-keys-call-actions, so a window case stood in
- the auto mode classifier refused go vet and go test over the window package, once each, before the cases held a fake

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->
<!-- the form is list -->

- the push guard refused a push on a commit the check had not run on, and a check then a push landed it
- the commit hook refused code in three packages with no test beside it
- the shell write door refused a restore of a golden file
- a contract case that boots an index timed out under the review's load, and passed alone

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->
<!-- the form is list -->

- no person step stands parked, and no ticket stands minted with no group
- the merge reads the tree.golden.json drift, which comes off its generator
- no handover, since the group reaches done in this session

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
