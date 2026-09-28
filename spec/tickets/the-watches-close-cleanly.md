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
step: retro/write
record:
  - step: sync
    hand: box d81eeae76310c · claude-code-remote
    hash_before: ad8df81d4bf28669b7d385e4ecda5e18b74f62b1
  - step: sync
    hand: box d81eeae76310c · claude-code-remote
    hash_before: 07a102b98d954278f7ab26e6b144f589d46858a7
    hash_after: 3cc390ce3a4af0bf1d985d6de9d38ad5dd52af95
    answered:
      - name: sync
        exit: 0
        said: work/the-watches-close-cleanly already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box d81eeae76310c · claude-code-remote
    hash_before: c6e83026ceacad9af1743f4017bc4454643ce9e3
    hash_after: c6e83026ceacad9af1743f4017bc4454643ce9e3
    inputs:
      - name: ask
        hash: e8f36ade961e44bb
        size: 356
    def: cb8f90bc86fc7d39
  - step: children
    hand: the engine
    hash_before: dcfa4cac7c0966b2fc1bed5c672bda5a5acfc1aa
    hash_after: dcfa4cac7c0966b2fc1bed5c672bda5a5acfc1aa
  - step: accept
    hand: box d81eeae76310c · claude-code-remote
    hash_before: e2a79e7833be24aa39b51b7de053b3f21e8fce5e
    hash_after: 13ef50e4b2e713141f198b34a7cc1e2bbc41c608
    answered:
      - name: sync/sync
        exit: 0
        said: work/the-watches-close-cleanly already carries every commit on main.
    inputs:
      - name: ask
        hash: e8f36ade961e44bb
        size: 356
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box d81eeae76310c · claude-code-remote
    hash_before: db77093242d7d94fe231c3d02030272fe6cd1c41
    hash_after: db77093242d7d94fe231c3d02030272fe6cd1c41
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
---

# Ask

Both Go file watches stop cleanly on every platform: a stop never hangs while the watch adds a folder. On Windows, fsnotify's Add waits on a reply the reader drops once Close lands, so check (windows-latest) times out at random. Done when both watches hand a stop back while folders keep appearing, under a test run with -race, and ./RUNME.sh check passes.

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

[[spec/tickets/a-watch-stops-mid-add]] standard

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the one child changes two watches and one shared package, small enough to review whole
the child covers the whole goal: both watches, the race run, and the check
the group holds one child, so nothing waits on another

# children

# accept

<!-- reads the diff since its last verdict against the goal and every prose criterion, and names what falls short as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept
- both watches stand on src/watcher, whose Add and Close share a lock and a closed flag, and whose drain keeps the reader off a blocked send
- the fake with the Windows timing ran red on the old loop and runs green now, and each watch carries a stop test, green under -race
- the accept read found the folder helper racing the temp folder cleanup, and the commit before this verdict fixes it in the diff
- the check answers green on the tip

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
