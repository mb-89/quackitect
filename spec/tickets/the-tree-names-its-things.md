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
        checklist: ["every fact the change adds stands in one place, and a note points at the file instead of repeating it", "every number the change adds carries a name in one place, and a copy a technical reason forces says so beside it", "every header the change writes says what its file is for, and counts nothing"]
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
urgent: true
process: [[spec/processes/group]]
process_hash: 3c35c048932fd579
step: retro/cloud
record:
  - step: sync
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: 04daa845a3e299ef70695d3bd3948778fea5ff48
  - step: sync
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: 29a31376f5a4793cd945426687310c13aaffdb10
    hash_after: 29a31376f5a4793cd945426687310c13aaffdb10
    answered:
      - name: sync
        exit: 0
        said: work/the-tree-names-its-things already carries every commit on main.
  - step: split
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: 0b2890a9db284cd1f16e32365b33fe365f0764e7
    hash_after: 0b2890a9db284cd1f16e32365b33fe365f0764e7
  - step: children
    hand: the engine
    hash_before: 4cad7c3fb37478956a53d2b935c942ad59052e17
    hash_after: 4cad7c3fb37478956a53d2b935c942ad59052e17
  - step: retro/notes
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: 0b29c87b3d8b509ec6e8ec5eb2416995b612661e
    hash_after: 0b29c87b3d8b509ec6e8ec5eb2416995b612661e
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
  - step: retro/write
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: af4a2d195ab9fbd93c1eada831bd663a30b5957d
    hash_after: af4a2d195ab9fbd93c1eada831bd663a30b5957d
---

# Ask

A name says what a thing is now. A question reaches the hand that owns it, and
an experiment ends on a decision.

The retro found names outliving their things. Claims reach the owner unchecked.
Craft questions land on the owner while the agent builds ahead of them.

Experiments run long past the question that starts them. Each ticket here
answers one of those, across the notes, the editor and the viewer.

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

- a-base-file-says-it
- a-cell-takes-an-edit
- a-claim-meets-the-view
- a-person-reads-the-split
- a-question-reaches-its-owner
- a-rename-reaches-every-note
- an-experiment-ends-decided
- apply-lane-carries-a-hand
- the-brand-names-the-plugin
- the-colours-stand-in-config
- the-controls-wire-up
- the-help-reads-the-cursor
- the-judge-reads-answer-rules
- the-tree-draws-its-columns
- the-tree-takes-a-filter
- the-viewer-draws-the-note
- the-window-grows-a-frame

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every child is small enough to review whole, or is a group itself. Each one closes on a verdict a hand read whole.
- the children add up to the goal, and nothing of the goal stands outside them. The goal's four lines each land, and one more ticket carries the folder per tab.
- a child that waits on another names it under depends_on. The colours ticket lands before the rename, and each closed in that order.

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

- a-base-file-says-it: the tree view reads its columns off the base file
- a-cell-takes-an-edit: a person edits a value inside a tree cell
- a-claim-meets-the-view: a claim of done meets the owner's own screen
- a-person-reads-the-split: the owner decides the split the pull runs by topic
- a-question-reaches-its-owner: a design question reaches the owner before the build
- a-rename-reaches-every-note: one verb carries a rename through the tree
- an-experiment-ends-decided: a trial runs a route ending on a decision
- apply-lane-carries-a-hand: the apply lane carries the hand the write door reads
- the-brand-names-the-plugin: one name stamps the vehicle, and the brand design runs
- the-colours-stand-in-config: the window's colours stand in one config file
- the-controls-wire-up: `engine.binding` reaches the pull at every setting
- the-help-reads-the-cursor: the help reads the keys the cursor stands on
- the-judge-reads-answer-rules: the judge names the rule an answer breaks
- the-tree-draws-its-columns: each tab past the log draws rows with a shape
- the-tree-takes-a-filter: a person narrows a long tree by typing
- the-viewer-draws-the-note: a note row draws under the prompt it answers
- the-window-grows-a-frame: the window holds a frame of tabs
- three notes become tracked tickets, and `./RUNME.sh retro notes` answers 0

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

- the route holds the work, because every leaf names the evidence it takes
- a review by another hand names a finding the writer reads past
- command evidence runs the verb, so a hold stands on a run
- the rename verb answers its skipped files, so no reach drops in silence
- the ticket door names the field it refuses, so a correction lands fast
- a helper hand spawns off the pull's own answer, so a `not:` step moves

### badly

<!-- what did not, each with its moment in the log or the transcript -->
<!-- the form is list -->

- the rename verb removes its target on the first single-file run, at f264223a
- `a-rename-reaches-every-note` returns most often, and `git log main..HEAD` names each
- a note under `.se/tickets` stands in no tracked file, so a pull offers nothing
- a minted ticket at `draft` waits for `ticket open`, and one round reads past it
- a `needs` row names a verb the engine runs nowhere, so a hold stands silent
- `--back` commits the working tree, so a red case reads green on the rewind
- a private note sits behind the group leaf, so the drain waits on `ticket todo`

### improve

<!-- how each bad line stops happening, named by its home -->
<!-- the form is list -->

- a single-file rename walks that file, and `test/level0/rename.test.js` holds the case
- [[spec/design_output/pull#the-checks]] says the door keys a field off the leaf
- [[spec/tickets/a-pointer-resolves]] carries the gate reading every pointer a file writes
- [[spec/tickets/the-unknown-runs-stays-quiet]] carries the warn line a stop rule owes
- [[spec/tickets/the-window-splits-by-tab]] carries the folder a tab draws from
- [[spec/design_output/pull#a-need-is-a-verb]] says a need asks, and evidence runs
- [[spec/design_output/pull#what-a-hand-out-reads]] says `ticket todo` lifts a note

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The engine teaches faster than a note does. A refused write names its rule and its line, so a round reads the rule by breaking it. The cost of the lesson is the round.

Two habits carry most of the returns here. One reads a field as closed from memory, where the door answers it on the spot. The other writes a hold as a name the engine takes for a word, so nothing runs.

The retro's route asks for a reading of the box. This box works its own group, so the reading comes off the hand that writes the hunks. A later branch owns the retro's own route.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- one place owns every fact the change adds. Each improve line points at the note owning it.
- every number carries a name in one place. The badly lines name the command answering a count.
- every header says what its file is for. The change writes the chapters this route names.

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
