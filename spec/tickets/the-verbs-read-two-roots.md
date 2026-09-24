---
kind: [[ticket]]
state: closed
depends_on: [the-shim-resolves-the-vehicle]
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
    does: mints the children, or assigns standing tickets, each naming this group
    from: anyone
    by: anyone
    input: ask
    reads: [[spec/guidance/working]]
    checklist: ["every child is small enough to review whole, or is a group itself", "the children add up to the goal, and nothing of the goal stands outside them", "a child that waits on another names it under depends_on"]
    evidence:
      - name: children
        form: list
        says: every child as a link, one a line, with its process
  - name: children
    by: children
    on_fail: split
  - name: retro
    reads: [[spec/guidance/working]]
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
        evidence:
          - name: done
            form: list
            says: what was done, one line a ticket or a thing
          - name: well
            form: list
            says: what went well, and what made it go well
          - name: badly
            form: list
            says: what did not, each with its moment in the log or the transcript
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
process_hash: 484b33f9aed1254b
record:
  - step: sync
    hand: box ea4589862ac3
    hash_before: 75f601777c9ddf1b00e2b46f489160b2b36e31f9
    hash_after: e4b6acdcd842fa8c8ce8008de3543eb8ecc8ab61
  - step: sync
    hand: box 74baae5b0b11 · claude-code-remote
    hash_before: 70940a6fd73809a2e8d9f5f7ec5bd8fffde4da6a
  - step: sync
    skipped: true
    why: the box runs off the cloud
    hash_after: de6cb3030d2fe1e6b45e97db71b80027ac84b987
  - step: split
    hand: box d42624a67d18a8 · claude-code
    hash_before: 7aff05c0ab0786a967d21e2794fa2e5f747b89e4
    hash_after: 7aff05c0ab0786a967d21e2794fa2e5f747b89e4
  - step: children
    hand: the engine
    hash_before: 5231223aa4086eb08000696e99fd6c35056fccf8
    hash_after: 5231223aa4086eb08000696e99fd6c35056fccf8
  - step: retro/notes
    hand: box d42624a67d18a8 · claude-code
    hash_before: d2b90b1db6ddd416679ac850eae0e09e9b76f3c2
    hash_after: d2b90b1db6ddd416679ac850eae0e09e9b76f3c2
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
  - step: retro/write
    hand: box d42624a67d18a8 · claude-code
    hash_before: 0050996e725d5f2793aaad8f9ad8dcbf54cd45c0
    hash_after: 0050996e725d5f2793aaad8f9ad8dcbf54cd45c0
  - step: retro/cloud
    skipped: true
    why: the box runs off the cloud
    hash_after: 10e6ad436b3b79bd1131aec54945a9c7536b8717
step: retro/write
reason: done
---

# Ask

The ticket verbs, the pull and the doors read tickets and guidance off the work root, and rules off the method root. So a stub's tickets are the stub's own.

The design input [[spec/design_input/a-stub-takes-its-vehicle]] names this group, its proof and what it waits for. The design output [[spec/design_output/vehicle]] carries what stands built.

# sync

<!-- takes trunk into the branch, so the box works on the latest -->

## sync

<!-- branch sync, so the branch carries trunk -->

<!-- the form is command -->

# split

<!-- mints the children, or assigns standing tickets, each naming this group -->

## children

- [[spec/tickets/verbs-read-two-roots]], off [[spec/processes/standard]]

<!-- the form is list -->

## checked

- every child is small enough to review whole. The one child lands in a diff a reader reads whole.
- the children add up to the goal. The four done_when lines of the child carry the whole ask.
- a child that waits on another names it under depends_on. One child stands here, and it waits on none.

# children

# retro

## notes

<!-- decides every private note on the box, and works what it mints into this group -->

### drained

    ./RUNME.sh retro notes

<!-- the form is command -->

## write

<!-- writes the retro over the box's own window -->

### done

- verbs-read-two-roots: the doors carry a method root and a work root, and git runs in the work root.
- the guidance reads both roots file by file, and the work root's note wins.
- a link a field names resolves in the work root first, then in the method root.
- the projections write their targets under the work root, off the method's declaration.
- vale reads its config off the method root, so a stub takes the rules whole.

<!-- the form is list -->

### well

- one reader, inherits, answers every two-root question, so each caller reads one line.
- the roots cases drive a stub root and a method root, and each names which root answers.
- the branch leaves the verbs alone, and changes the reader under them.

<!-- the form is list -->

### badly

- the branch stands held for six hours, because the box holding it leaves with no hand-back.
- the sync reads the pushed trunk, and the desk holds two merges past it. So the resolve runs twice.
- trunk splits three files for the ceiling while this branch changes them in place.
- a hand-resolved merge drops an import each time, and a case names the missing word.

<!-- the form is list -->

### improve

- work.js must free a branch whose hold outlives the stale window, so no branch waits on a box that leaves.
- work.js sync must name the desk's trunk where it stands ahead of the pushed one.
- pull.js must hand a file's split and its edit to one branch, so no two branches own one file.
- the check answers each dropped import by name, which is the road that works here.

<!-- the form is list -->

### thoughts

The merge reads as fourteen conflicts, and it is two. One branch splits files for the ceiling, and the other edits them whole.

The resolve costs little once the deltas stand named. Reading the branch against its merge base answers what the conflict markers hide.

<!-- the form is text -->

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
