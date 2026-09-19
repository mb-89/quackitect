---
kind: [[ticket]]
state: closed
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
    hand: box ca870d4f20f4 · claude-code-remote
    hash_before: ca22b75158abd573db00e1635f0bd8ea5b443cf4
    hash_after: de80d05e3377cbeeeb752ccca8de75de96199be6
  - step: sync
    hand: box ca870d4f20f4 · claude-code-remote
    hash_before: 7be10ccbc18e3a191e1e22d82ee93e6776b4abc3
    hash_after: 7be10ccbc18e3a191e1e22d82ee93e6776b4abc3
    answered:
      - name: sync
        exit: 0
        said: work/the-person-step-holds already carries every commit on main.
  - step: split
    hand: box ca870d4f20f4 · claude-code-remote
    hash_before: c319945fc8d3681b5fcd41bfd7bcdfd244668049
    hash_after: c319945fc8d3681b5fcd41bfd7bcdfd244668049
  - step: children
    hand: the engine
    hash_before: 5a5b8c3993d18a9c5b8bba7f20a8ba24e5327279
    hash_after: 5a5b8c3993d18a9c5b8bba7f20a8ba24e5327279
  - step: retro/notes
    hand: box ca870d4f20f4 · claude-code-remote
    hash_before: 65d6ca66515f930892b325b3517ea6354fdbb713
    hash_after: 65d6ca66515f930892b325b3517ea6354fdbb713
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
  - step: retro/write
    hand: box ca870d4f20f4 · claude-code-remote
    hash_before: 83d0a9a5e853ee962a9a87e0fcc9dbdb5d8f10ec
    hash_after: 83d0a9a5e853ee962a9a87e0fcc9dbdb5d8f10ec
  - step: retro/cloud
    hand: box ca870d4f20f4 · claude-code-remote
    hash_before: 581272f828a8f712b54990f625319afcc06fdda1
    hash_after: 581272f828a8f712b54990f625319afcc06fdda1
reason: done
---

# Ask

The pull inserts a person step where a leaf fails or meets refusals past the cap, and that step holds. An agent gets no such step, the cap inserts none twice, and a group leaves at todo with its children. A person reads the pull as the owner meets it. These five tickets stand on the pull and the person step, and a cloud box works them on one branch.

# sync

<!-- takes trunk into the branch, so the box works on the latest -->

## sync

    ./RUNME.sh branch sync

<!-- the form is command -->

# split

<!-- mints the children, or assigns standing tickets, each naming this group -->

## children

- [[spec/tickets/a-person-reads-the-pull]], on [[spec/processes/trivial]]
- [[spec/tickets/escalate-inserts-a-person-step]], on [[standard]]
- [[spec/tickets/person-step-refuses-an-agent]], on [[standard]]
- [[spec/tickets/refusal-cap-inserts-no-person]], on [[spec/processes/trivial]]
- [[spec/tickets/the-group-leaves-at-todo]], on [[standard]]

<!-- the form is list -->

## checked

- each child carries one ask a reader takes whole, and the two smallest ride the trivial route
- the five cover the person step, the caps, the group's leaving and the words a person meets
- `escalate-inserts-a-person-step` names its one dependency, and the others wait on nothing

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

- [[spec/tickets/a-person-reads-the-pull]]: the take names why a push comes back, and a parked step reads its question
- [[spec/tickets/refusal-cap-inserts-no-person]]: both caps take new names, and each answers on its own road
- [[spec/tickets/the-group-leaves-at-todo]]: a group whose open children all wait stands still, and the judge reads no command
- [[spec/tickets/escalate-inserts-a-person-step]]: `branch escalate` lands, and the vocabulary takes its name
- [[spec/tickets/person-step-refuses-an-agent]]: the hand carries the git author, and `work.personSigns` reads the tip

### well

- the route drove the whole group, and each leaf named its fields and its guidance
- the verdict leaves caught two faults a hand of its own would have shipped
- the write door named the rule and the line each time, so a rewrite took one try
- the design output stood ahead of the code, so a draft read as a link to it

### badly

- the first take crashed, because the private folder moved and the push door hunted the old place
- the index answered nothing, because a stale copy of its database stood beside the live one
- a verdict's `read` field came back as bare lines, which the sentence rule read as one sentence
- the turn held open on every hold another hand took, and each hold cost a round

### improve

- the survey feeds the push door, so `whereIs` in `src/scripts/prepush.js` reads it like every caller
- [[spec/tickets/the-runtime-folder-holds-state]] owns the folder move, and the index binary writes the old path
- the work answer names the shape a `files` field takes, beside the shape a command field takes
- the stop hook reads the holds this session's own hand owns, and leaves another hand's alone

### thoughts

A route with a `not` rule on its review and verdict steps makes a group slow on one box. Each such leaf wants a hand of its own, and the box waits while that hand reads. The waiting is the cost of the rule, and the rule is what caught the two faults.

The write door taught faster than the guidance did. A rule a reader meets as a refusal, with the line beside it, lands in one round. The same rule inside a list of fifteen lands in none.

### checked

- each fact the retro adds stands in one line, and the tickets carry the detail
- the retro writes no count, and the commands the tickets name answer each one
- the files the change touched carry headers already, and this note adds none

<!-- the form is checklist -->

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

- the push door found no `vale` at the first take, because the install wrote the folder's old name
- the index binary answered `file is not a database`, because a stale copy stood at the old name
- the check refused until a server answered, and the box started one by hand

### met

- the push door, at the take, which left the branch claimed on the box and unpushed on origin
- the write door, on a shell heredoc into a tracked file, and on the word `escalate`
- the commit door, on that same word in a commit message
- the file ceiling, on `work.js` and on `test/level0/pull-steps.test.js`, which split by topic
- the `not` rule on every review and verdict leaf, which took a hand of its own

### left

- no person step stands parked on this branch, and every child closes done
- the group's own retro steps close here, and `branch done` is what follows
- `branch review` names the retro as the one thing the handover lacks, which this leaf writes
- the improve lines name their homes, and a hand mints a ticket for each the owner wants

<!-- the form is list -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
