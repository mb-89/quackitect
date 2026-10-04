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
group: the-verbs-run-in-go
enabled_by: migration.phase11
cloud: true
depends_on: ["quack-holds-a-verb-registry"]
step: retro/cloud
record:
  - step: sync
    hand: box 6183eb94e809 · claude-code-remote
    hash_before: 5969b5c79f1a280947b044a85d4afb3d6c8b5496
    hash_after: ec14aeba660dbf22ade7cb18ec77f976a896587a
  - step: sync
    hand: box 0b0033746104 · claude-code-remote
    hash_before: ec14aeba660dbf22ade7cb18ec77f976a896587a
    hash_after: 1765ef0b0515a651ecb8a6f8acc36fa0f2476a15
  - step: sync
    hand: box 056798343132 · claude-code-remote
    hash_before: a99933fc7dce788158ef3db5beeb9e80415e1b90
  - step: sync
    hand: box 056798343132 · claude-code-remote
    hash_before: 853bb7971ecb12ebf5c7fff1b17e5d4ccf9d5fa4
    hash_after: 87d14fd80d17402f2590f1b2260a57f80e1fc27d
    answered:
      - name: sync
        exit: 0
        said: work/config-verbs-run-in-go already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box 056798343132 · claude-code-remote
    hash_before: adf00d61f4426990c93839de8ccd10d59d461e53
    hash_after: adf00d61f4426990c93839de8ccd10d59d461e53
    inputs:
      - name: ask
        hash: 84c47567d30c2e81
        size: 325
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: 3eaee7b8cc71d34a
        size: 11400
    def: cb8f90bc86fc7d39
  - step: children
    hand: the engine
    hash_before: 5e90fabe8bbab6448d31a7696f5f0a9ec7b1dfb6
    hash_after: 5e90fabe8bbab6448d31a7696f5f0a9ec7b1dfb6
  - step: accept
    hand: box 056798343132 · claude-code-remote
    hash_before: bcf5d41e394f43ba3223025ece46aaefb17b7feb
    hash_after: 71b8d5413867f13bf1a754531af7d4eb0acdeb00
    answered:
      - name: sync/sync
        exit: 0
        said: work/config-verbs-run-in-go already carries every commit on main.
    inputs:
      - name: ask
        hash: 84c47567d30c2e81
        size: 325
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: 3eaee7b8cc71d34a
        size: 11400
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box 056798343132 · claude-code-remote
    hash_before: 730a26a997e2d4a7c52ee5138d9639d030b97fb2
    hash_after: 730a26a997e2d4a7c52ee5138d9639d030b97fb2
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
  - step: retro/write
    hand: box 056798343132 · claude-code-remote
    hash_before: 222d1b13ad04514f9711ea5942c69eb20716101a
    hash_after: 222d1b13ad04514f9711ea5942c69eb20716101a
    inputs:
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: retro/notes
        hash: 310d2ddd3fe31ac9
        size: 36
    def: 1246a42e29e7ae98
---

# Ask

Part of phase 11 of [[spec/design_input/the-migration-runs-in-slices#the-phases]]: the verbs config, fix, project, rules, standing and doors leave Node.

Done when these verbs run in Go with their contract tests passing, and their JavaScript files, and every JavaScript module no remaining JavaScript imports, leave the tree.

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

- [[spec/tickets/config-verbs-port-to-go]], standard
- [[spec/tickets/project-port-reads-both-roots]], trivial
- [[spec/tickets/toolsearch-rides-the-plan-ask]], trivial: a fix box lands it here by mistake, and it merges to main as #92

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the port child holds six verbs that each stand in their own file and test, so a reviewer reads it whole; the project fix reads one verb
- the port child covers every verb and every deleted module the goal names, and the group test reads the road and the importers, so nothing of the goal stands outside it
- the project fix follows the port gate and closes before the port does, and the toolsearch child waits on nothing of this group

# children

# accept

<!-- reads the diff since its last verdict against the goal and every prose criterion, and names what falls short as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

pass with points
- config-verbs-accept-points: the rules CRLF line, the calm write error, the project root variable and compare, and the dead exports

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

- config-verbs-port-to-go closes: the six verbs register in Go, and the group test reads the road and the importers
- two merges of main land, one over the merged read and work groups and one over the box group
- config-verbs-accept-points closes the four points the accept review names
- an orphan scan reads every module no code imports, and finds none this group leaves behind

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

- the read and work groups on main show the shape of a group test, so the move out of the shared registry test takes one file
- a reviewer at the decide tier reads the whole diff while the box checks CI, and names faults the tests miss

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->
<!-- the form is list -->

- 17:26 the plan names the group as a todo, so the commit verb and the pull refuse until the todo leaves
- 17:43 the pull over the index connection fails, and the shell verb lands the same hand-back
- 17:55 a stop to wait on the reviewer falls, since a cloud box that ends its turn stops its helpers, and the wait tool returns at once
- 18:03 the commit door refuses a change to cli-doors.js whose guard test stands in another file

### improve

<!-- how each bad line stops happening, named by its home -->
<!-- the form is list -->

- the plan guidance in spec/guidance/working names a ticket under working and never as a todo title
- the cloud guidance names a shell loop over the helper transcript as the wait inside a turn
- the testing guidance names the test file the commit door pairs with a module, its own name under test

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The branch carries its port done when this box takes it. The work left is two merges, the placement of the group test, and the review. The orphan scan runs as a throwaway script that reads static imports and every name a script or config mentions; the programs under src/scripts/verbs read as orphans because the runner loads them by name.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each fact the fixes add stands once: the work root variable in guidance.go, the deleted names in their guard tests
- the calmed file mode takes a name in the constants block of verb_fix.go
- the new group test opens on a header saying what it holds, and counts nothing
- the chapter carries the run errors with their times, and this run meets no owner prompt
- the chapter names roles alone, and no box path

## cloud

true

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
