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
process: [[spec/processes/group]]
process_hash: 3c35c048932fd579
step: retro/cloud
record:
  - step: sync
    hand: box a05106ef44c2 · claude-code-remote
    hash_before: e109f61cc1a6b3ccea6e04166b53198a4a4dd376
  - step: sync
    hand: box a05106ef44c2 · claude-code-remote
    hash_before: aa55a245ab13fbae267d4d2ad4508efc0b2f767d
    hash_after: aa55a245ab13fbae267d4d2ad4508efc0b2f767d
    answered:
      - name: sync
        exit: 0
        said: work/findings already carries every commit on main.
  - step: split
    hand: box a05106ef44c2 · claude-code-remote
    hash_before: 4dc96e9e6d1cd2dbe5f3398edaf77b02b7a0885c
    hash_after: 4dc96e9e6d1cd2dbe5f3398edaf77b02b7a0885c
  - step: children
    hand: the engine
    hash_before: 0bbe16e86a9e8a321f6441abdf3c0d5e0740f838
    hash_after: 0bbe16e86a9e8a321f6441abdf3c0d5e0740f838
  - step: retro/notes
    hand: box a05106ef44c2 · claude-code-remote
    hash_before: ea250b72f9f0c5a70a59de0dd748c058f9a318fd
    hash_after: ea250b72f9f0c5a70a59de0dd748c058f9a318fd
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
  - step: retro/write
    hand: box a05106ef44c2 · claude-code-remote
    hash_before: 6aeaa4f833e550e058a92e79054568b155dc1185
    hash_after: 6aeaa4f833e550e058a92e79054568b155dc1185
---

# Ask

The findings the desk parked as private notes, each a defect an agent fixes with no word from the owner.

# sync

<!-- takes trunk into the branch, so the box works on the latest -->

## sync

./RUNME.sh branch sync

# split

<!-- mints the children, or assigns standing tickets, each naming this group -->

## children

- [[spec/tickets/a-test-importing-cli-exits]], on the trivial process
- [[spec/tickets/the-battery-flickers-under-load]], on the trivial process
- [[spec/tickets/the-respawn-answers-no-server]], on the trivial process
- [[spec/tickets/the-stop-line-loops-forever]], on the trivial process

## checked

- every child is small enough to review whole: each is one trivial ticket with one step and one commit
- the children add up to the goal: each parked note stands as one child, and no finding stands outside them
- a child that waits on another names it under depends_on: none waits on another, so none names one

# children

# retro

## notes

<!-- decides every private note on the box, and works what it mints into this group -->

### drained

./RUNME.sh retro notes

## write

<!-- writes the retro over the box's own window -->

### done

- `a-test-importing-cli-exits`: the command line guards its main, and the register case it hid names the right file
- `the-battery-flickers-under-load`: the check ran the number of times the ask names, and every run answered green
- `the-respawn-answers-no-server`: the restart goes through the process door, watched, with the child's output in the serve log
- `the-stop-line-loops-forever`: the cap ends a turn over the queue rule, and the runaway line writes at warn with its count

### well

- each child landed as one commit, because the hand-back runs the tests and the check and refuses a red one
- the guard brought a red case out of the empty pass, because the case then ran for the first time
- the commit door refused the first hand-back, because the hook scripts changed with no test beside them. The transcript at the first pass of the first child

### badly

- the commit door refused the first hand-back, because the hook scripts' guards changed with no test beside them. The transcript at the first pass of the first child
- the runaway line said no holds, because the tooth reset its count before the decision carried it. The red run of the stop door test after the flag went
- a kill by pattern matched the shell running it, so the check loop started twice. The transcript at the relaunch of the loop
- the prose rules refused the past tense and a half saying what a thing is not. The lint lines after the respawn chapter

### improve

- a change widening past the ask reads the test-first rule first, and stays with the ask: `spec/guidance/working`
- a change to a log line comes with a case asserting the words, so the count reads right first: `test/level0/stop-door.test.js`
- a loop of the hand's own starts from a script file and stops by its task, with no kill by pattern: `.se/scripts`
- a note meets the lint verb before the hand-back, because no write door holds a session the server misses: `spec/guidance/cloud`

### thoughts

The respawn could stay in the wire door or move to the process door. The ask names a fake process door, and no fake stands for the wire, so it moved. The queue rule's flag came from an earlier ticket, where the cap let a session with work end. This ask names the opposite fault, a session refusing the stop line over work it leaves untaken. The note now says the cap wins and the queue stands for the next prompt. So both faults have their answer there.

The child's output went to a file and to no pipe. A pipe dies with the old server, and the child's next write to it errors. The canary line stood nowhere in this session, so no write door refused a write here, and the lint verb stood in for it.

### checked

- every fact stands in one place: the guard, the window, the log's name and the cap each live in one note
- every number carries a name in one place: the window and the contract's waits stand as named constants. The runs table holds its counts
- every header says what its file is for: the wire door's header names the listen alone, and no header counts

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
