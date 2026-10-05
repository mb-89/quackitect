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
depends_on: ["read-verbs-run-in-go", "check-verbs-run-in-go", "config-verbs-run-in-go", "box-verbs-run-in-go", "window-verbs-run-in-go", "landing-verbs-run-in-go", "work-verbs-run-in-go", "ticket-verbs-run-in-go", "retro-verbs-run-in-go", "dispatch-verbs-run-in-go"]
step: retro/cloud
record:
  - step: sync
    hand: box 89f685f4bb16 · claude-code-remote
    hash_before: e313e8630d8e24fcb6d854882a1cc35720355662
  - step: sync
    hand: box 89f685f4bb16 · claude-code-remote
    hash_before: af53a2d59c58327cf0256dcc3950dcef996d11f1
    hash_after: af53a2d59c58327cf0256dcc3950dcef996d11f1
    answered:
      - name: sync
        exit: 0
        said: work/the-node-road-closes already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box 89f685f4bb16 · claude-code-remote
    hash_before: 558de8efc14b339d246324aa9a7445b946c3a63c
    hash_after: 558de8efc14b339d246324aa9a7445b946c3a63c
    inputs:
      - name: ask
        hash: 11ff794b528ab4f6
        size: 206
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: 3eaee7b8cc71d34a
        size: 11400
    def: cb8f90bc86fc7d39
  - step: children
    hand: the engine
    hash_before: 92ccf16a53e82204d63b15045a36e91e4fd1067b
    hash_after: 92ccf16a53e82204d63b15045a36e91e4fd1067b
  - step: accept
    hand: box 89f685f4bb16 · claude-code-remote
    hash_before: 62c1e5f2d2303e2964747e4218ea0c3f11e77379
    hash_after: 62c1e5f2d2303e2964747e4218ea0c3f11e77379
    answered:
      - name: sync/sync
        exit: 0
        said: work/the-node-road-closes already carries every commit on main.
    inputs:
      - name: ask
        hash: 11ff794b528ab4f6
        size: 206
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: 3eaee7b8cc71d34a
        size: 11400
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box 89f685f4bb16 · claude-code-remote
    hash_before: c1993d756072813701235839fa7035cb5f0244e1
    hash_after: c1993d756072813701235839fa7035cb5f0244e1
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
  - step: retro/write
    hand: box 89f685f4bb16 · claude-code-remote
    hash_before: faa73260624402390cc3eca5880d1bf09118405c
    hash_after: faa73260624402390cc3eca5880d1bf09118405c
    inputs:
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: retro/notes
        hash: 310d2ddd3fe31ac9
        size: 36
    def: 1246a42e29e7ae98
  - step: retro/cloud
    hand: box 89f685f4bb16 · claude-code-remote
    hash_before: ec862deb913d2d94580ca51a58f18d717074b43e
    hash_after: ec862deb913d2d94580ca51a58f18d717074b43e
    inputs:
      - name: retro/write
        hash: c95b599120b3822d
        size: 2527
    def: 4da1ca5da87d5bbc
reason: done
---

# Ask

The close of phase 11 of [[spec/design_input/the-migration-runs-in-slices#the-phases]]: the road to node leaves quack.

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

- [[spec/tickets/program-of-drops-node]], standard
- [[spec/tickets/drops-node-size-list]], trivial
- [[spec/tickets/drops-node-tests-list]], trivial

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each child reads whole in one review, the build being one diff
- program-of-drops-node closes both done lines, and the two trivial children close its gate points
- the trivial children ride the gate of program-of-drops-node, and none waits on another

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

- program-of-drops-node: the program road and verb-run.js leave, and the verbs run in Go alone
- drops-node-size-list: the draft size list, corrected under the ticket Discussion
- drops-node-tests-list: the draft tests list, corrected under the ticket Discussion
- hook-verb-program-match: the leftover hook match, decided as dropped

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

- the registry already held every verb whole, so the road held only usage to replace
- the contract test reading verbs.go and the tree decided the done lines with no hand

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->
<!-- the form is list -->

- 12:15 a Bash call named no ticket in its description, and the door refused it
- 12:16 a raw git push met GitWritesThroughAVerb
- 12:21 the tests-red field refused twice, since go test and node --test end on no word assertion
- 12:22 the MCP ticket pull tool answered that no hook served it
- 12:23 the pull held back the spawn while any plan item stood in hand
- 12:25 a stop on helpers-still-run fell, since the box stops its helpers with the turn
- 12:40 the patch tool holds no delete op, so a shell rm removed two files
- 12:43 the moved main tripped OutsideInDoors outside the command roots
- 12:44 and 12:53 the commit hook refused code with no test staged beside it
- 12:49 a regex edit left a trailing line, and gofmt turned the check red

### improve

<!-- how each bad line stops happening, named by its home -->
<!-- the form is list -->

- spec/guidance/cloud/cloud: name branch test as the command a red or green tests field runs
- the ticket pull MCP tool in the level0 plugin: answer the call, or the pull text names the shell verb
- the pull: hand a spawn over a working plan item, or say to clear the plan
- spec/guidance/working: a cloud box waits for its helper inside the turn
- the patch tool: take a delete op, so a removal names its ticket
- spec/guidance/code/testing: a moved function takes a case beside each file it leaves and joins

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The ask read as a large removal, and most of it had landed in earlier groups. The work sat in the readers of the gone runner, and in the doors and hooks around a commit. Each refusal named its fix, so the cost was time and not direction. One leftover stands: in twins.go the person test inside the child road now always holds.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the retro states each fact once, and points at the ticket owning it
- the retro adds no number a constant owns
- the change writes one header, in cli-main.js, saying what the file is for
- the chapter carries every error of the run with its time, and the run took no owner prompt
- the chapter names roles alone, and no name, address or path of the box

## cloud

true

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->
<!-- the form is list -->

- 12:22 the MCP ticket pull tool answered no hook, so the shell verb served
- no host or right refused the box

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->
<!-- the form is list -->

- 12:16 the trunk guard on a raw git push
- 12:44 and 12:53 the commit hook asking a test beside each changed file
- 12:49 gofmt turning the check red over one trailing line
- the check ran past its time budget, and the warning named go

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->
<!-- the form is list -->

- no person step parked
- no ticket minted outside the group
- the owner-read and view steps of program-of-drops-node stood skipped by the route

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
