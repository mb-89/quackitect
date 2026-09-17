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

- [[spec/tickets/the-layer-reaches-sessions]], read at verdict: a second hand closed it first, so the read landed late
- the count finding of that read stands in that ticket's discussion, for a person to decide
- [[spec/tickets/the-pull-splits-by-topic]], read at design/review: the verdict reads fail, with the findings one a line
- the cap fired on that hand-back, so the ticket waits on a person now
- the retro notes drained, because the private folder holds nothing
- [[spec/tickets/guidance-rides-step]] closed: the notes ride the step, the hold, the log and a verb
- [[spec/tickets/the-layer-reaches-sessions]] closed: a session's layer drops what its step hands it
- the split minted both children above, and the group's children field names them
- the sync took trunk in, once the shallow clone came whole

### well

<!-- what went well, and what made it go well -->

<!-- the form is list -->

- The take handed the branch, the brief and the group whole, so the first pull needed no reading around.
- `./RUNME.sh branch review` answered the check and the retro in one line, which made the reviewing guidance cheap.
- The write door named each voice rule it refused, with the line, so the next write landed clean.
- `--drop` freed a hold no verdict could close, so a duplicate read cost the group nothing.
- The judge refused nothing this run, because the sync brought the voice checks the owner reworked.
- The size rule shaped every change. Each addition rode a larger cut, and the two scripts fell.
- Each review hand read the tree first, so every finding named a line and a file.
- The spawn answer made each review a hand of its own, and no hand judged its own work.

### badly

<!-- what did not, each with its moment in the log or the transcript -->

<!-- the form is list -->

- Two boxes drove one branch. The other closed the ticket while this box read the same diff.
- The hand-back met a branch holding commits this box lacked, and the rebase found that close pushed.
- `./RUNME.sh check` came back refused by the box, so the exit came through `branch review`.
- A shell write to a tracked file met the write door, so the mutation read stopped there.
- The sync died on `refusing to merge unrelated histories` at the take, because the clone was shallow.
- A verdict hand wrote its files field as bare lines, and the lint read the block as one sentence.
- That turned the tree red, and only the hand that wrote the field may write it again.
- Both the change step and tests-green want a green tree, so the route shut on itself there.
- An implement hand wrote over `test/level0/guidance.test.js`, which already stood, and lost its tests.
- The engine committed that loss, and a count read two runs apart was the first to name it.

### improve

<!-- how each bad line stops happening, named by its home -->

<!-- the form is list -->

- The take marks a branch held, and a pull from a second box says so at hand-out. Home: [[spec/design_output/work]].
- A verdict hand fetches before it reads, so a step another hand closed costs no round. Home: [[spec/design_output/pull]].
- The count the canary says reads one owner, and a row drives it. Home: [[spec/design_output/level0]].
- The mutation read runs through Edit and the undo tool, which the write door takes. Home: [[spec/guidance/working]].
- `sync` unshallows a shallow clone before it merges, or the harness clones whole. Home: [[spec/design_output/work]].
- The work answer names the markdown list a `files` field takes. Home: [[spec/design_output/pull]].
- A write door rule refuses a whole-file write over a tracked file the hand has not read. Home: [[spec/design_output/level0]].

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->

<!-- the form is text -->

The engine carried this box through its whole window, and the cost stood where two boxes met.

| what the box felt | what stands behind it |
|---|---|
| the read was sound and landed late | the branch takes no lock a second box reads |
| the fail was right and dear | the cap counts a round, and a round costs a person step |

The verdict on the split reads fail over two small findings, and the cap turned that into a person step. A cap counting rounds makes a reviewer weigh a finding against the cost of naming it. That pressure runs against reviewing, which asks for every finding one a line. The cap belongs where a hand-back repeats itself, and a fresh finding is no repeat.

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->

<!-- the form is list -->

- `./RUNME.sh check` came back refused to this hand, at the verdict read on the layer ticket
- a shell write to a tracked file, refused at the mutation read, so that read ran through the paired rows
- the install ran whole at the take, and the proxy refused no host
- a whole clone, which the take lacked, so `branch sync` answered unrelated histories
- a way for a hand to fix another hand's field, which the route shut on at the first verdict

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->

<!-- the form is list -->

- the write door, over a shell write and over the voice rules, each named with its line
- the cap on [[spec/tickets/the-pull-splits-by-topic]], which turned a second fail into a person step
- a branch holding commits this box lacked, at the first hand-back, which one rebase cleared
- the server, which `./RUNME.sh check` wants standing, and `branch review` named it at the first read
- a shallow clone at the take, which `git fetch --unshallow` cleared before the sync ran
- the size ceiling on the pull and the work verb, which every write paid for with a larger cut
- the lint over a verdict hand's files field, which turned the tree red until that hand rewrote it
- a second box on this branch, which took it while this one held it

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->

<!-- the form is list -->

- [[spec/tickets/the-pull-splits-by-topic]] waits at design/person-1, and its record holds the question
- the count finding on [[spec/tickets/the-layer-reaches-sessions]] stands in that ticket's discussion
- this box minted no ticket, so none stands here without a group
- the branch owes its handover at done, and this retro is what it carries
- the group's discussion names what a person decides, each with the moment it showed
- the split of the pull and the work verb waits behind that person step

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
