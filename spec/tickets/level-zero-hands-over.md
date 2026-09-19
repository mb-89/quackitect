---
kind: [[ticket]]
state: closed
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
process: [[group]]
process_hash: 3c35c048932fd579
record:
  - step: sync
    hand: box 747cff5c2f2a
    hash_before: 351643baac99a8a434a3205d269828f05fd08f59
  - step: sync
    hand: box 747cff5c2f2a
    hash_before: e964a774e97ddec14963424356ed019503f2d657
    hash_after: e964a774e97ddec14963424356ed019503f2d657
    answered:
      - name: sync
        exit: 0
        said: work/level-zero-hands-over already carries every commit on main.
  - step: split
    hand: box 747cff5c2f2a
    hash_before: b5712b4c4c9a3b48b8ca143cba0f0f1d985b2184
    hash_after: b5712b4c4c9a3b48b8ca143cba0f0f1d985b2184
  - step: children
    hand: the engine
    hash_before: 8a908358b7d14093a5b61d132a6476ea8347b50f
    hash_after: 8a908358b7d14093a5b61d132a6476ea8347b50f
  - step: retro/notes
    hand: box 747cff5c2f2a
    hash_before: d33c212d3b74e3e52dfaf559db188f35f4234ed4
    hash_after: d33c212d3b74e3e52dfaf559db188f35f4234ed4
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
  - step: retro/write
    hand: box 747cff5c2f2a
    hash_before: 453a37966734f1f915dd2fb547c8db222172d48f
    hash_after: 453a37966734f1f915dd2fb547c8db222172d48f
  - step: retro/cloud
    hand: box 747cff5c2f2a
    hash_before: 40ea5a403fe8be4d717059c67c022cae24e72ca5
    hash_after: ea1b81b14194e6f8b102c5d00bdcf8b3502f3c0a
depends_on: ["the-agent-pulls-a-ticket"]
reason: done
---

# Ask

Where it stands

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

- [[spec/tickets/level-zero-handover]], under standard, closed

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the one child is small enough: two hands read it whole, and it closed at its verdict
- the goal is the tool list the child's ask opens with. The brief's other rows stand as four loose drafts, and the retro names them
- the one child waits on nothing

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

- level-zero-handover closed: the guidance door reads the survey at session start and hands the session a tools block
- the sync merge took a rebuilt trunk in, with its whole tree and this branch two tickets
- the group and its child opened, and their routes name the branch verbs
- four loose drafts carry the brief open rows: the answer door, the viewer, the controls, the brief verbs
- one private note became the-judge-reads-answer-rules, a loose draft
- the stop door queue check reads the environment off the box, so its test runs in memory

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

- the fakes under the doors folder carried every test in memory, so the red and the green came fast
- the shell hand-back ran the commands and named each broken line, so one pass fixed a refusal
- a helper hand took the review and the verdict, and the spawn prompt the pull printed was enough

### badly

<!-- what did not, each with its moment in the log or the transcript -->
<!-- the form is list -->

- the judge refused every plugin hand-back, ten in a row, and named no rule, at every leaf of the child
- the sync merge met unrelated histories, and the merge verb stopped at the first refusal
- the route update dropped the child three extra chapters, and the ask took a rewrite by hand
- the write door refused shell writes into the tree once the server stood, at the tests-green leaf
- the platform refused three deletes in the sync merge, and the merge went through a scratch index

### improve

<!-- how each bad line stops happening, named by its home -->
<!-- the form is list -->

- the judge, in the level one hook: read the rules that fit evidence, and name the broken one
- the sync verb, in the work module: say unrelated histories by name, and offer the trunk tree whole
- the route update, in the ticket verb: keep a chapter the shape leaves out, or refuse and say which
- the cloud guidance: say the write door holds once the server stands, so a box starts the server first
- the sync merge on a cloud box: a delete goes through git plumbing, and the work note says so

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The judge is the one door on the plugin road, and it refused everything. So the cage held nothing this run, and the shell road carried every hand-back. The rules the judge reads describe an answer, and a leaf evidence is a fragment of a ticket.
The group ask reads three words. The brief carried the goal, and the route update cut it. So the split read the brief and guessed at its edge.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the tools block lines come off the wanted list and the specs, and the tools note points at the library
- the block heading and the block name each stand once, at the top of the guidance door
- the door test header says what the file is for, and counts nothing

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->
<!-- the form is list -->

- a right the platform refused: three deletes in the sync merge, in the first minutes, before the first pull
- the installs: every one landed at the first command, and the proxy let every host through

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->
<!-- the form is list -->

- a conflict at sync: trunk came in as an unrelated history. The merge took its whole tree and the two tickets
- a hook: the write door refused shell writes once the server stood, at the tests-green leaf
- a test that fails on the box alone: the stop door queue test read the cloud variable off the process. Two lines fixed it
- the trunk guard: every commit landed on the work branch, and the guard stayed quiet

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->
<!-- the form is list -->

- four drafts with no group: the-answer-door-reads-notes, the-viewer-draws-the-note, the-controls-wire-up, the-brief-verbs-go
- one draft with no group from the private note: the-judge-reads-answer-rules
- person steps: every step closed by a hand, and the branch parks none
- the handover: the branch carries the closed child, the closed group and five drafts. The merge into trunk belongs to a person

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
