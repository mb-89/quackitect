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
step: retro/write
record:
  - step: sync
    hand: box dcd73916add7 · claude-code-remote
    hash_before: ad8bc2d01456fc08d074ff89d2f143a27072b53e
  - step: sync
    hand: box dcd73916add7 · claude-code-remote
    hash_before: 4202ecb12b70abfb5d6d5913a0140555e4c3ef2c
    hash_after: 4202ecb12b70abfb5d6d5913a0140555e4c3ef2c
    answered:
      - name: sync
        exit: 0
        said: work/the-review-lands-overnight already carries every commit on main.
  - step: split
    hand: box dcd73916add7 · claude-code-remote
    hash_before: f8428866ac2040495370aa7363cd567a3bc350dc
    hash_after: f8428866ac2040495370aa7363cd567a3bc350dc
  - step: children
    hand: the engine
    hash_before: 4a1a76215ac89420333fea02d937e250947a6ef9
    hash_after: 4a1a76215ac89420333fea02d937e250947a6ef9
  - step: retro/notes
    hand: box dcd73916add7 · claude-code-remote
    hash_before: 6114a3e3bfc5bcf9ece36c1f545aedbc22789f57
    hash_after: 6114a3e3bfc5bcf9ece36c1f545aedbc22789f57
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
---

# Ask

<!-- goal, as text: what these tickets add up to, for the hand that takes them -->
The review this tree ran lands whole. A hand-back reads its prose the way the
lint reads it, so no hand-back leaves a warning on trunk. A write to a field the
engine owns lands with that field put back, and names it. A change adding
comments alone asks for no test, and the config section in the sidebar opens
and shuts every group at once. So a hand meets one reader, one rule over the
fields, and no refusal a person has to clear by hand.

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

- [[spec/tickets/a-claim-reads-its-source]], on the standard route
- [[spec/tickets/a-comment-hunk-is-prose]], on the standard route
- [[spec/tickets/a-count-meets-the-lint]], on the standard route
- [[spec/tickets/a-landing-follows-its-gate]], on the standard route
- [[spec/tickets/each-check-reads-its-signal]], on the standard route
- [[spec/tickets/each-helper-lands-one-commit]], on the standard route
- [[spec/tickets/one-reader-judges-a-verdict]], on the standard route
- [[spec/tickets/the-binding-reads-the-session]], on the standard route
- [[spec/tickets/the-config-folds-at-once]], on the trivial route
- [[spec/tickets/the-door-keeps-its-marks]], on the standard route
- [[spec/tickets/the-door-refuses-a-revert]], on the standard route
- [[spec/tickets/the-engine-restores-its-fields]], on the trivial route
- [[spec/tickets/the-owner-hears-first]], on the standard route
- [[spec/tickets/the-pull-pushes-its-close]], on the standard route
- [[spec/tickets/the-verbs-reach-the-question]], on the standard route
- [[spec/tickets/the-verbs-read-prose-whole]], on the standard route

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- each child took one design review and one verdict over its own diff
- the children cover the one reader, the fields the engine owns, the comment hunk and the sidebar's folds
- the children depend on none of the others, so none names a `depends_on`

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

### well

<!-- what went well, and what made it go well -->

<!-- the form is list -->

### badly

<!-- what did not, each with its moment in the log or the transcript -->

<!-- the form is list -->

### improve

<!-- how each bad line stops happening, named by its home -->

<!-- the form is list -->

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

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

<!-- what anybody adds, at any time, on this ticket -->
