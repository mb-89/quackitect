---
kind: [[ticket]]
state: open
step: retro/cloud
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
    hand: box d853f6d2d710b · claude-code-remote
    hash_before: 29658dea603ac6cbf84d805c464b7e6e53cb920a
    hash_after: ba870a43f6000346ce7dd3253dc36754ead7d89d
  - step: sync
    hand: box 5c8055bbc025 · claude-code-remote
    hash_before: ba870a43f6000346ce7dd3253dc36754ead7d89d
    hash_after: 174f34657d4d4b2d853cfa194d41ed1e4f853c98
  - step: sync
    hand: box d856596c7410d · claude-code-remote
    hash_before: 174f34657d4d4b2d853cfa194d41ed1e4f853c98
    hash_after: 6e2afbfda2ef0a3f4503e18983101c11bece3b43
  - step: sync
    hand: box d8572d2183d7 · claude-code-remote
    hash_before: 6e2afbfda2ef0a3f4503e18983101c11bece3b43
  - step: sync
    hand: box d8572d2183d7 · claude-code-remote
    hash_before: 7a3a351fa4a08395fb0955025703baa11e561c2c
    hash_after: 0a36082a110ece35fd98e98253c8563f7f4a39e6
    answered:
      - name: sync
        exit: 0
        said: work/lsp-door-lands-in-shadow took 6 commit(s) from main.
    def: 8a9850a81227554b
  - step: split
    hand: box d8572d2183d7 · claude-code-remote
    hash_before: 326edc16db340967f0df8853b412586fe63e89c1
    hash_after: 326edc16db340967f0df8853b412586fe63e89c1
    inputs:
      - name: ask
        hash: 103d386a888107c8
        size: 559
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: e122785976621597
        size: 10947
    def: cb8f90bc86fc7d39
  - step: children
    hand: the engine
    hash_before: b3ec55b1664a25e24656568d93b6051be475b086
    hash_after: b3ec55b1664a25e24656568d93b6051be475b086
  - step: accept
    hand: box d8572d2183d7 · claude-code-remote
    hash_before: 5a630a947c26f53f7e94ba805f8a928957bd3dc8
    hash_after: 5a630a947c26f53f7e94ba805f8a928957bd3dc8
    answered:
      - name: sync/sync
        exit: 0
        said: work/lsp-door-lands-in-shadow already carries every commit on main.
    inputs:
      - name: ask
        hash: 103d386a888107c8
        size: 559
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: [[spec/design_input/the-migration-runs-in-slices]]
        hash: e122785976621597
        size: 10947
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box d8572d2183d7 · claude-code-remote
    hash_before: fce84753da06b13733d48f6ecccdcc36b0092e6b
    hash_after: fce84753da06b13733d48f6ecccdcc36b0092e6b
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
  - step: retro/write
    hand: box d8572d2183d7 · claude-code-remote
    hash_before: 4d08c9cfe6016614c1563cc42607db22aaf1046c
    hash_after: 4d08c9cfe6016614c1563cc42607db22aaf1046c
    inputs:
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: retro/notes
        hash: 310d2ddd3fe31ac9
        size: 36
    def: 1246a42e29e7ae98
depends_on: ["read-topics-land-in-shadow", "quack-verbs-land-in-shadow"]
enabled_by: migration.phase7shadow
cloud: true
---

# Ask

Phase 7 of [[spec/design_input/the-migration-runs-in-slices#the-phases]], in shadow: the `lsp` IO module and the checks. The rules move into the check module, and a `buffers/` input carries unsaved editor text. The old path keeps answering, and every mismatch writes a `shadow` row to the session log. The shadow adds the key `migration/config/slices/lsp`, which the `migration` module declares as a shared key in the default file.

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

- [[spec/tickets/lsp-rules-move-to-check]] standard, closed: the rules answer in the check module and shadow rows name each finding the old sweep and the new hold apart
- [[spec/tickets/buffers-feed-the-checks]] standard, closed: the buffers input feeds the sweep
- [[spec/tickets/the-lsp-door-lands]] standard, closed: the lsp IO module, the listener and quack lsp

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each child is a reviewed ticket, closed with its own check green
- the goal holds: the migration key slices/lsp already reads shadow in the default file, the check-side shadow writes the rows log --kind shadow names, and the door replays a recorded session. I weigh a door-level compare against the old server and drop it, since the old server answers on its own port only while an editor holds it, and the rule rows already name every mismatch. I assume the owner reads mismatches in the rows, as the ask says
- no child waits on another beyond the depends_on the tickets carry

# children

# accept

<!-- reads the diff since its last verdict against the goal and every prose criterion, and names what falls short as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept
- The children add up to the goal: the rules answer in the check module with shadow rows, the buffers feed the sweep, and the lsp door answers a recorded session.
- Fixed in place: a closed buffer stands as empty text and shadowed its file in the sweep, so the sweep skips an empty buffer, with a test.

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

- the lsp IO module answers initialize and shutdown, commits buffers on open and change, publishes diagnostics, and republishes when the sweep moves
- the listener stands behind a token on loopback, and quack lsp relays stdio to it whole
- the wiring adds the lsp instance and binds the check buffers to it
- the sweep skips an empty buffer, so a closed file reads as it does on disk

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

- the recorded session and the fake index made each case a plain Go test
- the gate named the range, close, relay and sweep-decode points before the code, so the build met none of them late

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->
<!-- the form is list -->

- a write through the plain Edit tool was refused for naming no ticket, and the level zero patch tool answered where the write door needed it, at the start of the run
- a shell pipeline ending in tail masked its exit code and the landing guard refused it, twice, at the start of the run
- the review_branch tool answered that no server ran, so the accept read the diff by hand, at the accept step
- the first accept read missed that a closed buffer commits empty text, which shadowed its file in the sweep, until the accept caught it

### improve

<!-- how each bad line stops happening, named by its home -->
<!-- the form is list -->

- the work skill names the patch tool for a write and runs each gate command alone, since the guard refuses a chained landing
- the design draft for a module that drops a name lists what the reader of that name does with the empty value
- the accept reads each done_when line against the caller of the value it writes

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The design put a drop where the store offers only a commit of an empty text, so the reader of the buffers input had to treat empty as absent. I chose that over a store drop because the drop needs a catalog write the module lacks. I left a door-level compare against the old server out, and the rule rows already name each mismatch.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each fact stands once in the module, and the ticket points at it
- each constant carries a name at the top of its module
- each new file opens on a header saying what it is for
- the errors of the run stand with the step they met
- the chapter names roles alone

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
