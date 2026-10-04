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
group: the-verbs-run-in-go
enabled_by: migration.phase11
cloud: true
depends_on: ["quack-holds-a-verb-registry"]
step: retro/cloud
record:
  - step: sync
    hand: box 6f8b02d3b81e · claude-code-remote
    hash_before: 9a5042d133c3ce74cfd00d4079804dcfe59d1a21
    hash_after: ff652cfafa02f27e7e7bb88a3f23d1b94cba0d46
  - step: sync
    hand: box 08f4218ba236 · claude-code-remote
    hash_before: ff652cfafa02f27e7e7bb88a3f23d1b94cba0d46
    hash_after: d482e87c3e5dc1fb604795152086d2b4b6f5bad6
  - step: sync
    hand: box 08f4218ba236 · claude-code-remote
    hash_before: 0dd7828eab172efc04e35f5fffb9b7a0f0a9ca6f
    hash_after: 0dd7828eab172efc04e35f5fffb9b7a0f0a9ca6f
    answered:
      - name: sync
        exit: 0
        said: work/retro-verbs-run-in-go already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box 08f4218ba236 · claude-code-remote
    hash_before: 0a8556dd00670a4f4fb3309055a70b35aa6193b4
    hash_after: 0a8556dd00670a4f4fb3309055a70b35aa6193b4
    inputs:
      - name: ask
        hash: b0f8341cbe2d0d9d
        size: 283
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: 3eaee7b8cc71d34a
        size: 11400
    def: cb8f90bc86fc7d39
  - step: children
    hand: the engine
    hash_before: 47f667d2357fe1ad5d465860e5162f1331ede991
    hash_after: 47f667d2357fe1ad5d465860e5162f1331ede991
  - step: accept
    hand: box 08f4218ba236 · claude-code-remote
    hash_before: 54d155f08506cd317d3634a26c5189b8a5713df2
    hash_after: 54d155f08506cd317d3634a26c5189b8a5713df2
    answered:
      - name: sync/sync
        exit: 0
        said: work/retro-verbs-run-in-go already carries every commit on main.
    inputs:
      - name: ask
        hash: b0f8341cbe2d0d9d
        size: 283
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: 3eaee7b8cc71d34a
        size: 11400
    def: 07c43ae7253713ec
  - step: accept
    hand: box f8b693e22e97 · claude-code-remote
    hash_before: d482e87c3e5dc1fb604795152086d2b4b6f5bad6
  - step: accept
    hand: box f8b693e22e97 · claude-code-remote
    hash_before: 1031767f13b9db60de5c1dda4eb2a87dfdcbd80b
    hash_after: 1031767f13b9db60de5c1dda4eb2a87dfdcbd80b
    answered:
      - name: sync/sync
        exit: 0
        said: work/retro-verbs-run-in-go already carries every commit on main.
    inputs:
      - name: ask
        hash: b0f8341cbe2d0d9d
        size: 283
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: 3eaee7b8cc71d34a
        size: 11400
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box f8b693e22e97 · claude-code-remote
    hash_before: d2f8e062dac0776fdef3d29ca61a08d5cfaa724e
    hash_after: d2f8e062dac0776fdef3d29ca61a08d5cfaa724e
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
  - step: retro/write
    hand: box f8b693e22e97 · claude-code-remote
    hash_before: 0ab16d91df021f622ff15ae4f75fc8891f37f970
    hash_after: 0ab16d91df021f622ff15ae4f75fc8891f37f970
    inputs:
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: retro/notes
        hash: 310d2ddd3fe31ac9
        size: 36
    def: 1246a42e29e7ae98
  - step: retro/cloud
    hand: box f8b693e22e97 · claude-code-remote
    hash_before: 661c9d9f2033f8f0502dbb63399471c3245c2b20
    hash_after: 661c9d9f2033f8f0502dbb63399471c3245c2b20
    inputs:
      - name: retro/write
        hash: 3323dc4dc4b76051
        size: 2138
    def: 4da1ca5da87d5bbc
reason: done
---

# Ask

Part of phase 11 of [[spec/design_input/the-migration-runs-in-slices#the-phases]]: the verbs retro leave Node.

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

- [[spec/tickets/retro-verbs-port-to-go]], standard
- [[spec/tickets/retro-port-size-names-pull]], trivial
- [[spec/tickets/se-minted-pass-binds-mint]], trivial
- [[spec/tickets/retro-registry-test-starts-green]], trivial

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the port is one ticket because one verb leaves Node whole, and its diff reads one file a sub-verb, each beside its own test; the three gate points stand small
- the children add up to the goal: every retro sub-verb runs in Go, the retro JavaScript and every module only it imported leave, and a search finds no importer left
- the three gate points wait on the port, which closed before them, so none names depends_on

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

- retro-new-undoes-its-draft: retro new removes its draft where the open refuses, with a case
- retro-reads-the-work-root and se-minted-guard-refuses: handed back, their code stood from the last box
- retro-go-lint-clears: the retro Go files name their numbers and split under the line cap
- two merges of main, each keeping main's registry tests whole
- the stale hold moved through branch take, and the accept passed

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

- the registry design kept the merges small: each conflict took main's side whole
- a helper cleared the lint while the tickets moved, so the wait cost little
- the saved tree carried the work across the take, because main stood still between them

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->
<!-- the form is list -->

- 17:20 the owner prompt orders a merge of main before the take
- 17:22 git merge meets the cage, and branch sync takes its place
- 17:24 the index dies after the sync, and serve brings it back
- 17:30 the commit's push meets the stale hold, and the take refuses the unpushed commits
- 17:31 the push verb refuses the warnings the retro port left
- 18:00 the accept hand-back moves no hold, since only a take entry holds one
- 18:06 the index dies twice after the branch switch, and a fresh serve answers

### improve

<!-- how each bad line stops happening, named by its home -->
<!-- the form is list -->

- the order: branch take first, then the merge, in the work skill and the owner prompt the dispatcher writes
- the deadlock: take refuses unpushed commits on a stale branch, so the take keeps them through a merge (a fix ticket on take.go)
- the hold: a hand-back on the group could move a stale hold (the prepush rule in prepush.js)
- the index: a branch switch kills it, which the cage then reads as no cage (an index ticket)

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The engine's take resets onto origin, so any work before it dies. The owner's order ran into that. The way out was a saved branch and a checkout of its tree, which held only because main stood still.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each fact names its file once, and no note repeats it
- no number lands in the change without a name
- the new file headers say what each file is for
- the badly list carries the owner prompt and each error with its time
- the chapter names the role alone

## cloud

true

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->
<!-- the form is list -->

- no tool, host or right was refused on this box

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->
<!-- the form is list -->

- 17:22 the cage refused git merge, git push and git reset, each naming its verb
- 17:30 the pre-push hook refused the stale hold until the take
- 17:24 and 18:06 the index died, and serve brought it back
- 18:04 a second conflict with main at sync, in the registry test

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->
<!-- the form is list -->

- no person step parked
- every ticket minted stands in this group
- the local branch retro-save holds the pre-take tip, and nothing reads it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
