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
    hand: box 3341fdcd540f · claude-code-remote
    hash_before: 51be8a910c58dae0ebcdbe7a7d9c224a8f50314a
  - step: sync
    hand: box 3341fdcd540f · claude-code-remote
    hash_before: e423bdcbb0794321960db6acc36c8135c2d65e0d
    hash_after: e423bdcbb0794321960db6acc36c8135c2d65e0d
    answered:
      - name: sync
        exit: 0
        said: work/boxes-hold-and-hand-back already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box 3341fdcd540f · claude-code-remote
    hash_before: 9dcab0e04a61c0a6980b4af5f535b6e51abfee67
    hash_after: 9dcab0e04a61c0a6980b4af5f535b6e51abfee67
    inputs:
      - name: ask
        hash: 1d203dacf8882c98
        size: 453
    def: cb8f90bc86fc7d39
  - step: children
    hand: the engine
    hash_before: ff2257b6b611f1477630afe8e211a6e993edfcca
    hash_after: ff2257b6b611f1477630afe8e211a6e993edfcca
  - step: accept
    hand: box 3341fdcd540f · claude-code-remote
    hash_before: edc2f2c7047e6b9486cbd16e9b8ec4bb269c31e1
    hash_after: edc2f2c7047e6b9486cbd16e9b8ec4bb269c31e1
    answered:
      - name: sync/sync
        exit: 0
        said: work/boxes-hold-and-hand-back already carries every commit on main.
    inputs:
      - name: ask
        hash: 1d203dacf8882c98
        size: 453
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
    def: 07c43ae7253713ec
  - step: accept
    hand: box 3341fdcd540f · claude-code-remote
    hash_before: 39dd9ce2f8f08fca320310fa44fa406f0ea043c4
    hash_after: 158b992d38ec359ca152fe3e770a2b6d07c59c7b
    answered:
      - name: sync/sync
        exit: 0
        said: work/boxes-hold-and-hand-back already carries every commit on main.
    inputs:
      - name: ask
        hash: 1d203dacf8882c98
        size: 453
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box 3341fdcd540f · claude-code-remote
    hash_before: 8e27ed4e25bae5c5ecec8d27bff007ffec2cae43
    hash_after: 8e27ed4e25bae5c5ecec8d27bff007ffec2cae43
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
  - step: retro/write
    hand: box 3341fdcd540f · claude-code-remote
    hash_before: e75098edf437ca37b82cdf1f231e5cf23e2e4d7b
    hash_after: e75098edf437ca37b82cdf1f231e5cf23e2e4d7b
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

A cloud box holds its branch while it lives, and hands its work on whole when it dies. A hold beats with the session, so a dead box frees its branch at once and a live box keeps it. A takeover takes in the commits the old box never pushed, through a rescue branch on origin. A cloud turn ends on a decision, never on a question, and a box waits for its helpers and its retries inside its turn, so no group stands idle waiting for a person or a takeover.

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

[[spec/tickets/holds-beat-with-the-session]] standard
[[spec/tickets/takeover-rescues-unpushed-commits]] standard
[[spec/tickets/cloud-turns-end-without-questions]] standard
[[spec/tickets/cloud-boxes-wait-in-turn]] trivial
[[spec/tickets/beat-after-joins-schema]] trivial
[[spec/tickets/beat-hook-stays-quiet]] trivial
[[spec/tickets/beats-pass-the-push-gate]] trivial
[[spec/tickets/ended-beat-ties-the-tip]] trivial
[[spec/tickets/cloud-question-check-leaves-readstext]] trivial
[[spec/tickets/rescue-passes-the-stamp-gate]] trivial
[[spec/tickets/ci-skips-rescue-and-beats]] trivial

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

every child is small enough to review whole: the three standard children each touch one mechanism, and the trivial ones one line or one case
the children add up to the goal: the beat holds a live branch, the rescue hands a dead box work on, the turn ends on a decision, and the box waits inside its turn; nothing of the ask stands outside them
no child waits on another now: every child stands closed, and the rescue children followed their parent through its gate

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

holds-beat-with-the-session: a hold beats on beats/<group> at each turn's end, and a session end frees it at once
takeover-rescues-unpushed-commits: a red cloud commit reaches rescue/<group>, and a takeover merges it in
cloud-turns-end-without-questions and cloud-boxes-wait-in-turn: a cloud turn ends on a decision, and waits for its helpers inside the turn
rescue-passes-the-stamp-gate: the push gate lets a rescue push through on any stamp
ci-skips-rescue-and-beats: the check workflow runs on no rescue or beat push
clear-keeps-the-hold: the end beat skips a clear, minted off the accept review
the merge of main: the take reads --over off argv, since the name past a flag now reads empty

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

the accept review ran in a helper against the goal, and found the clear ending a live hold; the beat branch carried that very end from this session's own clear
a docs helper read the SessionEnd matcher off the hooks reference, so the fix rests on the docs and on no recall
the rescue path this group built carried two red commits off the box, and the branch lost nothing
each leaf went red first: the workflow contract, the rescue push case and the end beat case each failed on their own assertion before the change

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->
<!-- the form is list -->

19:10 a Bash call opened its description with no ticket, and the door refused it
19:14 the pull tool answered with no hook, and the verb ran through RUNME.sh in its place
19:16 a raw git push met GitWritesThroughAVerb
19:29 a tests-green hand-back carried one checked line for a four-item checklist
19:31 a helper launched in the foreground, and the door refused it
19:38 the accept verdict took four tries: a link, a bare name, an existing child, then a fix child the verdict mints itself; a hand-minted draft collided with it
19:44 a commit of the size golden read red under a loaded check, and went to the rescue branch
19:50 the sync met a conflict in the work skill and the size golden
19:53 the merge commit read red: main's nameWord reads no name past a flag, so take --over lost its flag
19:55 a partial commit inside a merge and a git add were refused
20:00 the rescue branch stayed on origin after a green commit, since the delete push failed and nothing said why
20:02 two calls chained a landing behind a gate with a semicolon or a pipe, and met LandingFollowsItsGate
the plan grace ran out three times between tickets
owner prompt, line 1: run the work skill, decide every step, never stop at a handover; nothing in this window turned it

### improve

<!-- how each bad line stops happening, named by its home -->
<!-- the form is list -->

a ticket in the description: the work skill names the Bash description rule beside its first step
the verdict form: the accept leaf's answer line names the form, a dash, a new child name and the finding, in spec/processes/group.yaml
the red under load: the index contract case waits on the process's exit through the proc door in test/contract/index.test.js, in place of a five-second loop on the clock
the take flag: Branch hands every verb its argv, and a verb with a flag before its name reads both off argv, in src/branches/branch.go
the quiet rescue drop: dropsRescue writes the refused delete to the error stream, in src/quack/commit.go
the plan grace: a plan call rides each pull, which the pull tool's plan field already carries

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The accept review weighed four points and one held: a clear inside a living session ended its hold, which the beat branch showed. The other three stand by design: a green commit whose push fails waits for the next push, beats firing at turn ends fall back on the tip's age, and a rescue merged by a takeover reaches the work branch red because CI gates the pull request. The red merge was main's fault, and rule eleven of the cloud guidance put its fix on this branch.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

every fact stands in one place: each line points at its file or ticket, and repeats no design
no number lands past the five-second deadline, which names the case's own constant
no header lands: the retro writes fields, no file
the errors carry their times off this window; the owner's one prompt carries its line
the chapter names the box by role, and no path past the tree's own files

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
