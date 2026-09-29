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
  - step: accept
    hand: box d8509c02d5db · claude-code-remote
    hash_before: 936f65ec851eb6d0ea7130ca596be23c368b53db
    hash_after: 936f65ec851eb6d0ea7130ca596be23c368b53db
    answered:
      - name: sync/sync
        exit: 0
        said: work/quack-verbs-land-in-shadow already carries every commit on main.
    inputs:
      - name: ask
        hash: b473a38aee98cc88
        size: 613
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: e122785976621597
        size: 10947
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box d8509c02d5db · claude-code-remote
    hash_before: ecaba082861b018bacc217b30561951873f3f0a5
    hash_after: ecaba082861b018bacc217b30561951873f3f0a5
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
  - step: retro/write
    hand: box d8509c02d5db · claude-code-remote
    hash_before: 3e366e4eb61f99892c39bcd4f10e0e07066b2742
    hash_after: 3e366e4eb61f99892c39bcd4f10e0e07066b2742
    inputs:
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: retro/notes
        hash: 310d2ddd3fe31ac9
        size: 36
    def: 1246a42e29e7ae98
  - step: retro/cloud
    hand: box d8509c02d5db · claude-code-remote
    hash_before: eb4741b2e48abff602bd1a565c8cff02cf822481
    hash_after: eb4741b2e48abff602bd1a565c8cff02cf822481
    inputs:
      - name: retro/write
        hash: 4994eac8234d1839
        size: 2985
    def: 4da1ca5da87d5bbc
depends_on: ["open-tasks-shadow-lands", "read-topics-land-in-shadow"]
enabled_by: migration.phase4shadow
cloud: true
reason: done
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

accept
- migration.verbs reads shadow off the tracked spec/config/level0.json, and migration.go declares the key with its default, so the new path runs in shadow on main once this merges
- the ticket, retro, pull, vehicle, stub and branch topics stand as actions in src/modules/verbs, the generated quack and its road stand in src/quack, and the tool list stands in src/index/tools.go
- ./RUNME.sh log --kind shadow names the need rows where cli.js and the registry part, and ./RUNME.sh check exits 0

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

vehicle-cases-own-files and vehicle-stub-native-ports close became vehicle-verbs-become-actions
vehicle-verbs-become-actions passes change and tests-green, and closes done
work-verbs-become-actions passes its gate through a separate hand, then change and tests-green, and closes done
the branch row stands in the ports table under the quack-verbs-switch-over Discussion
the note config-reads-the-tracked-file becomes index-reads-loaded-projections under quack-verbs-switch-over
the group passes sync, split, accept and retro/notes

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

the handover named each step in order, so the box needed no search after the clear
the red cases stood in files of their own, so the branch change turned them green without touching the vehicle cases
the gate hand named three concrete rows, and each took one line at implement

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->
<!-- the form is list -->

10:02 the implement/change checked line said vehicle.go points at a design section, and it points at its ticket; the box wrote the line before it opened the file
10:06 the engine refused go test as the tests field, and took ./RUNME.sh test over the same files
10:09 the stop claiming a helper still runs fell, since a cloud box ending its turn stops its helpers; the wait tool holds the turn instead
10:10 the pull answered wait after the gate, since the plan held the ticket as its working todo, and an empty working field left it standing; done on the todo cleared it
10:21 the accept hand-back refused --pass, since a verdict field decides the leaf alone
10:22 the decide leaf ignored the outcome field, and closed on --became
10:22 the gate hand's bare pull answered wait, and it took the ticket by name

### improve

<!-- how each bad line stops happening, named by its home -->
<!-- the form is list -->

spec/guidance/tickets rule 15 already asks the author to open every file before a claim; the box holds it at implement/change as at design
the tests field of tests-green names ./RUNME.sh test in its says line, in spec/processes/standard
the stop tool's helpers reason already says so; the box reaches for the wait tool first
the plan tool clears a ticket todo on done alone; the handover's restart line names done, not an empty working field
the verdict and choice forms name the hand-back flag they take, in the pull's answer line, in src/scripts/pull-hand.js

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The note on the config looked like a missing wire, and the index showed every loaded projection reading its default, the queue plan and the ticket notes among them. That moved the successor out of this group, since the verbs road reads the tracked file straight and the shadow runs without the index's config.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

each fact points at the file owning it: the ports table, the successor ticket, the process
the queue columns carry names once, as constants in twins.go beside the queueOnly pointer
the headers the change writes say what the file is for
the badly list carries each error off the transcript with its time; no owner prompt came in this window past the clear
the chapter names roles and repository files, and no box path

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->
<!-- the form is list -->

none: every tool, host and right this window reached answered

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->
<!-- the form is list -->

the context cap cleared the conversation at the start, and the handover carried the work across
the write hook refused a Bash call naming no ticket, and the next call named it
the plan hook refused calls until the plan named the work in hand

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->
<!-- the form is list -->

no person step parks
no ticket stands minted with no group: index-reads-loaded-projections names quack-verbs-switch-over
the handover names the branch done and its pull request against main

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
