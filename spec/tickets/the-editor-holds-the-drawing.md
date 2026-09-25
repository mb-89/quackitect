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
step: retro/cloud
record:
  - step: sync
    hand: box d6f05e3a585030 · claude-code
    hash_before: f557e5c56139658231d08fe4af300c90ceea4568
    hash_after: 3234cb0d362e1274e150d3e41327057999e7918f
  - step: sync
    skipped: true
    why: the box runs off the cloud
    hash_after: ec9ac4efa7d1e3ce82cfe742a5265bbbe18b585e
  - step: split
    hand: box d6f05e3a585030 · claude-code
    hash_before: 59f5ef62a4da20b6365fb3e30222335890ecfebf
    hash_after: abe7834950dc122148a4ef8cbf7dd799963e6b78
  - step: children
    hand: box 75b31b3d5012 · claude-code-remote
    hash_before: febc2764b5737813771d07e07333eeead1f07170
    hash_after: b57f8a900df15fec95d90004195bf4c4248e0e88
  - step: children
    hand: the engine
    hash_before: 75fbfce25a7c2ed94218f76a6b75f1cc5a224d95
    hash_after: 75fbfce25a7c2ed94218f76a6b75f1cc5a224d95
  - step: retro/notes
    hand: box 75b31b3d5012 · claude-code-remote
    hash_before: bf0d846d8c43ca7dcdaef1fde9639a8fe269fcd3
    hash_after: bf0d846d8c43ca7dcdaef1fde9639a8fe269fcd3
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
  - step: retro/write
    hand: box 75b31b3d5012 · claude-code-remote
    hash_before: fbf4857274f53c30a3dc901f25e30fe2d3a126c4
    hash_after: fbf4857274f53c30a3dc901f25e30fe2d3a126c4
  - step: retro/cloud
    hand: box 75b31b3d5012 · claude-code-remote
    hash_before: 5028b375d05ddb2937961d4ae56c81c382fcbb3d
    hash_after: 5028b375d05ddb2937961d4ae56c81c382fcbb3d
reason: done
---

# Ask

<!-- goal, as text: what these tickets add up to, for the hand that takes them -->
A person takes a ticket, works it and hands it back from VS Code alone, and that closes level one. The editor holds the drawing over the folded frontmatter, fills a new ticket on save, and draws the work group. The plan stands in [[spec/design_input/the-editor-draws-the-ticket#the-editor-holds-the-drawing]], and a desk works it.

# sync

<!-- takes trunk into the branch, so the box works on the latest -->

## sync

<!-- branch sync, so the branch carries trunk -->

<!-- the form is command -->

# split

<!-- mints the children, or assigns standing tickets, each naming this group -->

## children

<!-- every child as a link, one a line, with its process -->

<!-- the form is list -->

- [[spec/tickets/the-editor-takes-an-inset]], experiment
- [[spec/tickets/the-inset-folds-the-frontmatter]], standard
- [[spec/tickets/the-host-runs-the-verbs]], standard
- [[spec/tickets/a-save-fills-the-ticket]], standard
- [[spec/tickets/the-work-group-draws-buttons]], standard
- [[spec/tickets/the-owner-walks-a-ticket]], question

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- each child takes one row of the plan's table, so a reviewer reads it whole
- the children take the plan's rows one to one, and the walk closes the goal
- the probe waits on nothing, and every other child names what it waits on under `depends_on`

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

- [[spec/tickets/a-save-fills-the-ticket]]: a save over a picked process and an empty route runs `ticket fill`
- [[spec/tickets/the-inset-folds-the-frontmatter]]: the drawing stands over the folded frontmatter, in an inset or a side panel, with a flip lens
- [[spec/tickets/the-host-runs-the-verbs]]: a jump, a route edit, a take and a hand-back run from the drawing
- [[spec/tickets/the-work-group-draws-buttons]]: the sidebar draws the work editor with its count, pull for me and new ticket

### well

<!-- what went well, and what made it go well -->

<!-- the form is list -->

- a fake door drove every press with no editor, since the lens splits each choice from its vscode call
- the take and the hand-back from the drawing ride `ticketLensOf().took`, so the drawing and the buttons share one road
- a second hand read every draft and every diff, and caught the overwritten tests before the push
- the side panel stands in for the inset, so the work went on while the probe waits

### badly

<!-- what did not, each with its moment in the log or the transcript -->

<!-- the form is list -->

- tests-red wrote two test files over standing names through a shell redirect, at `ed79e730`. The verdict at `9843715f` caught it
- the fold's draft left out the events, the theme, the height and the imports. It failed review at `4fd4f907` and `39813f51`
- the fold's change landed with a wire case throwing a `TypeError`, at `e45673ac`, since no test ran before the hand-back
- the commit hook refused three change commits carrying code and no test, since the tests had landed at tests-red
- a blanket rename rewrote the record's `why` and the reviewers' text. The diff caught it before the commit

### improve

<!-- how each bad line stops happening, named by its home -->

<!-- the form is list -->

- a new file goes through the Write tool, which refuses an unread path. Home: `AGENTS.md`, under a rule on new files
- the draft names every event, door call and import the approach reaches. Home: the `design/draft` checklist of `spec/processes/standard`
- the change step runs the ticket's own test command before the hand-back. Home: `needs` on `implement/change` in `spec/processes/standard`
- the change step says a code commit carries a test edit, even where tests-red wrote the file. Home: `spec/guidance/code/testing`, rule five
- an edit over a ticket reaches the hand's own field alone. Home: the write door on tickets

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->

<!-- the form is text -->

The reviews earned their cost. Each fail named a gap the code carried toward the editor:

- an unwired event
- a refold under the cursor
- a lost page
- two lost test files

The drafts ran thin where the approach reached vscode. The fake door answered each call, so the draft left each call unnamed.

The probe's `decide` still waits on the owner. The host tries the inset first and falls back to the side panel, so either answer holds. The owner's own look at the editor stays the one proof no box gives.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the retro points at each ticket and each file, and restates none of their fields
- the inset's floor, ceiling and lines a node carry names in `route-host.js`. The bundle folder's copy says why beside it
- each new file's header says what it is for, and counts nothing

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->

<!-- the form is list -->

- VS Code, so no case ran the inset, the side panel or the fold in a real editor. The fake door stood in for each
- nothing else: no host refused, no right refused, and the install ran clean at the take

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->

<!-- the form is list -->

- the commit hook refused three code commits carrying no test beside them. Each stood at a change step
- the push door refused a push over a check on an older commit. A check on the head cleared it
- the form warnings stood in fields other hands and the engine wrote, and the pull let each land

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->

<!-- the form is list -->

- [[spec/tickets/the-owner-tries-the-inset]]: the owner answers whether the inset draws in their editor. The host falls back to the side panel either way
- [[spec/tickets/the-owner-walks-the-editor]]: the owner walks a ticket from creation to hand-back in VS Code. The answer names each place the walk leaves it
- no ticket minted with no group
- the handover: the inset needs `--enable-proposed-api quackitect.quackitect` or `argv.json`, and a reload of the extension

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
