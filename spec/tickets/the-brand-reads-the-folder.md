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
step: retro/write
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

- the group passes sync, and the branch carries trunk
- the split assigns [[spec/tickets/brand-reads-folder]] and mints no child
- the child passes design/draft twice, and a hand of its own fails design/review twice
- the child stands at design/person-1, where a person rules on the plugin name
- the ask of the child and the group ticket meet the rules, which the write door refused before
- the retro decides every private note, and mints two tickets in no group

### well

<!-- what went well, and what made it go well -->

<!-- the form is list -->

- a hand of its own reads harder than the hand that drafts. It catches the plugin name, the lock file and the raw folder name
- the pull inserts a person step at the second return, so the box hands the design to a person
- the `--fields` road lands a field the write door refuses, so a leaf closes anyway
- the sketch runs the branded manifest against the tracked one, so the implement starts from a shape that answers

### badly

<!-- what did not, each with its moment in the log or the transcript -->

<!-- the form is list -->

- the box commits while a hand holds a verdict leaf, so the hand-back refuses and one review runs twice
- the write door lints the whole file, so findings standing in the ask since the mint refuse every write
- the choice field takes the word the tense rule refuses, so the hand-back reads a right answer as wrong
- the check stops at the server probe, so the rules over the tree stay unread until the server starts
- trunk answers findings at error, so `branch done` refuses this branch

### improve

<!-- how each bad line stops happening, named by its home -->

<!-- the form is list -->

- [[spec/design_output/pull]] says at the hand-out that a commit under a verdict leaf voids the hand-back
- [[spec/design_output/level0]] reads the lines a write touches, and leaves the rest of the file to the lint verb
- [[spec/processes/note]] carries outcome words the voice rules admit, or the tense rule takes those three as exceptions
- [[spec/tickets/the-check-starts-the-server]] carries the probe
- [[spec/tickets/the-tense-rule-reads-present]] carries the findings on trunk

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->

<!-- the form is text -->

Each door in this tree reads right on its own, and three of them meet a hand
with no move the doors admit:

- the write door refuses a file the mint writes
- the choice field asks for a word the tense rule refuses
- the battery asks for a green check that trunk denies

A hand meeting one of these reads it as its own error, and looks for a smaller
write. The `--fields` road answers two of the three, and no rule names it. That
road belongs in the guidance.

The group of one child gives its session to design alone, and no code moves. The
review earns that, because each pass finds real holes.

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
