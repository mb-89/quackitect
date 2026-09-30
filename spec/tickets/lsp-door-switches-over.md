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
    checklist: ["every child is small enough to review whole, or is a group itself", "the children add up to the goal, and nothing of the goal stands outside them", "a child that waits on another names it under depends_on"]
    evidence:
      - name: children
        form: list
        says: every child as a link, one a line, with its process
  - name: children
    by: children
    on_fail: split
  - name: children-2
    by: children
    on_fail: split
  - name: accept
    gate: does the work of every child add up to the goal, and does every command of the route pass
    final: true
    does: reads the diff since its last verdict against the goal and every prose criterion, and names what falls short as points
    tags: ["review", "accept"]
    input: ["ask", "children", "children-2"]
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
        input: ["children", "notes", "children-2"]
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
    hand: box d8922c5f7ed7 · claude-code-remote
    hash_before: 29658dea603ac6cbf84d805c464b7e6e53cb920a
    hash_after: 894ab2cb11318ebd8b08dfc9920aa0da6e2dcf7b
  - step: sync
    hand: box d8932514a610d · claude-code-remote
    hash_before: 894ab2cb11318ebd8b08dfc9920aa0da6e2dcf7b
    hash_after: b469bd5334823361d70535e2b229724e338ac76b
  - step: sync
    hand: box d893e0ab0f106 · claude-code-remote
    hash_before: b469bd5334823361d70535e2b229724e338ac76b
  - step: sync
    hand: box d893e0ab0f106 · claude-code-remote
    hash_before: e3886a48606f95da656aae0421a25d7a24f06659
    hash_after: e3886a48606f95da656aae0421a25d7a24f06659
    answered:
      - name: sync
        exit: 0
        said: work/lsp-door-switches-over already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box d893e0ab0f106 · claude-code-remote
    hash_before: 2584487b2da2d2650c61ee6dae604661e34a933d
    hash_after: 2584487b2da2d2650c61ee6dae604661e34a933d
    inputs:
      - name: ask
        hash: 677f7753166f6af8
        size: 349
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: e122785976621597
        size: 10947
    def: cb8f90bc86fc7d39
  - step: children
    hand: the engine
    hash_before: f539ffdacc41d144c798199408510a514b1c0c81
    hash_after: f539ffdacc41d144c798199408510a514b1c0c81
  - step: accept
    hand: box d893e0ab0f106 · claude-code-remote
    hash_before: 8c4942082dcd357f4547a06c4de3adb59940d801
    hash_after: 88454cc101c16cae9f6633ede734f99f235c32e5
    returns: 1
    why: "the check answers red: a caller spawns a second se-index beside a busy door, and the get road times out on the door start; [[spec/tickets/one-index-a-tree]] fixes it"
    answered:
      - name: sync/sync
        exit: 0
        said: work/lsp-door-switches-over already carries every commit on main.
  - step: children-2
    hand: the engine
    hash_before: 6ee2f0eabb17f2708f223682e83734748bcf4718
    hash_after: 6ee2f0eabb17f2708f223682e83734748bcf4718
  - step: accept
    hand: box d893e0ab0f106 · claude-code-remote
    hash_before: 55cf3d4311ca12868efb27eead89b1ba33f8d799
    hash_after: 55cf3d4311ca12868efb27eead89b1ba33f8d799
    answered:
      - name: sync/sync
        exit: 0
        said: work/lsp-door-switches-over already carries every commit on main.
    inputs:
      - name: ask
        hash: 677f7753166f6af8
        size: 349
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: children-2
        hash: 811c9dc59e3779b9
        size: 0
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: e122785976621597
        size: 10947
    def: bf1fe6cde364dfd7
  - step: retro/notes
    hand: box d893e0ab0f106 · claude-code-remote
    hash_before: 85146565275fbb85620cdbc42a5d8002ff28b977
    hash_after: 85146565275fbb85620cdbc42a5d8002ff28b977
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
  - step: retro/write
    hand: box d893e0ab0f106 · claude-code-remote
    hash_before: 82785b7e8b49bfd5219b82aeb346396051e03f90
    hash_after: 82785b7e8b49bfd5219b82aeb346396051e03f90
    inputs:
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: retro/notes
        hash: 310d2ddd3fe31ac9
        size: 36
      - name: children-2
        hash: 811c9dc59e3779b9
        size: 0
    def: 173248322297533c
  - step: retro/cloud
    hand: box d893e0ab0f106 · claude-code-remote
    hash_before: fa84d15c175739297407ddfef530e3252fd88804
    hash_after: fa84d15c175739297407ddfef530e3252fd88804
    inputs:
      - name: retro/write
        hash: 1c6a5cd1c6db5b56
        size: 2227
      - name: [[spec/tickets/one-index-a-tree]]
        hash: 0e68a0131954c838
        size: 13324
      - name: [[spec/tickets/reaches-keeps-the-post-fault]]
        hash: 20070aa41d2afab7
        size: 3706
      - name: [[spec/tickets/sweep-skips-box-rules]]
        hash: c91e352ea3b90ab8
        size: 3092
    def: 4da1ca5da87d5bbc
depends_on: ["lsp-door-lands-in-shadow", "read-topics-switch-over"]
enabled_by: migration.phase7switch
cloud: true
reason: done
---

# Ask

Phase 7 of [[spec/design_input/the-migration-runs-in-slices#the-phases]], switched over. The slice's key under `migration/config/slices/` moves to `new`, and the old path leaves the tree. The group waits for `migration.phase7switch` to read true in the tracked config on `main`.

Done when the LSP's own server, port and index client leave the tree.

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

[[spec/tickets/lsp-module-draws-the-tools]], standard
[[spec/tickets/lsp-module-serves-the-features]], standard
[[spec/tickets/the-lsp-server-leaves]], standard

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

each child moves one slice of the door and was reviewed whole at its own accept
the tools, the features and the old server leaving add up to the goal; the tree holds no own server, port or index client, and test/contract/no-old-server.test.js holds it
the-lsp-server-leaves waits on the two module children, which close before it

# children

# children-2

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

[[spec/tickets/one-index-a-tree]]: a late door answer returns its fault, and starts no second index
[[spec/tickets/reaches-keeps-the-post-fault]]: a start claim lets one caller spawn, and the lsp buffer commit lets the server lock go
[[spec/tickets/sweep-skips-box-rules]]: the index sweep leaves out the rule that reads the survey on the box
the retro drops the SIGTERM note and turns the survey note into its fix

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

the goroutine dump of the hung index named the deadlock in one read, since stderr went to a scratch file for one run
the red tests came first, and each failed on its own assertion before its fix

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->
<!-- the form is list -->

20:47 the plan tool found no server twice, though the shell reached it, and the third try passed
20:48 the sync hand-back refused the bare command, and wanted it with ./RUNME.sh in front
20:52 the check went red on the get road, though the handover said green, and six indexes ran over one tree
21:04 the first fix left the check red, since the index hung and callers raced a start
21:08 pkill -f matched its own shell and ended it
21:29 the moved claim tripped OutsideInDoors, since a door file alone may read the disk

### improve

<!-- how each bad line stops happening, named by its home -->
<!-- the form is list -->

src/modules/lsp/lsp.go: writes lets the lock go, so an editor open hangs no index again
src/index/door.go: the start claim keeps callers racing a start to one index
spec/processes/group.yaml: the sync evidence names the command as ./RUNME.sh branch sync
the agent: stops a process by its exact name with pgrep -x, and never with pkill -f

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The red check looked like load at first, and the handover said green. The count of index processes turned it: one tree holding six indexes named a leak, and the dump of one hung index named the deadlock. Each fix revealed the next fault, so the branch grew past its first ask, and the discussion of the fix ticket says why.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

each fix stands in its own ticket, and the retro points at them
the post wait carries its name, postWait, in the const block
the new file binary.go opens on a header that says what it holds
the badly list carries each error of the run with its time, and the owner wrote no prompt
the chapter names the agent and the owner, and no person, address or path

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->
<!-- the form is list -->

20:47 the plan tool reached no server through the plugin twice, while the shell reached it with the proxy off

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->
<!-- the form is list -->

20:52 the check failed on the box alone, since orphaned indexes from earlier runs stood over the tree
21:12 the check ran past the ten-minute cap once, while the index hung

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->
<!-- the form is list -->

no person step, and no ticket minted outside the group
the handover names the pull request and the plan tool doubt

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

The JavaScript twins of the Go checks leave with this group. The twins row of [[spec/design_output/migration#what-goes-with-no-successor]] lists them. Phase 3 leaves them standing, since the check names answer an empty list until phase 7 moves the rules in. [[spec/tickets/check-twins-leave-phase-seven]]

The split keeps the lint's own twin reads here, since the lint loses `se-lsp check` and reads the check module's sweep in its place. The write door, the bash guard, the pull and the mint keep their twins until [[spec/tickets/node-leaves-the-boxes]]. The write door checks a draft the index holds nowhere yet, and those callers stay JavaScript until Node leaves.
