---
kind: [[ticket]]
state: open
step: retro/write
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
    hand: box 77f4c295c43a · claude-code-remote
    hash_before: 29658dea603ac6cbf84d805c464b7e6e53cb920a
    hash_after: 7bdbf2d2a46ef34c56f0003d31a0413154587477
  - step: sync
    hand: box e35da0f81f06 · claude-code-remote
    hash_before: 09e58639cf07b3c7d2d386e22c1b057387fbc51b
    hash_after: b34d02e763293b0826eb8af63c49251d0a325e3b
  - step: sync
    hand: box 3f5d7b2a1399 · claude-code-remote
    hash_before: ab21fcd8cf7f8bb302ed181b55e8b9bfe689fdc5
  - step: sync
    hand: box 3f5d7b2a1399 · claude-code-remote
    hash_before: 1b260eed3bd53ef40dcad5f8f46d634441ce32fb
    hash_after: bf4cb0d8d9bc03ea89e1187b0217f22b11a2bfe1
    answered:
      - name: sync
        exit: 0
        said: work/node-leaves-the-boxes already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box 3f5d7b2a1399 · claude-code-remote
    hash_before: 89b61c6ab99d7877d2fa797b6594aaedbd09dd0c
    hash_after: 89b61c6ab99d7877d2fa797b6594aaedbd09dd0c
    inputs:
      - name: ask
        hash: e6099ee6a209fa79
        size: 213
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: e122785976621597
        size: 10947
    def: cb8f90bc86fc7d39
  - step: children
    hand: the engine
    hash_before: 03d378d1f13d40b2b3b2c01f8cd5840fe5fde3c1
    hash_after: 03d378d1f13d40b2b3b2c01f8cd5840fe5fde3c1
  - step: accept
    hand: box 3f5d7b2a1399 · claude-code-remote
    hash_before: 0f2fc9f1afe78322e35b5024c25ee422dfab096b
    hash_after: 0f2fc9f1afe78322e35b5024c25ee422dfab096b
    answered:
      - name: sync/sync
        exit: 0
        said: work/node-leaves-the-boxes already carries every commit on main.
    inputs:
      - name: ask
        hash: e6099ee6a209fa79
        size: 213
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: e122785976621597
        size: 10947
    def: 07c43ae7253713ec
  - step: accept
    hand: box 3f5d7b2a1399 · claude-code-remote
    hash_before: 00aba546ad01c03eba3ffefd081fea51aaa92e0a
    hash_after: 42e69be693ce6da6755bfb9e1371ca2abf97ae94
    answered:
      - name: sync/sync
        exit: 0
        said: work/node-leaves-the-boxes took 8 commit(s) from main.
    inputs:
      - name: ask
        hash: e6099ee6a209fa79
        size: 213
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: e122785976621597
        size: 10947
    def: 07c43ae7253713ec
  - step: accept
    hand: box 3f5d7b2a1399 · claude-code-remote
    hash_before: 9c8eef5584f9e0070674d696a21ba90f62b5188b
    hash_after: 9c8eef5584f9e0070674d696a21ba90f62b5188b
    answered:
      - name: sync/sync
        exit: 0
        said: work/node-leaves-the-boxes already carries every commit on main.
    inputs:
      - name: ask
        hash: e6099ee6a209fa79
        size: 213
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: e122785976621597
        size: 10947
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box 3f5d7b2a1399 · claude-code-remote
    hash_before: 2b196dd03b36895ada01e41876424c45e94a458c
    hash_after: 2b196dd03b36895ada01e41876424c45e94a458c
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
depends_on: ["module-processes-switch-over"]
enabled_by: migration.phase10
cloud: true
---

# Ask

Phase 10 of [[spec/design_input/the-migration-runs-in-slices#the-phases]]: Node leaves the boxes. The Go prose checks become the only copy, and the webview ships prebuilt.

Done when `install.sh` installs no Node.

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

- [[spec/tickets/go-prose-checks-stand-alone]], standard
- [[spec/tickets/the-webview-ships-prebuilt]], standard
- [[spec/tickets/install-drops-node]], standard
- [[spec/tickets/install-callers-cover-the-tests]], trivial
- [[spec/tickets/cold-probe-reads-the-setup]], trivial
- [[spec/tickets/setup-verb-stands-red]], trivial
- [[spec/tickets/install-names-the-index-binary]], trivial
- [[spec/tickets/go-stamp-takes-bare-modules]], trivial
- [[spec/tickets/bare-desk-names-missing-node]], trivial
- [[spec/tickets/the-verbs-leave-node]], trivial
- [[spec/tickets/boot-fixture-drops-wink]], trivial
- [[spec/tickets/lsp-fixture-drops-node]], trivial
- [[spec/tickets/readers-tests-carry-quack]], trivial
- [[spec/tickets/tense-notes-follow]], trivial
- [[spec/tickets/widenings-stand-needed]], trivial

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each child is a single change a reviewer reads whole, and every one stands closed
- the Go prose checks, the prebuilt webview and the installer cut each have a child, so the goal stands covered
- the children ran in order on one branch, so none waits on another

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

The JavaScript check twins the write door, the bash guard, the pull and the mint import leave with this group. The write door checks a draft the index holds nowhere yet, so a `check/` name answers it nothing, and those callers stay JavaScript until Node leaves. The twins row of [[spec/design_output/migration#what-goes-with-no-successor]] lists them, and [[spec/tickets/lsp-door-switches-over]] hands them on.
