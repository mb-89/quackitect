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
step: accept
record:
  - step: sync
    hand: box d5540c8b5530 · claude-code-remote
    hash_before: 5abbe8aab4fb3dcf29d08ef990d7d5b38be38dc1
    session: cse_013xEfuvESEjMxireLPFBTso
    hash_after: 4dc63da0d338931233fc9995be3b9251fc2d3fd7
  - step: sync
    hand: box f9a277082525 · claude-code-remote
    hash_before: 4dc63da0d338931233fc9995be3b9251fc2d3fd7
    session: cse_01VvZM1WiDGrRL4iW4UyEegN
  - step: sync
    hand: box f9a277082525 · claude-code-remote
    hash_before: 8b4daae494750e4c5036fdfa36a42170dc943e2f
    hash_after: 9bb45f463a2075f3e987af04233e62e79ae9878b
    answered:
      - name: sync
        exit: 0
        said: work/hooks-v1-hold-the-line took 166 commit(s) from main.
    def: 8a9850a81227554b
  - step: split
    hand: box f9a277082525 · claude-code-remote
    hash_before: 4467ed989ba2fc2054e49678426ede76a9c47257
    hash_after: 4467ed989ba2fc2054e49678426ede76a9c47257
    inputs:
      - name: ask
        hash: 8cf71ae9d5dce05d
        size: 453
    def: 19b6849b1f151cd5
  - step: children
    hand: the engine
    hash_before: 9ec8265d853dbb3c4c5c6130c13efdc97219de8a
    hash_after: 9ec8265d853dbb3c4c5c6130c13efdc97219de8a
---

# Ask

Every confirmed finding of the review fleet over main at bf1dad88b stands fixed with its test. A finding whose fix costs more than it buys closes with the reason. The findings reach the hook door, the index's `/v1` and legacy ports, and the command and write doors. They also reach the dispatch and the GitHub tools the settings pass. A hold answers the call it decides, whatever post lands beside it. No caller the agent drives runs a verb as a person.

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

- [[spec/tickets/brief-waits-for-a-pass]], trivial
- [[spec/tickets/calls-test-sends-secret]], trivial
- [[spec/tickets/dispatch-skips-fork-pulls]], trivial
- [[spec/tickets/door-lock-holds-commit-alone]], trivial
- [[spec/tickets/draft-names-red-tests]], trivial
- [[spec/tickets/fill-gate-stands-once]], trivial
- [[spec/tickets/first-port-client-sends-secret]], trivial
- [[spec/tickets/github-writes-leave-the-allowlist]], trivial
- [[spec/tickets/hold-verdict-borrowed-case-tested]], trivial
- [[spec/tickets/hold-verdicts-ride-the-post]], standard
- [[spec/tickets/hook-folds-read-landed-place]], trivial
- [[spec/tickets/legacy-gate-matches-draft]], trivial
- [[spec/tickets/person-drop-folds-case]], trivial
- [[spec/tickets/pkill-recovery-takes-plain-paths]], trivial
- [[spec/tickets/read-door-matches-absolute-path]], trivial
- [[spec/tickets/secret-post-serves-test]], trivial
- [[spec/tickets/shell-write-paths-clean]], trivial
- [[spec/tickets/standing-chmods-existing-file]], trivial
- [[spec/tickets/trunk-push-reads-the-refspec]], trivial
- [[spec/tickets/types-wait-for-laid-types]], trivial
- [[spec/tickets/v1-gate-reads-decoded-input]], trivial
- [[spec/tickets/v1-takes-a-run-secret]], standard
- [[spec/tickets/verdict-test-takes-landed-value]], trivial
- [[spec/tickets/version-guard-skips-git-options]], trivial
- [[spec/tickets/write-door-paths-clean]], trivial

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each child is a one-module fix with its test, or a standard design under its own review
- the children cover every confirmed finding the ask names, and the review points of the two designs
- the review points of a design land before its build, and the pull hands them first
- each review point names the design it reads, and lands before that design's build
- the group's diff stands as one review, since each child is a small fix

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

<!-- how each bad line stops happening, each line naming its home as a link, a ticket in backticks or a path in backticks -->

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

The owner named the group `hooks-and-v1-hold-the-line`. The Bash door caps a branch name at five words, so the group stands as `hooks-v1-hold-the-line`.

| what | how it stands |
|---|---|
| the branch | `./RUNME.sh branch open` pushes a marker on main, and this order leaves main unpushed. The box cut `work/hooks-v1-hold-the-line` off `origin/main` by hand, as pull requests 138 and 140 did. |
| the upstream | git set the branch to track main, and the box dropped it |
| the children | one a finding off `groups/hooks-and-v1-hold-the-line.md` on the fleet's review branch |
| the `/v1` child | carries findings 2, 5 and 6, which share one cause |
| `write-door-paths-clean` | also carries the last item of `groups/tests-and-ci-hold.md`, the same finding |
| the routes | the two highs run the standard route, and every other child the trivial one, since its fix sketch is the design |
