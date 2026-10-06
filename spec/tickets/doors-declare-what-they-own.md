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
step: children
record:
  - step: sync
    hand: box 86086f797ef7 · claude-code-remote
    hash_before: da741f5f123173c85bd77f61f444686c070327b9
    hash_after: 8f1ec24d9f276cee46ea41a3acbb797c9c5dc6f1
  - step: sync
    hand: box add8d8d0dd3d · claude-code-remote
    hash_before: 8f1ec24d9f276cee46ea41a3acbb797c9c5dc6f1
    hash_after: 662b6ca513f99fd65db69b8b95095d9ac9d01f11
  - step: sync
    hand: box add8d8d0dd3d · claude-code-remote
    hash_before: 24c4d3ad77b895af516ac6ed334fb47a340afcc1
    hash_after: 24c4d3ad77b895af516ac6ed334fb47a340afcc1
    answered:
      - name: sync
        exit: 0
        said: work/doors-declare-what-they-own already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box add8d8d0dd3d · claude-code-remote
    hash_before: 9695c0507c8a9d005401cce19c692e343d5243d7
    hash_after: 010fcc7e9cb34c85805ec76bf5acf4a777ff816d
    inputs:
      - name: ask
        hash: 94aff2f3cc1fa455
        size: 623
    def: cb8f90bc86fc7d39
---

# Ask

Every IO module, which is a door, declares what it owns, and nothing walks around a door. A call to a primitive a door owns, from anywhere outside that door, is refused in `./RUNME.sh check`, at the push gate, in CI and in the editor through the lsp IO module. Time is a door like any other: code waits on events, and the clock alone touches time. The one escape is `level0: OutsideInDoors - <reason>`, and the guard lists every marked line.

Done when the guard refuses, not reports, every walk-around, the walk-around list stands empty, and the code and testing guidance, the doors note and the model note carry the rule.

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

[[spec/tickets/a-guard-reads-door-declarations]] standard, closed
[[spec/tickets/door-lists-take-whole-packages]] trivial, closed
[[spec/tickets/doors-only-reads-the-declarations]] trivial, closed
[[spec/tickets/draft-lists-match-red-tests]] trivial, closed
[[spec/tickets/owns-joins-the-pure-tree]] trivial, closed
[[spec/tickets/go-waits-on-events]] standard
[[spec/tickets/quack-waits-on-the-clock]] standard
[[spec/tickets/quack-reaches-the-box-through-doors]] standard
[[spec/tickets/javascript-reaches-through-doors]] standard
[[spec/tickets/go-tests-meet-the-doors]] standard
[[spec/tickets/the-guard-refuses]] standard

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

each open child takes one slice of the walk-around list `./RUNME.sh doors` prints, by language, by production or test, and by root or not, so a review reads one slice whole
the five slices cover every walk-around the list holds, and `the-guard-refuses` takes the refusal, the retirement of `DoorsOnly` and the guidance, which closes the goal
`go-tests-meet-the-doors` names `tests-meet-the-doors-once` under depends_on, since that group moves the tests onto fakes, and `the-guard-refuses` names the five slices

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
