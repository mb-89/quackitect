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
step: accept
record:
  - step: sync
    hand: box 3341fdcd540f · claude-code-remote
    hash_before: 51be8a910c58dae0ebcdbe7a7d9c224a8f50314a
  - step: sync
    hand: box 3341fdcd540f · claude-code-remote
    hash_before: e423bdcbb0794321960db6acc36c8135c2d65e0d
    hash_after: e423bdcbb0794321960db6acc36c8135c2d65e0d
    answered:
      - name: sync
        exit: 0
        said: work/boxes-hold-and-hand-back already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box 3341fdcd540f · claude-code-remote
    hash_before: 9dcab0e04a61c0a6980b4af5f535b6e51abfee67
    hash_after: 9dcab0e04a61c0a6980b4af5f535b6e51abfee67
    inputs:
      - name: ask
        hash: 1d203dacf8882c98
        size: 453
    def: cb8f90bc86fc7d39
  - step: children
    hand: the engine
    hash_before: ff2257b6b611f1477630afe8e211a6e993edfcca
    hash_after: ff2257b6b611f1477630afe8e211a6e993edfcca
---

# Ask

A cloud box holds its branch while it lives, and hands its work on whole when it dies. A hold beats with the session, so a dead box frees its branch at once and a live box keeps it. A takeover takes in the commits the old box never pushed, through a rescue branch on origin. A cloud turn ends on a decision, never on a question, and a box waits for its helpers and its retries inside its turn, so no group stands idle waiting for a person or a takeover.

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

[[spec/tickets/holds-beat-with-the-session]] standard
[[spec/tickets/takeover-rescues-unpushed-commits]] standard
[[spec/tickets/cloud-turns-end-without-questions]] standard
[[spec/tickets/cloud-boxes-wait-in-turn]] trivial
[[spec/tickets/beat-after-joins-schema]] trivial
[[spec/tickets/beat-hook-stays-quiet]] trivial
[[spec/tickets/beats-pass-the-push-gate]] trivial
[[spec/tickets/ended-beat-ties-the-tip]] trivial
[[spec/tickets/cloud-question-check-leaves-readstext]] trivial
[[spec/tickets/rescue-passes-the-stamp-gate]] trivial
[[spec/tickets/ci-skips-rescue-and-beats]] trivial

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

every child is small enough to review whole: the three standard children each touch one mechanism, and the trivial ones one line or one case
the children add up to the goal: the beat holds a live branch, the rescue hands a dead box work on, the turn ends on a decision, and the box waits inside its turn; nothing of the ask stands outside them
no child waits on another now: every child stands closed, and the rescue children followed their parent through its gate

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
