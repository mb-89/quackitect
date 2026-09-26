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
step: retro/cloud
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
  - step: retro/write
    hand: box c28a93a32b71 · claude-code-remote
    hash_before: d5ba4be3a4699eca6c35e64273c3564c5593eb17
    hash_after: d5ba4be3a4699eca6c35e64273c3564c5593eb17
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

- [[spec/tickets/a-reply-follows-its-prompt]]: the answer door keys a prompt on its own transcript row, and the prompt's event carries the warning
- [[spec/tickets/answers-read-the-last-text]]: `voice measure` reads the last text of each turn, and a repeated canary draws a warning
- [[spec/tickets/the-retro-holds-the-clear]]: a retro in the session's own hand keeps the conversation, and a new window keeps the binding
- [[spec/tickets/the-stop-reads-the-state]]: the talk rule goes, the owner's step ends a turn, the stop call reads helpers, and a taken group leaves the queue
- [[spec/tickets/the-todo-joins-the-queue]]: the name doors pass what stands in hand, and the pull answers a working todo
- the review findings: each closed as a trivial child
- [[spec/tickets/the-reply-probe-runs]]: the same-message reply and the warning's reach wait on a person's probe

### well

<!-- what went well, and what made it go well -->

<!-- the form is list -->

- a second hand reviewed each design, and each review found a real fault: a late transcript paying a prompt, a repeat check firing on every paying turn, a helper's retro holding the clear
- the queue named each review finding as a child, so none stood lost in prose
- `./RUNME.sh check` ran before every hand-back that landed code, and each landed green

### badly

<!-- what did not, each with its moment in the log or the transcript -->

<!-- the form is list -->

- the queue handed a review's children ahead of the parent's implement step three times. The parent's change landed under a child, and three parents closed as answered, with the red run in their Discussion alone
- the first child's design failed review twice and reached a person step. The draft rested on a client order nobody measured
- two change hand-backs met the commit door's missing-test refusal. The tests had landed at tests-red, and the change staged code alone
- the judge read the last line of `./RUNME.sh check` as a warning, so a check command under a `tests` field refused

### improve

<!-- how each bad line stops happening, named by its home -->

<!-- the form is list -->

- the hand-out in `src/scripts/pull-hand.js` hands a review's children after the parent's implement step, where each child touches the parent's change
- `spec/guidance/review/design` asks a draft to name each client fact it rests on, with the probe that measured it
- the test-first door in `.claude/skills/level0/lib/tested.js` reads the held ticket's tests-red paths, which a hand-back after a commit left out
- the judge's `green` read in the pull reads the exit code of `./RUNME.sh check`, beside its last line

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->

<!-- the form is text -->

The agent weighed stopping at the first child, whose same-message road rests on a probe this box cannot run. It built every part the probe does not decide instead, and parked the rest on a person's question. It also doubted closing three parents as answered. It chose that close over replaying a red run by reverting code on a pushed branch. The Discussion of each parent carries the red run instead.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- each fact stands in the ticket or the design output that owns it, and this retro points at the tickets
- this retro adds no number
- this retro writes no header

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
