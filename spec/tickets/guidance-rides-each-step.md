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
process: [[spec/processes/group]]
process_hash: 94d924fb96257431
depends_on: [the-engine-holds-the-route]
step: retro/cloud
record:
  - step: sync
    hand: box d7d8cca5d3cd · claude-code-remote
    hash_before: 0c7092033b9aea4d01399c8cb050aeb2f4f4b126
    hash_after: 9860d9c280f63ede982819914e00518c107a16b3
  - step: sync
    hand: box d7d9cc78d3ce · claude-code-remote
    hash_before: efcb4bfc6270ca01ac2cea3afba6f4868d5dd8e2
  - step: sync
    hand: box d7d9cc78d3ce · claude-code-remote
    hash_before: 42ed19a6ae2bedf2ffb80f7d6aa5b3161ff8e9b5
    hash_after: c3ceb39c5e0fe171917fda55ce070925d70e83f4
    answered:
      - name: sync
        exit: 0
        said: work/guidance-rides-each-step already carries every commit on main.
  - step: split
    hand: box d7d9cc78d3ce · claude-code-remote
    hash_before: e64a605e9bc71b5199418425140b5b3ace942f22
    hash_after: e64a605e9bc71b5199418425140b5b3ace942f22
  - step: children
    hand: the engine
    hash_before: a3748922cf6104dd78626ca035f739135bc5791a
    hash_after: a3748922cf6104dd78626ca035f739135bc5791a
  - step: retro/notes
    hand: box d7d9cc78d3ce · claude-code-remote
    hash_before: a08062ab2cf470318ea7726f28a24ab2d3034516
    hash_after: a08062ab2cf470318ea7726f28a24ab2d3034516
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
  - step: retro/write
    hand: box d7d9cc78d3ce · claude-code-remote
    hash_before: 4c63277de0056af1b21853e07960ecdf3aa03b4a
    hash_after: 4c63277de0056af1b21853e07960ecdf3aa03b4a
  - step: retro/cloud
    hand: box d7d9cc78d3ce · claude-code-remote
    hash_before: 23a7f29f69e6f1c5db8cc7361174ae6e07a86ef4
    hash_after: 23a7f29f69e6f1c5db8cc7361174ae6e07a86ef4
reason: done
---

# Ask

Each step carries the guidance its tags resolve, and the notes at the top ride the output style. One answer stays under the cap and inside its time budget. [[spec/design_input/level-two]] asks it in its chapters Guidance, The size cap and Time budgets.

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

- [[spec/tickets/guidance-resolves-by-tags]], standard
- [[spec/tickets/the-style-carries-the-top]], standard
- [[spec/tickets/cloud-note-reaches-every-step]], trivial
- [[spec/tickets/an-answer-stays-under-cap]], standard
- [[spec/tickets/refusals-stay-under-cap]], trivial
- [[spec/tickets/long-line-cuts-by-bytes]], trivial
- [[spec/tickets/each-call-meets-its-budget]], standard
- [[spec/tickets/budget-fixture-grows-with-work]], trivial
- [[spec/tickets/budget-headroom-on-cloud-boxes]], trivial
- [[spec/tickets/budget-names-the-resolver-call]], trivial
- [[spec/tickets/rest-line-names-plain-pull]], trivial
- [[spec/tickets/the-callers-name-dueHandOut]], trivial

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each child is one change with its test, small enough to review whole
- the chapters Guidance, The size cap and Time budgets each map onto closed children, and nothing of the ask stands outside them
- the one child waiting on another, cloud-note-reaches-every-step, is a child of the ticket it follows

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

- the-style-carries-the-top: design review passed with one finding, then tests, change and green check; every top note rides the output style, the layer carries the canary and the handover
- cloud-note-reaches-every-step: a note binding an env reaches every leaf where it binds
- the pull stages no path a move leaves behind, with its case in test/level0/landed.test.js
- rename-rewrites-each-link-once: minted open, outside the group

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

- the design review read the callers by search, so the missed test callers and the cloud reach surfaced before the build
- the child landed before the parent move, so the move met a resolver ready for it

### badly

<!-- what did not, each with its moment in the log or the transcript -->
<!-- the form is list -->

- the rename verb rewrote links already at the new path into cloud/cloud/cloud, and rewrote closed tickets the door refuses a hand, at the rename call of the-style-carries-the-top change
- the change hand-back refused on a pathspec for the moved file, since the journal still named it
- the retro notes step refused while the group stood in hand, and the drop verb took a search to find

### improve

<!-- how each bad line stops happening, named by its home -->
<!-- the form is list -->

- rename-rewrites-each-link-once in spec/tickets holds the rename fix
- pull-landed.js standsSomewhere holds the pathspec fix, with its case in landed.test.js
- the hand-back refusal on retro/notes can name --drop, a line for spec/design_output/pull under The private queue

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The ask treated the cloud move as a file move, and the review found that the move also narrows when the cloud rules reach a cloud box. The env on a note already says which box it binds, so the env alone decides its reach and the tags stay for the step. Assumed: the moment before the first pull stays with the cloud routine prompt, since no leaf stands there.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the rule the change adds stands once, in spec/design_output/level0 under The style carries the top
- the change adds no number
- the new test file header says what it tests, and counts nothing

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->
<!-- the form is list -->

- nothing: every tool, host and right the branch needed stood on the box

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->
<!-- the form is list -->

- the commit door asking a test beside each code file, at the change commit of the-style-carries-the-top
- the ticket door refusing a hand edit to closed tickets the rename rewrote
- the gate rule refusing a pull joined to another command by a pipe

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->
<!-- the form is list -->

- rename-rewrites-each-link-once stands open with no group, for the next pull
- no person step stands parked
- the handover names the rename ticket as the next free work

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
