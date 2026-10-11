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
step: retro/write
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

The box cut `work/tickets-keep-their-chapters` off `origin/main` by hand, as the branches of #138 and #140 were, so `branch open` pushes nothing to `main`. The findings come off the review fleet's list on its review branch, under `groups/tickets-keep-their-chapters.md`, one child a finding.
