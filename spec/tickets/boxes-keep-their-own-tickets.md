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
record:
  - step: sync
    hand: box d81cb7b9efd7 · claude-code-remote
    hash_before: d3f9bf44760a945bc9e6b8e01ddb866ded83c229
    hash_after: ddae4316b5cfa5f20e0d37f4ba6414fd60616d5c
  - step: sync
    hand: box d81e51f1bb10e · claude-code-remote
    hash_before: ddae4316b5cfa5f20e0d37f4ba6414fd60616d5c
    hash_after: f9b789b1b92e93ce4315a324ad702dabfbdc361b
  - step: sync
    hand: box d81e51f1bb10e · claude-code-remote
    hash_before: 372cc6f4098221524a0be3dd10ea6d13e2416ce5
    hash_after: 372cc6f4098221524a0be3dd10ea6d13e2416ce5
    answered:
      - name: sync
        exit: 0
        said: work/boxes-keep-their-own-tickets already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box d81e51f1bb10e · claude-code-remote
    hash_before: 9909536fd4b6fe5230b33c2ebcc4581e11718106
    hash_after: 9909536fd4b6fe5230b33c2ebcc4581e11718106
    inputs:
      - name: ask
        hash: f64b5acab2b06a3d
        size: 381
    def: cb8f90bc86fc7d39
  - step: children
    hand: the engine
    hash_before: 7a4eb97b7a07ae5f7f686b283b012375c3d2980d
    hash_after: 7a4eb97b7a07ae5f7f686b283b012375c3d2980d
  - step: accept
    hand: box d81e51f1bb10e · claude-code-remote
    hash_before: b2a138f50bff156d0a5a5853ca59184cbbeb841e
    hash_after: 07b07352a9dc83ab5a8309e3c0497c6e7d988a63
    answered:
      - name: sync/sync
        exit: 0
        said: work/boxes-keep-their-own-tickets already carries every commit on main.
    inputs:
      - name: ask
        hash: f64b5acab2b06a3d
        size: 381
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box d81e51f1bb10e · claude-code-remote
    hash_before: 9d7a4c1b023f35348571cd4b721d0e4ab516385b
    hash_after: 9d7a4c1b023f35348571cd4b721d0e4ab516385b
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
  - step: retro/write
    hand: box d81e51f1bb10e · claude-code-remote
    hash_before: aeccc114728d240c2f90647d3ae59f9556726590
    hash_after: aeccc114728d240c2f90647d3ae59f9556726590
    inputs:
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: retro/notes
        hash: 310d2ddd3fe31ac9
        size: 36
    def: 1246a42e29e7ae98
  - step: retro/cloud
    hand: box d81e51f1bb10e · claude-code-remote
    hash_before: a7709870b228b5715ed0c008a065536bfd66119a
    hash_after: a7709870b228b5715ed0c008a065536bfd66119a
    inputs:
      - name: retro/write
        hash: 40e09febda3b6319
        size: 2266
    def: 4da1ca5da87d5bbc
reason: done
---

# Ask

A cloud box decides every step itself and records what it weighed. The tickets it mints stay in its own group until they close, and the dispatch hands a ticket waiting on an answer to a box like other open work. Only work a person alone can do stands loose on main, and nothing opens a GitHub issue. The backlog of questions waiting on a person gets decided under the same rulings.

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

[[spec/tickets/a-box-keeps-its-tickets]] trivial,[[spec/tickets/the-dispatch-opens-no-issues]] trivial,[[spec/tickets/the-notes-say-boxes-decide]] trivial,[[spec/tickets/the-backlog-gets-decided]] trivial

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

each child is one trivial change with its own tests, small enough to review whole
the ask splits into the box keeping its tickets, the dispatch opening no issue, the notes saying the rulings, and the backlog decided; the box deciding every step itself stands in the notes child, so nothing stands outside
no child waits on another: each touches its own files, so none names depends_on

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

the four children stood closed from the box before, and this box read each against the ask,sync, split and accept passed, with every child test file green and the dispatch plan naming no loose question,the wait test in the index module now starts its wait before the gate opens, so the check stands green

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

the child tests and the dry dispatch plan answered the accept gate directly, so the verdict rested on commands,a rerun of the failing test alone pointed at order, and reading the test showed the race

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->
<!-- the form is list -->

22:15 UTC, a shell call naming no ticket met the door and came back refused,22:17 UTC, the plan tool found no server while the server was still building its index, and the hook then refused a call until the plan answered,22:20 UTC, the full check failed on a race in the index wait test, which read the open ops after the gate opened,22:24 UTC, a shell write of the retro fields to a scratch file met the door and came back refused,split came back refused once, since the checked field wanted lines in one string and not a list,accept came back refused once, since a verdict field decides and the pass flag stays off

### improve

<!-- how each bad line stops happening, named by its home -->
<!-- the form is list -->

the plan tool in the level0 plugin says the server is warming, and waits on it, where the port answers but the event route does not yet,the index wait test takes its snapshot before the gate opens, which this branch lands,the pull hand-back hint names the checklist field as one string with a line an item, and names the verdict field without the pass flag

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The children carried the whole ask already, so the run turned on proving them and on the check. The red check came from a test outside the ask, and the cloud guidance says to green it whatever hand put the fault there. A sleep in a test orders the steps and holds no timing claim, since the ops stay open until the gate opens.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change adds no fact beyond the order in the test, and the retro points at the test in place of repeating it
the change adds no number beyond a fraction of the slow span the test names already
the change writes no header
the badly list carries each error with its time, and no owner prompt came in this run
the chapter names the box by its role, with no name, address or path

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->
<!-- the form is list -->

no tool, host, right or install was missing in this run

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->
<!-- the form is list -->

the ticket door on shell calls, at the first read of the group,the plan hook, which refused a call while the server warmed,the shell write door, on a scratch file for the retro fields,a test race in the index module that failed under the load of the index build on the box

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->
<!-- the form is list -->

no person step stands parked, and no ticket was minted in this run,the handover is the pull request from this branch against main, with auto-merge on

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
