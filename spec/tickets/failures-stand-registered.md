---
kind: [[ticket]]
state: open
step: retro/write
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

- failure-nodes-stand and failure-watch-shape: a failure is a node under spec/failures with an id, a level, remedies, and an optional reaction and watch
- failure-door-raises: one failure door raises in Go and in its JavaScript twin, printing the id, the message and each remedy
- failure-check-refuses: the check refuses a node with no remedy, a raised id with no node, and refusal text past the door
- sentinel-fires-watches: the sentinel fires a matching watch, and arms a quiet one on the clock door with no poll
- failure-verbs-raise-and-register: an agent raises and registers a failure by verb, and the log counts failures by id
- pull-callers-name-stillheld, take-moves-stands-refusals, mint-refusals-keep-ids, js-refusals-move: the pull, take and mint refusals stand on nodes
- pull-ids-test-written and moved-owns-the-files: the pull tests read each id off the fake registry, and failure.Moved names the moved places
- failure-new-lands-untracked: failure new stages the node it writes
- the gate fixes: check-skips-named-red-tests, failure-count-skips-no-id, failure-new-refusals-tested, failure-new-shape-once, the three failure-raise fixes, failure-verb-in-help, raise-scan-keys-failure-door, sentinel-callers-list-whole, sentinel-note-names-the-runner
- the retro notes: three became index-survives-a-long-call, the-twins-leave-whole and the-hooks-feed-the-sentinel, and probe-meets-tagged-tickets closed done

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

- each gate minted its fix tickets into the group, and every one closed on this branch
- the red tests stood before each change, and the fake registry let the pull tests read ids with no real node
- the scripts under .se/scripts wrote the failure nodes and the pull patch ops in bulk: pull-nodes.sh, take-nodes.sh, pull-sites.py with pull-ops.json, split-fields.py and mint-slices.sh
- the retro notes each met a read of the code before a verdict, so a note whose fix had landed closed done in place of a duplicate ticket

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->
<!-- the form is list -->

- 16:26 to 21:18, every window: a Bash call opened its description with no ticket, and the door refused it
- 16:26 to 17:15: a checkout of main met a refusal and a detached HEAD, and a push of main met the cloud box's own-branch rule
- 16:26 to 18:21: the plan grace ran out between tickets, and calls met refusals until a plan answered
- 16:26 to 18:21: the tests-green hand-back through the pull tool answered connection refused, and the index restarted on a new port
- 17:15 to 18:21: hand-backs failed on red tests in src/quack and src/failure, gofmt answered exit 1, and a patch named a move op the tool holds none of
- 19:44: the commit hook refused code with no test beside it
- 21:21: the mint took the ask's fields as flags and refused them, since the ask rides in --Ask as written text
- 21:26: a commit piped through tail ahead of a hand-back met LandingFollowsItsGate
- 16:27 owner prompt: run the work skill on failures-stand-registered, with no timers or sleeps, each door tested once against the real thing, and the pull request against main with auto-merge on; nothing in the session turned it

### improve

<!-- how each bad line stops happening, named by its home -->
<!-- the form is list -->

- the description rule: the work skill names the Bash description rule beside its first step, in .claude/skills/work/SKILL.md
- the dropped index: index-survives-a-long-call, in this group
- the plan grace: a plan rides each pull and each write, which the tools' plan field already carries
- the mint form: the remedy of the node mint-fields-refused names --Ask as the home of a ticket's ask fields, under spec/failures
- the piped gate: a gate joins its landing with && and no pipe, which LandingFollowsItsGate already says

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The session ran six windows over one group, with level zero clearing the context between them, and the handover carried the state each time. The cost sat in the doors: most refusals named a form, not a fault in the work. The one real fault the session met, the index dropping inside a long tool call, got worked around from the shell for hours before a note named it. The retro turns it into a ticket of the group, together with the twins' last callers and the sentinel's missing wiring. All three stay in the group, so the branch reaches done only after they close.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

every fact stands once: each done line points at its ticket, and no rule is copied in
no number: the lines name no count a command answers
no header: this chapter writes no file header
the owner prompt and the errors carry their times off the transcripts and the git log, a window's span where the minute stays unread
the chapter names roles alone, and no person, address or box path

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->
<!-- the form is list -->

- 16:26 to 17:15: the auto mode classifier denied one command as irreversible local destruction
- 16:26 to 17:15: a push of a stale branch met remote rejected, cannot lock ref

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->
<!-- the form is list -->

- 16:26 to 17:15: the trunk guard refused a checkout of main, and refused a push of main from a cloud box
- 16:26 to 21:17: the context cap cleared the conversation five times, and each window began on the handover
- 16:26 to 18:21: the index dropped during a tests-green hand-back through the pull tool, a fault of this box alone, and the shell hand-back stood in
- 19:44: the commit hook refused code with no test beside it
- 21:26 and 21:30: LandingFollowsItsGate refused a piped landing, and the stop hook refused a stop that waited on helpers

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->
<!-- the form is list -->

- no person step stands parked
- no ticket stands minted with no group
- the handover says the group carries three open children the retro minted: index-survives-a-long-call, the-twins-leave-whole and the-hooks-feed-the-sentinel

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
