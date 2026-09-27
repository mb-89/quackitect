---
kind: [[ticket]]
state: open
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
    hand: box d7d8cca563b1 · claude-code-remote
    hash_before: 0c7092033b9aea4d01399c8cb050aeb2f4f4b126
    hash_after: ab8d84be2615248935bc3046795351a9db25892a
  - step: sync
    hand: box d7d9b0d5dfcf · claude-code-remote
    hash_before: 9c9b96164a4b65322ce6f036c27adad0a685b88b
    hash_after: 6c48e3aff045898183255abfadd9d28ad3b0c648
  - step: sync
    hand: box d7da794434cd · claude-code-remote
    hash_before: 1f2402558127390067e1cb890857e9d6213f6b61
    hash_after: 6b7e58e7eb304e36bed94be9a1589a4464f1def2
  - step: sync
    hand: box d7da794434cd · claude-code-remote
    hash_before: d4eea94d71c98d5fd0a6c23f59f392af6f9cf0b3
    hash_after: d4eea94d71c98d5fd0a6c23f59f392af6f9cf0b3
    answered:
      - name: sync
        exit: 0
        said: work/the-process-stays-editable already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box d7da794434cd · claude-code-remote
    hash_before: 430f30017e9d102c018f813f8ed80c007f4d3b29
    hash_after: 430f30017e9d102c018f813f8ed80c007f4d3b29
    inputs:
      - name: ask
        hash: f62f4ae3f6fd31d9
        size: 289
      - name: [[spec/design_input/level-two]]
        hash: b8bf73d993bb8909
        size: 15501
    def: cb8f90bc86fc7d39
  - step: children
    hand: the engine
    hash_before: b7fa2cef48afc8fdb8e12f0e4f724331903209eb
    hash_after: b7fa2cef48afc8fdb8e12f0e4f724331903209eb
  - step: accept
    hand: box d7da794434cd · claude-code-remote
    hash_before: c996d530c18b0c144549d69c7d6f184f1ca7deaf
    hash_after: c996d530c18b0c144549d69c7d6f184f1ca7deaf
    answered:
      - name: sync/sync
        exit: 0
        said: work/the-process-stays-editable already carries every commit on main.
    inputs:
      - name: ask
        hash: f62f4ae3f6fd31d9
        size: 289
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: [[spec/design_input/level-two]]
        hash: b8bf73d993bb8909
        size: 15501
    def: 07c43ae7253713ec
  - step: accept
    hand: box d7db071a74cf · claude-code-remote
    hash_before: e7de3998544b942d0ab5246230d8a088adfd61f0
    hash_after: 12e7afe427285e9d4eb1fd560a28bdf4da1d53d3
  - step: accept
    hand: box d7db20e2accf · claude-code-remote
    hash_before: e72e5b1478ce9ab6e4f5493e59108c42551ba825
    hash_after: b1a7ba59fe9736ba74970f82dba2f63f5bc4288e
  - step: accept
    hand: box d7db8e8df0103 · claude-code-remote
    hash_before: 9131daf2f67991683d7e10cf0f9929d36a71ca1a
  - step: accept
    hand: box d7db8e8df0103 · claude-code-remote
    hash_before: 72d5e1f4e39fc63741741ac9840a64faef83ba1a
    hash_after: 72d5e1f4e39fc63741741ac9840a64faef83ba1a
    answered:
      - name: sync/sync
        exit: 0
        said: work/the-process-stays-editable already carries every commit on main.
    inputs:
      - name: ask
        hash: f62f4ae3f6fd31d9
        size: 289
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: [[spec/design_input/level-two]]
        hash: b8bf73d993bb8909
        size: 15501
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box d7db8e8df0103 · claude-code-remote
    hash_before: e994e992e635f6f32dfdcd581599fc6801c52e79
    hash_after: e994e992e635f6f32dfdcd581599fc6801c52e79
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
  - step: retro/write
    hand: box d7db8e8df0103 · claude-code-remote
    hash_before: 7004edf2ba6ecc4c242db6c867c9ba0134b03c4e
    hash_after: 7004edf2ba6ecc4c242db6c867c9ba0134b03c4e
    inputs:
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: retro/notes
        hash: 310d2ddd3fe31ac9
        size: 36
    def: 1246a42e29e7ae98
depends_on: ["the-engine-holds-the-route"]
---

# Ask

A moved input marks exactly the steps that read it, and a process stays editable while it runs. A gate asks a bless where its process says, and the retro reads the backlog. [[spec/design_input/level-two]] asks it in its chapters Evidence and stale steps, The bless and The other processes.

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

[[spec/tickets/a-moved-input-marks-steps]] standard
[[spec/tickets/a-gate-asks-a-bless]] standard
[[spec/tickets/the-retro-reads-the-backlog]] standard, closes became [[spec/tickets/a-rewind-spares-landed-tests]]
[[spec/tickets/stale-shares-the-bless-hash]] trivial
[[spec/tickets/stale-fields-reach-test-schema]] trivial
[[spec/tickets/bless-guard-reads-scripts]] trivial
[[spec/tickets/bless-button-draws-itself]] trivial
[[spec/tickets/process-case-for-bless]] trivial
[[spec/tickets/cloud-list-reads-harness]] trivial
[[spec/tickets/retro-check-names-the-process]] trivial

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

each child is one ask with its own tests, small enough to review whole
the three standard children carry the three chapters the goal names, and each trivial child carries a review row of one of them
no child waits on another, since each review row lands after its parent passes design

# children

# accept

<!-- reads the diff since its last verdict against the goal and every prose criterion, and names what falls short as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept
- commit-stages-a-moved-path closes: the add in src/scripts/commit-verb.js takes a moved path only where it stands on disk or in the index, the commit still names it, and test/level0/commit-verb.test.js asserts both

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

commit-stages-a-moved-path: the add in the commit verb takes a moved path only where it stands on disk or in the index, and the commit still names it
the accept passes on that point, and the group walks on to its retro
retro notes: the box holds no private note

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

ticket todo parks a ticket with a parent and no group, and the next pull hands it out, so the group leaves the wait that held three boxes
the fake git answers ls-files by its arguments, so one test proves each side of the new guard

### badly

<!-- what did not, each with its moment in the log or the transcript -->
<!-- the form is list -->

10:15 the shell hook refuses branch take, since the description names no ticket and no ticket stands in hand before the take
10:16 the shell hook refuses the catch-all ticket, which stands closed
10:17 level zero refuses git writes in the scratchpad, so a trial of git add on a staged-away path runs nowhere
10:19 LandingFollowsItsGate refuses a test piped through tail and chained into the commit verb
no owner prompt turns the run

### improve

<!-- how each bad line stops happening, named by its home -->
<!-- the form is list -->

the shell hook: let branch take and ticket pull pass with no ticket, since they hand the ticket out
the cloud guidance: name ticket todo as the road for a point minted with a parent and no group
the voice rules: note that a command piped through tail loses its exit, so a gate reads the landing alone

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The last three boxes read the door refusal on the group line as a hard block. The todo verb writes the field the pull reads, so no door stood in the way. The git claim under the fix comes from how git matches a path, and no trial checks it here: add matches the index and the disk, and commit also matches HEAD.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the new fact stands once, in stagable in the commit verb, and the tests point at the ticket
the change adds no number
the change writes no header
the badly list carries each error off the transcript with its time, and no owner prompt came
the chapter names the role and carries no name, address or box path

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

The accept passes with the point `commit-stages-a-moved-path`, and the group waits at accept for it. The pull refuses that ticket to the session minting it, and `branch done` frees group children alone, so the retro leaf stays off this box. The next box takes the point, and the group walks on to its retro.

`the-retro-reads-the-backlog` lands its code and tests green, then closes became `a-rewind-spares-landed-tests`. A rename rewrites its draft and the review goes stale. The rewind then reaches `tests-red`, which the landed change keeps green.
