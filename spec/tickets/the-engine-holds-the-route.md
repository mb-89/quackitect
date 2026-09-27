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
depends_on: [each-thing-stands-in-place, the-gates-read-the-state, the-owners-word-reaches-work, the-servers-and-views-hold, the-verbs-land-whole]
step: retro/cloud
record:
  - step: sync
    hand: box d7d6cb0fb1105 · claude-code-remote
    hash_before: 0c7092033b9aea4d01399c8cb050aeb2f4f4b126
    hash_after: 7843ebda48e04f0d55af77c910e09724b7265a55
  - step: sync
    hand: box d7d809305dcf · claude-code-remote
    hash_before: 494f004fffa7938a7239d80dcb5cf34d6e503684
  - step: sync
    hand: box d7d809305dcf · claude-code-remote
    hash_before: 71ba97316dfc0a372d59368234d7a194586c27f5
    hash_after: e3d4199415dec09ba628b9c2e8bdaf194d72668d
    answered:
      - name: sync
        exit: 0
        said: work/the-engine-holds-the-route already carries every commit on main.
  - step: split
    hand: box d7d809305dcf · claude-code-remote
    hash_before: b7d315446b960a9e71c26a4b0daa4cb04d4f4946
    hash_after: e0508228bae46ba264124c6e2159da80ed35cdc8
  - step: children
    hand: the engine
    hash_before: 99916e19232326f2f9ae7b078384dd76600decf5
    hash_after: 99916e19232326f2f9ae7b078384dd76600decf5
  - step: retro/notes
    hand: box d7d809305dcf · claude-code-remote
    hash_before: e1fe50650afc0576e7c4d96559553ed71d845dc5
    hash_after: e1fe50650afc0576e7c4d96559553ed71d845dc5
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
  - step: retro/write
    hand: box d7d809305dcf · claude-code-remote
    hash_before: 3e4f6dc204eb8e0e41d98e086d7630d72d99620e
    hash_after: 3e4f6dc204eb8e0e41d98e086d7630d72d99620e
  - step: retro/cloud
    hand: box d7d809305dcf · claude-code-remote
    hash_before: 3b3fb4321922983d5a447892b550e981d5593e70
    hash_after: 3b3fb4321922983d5a447892b550e981d5593e70
reason: done
---

# Ask

A hand meets one step at a time. The engine holds the route, writes the ticket file, runs the gates and closes a process on its final acceptance. [[spec/design_input/level-two]] asks it, and its chapters The loop, Gates and The final acceptance hold the detail.

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

[[a-pull-hands-one-step]] standard
[[a-gate-reviews-and-fixes]] standard
[[the-last-gate-accepts]] standard
[[the-judge-leaves-the-code]] standard
[[answer-mark-loses-its-reader]] trivial
[[judge-cut-clears-the-checks]] trivial
[[judge-cut-meets-claude-door]] trivial
[[judge-pointers-leave-other-notes]] trivial
[[first-accept-names-its-base]] trivial, became the-last-gate-accepts
[[judge-cut-takes-its-helpers]] trivial, became the-judge-leaves-the-code
[[a-gate-names-its-question]] trivial, new

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

each child is a standard or trivial ticket, and the new one touches pull-chapter.js and its test alone
The loop sits with a-pull-hands-one-step, Gates with a-gate-reviews-and-fixes, the-judge-leaves-the-code and a-gate-names-its-question, The final acceptance with the-last-gate-accepts; the gate commit line of Gates sits with a-moved-input-marks-steps, which owns the stale marking
a-gate-names-its-question waits on no open ticket, since every other child stands closed

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

sync takes trunk into the branch
the split reads the three chapters against the closed children, and mints a-gate-names-its-question
a-gate-names-its-question closes done: a gate hand-out prints its question and the question before the clear
a-moved-input-marks-steps carries the gate-commit line in its Discussion
the private note becomes write-marks-leave-the-plugin
a-retro-hand-decides-notes: a group at a retro step hands its notes before itself

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

the split reads each chapter line against the done_when lines, and finds the one gap in the code
the live tree proves the engine fix: the next bare pull hands the note

### badly

<!-- what did not, each with its moment in the log or the transcript -->
<!-- the form is list -->

the fix verb reflows the whole tree before a commit, and a checkout puts the reflow back
the auto mode check then refuses a read of the committed diff
the retro hand meets a refusal on every road to the note, over many calls

### improve

<!-- how each bad line stops happening, named by its home -->
<!-- the form is list -->

the commit verb alone formats what it lands, so no hand runs the fix verb before a commit
a-retro-hand-decides-notes closes the road the retro lacks
the pull names the road to a note where a group stands at retro/notes

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The plan's working todo and the queue binding each refuse a pull the design sends. The hand reads the pull code before it reads the refusal as final.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

BEFORE_CLEAR stands in pull-chapter.js alone, and pull.md points at it
the change adds no number
the new test file's header says what it proves, and counts nothing

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->
<!-- the form is list -->

the proxy refuses www.google.com during a commit, and the commit lands anyway
the auto mode check refuses a read of a committed diff after a checkout

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->
<!-- the form is list -->

sync takes the trunk commits in with no conflict
the server on its port drops for a moment while the check runs, and the plan call fails once
the commit door refuses a change whose test file stands untracked

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->
<!-- the form is list -->

no person step stands parked
write-marks-leave-the-plugin stands free, with no group
a-retro-hand-decides-notes stands free, its fix already landed in e1fe50650
the handover names both, and the group at done

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
