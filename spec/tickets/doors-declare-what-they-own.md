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
  - step: children
    hand: box 19cb641dbdcb · claude-code-remote
    hash_before: bb9fa5b20e89f9463d86b47dc04cb2092640458a
    session: cse_01D5wBTxJEqTT1F3hCvb8jFt
    hash_after: b70f1295ba8d6fc26f6c230178219cd9f4c7589b
  - step: children
    hand: box a6da1713d31c · claude-code-remote
    hash_before: b70f1295ba8d6fc26f6c230178219cd9f4c7589b
    session: cse_0125LjSR91WkCJwTVcspgKFe
    hash_after: 274f72eb644d46ddefab7282de3a8cc05d3a47af
  - step: children
    hand: box 19cb641dbdcb · claude-code-remote
    hash_before: 274f72eb644d46ddefab7282de3a8cc05d3a47af
    session: cse_01D5wBTxJEqTT1F3hCvb8jFt
    hash_after: c69855ec2082e22a15c21aecb043696cde0797a7
  - step: children
    hand: box dcf1ea3c64fd · claude-code-remote
    hash_before: b5287724e9522e961800fc2616bd9cc5e6ff58a5
    session: cse_01JQCqCqANP4YpSAFbbhiD1M
  - step: split
    hand: box dcf1ea3c64fd · claude-code-remote
    hash_before: bf6d8af517ae4b63bc6516a99b61f638980a72d5
    hash_after: bf6d8af517ae4b63bc6516a99b61f638980a72d5
    inputs:
      - name: ask
        hash: 94aff2f3cc1fa455
        size: 623
    def: 19b6849b1f151cd5
  - step: children
    hand: the engine
    hash_before: 73d845a1bf91d74eaed16690c62b488da49c237f
    hash_after: 73d845a1bf91d74eaed16690c62b488da49c237f
  - step: accept
    hand: box dcf1ea3c64fd · claude-code-remote
    hash_before: f81b5729a80eb9c8aa8d878594b8d1bc9c091a7d
    hash_after: a6eebf4e55ad1d860bf3ef61577ef2519ed77b0d
    answered:
      - name: sync/sync
        exit: 0
        said: work/doors-declare-what-they-own already carries every commit on main.
    inputs:
      - name: ask
        hash: 94aff2f3cc1fa455
        size: 623
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
    def: 07c43ae7253713ec
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
[[spec/tickets/a-live-branch-holds-its-dependents]] standard, closed
[[spec/tickets/clock-test-asserts-q-clock]] trivial, closed
[[spec/tickets/contract-beside-files-key]] trivial, closed
[[spec/tickets/contract-names-its-door]] trivial, closed
[[spec/tickets/door-families-name-contracts-alone]] trivial, closed
[[spec/tickets/door-lists-take-whole-packages]] trivial, closed
[[spec/tickets/door-tables-name-standing-doors]] trivial, closed
[[spec/tickets/doorless-walk-names-no-door]] trivial, closed
[[spec/tickets/doors-lists-contract-tests]] trivial, closed
[[spec/tickets/doors-lists-declared-outsides]] trivial, closed
[[spec/tickets/doors-only-reads-the-declarations]] trivial, closed
[[spec/tickets/doorsonly-leaves-every-note]] trivial, closed
[[spec/tickets/draft-lists-match-red-tests]] trivial, closed
[[spec/tickets/extension-loads-doors-async]] trivial, closed
[[spec/tickets/extension-root-is-activate]] trivial, closed
[[spec/tickets/fake-vscode-names-its-door]] trivial, closed
[[spec/tickets/family-rows-name-standing-files]] trivial, closed
[[spec/tickets/go-rows-name-declared-contracts]] trivial, closed
[[spec/tickets/go-tests-meet-the-doors]] standard, closed
[[spec/tickets/go-waits-on-events]] standard, closed
[[spec/tickets/javascript-reaches-through-doors]] standard, closed
[[spec/tickets/owns-joins-the-pure-tree]] trivial, closed
[[spec/tickets/page-owns-math-random]] trivial, closed
[[spec/tickets/quack-boxfiles-joins-door]] trivial, closed
[[spec/tickets/quack-door-keeps-contract]] trivial, closed
[[spec/tickets/quack-marks-name-reasons]] trivial, closed
[[spec/tickets/quack-reaches-the-box-through-doors]] standard, closed
[[spec/tickets/quack-row-names-its-contracts]] trivial, closed
[[spec/tickets/quack-size-names-files]] trivial, closed
[[spec/tickets/quack-waits-on-the-clock]] standard, closed
[[spec/tickets/skill-scripts-meet-the-guard]] trivial, closed
[[spec/tickets/test-walks-move-onto-fakes]] standard, closed
[[spec/tickets/tests-list-misses-callers]] trivial, closed
[[spec/tickets/tests-reach-the-fake-clock]] trivial, closed
[[spec/tickets/the-guard-refuses]] standard, closed
[[spec/tickets/watchertest-helper-meets-its-door]] trivial, closed
[[spec/tickets/watchertest-waits-through-clock]] trivial, closed

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

every child closed at a size one review reads whole, the largest the-guard-refuses at one commit of declarations and one of the guard
the children add up to the goal: the guard refuses every walk, the list stands empty, and the doors note, the model note and the code and testing guidance carry the rule, so nothing of the goal stands outside them
no child waits on another now, since every child stands closed
the five children the gate of the-guard-refuses minted landed before its implement step, which read them, and the rest landed in their pull order
the group mints no further child, so its diff stops here, and the retro reads it as one review

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
