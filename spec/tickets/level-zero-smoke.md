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

- [[spec/tickets/level0-smoke-runs-in-seconds]] standard
- [[spec/tickets/probe-at-revision-guards-merges]] standard
- [[spec/tickets/probe-at-stays-dry]] trivial
- [[spec/tickets/merge-deny-every-connector]] trivial
- [[spec/tickets/the-index-outlives-the-check]] standard
- [[spec/tickets/door-outlives-taskkill-tree]] trivial
- [[spec/tickets/level0-claims-name-the-platform]] standard
- [[spec/tickets/platform-draft-names-checkdoors]] trivial
- [[spec/tickets/platform-red-line-tested]] trivial
- [[spec/tickets/runme-road-waits-on-ready]] standard
- [[spec/tickets/the-check-ends-what-it-drops]] standard
- [[spec/tickets/ending-windows-tree-tested]] trivial
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

- [[spec/tickets/level0-smoke-runs-in-seconds]]: probe smoke runs level zero over the working tree with the model faked, inside the check, on the Linux and Windows runners
- [[spec/tickets/probe-at-revision-guards-merges]] and [[spec/tickets/probe-at-stays-dry]]: probe dry takes --at a revision and stays dry
- [[spec/tickets/merge-deny-every-connector]]: the settings deny the merge tool under every GitHub connector, so auto-merge is the one road to main
- [[spec/tickets/runme-road-waits-on-ready]]: the road test waits on the index ready event
- [[spec/tickets/the-check-ends-what-it-drops]], [[spec/tickets/ending-windows-tree-tested]] and [[spec/tickets/vale-call-takes-endswhole]]: a child the check gives up on ends with its whole tree
- [[spec/tickets/the-index-outlives-the-check]] and [[spec/tickets/door-outlives-taskkill-tree]]: the index door stands apart from the process that starts it
- [[spec/tickets/level0-claims-name-the-platform]], [[spec/tickets/platform-draft-names-checkdoors]] and [[spec/tickets/platform-red-line-tested]]: every level-zero line names its platform

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

- the handover named the ticket, the leaf and the exact test command, so the box after the clear lost no turn finding its place
- a pipe held open by child and grandchild proves the tree kill with no timer, which kept the owner rule on tests whole
- trivial children minted at the gate kept each change small enough to read whole

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->
<!-- the form is list -->

- the owner prompt of the opening turn asked for the smoke, the ready wait and the ended child, and set the rules on timers and doors
- 19:06 the hand-back met no index after the check, and the CLI waited minutes on the restart, the fault this group fixes
- earlier in the run, three waits failed on the index restarting, for minutes each
- 19:08 the agent ended its turn claiming a helper still ran, and the stop refused it, since a cloud box stops its helpers when the turn ends
- 19:11 the agent ran git push in place of the push verb, and GitWritesThroughAVerb refused it
- 19:12 the agent ran past the plan grace, and the engine refused a call until the plan stood
- 19:13 the agent handed accept back with --pass beside a verdict field, and the pull refused it
- 19:15 the agent wrote a scratch file through a shell heredoc, and ShellWritesNothing refused it
- the door start in src/index/door.go waits on the door with a sleep loop, against the owner rule, and it stood on main before this group

### improve

<!-- how each bad line stops happening, named by its home -->
<!-- the form is list -->

- the index drop: src/index/detach.go lands with this group, and the next box after a check proves it
- the turn end on a cloud box: .claude/skills/work/SKILL.md says to wait inside the turn on a background command
- the push: .claude/skills/work/SKILL.md names ./RUNME.sh push at each push step
- the accept hand-back: the pull verb prints the accept line with --fields alone, and no --pass
- the heredoc: the agent passes JSON inline to the pull tool, which the work skill names
- the sleep loop: a backlog ticket has the door start wait on the door ready event, in src/index/door.go
- the became that skips an accept: a backlog ticket from the note became-skips-the-accept
- the commit door over tests-red: a backlog ticket from the note implement-reads-the-red-tests

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The box weighed minting the sleep-loop fix into this group and kept it out, because the loop predates the group and the cloud rule stops work at the branch edge. It assumed a note marked became rides the retro into the backlog.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each fact points at the ticket that owns it
- the retro adds no number past the times the run carries
- the retro writes no file header
- the badly list carries the owner prompt and each error with its time
- the chapter names the agent, the box and the owner by role, and no path of the box

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->

<!-- the form is list -->

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->

<!-- the form is list -->

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->

<!-- the form is list -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
