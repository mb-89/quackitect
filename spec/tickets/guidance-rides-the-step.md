---
kind: [[ticket]]
state: open
urgency: whenever
steps:
  - name: sync
    does: takes trunk into the branch, so the box works on the latest
    when: cloud
    by: agent
    needs: ["work sync"]
    evidence:
      - name: sync
        form: command
        expects: 0
        says: work sync, so the branch carries trunk
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
process: [[group]]
depends_on: ["the-agent-pulls-a-ticket"]
record:
  - step: sync
    hand: box a57de3bd562b
    hash_before: 0648a6e60d9e14c4a7411dd9a2c0db90c85072e5
    hash_after: 679f66a17614970a512fd0e3a471b4ed227b0f29
  - step: sync
    hand: box 0fc2b4132f94 · claude-code-remote
    hash_before: 3701b70daf5fd2570008e3bb6daeabcca35670ea
  - step: sync
    hand: box 0fc2b4132f94 · claude-code-remote
    hash_before: fa10b6feae49ac46e777efbe1b5ef753e121b0f3
    hash_after: fa10b6feae49ac46e777efbe1b5ef753e121b0f3
    answered:
      - name: sync
        exit: 0
        said: work/guidance-rides-the-step already carries every commit on main.
  - step: split
    hand: box 0fc2b4132f94 · claude-code-remote
    hash_before: 7e7f9c3089581a8d7ba7147e3efcfb1f806c2cd9
    hash_after: 7e7f9c3089581a8d7ba7147e3efcfb1f806c2cd9
  - step: children
    hand: box 220c71584772 · claude-code-remote
    hash_before: ed61d6b8e3f607f0784689d208d6d6da0d69aac0
  - step: children
    hand: box 220c71584772 · claude-code-remote
    skipped: true
    why: the box leaves it while the-pull-splits-by-topic stand open
  - step: retro/notes
    hand: box 220c71584772 · claude-code-remote
    hash_before: 25a38cc62178438406b64144453bccb4d671de3d
    hash_after: 25a38cc62178438406b64144453bccb4d671de3d
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
  - step: retro/write
    hand: box 220c71584772 · claude-code-remote
    hash_before: 10f559386a6b1ac10413fcb3aee2f44ea3fbbb60
    hash_after: 10f559386a6b1ac10413fcb3aee2f44ea3fbbb60
  - step: retro/cloud
    hand: box 220c71584772 · claude-code-remote
    hash_before: 4f77f84dbd10523e18281fe22463820f5432faa4
    hash_after: 4f77f84dbd10523e18281fe22463820f5432faa4
  - step: children
    hand: box 0fc2b4132f94 · claude-code-remote
    skipped: true
    why: the box leaves it while the-pull-splits-by-topic stand open
  - step: retro/notes
    hand: box 0fc2b4132f94 · claude-code-remote
    hash_before: 7dbdca3cbaacd16c4554c06c93f99aaf2f541057
    hash_after: 7dbdca3cbaacd16c4554c06c93f99aaf2f541057
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
  - step: retro/write
    hand: box 0fc2b4132f94 · claude-code-remote
    hash_before: ba423c2bc7830838357ddf8ece02ee8dee907c6d
    hash_after: ba423c2bc7830838357ddf8ece02ee8dee907c6d
  - step: retro/cloud
    hand: box 0fc2b4132f94 · claude-code-remote
    hash_before: ed340ee7c6bb38bef9b844c38c6d9b99e048223d
    hash_after: 7160efd9c0fd21cc22c34bf089d2249c9f622184
  - step: children
    hand: box bb91cd34a460 · claude-code-remote
    hash_before: 7f32ce020bab52f0388b66ba96e5ccba19bb4059
  - step: children
    hand: box bb91cd34a460 · claude-code-remote
    skipped: true
    why: the box leaves it while the-pull-splits-by-topic stand open
  - step: retro/notes
    hand: box bb91cd34a460 · claude-code-remote
    hash_before: 7663c14a1d96061d72bfb6ca5cda25606e2f66dd
    hash_after: 7663c14a1d96061d72bfb6ca5cda25606e2f66dd
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
  - step: retro/write
    hand: box bb91cd34a460 · claude-code-remote
    hash_before: 3157aa31501232ec260942338280398a512c6255
    hash_after: 3157aa31501232ec260942338280398a512c6255
  - step: retro/cloud
    hand: box bb91cd34a460 · claude-code-remote
    hash_before: c70a1c7300894c9356f7f2817704796aec422526
    hash_after: c70a1c7300894c9356f7f2817704796aec422526
step: children
---

# Ask

The pull hands a leaf out already, and this branch hands the guidance with it. The notes a step reads ride the work answer, the hold and the log. The standing layer shrinks to the notes binding every session. The chapter Guidance rides the step in the design input says it whole.

# sync

<!-- takes trunk into the branch, so the box works on the latest -->

## sync

<!-- work sync, so the branch carries trunk -->

<!-- the form is command -->

./RUNME.sh branch sync

# split

<!-- mints the children, or assigns standing tickets, each naming this group -->

## children

<!-- every child as a link, one a line, with its process -->

<!-- the form is list -->

- [[spec/tickets/guidance-rides-step]], process standard, closed: the notes ride the step, the hold, the log and the verb
- [[spec/tickets/the-layer-reaches-sessions]], process standard: the layer drops what a session's step hands it
- [[spec/tickets/the-pull-splits-by-topic]], process standard: every script comes under its ceiling

## checked

- small enough to review whole: each child names one outcome and one set of files
- the children add up to the goal: the first carries the ask, and the second its last mile
- the third carries the ceiling the first paid for, and nothing of the goal stands outside them
- a child waiting on another names it: none waits, because the first stands closed

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

- the take hands this branch, with the brief and the group in the same answer
- the children step leaves again, because [[spec/tickets/the-pull-splits-by-topic]] stands at its person step
- the retro notes drain, because the private folder holds no note
- this retro stands over this box's window

### well

<!-- what went well, and what made it go well -->

<!-- the form is list -->

- The take answers with the branch, the brief and the group together, so the first pull reads nothing around.
- The pull names each field, its form and the exit it wants, so the notes leaf closes fast.
- The record carries every earlier hand, so this box reads where the group stands.
- The hold writes the guidance and its hash beside the step, so the notes ride the step.

### badly

<!-- what did not, each with its moment in the log or the transcript -->

<!-- the form is list -->

- The route runs the retro again over a group whose open step waits for a person. The take is its moment.
- A hand-back's fields reach the judge after it reads, so it weighs the last box's retro. The first hand-back is its moment.
- The judge refuses this retro over the tool, and the shell verb carries the hand-back. Each refusal is its moment.
- The retro fields hold a single window, so this write drops the last box's. This leaf is its moment.
- The bridge starts no server at session start, because the setup brings no modules yet. The first log line is its moment.

### improve

<!-- how each bad line stops happening, named by its home -->

<!-- the form is list -->

- The judge reads the fields a hand-back carries, and names the rule it refuses. Home: [[spec/design_output/pull]].
- The judge guards the shell verb as it guards the tool. Home: [[spec/design_output/pull]].
- A group at children whose every open step waits for a person answers `wait`. Home: [[spec/design_output/pull]].
- The retro a box writes stands under its own hand, so a later box writes beside it. Home: [[spec/design_output/work]].
- The install runs before the bridge reads for modules. Home: [[spec/design_output/level0]].

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->

<!-- the form is text -->

The window goes to a retro, and the branch stands where it stands.

| what the box holds | what stands behind it |
|---|---|
| the block reads clear and costs the window | the pull hands the retro out where a child waits on a person |
| the refusal reads blind | [[spec/design_output/pull]] owns what the judge keeps back |

A group whose open steps all wait for a person holds no agent work. The route still hands its retro out, so the box writes it, checks the children, and leaves. The owner decides whether that retro earns the window, because the pull owns the answer and the person step owns the wait.

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->

<!-- the form is list -->

- a judge answer naming the rule it reads, at each refusal over the tool
- `mcp__level0__patch` and `mcp__level0__replace`, which the guidance names, at the retro write
- a server at session start, because the setup brings no modules yet
- the install runs whole at the take, and the proxy refuses no host

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->

<!-- the form is list -->

- the judge, which refuses this retro over the tool at each hand-back
- the voice rules, which hold a retro in the present tense and cap a list sentence
- the person step on [[spec/tickets/the-pull-splits-by-topic]], which leaves the children step again
- the write door, which takes the Edit route into a tracked file

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->

<!-- the form is list -->

- [[spec/tickets/the-pull-splits-by-topic]] waits at design/person-1, and its record holds the question
- the split of the pull and the work verb waits behind that person step
- this box mints no ticket, so none stands here without a group
- the branch owes its handover at done, and this retro is what it carries
- the group's discussion names what a person decides, each with the moment it shows

# Discussion

Where the group stands: two children closed, and [[spec/tickets/the-pull-splits-by-topic]] waits for a person at its design step. The judge named in the earlier note refuses nothing now, because the sync brought the voice checks the owner reworked.

What the branch met, each with its moment:

| what the box met | where it showed |
|---|---|
| a shallow clone | `branch take` answered `refusing to merge unrelated histories`, and `git fetch --unshallow` cleared it |
| the size ceiling | every write to the pull or the work verb paid for itself with a larger cut |
| a route that shut on itself | a verdict hand's files field turned the lint red, and no other hand may write that field |
| a lost test file | an implement hand wrote over `test/level0/guidance.test.js`, which already stood |
| two boxes on one branch | box `220c71584772` took this branch while box `0fc2b4132f94` held it |

What a person decides:

- whether two boxes may hold one branch, because a verdict hand's hold breaks each time the tip moves
- whether `branch sync` unshallows a clone itself, or the harness clones whole
- whether the work answer names the markdown list a `files` field takes
- whether a write door rule refuses a whole-file write over a tracked file the hand has not read
- the approach of [[spec/tickets/the-pull-splits-by-topic]], which stands at its person step
