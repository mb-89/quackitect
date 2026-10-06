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
record:
  - step: sync
    hand: box 83c32b2b4d58 · claude-code-remote
    hash_before: c70c49dbe92c3c738ff866a2756c07420dc63ac0
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
step: children
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
- [[spec/tickets/js-refusals-move]] trivial
- [[spec/tickets/mint-refusals-keep-ids]] trivial
- [[spec/tickets/moved-owns-the-files]] trivial
- [[spec/tickets/pull-callers-name-stillheld]] trivial
- [[spec/tickets/pull-ids-test-written]] trivial
- [[spec/tickets/raise-scan-keys-failure-door]] trivial
- [[spec/tickets/sentinel-callers-list-whole]] trivial
- [[spec/tickets/sentinel-fires-watches]] standard
- [[spec/tickets/sentinel-note-names-the-runner]] trivial
- [[spec/tickets/take-moves-stands-refusals]] trivial

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every child is small enough to review whole: each standard child is one slice of the split's order, and each trivial child one fix a review named
- the children add up to the goal: the node shape, the door and its twin, the check, the sentinel, the verbs and the move of the pull, take and mint refusals each close under a child
- a child that waits names it under depends_on: the check, the verbs and the sentinel name the nodes and the door, and failures-and-the-sentinel names the five slices

# children

# accept

<!-- reads the diff since its last verdict against the goal and every prose criterion, and names what falls short as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->

<!-- the form is verdict -->

# retro

## notes

<!-- decides every private note on the box, and works what it mints into this group -->

### drained

<!-- retro notes, which passes when the private folder is empty -->

<!-- the form is command -->

## write

<!-- writes the retro over the box's own window -->

### done

<!-- what was done, one line a ticket or a thing -->

<!-- the form is list -->

### well

<!-- what went well, and what made it go well -->

<!-- the form is list -->

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->

<!-- the form is list -->

### improve

<!-- how each bad line stops happening, named by its home -->

<!-- the form is list -->

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

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
