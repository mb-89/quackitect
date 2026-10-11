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
step: retro/cloud
record:
  - step: sync
    hand: box 56610d6296ee · claude-code-remote
    hash_before: 64a23851cd86ae3a93b4bcb97d3053b4dc353a29
    session: cse_01MrTLCrMVwxLu7iw5LcpUqQ
    hash_after: 78e866baf027e6127ce25e643a7048755721ca28
    model: claude-opus-5-5
    cost: 0
    final: work/handovers-and-light-work stands done, and its pull request waits on CI with auto-merge on.
  - step: sync
    hand: box 56610d6296ee · claude-code-remote
    hash_before: 8b7dd86c82a8473a254ca824144f1217f358ad02
    hash_after: 8b7dd86c82a8473a254ca824144f1217f358ad02
    answered:
      - name: sync
        exit: 0
        said: work/handovers-and-light-work already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box 56610d6296ee · claude-code-remote
    hash_before: a3ec645361ad13eb5bba6ed1404bd3d919aab9ac
    hash_after: a3ec645361ad13eb5bba6ed1404bd3d919aab9ac
    inputs:
      - name: ask
        hash: cb81d706e020e71f
        size: 349
    def: 19b6849b1f151cd5
  - step: children
    hand: the engine
    hash_before: 729ce862adaf6185c7eb4ef379add527e5bce0c9
    hash_after: 729ce862adaf6185c7eb4ef379add527e5bce0c9
  - step: accept
    hand: box 56610d6296ee · claude-code-remote
    hash_before: 8267311f767162528d8942c2f5a703a14f65b2cc
    hash_after: 8267311f767162528d8942c2f5a703a14f65b2cc
    answered:
      - name: sync/sync
        exit: 0
        said: work/handovers-and-light-work already carries every commit on main.
    inputs:
      - name: ask
        hash: cb81d706e020e71f
        size: 349
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box 56610d6296ee · claude-code-remote
    hash_before: ed85d3f0157cbb77c400b8c169c27e1bde7a6894
    hash_after: ed85d3f0157cbb77c400b8c169c27e1bde7a6894
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
  - step: retro/write
    hand: box 56610d6296ee · claude-code-remote
    hash_before: 9725f9055556062ea08c9825e7d65fadd6d24e50
    hash_after: 9725f9055556062ea08c9825e7d65fadd6d24e50
    inputs:
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: retro/notes
        hash: cd64de0d4d23e2c7
        size: 40
    def: e7ed0badf886b5b5
  - step: retro/cloud
    hand: box 56610d6296ee · claude-code-remote
    hash_before: 65ef41734dc39d242035f4f751a5337252d761f1
    hash_after: 65ef41734dc39d242035f4f751a5337252d761f1
    inputs:
      - name: retro/write
        hash: 80c45b489715ad67
        size: 2118
    def: 4da1ca5da87d5bbc
reason: done
---

# Ask

A box that dies leaves the next box a handover. Small work takes a light route that knows when to stop. The hand at tests-green aims at the ask, with the red tests as its floor. Three clean-room teams built these on their own, on `experiment/cleanroom-a`, `-b` and `-c`, and v5 lacks them.

Done when every child closes through the command it names.

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

- [[spec/tickets/crash-leaves-a-handover]], standard
- [[spec/tickets/small-work-takes-light-path]], standard
- [[spec/tickets/tests-green-names-the-ask]], standard
- [[spec/tickets/gate-next-line-test]], trivial
- [[spec/tickets/reworded-input-keeps-the-step]], trivial
- [[spec/tickets/stale-callers-name-hand-out]], trivial

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each child holds one module or one route, and reviews whole
- the three standard children carry the three goals, and the trivial ones carry findings their reviews minted
- no child waits on another, so none names depends_on
- the light route rides the tests-green reword, which landed first
- the group diff reads in one review, so no child splits off

# children

# accept

<!-- reads the diff since its last verdict against the goal and every prose criterion, and names what falls short as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept

- A dying box leaves a handover: the beat carries the held step and the handover, and a takeover prints them with the record and the commits since the take.
- Small work takes the light route: a mint with no process lands on the trivial route, whose step carries the stopping line.
- The tests-green hand aims at the ask, with the red tests as its floor, in the standard route.
- The check answers green on the head, and every child closes through its own route.

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

- `small-work-takes-light-path`: a mint with no process takes the trivial route, whose step carries the stopping line
- the gate of `small-work-takes-light-path`, read against the code it names
- the group sync, split and accept
- the minted golden and the projected output style, which followed the route and the guidance

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

- the stale-hash pattern beta already used carried alpha onto the trivial route, so the example needed no new harness verb
- the pull named each missing field on refusal, so each fix took one turn

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->
<!-- the form is list -->

- at the take, the level0 tool server disconnected, so every verb ran through RUNME.sh
- at implement/change, the frozen red test panicked on t.Parallel beside the t.Setenv in runsVerb, since a sibling rewrote it after the freeze
- at implement/change, the lint named mint unshown until the index took the new example in
- at implement/change, the commit hook refused a rename in src/pull with no test beside it
- at the hand-backs, the pull refused a missing checked field twice and a verdict flag once
- no owner prompt turned this run

### improve

<!-- how each bad line stops happening, each line naming its home as a link, a ticket in backticks or a path in backticks -->
<!-- the form is list -->

- the panic: the red step runs its own case before its pass, `spec/processes/standard.yaml`
- the stale index: lint reindexes the paths it names, `src/modules/check/coverage.go`
- the rename refusal: the gate names the test beside each package a draft touches, `spec/guidance/review/design.md`
- the checked refusals: the hand-out prints the checklist above the fields, `src/pull/pull_chapter.go`

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The ask names mint-light.md, and the harness wires no mint, so the example shows the pull side of the light route. Moving alpha onto the trivial route cost two sibling examples a checklist each. A separate planted ticket cost a harness change, so the checklist lines won. The red test came in broken by a sibling, and the reopen carried the fix in the open.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the light route name stands once, as `pull.LightRoute`
- the change adds no number
- the new example header says what it shows
- the run met no owner prompt, and each error carries its step
- the chapter names roles alone

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->
<!-- the form is list -->

- the level0 tool server, gone at the take, so every verb ran through RUNME.sh

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->
<!-- the form is list -->

- the commit hook, which refused a code change in src/pull with no test beside it
- no trunk guard, no sync conflict and no cap

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->
<!-- the form is list -->

- no person step parked
- no ticket minted outside the group
- the handover says the group stands done and its pull request carries auto-merge

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
