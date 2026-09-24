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
step: children
record:
  - step: sync
    hand: box a0ae5042621d · claude-code-remote
    hash_before: a6be6079e5e01c0a5bf76bea89945e47fc0e4600
  - step: sync
    hand: box a0ae5042621d · claude-code-remote
    hash_before: b9f5b6f30aa3e54ff852ae4d77662331da81f091
    hash_after: b9f5b6f30aa3e54ff852ae4d77662331da81f091
    answered:
      - name: sync
        exit: 0
        said: work/terms-mean-themselves already carries every commit on main.
  - step: split
    hand: box a0ae5042621d · claude-code-remote
    hash_before: 7b3e18a6a48b8226a0666347724e55a7935a1cbd
    hash_after: 3712afcb32da02ab82948bb116a57239fd554073
---

# Ask

<!-- goal, as text: what these tickets add up to, for the hand that takes them -->
Every term says what it means in one line of core words and other terms, and the hover shows that line. The dictionary is the source, so the doors refuse a term that points at a note in this tree. A term can cite a source outside the tree. The plan stands in [[spec/design_input/the-editor-draws-the-ticket#terms-mean-themselves]].

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

- [[spec/tickets/a-term-means-itself]], under the standard process
- [[spec/tickets/a-term-points-nowhere]], under the standard process
- [[spec/tickets/the-hover-shows-a-term]], under the standard process

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- each child reads whole. The field is one data change, the refusal one rule, and the hover one request in the server
- the field child carries the field, the outside source and every term. The other two carry the refusal and the hover, so every row of the plan lands
- the refusal and the hover both read the line, so both name the field child under depends_on

# children

# retro

## notes

<!-- decides every private note on the box, and works what it mints into this group -->

### drained

<!-- retro notes, which passes when the private folder is empty -->

<!-- the form is command -->

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
The owner asks why `inset` points at the design input. The term schema demands `defines` today, so every term points at a note, and this group ends that.
