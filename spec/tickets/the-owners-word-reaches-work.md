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
    hand: box 0dde19be1600 · claude-code-remote
    hash_before: 18e94e85552c478281f47d467e5dfcffb1c0ab0c
    hash_after: 2d48a1cbd96484b454378d183f05bfefd515c4d8
  - step: sync
    hand: box fcc1ba4a896f · claude-code-remote
    hash_before: 18e9a3fd425b8be1063c3ff4b7402c35bd6c3da3
    hash_after: cc1a26a47c399b88663e3a7a1662389ccb28773d
  - step: sync
    hand: box fcc1ba4a896f · claude-code-remote
    hash_before: d200c5f8fa28583ea2e31e2ffed293ef76db9483
    hash_after: aec0af7ae76a937c689a6bd17f2859467066a337
    answered:
      - name: sync
        exit: 0
        said: work/the-owners-word-reaches-work already carries every commit on main.
  - step: split
    hand: box fcc1ba4a896f · claude-code-remote
    hash_before: e6dada9d095f1b518c7b9f1fe7cb3847162df334
    hash_after: e6dada9d095f1b518c7b9f1fe7cb3847162df334
  - step: children
    hand: the engine
    hash_before: a1e1212acde46714228a76b0b4e6efbf825c0058
    hash_after: a1e1212acde46714228a76b0b4e6efbf825c0058
  - step: retro/notes
    hand: box fcc1ba4a896f · claude-code-remote
    hash_before: eb322145a58115206c00cd20406e54abcc72c23f
    hash_after: eb322145a58115206c00cd20406e54abcc72c23f
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
  - step: retro/write
    hand: box d7a4b8aac9106 · claude-code-remote
    hash_before: 741fe98f17f5cbe1c1428d0ae3db5068f491bfe8
  - step: retro/write
    hand: box d7a4b8aac9106 · claude-code-remote
    hash_before: af3935de0388e926bc2ab60956a550395bc0b68d
    hash_after: af3935de0388e926bc2ab60956a550395bc0b68d
  - step: retro/cloud
    hand: box d7a4b8aac9106 · claude-code-remote
    hash_before: 6d4ef0513912f7adaf45b4e84494ad58a13cbb5f
    hash_after: 6d4ef0513912f7adaf45b4e84494ad58a13cbb5f
reason: done
---

# Ask

The owner's words reach the work as said. A claim of done rests on the owner's view, and a small ask stays small.

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

- [[spec/tickets/a-small-ask-stays-small]], standard
- [[spec/tickets/the-owner-view-decides-done]], standard
- [[spec/tickets/the-owners-words-travel-verbatim]], standard
- [[spec/tickets/the-hook-awaits-the-spawn]], trivial
- [[spec/tickets/the-new-rule-appends]], trivial
- [[spec/tickets/the-view-fails-to-implement]], trivial
- the other review findings, each trivial, closed into the child they name

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- each child changes one road: the small ask, the owner's view, or the owner's words
- the children add up to the ask: a small ask stays small, done rests on the view, and the words travel as said
- the verbatim child reads the Ask-line reader the view child lands, and each landed in that order on this branch

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

- `a-small-ask-stays-small`: an owner's one-line change takes the trivial route, and `design/draft` asks a `size` field
- `the-owner-view-decides-done`: an ask naming a view carries a person leaf after its last leaf, so the owner's view decides done
- `the-owners-words-travel-verbatim`: a handover and a note ask carry the owner's words as quotes with their session and line
- `the-hook-awaits-the-spawn`: the callers list names the `tool.call` handler that awaits the spawn answer
- `the-new-rule-appends`: the new tickets rule appends, so the rationale and the `Examples` rows keep their numbers
- `the-view-fails-to-implement`: the `view` step carries `on_fail: implement`, so the owner's fail reaches code

### well

<!-- what went well, and what made it go well -->

<!-- the form is list -->

- each design review caught a fault before code, at `10635c3a0`, `01d2aac8a` and `720fda22d`
- most review findings closed into their child, so the group stays at three roads and three trivial fixes
- the verbatim child landed after the view child whose Ask-line reader it uses, as the split asks

### badly

<!-- what did not, each with its moment in the log or the transcript -->

<!-- the form is list -->

- a review minted five findings on `the-owner-view-decides-done` at `01d2aac8a`, since its draft named too little
- `owner-terms-await-question` left the group at `2ed52ea59`, as a question the owner alone answers
- the children's box let the branch go before the retro at `741fe98f1`, so this retro reads the log
- this box met a Bash door refusing a description naming no open ticket, before `branch take` hands any ticket out

### improve

<!-- how each bad line stops happening, named by its home -->

<!-- the form is list -->

- `spec/processes/standard.yaml`: the new `size` field makes a draft name its reach
- `spec/processes/group.yaml`: a box writes the retro before it lets a branch go, so the transcript backs it
- `spec/tickets/a-shell-call-names-its-ticket.md`: the shell door lets `branch take` and `ticket pull` through with no ticket

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->

<!-- the form is text -->

- this box takes the branch at `retro/write`, so its work is the account alone
- the design reviews carry the group's weight, and their findings fold back into each child
- the owner-terms question waits on the owner, outside the group
- this box writes no script under `.se/scripts`

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- every fact the retro adds points at its commit or its ticket, and repeats no rule
- the retro adds no number
- the retro writes no file header

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->

<!-- the form is list -->

- nothing: `branch take` builds the index, the language server and the client on the box

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->

<!-- the form is list -->

- the shell hook refused `branch take` for naming no ticket, then for a closed one, and passed an open one
- the take merged main in with no conflict
- the split's `checked` line stands at warning, and the door keeps it for the engine

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->

<!-- the form is list -->

- `the-owner-names-three-things`: the owner's question on coined terms, outside this group

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
