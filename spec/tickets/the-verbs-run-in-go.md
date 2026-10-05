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
enabled_by: migration.phase11
depends_on: ["node-leaves-the-boxes"]
step: retro/cloud
cloud: true
record:
  - step: sync
    hand: box b87e97900f8f · claude-code-remote
    hash_before: 7f85c79d84ae5223cbb569b8ad1ec7a55e0c463e
    hash_after: 7f85c79d84ae5223cbb569b8ad1ec7a55e0c463e
    answered:
      - name: sync
        exit: 0
        said: work/the-verbs-run-in-go already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box b87e97900f8f · claude-code-remote
    hash_before: d473ee54287ca03888bbe9332b43d5fd56a75979
    hash_after: d473ee54287ca03888bbe9332b43d5fd56a75979
    inputs:
      - name: ask
        hash: f597d0eaba229fa9
        size: 257
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: 3eaee7b8cc71d34a
        size: 11400
    def: cb8f90bc86fc7d39
  - step: children
    hand: the engine
    hash_before: 01f66aba2fd217944e501956122508ecb653ffa5
    hash_after: 01f66aba2fd217944e501956122508ecb653ffa5
  - step: accept
    hand: box b87e97900f8f · claude-code-remote
    hash_before: d109bd9925c78036f0075d39f1c2dda83a388d39
    hash_after: d109bd9925c78036f0075d39f1c2dda83a388d39
    answered:
      - name: sync/sync
        exit: 0
        said: work/the-verbs-run-in-go already carries every commit on main.
    inputs:
      - name: ask
        hash: f597d0eaba229fa9
        size: 257
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: 3eaee7b8cc71d34a
        size: 11400
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box b87e97900f8f · claude-code-remote
    hash_before: 64c80ab688af596486fb6e0f2d97e667812142e0
    hash_after: 64c80ab688af596486fb6e0f2d97e667812142e0
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
  - step: retro/write
    hand: box b87e97900f8f · claude-code-remote
    hash_before: f3969a82c02bf172f81456c63e05e6d1a469e470
    hash_after: f3969a82c02bf172f81456c63e05e6d1a469e470
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

Phase 11 of [[spec/design_input/the-migration-runs-in-slices#the-phases]]: the verbs leave Node. Every verb `programOf` hands to node runs in Go, each from its own file.

Done when `programOf` hands no verb to node, and `src/scripts/verbs/` leaves the tree.

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

- [[spec/tickets/quack-holds-a-verb-registry]], group
- [[spec/tickets/read-verbs-run-in-go]], group
- [[spec/tickets/work-verbs-run-in-go]], group
- [[spec/tickets/box-verbs-run-in-go]], group
- [[spec/tickets/landing-verbs-run-in-go]], group
- [[spec/tickets/check-verbs-run-in-go]], group
- [[spec/tickets/retro-verbs-run-in-go]], group
- [[spec/tickets/dispatch-verbs-run-in-go]], group
- [[spec/tickets/config-verbs-run-in-go]], group
- [[spec/tickets/window-verbs-run-in-go]], group
- [[spec/tickets/ticket-verbs-run-in-go]], group
- [[spec/tickets/the-node-road-closes]], group
- [[spec/tickets/box-verbs-windows-fakes]], trivial
- [[spec/tickets/landing-verbs-windows-green]], trivial
- [[spec/tickets/manager-tests-wait-for-the-binary]], trivial

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- size: every child is a group of its own or a trivial ticket, and each merged through its own pull request
- the goal: the ten verb groups port the verbs, and the-node-road-closes takes programOf and src/scripts/verbs away, so nothing of the goal stands outside them
- depends_on: every child stands closed, so no child waits on another

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

- pull request 105 of the-node-road-closes merged, after its Windows job passed on re-run
- box-verbs-windows-fakes closed on the evidence of pull request 96
- landing-verbs-windows-green closed on the evidence of pull request 93
- manager-tests-wait-for-the-binary minted and closed: the manager tests wait for the stopped index to let go of the binary
- the-verbs-run-in-go passed sync, split, accept and notes

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

- the failed Windows log named the test and the locked file, so the cause took one read
- the pull handed every child in order once the trivial tickets joined this group
- branch sync took the diverged remote branch in where the door refused a plain merge

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->
<!-- the form is list -->

- 19:21 UTC: branch open pushed the work branch, then tried a push of main for its marker, and left a local main commit behind
- 19:22 to 19:26 UTC: the door refused reset, merge and pull, while the pull itself named a pull with rebase as the fix
- 19:25 UTC: any working value in the plan held the pull at wait, a ticket name included, until a done cleared it
- 19:33 UTC: a helper in its own worktree could write nothing, since the door serves the main checkout and the ticket stood closed
- 19:34 UTC: a stop of the index run inside that worktree stopped the index of this session, and the door refused every call until serve ran
- 19:47 UTC: the index_ticket_pull tool answered that no hook serves it, so the hand-back went through the pull tool
- 19:48 UTC: a tests field naming go test came back refused, since the field wants the green the branch test verb answers
- the owner sent one prompt, the opening ask, and none turned the run

### improve

<!-- how each bad line stops happening, named by its home -->
<!-- the form is list -->

- branch open: a cloud box pushes its work branch alone, and skips the marker push of main
- the pull: its refusal on a diverged branch names branch sync, the verb the door lets pass
- the plan: a working value naming a ticket the pull hands out holds no wait
- the helper road: a helper that writes runs in the main checkout, or the door serves its worktree
- index_ticket_pull: the plugin answers it, or the hand-back lines name the pull tool

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The Windows failure was a race in the cleanup, not in the code under test. A re-run that passes hides a race like that, so this group kept a fix of its own rather than wait for the next red run. The two trivial tickets carried finished work, and only their closed groups kept the pull from handing them out.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- one place: each line points at a ticket, a commit or a verb, and copies no rule
- numbers: the times and job ids fix sources, and the change adds no constant
- headers: the change writes no file header
- prompts and errors: every error of the run stands under badly with its time, and the one owner prompt too
- role: the chapter names the box and the owner by role, with no path or address

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

The split follows the JavaScript core each verb file imports, read off the imports under `src/scripts/verbs`. A box takes one group in a few hours, and the order below lets several boxes work at once.

| order | group | verbs | the core it ports |
|---|---|---|---|
| first, alone | [[spec/tickets/quack-holds-a-verb-registry]] | none, the registry | `src/quack/verbs.go` |
| second, side by side | [[spec/tickets/read-verbs-run-in-go]] | index, links, lint, notes, find, log | `cli-read.js`, `log-verb.js` |
| second, side by side | [[spec/tickets/check-verbs-run-in-go]] | check, test | `check-verb.js` |
| second, side by side | [[spec/tickets/config-verbs-run-in-go]] | config, fix, project, rules, standing, doors | `cli-check.js` |
| second, side by side | [[spec/tickets/box-verbs-run-in-go]] | setup, probe, tools, doctor | `probe*.js`, the setup verb |
| second, side by side | [[spec/tickets/window-verbs-run-in-go]] | tui, serve, voice, vehicle, stub | `tui.js`, `serve.js`, `voice.js`, `vehicle*.js` |
| second, side by side | [[spec/tickets/landing-verbs-run-in-go]] | commit, push, rename | `commit-verb.js`, `push-verb.js`, `rename.js` |
| second, side by side | [[spec/tickets/work-verbs-run-in-go]] | branch, cloud | `work*.js` |
| second, side by side | [[spec/tickets/ticket-verbs-run-in-go]] | ticket, mint, graph, split | `ticket*.js`, `pull*.js`, `mint-verb.js`, `split-verb.js` |
| second, side by side | [[spec/tickets/retro-verbs-run-in-go]] | retro | `retro*.js` |
| third, once the work verbs land | [[spec/tickets/dispatch-verbs-run-in-go]] | dispatch | `dispatch*.js` |
| last | [[spec/tickets/the-node-road-closes]] | none, the road | `programOf`, `verb-run.js` |

Why each choice:

| the choice | why |
|---|---|
| the registry lands first | each verb then registers in a file of its own, so parallel branches touch no shared line of `src/quack/verbs.go` |
| the work verbs and the ticket verbs stand apart | both cores are the biggest in the tree, and one box takes neither of them whole beside the other |
| the dispatch waits on the work verbs | it reads `waitsIn`, `freeIn` and `markOff`, and two Go copies of the waits let the Action and the boxes disagree on what is free |
| the retro, the check and the mint name no edge | they take a constant or a helper from another core, and a group ports the helper it needs or reads the Go copy standing on `main` at its sync |
| a closing group | the road to node stands until every verb registers, so one group takes it out once the rest land |
| every group carries `migration.phase11` | the coordinator turns the phase on, per [[spec/design_input/the-migration-runs-in-slices#the-owner-turns-phases-on]] |

A helper two groups need lands in a Go package under `src/modules`. The second group takes the first one's package at its sync, and ports none of its own.
