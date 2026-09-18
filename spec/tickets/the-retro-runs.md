---
kind: [[ticket]]
state: closed
urgency: now
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
step: retro/write
record:
  - step: sync
    skipped: true
    why: the box runs off the cloud
  - step: split
    hand: box d42624a67d18a8 · claude-code
    hash_before: 581614665675d9aeffd86b072b89bba30e8be6d4
    hash_after: 581614665675d9aeffd86b072b89bba30e8be6d4
  - step: children
    hand: box d42624a67d18a8 · claude-code
    skipped: true
    why: the box leaves it while a-retro-mints-itself, the-retro-cuts-its-window, the-retro-lays-its-leaves, the-retro-takes-the-box stand open
  - step: retro/notes
    hand: box aa95965bf4e2 · claude-code-remote
    hash_before: 17baa5dd4d8d8e19c745933d759033a9dcb4e5d3
    hash_after: 07e756b638cfe5def01fd26b79cbad22ed09769c
  - step: retro/notes
    hand: box d42624a67d18a8 · claude-code
    hash_before: bf6e192ba30b8f39a8c0bafc2eef1eb561750907
  - step: retro/notes
    hand: box d42624a67d18a8 · claude-code
    hash_before: 9d6f5afd1e004f7c33355cb49063ebb9c4f61336
    hash_after: 9d6f5afd1e004f7c33355cb49063ebb9c4f61336
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
  - step: retro/write
    hand: box d42624a67d18a8 · claude-code
    hash_before: b08fc5e52a88b99a6b7b4ad8710f984c78aa53b7
    hash_after: b08fc5e52a88b99a6b7b4ad8710f984c78aa53b7
  - step: retro/cloud
    skipped: true
    why: the box runs off the cloud
    hash_after: 193100499a34f980bdf4b955ea05d58608d800de
reason: done
---

# Ask

<!-- goal, as text: what these tickets add up to, for the hand that takes them -->

The retro route runs end to end, because the verb its first step names stands.

| what stands today | what this group lands |
|---|---|
| the route, in its process file | the verb the route calls |
| the readers, in a process file of their own | the mint that writes one per chapter |
| the note drain, under the retro verb | the collect beside it |
| the design, in full | the code answering it |

Read [[spec/design_input/the-agent-pulls-tickets]] first, the chapter The retro. It names every take, every leaf and every count, and this group builds what it names.

# sync

<!-- takes trunk into the branch, so the box works on the latest -->

## sync

<!-- branch sync, so the branch carries trunk -->

<!-- the form is command -->

# split

<!-- mints the children, or assigns standing tickets, each naming this group -->

## children

- [[spec/tickets/the-retro-takes-the-box]], off [[spec/processes/standard]]
- [[spec/tickets/the-retro-cuts-its-window]], off [[spec/processes/standard]]
- [[spec/tickets/a-retro-mints-itself]], off [[spec/processes/standard]]

<!-- the form is list -->

## checked

- every child is small enough to review whole. Each one lands in a diff a reader reads at a sitting.
- the children add up to the goal. The take, the cut and the mint are the whole of the verb.
- a child that waits on another names it. The cut names the take under depends_on.

<!-- the form is checklist -->

# children

# retro

## notes

<!-- decides every private note on the box, and works what it mints into this group -->

### drained

    ./RUNME.sh retro notes

<!-- the form is command -->

## write

<!-- writes the retro over the box's own window -->

### done

- the-retro-takes-the-box: collect copies the private folder past the folders it skips, and writes a manifest.
- the-retro-cuts-its-window: the window opens where the last retro closes, and cuts into chapters holding activity.
- a-retro-mints-itself: retro new mints off the route, names the retro by the tip, and pulls it.
- the leaves: collect lays one file a leaf, so a reader reads one file and runs nothing.
- the note drain: every private note takes a decision, and the verb answers zero.

<!-- the form is list -->

### well

- the design names every take, leaf and count, so each child reads its ask off one chapter.
- every door carries a fake, so each case drives a fake disk, git and clock.
- the note drain forces a decision on each parked thought, and the classes fall out of it.
- a ceiling refusal splits a file at the seam a reader already reads, and no case dies.

<!-- the form is list -->

### badly

- collect refuses its own step at the first run, because the guard counts the retro's own hold.
- the copy corrupts an archive, because collect moves bytes through the text read and write.
- the cut reads no transcript, because the source match reads a path prefix and no field.
- a minted retro carries an object where the ask goes, because a field named steps meets the route key.
- a named pull mid-hold hands the leaf back, so a child passes with its findings open.
- a hand-resolved merge leaves a handover on trunk, so a new branch reads as brief done.

<!-- the form is list -->

### improve

- retro-collect.js passes the hold whose ticket is the retro it collects for.
- src/doors/disk.js carries copy and size, so an archive moves byte for byte.
- retro-window.js resolves a row by the field naming where it comes from.
- retro-window.js names the chapter field returns, so no ask field takes a route key's name.
- pull.js must refuse a named pull from a hand holding a leaf, and name the hand-back.
- work-merge.js must clear the handover on a hand-resolved merge, as the verb clears it otherwise.

<!-- the form is list -->

### thoughts

The transcript reads as a hunt for one bug, and finds two sealed doors. The overnight loop looks like five boxes failing, and the reading shows one route with no road through it.

The thoughts circle the vocabulary harder than the code. A made-up word costs a correction each time, and those corrections outnumber the logic errors.

<!-- the form is text -->

### checked

- every fact stands in one place. The counts stand in the chapter ask, and nowhere else.
- every number carries a name in one place. The chapter span stands in retro-window.js, and no note repeats it.
- every header says what its file is for. Each new module opens on its own job, and counts nothing.

<!-- the form is checklist -->

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

- The owner reads every branch for a retro verb first, and none carries one. So this group takes it.
- [[spec/tickets/the-runtime-files-stand-apart]] splits the private folder into three, and the retro's half is one of them.
- The owner rules the take a deny list. Collect takes every file under the private folder that the list leaves standing.
- So that split matters here. The runtime half is what the deny list names, beside the retro's own folders.
- The first window takes the tree's first commit, because no retro closes before it.
- A review of the take names a gap the split leaves. The design takes material off git, and no child asks for it.
- [[spec/tickets/the-retro-lays-its-leaves]] closes that gap, and it stands as a fourth child.
