---
kind: [[ticket]]
state: closed
urgent: true
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
      - name: settle-1
        does: decides between the step and the findings, and writes why
        by: anyone
        to: engine
        asks: "retro/notes failed back 2 times: the notes stand undecided, so the drain answers them first"
        evidence:
          - name: answer
            form: text
            says: the decision, and why it stands
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
process_hash: 3c35c048932fd579
record:
  - step: sync
    hand: box 4089f1b3b6bc · claude-code-remote
    hash_before: ca22b75158abd573db00e1635f0bd8ea5b443cf4
    hash_after: ac5ed03be50148ca4ac53756dcbafc11a6ebc097
  - step: sync
    hand: box 4089f1b3b6bc · claude-code-remote
    hash_before: b73859fb845d1fc76392b91bc8264f5427d41ab3
    hash_after: b73859fb845d1fc76392b91bc8264f5427d41ab3
    answered:
      - name: sync
        exit: 0
        said: work/the-work-editor-draws already carries every commit on main.
  - step: split
    hand: box 4089f1b3b6bc · claude-code-remote
    hash_before: 515f0f5e80f49e0eb8dffa7d18978e3f45a9ad02
    hash_after: 515f0f5e80f49e0eb8dffa7d18978e3f45a9ad02
  - step: children
    hand: the engine
    hash_before: 58f4b6d1241c6e8ebc51d7a2e5d634bd23a8ee41
    hash_after: 58f4b6d1241c6e8ebc51d7a2e5d634bd23a8ee41
  - step: retro/notes
    hand: box 4089f1b3b6bc · claude-code-remote
    hash_before: 48e590507007f45503a163b16d2cd47e1abb8081
    hash_after: 48e590507007f45503a163b16d2cd47e1abb8081
    returns: 1
    why: the children stand open, so the retro reads nothing
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
  - step: retro/notes
    hand: box 4089f1b3b6bc · claude-code-remote
    hash_before: 6c721042fe85a22567fdb846abb3b95950412e18
    hash_after: 6c721042fe85a22567fdb846abb3b95950412e18
    returns: 2
    why: the notes stand undecided, so the drain answers them first
    answered:
      - name: drained
        exit: 1
        said: group-key-names-a-ticket
  - step: retro/settle-1
    hand: box 4089f1b3b6bc · claude-code-remote
    hash_before: 0e95080bf77674f3807b5197a29039683cd813b6
    hash_after: 0e95080bf77674f3807b5197a29039683cd813b6
  - step: retro/notes
    hand: box 4089f1b3b6bc · claude-code-remote
    hash_before: d290505ee7586b0c72535c5f509efbc356a0fdee
    hash_after: d290505ee7586b0c72535c5f509efbc356a0fdee
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
  - step: retro/write
    hand: box 4089f1b3b6bc · claude-code-remote
    hash_before: 659e89f2ff47addc6b5b0051b6627f1b71b93bc0
    hash_after: 659e89f2ff47addc6b5b0051b6627f1b71b93bc0
  - step: retro/cloud
    hand: box 4089f1b3b6bc · claude-code-remote
    hash_before: 634be26ad109b722e8db3ca5044fcc344faf9d41
    hash_after: 634be26ad109b722e8db3ca5044fcc344faf9d41
reason: done
---

# Ask

The work editor draws every ticket in the tree view, live, in the window's work
tab. A person reads what waits on them, what an agent works, and what the queue
hands out next. [[spec/design_input/the-agent-pulls-tickets]]

The tree view already draws a tree and a table at once. It filters in the log's
language, reads a base file, and takes an edit in a cell. The work tab stands
empty, and these tickets fill it.

The order runs data first, then drawing, then the acts. These tickets stand:

| the ticket | what it lands |
|---|---|
| `the-listing-opens-git-once` | the listing stops spawning a process per branch and per ticket |
| `the-work-answer-lands` | one verb writes what git knows, and the editor reads that file |
| `the-work-tab-draws` | the base file, the columns, and the tree in the tab |
| `the-flags-draw-as-letters` | one boolean key a flag, one lettered column |
| `the-runtime-folder-holds-state` | `.se/.runtimetime` takes the engine's state, and the index walks the rest |
| `the-tree-sorts-several-keys` | a sort of several keys, between the data and the view |
| `one-urgency-stands` | the three urgency words become one mark |
| `the-queue-is-a-score` | the queue orders by a polynomial the config weighs |
| `a-preset-carries-its-sort` | presets and slices as buttons, carrying a filter and a sort |
| `the-cell-fill-takes-marks` | marked rows, and a fill reaching those alone |

The first three are the visibility cut. A person reads the board once they
land. Every ticket after them adds to a board that already draws.

The gain is one board over work this tree already holds. Nothing here mints a
second record. The notes stay the truth, git stays the truth about a branch,
and the editor reads both.

Without it a person reads work through `branch list` in a terminal, one screen
at a time, and reaches no row to change it.

- the work tab draws every ticket, nested under its group
- a write to a ticket redraws the tab with no key pressed
- the queue column answers the order the pull hands out
- `go -C src/tui test ./...` is green
- `./RUNME.sh check` is green

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

- [[spec/tickets/the-listing-opens-git-once]], trivial, which reads git in one process
- [[spec/tickets/the-runtime-folder-holds-state]], trivial, which gives the engine's state its own folder
- [[spec/tickets/the-work-answer-lands]], trivial, which writes what git knows into a file
- [[spec/tickets/the-work-tab-draws]], trivial, which draws the tree in the work tab
- [[spec/tickets/the-flags-draw-as-letters]], trivial, which draws the boolean keys as one lettered column
- [[spec/tickets/the-tree-sorts-several-keys]], trivial, which sorts the tree on several keys
- [[spec/tickets/one-urgency-stands]], trivial, which turns urgency into one mark
- [[spec/tickets/the-queue-is-a-score]], trivial, which orders the queue by a score the config weighs
- [[spec/tickets/a-preset-carries-its-sort]], trivial, which draws presets carrying a filter and a sort
- [[spec/tickets/the-cell-fill-takes-marks]], trivial, which reaches a fill to the marked rows

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- every child is small enough to review whole: each carries the trivial route, so a reader reads its diff whole
- the children add up to the goal: the listing, the answer and the tab land the board. Every later child adds to it
- a child that waits on another names it: each waiting child names it under depends_on

# children

# retro

## settle-1

<!-- decides between the step and the findings, and writes why -->

### answer

<!-- the decision, and why it stands -->

<!-- the form is text -->

The step stands, and the notes get decided. The fails stand with the route, not
with the step:

- a hand holding this group takes no other ticket, so its notes reach no hand
- the tag answers that, because a parked note stands first in the next hand-out
- this hand decides both notes, then comes back to the drain

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

- [[spec/tickets/one-urgency-stands]]: urgency becomes one boolean mark, owned by `group.js`
- [[spec/tickets/the-listing-opens-git-once]]: the listing asks git three times, whatever the remote holds
- [[spec/tickets/the-queue-is-a-score]]: one decider orders the queue, and the config weighs its terms
- [[spec/tickets/the-runtime-folder-holds-state]]: the index rebuilds off its own age, and reads the private half
- [[spec/tickets/the-work-answer-lands]]: `branch answer` writes what git knows into one file
- [[spec/tickets/the-work-tab-draws]]: the work tab draws every ticket, nested under its group
- [[spec/tickets/the-tree-sorts-several-keys]]: the tree sorts on a list of keys
- [[spec/tickets/a-preset-carries-its-sort]]: a preset carries a filter and a sort
- [[spec/tickets/the-cell-fill-takes-marks]]: a fill over marks reaches the marked rows alone
- [[spec/tickets/the-flags-draw-as-letters]]: one column draws the flags as letters
- the log moves out of the runtime half, where the retro collects it
- `branch test` runs a changed Go test beside the JavaScript
- a fail runs its commands for the record, and none of them refuses it

### well

<!-- what went well, and what made it go well -->

<!-- the form is list -->

- the route holds each ticket to a green check, so nothing half-done lands
- the write door names the rule it refuses, so a rewrite takes one pass
- the group's own listing names the defect the split covers, on the first take
- every ticket carries its own test, so a later hand reads what it holds
- the ask of each child names its acceptance, so the work has an end

### badly

<!-- what did not, each with its moment in the log or the transcript -->

<!-- the form is list -->

- the first `branch take` falls over, because the push door spawns `vale` off the PATH
- the children name their group as a branch, so the engine passes their step untouched
- the index binary stands older than its source, so the private half reads empty
- the log stands inside the runtime half, so every retro before this reads no log
- a hand holding a group takes no note, so the drain refuses the step asking for it
- a fail runs the step's commands, so a step standing red stands unfailable

### improve

<!-- how each bad line stops happening, named by its home -->

<!-- the form is list -->

- [[spec/tickets/group-key-takes-one-spelling]] holds the group key to one spelling
- [[spec/tickets/runtime-half-takes-the-rest]] moves the rest of the engine's state
- `install.sh` rebuilds `se-index` where its source stands newer, as the server does
- `log.js` names the log outside the runtime half, and `folders.test.js` holds it there
- `pull.js` runs a fail's commands for the record alone
- the survey wants a road for a tool the install puts somewhere new

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->

<!-- the form is text -->

The route holds a step nothing passes on its own, and the tag is the way
through. A hand holding a group takes no other ticket, and that group's retro
asks the same hand to decide its notes. Nothing on the route names the tag, so
the way through reads like a trick a hand has to know.

- the settle step reads like a person's job, and it takes an answer from this hand
- each refusal names its line, so a wrong sentence comes back before a reader meets it

That last line is what lands the work.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- every fact stands in one place: each chapter names its rule once, and the code points at it
- every number carries a name: the weights stand in the config, and the caps in named constants
- every header says what its file is for: the new files open with what they hold, and count nothing

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->

<!-- the form is list -->

- the first install leaves the tools under the old private place, so `whereIs` finds none
- `vale` stands off the PATH, so the first `branch take` falls at its push door
- the index binary stands older than its source, and nothing on the box rebuilds it
- a stale index daemon holds a broken database, and the door answers nothing until it goes

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->

<!-- the form is list -->

- the fail cap inserts a settle step at the retro's drain, and this hand answers it
- the write door refuses a heading past its cap, a long sentence, and the past tense
- the write door refuses a shell write, so every change goes through Edit or Write
- the trunk guard stands quiet, because the branch carries every commit on trunk

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->

<!-- the form is list -->

- [[spec/tickets/group-key-takes-one-spelling]] stands open on trunk, naming no group
- [[spec/tickets/runtime-half-takes-the-rest]] stands open on trunk, naming no group
- no person step stands parked, and this branch carries no handover

# Discussion

- The log's move out of the runtime half lands under [[spec/tickets/the-work-tab-draws]]
- The fail's own commands stop refusing it, because the drain asks for a step a fail unlocks
