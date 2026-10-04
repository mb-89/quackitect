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
depends_on: ["quack-holds-a-verb-registry"]
step: retro/cloud
record:
  - step: sync
    hand: box a2b0848f196c · claude-code-remote
    hash_before: c2b782cccbfd3c97f057aaf5e03d343832a37e98
    hash_after: 25594ccb0d41b262840c17d4a0cb89e35d5896e0
  - step: sync
    hand: box 7e5eda79bc84 · claude-code-remote
    hash_before: 25594ccb0d41b262840c17d4a0cb89e35d5896e0
    hash_after: 952a236bc14c035f136ac667f12c1fec77f31dc1
  - step: sync
    hand: box 7e5eda79bc84 · claude-code-remote
    hash_before: 0d2cc96bd66f210047d1399fa11a25d025e7a9d8
    hash_after: 0d2cc96bd66f210047d1399fa11a25d025e7a9d8
    answered:
      - name: sync
        exit: 0
        said: work/landing-verbs-run-in-go already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box 7e5eda79bc84 · claude-code-remote
    hash_before: e9a11170f00ed551033f976fce0adf1af7ddb7d8
    hash_after: e9a11170f00ed551033f976fce0adf1af7ddb7d8
    inputs:
      - name: ask
        hash: 46fa0bd6fad47957
        size: 301
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: 3eaee7b8cc71d34a
        size: 11400
    def: cb8f90bc86fc7d39
  - step: children
    hand: the engine
    hash_before: 93b4d9c39cbaa6eb523c2624c3fc0f6106772b18
    hash_after: 93b4d9c39cbaa6eb523c2624c3fc0f6106772b18
  - step: accept
    hand: box 7e5eda79bc84 · claude-code-remote
    hash_before: a44e6ad5fb725e0e940e20d1cb111deb789e1997
    hash_after: a44e6ad5fb725e0e940e20d1cb111deb789e1997
    answered:
      - name: sync/sync
        exit: 0
        said: work/landing-verbs-run-in-go already carries every commit on main.
    inputs:
      - name: ask
        hash: 46fa0bd6fad47957
        size: 301
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: 3eaee7b8cc71d34a
        size: 11400
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box 7e5eda79bc84 · claude-code-remote
    hash_before: aa7caa36a4c000d2d63cfee7143fa3ded707b24a
    hash_after: aa7caa36a4c000d2d63cfee7143fa3ded707b24a
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
  - step: retro/write
    hand: box 7e5eda79bc84 · claude-code-remote
    hash_before: c6dcba970f5c6e8c475aaa1bd9ba500d7695faa2
    hash_after: c6dcba970f5c6e8c475aaa1bd9ba500d7695faa2
    inputs:
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: retro/notes
        hash: 310d2ddd3fe31ac9
        size: 36
    def: 1246a42e29e7ae98
  - step: retro/cloud
    hand: box 7e5eda79bc84 · claude-code-remote
    hash_before: c1018e156f7b5fd95552e05a18dcf1bf186d4d06
    hash_after: c1018e156f7b5fd95552e05a18dcf1bf186d4d06
    inputs:
      - name: retro/write
        hash: a50c4c68cf18bbdd
        size: 1750
    def: 4da1ca5da87d5bbc
reason: done
---

# Ask

Part of phase 11 of [[spec/design_input/the-migration-runs-in-slices#the-phases]]: the verbs commit, push and rename leave Node.

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

- [[spec/tickets/landing-verbs-port-to-go]], standard, closed

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the one child is a reviewable change of three Go files, their tests and the JavaScript they replace
- the child's done lines are the group's ask: the Go verbs, their tests, the deleted programs and their importers; an orphan search of src names no module the three verbs left behind, only verb programs loaded by name and webview files other groups own
- one child, so no depends_on

# children

# accept

<!-- reads the diff since its last verdict against the goal and every prose criterion, and names what falls short as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept
- commit, push and rename register in Go under src/quack, and go test over src/quack and src/modules passes
- their programs, modules and tests leave, and a search of src and test names no importer
- the check exits 0 on HEAD, and the three cases the review run failed pass alone three times
- the retro stands

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

- landing-verbs-port-to-go: closed by the earlier box, with commit, push and rename in Go and their JavaScript gone
- this box took the branch over at sync, passed sync, split and accept, and drained the notes
- an orphan search of src names no module the three verbs left behind

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

- the earlier box closed the whole child, so this box had a review alone to do
- the done lines of the child match the group's ask, so the accept reads one list

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->
<!-- the form is list -->

- 15:05: a Bash call with no ticket in its description met a refusal, and the next call named the ticket
- 15:20: the check inside branch review failed three cases, a timing budget and two Vale cases. The same cases passed alone three times, and the full check exits 0
- 15:20: a pipe through tail hid the exit of the check, and a second run read it alone

### improve

<!-- how each bad line stops happening, named by its home -->
<!-- the form is list -->

- the hook's refusal text names the shape, so the description names its ticket from the first call, owned by the write door
- the flaky budget case asks a ticket of its own, owned by test/level0/budget.test.js, where the check runs under load
- the exit rides out of a pipe through pipefail, owned by the agent's own habit

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The branch reached this box with the work done and the gate open. The one judgement was whether the three red cases in the review run belonged to this branch. They touch no file of the diff and pass alone, so the box judged them load on a shared box.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the retro adds no fact the tree states elsewhere, and points at the child ticket for the work
- the retro adds no number
- the retro writes no file header
- the chapter carries each error with its time, and no owner prompt reached this run
- the chapter names roles alone, and no path of the box

## cloud

true

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->
<!-- the form is list -->

- nothing: every tool the branch asked for stood installed, and no host or right met a refusal

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->
<!-- the form is list -->

- a hook refused a Bash call whose description named no ticket, at the first read
- the check inside branch review failed three cases that pass alone, a timing budget and two Vale cases

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->
<!-- the form is list -->

- no person step parked, and no ticket minted
- the pull request from work/landing-verbs-run-in-go against main carries the merge, with auto-merge on

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
