---
kind: [[ticket]]
state: open
urgency: soon
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
step: retro/cloud
process: [[group]]
record:
  - step: children
    hand: box b9be613824b0
    hash_before: a8dab8fe4475b5f06e5e028a654b9131f90820d8
  - step: children
    hand: the engine
    hash_before: 44de554119853e99236107f0a0856b5be961eaf5
    hash_after: 44de554119853e99236107f0a0856b5be961eaf5
  - step: retro/notes
    hand: box b9be613824b0
    hash_before: 46640db8ea4734222178ef7dd1ab63f7f481c9e4
    hash_after: 46640db8ea4734222178ef7dd1ab63f7f481c9e4
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
  - step: retro/write
    hand: box b9be613824b0
    hash_before: 8faabc244cb937c565bfdaa4f359ea69ff7c3603
    hash_after: 8faabc244cb937c565bfdaa4f359ea69ff7c3603
---

# Ask

The verbs read a group off its ticket, claim it by pushing a record entry, and land it with the check on the merge commit.

Done is a tree where no file names a group kind. `branch list` then names a group, a brief and a loose ticket, each as its own kind.

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

# children

# retro

## notes

<!-- decides every private note on the box, and works what it mints into this group -->

### drained

    ./RUNME.sh retro notes

## write

<!-- writes the retro over the box's own window -->

### done

- the-verbs-read-a-group: `branch list` draws a row per ticket under its group, closed done
- [[spec/design_output/work#a-ticket-under-its-group]] holds the shape of the new rows
- two cases in `test/level0/work.test.js` hold the code, and one of them goes red without it
- `retro notes` found no private note, so the box leaves none behind

### well

- the pull handed one leaf at a time, so the ask stood small enough to read whole
- `ticketsOn` already took any ref, so the read costs one call and no new door
- the check ran 900 tests green, and the rules passed over every file this change touches
- `branch list` drew the new rows on the real tree, and ten groups named their tickets

### badly

- `branch take` claimed the group, and `branch sync` then refused: trunk and the branch carry unrelated roots
- the refusal said git status names the files, and git named none, because the merge stopped first
- local `main` stands at a root the remote dropped, so a work branch reads a trunk the remote lost
- the group took its own children step before its sync step, and the sync evidence stands empty

### improve

- `src/scripts/work.js`: `sync` names the unrelated-roots case apart from a conflict, and says what a hand does
- [[spec/design_output/work#trunk-comes-in-first]]: the trunk step says what an unrelated root means
- `src/scripts/work.js`: the take stops at a sync it fails, and holds the next leaf back

### thoughts

The tree carries two trunks. The remote `main` roots at a commit from today, and every work branch roots at one from last week. So `branch sync` cannot run at all, and the contract opens on a step no hand completes here. The work still lands, because a group's children touch files trunk leaves alone. The next merge is where the two roots meet, and that meeting belongs to a person.

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

This is the first group the tree carries, and it stands beside the brief that mints it. A brief wins while `HANDOVER.md` stands, so this note holds the shape and takes no hand until a group ticket takes the place of that file.

The leaves below carry the placeholders the mint writes, because no hand walks this route yet. The pull fills them, one leaf at a time.
