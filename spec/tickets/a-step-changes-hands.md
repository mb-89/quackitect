---
kind: [[ticket]]
state: open
urgency: whenever
steps:
  - name: sync
    does: takes trunk into the branch, so the box works on the latest
    when: cloud
    by: agent
    needs: ["work sync"]
    evidence:
      - name: sync
        form: command
        expects: 0
        says: work sync, so the branch carries trunk
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
process: [[group]]
depends_on: ["the-agent-pulls-a-ticket"]
record:
  - step: sync
    hand: box b71bba5a7b0c
    hash_before: 30750b0403b60ea900582a7d55bff0ba773252b9
  - step: sync
    hand: box b71bba5a7b0c
    hash_before: 3a1748319aeadf464b247f0d8b505ce178950839
    hash_after: 3a1748319aeadf464b247f0d8b505ce178950839
    answered:
      - name: sync
        exit: 0
        said: work/a-step-changes-hands already carries every commit on main.
  - step: split
    hand: box b71bba5a7b0c
    hash_before: 02834b8cfe784fd57403133f142dfc327e93d800
    hash_after: 02834b8cfe784fd57403133f142dfc327e93d800
  - step: children
    hand: box b71bba5a7b0c
    skipped: true
    why: the box leaves it while step-changes-hands stand open
  - step: retro/notes
    hand: box b71bba5a7b0c
    hash_before: 5a185b5a34d533dffe0d042e055ad00cd3ff3404
    hash_after: 5a185b5a34d533dffe0d042e055ad00cd3ff3404
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
  - step: retro/write
    hand: box b71bba5a7b0c
    hash_before: bd762fe7dd88a63e0a36c0dda34de5c7c5d1eb7e
    hash_after: bd762fe7dd88a63e0a36c0dda34de5c7c5d1eb7e
  - step: retro/cloud
    hand: box b71bba5a7b0c
    hash_before: 98e847c28ede0c4a15a3c6901b7a6c959d20634e
    hash_after: 7ce2a4d293f4149208527700dee5cb37b8a4b002
  - step: children
    hand: box 73ef664c513a
    hash_before: 1a7f7547479975554db8fb03a215f874954524d2
  - step: children
    hand: box 73ef664c513a
    skipped: true
    why: the box leaves it while step-changes-hands stand open
  - step: retro/notes
    hand: box 73ef664c513a
    hash_before: 5e8e21698db9ea15115f5ca81ed11f9bc109ab6a
    hash_after: 5e8e21698db9ea15115f5ca81ed11f9bc109ab6a
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
  - step: retro/write
    hand: box 73ef664c513a
    hash_before: ae85ce41965f2a03e90d150e985b05fd81566a3f
    hash_after: ae85ce41965f2a03e90d150e985b05fd81566a3f
  - step: retro/cloud
    hand: box 73ef664c513a
    hash_before: ce0aca07a66280ab04c07a955d224b700887cfd7
    hash_after: ce0aca07a66280ab04c07a955d224b700887cfd7
  - step: children
    hand: box 15784e5eed30
    hash_before: 87799df2984bc42f941d16f2359b6903e3dfbf8d
  - step: children
    hand: box 15784e5eed30
    skipped: true
    why: the box leaves it while step-changes-hands stand open
  - step: retro/notes
    hand: box bf672c492027
    hash_before: 2d8c3c83900bdda5de9331934489dff1098e1cee
    hash_after: 289e6a2984a05644486a23b1adbc8094a424d8cd
  - step: retro/notes
    hand: box 60c5753592ba
    hash_before: c8eb7999eb63f315e900998e9b9e0d66e0558624
    hash_after: dff730fc5f57b6cae29accf2ef444b6871d68578
  - step: retro/notes
    hand: box e40902741515
    hash_before: 929d931f59c7c2f7cec8fe236bb384f3bb5f89b1
    hash_after: 333ea23069349afe95a1290e735e6d43168a189c
  - step: retro/notes
    hand: box 500fb36b5d44
    hash_before: 353b1f4e44bc803f70ee8b2f015410e41a5f670b
    hash_after: b5af48ce6c25a6e18e00788a4772dd0b865fd6da
  - step: retro/notes
    hand: box e192a0b5ebf0
    hash_before: 1d588724e029dbe14ce08a9ff94aadf08621d5e2
    hash_after: aa9d9d0315577249ba0099cba1d01a61b245e9fa
  - step: retro/notes
    hand: box af187ab9cab6
    hash_before: 068dc1cbf08eb7e5c719387a02a91e111a604e78
    hash_after: fe2e6f7523bc7a620742cfb989fe086d0a95d627
  - step: retro/notes
    hand: box af187ab9cab6
    hash_before: fe2e6f7523bc7a620742cfb989fe086d0a95d627
    hash_after: 63fce15757330389c2f2dabe2bdd41245ad25eb7
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
  - step: retro/write
    hand: box af187ab9cab6
    hash_before: 1339db97ba58baed3c26af770f1fc07783d1d534
    hash_after: 1339db97ba58baed3c26af770f1fc07783d1d534
  - step: retro/cloud
    hand: box af187ab9cab6
    hash_before: 4cfede419f04b6a94c80752c96f9a25cea870519
    hash_after: 4cfede419f04b6a94c80752c96f9a25cea870519
  - step: children
    hand: box af187ab9cab6
    skipped: true
    why: the box leaves it while step-changes-hands stand open
  - step: retro/notes
    hand: box c3e576d75a53
    hash_before: df545a2501362c8d243eebec0610beea2c328771
    hash_after: 98f3e758c6b67ff88279128d9bab6a964b1fcdaa
step: retro/notes
---

# Ask

The pull learns who holds a step. The group holds one child, [[spec/tickets/step-changes-hands]]. Its ask carries the pieces: the hand id, the helper's tag, the person's hand, the escalation verb and the group that leaves at `todo`. The design input [[spec/design_input/the-agent-pulls-tickets]] draws it under Hands, Escalation is a step, and Children and private tickets.

# sync

<!-- takes trunk into the branch, so the box works on the latest -->

## sync

<!-- work sync, so the branch carries trunk -->
<!-- the form is command -->

./RUNME.sh branch sync

# split

<!-- mints the children, or assigns standing tickets, each naming this group -->

## children

<!-- every child as a link, one a line, with its process -->

<!-- the form is list -->

- [[spec/tickets/step-changes-hands]], under the standard process

## checked

- the one child reads whole, because its ask holds one table of pieces and one design note takes them
- the child carries every piece the group asks for, and the group itself holds the retro alone
- the child waits on no other ticket, so it names nothing under depends_on

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

- the box takes the group with the child parked at design/person-1, and the pull hands it retro/notes
- the group passes retro/notes on this box, through the shell pull
- the child stays at design/person-1, because a person's step refuses an agent

### well

<!-- what went well, and what made it go well -->

<!-- the form is list -->

- the take prints the group and its child in one command, so the box knows its work at once
- the notes verb answers with the private folder empty, so the retro starts clean
- the shell pull passes the leaf the judge refuses, so the refusal costs one retry and no commit

### badly

<!-- what did not, each with its moment in the log or the transcript -->

<!-- the form is list -->

- the judge refuses the one-line command under retro/notes against the working rules, at the refused line over retro/notes
- the pull hands a retro to a box holding no agent step, at the work line after the take

### improve

<!-- how each bad line stops happening, named by its home -->

<!-- the form is list -->

- the judge reads a command field as no prose, in the shell's judge material
- the pull leaves the group at todo where no agent step stands, in the pull's hold

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->

<!-- the form is text -->

The box holds nothing but the retro. The child waits for a person. Every box that takes the group meets the same refusal and writes the same retro over an empty window. The group leaves at todo the way the design says, and the hand it needs next is a person's.

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->

<!-- the form is list -->

- no tool, no host the proxy refuses, no right the platform refuses, and no install

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->

<!-- the form is list -->

- the judge refuses the one hand-back under retro/notes and names no rule, at the refused line
- the write gate refuses four long lines under retro/write, at the first hand-back there
- the child stands parked under the fail cap at design/person-1, from the box before this one
- no trunk guard, no conflict at sync, no hook, and no test fails on the box alone

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->

<!-- the form is list -->

- design/person-1 on the child waits for a person, and the design already answers the finding it asks about
- no ticket minted with no group
- the group ticket is the handover, and it says the child's implement leaves wait on the person's answer
- the group goes back to todo, and the next box meets the same person step until a person answers

# Discussion

This group waits on one person's line, under design/person-1 on the child.

- the design already answers the finding: [[spec/design_output/pull#the-five-answers]] names five in the heading, the Scope line and the table
- the person writes one line under the child's answer field and hands the step back
- the route then runs on to design/draft
- a third box meets the same wall and writes no third retro, because a second copy is a defect
- the judge refuses the one-line command under retro/notes against the working rules, twice in a row
- those rules govern a session's conduct and read nothing in a command
- that hand-back takes the shell road, which the design names as a person's road
- the judge reads it at the next agent pull
- `branch release` puts the branch at todo and leaves the pull's hold on the box
- the next pull on that box answers refused until the leaf goes back by hand
- the release verb hands the held leaf back first, in the branch verbs
