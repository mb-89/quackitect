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
step: retro/write
record:
  - step: sync
    hand: box c28a93a32b71 · claude-code-remote
    hash_before: fe571ffaaa041b984dd3e971f7f9e90181d693e1
  - step: sync
    hand: box c28a93a32b71 · claude-code-remote
    hash_before: f3306a5498df6b4af2db63f4ed1f611c7bdd36ee
    hash_after: f3306a5498df6b4af2db63f4ed1f611c7bdd36ee
    answered:
      - name: sync
        exit: 0
        said: work/the-gates-read-the-state already carries every commit on main.
  - step: split
    hand: box c28a93a32b71 · claude-code-remote
    hash_before: 0b3308e8bc03decabb45e28384461e56761919e8
    hash_after: 0b3308e8bc03decabb45e28384461e56761919e8
  - step: children
    hand: the engine
    hash_before: ea3f193dc3f52ddd9fb6286fd1f0e302224bb3c8
    hash_after: ea3f193dc3f52ddd9fb6286fd1f0e302224bb3c8
  - step: retro/notes
    hand: box c28a93a32b71 · claude-code-remote
    hash_before: 64f18264773bcb89fddff08d463aa454f721c40f
    hash_after: 54e04480db16e274cf484b7d779826fbc8619ce8
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
---

# Ask

Every gate reads what the session holds. The stop claims a true reason, and an answer pays the prompt it follows. A todo binds as a ticket does, and a retro keeps its conversation.

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

- [[spec/tickets/a-late-count-pays-nothing]], trivial
- [[spec/tickets/a-reply-follows-its-prompt]], standard
- [[spec/tickets/answers-read-the-last-text]], standard
- [[spec/tickets/callers-name-both-readers]], trivial
- [[spec/tickets/canary-repeat-ignores-paid-text]], trivial
- [[spec/tickets/helper-mark-drops-at-stop]], trivial
- [[spec/tickets/meta-rows-open-no-turn]], trivial
- [[spec/tickets/step-rule-names-its-rank]], trivial
- [[spec/tickets/the-bridge-names-no-maker]], trivial
- [[spec/tickets/the-callers-drop-ticket-faults]], trivial
- [[spec/tickets/the-door-passes-ephemeral-holds]], trivial
- [[spec/tickets/the-door-picks-a-hold]], trivial
- [[spec/tickets/the-hand-reads-plans-here]], trivial
- [[spec/tickets/the-open-road-stays-named]], trivial
- [[spec/tickets/the-retro-holds-the-clear]], standard
- [[spec/tickets/the-retro-reads-its-hand]], trivial
- [[spec/tickets/the-stop-reads-the-state]], standard
- [[spec/tickets/the-talk-prose-leaves-stop]], trivial
- [[spec/tickets/the-todo-joins-the-queue]], standard
- [[spec/tickets/the-todo-road-stands-first]], trivial
- [[spec/tickets/the-warning-has-fallback]], trivial
- [[spec/tickets/the-warning-keeps-readers]], trivial
- [[spec/tickets/the-window-case-in-level0]], trivial
- [[spec/tickets/the-window-keeps-the-binding]], trivial

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- each standard child reads whole in one review, and each review finding stands as a trivial child of its own
- the five standard children cover the four sentences of the ask: the answer door, the canary and the measure, the retro's clear, the stop's reasons, and the todo's hold
- no child waits on another, so none names depends_on

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
