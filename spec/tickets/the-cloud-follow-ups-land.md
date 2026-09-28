---
kind: [[ticket]]
state: open
step: retro/notes
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
    hand: box d81c8e27d9d7 · claude-code-remote
    hash_before: 9729e9d5f4f6c01750f6cc86451f8f84a6d775cf
    hash_after: c171a7f85b51e8f0c3412a9e6dd019f4adda24e7
    answered:
      - name: sync
        exit: 0
        said: work/the-cloud-follow-ups-land took 2 commit(s) from main.
    def: 8a9850a81227554b
  - step: split
    hand: box d81c8e27d9d7 · claude-code-remote
    hash_before: 2f43b1ae0a8befcce00889559ceaff1c5cc558dc
    hash_after: 2f43b1ae0a8befcce00889559ceaff1c5cc558dc
    inputs:
      - name: ask
        hash: ccd35afe8c09c8f0
        size: 309
    def: cb8f90bc86fc7d39
  - step: children
    hand: the engine
    hash_before: 1ece928c7e2c8f44ee7b952806bebc637114d05d
    hash_after: 1ece928c7e2c8f44ee7b952806bebc637114d05d
  - step: accept
    hand: box d81c8e27d9d7 · claude-code-remote
    hash_before: 739cc9f5f74103f04cb98ad6bd85346f40fc0ef7
    hash_after: b58305e33f9ae911ccb9021dab18c1e77772b8fb
    returns: 1
    why: boxes-open-no-pull and the-owner-runs-the-dispatch stand open inside the group, so two of the three rulings stand unanswered
    answered:
      - name: sync/sync
        exit: 0
        said: work/the-cloud-follow-ups-land already carries every commit on main.
  - step: children-2
    hand: the engine
    hash_before: 8e878face1f8c58aba336e27f371ee00d7a71b19
    hash_after: 8e878face1f8c58aba336e27f371ee00d7a71b19
  - step: accept
    hand: box d81c8e27d9d7 · claude-code-remote
    hash_before: f2c29a8c3fcb8b9b428e5a40ad746ca6d7fe51e7
    hash_after: e2f2f0985ddbe355a09edcb75787521a1503a7a0
    answered:
      - name: sync/sync
        exit: 0
        said: work/the-cloud-follow-ups-land took 3 commit(s) from main.
    inputs:
      - name: ask
        hash: ccd35afe8c09c8f0
        size: 309
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: children-2
        hash: 811c9dc59e3779b9
        size: 0
    def: bf1fe6cde364dfd7
---

# Ask

The cloud's hand-over follows the owner's rulings:

- a box opens its group's pull request, with auto-merge on
- the dispatch Action runs live on the repo
- a merge that conflicts still takes its group out of the cloud

Done when every child closes through the command it names, and `./RUNME.sh check` passes.

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

- [[spec/tickets/conflicts-drop-the-marker]], trivial
- [[spec/tickets/boxes-open-no-pull]], question
- [[spec/tickets/the-owner-runs-the-dispatch]], question

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each child is one answer or one guard with its test, small enough to review whole
- the three children carry the three rulings of the goal, and nothing stands outside them
- no child waits on another, so none names depends_on

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
