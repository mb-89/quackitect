---
kind: [[ticket]]
state: open
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
step: retro/cloud
record:
  - step: sync
    hand: box a694567529c5 · claude-code-remote
    hash_before: 2ee966bb48952e1a68afe7ba643b5965d1666195
    hash_after: 7fd222bdc5920139c62dddd31422ae5161f6b7df
  - step: sync
    hand: box a694567529c5 · claude-code-remote
    hash_before: 33fcf457f97ca50658c5ca2d6761c8740eeaa706
    hash_after: 33fcf457f97ca50658c5ca2d6761c8740eeaa706
    answered:
      - name: sync
        exit: 0
        said: work/level-zero-smoke already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box a694567529c5 · claude-code-remote
    hash_before: 7757d107cc1007e54d491cfabe8424002f59b659
    hash_after: 7757d107cc1007e54d491cfabe8424002f59b659
    inputs:
      - name: ask
        hash: ee168782689e2bf1
        size: 576
    def: cb8f90bc86fc7d39
  - step: children
    hand: the engine
    hash_before: 9c44175609f0e6ed7cef7636d63fb0fb5567e5c7
    hash_after: 9c44175609f0e6ed7cef7636d63fb0fb5567e5c7
  - step: accept
    hand: box a694567529c5 · claude-code-remote
    hash_before: 0f2ab935e70320bcbdc3b43db1d2f9eb5d151ef9
    hash_after: 0f2ab935e70320bcbdc3b43db1d2f9eb5d151ef9
    answered:
      - name: sync/sync
        exit: 0
        said: work/level-zero-smoke already carries every commit on main.
    inputs:
      - name: ask
        hash: ee168782689e2bf1
        size: 576
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box a694567529c5 · claude-code-remote
    hash_before: b4a085ec897d62dcea525f6c82c1625c94cbd79b
    hash_after: b4a085ec897d62dcea525f6c82c1625c94cbd79b
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
  - step: retro/write
    hand: box a694567529c5 · claude-code-remote
    hash_before: 83e3d86872e522a7bf751f65d1f7ba0b6f9fdad9
    hash_after: 83e3d86872e522a7bf751f65d1f7ba0b6f9fdad9
    inputs:
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: retro/notes
        hash: 310d2ddd3fe31ac9
        size: 36
    def: 1246a42e29e7ae98
  - step: retro/cloud
    hand: box a694567529c5 · claude-code-remote
    hash_before: 7536c7e41ef0bdcb62ca8c4c2d7673ee64468bcb
    hash_after: 7e9441fc85b258bc983d643c9f4384de75909973
    inputs:
      - name: retro/write
        hash: e4dd36d1460d661f
        size: 3799
      - name: [[spec/tickets/level0-smoke-runs-in-seconds]]
        hash: 1ba74feccc7fa8db
        size: 625
      - name: [[spec/tickets/probe-at-revision-guards-merges]]
        hash: 015d35ecc32e1941
        size: 508
      - name: [[spec/tickets/probe-at-stays-dry]]
        hash: 27c821b6ad5f4b81
        size: 602
      - name: [[spec/tickets/merge-deny-every-connector]]
        hash: d945b21bdfca39f5
        size: 430
      - name: [[spec/tickets/runme-road-waits-on-ready]]
        hash: 4db3bc82c38588d5
        size: 401
      - name: [[spec/tickets/the-check-ends-what-it-drops]]
        hash: 21bf3069c0e18f63
        size: 421
      - name: [[spec/tickets/ending-windows-tree-tested]]
        hash: c0611586865b9087
        size: 274
      - name: [[spec/tickets/vale-call-takes-endswhole]]
        hash: 78d2853b43624499
        size: 280
      - name: [[spec/tickets/the-index-outlives-the-check]]
        hash: 972de3a0dd10e09f
        size: 482
      - name: [[spec/tickets/door-outlives-taskkill-tree]]
        hash: cbdf1802dd8c454b
        size: 457
      - name: [[spec/tickets/level0-claims-name-the-platform]]
        hash: f2b473ba57ff3686
        size: 326
      - name: [[spec/tickets/platform-draft-names-checkdoors]]
        hash: 6797cbe800abc30c
        size: 278
      - name: [[spec/tickets/platform-red-line-tested]]
        hash: 933f016133cd9e76
        size: 232
    def: 4da1ca5da87d5bbc
  - step: split
    hand: box a694567529c5 · claude-code-remote
    hash_before: f5d2100d3bfbc25f744bd5f5b8b037e5b9f1bb5e
    hash_after: f5d2100d3bfbc25f744bd5f5b8b037e5b9f1bb5e
    returns: 1
    why: the hand takes it back
  - step: split
    hand: box a694567529c5 · claude-code-remote
    hash_before: bef6db86579b2d02e15d3e615365c5d261db8b98
    hash_after: 0f83a536f5f9ceddc38f1120af9647f8fa75f200
    inputs:
      - name: ask
        hash: ee168782689e2bf1
        size: 576
    def: cb8f90bc86fc7d39
  - step: children
    hand: box a694567529c5 · claude-code-remote
    hash_before: 72efc4be152ebd940efe9f7024feee7e0c408e76
    session: cse_01CC7ToBxZqmgbrgbZrD5Jj1
  - step: children
    hand: the engine
    hash_before: 47f08ac49f8c14545d74139207b632bf55028a51
    hash_after: 47f08ac49f8c14545d74139207b632bf55028a51
  - step: accept
    hand: box a694567529c5 · claude-code-remote
    hash_before: 67a501c365d702b22ade1c8a7b7cfa6d5e9187f5
    hash_after: 67a501c365d702b22ade1c8a7b7cfa6d5e9187f5
    answered:
      - name: sync/sync
        exit: 0
        said: work/level-zero-smoke already carries every commit on main.
    inputs:
      - name: ask
        hash: ee168782689e2bf1
        size: 576
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box a694567529c5 · claude-code-remote
    hash_before: bad20f7270389d9479ac69ae379fa760c3bf4fb7
    hash_after: bad20f7270389d9479ac69ae379fa760c3bf4fb7
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
  - step: retro/write
    hand: box a694567529c5 · claude-code-remote
    hash_before: a30f8e4fd0b973e1869b7c28041b769a9efbb077
    hash_after: a30f8e4fd0b973e1869b7c28041b769a9efbb077
    inputs:
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: retro/notes
        hash: 310d2ddd3fe31ac9
        size: 36
    def: 1246a42e29e7ae98
reason: done
---

# Ask

A pull request that breaks level zero cannot go green. A fast smoke test with the model faked runs level zero against the tree as it stands, in seconds, on Linux and Windows both, as a required check. The dry probe runs at any revision, so the merge that breaks level zero shows in one call, and auto-merge stays the one road to main. The index keeps its server through a check, a branch switch and a merge. A level-zero claim names the platform it ran on. Tests wait on events, never a timer, and the check ends every child process it gives up on, so no orphan stays running.

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

- [[spec/tickets/door-outlives-taskkill-tree]] trivial
- [[spec/tickets/ending-windows-tree-tested]] trivial
- [[spec/tickets/level0-claims-name-the-platform]] standard
- [[spec/tickets/level0-smoke-runs-in-seconds]] standard
- [[spec/tickets/merge-deny-every-connector]] trivial
- [[spec/tickets/platform-draft-names-checkdoors]] trivial
- [[spec/tickets/platform-red-line-tested]] trivial
- [[spec/tickets/probe-at-revision-guards-merges]] standard
- [[spec/tickets/probe-at-stays-dry]] trivial
- [[spec/tickets/runme-road-waits-on-ready]] standard
- [[spec/tickets/smoke-waits-for-the-door]] trivial
- [[spec/tickets/the-check-ends-what-it-drops]] standard
- [[spec/tickets/the-index-outlives-the-check]] standard
- [[spec/tickets/vale-call-takes-endswhole]] trivial

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each child is one change a reviewer reads whole, and every child stands closed
- the smoke test, the dry probe at a revision, the merge deny, the index server, the platform claim, the ready wait and the ended child process each have a child, so the goal stands covered
- every child closed in order on this branch, so none waits on another

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

- smoke-waits-for-the-door: the stop answer names the door's pid, and the stop client waits on it on Windows
- the merge of main keeps main's unparked and drops the branch's untodo, since both fixed one fault
- level-zero-smoke: the accept leaf passes on the reopened group

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

- the handover named the fix commit and the next verbs, so the box picked up in a few calls after the clear
- the branch test takes named files, which gave a road past a moved base

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->
<!-- the form is list -->

- 20:04 UTC: level zero cleared the conversation past its handover mark, and its prompt opened the window
- 20:05 UTC: the pull on main handed a cloud box the desk ticket desk-probe-reply-trial, which only a desk runs
- 20:06 UTC: the fail on that ticket landed a commit on main that the push door refuses, so it stays local
- 20:10 UTC: branch take met a conflict in the probe clear script and its test, from two fixes of one fault
- 20:12 UTC: the index dropped mid hand-back, and the pull answered connection refused
- 20:14 UTC: the merge commit named the ticket, so the branch test measured from it and found no test

### improve

<!-- how each bad line stops happening, named by its home -->
<!-- the form is list -->

- the pull: hand a cloud box no ticket whose ask names a desk alone, in spec/design_output/pull
- the fail verb: land no commit on main from a cloud box, in spec/design_output/pull
- the branch test: measure from the ticket's first commit on the branch, in src/branches/test.go
- the dispatch: read the tickets two live groups touch before both start, in the dispatch skill

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The Windows claim rests on a vet of the Windows build and the logic of the process handle, and the CI run on the pull request proves it or not. Two boxes fixed one fault in the probe clear script at once, so the merge chose the copy main already carries.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change adds the pid in one place, the stop answer, and the client reads it there
the change adds no number
the new files carry headers saying what they are for, and count nothing
the chapter carries the clear prompt and each error of the run with its time
the chapter names roles alone, and no box name, address or path

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->
<!-- the form is list -->

- the gh command line, all through the run, so GitHub work rides the GitHub connector tools

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->
<!-- the form is list -->

- the index restart after a check, early in the run and at 19:06, which this group fixes
- the GitWritesThroughAVerb hook at 19:11, which routes the push through the push verb
- the ShellWritesNothing hook at 19:15, which routes a scratch file through the write door
- no conflict at sync, since the branch carried every commit on main

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->
<!-- the form is list -->

- [[spec/tickets/desk-probe-reply-trial]] stands open on main for the owner, since the live client on a Windows desk lies past every box
- the Windows cases first run on the windows-latest runner, so the pull request CI reads their result
- the handover names the pull request, its CI and the backlog findings the retro names

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
