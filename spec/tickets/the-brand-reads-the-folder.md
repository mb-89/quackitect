---
kind: [[ticket]]
state: open
urgency: whenever
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
    hand: box 02ae9414623e
    hash_before: c127f4766c77dbc293182e6abb41581329448a01
  - step: sync
    hand: box 02ae9414623e
    hash_before: 7107ec3bb1f4d214cd685cd10803525932bd5e83
    hash_after: 7107ec3bb1f4d214cd685cd10803525932bd5e83
    answered:
      - name: sync
        exit: 0
        said: work/the-brand-reads-the-folder already carries every commit on main.
  - step: split
    hand: box 02ae9414623e
    hash_before: 8dcd4ae534815f24881f95895f4eea117620a1f7
    hash_after: 8dcd4ae534815f24881f95895f4eea117620a1f7
  - step: children
    hand: box 02ae9414623e
    skipped: true
    why: the box leaves it while brand-reads-folder stand open
  - step: retro/notes
    hand: box 02ae9414623e
    hash_before: f23aaa66d1314e6038b873c728bc041ac3f70a4c
    hash_after: f23aaa66d1314e6038b873c728bc041ac3f70a4c
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
  - step: retro/write
    hand: box 02ae9414623e
    hash_before: 90a72bdde5e25cfb3bfbdff21c00fba56bcd4ee2
    hash_after: 90a72bdde5e25cfb3bfbdff21c00fba56bcd4ee2
  - step: retro/cloud
    hand: box 02ae9414623e
    hash_before: 01d24a72655a023b8ddafa7a6cc8c223e57ab7cf
    hash_after: 12801a199b5952148bd274dff448b4cd07a13189
  - step: children
    hand: box ee33ce836a4d
    hash_before: 9c4670bd162fa56f32d4e253b2e09ead376e4317
    hash_after: 04efd43b43d64bac49c536765e630a8738a3201e
  - step: children
    hand: box 3d4c068755ec · claude-code-remote
    hash_before: 0cbc9012b1badfdb62f285c323039f01a2791257
  - step: children
    hand: the engine
    hash_before: cd532835dcb450bf74c3b1c39e6025c579ea6c3b
    hash_after: cd532835dcb450bf74c3b1c39e6025c579ea6c3b
  - step: retro/notes
    hand: box 3d4c068755ec
    hash_before: 1f989077fc9448a678624b41b6fa513cda6d6563
    hash_after: 1f989077fc9448a678624b41b6fa513cda6d6563
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
  - step: retro/write
    hand: box 3d4c068755ec
    hash_before: 3978bac00813947ec95a84d7833a367920371e4d
    hash_after: 3978bac00813947ec95a84d7833a367920371e4d
step: retro/cloud
---

# Ask

The extension id, the view id, the display name and the icon read the folder name. So a vehicle and this tree stand side by side in the editor.

The design input [[spec/design_input/a-stub-takes-its-vehicle]] names this group, its proof and what it waits for. The funnel [[spec/funnel/a-button-makes-a-vehicle]] carries the owner's ask.

# sync

<!-- takes trunk into the branch, so the box works on the latest -->

## sync

<!-- branch sync, so the branch carries trunk -->

<!-- the form is command -->

    ./RUNME.sh branch sync

# split

<!-- mints the children, or assigns standing tickets, each naming this group -->

## children

<!-- every child as a link, one a line, with its process -->

<!-- the form is list -->

- [[spec/tickets/brand-reads-folder]], on [[spec/processes/standard]], which carries the whole ask

## checked

- small enough to review whole: the child touches the manifest, the keys the extension reads and the link verb. A reviewer reads that in one pass.
- the children add up to the goal: the child's ask names the link, the icon and the editor test. It names every place writing the name in. It is this group's ask whole.
- a child waiting on another names it under depends_on: the group holds one child, and it stands free.

# children

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

- the branch takes trunk in, over a history that marks 27 files as conflicts
- the check answers 0 on the merge, with every finding at warning
- [[spec/tickets/brand-reads-folder]] closes became [[spec/tickets/the-brand-names-the-plugin]]
- the successor stands outside the group, carrying the question the person step asks
- [[spec/tickets/the-take-skips-an-orphan]] stands in no group, on a branch no sync reaches
- the group runs on to its retro, because no open child stands in it

### well

<!-- what went well, and what made it go well -->

<!-- the form is list -->

- the merge reads each side against the true base, so a side standing still takes the other whole
- trunk renames the free-stop rule, and the branch's own clause rides the new name
- the unblock verb writes the question into the successor, so the box copies nothing by hand
- the pull refuses a wrong shape by naming it, so the fix costs one line

### badly

<!-- what did not, each with its moment in the log or the transcript -->

<!-- the form is list -->

- the box proposes to leave the person step standing, and the owner names the road the guidance holds
- the check stops at the server probe, so the rules over the tree stay unread until the serve verb runs
- the box writes three lines under a command evidence, and the hand-back refuses two of them
- the take hands out a branch sharing no ancestor with trunk, and the sync dies on it

### improve

<!-- how each bad line stops happening, named by its home -->

<!-- the form is list -->

- [[spec/guidance/cloud]] holds the person step rule, and a box reads the guidance before it plans a branch
- [[spec/tickets/the-check-starts-the-server]] carries the probe
- [[spec/design_output/work]] says a command evidence holds its one line, where the person step leaves
- [[spec/tickets/the-take-skips-an-orphan]] carries the branch sharing no ancestor with trunk

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->

<!-- the form is text -->

The merge is the whole job the take names, and it is smaller than it looks. Two
merge bases mark a file as a conflict where one side stands still. So the
resolution reads three things:

- the true base of each file, which answers most of the set
- the side that moves, which takes the file whole
- the few real overlaps, which are worth a hand

The person step is the piece this box got wrong on its own. A blocked step reads
as a wall, and the tree holds a door beside it. The step leaves on a ticket of
its own, and everything behind it runs.

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->

<!-- the form is list -->

- the box starts no server, so the check stops at its health probe until the serve verb runs
- the install answers every tool it names, and the proxy carries every host this session reaches

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->

<!-- the form is list -->

- the write door refuses a shell write, and names the read tool then the edit tool
- the write door refuses a commit message past the sentence rule and the tense rule
- the write door refuses every write to the child ticket, until its ask meets the rules
- the verdict guard refuses a hand-back, because the box commits under the hold
- the cap inserts design/person-1 at the second return on one leaf
- the battery reads red, because trunk answers findings at error

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->

<!-- the form is list -->

- [[spec/tickets/brand-reads-folder]] stands at design/person-1, where a person rules on the plugin name
- [[spec/tickets/the-tense-rule-reads-present]] stands in no group, and it holds this branch
- [[spec/tickets/the-check-starts-the-server]] stands in no group
- this ticket is the handover, because a group branch carries its retro here

# Discussion

The group holds one child, and the design input names it as one branch. So the
split assigns the standing ticket and mints nothing.

A correction to the retro, which stands above and belongs to the engine. Two
lines there say that trunk answers findings at error, and that the battery reads
red for it. Both are wrong, and these lines carry what is true:

- the check answers green on this branch, with every finding at warning
- the check names the tense rule nowhere, in this run or the one before it
- the ask of this ticket and of its child held the findings that made it red
- fixing those two asks greens the check

The box reached that wrong reading by running Vale by hand over the tree, past
the scoping the rules verb applies. The verb answers `The rules pass` on every
file the hand-run named. A reading off a tool the tree wraps carries less than
the verb, and the verb decides.

So [[spec/tickets/the-check-starts-the-server]] stays, because the probe stopped
the check on this box for real. The ticket minted for the tense rule goes, since
its ask rests on the wrong reading.
