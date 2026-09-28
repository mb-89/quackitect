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
step: retro/cloud
cloud: true
record:
  - step: sync
    hand: box d7e093d924e2 · claude-code-remote
    hash_before: 54bb3667a95743dc934d6497ab7be9af6a770949
    hash_after: 3cf9840bc53e1fa1aa99f73f568292a7ec0a85f8
  - step: sync
    hand: box d7e252e948dd · claude-code-remote
    hash_before: 740a70cc04ef7abe6adf3287c4cd4050bfbaf480
    hash_after: 4c1abb877bfdc4ea82e1f3ffc4ca168715893a43
  - step: sync
    hand: box d7e3869061cf · claude-code-remote
    hash_before: 967e687d393df6ca053b3ccbf9f6e0b08fede631
    hash_after: 8af234ab46a0d7aa1ac4d951f5c09b37b10a58cd
  - step: sync
    hand: box d7e093d924e2 · claude-code-remote
    hash_before: 6d7763876fdefd613947175ddc968b651f5e226f
    hash_after: 6d7763876fdefd613947175ddc968b651f5e226f
    answered:
      - name: sync
        exit: 0
        said: work/the-cloud-works-its-queue already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box d7e093d924e2 · claude-code-remote
    hash_before: a75879490275fbe0a3e37247b7e9c793978e2171
    hash_after: a75879490275fbe0a3e37247b7e9c793978e2171
    inputs:
      - name: ask
        hash: ab2df188412542cd
        size: 716
      - name: [[spec/design_input/the-cloud-runs-itself]]
        hash: 591680bf2c6fc6d6
        size: 13376
    def: cb8f90bc86fc7d39
  - step: children
    hand: the engine
    hash_before: f087a34f991ea36982dc508cc28742144a297b04
    hash_after: f087a34f991ea36982dc508cc28742144a297b04
  - step: accept
    hand: box d81be38d5cd0 · claude-code-remote
    hash_before: b950f1d0e99b4bbee3acd587f30f0d55ac583dcc
    hash_after: 595a2fbc9f3366255d5e883440c1c038fc677645
    answered:
      - name: sync/sync
        exit: 0
        said: work/the-cloud-works-its-queue already carries every commit on main.
    inputs:
      - name: ask
        hash: ab2df188412542cd
        size: 716
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: [[spec/design_input/the-cloud-runs-itself]]
        hash: 591680bf2c6fc6d6
        size: 13376
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box d81be38d5cd0 · claude-code-remote
    hash_before: 7692f1d70bb9e659cc707696c617614fd9fb49e1
    hash_after: 7692f1d70bb9e659cc707696c617614fd9fb49e1
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
  - step: retro/write
    hand: box d81be38d5cd0 · claude-code-remote
    hash_before: 34cbd1cec5bb72075ed5aaa87a494e886002c02e
    hash_after: 34cbd1cec5bb72075ed5aaa87a494e886002c02e
    inputs:
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: retro/notes
        hash: 310d2ddd3fe31ac9
        size: 36
    def: 1246a42e29e7ae98
  - step: retro/cloud
    hand: box d81be38d5cd0 · claude-code-remote
    hash_before: 610360da4ca5c4df323853c8e17e0a475d151a2f
    hash_after: 3436537eb91e3a36ba6863eec3c6aa09df3d5b9b
    inputs:
      - name: retro/write
        hash: 98e576c8f0e720d7
        size: 2419
    def: 4da1ca5da87d5bbc
reason: done
---

# Ask

The cloud works its own queue, per [[spec/design_input/the-cloud-runs-itself]]. An hourly dispatch runs a verb that computes the plan and bundles the loose agent tickets into fix groups. It starts a worker per ready group.

A worker hands its group over as a pull request that merges itself on a green check. A group holds groups, so a big move runs as a chain of parent groups. A session boots off the repo alone. A scheduled Action fires the workers with no model, once the owner stores the token. The old road keeps working until the new one stands whole, and the running migration keeps its switches.

Done when every child closes through the command it names, and `./RUNME.sh check` passes on Linux and Windows.

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

- [[spec/tickets/agents-keeps-the-desk-rule]], on the trivial process
- [[spec/tickets/an-action-fires-the-workers]], on the standard process
- [[spec/tickets/boot-and-bridgehead-install-once]], on the trivial process
- [[spec/tickets/boot-hook-names-its-span]], on the trivial process
- [[spec/tickets/boot-probes-an-untrusted-clone]], on the trivial process
- [[spec/tickets/dispatch-cuts-the-fix-name]], on the trivial process
- [[spec/tickets/dispatch-drops-the-trunk-marker]], on the trivial process
- [[spec/tickets/dispatch-prints-its-plan]], on the standard process
- [[spec/tickets/dispatch-removes-its-worktree]], on the trivial process
- [[spec/tickets/dispatch-reuses-mark-off]], on the trivial process
- [[spec/tickets/dispatch-write-file-size]], on the trivial process
- [[spec/tickets/dispatch-writes-the-bundles]], on the standard process
- [[spec/tickets/done-points-at-the-pull]], on the trivial process
- [[spec/tickets/fix-groups-end-the-chain]], on the standard process
- [[spec/tickets/fix-schema-case-reads-fix]], on the trivial process
- [[spec/tickets/groups-hold-groups]], on the standard process
- [[spec/tickets/groups-land-through-pull-requests]], on the standard process
- [[spec/tickets/merge-reads-open-pulls]], on the trivial process
- [[spec/tickets/reject-copies-read-their-round]], on the standard process
- [[spec/tickets/reject-fixture-takes-standard-route]], on the trivial process
- [[spec/tickets/second-draft-pass-case]], on the trivial process
- [[spec/tickets/sessions-boot-from-the-repo]], on the standard process
- [[spec/tickets/take-case-asserts-the-switch]], on the trivial process
- [[spec/tickets/take-hands-a-stale-handover]], on the trivial process
- [[spec/tickets/take-reads-the-parent-chain]], on the trivial process
- [[spec/tickets/the-skills-start-the-workers]], on the standard process

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

every child is a point ticket on the trivial route, or a standard ticket reviewed whole, and needs no group of its own.
the children cover the dispatch plan, its bundles, the fix groups, nested groups, the pull request hand-back, the boot and the Action. The old road keeps working beside them.
an-action-fires-the-workers names the-owner-stores-the-token and its bases under depends_on, as do the standard tickets waiting on another.

# children

# accept

<!-- reads the diff since its last verdict against the goal and every prose criterion, and names what falls short as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept
- Every child closes through the command it names, and the local check exits 0 on the branch tip.
- The Linux runner passes on the fire commit. The Windows runner failed two worktree cases there, and the branch tip carries their fix.
- The Action replaces the dispatch skill's starts, and the skill now reads the dry run alone.
- The old road still stands: the work routine and the desk merge keep working beside the Action.

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

an-action-fires-the-workers closes done: the dispatch Action fires the work routine, opens the issues and opens the write branch's pull request
the dispatch rows read with forward slashes, so the worktree cases pass on Windows
main comes in twice, and the second merge keeps both sides' cases
list-fields-land-one-a-line and a-helper-pulls-past-the-plan stand loose for a fix group

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

the fire page answers the header, the caps and the error envelope, so the fire script carries each once
the fake http door answers the fire cases, so no case reaches the network
the gate helper names the version constant and a case through the verb, and the change takes both

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->
<!-- the form is list -->

18:13, branch take moves the box onto another group's stuck hand-over, and a release and a checkout bring it back
18:20, the door refuses a date in the draft's prose, and the draft names the version by the fire page
18:22, the engine joins each list field with commas, so the red list names one file standing nowhere
18:24, the plan's work in hand stops the gate helper's pull, and the helper loops until the plan clears
18:29, DoorsOnly refuses a local server import in the contract case, and the wire door serves it
18:30, the skills contract still holds the dispatch skill to the JSON road the ask retires
18:31, the commit door pairs each changed file with a staged test, and a contract case names both
18:36, the Windows runner reads backslashed git rows in two worktree cases
18:39, main conflicts in the work-stands case file, and the merge keeps both sides

### improve

<!-- how each bad line stops happening, named by its home -->
<!-- the form is list -->

the list join: spec/tickets/list-fields-land-one-a-line
the helper loop: spec/tickets/a-helper-pulls-past-the-plan
the backslashed rows: gitRows in the dispatch fixtures now reads forward slashes
the take's detour: a prompt naming its branch pulls on that branch, and skips the take

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The ask reads as one ticket, and it reaches a door, a script, a workflow and a skill. The door carries most of the weight, because the tree holds the outside inside a door. The session starts with no owner prompt, so every call stands as its own.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the version, the cap and the label each stand once, in the fire script
the fire script names each number as a constant at its top
every new file opens with a comment saying what it does
the run carries no owner prompt, and each error stands with its time
the chapter names roles alone

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->
<!-- the form is list -->

the real routine and the GitHub API stand out of this box's reach, so the fire runs over the fake http door alone
the Windows runner stands out of reach too, so its fault shows on the pushed commit alone

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->
<!-- the form is list -->

the push gate held the first push on a warning main brought in, and a cut sentence cleared it
the second sync met a conflict in the work-stands cases, and the merge keeps both sides
the Windows runner failed two worktree cases the Linux box passes

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->
<!-- the form is list -->

spec/tickets/the-owner-runs-the-dispatch: a question, the owner starts the Action once and confirms the agent's calls
spec/tickets/the-work-branch-opens-no-pull: a question, the owner rules whether a cloud box opens its group's pull request
spec/tickets/list-fields-land-one-a-line: minted with no group, for a fix group
spec/tickets/a-helper-pulls-past-the-plan: minted with no group, for a fix group

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
