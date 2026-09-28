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
  - step: retro/write
    hand: box d81eeae76310c · claude-code-remote
    hash_before: 98719cbffb6a18e06c8261846cea5696f518c9b6
    hash_after: 98719cbffb6a18e06c8261846cea5696f518c9b6
    inputs:
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: retro/notes
        hash: 310d2ddd3fe31ac9
        size: 36
    def: 1246a42e29e7ae98
  - step: retro/cloud
    hand: box d81eeae76310c · claude-code-remote
    hash_before: 3aa34d266202f653665ce27f8cbb0e84aff131b7
    hash_after: 3aa34d266202f653665ce27f8cbb0e84aff131b7
    inputs:
      - name: retro/write
        hash: 15933d3d3a3b1c25
        size: 2798
      - name: [[spec/tickets/a-watch-stops-mid-add]]
        hash: 2d2faad79d1fbca1
        size: 15460
    def: 4da1ca5da87d5bbc
reason: done
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

[[spec/tickets/a-watch-stops-mid-add]]: both Go watches stand on src/watcher, whose stop returns while the loop adds a folder
src/watcher/watchertest: the stop helpers the three stop tests share, and Appearing waits on its last folder
the parked note pull-named-todo-meets-queue, decided and dropped into the improve list below

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

the fsnotify source in the module cache confirmed the cause before any code, so the design took one draft
a fake with the Windows timing turned a Windows-only hang into a red test on every platform
the gate helper named four conditions the implementation then held, and the race run stayed green

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->
<!-- the form is list -->

22:49 every shell call came back refused until the plan named a todo, since no ticket stood yet on a fresh box
22:53 branch open refused a dirty tree, and it pushes main through marksTrunk, which the dispatch prompt forbids, so the box branched by hand on the dispatcher's road
23:05 the gate helper looped on the pull: the plan's working field named the ticket, and the pull read it as a todo in hand
23:10 the container restarted mid-gate, and the helper's report came back only through its output file
23:16 the check went red on ExtensionsOnOffer: the language server stood built from main before the fast-forward
23:19 the push door named another box: the take wrote box.json, the restart removed it, and identity.json carried another id
the only owner prompt stood at the session start: the dispatch task naming the hang, its run and its cause

### improve

<!-- how each bad line stops happening, named by its home -->
<!-- the form is list -->

src/scripts/pull.js: let a named pull of the working todo past the queue gate, so a helper pulls while the plan names the ticket
src/scripts/work.js openGroup: a cloud box opens a group branch without the trunk push, as dispatch-write.js opens does
src/scripts/pull-hand-of.js boxIdHere: read one id for the box, so the take and the push door name the same hand after a restart
the install step: rebuild se-lsp when its source moves past the binary, so a fast-forward leaves no stale rule behind

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The cause stood verified in the prompt, so the risk sat in the design: a plain lock across Add deadlocks where the reader blocks on the unbuffered Events send. Draining into an unbounded queue answers both traps at once. The route asked for a red test, and a random race gives a flaky one, so the fake took the reader's choices from backend_windows.go and made the hang certain in a few rounds.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the loop stands once in src/watcher, and both watches call it
the numbers the change adds carry names: Hung and depth in watchertest
the headers of watcher.go and watchertest.go say what each file is for
the badly list carries the run's errors with their times, and the one owner prompt
the chapter names roles alone, and no path or address of the box

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->
<!-- the form is list -->

23:20 the proxy refused www.google.com during the check, and nothing in the run waited on it
no Windows box, so the Windows hang shows through the fake alone until CI runs the job

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->
<!-- the form is list -->

the trunk guard: branch open pushes main, so the box branched by the dispatcher road instead
the one-writer hook at 23:19, after the restart dropped box.json
the tested-delta hook, twice, until the test files stood named beside the code
the sync took main in with no conflict
ExtensionsOnOffer failed on this box alone, off a stale se-lsp binary

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->
<!-- the form is list -->

no person step parked, and no ticket minted outside the group
the owner-read step of the child stood skipped, since the ask came off no handover

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
