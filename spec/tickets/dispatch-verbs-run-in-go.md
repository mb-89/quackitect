---
kind: [[ticket]]
state: closed
reason: done
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
process_hash: d9f9539fef3ec913
record:
  - step: sync
    hand: box 89388e314a84 · claude-code-remote
    hash_before: 457d7c0e9a5ae961d478cc064507bf4d72091fc6
    hash_after: 9029bf54a1b27219d09122a31de30937c5148292
  - step: sync
    hand: box 00e5f1a1f19b · claude-code-remote
    hash_before: 9029bf54a1b27219d09122a31de30937c5148292
    hash_after: 2848bf22b5589eca7f9cb951c2976b93de20f31d
  - step: sync
    hand: box 00e5f1a1f19b · claude-code-remote
    hash_before: 2f23711b7ab7c5fc19fc52cd19aa9d7b20816cd8
    hash_after: 2f23711b7ab7c5fc19fc52cd19aa9d7b20816cd8
    answered:
      - name: sync
        exit: 0
        said: work/dispatch-verbs-run-in-go already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box 00e5f1a1f19b · claude-code-remote
    hash_before: d32a75f6f383111a020e3bc6b578a98d30b9298a
    hash_after: d32a75f6f383111a020e3bc6b578a98d30b9298a
    inputs:
      - name: ask
        hash: 19a4399aa4f5b440
        size: 286
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: 3eaee7b8cc71d34a
        size: 11400
    def: cb8f90bc86fc7d39
  - step: children
    hand: the engine
    hash_before: b1ca94f1b1032ee33b0a6214e32308c28e7c981c
    hash_after: b1ca94f1b1032ee33b0a6214e32308c28e7c981c
  - step: accept
    hand: box 00e5f1a1f19b · claude-code-remote
    hash_before: cd76b01faac59d410fb3cc3a350a2a4d5073b235
    hash_after: cd76b01faac59d410fb3cc3a350a2a4d5073b235
    answered:
      - name: sync/sync
        exit: 0
        said: work/dispatch-verbs-run-in-go already carries every commit on main.
    inputs:
      - name: ask
        hash: 19a4399aa4f5b440
        size: 286
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: 3eaee7b8cc71d34a
        size: 11400
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box 00e5f1a1f19b · claude-code-remote
    hash_before: daa103704da554443da8bd804b901ffb3f619479
    hash_after: daa103704da554443da8bd804b901ffb3f619479
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
  - step: retro/write
    hand: box 00e5f1a1f19b · claude-code-remote
    hash_before: 1d4685cd5fe3a624099fd2a2478145ab9600e7b4
    hash_after: 1d4685cd5fe3a624099fd2a2478145ab9600e7b4
    inputs:
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: retro/notes
        hash: 310d2ddd3fe31ac9
        size: 36
    def: 1246a42e29e7ae98
  - step: retro/cloud
    hand: box 00e5f1a1f19b · claude-code-remote
    hash_before: a6625afc03fa65c1bb245b5769d79bf2d3c4a865
    hash_after: a6625afc03fa65c1bb245b5769d79bf2d3c4a865
    inputs:
      - name: retro/write
        hash: 040d8ee98c79cd9f
        size: 1968
    def: 4da1ca5da87d5bbc
group: the-verbs-run-in-go
depends_on: ["quack-holds-a-verb-registry", "work-verbs-run-in-go"]
enabled_by: migration.phase11
---

# Ask

Part of phase 11 of [[spec/design_input/the-migration-runs-in-slices#the-phases]]: the verbs dispatch leave Node.

Done when these verbs run in Go with their contract tests passing, and their JavaScript files, and every JavaScript module no remaining JavaScript imports, leave the tree.

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

- [[spec/tickets/dispatch-verbs-port-to-go]] (standard, closed)

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- small enough: the one child ports one verb, dispatch, and its review read it whole
- adds up to the goal: src/quack/dispatch.go registers dispatch in Go, src/scripts/verbs holds no dispatch.js, no file in src, test or .claude imports the dispatch modules that left, every module they imported keeps other importers, and ./RUNME.sh check exits 0, so I mint no further child
- depends_on: the one child waits on no sibling

# children

# accept

<!-- reads the diff since its last verdict against the goal and every prose criterion, and names what falls short as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept
- the goal holds: src/quack/dispatch.go registers dispatch in Go over src/branches, and src/scripts/verbs names no dispatch
- the JavaScript left: dispatch.js, dispatch-write.js and dispatch-fire.js, their tests, and no importer of them stands in src, test or .claude
- no orphan: every module the deleted files imported keeps other importers
- cases: go test ./src/branches ./src/quack passes, and the case work-stands.test.js dropped stands as TestDispatchHoldsADependentOnAParentWithNoBranch
- ./RUNME.sh check exits 0, past its time budget as a warning
- branch review names nothing to fix

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

- the merge of main resolved: test/contract/verb-programs.test.js takes main's side, which reads the verb folder and the Go registry
- sync, split, accept and retro/notes passed on dispatch-verbs-run-in-go
- the goal read against the tree: dispatch runs in Go, its JavaScript and tests left, no orphan module stands

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

- the conflict resolved on one read, because main's test reads the folder and names no verb
- the accept read fast, because the child's port carried a Go case for each JavaScript case it dropped

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->
<!-- the form is list -->

- 22:15 UTC: a git checkout and git add on the conflicted file met GitWritesThroughAVerb, and the write went through the patch door instead
- 22:16 UTC: three patch calls failed with the index restarts, because a doctor run rebuilt the index while they waited
- 22:22 UTC: the sync field took prose, then a bare verb, before the hand-back took ./RUNME.sh branch sync
- the check took past its budget under battery.budget, with go the slowest part
- no owner prompt turned the run, since a schedule started it

### improve

<!-- how each bad line stops happening, named by its home -->
<!-- the form is list -->

- the branch take brief: name the patch door as the road for a conflicted file
- the doctor verb: leave the index standing while a patch waits on it
- the command form in spec/schemas: show a full ./RUNME.sh line as the example
- the check budget stays a warning, and the battery owner weighs the go part

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The group came to this box with its one child closed and only the merge in the way. The work was reading the goal against the tree, not writing code. I weighed whether the dropped JavaScript case left a hole, and found its Go twin before I accepted.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- one place: the change adds no fact, it takes main's test as it stands
- numbers: the change adds no number
- headers: the change writes no header
- prompts and errors: badly lists each error with its time, and no owner prompt came
- role: the chapter names the box by role and carries no name, address or path

## cloud

true

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->
<!-- the form is list -->

- nothing: no tool, host, right or install stood missing

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->
<!-- the form is list -->

- a conflict at take: main and the branch both changed test/contract/verb-programs.test.js, resolved to main's side
- the hook GitWritesThroughAVerb at 22:15 UTC, on a git add
- the index restarting at 22:16 UTC under three patch calls
- the check past its budget, as a warning

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->
<!-- the form is list -->

- no person step parked
- no ticket minted
- the handover: the group stands accepted, its retro written, and the pull request to main carries auto-merge

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
