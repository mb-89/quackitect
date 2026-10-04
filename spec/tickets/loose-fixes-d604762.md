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
fix: true
record:
  - step: sync
    hand: box 34b754bfb977 · claude-code-remote
    hash_before: 4d849071b0c52486cdcd82f38fa4dfe60ab60282
  - step: sync
    hand: box 34b754bfb977 · claude-code-remote
    hash_before: 5ba40da57896c6699a5e229af464e65f4ed98c63
    hash_after: 5ba40da57896c6699a5e229af464e65f4ed98c63
    answered:
      - name: sync
        exit: 0
        said: work/loose-fixes-d604762 already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box 34b754bfb977 · claude-code-remote
    hash_before: 3e3b6bf737c6c543edad11dd99bd7a5f10b8212a
    hash_after: 3e3b6bf737c6c543edad11dd99bd7a5f10b8212a
    inputs:
      - name: ask
        hash: 8dc00399b152ebf3
        size: 385
      - name: [[spec/design_input/the-cloud-runs-itself]]
        hash: 591680bf2c6fc6d6
        size: 13376
    def: cb8f90bc86fc7d39
  - step: children
    hand: the engine
    hash_before: e442987ace7cfa6724be19c4bde4024be976de94
    hash_after: e442987ace7cfa6724be19c4bde4024be976de94
  - step: accept
    hand: box 34b754bfb977 · claude-code-remote
    hash_before: 171b70a811c7946068a1deb999bb68bcb40a813e
    hash_after: 171b70a811c7946068a1deb999bb68bcb40a813e
    answered:
      - name: sync/sync
        exit: 0
        said: work/loose-fixes-d604762 already carries every commit on main.
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
    hand: box 34b754bfb977 · claude-code-remote
    hash_before: 5e776b3b85c9f78ecb538801afc184ff3de24f1e
    hash_after: 5e776b3b85c9f78ecb538801afc184ff3de24f1e
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
  - step: retro/write
    hand: box 34b754bfb977 · claude-code-remote
    hash_before: 22226bcbd6bba0c513cc2e66299f637901d20179
    hash_after: 22226bcbd6bba0c513cc2e66299f637901d20179
    inputs:
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: retro/notes
        hash: 310d2ddd3fe31ac9
        size: 36
    def: 1246a42e29e7ae98
step: retro/cloud
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

- [[spec/tickets/cli-check-drops-known]], on the trivial process

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every child is small enough to review whole: the one child drops an unused import
- the children add up to the goal: the group holds the one loose agent ticket the dispatch bundled
- no child waits on another

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

- cli-check-drops-known closes on the trivial process: the fix stood on main already, and its case and the check ran green on this branch
- the fix group opens from draft, passes sync, split, children and accept, and drains the private notes

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

- the ticket discussion named the commit carrying the fix and the command proving it, so the do step took one test run and one check
- the shell verb ran the hand-back while the level0 server refused connections

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->
<!-- the form is list -->

- 23:18 UTC: the first shell call named no ticket in its description, and the door refused it
- 23:23 UTC: the MCP hand-back carried command output in command fields, and the engine refused it, since it runs each command itself
- 23:23 UTC: the level0 server refused the connection on the next MCP hand-back
- 23:25 UTC: branch done refused, because the check ran against the commit before the child closed
- 23:25 UTC: the pull answered wait, because the dispatch leaves the fix group at draft and the work skill names no open
- 23:26 UTC: the gate refused a call joining ticket open and ticket pull with a semicolon
- 23:27 UTC: accept refused the pass flag, since the verdict field decides
- 23:27 UTC: the plan grace ran out, and the engine refused the call until the plan answered

### improve

<!-- how each bad line stops happening, named by its home -->
<!-- the form is list -->

- the work skill at .claude/skills/work/SKILL.md names ticket open on a fix group standing at draft, or the dispatch opens the fix group it mints
- the hand-back says beside a command field that it takes the command alone
- the box answers the plan with its first pull, to keep the grace unspent

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The group held one child, and that child's fix stood on main before the box took the branch. The run spent most of its turns on the route, and the work itself took one test and one check. The draft state read as a hold for a person, and a past fix group opened by an agent box settled the call to open it.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every fact stands in one place: the retro points at the skill file and adds no rule
- the change adds no number
- the change writes no header
- the chapter carries every refusal of the run with its time, and the run met no owner prompt, being scheduled
- the chapter names the box by role alone

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
