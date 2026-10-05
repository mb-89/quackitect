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
    hand: box f2894f4960c9 · claude-code-remote
    hash_before: 26864ccd2807eebb8798e6346153d1e3fa86a4b7
    hash_after: 6b053f734c9fc85e5a85a0603f8d416293eb0295
  - step: sync
    hand: box e4806dfa3c6f · claude-code-remote
    hash_before: 6b053f734c9fc85e5a85a0603f8d416293eb0295
    hash_after: 150cfaee42c5d1a619a4a2e6d6e94d67878afe5a
  - step: sync
    hand: box d04971dbe062 · claude-code-remote
    hash_before: 150cfaee42c5d1a619a4a2e6d6e94d67878afe5a
    hash_after: 06e9cfd815c68953b7d09f3ece3ec0a5f17dc51f
  - step: sync
    hand: box 3ff4db8dd1e6 · claude-code-remote
    hash_before: 06e9cfd815c68953b7d09f3ece3ec0a5f17dc51f
    hash_after: 49a2b840dd9d75ceb4bc84ba131f30c94141eac9
  - step: sync
    hand: box 4c04792eb7ca · claude-code-remote
    hash_before: 49a2b840dd9d75ceb4bc84ba131f30c94141eac9
  - step: sync
    hand: box 4c04792eb7ca · claude-code-remote
    hash_before: 6e7bb16c463629b5f360c325d8cc31d1efe9baa7
    hash_after: 6e7bb16c463629b5f360c325d8cc31d1efe9baa7
    answered:
      - name: sync
        exit: 0
        said: work/ticket-verbs-run-in-go already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box 4c04792eb7ca · claude-code-remote
    hash_before: a001c5df19cf67751f53b941f2e4e51aa5bc9f17
    hash_after: a001c5df19cf67751f53b941f2e4e51aa5bc9f17
    inputs:
      - name: ask
        hash: 6456d34f61a5fe56
        size: 307
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: 3eaee7b8cc71d34a
        size: 11400
    def: cb8f90bc86fc7d39
  - step: children
    hand: the engine
    hash_before: 4c123228a71c63f67940bc66df87a67cf0329b6d
    hash_after: 4c123228a71c63f67940bc66df87a67cf0329b6d
  - step: accept
    hand: box 4c04792eb7ca · claude-code-remote
    hash_before: 87c16d92461d12eb12a00a5327d6063e36574bd9
    hash_after: 87c16d92461d12eb12a00a5327d6063e36574bd9
    answered:
      - name: sync/sync
        exit: 0
        said: work/ticket-verbs-run-in-go already carries every commit on main.
    inputs:
      - name: ask
        hash: 6456d34f61a5fe56
        size: 307
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: 3eaee7b8cc71d34a
        size: 11400
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box 4c04792eb7ca · claude-code-remote
    hash_before: 74a63997df96b2c3ff6bca58b8f9df54763b37de
    hash_after: 74a63997df96b2c3ff6bca58b8f9df54763b37de
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
  - step: retro/write
    hand: box 4c04792eb7ca · claude-code-remote
    hash_before: 64609ef519a00d36a2ea4601e7302cca9c54b6c0
    hash_after: 64609ef519a00d36a2ea4601e7302cca9c54b6c0
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

Part of phase 11 of [[spec/design_input/the-migration-runs-in-slices#the-phases]]: the verbs ticket, mint, graph and split leave Node.

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

- [[spec/tickets/ticket-verbs-port-to-go]], standard
- [[spec/tickets/ticket-sub-verb-red-cases]], trivial
- [[spec/tickets/ticket-verbs-importer-case]], trivial
- [[spec/tickets/verbs-name-frontmatter-writer]], trivial

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every child is small enough to review whole: the port lands in one commit a sub-verb, and the three trivial children each answer one gate point
- the children add up to the goal: the port carries every verb and every deletion, and the three points close the gaps its gate named
- no child waits on another past the order the pull hands them out, and every child stands closed

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

- the main merge: rules.go takes the RulesOf from main and keeps both tests, the hashed re-route stays over the twin port main carried, and the lint names its config key apart
- ticket-sub-verb-red-cases: ticket note, open, bless and the bare ticket run in Go, each red before its code
- ticket-verbs-importer-case: the importer subtest stands, and passes once the modules leave
- verbs-name-frontmatter-writer: every port writes its front through src/front, and the clear probe names its clone as the root
- ticket-verbs-port-to-go: the four verbs run in Go, and their programs and the modules only they imported leave

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

- three helpers ported the three sub-verbs side by side, each in files of its own, so no write collided
- the pull already held bless, open and the mint in Go, so each sub-verb stands as a thin shell
- a fresh reviewer read the whole diff at the gate and found no defect

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->
<!-- the form is list -->

- 05:25 the merge commit came back refused three times: graph and mint programs stood beside their Go twins, a test ran a deleted program, and a path list made git refuse a partial merge commit
- 05:35 the write door answered that level zero is starting for two of three helpers through their whole run, so two helpers came back with nothing written
- 05:40 the stop hook refused the stop reason that helpers still run six times, though four helpers ran
- 06:05 the commit check stopped the level zero server twice, and writes waited until the serve verb started it again
- 06:30 a hand-back ran the check under the pull, the probe minted its group in this tree off an inherited root, and the next hand-back committed the stray ticket

### improve

<!-- how each bad line stops happening, named by its home -->
<!-- the form is list -->

- the commit verb in src/quack/commit.go: a partial path list during a merge commits the whole index, so a merge lands through one call
- the stop hook under .claude/skills/level0/hooks: it reads the helpers the Agent tool runs before it refuses that reason
- the check in src/quack/check.go: a test that stops the index starts the server again before the check ends
- the hand-back in src/pull: a command field runs with QUACKITECT_ROOT cleared, so no child writes into the tree it judges
- a ticket for the dead JavaScript the gate named: the dispatcher half of src/scripts/ticket.js, the four ticket helper modules it alone imports and src/scripts/graph.js, with the tests that hold them

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The port itself was the small part. Most of the run went into the doors around it: the merge gate, the write door going down, the stop hook and a probe writing where it stood. Each one cost a retry, and the gate caught every real break before it reached origin. The one break that slipped through, the stray probe ticket, came from a variable no test watched.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each fact stands once: the retro names each home and repeats no rule
- no number in the change goes unnamed: the one constant each test adds carries a name
- each header says what its file is for and counts nothing
- the run had no owner prompt, since a schedule fired it, and the errors stand with their times
- the chapter names the role, and carries no name or path of the box

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
