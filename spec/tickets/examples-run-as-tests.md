---
kind: [[ticket]]
state: open
step: accept
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
cloud: true
record:
  - step: sync
    hand: box 70672ee0ff0d · claude-code-remote
    hash_before: aeb4732cc631937ac8d7df6f36b7f46c9848751a
    hash_after: aeb4732cc631937ac8d7df6f36b7f46c9848751a
    answered:
      - name: sync
        exit: 0
        said: work/examples-run-as-tests already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box 70672ee0ff0d · claude-code-remote
    hash_before: 0e0a232976d883f9288b741545378c8dec577982
    hash_after: 0e0a232976d883f9288b741545378c8dec577982
    inputs:
      - name: ask
        hash: 4df0b47ac1b5a066
        size: 563
      - name: [[spec/design_output/examples]]
        hash: 5245c4fe35ade37e
        size: 8237
    def: 19b6849b1f151cd5
  - step: children
    hand: box 42197a224bb7 · claude-code-remote
    hash_before: 2b55f3452f9c85794ab53ace94bb4d949edfddae
    session: cse_019ptR8yR5LL6i15jhgQ32Ag
    hash_after: b411f17cb44a63904b8358f37cf4bbd6e92a3caa
  - step: children
    hand: box 23ee163eaf36 · claude-code-remote
    hash_before: b3a71e59f78677e453d134e3c75d47d0460d12d6
    session: cse_01Dx32SEhQn8DWKT3wqYqKkH
    hash_after: c9fd5e7400242e54f5f107e50ad3950f004c7271
  - step: children
    hand: the engine
    hash_before: b6a6c61304229f75c584cc0fb9595299b1ce96d1
    hash_after: b6a6c61304229f75c584cc0fb9595299b1ce96d1
  - step: accept
    hand: box 23ee163eaf36 · claude-code-remote
    hash_before: bb845dbb02d25c43e8eaffbb1f791004df1a0ffa
    hash_after: 27f082fc607d330c9d434b48afbe73e44be48166
    answered:
      - name: sync/sync
        exit: 0
        said: work/examples-run-as-tests already carries every commit on main.
    inputs:
      - name: ask
        hash: 4df0b47ac1b5a066
        size: 563
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: [[spec/design_output/examples]]
        hash: cbfcdb18dc87799c
        size: 8264
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box 1fb91bdd8469 · claude-code-remote
    hash_before: c9fd5e7400242e54f5f107e50ad3950f004c7271
    session: cse_01P536X1u8Aahi2wtLPf8JB9
  - step: split
    hand: the engine
    stale: [[spec/design_output/examples]]
  - step: split
    hand: box 1fb91bdd8469 · claude-code-remote
    hash_before: ea1a3d5e94910d0a023cd21d72c725ee80f6a805
    hash_after: ea1a3d5e94910d0a023cd21d72c725ee80f6a805
    inputs:
      - name: ask
        hash: 4df0b47ac1b5a066
        size: 563
      - name: [[spec/design_output/examples]]
        hash: cbfcdb18dc87799c
        size: 8264
    def: 19b6849b1f151cd5
  - step: children
    hand: the engine
    hash_before: 5b0edb901a52ecebb9563642a05515f2659e6a4c
    hash_after: 5b0edb901a52ecebb9563642a05515f2659e6a4c
  - step: accept
    hand: box 1fb91bdd8469 · claude-code-remote
    hash_before: 9a53cedbb5cafce3535bfb5464ebc050700cc875
    hash_after: 9a53cedbb5cafce3535bfb5464ebc050700cc875
    answered:
      - name: sync/sync
        exit: 0
        said: work/examples-run-as-tests already carries every commit on main.
    inputs:
      - name: ask
        hash: 4df0b47ac1b5a066
        size: 563
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: [[spec/design_output/examples]]
        hash: cbfcdb18dc87799c
        size: 8264
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box 1fb91bdd8469 · claude-code-remote
    hash_before: a81f51349b21ead2faee8d3f5955a95e026844b2
    hash_after: a81f51349b21ead2faee8d3f5955a95e026844b2
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
  - step: retro/write
    hand: box 1fb91bdd8469 · claude-code-remote
    hash_before: 7085b7b50e26d4a94fb216bb4dc535e3d3bcc3f4
    hash_after: 7085b7b50e26d4a94fb216bb4dc535e3d3bcc3f4
    inputs:
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: retro/notes
        hash: 310d2ddd3fe31ac9
        size: 36
    def: e7ed0badf886b5b5
  - step: retro/cloud
    hand: box 1fb91bdd8469 · claude-code-remote
    hash_before: 7c2dd7dfd606f69b6ca565a3e41085daaf2ed24c
    hash_after: 7c2dd7dfd606f69b6ca565a3e41085daaf2ed24c
    inputs:
      - name: retro/write
        hash: 824af3ca2bbefe82
        size: 2379
    def: 4da1ca5da87d5bbc
  - step: accept
    hand: box 1fb91bdd8469 · claude-code-remote
    hash_before: 4f38d45710ca658674405db7ff55f959180481e9
    hash_after: 4f38d45710ca658674405db7ff55f959180481e9
    returns: 1
    why: the hand takes it back
reason: done
---

# Ask

Examples run as the behavior tests and read as the tutorial, as [[spec/design_output/examples]] designs them. A schema and one parser read an example into steps. A Go harness runs every example inside the check over faked doors, and a verb runs one detached against the real system in a scratch clone.

A Tutorial tab explores them with a two-mode search. The coverage checks report the gaps, and the retro counts them. The first chapters stand, and the tests they make redundant leave. Each guard lands in report mode, and turns to refuse once the tree meets it.

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

- [[spec/tickets/example-coverage-check-reports]], standard
- [[spec/tickets/example-first-chapters-stand]], standard
- [[spec/tickets/example-harness-runs-on-fakes]], standard
- [[spec/tickets/example-retro-counts-gaps]], standard
- [[spec/tickets/example-retro-gaps-shown-name]], trivial
- [[spec/tickets/example-run-pauses-between-steps]], trivial
- [[spec/tickets/example-run-verb-clones]], standard
- [[spec/tickets/example-schema-reads-steps]], standard
- [[spec/tickets/example-tutorial-search-finds]], standard
- [[spec/tickets/example-tutorial-tab-draws]], standard
- [[spec/tickets/harness-copies-stand-apart]], trivial
- [[spec/tickets/harness-draft-follows-seen]], trivial
- [[spec/tickets/harness-fakes-the-model]], trivial
- [[spec/tickets/harness-meets-a-real-example]], trivial
- [[spec/tickets/io-start-fault-shows]], trivial
- [[spec/tickets/seed-splits-under-bus-cap]], trivial
- [[spec/tickets/sweep-reads-tracked-after-restart]], standard
- [[spec/tickets/tips-carry-branch-changes-alone]], standard

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every child is small enough to review whole, and each stands closed
- the children add up to the goal: the eight design children build it, and the rest are fixes the run met inside it
- each waiting child names its sibling under depends_on
- each child reads its siblings through depends_on, and the pull lands them in that order
- the diff stays one group, and no child grew past one review

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

- the take met a conflict with main across eleven files, and the merge resolved them, the check reading its disk through the box disk doors
- the example verb reads through the disk doors, and its pause stands among the box doors
- the merge check went green: the fixture guard baseline drops six rows, stale pointers and an anchor point at what main holds, and the hooks guard takes the shared text helper
- `tips-carry-branch-changes-alone` closed: a tip carries its changes against trunk alone, and the live tips land under the bus cap
- the group split lists every child, and accept passed

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

- the conflict resolution read the base beside both sides, so each hunk took a union and no change got dropped
- a worktree of the branch before the merge told a merge fault from one the branch already carried
- the red tests from tests-red decided the tips change, so the build ran straight to green

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->
<!-- the form is list -->

- 21:30 the merge commit refused four times in a row: a model trailer, a stale path, report findings read as refusals, and a copied helper main brought in
- 21:20 the example fixture went empty after the merge, since main moved its TestMain behind the contract build tag
- 21:52 the change hand-back refused for no staged test, though its red tests landed a step earlier

### improve

<!-- how each bad line stops happening, named by its home -->
<!-- the form is list -->

- the commit verb names its refusing findings first, apart from the report-mode ones it lists, in `src/quack/commit.go`
- a fixture built in TestMain lands as a package initializer, so a build tag moving TestMain leaves it standing, in `src/quack/examples_harness_test.go`
- the tested rule reads the tests-red evidence of a held ticket as carried tests, in `src/modules/hooks/command/tested.go`

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

Most of the session went to taking main in, not to the group's own work. Main carried its own red: a removed test still named, a renamed ticket still pointed at, and a helper copy the rule refuses. The check's rule says to green it whoever put the fault there, so the merge took those fixes in.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each fix points at the note owning it, and no rule got copied
- the change adds one constant, deletedStatus, named once in the git module
- no new file got a header, and the edited headers count nothing
- the badly list carries each error with its time off the commits
- the chapter names the role alone, with no name, address or box path

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->
<!-- the form is list -->

- 21:15 the level0 tool server dropped right after the take, so every step ran through RUNME.sh in its place

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->
<!-- the form is list -->

- 21:15 a conflict at sync with main across eleven files
- 21:52 the commit hook refusing a change whose tests landed a step earlier

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->
<!-- the form is list -->

- no person step parked, and no ticket minted outside the group

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
