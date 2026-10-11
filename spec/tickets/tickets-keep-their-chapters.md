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
step: retro/cloud
record:
  - step: sync
    hand: box 1ad094d8843c · claude-code-remote
    hash_before: ae593fa2d17311934d06ff060af81be1119801ad
    session: cse_014h3ELHfUoTwWwQ5ViaSZix
  - step: sync
    hand: box 1ad094d8843c · claude-code-remote
    hash_before: 18e32c356c39acc9a0d9765b96e065092e550fa0
    hash_after: 7ae85faa755af1d7b1b2e7300288a1a7d711b414
    answered:
      - name: sync
        exit: 0
        said: work/tickets-keep-their-chapters took 61 commit(s) from main.
    def: 8a9850a81227554b
  - step: split
    hand: box 1ad094d8843c · claude-code-remote
    hash_before: 6811d9b167b73b3a27870a85279eff4fbb312aba
    hash_after: 6811d9b167b73b3a27870a85279eff4fbb312aba
    inputs:
      - name: ask
        hash: a550e5c350bb2f64
        size: 400
    def: 19b6849b1f151cd5
  - step: children
    hand: the engine
    hash_before: 9f1f390eb9ecdb626e4c578d0aeb0ee16c618fee
    hash_after: 9f1f390eb9ecdb626e4c578d0aeb0ee16c618fee
  - step: accept
    hand: box 1ad094d8843c · claude-code-remote
    hash_before: bfe02a5c15237abc7823cfccfe9e780bb9f7fcb2
    hash_after: bfe02a5c15237abc7823cfccfe9e780bb9f7fcb2
    answered:
      - name: sync/sync
        exit: 0
        said: work/tickets-keep-their-chapters already carries every commit on main.
    inputs:
      - name: ask
        hash: a550e5c350bb2f64
        size: 400
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box 1ad094d8843c · claude-code-remote
    hash_before: 4d462c5a89fa6cff3196df4699cf908569af2e20
    hash_after: 4d462c5a89fa6cff3196df4699cf908569af2e20
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
  - step: retro/write
    hand: box 1ad094d8843c · claude-code-remote
    hash_before: 82e7f0765461c180bf7ab1694a80e9800d20a07d
    hash_after: 82e7f0765461c180bf7ab1694a80e9800d20a07d
    inputs:
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: retro/notes
        hash: cd64de0d4d23e2c7
        size: 40
    def: e7ed0badf886b5b5
  - step: retro/cloud
    hand: box 1ad094d8843c · claude-code-remote
    hash_before: f47dac14ceee79c6dbc318ffcff6de17a6d35989
    hash_after: f47dac14ceee79c6dbc318ffcff6de17a6d35989
    inputs:
      - name: retro/write
        hash: f7f104748f7f01fb
        size: 3254
    def: 4da1ca5da87d5bbc
reason: done
---

# Ask

The ticket verbs keep what a ticket holds. route, update, fill, set and note read their routes from the method root and refuse instead of dropping chapters, and the plan, the front quoting, the red list and the config layer keep their data across a bad read or a rewrite. The retro verbs survive a failed open, a live log and a stray letter. Done when every child closes through the command it names.

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

- [[spec/tickets/ask-names-the-check-package]] trivial, closed
- [[spec/tickets/callers-name-the-reroute-test]] trivial, closed
- [[spec/tickets/collect-removes-what-it-moved]] trivial, closed
- [[spec/tickets/drop-keeps-a-broken-layer]] trivial, closed
- [[spec/tickets/flow-items-skip-escaped-quotes]] trivial, closed
- [[spec/tickets/js-number-reads-one-letter]] trivial, closed
- [[spec/tickets/misshapen-plan-values-refuse]] trivial, closed
- [[spec/tickets/note-names-stay-flat]] trivial, closed
- [[spec/tickets/one-quote-decoder-for-fronts]] trivial, closed
- [[spec/tickets/plan-keeps-its-todos]] standard, closed
- [[spec/tickets/probe-drops-its-stale-group]] trivial, closed
- [[spec/tickets/pull-reports-config-faults]] trivial, closed
- [[spec/tickets/quoted-fronts-round-trip]] standard, closed
- [[spec/tickets/red-list-skips-failed-records]] trivial, closed
- [[spec/tickets/retro-chapters-take-git-door]] trivial, closed
- [[spec/tickets/retro-json-readers-merge]] trivial, closed
- [[spec/tickets/retro-mint-cleans-its-draft]] trivial, closed
- [[spec/tickets/route-keeps-its-chapters]] standard, closed
- [[spec/tickets/route-refuses-without-a-schema]] trivial, closed
- [[spec/tickets/ticket-verbs-read-method-routes]] standard, closed
- [[spec/tickets/update-case-splits-repos]] trivial, closed
- [[spec/tickets/update-keeps-chapters-under-vehicle]] trivial, closed
- [[spec/tickets/vehicle-case-seeds-chapter-text]] trivial, closed
- [[spec/tickets/yaml-readers-past-the-front]] trivial, closed

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each child is one fix a review reads whole
- the children cover each reader the ask names: the verbs, the plan, the front quoting, the red list, the config layer and the retro verbs, and the gate points minted their own children
- no child waits on another past update-keeps-chapters-under-vehicle, which closed answered by ticket-verbs-read-method-routes
- route-keeps-its-chapters landed methodDisk before ticket-verbs-read-method-routes read it
- the diff stands one review, so no child splits into a group

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

- the trivial children close: note names stay flat, the pull reports a broken config, the red list skips failed records, retro chapters take the run door, the retro JSON and front readers merge, retro mint cleans its draft
- the standard children close through their gates: plan-keeps-its-todos, quoted-fronts-round-trip, route-keeps-its-chapters, ticket-verbs-read-method-routes
- each gate point closes as a child of this group, from misshapen-plan-values-refuse to update-case-splits-repos
- probe-drops-its-stale-group stops the cold probe failing on a group branch a former probe pushed
- src/quack folds the tests that ran one behaviour twice, so its test lines stand under its code lines with main taken in twice

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

- a red case before each fix caught the real fault each time, among them the vehicle route dropping every chapter
- helpers took each gate, and their points named real gaps: one decoder, the flow split, the seeded chapter text, the repo the update case reads
- a read-only survey helper found the folds the ratio needed, and a second helper applied them while the plan code went on beside it

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->
<!-- the form is list -->

- the commit verb refused twice on pull-origin-diverges, since a stray group branch from the cold probe stood in the repository it clones
- the ratio guard refused the chapters commit, and the folded reader merge pushed src/quack past its ratio again after the first sync
- a gate helper pulled a ticket by name and met pull-queue-binds, then met a refused hand-back since this box held uncommitted code in the tree
- a pkill matching its own shell line killed a running commit verb twice
- an edit to the route ask marked its draft stale, so its design ran a second round
- the level0 tool server stood offline the whole run, so every helper prompt named calls the helper could not make

### improve

<!-- how each bad line stops happening, each line naming its home as a link, a ticket in backticks or a path in backticks -->
<!-- the form is list -->

- the probe drops the stale branch before it mints: `probe-drops-its-stale-group`
- a fix deleting code counts the ratio before its commit, with the counter `src/imports/ratio.go` holds, and the survey road stands in `spec/guidance/code/tests.md`
- a box commits or stashes its work before it spawns a helper, and a helper pulls with no name, as `src/pull/pull_branch.go` prompts it
- a script waits on a log line it writes, and kills no process by pattern: `spec/guidance/cloud/cloud.md`
- a gate point on an ask lands in the discussion, which marks no draft stale: `spec/design_output/pull.md`
- the spawn prompt names the ./RUNME.sh call beside the tool call, so a helper works where the tool server stands offline: `src/pull/pull_branch.go`

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The children each touched one reader, but the ratio guard tied them into one budget for src/quack: each fix that deleted code took test room from the next. Taking main in twice made it worse, since main itself stood at the ratio. The gates were worth their cost: four of their points named a gap the red tests let through.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each fact of the retro points at its file or ticket
- the retro adds no number past the ones the verbs print
- the retro writes no header
- the errors stand with their order in the run, the owner sent no prompt past the routine
- the retro names the role and carries no name, address or path of the box

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->
<!-- the form is list -->

- the level0 tool server stood offline from the first take to the end, so the box called each verb through ./RUNME.sh

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->
<!-- the form is list -->

- the cold probe failed on pull-origin-diverges where a stray probe branch stood, until probe-drops-its-stale-group landed
- an add and add conflict at the first sync, in src/quack/check_types_test.go, taken as main writes it
- the ratio guard on src/quack, at the chapters commit and after the first sync
- the commit door asking for a staged test beside each code file, at the quote and the route commits
- a gofmt finding on a one-line function literal in a probe case

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->
<!-- the form is list -->

- no person step stands parked, and the owner-read steps the box skipped as a cloud box decides them
- no ticket stands minted with no group
- the box writes no handover past this retro, and the pull request carries the branch to main

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

The box cut `work/tickets-keep-their-chapters` off `origin/main` by hand, as the branches of #138 and #140 were, so `branch open` pushes nothing to `main`. The findings come off the review fleet's list on its review branch, under `groups/tickets-keep-their-chapters.md`, one child a finding.
