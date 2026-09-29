---
kind: [[ticket]]
state: open
step: accept
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
record:
  - step: sync
    hand: box d84fcad60110c · claude-code-remote
    hash_before: 29658dea603ac6cbf84d805c464b7e6e53cb920a
    hash_after: 6505cc599a68905dfdcabca8361234038b7e8d69
  - step: sync
    hand: box d8509c02d5db · claude-code-remote
    hash_before: 6505cc599a68905dfdcabca8361234038b7e8d69
  - step: sync
    hand: box d8509c02d5db · claude-code-remote
    hash_before: 5bda54b4d1382e08c465479276ec1a3b15379399
    hash_after: 5bda54b4d1382e08c465479276ec1a3b15379399
    answered:
      - name: sync
        exit: 0
        said: work/quack-verbs-land-in-shadow already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box d8509c02d5db · claude-code-remote
    hash_before: 2e6216be8a8ce6554e5419fba395c169f5f3a723
    hash_after: 2e6216be8a8ce6554e5419fba395c169f5f3a723
    inputs:
      - name: ask
        hash: b473a38aee98cc88
        size: 613
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: e122785976621597
        size: 10947
    def: cb8f90bc86fc7d39
  - step: children
    hand: the engine
    hash_before: 80a236d8cd567e599067dc331251b45d5a25e5a2
    hash_after: 80a236d8cd567e599067dc331251b45d5a25e5a2
depends_on: ["open-tasks-shadow-lands", "read-topics-land-in-shadow"]
enabled_by: migration.phase4shadow
cloud: true
---

# Ask

Phase 4 of [[spec/design_input/the-migration-runs-in-slices#the-phases]], in shadow: the actions and the command line. A generated `quack`, verbs ported topic by topic as actions answering within the wait their caller sets, and the tool list the index generates. The old path keeps answering, and every mismatch writes a `shadow` row to the session log. The shadow adds the key `migration/config/slices/verbs`, which the `migration` module declares as a shared key in the default file.

Done when the new path runs in shadow on `main`, and `./RUNME.sh log --kind shadow` names each mismatch for the owner to read.

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

[[spec/tickets/action-refusals-meet-cases]] trivial
[[spec/tickets/actions-answer-over-http]] standard
[[spec/tickets/branch-list-reads-work-table]] trivial
[[spec/tickets/cli-draft-lists-every-case]] trivial
[[spec/tickets/gone-names-its-unit]] trivial
[[spec/tickets/needs-shadow-callers-named-whole]] trivial
[[spec/tickets/needs-wait-on-branch-topic]] trivial
[[spec/tickets/pull-verbs-become-actions]] standard
[[spec/tickets/quack-alone-verbs-skip-mode]] trivial
[[spec/tickets/quack-main-routes-the-tree]] trivial
[[spec/tickets/quack-tools-spares-runme-tools]] trivial
[[spec/tickets/retro-notes-twin-joins-road]] trivial
[[spec/tickets/retro-usage-names-every-verb]] trivial
[[spec/tickets/retro-verbs-become-actions]] standard
[[spec/tickets/runme-hands-verbs-to-quack]] standard
[[spec/tickets/the-hook-registers-index-tools]] standard
[[spec/tickets/the-quack-cli-gets-generated]] standard
[[spec/tickets/ticket-draft-real-callers]] trivial
[[spec/tickets/ticket-verbs-become-actions]] standard
[[spec/tickets/ticket-verbs-each-pinned]] trivial
[[spec/tickets/tool-list-shape-held-once]] trivial
[[spec/tickets/vehicle-cases-own-files]] trivial
[[spec/tickets/vehicle-stub-native-ports]] trivial
[[spec/tickets/vehicle-verbs-become-actions]] standard
[[spec/tickets/verb-road-keeps-the-terminal]] trivial
[[spec/tickets/wait-key-meets-its-wiring]] trivial
[[spec/tickets/work-verbs-become-actions]] standard

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

each standard child ports one topic or one layer, and each trivial child one fix, so every one reads whole in one review
the children lay down the generated quack, the road that runs it beside cli.js, the ticket, retro, pull, vehicle, stub and branch topics as actions, and the tool list the hook registers; the native ports past shadow belong to quack-verbs-switch-over
each standard child names the one it waits on under depends_on, back to actions-answer-over-http

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
