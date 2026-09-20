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
urgent: true
process: [[spec/processes/group]]
process_hash: 3c35c048932fd579
step: retro/notes
record:
  - step: sync
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: 5b35bd6821d54beabfee1f62d06d7949f6a976de
  - step: sync
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: 1abe6b4c1c842ba1a0f679d1dee3dd5bb09274ab
    hash_after: 0576ad002bcc6af00c745358298f9315814ba6e4
    answered:
      - name: sync
        exit: 0
        said: work/the-rules-hold-themselves already carries every commit on main.
  - step: split
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: c3ba8d9eeae47807912fa6261236885b40c1c659
    hash_after: 7829ca90d33aa8c189e9817722b9d4d894588373
  - step: children
    hand: the engine
    hash_before: d25d7ba765f7c7d60bdec235141438879eea96ef
    hash_after: d25d7ba765f7c7d60bdec235141438879eea96ef
---

# Ask

Every rule this tree writes gets a program that holds it.

The retro found rules standing in the guidance while the record breaks them
again and again. The write door passes a script's write. The door rule reads no
environment.

The test-first rule carries no check. A fact stands twice, and the note rules
break across the guidance itself. Each ticket here builds the check, so no rule
rests on a reader's memory.

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

- [[spec/tickets/the-question-process-gets-tests]], trivial, which holds the successor road open
- [[spec/tickets/the-rule-shares-one-slug]], question, which gives the slug one owner
- [[spec/tickets/voice-rules-skip-the-record]], trivial, which guards the fields the engine writes
- [[spec/tickets/group-key-takes-one-spelling]], trivial, which refuses a group named as a branch
- [[spec/tickets/runtime-half-takes-the-rest]], trivial, which stands the register under the runtime half
- [[spec/tickets/a-project-adds-vale-rules]], standard, which assembles the styles of both roots
- [[spec/tickets/a-check-finds-every-writer]], standard, which binds the escape to its line
- [[spec/tickets/a-check-finds-restated-facts]], standard, which finds one fact written twice
- [[spec/tickets/a-lint-holds-note-rules]], standard, which reads a marked rule against its rationale
- [[spec/tickets/the-check-holds-test-first]], standard, which refuses a change standing with no test
- [[spec/tickets/the-door-reads-script-writes]], standard, which reads the script a command runs
- [[spec/tickets/the-door-rule-reads-env]], standard, which holds the outside inside a door

## checked

<!-- one line per item of the checklist, on how you take it into account -->

- every child is small enough to review whole, or is a group itself: each carries one rule and its check
- the children add up to the goal, and nothing stands outside them: the file calls ride a minted ask
- a child that waits on another names it under depends_on: none waits, because each holds its own rule

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

Every note on this box carries its outcome and what the successor takes. Five
become tickets in the tree, and one drops because a wider note holds it:

| the note | what it becomes |
|---|---|
| `a-door-holds-the-pid` | dropped, because `a-door-holds-three-reads` names the pid |
| `a-door-holds-three-reads` | [[spec/tickets/a-door-holds-three-reads]] |
| `a-rename-breaks-its-pointers` | [[spec/tickets/a-pointer-reaches-a-heading]] |
| `an-odd-mark-breaks-pairing` | [[spec/tickets/a-lone-mark-pairs-wrong]] |
| `every-road-reads-one-config` | [[spec/tickets/every-road-reads-one-config]] |
| `path-join-stands-twice` | [[spec/tickets/one-door-joins-a-path]] |

A note closes through the pull, and on a work branch this group's leaves outrank
every note. `./RUNME.sh ticket todo <note>` hands one first, so each note above
comes into a hand and closes there.
