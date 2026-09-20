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
    hand: box 201f76ea75a2 · claude-code-remote
    hash_before: b8bf880f1d5ba9c3f07b0ae0689835a47cb8c964
  - step: sync
    hand: box 201f76ea75a2 · claude-code-remote
    hash_before: 9f1f5c7b1b9cd2c27c23c23770d78405ffe62646
    hash_after: 9f1f5c7b1b9cd2c27c23c23770d78405ffe62646
    answered:
      - name: sync
        exit: 0
        said: work/the-bridgehead-carries-its-closure already carries every commit on main.
  - step: split
    hand: box 201f76ea75a2 · claude-code-remote
    hash_before: ad34cdc0e72a3be94bcc6186fa08ead637716098
    hash_after: ad34cdc0e72a3be94bcc6186fa08ead637716098
  - step: children
    hand: the engine
    hash_before: c209b93a568d9aafb7e4e7ebc2262c7b6d59987d
    hash_after: c209b93a568d9aafb7e4e7ebc2262c7b6d59987d
  - step: retro/notes
    hand: box 201f76ea75a2 · claude-code-remote
    hash_before: 38406ac0fe1187ec48b04a257309ea3e093db53a
    hash_after: 38406ac0fe1187ec48b04a257309ea3e093db53a
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
  - step: retro/write
    hand: box 201f76ea75a2 · claude-code-remote
    hash_before: f550532b04c55ebcb04b82315f62d0ba433b208d
    hash_after: f550532b04c55ebcb04b82315f62d0ba433b208d
  - step: retro/cloud
    hand: box 201f76ea75a2 · claude-code-remote
    hash_before: 49946158086e4dd12c0ce7d49058d6c5c63dd4d1
    hash_after: 49946158086e4dd12c0ce7d49058d6c5c63dd4d1
reason: done
---

# Ask

A stub carries every file its bridgehead imports, and a dead server costs one round and no more. The two tickets here tighten the bridgehead: files-read-the-closure reads the closure off the imports, and one-post-a-tool-call posts each event once.

# sync

<!-- takes trunk into the branch, so the box works on the latest -->

## sync

<!-- branch sync, so the branch carries trunk -->

    ./RUNME.sh branch sync

# split

<!-- mints the children, or assigns standing tickets, each naming this group -->

## children

<!-- every child as a link, one a line, with its process -->

- [[spec/tickets/files-read-the-closure]], trivial
- [[spec/tickets/one-post-a-tool-call]], trivial

## checked

<!-- one line per item of the checklist, on how you take it into account -->

- each child touches one module, one case file and one chapter, and reads whole in one sitting
- the closure and the count are the two halves of the ask, and the goal names nothing past them
- neither child waits on the other, so neither names a depends_on

# children

# retro

## notes

<!-- decides every private note on the box, and works what it mints into this group -->

### drained

<!-- retro notes, which passes when the private folder is empty -->

    ./RUNME.sh retro notes

## write

<!-- writes the retro over the box's own window -->

### done

<!-- what was done, one line a ticket or a thing -->

- [[spec/tickets/files-read-the-closure]]: the copy into a stub reads the plugin folder's closure off the imports. The marker derives from the folder.
- [[spec/tickets/one-post-a-tool-call]]: a read tool's call takes the `*` door alone, and posts once where a server stands
- the two design chapters name `filesOf` and the one door in place of the list and the second road

### well

<!-- what went well, and what made it go well -->

- the red test came first on both tickets, because the ask named the case. Each went green on the change alone.
- the closure read off this tree found two files the list dropped. The reader ran over the real disk before the case closed.
- the fold of the read road showed the extra wrap and the dropped register list. One door reads every answer one way.

### badly

<!-- what did not, each with its moment in the log or the transcript -->

- the formatter ran bare and put tabs into three files, at the first format after the vehicle cases went green
- the ticket evidence ran past the sentence and list caps four times, at each lint after writing a ticket's fields
- the ask named `FILES` as the thing answering the closure, and a constant reads no disk. The change took a function, and the ticket says why.

### improve

<!-- how each bad line stops happening, named by its home -->

- a hand formats through `./RUNME.sh fix`, which carries the config, and `spec/guidance/working` names that verb beside the tools file
- `./RUNME.sh ticket pull` lints the fields it takes at a hand-back, so a warning meets the hand before the commit
- an ask names the behaviour and leaves the symbol to the change, which `spec/guidance/working` says under its search-for-the-owner line

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->

The read road stood beside the `*` door for one reason: the door posted first and the road posted again. Folding the road into the door took the count from two to one. It took two faults with it, the extra wrap on the answer and the register list the road dropped. Neither fault had a case, and the old case's fake answered a flat result that hid the wrap. A fake behaving like the server would have shown it on the day the road landed.

The closure reader tells the same story. The list stood true on the day its author wrote it, and went stale at the next module. Every stub made since carried a manifest naming a module that stood nowhere. Both fixes replace a copy with a reading, which is the one move under the whole group.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

- the closure stands in `filesOf` and the road in `reads`, and each chapter points at its function
- the change adds no number, and the port and the wait keep the names they had
- the two headers the change writes say what the reader and the door are for, and count nothing

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->

- nothing. The install brought every tool at the take, and the Go modules came through the proxy at the first check.

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->

- the pre-commit hook, at each hand-back's commit, and it passed
- no conflict at sync, because the branch carried trunk at the take
- no test failing on the box alone. The check answers 0 twice, and the rules stand at warning on tickets this group leaves alone.

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->

- no person step stands parked, and no ticket stands minted with no group
- the handover, one: a headless run on a stub calls `find` with the server down. That run reads which shape the engine takes for the answer, and no case here can.
- the handover, two: a stub attached before this change carries a manifest naming `pull-tool.js` and no such file. One attach again takes the closure.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
