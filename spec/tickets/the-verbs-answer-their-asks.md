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
    hand: box fb2b49fba485 · claude-code-remote
    hash_before: 86fe91a008f596271800e368de50fca72c4aeb70
    hash_after: d9648ce7db0f5d884df4e36a44b7b4f42b287f8f
  - step: sync
    hand: box fb2b49fba485 · claude-code-remote
    hash_before: b0a97eb8c14e0fe4a231ab03da87f346f9cc89ec
    hash_after: b0a97eb8c14e0fe4a231ab03da87f346f9cc89ec
    answered:
      - name: sync
        exit: 0
        said: work/the-verbs-answer-their-asks already carries every commit on main.
  - step: split
    hand: box fb2b49fba485 · claude-code-remote
    hash_before: d4e3208a2fd3b784a8804869a894a23f3280592a
    hash_after: d4e3208a2fd3b784a8804869a894a23f3280592a
  - step: children
    hand: the engine
    hash_before: 89f68d1d5533707508d8937d04e7447903ee489e
    hash_after: 89f68d1d5533707508d8937d04e7447903ee489e
  - step: retro/notes
    hand: box fb2b49fba485 · claude-code-remote
    hash_before: 317a6cdcc5de58af8bd5d72885deec4453dc65a0
    hash_after: 317a6cdcc5de58af8bd5d72885deec4453dc65a0
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
  - step: retro/write
    hand: box fb2b49fba485 · claude-code-remote
    hash_before: 65fab3e004bd3155784cdc8c36481f1e22ae6e49
    hash_after: 65fab3e004bd3155784cdc8c36481f1e22ae6e49
  - step: retro/cloud
    hand: box fb2b49fba485 · claude-code-remote
    hash_before: a64b73dfe52e606d215a3b07f8b8349f4a1cd1bc
    hash_after: a64b73dfe52e606d215a3b07f8b8349f4a1cd1bc
reason: done
---

# Ask

The verbs here answer what their asks name, and the queue's place lands in the index or the ticket closes as became.

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

- [[spec/tickets/a-route-closes-answered-asks]], trivial, which closes a ticket whose ask another ticket answers
- [[spec/tickets/split-names-its-source]], trivial, which reads the source past every flag and its value
- [[spec/tickets/the-index-answers-the-queue]], trivial, which closes answered by the ticket the tab's queue column stands on

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- every child is small enough to review whole: each is one trivial ticket, and the largest touches one verb and its tests
- the children add up to the goal: the ask names three verbs, and one child stands for each
- no child waits on another: the third closes on the road the first builds, and it took that road after the first closed

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

- [[spec/tickets/a-route-closes-answered-asks]]: the hand-back takes `--answered <ticket>`, and the record names the answering ticket
- [[spec/tickets/split-names-its-source]]: the split verb reads its source past every flag and its value
- [[spec/tickets/the-index-answers-the-queue]]: closed answered by the ticket the tab's queue column stands on
- the chapter [[spec/design_output/pull#answered]], and the source line under [[spec/design_output/level0#a-verb-cuts-the-file]]

### well

<!-- what went well, and what made it go well -->

<!-- the form is list -->

- every case drove fake doors, so no test touched the disk or git
- the design note held one chapter a road, so the answered road took a chapter beside became
- the third child closed on the road the first built, so this branch proved its own verdict

### badly

<!-- what did not, each with its moment in the log or the transcript -->

<!-- the form is list -->

- the first hand-back came back refused, where the refusal reads `expects green, and ./RUNME.sh test`. The bare test verb answers a duration line and no word
- the second came back refused at the commit door, where the refusal reads `carries no test beside it`. The changed test imported neither module it drove
- the first ticket's says ran past the shape rule, where the lint reads `A run holds 3 paragraphs`

### improve

<!-- how each bad line stops happening, named by its home -->

<!-- the form is list -->

- the says line of the tests field in `spec/processes/trivial.yaml` names `branch test` as the verb answering `green`
- the finding in `.claude/skills/level0/lib/tested.js` says a test stands beside a module where it imports it or carries its name
- the hand writes a table before its prose, as [[spec/guidance/voice]] says, and lints the ticket before the hand-back

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->

<!-- the form is text -->

| the call | the road taken | the road left |
|---|---|---|
| where the answerer stands | the record's `why`, because one place owns a thing | a `successors` entry, which says the name a second time and drifts |
| how the third child closes | answered, because nothing new takes that work up | became, which the group's ask allowed |
| who decides it | this box, and the merge is where a person reads the call | a person step, which a cloud box carries nobody to wait for |

The third ticket's first line asks for a place in the index. The design puts
the place in the pull's answer, and a todo in a file off git.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- every fact stands in one place: the answered road stands in one chapter, and the code points at it
- every number carries a name in one place: the change adds no number, and the schema's test copies say so in their headers
- every header says what its file is for: the change adds no file, and the headers it touches count nothing

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->

<!-- the form is list -->

- no tool: the install at the take put up every tool the check names
- no host: the proxy refused nothing the install or the push asked for
- no right: the platform refused no call

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->

<!-- the form is list -->

- the commit hook once, at the first child's hand-back, where the changed test imported neither module it drove
- no conflict at sync: the branch carried every commit on main at the take
- no cap: the refusals stopped at two on one leaf, and no leaf failed back
- no test that fails on the box alone: the check ran green on each hand-back

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->

<!-- the form is list -->

- no person step parked: the box decided the third child's close itself
- no ticket minted: the improve lines stand in the retro, and none runs deeper than a line
- the handover: `branch done` sets the standing, and the merge reads the discussion under [[spec/tickets/the-index-answers-the-queue]] for the road the design refuses

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
