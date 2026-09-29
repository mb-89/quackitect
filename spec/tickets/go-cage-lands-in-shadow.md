---
kind: [[ticket]]
state: open
step: accept
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
record:
  - step: sync
    hand: box d8535e12fc10e · claude-code-remote
    hash_before: 29658dea603ac6cbf84d805c464b7e6e53cb920a
    hash_after: 20327769b75ec99c5ee0a413a2a51f08089ad0fa
  - step: sync
    hand: box d85490c97110e · claude-code-remote
    hash_before: 20327769b75ec99c5ee0a413a2a51f08089ad0fa
    hash_after: bdba06cfdd68b2bf7da535935e0a1e1b9a46de25
  - step: sync
    hand: box d855c2347910b · claude-code-remote
    hash_before: bdba06cfdd68b2bf7da535935e0a1e1b9a46de25
  - step: sync
    hand: box d855c2347910b · claude-code-remote
    hash_before: 2997f9106d1820eaa8534ade2e786cf5f698cfde
    hash_after: 2997f9106d1820eaa8534ade2e786cf5f698cfde
    answered:
      - name: sync
        exit: 0
        said: work/go-cage-lands-in-shadow already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box d855c2347910b · claude-code-remote
    hash_before: 544a8f3bd5f402673a88a08c93c3201488a72d31
    hash_after: 544a8f3bd5f402673a88a08c93c3201488a72d31
    inputs:
      - name: ask
        hash: 2570a20dc71168fd
        size: 568
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: e122785976621597
        size: 10947
    def: cb8f90bc86fc7d39
  - step: children
    hand: the engine
    hash_before: 23771a1a8dd8d40c5901cbc32b91eef23c5c5b80
    hash_after: 23771a1a8dd8d40c5901cbc32b91eef23c5c5b80
depends_on: ["quack-verbs-land-in-shadow"]
enabled_by: migration.phase5shadow
cloud: true
---

# Ask

Phase 5 of [[spec/design_input/the-migration-runs-in-slices#the-phases]], in shadow: the cage. The `hooks` IO module, the fold modules over `session/`, the rules ported one at a time, and Copilot on the same IO module. The old path keeps answering, and every mismatch writes a `shadow` row to the session log. The shadow adds the key `migration/config/slices/cage`, which the `migration` module declares as a shared key in the default file.

Done when the new path runs in shadow on `main`, and `./RUNME.sh log --kind shadow` names each mismatch for the owner to read.

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

- [[spec/tickets/cage-hold-lacks-door-effect]], trivial
- [[spec/tickets/cage-rules-replay-session-logs]], standard
- [[spec/tickets/cage-slice-past-the-ask]], trivial
- [[spec/tickets/cage-tool-block-reads-refuse]], trivial
- [[spec/tickets/copilot-config-names-mcp]], trivial
- [[spec/tickets/copilot-meets-the-hooks-door]], standard
- [[spec/tickets/copilot-shadow-carries-method]], trivial
- [[spec/tickets/hooked-of-caller-missed]], trivial
- [[spec/tickets/hooks-at-reads-clock-module]], trivial
- [[spec/tickets/hooks-draft-matches-red-tests]], trivial
- [[spec/tickets/hooks-listen-case-fails-assertion]], trivial
- [[spec/tickets/hooks-listener-joins-io-process]], trivial
- [[spec/tickets/hooks-standing-file-names-token]], trivial
- [[spec/tickets/hooks-wait-leaves-tool-input]], trivial
- [[spec/tickets/the-hooks-door-lands]], standard
- [[spec/tickets/the-mcp-module-lands]], standard
- [[spec/tickets/tool-surface-moves-into-q]], trivial

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every child is one door, one module or a one-line fix, small enough to review whole
- the hooks door with its folds, the rules replay, the mcp module and Copilot cover the ask, and the migration module declares the cage key
- copilot-meets-the-hooks-door names the hooks door and the mcp module under depends_on

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
