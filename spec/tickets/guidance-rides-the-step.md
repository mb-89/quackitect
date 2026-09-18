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
    hash_after: fef251271b60a1d25f8341d7c16c67d17433b00f
  - step: children
    hand: box 16e341806abd · claude-code-remote
    hash_before: a48293938ce0688d985eaf4f8287170e45140323
  - step: children
    hand: box 16e341806abd · claude-code-remote
    skipped: true
    why: the box leaves it while the-pull-splits-by-topic stand open
  - step: retro/notes
    hand: box 16e341806abd · claude-code-remote
    hash_before: 28c8b293833042623dbbfddb8a571a491da17f09
    hash_after: 28c8b293833042623dbbfddb8a571a491da17f09
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
  - step: retro/write
    hand: box 16e341806abd · claude-code-remote
    hash_before: 6fa5ff9d90aaa9bc4434b3304de075d96e5b94e4
    hash_after: 6fa5ff9d90aaa9bc4434b3304de075d96e5b94e4
  - step: retro/cloud
    hand: box 16e341806abd · claude-code-remote
    hash_before: 4ee349562c2b0cdae3146844ca6e614442251560
    hash_after: 4ee349562c2b0cdae3146844ca6e614442251560
  - step: children
    hand: box 596a811abe2e · claude-code-remote
    hash_before: 1800808d65460f693fa62f9d9aef168e1f151572
  - step: children
    hand: box 596a811abe2e · claude-code-remote
    skipped: true
    why: the box leaves it while the-pull-splits-by-topic stand open
  - step: retro/notes
    hand: box 596a811abe2e · claude-code-remote
    hash_before: 604939387943d00a4dad681f59260e036d138f81
    hash_after: 604939387943d00a4dad681f59260e036d138f81
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
  - step: retro/write
    hand: box 596a811abe2e · claude-code-remote
    hash_before: 331a0181f577c85ff2848ac1cf3e29c622ade67f
    hash_after: 331a0181f577c85ff2848ac1cf3e29c622ade67f
  - step: retro/cloud
    hand: box 596a811abe2e · claude-code-remote
    hash_before: 8e994690f988cfb00bc9ee371f39dbcb9f4510f3
    hash_after: 8e994690f988cfb00bc9ee371f39dbcb9f4510f3
  - step: children
    hand: box d5700e16c529 · claude-code-remote
    hash_before: 921bc1c4caae7d89d0318c2461111b1119800431
  - step: children
    hand: box d5700e16c529 · claude-code-remote
    skipped: true
    why: the box leaves it while the-pull-splits-by-topic stand open
  - step: retro/notes
    hand: box d5700e16c529 · claude-code-remote
    hash_before: 81cc3a63e3b305123db7e2c1515b2ba33cd7fc01
    hash_after: 81cc3a63e3b305123db7e2c1515b2ba33cd7fc01
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
step: retro/write
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

- the install comes up on a mirror, because the node registry it reads answers a gateway error
- the take hands this branch, its brief and its group in one answer
- the children step leaves again, because [[spec/tickets/the-pull-splits-by-topic]] stands at its person step
- the retro notes drain, because the private folder holds no note
- this retro stands over this box's window

### well

<!-- what went well, and what made it go well -->

<!-- the form is list -->

- The install names each tool on its own line as it fetches, so the failing one shows where it fails.
- Vale and Biome come down from their release host, so the doors stand while the registry does not.
- The pull hands the branch, the leaf and the guidance together, so a box landing on trunk reads nothing around.
- The record carries every earlier hand, so this box reads the same skip every box before it writes.

### badly

<!-- what did not, each with its moment in the log or the transcript -->

<!-- the form is list -->

- The node registry answers a gateway error, and the modules stand as a need, so the install stops. The take is its moment.
- The module proxy answers the same error, so the index stays unbuilt and find and links read the files. The take is its moment.
- The route hands the retro out again over a group whose every open step waits for a person. The take is its moment.
- The retro fields hold a single window, so this write drops the last box's. This leaf is its moment.

### improve

<!-- how each bad line stops happening, named by its home -->

<!-- the form is list -->

- The install reads the registry a box names, so a mirror stands in where the default one refuses. Home: [[spec/design_output/tools]].
- The index build reads the module proxy a box names, so a box behind a refusing one still builds. Home: [[spec/design_output/index]].
- A group at children whose every open step waits for a person answers `wait`. Home: [[spec/design_output/pull]].
- The retro a box writes stands under its own hand, so a later box writes beside it. Home: [[spec/design_output/work]].

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->

<!-- the form is text -->

This box spends its first stretch on the install, because one host the install reads refuses it. The tree pins every binary it downloads and names the host in the script. So a box behind a refusing host has one road: it names another registry from outside the tree. That road leaves no trace the tree reads, so the next box walks it again.

| what the box holds | what stands behind it |
|---|---|
| the install stops on a host that refuses | [[spec/design_output/tools]] owns what the tree fetches and from where |
| the window buys a retro the last box already wrote | the pull hands the retro out where a child waits on a person |
| the record reads as work, and the group stands still | [[spec/design_output/work]] owns what a hand writes down |

The group's whole remaining work sits behind one person step. Every box the schedule starts walks the same three leaves, writes the same window over the last, and leaves. The owner decides whether the route answers `wait` there, because the pull owns the answer and the person step owns the wait.


## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->

<!-- the form is list -->

- the node registry, which answers a gateway error, so the box points the install at a mirror, at the install
- the module proxy the index build reads, which answers the same, so the index stays unbuilt, at the install
- `mcp__level0__patch` and `mcp__level0__replace`, which the guidance names for a many-line write, at the retro write
- `check_answer`, which the guidance names over a long draft, at this answer

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->

<!-- the form is list -->

- the install door, which holds the modules as a need, so one refusing host stops every verb
- the person step on [[spec/tickets/the-pull-splits-by-topic]], which leaves the children step again
- the voice rules, which hold a retro in the present tense, and which the lint answers clean
- the write door, which a shell write walks past, so the lint alone carries the check

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->

<!-- the form is list -->

- [[spec/tickets/the-pull-splits-by-topic]] waits at design/person-1, and its record holds the question the engine asks
- the split of the pull and the work verb waits behind that person step
- the mirror this box names stands in its own home folder, and the tree carries no pointer to it
- this box mints no ticket, so none stands here without a group
- the branch owes its handover at done, and this retro is what it carries
- the group's discussion names what a person decides, each with the moment it shows

# Discussion

Where the group stands: two children close, and [[spec/tickets/the-pull-splits-by-topic]] waits for a person at its design step. The pull answers `wait` while that step stands, so the group takes no agent hand.

What the branch meets, each with its moment:

| what the box meets | where it shows |
|---|---|
| a judge refusing the retro | each hand-back through the pull tool, so the shell verb carries it |
| a hand-back's fields landing late | the judge reads the ticket on disk, and weighs the last box's retro |
| a person step under the children | `branch pull` leaves the children step at every take |
| a retro field holding a single window | each box writes its retro over the last box's |
| the voice rules over a retro | the past tense a retro reaches for meets an error at the write |
| a shallow clone | `branch take` answers `refusing to merge unrelated histories`, and `git fetch --unshallow` clears it |
| the size ceiling | every write to the pull or the work verb pays for itself with a larger cut |
| a route that shuts on itself | a verdict hand's files field turns the lint red, and no other hand may write that field |
| a lost test file | an implement hand writes over a test file that already stands |

What a person decides:

- whether the judge names the rule it refuses, so a hand rewrites on a reason
- whether the judge reads the fields a hand-back carries, and guards the shell verb too
- whether a group whose every open step waits for a person answers `wait` at the take
- whether a box's retro stands under its own hand, so a later box writes beside it
- whether two boxes may hold one branch, because a verdict hand's hold breaks each time the tip moves
- whether `branch sync` unshallows a clone itself, or the harness clones whole
- whether the work answer names the markdown list a `files` field takes
- whether a write door rule refuses a whole-file write over a tracked file the hand has not read
- the approach of [[spec/tickets/the-pull-splits-by-topic]], which stands at its person step
