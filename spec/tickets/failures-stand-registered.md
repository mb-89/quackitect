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
record:
  - step: sync
    hand: box 83c32b2b4d58 · claude-code-remote
    hash_before: c70c49dbe92c3c738ff866a2756c07420dc63ac0
    hash_after: a1d2a066a3b1837751a382d6c655d940faa5ea23
  - step: sync
    hand: box 83c32b2b4d58 · claude-code-remote · helper-4
    hash_before: 6ab5fa3bd4e1d3ccad53142e2f33d8873cc0cbd7
    hash_after: 39484e1270aee1ef497f00d4ff06627bf71fd02b
    answered:
      - name: sync
        exit: 0
        said: work/failures-stand-registered already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box 83c32b2b4d58 · claude-code-remote
    hash_before: c8bbe0f6b6fe7d6432ee73da35a00d6b5b2b9c54
    hash_after: c8bbe0f6b6fe7d6432ee73da35a00d6b5b2b9c54
    inputs:
      - name: ask
        hash: 8602fdf90b84396a
        size: 1198
    def: cb8f90bc86fc7d39
  - step: children
    hand: the engine
    hash_before: fcf3b0e8cba5866e347daa4979a025f5d614e1b1
    hash_after: fcf3b0e8cba5866e347daa4979a025f5d614e1b1
  - step: accept
    hand: box 83c32b2b4d58 · claude-code-remote
    hash_before: 6cf13714a48ac9bb7cabab992e502b4ac5ff72c5
    hash_after: 2a5fc7149b39f093066feeb7d118fd56ed2b2964
    answered:
      - name: sync/sync
        exit: 0
        said: work/failures-stand-registered took 109 commit(s) from main.
    inputs:
      - name: ask
        hash: 8602fdf90b84396a
        size: 1198
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box 83c32b2b4d58 · claude-code-remote
    hash_before: 7d72ea00bad41ff93c1532099c1d361e3124b85e
    hash_after: 2ff75dda143292c0c3b5b5f93c08888152d2e37a
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
  - step: retro/write
    hand: box 83c32b2b4d58 · claude-code-remote
    hash_before: aad67b5c6f5f284505452d202a659c271e796dc2
    hash_after: aad67b5c6f5f284505452d202a659c271e796dc2
    inputs:
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: retro/notes
        hash: 310d2ddd3fe31ac9
        size: 36
    def: 1246a42e29e7ae98
  - step: retro/cloud
    hand: box 83c32b2b4d58 · claude-code-remote
    hash_before: e8e603de9038f4ef26a77fd20e58c68a2b979fc5
    hash_after: e8e603de9038f4ef26a77fd20e58c68a2b979fc5
    inputs:
      - name: retro/write
        hash: 25435732da6546b5
        size: 4613
    def: 4da1ca5da87d5bbc
  - step: children
    hand: box bf9a9fb67fb5 · claude-code-remote
    hash_before: 5caf10b9ac63f668859492a1201fbfe1cea274d4
    session: cse_01JR49WAMwFsp1GuB8FX2Gz2
    hash_after: 931a134aa374db98001c22f4ebec7182e2c28b24
    model: claude-opus-5-5
    cost: 0
    final: work/failures-stand-registered lands through its pull request with auto-merge on.
  - step: split
    hand: box bf9a9fb67fb5 · claude-code-remote
    hash_before: 20abc40a6547556f62ae0f6a57a19a7baffbe6b5
    hash_after: 20abc40a6547556f62ae0f6a57a19a7baffbe6b5
    inputs:
      - name: ask
        hash: 8602fdf90b84396a
        size: 1198
    def: 19b6849b1f151cd5
  - step: children
    hand: the engine
    hash_before: b0799a1b3a4659e51242cd29a1e1ca170736baa6
    hash_after: b0799a1b3a4659e51242cd29a1e1ca170736baa6
  - step: accept
    hand: box bf9a9fb67fb5 · claude-code-remote
    hash_before: f14fb54fbc95a9f4f53a93ae4cefd05d94fbf933
    hash_after: f14fb54fbc95a9f4f53a93ae4cefd05d94fbf933
    answered:
      - name: sync/sync
        exit: 0
        said: work/failures-stand-registered already carries every commit on main.
    inputs:
      - name: ask
        hash: 8602fdf90b84396a
        size: 1198
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box bf9a9fb67fb5 · claude-code-remote
    hash_before: 0fe11e5ed9b3074eda2f04c85657e1fc6771abc0
    hash_after: 0fe11e5ed9b3074eda2f04c85657e1fc6771abc0
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
  - step: retro/write
    hand: box bf9a9fb67fb5 · claude-code-remote
    hash_before: 2028bfff0cb801394142493512b3a116f53f9fd1
    hash_after: 2028bfff0cb801394142493512b3a116f53f9fd1
    inputs:
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: retro/notes
        hash: 310d2ddd3fe31ac9
        size: 36
    def: e7ed0badf886b5b5
  - step: retro/cloud
    hand: box bf9a9fb67fb5 · claude-code-remote
    hash_before: 252921bbf1b3b4ee4e756b031cc274d51a29dc45
    hash_after: 252921bbf1b3b4ee4e756b031cc274d51a29dc45
    inputs:
      - name: retro/write
        hash: eafa7ee853223742
        size: 2745
    def: 4da1ca5da87d5bbc
reason: done
---

# Ask

<!-- goal, as text: what these tickets add up to, for the hand that takes them -->

Every failure the tree raises takes its registered name, the way a log call takes its level. A failure is a markdown node under `spec/failures`, and its front matter carries a unique id, a level, one or more remedies, an optional reaction the engine runs when it fires, and an optional watch the sentinel evaluates on events. No failure stands without a remedy.

- A module raises a failure through the one failure door, in Go and in its JavaScript twin, which prints the id, the message and each remedy.
- The check refuses a failure node with no remedy, an id in code with no node, and refusal text written outside the failure door.
- The sentinel fires a failure whose watch matches an arriving event, through the clock door and with no poll.
- An agent raises a failure by verb, and registers a failure it meets with no id, which the verb refuses without a remedy.
- The pull, take and mint refusals stand on nodes, and the log carries the failure id so the retro counts each failure by id.
- The split cuts the work into slices in this order: the node shape and registry, the Go door and its JS twin, the check, the sentinel, the agent verbs, then the move of the pull, take and mint refusals.

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

- [[spec/tickets/check-skips-named-red-tests]] trivial
- [[spec/tickets/desk-refusal-test-follows]] trivial
- [[spec/tickets/desk-remedy-names-the-group]] trivial
- [[spec/tickets/desk-size-names-the-door]] trivial
- [[spec/tickets/failure-check-refuses]] standard
- [[spec/tickets/failure-count-skips-no-id]] trivial
- [[spec/tickets/failure-door-raises]] standard
- [[spec/tickets/failure-new-refusals-tested]] trivial
- [[spec/tickets/failure-new-shape-once]] trivial
- [[spec/tickets/failure-nodes-stand]] standard
- [[spec/tickets/failure-raise-joins-said]] trivial
- [[spec/tickets/failure-raise-row-off-door]] trivial
- [[spec/tickets/failure-raise-unregistered-case]] trivial
- [[spec/tickets/failure-verb-in-help]] trivial
- [[spec/tickets/failure-verbs-raise-and-register]] standard
- [[spec/tickets/failure-watch-shape]] trivial
- [[spec/tickets/failures-and-the-sentinel]] standard
- [[spec/tickets/go-pull-desk-remedy-once]] trivial
- [[spec/tickets/hooks-test-reads-fired-row]] trivial
- [[spec/tickets/index-survives-a-long-call]] standard
- [[spec/tickets/js-refusals-move]] trivial
- [[spec/tickets/mint-refusals-keep-ids]] trivial
- [[spec/tickets/moved-owns-the-files]] trivial
- [[spec/tickets/pull-callers-name-stillheld]] trivial
- [[spec/tickets/pull-ids-test-written]] trivial
- [[spec/tickets/raise-scan-keys-failure-door]] trivial
- [[spec/tickets/sentinel-callers-list-whole]] trivial
- [[spec/tickets/sentinel-fires-watches]] standard
- [[spec/tickets/sentinel-note-names-the-runner]] trivial
- [[spec/tickets/sentinel-say-error-lands]] trivial
- [[spec/tickets/take-moves-stands-refusals]] trivial
- [[spec/tickets/the-hooks-feed-the-sentinel]] standard
- [[spec/tickets/the-twins-leave-whole]] standard
- [[spec/tickets/the-twins-retire]] trivial
- [[spec/tickets/wiring-names-listens-hooks]] trivial

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- Each standard child carries one slice of the split, and each trivial child carries one finding a review met, so a reviewer reads each whole.
- The slices cover the goal in its order: failure-nodes-stand, failure-door-raises, failure-check-refuses, sentinel-fires-watches, failure-verbs-raise-and-register, then js-refusals-move, take-moves-stands-refusals and the-twins-leave-whole for the pull, take and mint refusals.
- failure-door-raises, failure-check-refuses, sentinel-fires-watches and failure-verbs-raise-and-register name failure-nodes-stand and failure-door-raises under depends_on.
- Each child reads the node shape and the door its depends_on names, and the closes landed in that order on this branch.
- The group stays one branch: every child stands closed, and no new slice grows the diff, so no further split is needed.

# children

# accept

<!-- reads the diff since its last verdict against the goal and every prose criterion, and names what falls short as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept: every child closes, and each goal line stands in code: the nodes under spec/failures with remedies, the Go door and src/doors/failure.js, the check in src/failure/check.go, the sentinel on the clock door, the failure verb with raise, new and count, and the pull, take and mint refusals raising through failure.Raise. The merge of main keeps that, and ./RUNME.sh check answers green.

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

- release of work/failures-stand-registered from the stopped box, then the take by name
- merge of main into the branch: 21 files conflicted, each resolved keeping main's git door and the branch's failure raises
- ten JS files main deleted leave, since their Go twins raise desk-works-on-trunk already
- pushTo in src/branches/take.go echoes git's error past d.warn, so the moved-refusals guard holds
- the split, accept and retro/notes steps pass

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

- the take's merge listed every conflicted file, so the resolution read one list
- go vet and the package tests named each helper main removed, so no stale call reached the check
- ./RUNME.sh check answered green on the first full run after the merge

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->
<!-- the form is list -->

- session start: the bare branch take after the release moved the box onto the stale work/engine-verbs-hold, and the take by name fixed it
- about 14:20: the index exited 1 with an empty serve log, and the cage refused the rm of index.db the ask names; a pkill under the runtime folder and a serve brought it back
- 14:26 to 14:30: every patch stalled at 0% while conflict markers in Go files left the index unbuilt, until a pkill and a serve
- 14:34: the cage refused git rm, the patch door holds no delete op, and a plain rm removed the files main deleted
- 14:36 and 14:40: LandingFollowsItsGate refused a ticket pull chained after the script writing its fields
- 14:37: a plan whose working names the group ticket made the pull answer wait until the plan cleared it
- owner prompt at session start: the scheduled ask to take over and land this branch, naming the release, the take, the merge and the owner's word

### improve

<!-- how each bad line stops happening, named by its home -->
<!-- the form is list -->

- a bare take after a release takes the released branch first: `src/branches/take.go`
- the serve prints the index's stderr into the serve log, so an exit 1 names its cause: `src/index/main.go`
- the cage lets an rm under the runtime folder pass while the index is down: `.claude/skills/level0/hooks/cage.js`
- the patch door carries a delete op for a merge accepting a deletion: `src/modules/edits`
- a plan naming a ticket as working reads as that ticket in hand, not as a todo: `src/pull/pull.go`

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The merge carried the risk: main ported the take, pull and bash guard to Go while this branch moved their refusals onto nodes. Reading the Go twins first showed main already raises desk-works-on-trunk there, so accepting the deletions lost none of the branch's intent.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the chapter adds no fact standing elsewhere, and points at files by path
- the chapter adds no number past the times of the run
- the change writes no header
- the chapter carries the owner prompt and each error with its time
- the chapter names roles alone and no box address

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->
<!-- the form is list -->

- the rm of the stale index database, which the cage refuses while the index stands down, at the first serve
- a delete op on the patch door, at the merge accepting the deletions of main

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->
<!-- the form is list -->

- a conflict at sync: 21 files, at the take
- the cage refusing calls while the index stands down, at the first serve and after the merge opened
- LandingFollowsItsGate on a pull chained after a script, at the split and the retro

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->
<!-- the form is list -->

- no person step parked
- no ticket minted outside the group
- the handover: the group stands at done once branch done runs, and its pull request lands on main with auto-merge on

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
