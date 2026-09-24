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
    hand: box 2bc65ec92430 · claude-code-remote
    hash_before: a7045d07268b7b6d3b3fe89a5839e83c5b4d3023
    hash_after: 7a9c3d297242b92dc4b3ad367d0c201a1db3d5e0
  - step: sync
    hand: box 2bc65ec92430 · claude-code-remote
    hash_before: 44a54ede21d66a4b1292615b666990408ed5b2cd
    hash_after: 44a54ede21d66a4b1292615b666990408ed5b2cd
    answered:
      - name: sync
        exit: 0
        said: work/the-ticket-answers-the-editor already carries every commit on main.
  - step: split
    hand: box 2bc65ec92430 · claude-code-remote
    hash_before: 09b07b20429b2cdf99acd80ebda6d373c3287c8c
    hash_after: fcebf8361134d3902f21d06eb6690eceef07ff1e
  - step: children
    hand: the engine
    hash_before: c2d252e026919099d872da3f222d6e0a87900d62
    hash_after: c2d252e026919099d872da3f222d6e0a87900d62
  - step: retro/notes
    hand: box 2bc65ec92430 · claude-code-remote
    hash_before: e60839a80077991a26a5921ddd6deac1da662d12
    hash_after: e60839a80077991a26a5921ddd6deac1da662d12
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
  - step: retro/write
    hand: box 2bc65ec92430 · claude-code-remote
    hash_before: f1b1cc576d4de3020003ca3588c8cdde94f10c6f
    hash_after: f1b1cc576d4de3020003ca3588c8cdde94f10c6f
  - step: retro/cloud
    hand: box 2bc65ec92430 · claude-code-remote
    hash_before: 87586cd9fd415fc49ab569526c84d855e0216734
    hash_after: 87586cd9fd415fc49ab569526c84d855e0216734
reason: done
---

# Ask

<!-- goal, as text: what these tickets add up to, for the hand that takes them -->
The engine answers every question the editor asks as a verb writing JSON. The verbs answer the graph with each node's place, a route edit, the fill, and the tickets waiting on a person. The config schema drops the engine keys and declares the work group, and the language server helps a person pick a process. The plan stands in [[spec/design_input/the-editor-draws-the-ticket#the-engine-answers-the-editor]].

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

- [[spec/tickets/each-node-names-its-place]], standard
- [[spec/tickets/the-route-edits-ahead]], standard
- [[spec/tickets/the-fill-answers-on-stdout]], standard
- [[spec/tickets/yours-counts-the-waiting]], standard
- [[spec/tickets/the-config-declares-work]], standard
- [[spec/tickets/the-server-offers-processes]], standard
- [[spec/tickets/an-update-keeps-a-route]], standard

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- every child is small enough to review whole, or is a group itself. Each child adds one verb, one schema change or one server feature.
- the children add up to the goal, and nothing of the goal stands outside them. Each row of the plan's table maps to one child.
- a child that waits on another names it under depends_on. The update child waits on the route child. The config child waits on the yours child, whose verbs its buttons run.

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

- [[spec/tickets/the-route-edits-ahead]]: `ticket route` writes the steps past the pointer, and refuses a reached leaf
- [[spec/tickets/yours-counts-the-waiting]]: `ticket yours` answers the tickets waiting on a person
- [[spec/tickets/an-update-keeps-a-route]]: `ticket update` names drift from the copied process, and `--over` writes over it
- [[spec/tickets/each-node-names-its-place]]: each graph node carries its chapter and its line
- [[spec/tickets/the-config-declares-work]]: the engine keys leave, and the work buttons stand declared and undrawn
- [[spec/tickets/the-fill-answers-on-stdout]]: `ticket fill` writes the mint's route, or prints it under `--stdout`
- [[spec/tickets/the-server-offers-processes]]: the server offers processes, folds the frontmatter, and holds back the filled keys


### well

<!-- what went well, and what made it go well -->

<!-- the form is list -->

- every child closed through the whole standard route, since a spawned hand read each draft and each change
- the verdicts caught copied helpers the draft hand missed, since each spawned hand searched for owners
- each red check pointed at one file, since the check names the test and the rule


### badly

<!-- what did not, each with its moment in the log or the transcript -->

<!-- the form is list -->

- the check went red after the split, since one child name ran past the word cap
- the change leaf met the no-test hook on several children, since tests-red had landed the tests already
- verdicts failed on helpers the tree owned already, such as `canonicalOf`, `leafOf`, `heard` and `COMMENT`
- the config draft named a new `work` section, and one stood already
- the server draft missed the Go checker, which raises a missing key before the bridge answers
- the update change turned a roots case red, and the draft named no such case
- two spawned hands wrote a verdict under the wrong chapter first, and restored the file
- the route and yours cases still copy `heard`, which `test/level0/pull-doors.js` exports


### improve

<!-- how each bad line stops happening, named by its home -->

<!-- the form is list -->

- `ticket open` in `src/scripts/ticket.js` refuses a child name past the word cap, as the tree rule does
- `carriedIn` in `.claude/skills/level0/lib/tested.js` reads the tests-red command, so the change leaf passes the hook
- the draft checklist in `spec/processes/standard.yaml` asks for a search for each helper's owner
- the draft checklist asks the draft hand to read every checker a key reaches
- the spawn prompt in `src/scripts/pull-spawn.js` names the chapter the verdict writes under
- a trivial ticket moves the copied `heard` in the route and yours cases onto the shared one


### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->

<!-- the form is text -->

The drafts read the code a caller touches, and stopped there. Each failed verdict found a second reader or an owner one step further out. The work kept moving because every refusal named its file. The cost sat in round trips, and a search before each helper lands would have saved most of them.


### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- every fact stands in one place. Each line points at the ticket or the file that owns it.
- every number carries a name in one place. The retro adds no number.
- every header the change writes says what its file is for, and counts nothing. The retro writes no header.


## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->

<!-- the form is list -->

- the level zero tools the working guidance names, such as `report`, `patch` and `check_answer`, stood absent from the session
- `code` stood off the path, so the bare `./RUNME.sh` opened no editor


### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->

<!-- the form is list -->

- the word cap, on a child name at the check after the split
- the no-test hook, on the change leaf of several children
- no trunk guard, and no conflict at sync


### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->

<!-- the form is list -->

- no person step stands parked, and every minted ticket names this group
- the work buttons wait for the desk group's work group child, which adds their group and reads `counts` and `opens`
- the improve lines of the retro wait for a hand to mint them


# Discussion

<!-- what anybody adds, at any time, on this ticket -->
