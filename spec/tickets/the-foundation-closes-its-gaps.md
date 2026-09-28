---
kind: [[ticket]]
state: open
step: children-2
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
  - name: children-2
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
    hand: box d7dcc17af0d5 · claude-code-remote
    hash_before: 9b501bdb32463601ec945da4968b82340fab3345
    hash_after: 2c2dcb72a53f4696f03cef0c390fdef938fc9db0
  - step: sync
    hand: box d7dd59fe93d6 · claude-code-remote
    hash_before: a54e633ee4a6c4f37227c1d1c3fa35cc6e1d4478
    hash_after: f28df0cf96337262c04da900e76667229e1b4784
  - step: sync
    hand: box d7dfbbf7a2d0 · claude-code-remote
    hash_before: 611b61c3321cecffe2aa2fe12a50f765b76ff1f5
    hash_after: 0883d6428047cd0112f6576a311a2029138f223f
  - step: sync
    hand: box d7e05302add7 · claude-code-remote
    hash_before: 1bf1ea1d97a1d312725b5a81f3887f1f71b0fa54
    hash_after: dda4eab1e1822ef2cf824767341d1522f4cb1c5c
  - step: sync
    hand: box d7e10c2f00cd · claude-code-remote
    hash_before: 7517168931eb6b2e989e70598da6e8806a42820f
    hash_after: 4097e42023b2f38dd1125e04feb53dec94c3c6d1
  - step: sync
    hand: box d7e1c5ea2bd1 · claude-code-remote
    hash_before: 6335859d52a0265c859a64092eb5a1a6bef48027
    hash_after: 2efabecb1ff88748f9813bfee3687dca8e57ecf2
  - step: sync
    hand: box d7e2ac6b84cc · claude-code-remote
    hash_before: 72467a84ce3bfb196565f0d1163da5dc251dfe8d
  - step: sync
    hand: box d7e2ac6b84cc · claude-code-remote
    hash_before: cbac70314783c41297a29143fcd74ba6dbd57a71
    hash_after: cbac70314783c41297a29143fcd74ba6dbd57a71
    answered:
      - name: sync
        exit: 0
        said: work/the-foundation-closes-its-gaps already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box d7e2ac6b84cc · claude-code-remote
    hash_before: 5f4e2162f2d682c4881893b0f0de0556ec0e045b
    hash_after: 5f4e2162f2d682c4881893b0f0de0556ec0e045b
    inputs:
      - name: ask
        hash: 5e9ae3babf8a6830
        size: 359
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: e122785976621597
        size: 10947
    def: cb8f90bc86fc7d39
  - step: children
    hand: the engine
    hash_before: 692cc7bc2d2a4115afa4dd7e9390b66fdf4265e6
    hash_after: 692cc7bc2d2a4115afa4dd7e9390b66fdf4265e6
  - step: accept
    hand: box d7e2ac6b84cc · claude-code-remote
    hash_before: 98dabab15c869e9bc078a07709103d9d72403b31
    hash_after: 3d1f7da6b591bf335c636f04f3857820cba70097
    returns: 1
    why: "windows-check-finds-the-quack-exe: the Windows check fails on `TestTheIndexLoadsTheManagerWithNoOtherModule`, since `src/quack/manager_test.go` builds `quack` with no `.exe`; v1-start-failure-stops-the-parts: `Serve` in `src/index/door.go` returns on a failed `servesV1` and leaves the beats, the IO modules and the scheduler running; the-contract-drives-the-door: the real side of the q suite runs through `qtest.Over`, so no case meets the door's own scheduler"
    answered:
      - name: sync/sync
        exit: 0
        said: work/the-foundation-closes-its-gaps already carries every commit on main.
depends_on: ["the-foundation-lands-unchanged"]
enabled_by: migration.phase1gaps
cloud: true
---

# Ask

Phase 1 of [[spec/design_input/the-migration-runs-in-slices#the-phases]], closing its gaps. It builds what the foundation group leaves unbuilt. It also builds what the owner's rulings ask: a dumb core, every part a module, and the contract suites.

Done when every child closes through the command it names, and `./RUNME.sh check` passes on Linux and Windows.

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

- [[spec/tickets/a-drop-refuses-another-writer]], trivial
- [[spec/tickets/action-outputs-carry-field-tags]], trivial
- [[spec/tickets/actions-answer-typed-results]], standard
- [[spec/tickets/analyzers-read-the-io-flag]], standard
- [[spec/tickets/approach-names-opens]], trivial
- [[spec/tickets/check-runs-off-the-loop]], trivial
- [[spec/tickets/commits-name-their-writer]], standard
- [[spec/tickets/config-spells-the-env-name]], trivial
- [[spec/tickets/deliver-checks-the-declared-type]], trivial
- [[spec/tickets/door-and-lease-commit-callers]], trivial
- [[spec/tickets/draft-names-the-qtest-store]], trivial
- [[spec/tickets/draft-test-list-drifts]], trivial
- [[spec/tickets/env-layer-reads-its-variables]], trivial
- [[spec/tickets/every-call-takes-a-record]], standard
- [[spec/tickets/files-seed-one-type]], trivial
- [[spec/tickets/go-checks-need-go]], standard
- [[spec/tickets/golden-carries-the-given-ask]], trivial
- [[spec/tickets/index-lease-names-a-provider]], trivial
- [[spec/tickets/index-writes-past-health]], trivial
- [[spec/tickets/io-modules-own-their-names]], standard
- [[spec/tickets/looks-reads-a-field-label]], trivial
- [[spec/tickets/manager-waits-on-tickets-module]], trivial
- [[spec/tickets/one-wave-settles-a-change]], standard
- [[spec/tickets/ops-keeps-one-state]], standard
- [[spec/tickets/ports-declare-their-looks]], standard
- [[spec/tickets/projections-read-the-mirror]], standard
- [[spec/tickets/qtest-hands-a-store]], trivial
- [[spec/tickets/qtest-holds-a-module]], standard
- [[spec/tickets/qtest-shares-a-red-package]], trivial
- [[spec/tickets/reads-resolve-in-two-passes]], standard
- [[spec/tickets/stale-names-keep-their-value]], standard
- [[spec/tickets/surfaces-read-the-output-fields]], trivial
- [[spec/tickets/the-catalog-reads-as-rows]], standard
- [[spec/tickets/the-check-refuses-undescribed-modules]], trivial
- [[spec/tickets/the-config-module-resolves-layers]], standard
- [[spec/tickets/the-index-meets-fake-modules]], standard
- [[spec/tickets/the-manager-becomes-a-module]], standard
- [[spec/tickets/the-queue-reads-the-marker]], standard
- [[spec/tickets/the-scheduler-runs-providers]], standard
- [[spec/tickets/the-watchdog-starts-for-real]], standard
- [[spec/tickets/the-wiring-file-binds-ports]], standard
- [[spec/tickets/tick-expiry-takes-a-case]], trivial
- [[spec/tickets/tickets-becomes-a-module]], standard
- [[spec/tickets/topic-test-loses-both-halves]], trivial
- [[spec/tickets/windows-ci-turns-green]], standard
- [[spec/tickets/zero-beat-refuses-the-start]], trivial

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every child closed through its own route, the standard ones through a gate, so each stood small enough to review whole
- the children cover the phase's done line: the index answers over modules, the contract suites stand beside each fake, and windows-ci-turns-green holds the Windows check, so no child is minted
- each child that waited on another names it under depends_on

# children

# children-2

# accept

<!-- reads the diff since its last verdict against the goal and every prose criterion, and names what falls short as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

reject
- windows-check-finds-the-quack-exe: the Windows check fails on `TestTheIndexLoadsTheManagerWithNoOtherModule`, since `src/quack/manager_test.go` builds `quack` with no `.exe`
- v1-start-failure-stops-the-parts: `Serve` in `src/index/door.go` returns on a failed `servesV1` and leaves the beats, the IO modules and the scheduler running
- the-contract-drives-the-door: the real side of the q suite runs through `qtest.Over`, so no case meets the door's own scheduler

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
