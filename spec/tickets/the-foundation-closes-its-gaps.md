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
  - step: children-2
    hand: the engine
    hash_before: d80b7ae1a0ef1465f25559d6ed4dd9ef81216c29
    hash_after: d80b7ae1a0ef1465f25559d6ed4dd9ef81216c29
  - step: accept
    hand: box d7e2ac6b84cc · claude-code-remote
    hash_before: f1cffe8b3384cf782f38d6da5cd811b4a0d8119d
    hash_after: f1cffe8b3384cf782f38d6da5cd811b4a0d8119d
    answered:
      - name: sync/sync
        exit: 0
        said: work/the-foundation-closes-its-gaps already carries every commit on main.
    inputs:
      - name: ask
        hash: 5e9ae3babf8a6830
        size: 359
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: e122785976621597
        size: 10947
    def: 07c43ae7253713ec
  - step: accept
    hand: box d7e2ac6b84cc · claude-code-remote
    hash_before: 72b4ecd447b1a51b86098115de1b34603693beea
    hash_after: 72b4ecd447b1a51b86098115de1b34603693beea
    answered:
      - name: sync/sync
        exit: 0
        said: work/the-foundation-closes-its-gaps already carries every commit on main.
    inputs:
      - name: ask
        hash: 5e9ae3babf8a6830
        size: 359
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: e122785976621597
        size: 10947
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box d7e2ac6b84cc · claude-code-remote
    hash_before: 7146caa93718fdbb71dc4379391062a725db3d6a
    hash_after: 7146caa93718fdbb71dc4379391062a725db3d6a
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
  - step: retro/write
    hand: box d7e2ac6b84cc · claude-code-remote
    hash_before: ebbd58edd040bf680266c244b75ee9df7968cd83
    hash_after: ebbd58edd040bf680266c244b75ee9df7968cd83
    inputs:
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: retro/notes
        hash: cd64de0d4d23e2c7
        size: 40
    def: 1246a42e29e7ae98
  - step: retro/cloud
    hand: box d7e2ac6b84cc · claude-code-remote
    hash_before: f1e921a2a7cebc11b684914d8b39a3f216c3e864
    hash_after: f1e921a2a7cebc11b684914d8b39a3f216c3e864
    inputs:
      - name: retro/write
        hash: f8095093525e4886
        size: 2723
    def: 4da1ca5da87d5bbc
  - step: children
    hand: the engine
    hash_before: 7c3140eab24e7d1cab9e5a6c7a0c420b1f974e72
    hash_after: 7c3140eab24e7d1cab9e5a6c7a0c420b1f974e72
  - step: children-2
    hand: the engine
    hash_before: 7c3140eab24e7d1cab9e5a6c7a0c420b1f974e72
    hash_after: 7c3140eab24e7d1cab9e5a6c7a0c420b1f974e72
  - step: accept
    hand: box d7e2ac6b84cc · claude-code-remote
    hash_before: 2b8ba7b74fedf7b33aab2e5ce0ae1fb68ff88704
    hash_after: 91340ae8c3d144e8e1e66e30e348da11eada631c
    answered:
      - name: sync/sync
        exit: 0
        said: work/the-foundation-closes-its-gaps already carries every commit on main.
    inputs:
      - name: ask
        hash: 5e9ae3babf8a6830
        size: 359
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: e122785976621597
        size: 10947
    def: 07c43ae7253713ec
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

- the-config-module-resolves-layers: each key resolves off override, context, environment, local file and default file
- config-spells-the-env-name: the config module names a key's variable
- env-layer-reads-its-variables: folded into the resolver's change
- the-index-meets-fake-modules: the fake module drives the index's own cases
- failed-start-stops-its-parts: a failed door start stops every part it reached
- windows-builds-quack-exe: the manager case finds its binary on Windows, and CI stands green on both
- the model note's run of requests reads as a list, which cleared the push
- every private note decided, each successor under its group

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

- helpers built the two cross-module changes while the main hand verified vet, tests and the diff
- a red case written first caught the missing seam before the door change
- the accept review read Windows CI, which the Linux check alone missed

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->
<!-- the form is list -->

- 03:19: the gate minted children with a todo tag, and the push refused them until a manual tag removal
- 04:26: the reject at accept inserted children-2, which passed empty, and a second reject copied nothing
- 04:40: a helper spawned with a working item in the plan met a wait, which the handover had warned of
- 04:42: a named pull as a helper hand met the session's binding, and the child stayed out of reach
- 03:48: the first implement hand-back named no test in its lint field, and the commit hook refused it
- 04:25: a closed ticket's run of paragraphs in the model note held the push at warning
- no owner prompt reached the session

### improve

<!-- how each bad line stops happening, named by its home -->
<!-- the form is list -->

- the tag and the empty reject: spec/tickets/gate-findings-reach-the-queue
- the lint field naming no test: spec/tickets/command-fields-take-their-indent carries the indent, and a hand names the red-listed tests in the lint command
- the spawn with a working item: the handover keeps the rule, and the plan clears its item before each spawn
- the binding past a named pull: accept with points routes fix children, so a hand works them through the plain pull
- the model note warning: a design note edit runs the lint on it before the hand-back

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The engine's gate paths assume a reviewer mints fixes through the verdict form. Minting by hand fights the queue at each turn: the tag, the binding and the empty children leaf. The verdict form with points is the road, and the reject form belongs to a group whose children leaf still holds open work.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each successor ticket holds its fact, and the retro points at it
- the retro adds no number past the commit times
- the retro writes no file header
- the errors carry their commit times, and no owner prompt reached the session
- the retro names roles alone

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->
<!-- the form is list -->

- nothing: every tool the route asked for stood on the box, and the GitHub tools read the Windows CI run

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->
<!-- the form is list -->

- the commit hook refused an implement hand-back whose lint field named no test
- the push door refused a todo tag on children the gate minted, twice
- the push waited on a warning in the model note
- the landing rule refused a pull chained after another command
- no conflict at sync, and no test failed on this box alone

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->
<!-- the form is list -->

- driven-trees-load-the-tickets waits on the owner's answer at its person step
- the successors under this group leave it at branch done: projection-cases-drive-their-verbs, the-manager-declares-its-spans, the-q-suite-drives-the-door
- no ticket stands minted with no group
- the handover names the group done and the successors waiting

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

- Two successors the retro names took shorter names, since a ticket name holds five words: `a-replayed-red-leaf-reads-green` stands as [[spec/tickets/replayed-red-leaf-reads-green]], and `the-q-suite-drives-the-door` as [[spec/tickets/q-suite-drives-the-door]].
