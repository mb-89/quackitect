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
fix: true
record:
  - step: sync
    hand: box 31f16efb1b52 · claude-code-remote
    hash_before: 55d4be592e683ed0e59322180c5ebc883a7303e1
    session: cse_01GEZAgNULgqsV7irZuWXYAw
    hash_after: 423c5513baaa6c44edc0a5c08dfb2cb157f6340a
    model: claude-opus-5-5
    cost: 4
    final: "all three loose fixes close: their merges stand on main"
  - step: sync
    hand: box 31f16efb1b52 · claude-code-remote
    hash_before: 1b817a69822f3db93cb199222b26bdd8cfe2f7d2
    hash_after: 1b817a69822f3db93cb199222b26bdd8cfe2f7d2
    answered:
      - name: sync
        exit: 0
        said: work/loose-fixes-a3b839d already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box 31f16efb1b52 · claude-code-remote
    hash_before: 2df2e00ada528799135319a90123b0db50a865f3
    hash_after: 2df2e00ada528799135319a90123b0db50a865f3
    inputs:
      - name: ask
        hash: 8dc00399b152ebf3
        size: 385
      - name: [[spec/design_input/the-cloud-runs-itself]]
        hash: 591680bf2c6fc6d6
        size: 13376
    def: 19b6849b1f151cd5
  - step: children
    hand: the engine
    hash_before: 36dfcadf5f00672b08e303a5a50f60b6e41a6ee8
    hash_after: 36dfcadf5f00672b08e303a5a50f60b6e41a6ee8
  - step: accept
    hand: box 31f16efb1b52 · claude-code-remote
    hash_before: 5d4065c33b5dbf9de5737528665c61b6d26741af
    hash_after: 5d4065c33b5dbf9de5737528665c61b6d26741af
    answered:
      - name: sync/sync
        exit: 0
        said: work/loose-fixes-a3b839d already carries every commit on main.
    inputs:
      - name: ask
        hash: 8dc00399b152ebf3
        size: 385
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: [[spec/design_input/the-cloud-runs-itself]]
        hash: 591680bf2c6fc6d6
        size: 13376
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box 31f16efb1b52 · claude-code-remote
    hash_before: 79fd3ca3ff936c89e1dc7b13706085b12fcfead0
    hash_after: 79fd3ca3ff936c89e1dc7b13706085b12fcfead0
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
  - step: retro/write
    hand: box 31f16efb1b52 · claude-code-remote
    hash_before: c5796dbde90afad2549ab48399b6cce4dff06f49
    hash_after: c5796dbde90afad2549ab48399b6cce4dff06f49
    inputs:
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: retro/notes
        hash: 310d2ddd3fe31ac9
        size: 36
    def: e7ed0badf886b5b5
  - step: retro/cloud
    hand: box 31f16efb1b52 · claude-code-remote
    hash_before: 064b15e06c8ba97df2e2bd2cbeb125744a122b8f
    hash_after: 064b15e06c8ba97df2e2bd2cbeb125744a122b8f
    inputs:
      - name: retro/write
        hash: 8a7c5071411b37c6
        size: 1893
      - name: [[spec/design_output/level0]]
        hash: 54ec69d2728d6aaf
        size: 92174
      - name: [[spec/guidance/cloud/cloud]]
        hash: 7c1b55b24304355c
        size: 3362
    def: 4da1ca5da87d5bbc
step: retro/cloud
reason: done
---

# Ask

The loose agent tickets on main land in this fix group, per [[spec/design_input/the-cloud-runs-itself#feature-groups-and-fix-groups]].

A fix group closes every ticket it holds. Work a person alone can do leaves it on the person route, loose on main.

- every ticket naming this group closes through the command it names
- `./RUNME.sh check` exits 0

The view: none.

The source: none.

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

- [[spec/tickets/doors-once-takes-main]], trivial
- [[spec/tickets/the-doors-pr-goes-green]], trivial
- [[spec/tickets/the-fleet-pr-goes-green]], trivial

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every child is small: each one reads a single merge on main
- the children add up to the goal: they are every ticket naming this group
- no child waits on another: each reads its own merge
- each child reads nothing from its siblings, so the order stands free
- the diff holds ticket fronts alone, and stays one review

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

- doors-once-takes-main closes: PR 116 merged its branch into main
- the-doors-pr-goes-green closes on the same merge, with src/proc green on the box
- the-fleet-pr-goes-green closes: PR 113 merged the fleet branch into main
- the group syncs main, and the check exits 0

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

- each child asked for a merge that already stood on main, so a read of origin answered it with no code
- the earlier fix groups history showed the road from draft through open to the retro

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->
<!-- the form is list -->

- no owner prompt turned this run, since a schedule fired it
- 23:24 UTC: the MCP ticket pull door refused its connection on the first hand-back, and the shell verb carried it
- 23:24 UTC: a prior hand wrote the command fields of doors-once-takes-main as prose, and the hand-back refused twice before they held one bare command
- 23:28 UTC: the group stood draft after its children closed, and branch done asked for a retro the pull would not hand out until the open verb ran

### improve

<!-- how each bad line stops happening, each line naming its home as a link, a ticket in backticks or a path in backticks -->
<!-- the form is list -->

- the work skill names the open verb for a group standing draft: `.claude/skills/work/SKILL.md`
- the write door refuses prose in a command field at the write, not the hand-back: [[spec/design_output/level0]]
- the MCP door failure goes to the next box that meets it, under the cloud guidance: [[spec/guidance/cloud/cloud]]

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The dispatch named work/examples-run-as-tests, and the take handed this fix group because that group waits on an owner read. Every child was stale: the merges it asked for had landed before this box took the branch.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every fact stands in one place: the retro points at the merges and the skill, and copies neither
- the change adds no number
- the change writes no file header
- the chapter carries each error with its time, and says no owner prompt turned the run
- the chapter names the box and the agent by role, with no name, address or box path

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->
<!-- the form is list -->

- 23:24 UTC: the MCP ticket pull door, whose local server refused its connection

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->
<!-- the form is list -->

- 23:28 UTC: a conflict at sync in the group ticket, which the front writer merged on its own
- the git write guard, which sent the push through the commit verb
- the gate guard, which split ticket open from the pull

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->
<!-- the form is list -->

- no person step parked, and no ticket minted
- the dispatched group work/examples-run-as-tests still waits on the owner read at example-schema-reads-steps

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
