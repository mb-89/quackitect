---
kind: [[ticket]]
state: open
urgency: soon
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
depends_on: ["a-process-is-a-route", "a-group-is-a-branch"]
record:
  - step: sync
    hand: an unnamed box
    hash_before: b0eba19f17474e1b311a53564228e73f2db54852
  - step: sync
    hand: box d49afdfe301a64
    hash_before: e41a185a0be3e8593b2bc9ada89b3d44c95992a4
    hash_after: ee264c82a7be39a66a62114933336c336478cfa8
    answered:
      - name: sync
        exit: 0
        said: work/the-agent-pulls-a-ticket already carries every commit on main.
  - step: split
    hand: box d49afdfe301a64
    hash_before: ce2ed820d36e74a03d6ae66b2c09f5db55109d7e
    hash_after: 91e407676de09781dcbc219c124cf719858c57d9
  - step: children
    hand: box d49afdfe301a64
    skipped: true
    why: the box leaves it while agent-pulls-ticket stand open
  - step: retro/notes
    hand: box d49afdfe301a64
    hash_before: e6135870e27174b63efb1ac8a050049eb28a17af
    hash_after: e6135870e27174b63efb1ac8a050049eb28a17af
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
  - step: retro/write
    hand: box d49afdfe301a64
    hash_before: ef1df47f4dda672fb0bf3b4d5af84f2bb00116de
    hash_after: 82185ef530b93547dad85b01c34449b207523688
  - step: retro/cloud
    hand: box d49afdfe301a64
    hash_before: 4eb957b1313f06c4e69ab29a3e763b8ac34d160b
    hash_after: 4eb957b1313f06c4e69ab29a3e763b8ac34d160b
  - step: split
    hand: box d49afdfe301a64
    hash_before: ae84900b95a2c902314c4875af2398e09f692e49
    hash_after: ae84900b95a2c902314c4875af2398e09f692e49
    returns: 1
    why: the hand takes it back
  - step: split
    hand: box d49afdfe301a64
    hash_before: 34cc24a5ae7f53e16687311770728e5c0bdb239b
    hash_after: 34cc24a5ae7f53e16687311770728e5c0bdb239b
  - step: retro/write
    hand: box d49afdfe301a64
    hash_before: ccbdd6391427a70e1af8ea063f3a9bdd5e5ca3f0
    hash_after: ccbdd6391427a70e1af8ea063f3a9bdd5e5ca3f0
    returns: 1
    why: the hand takes it back
  - step: retro/write
    hand: box d49afdfe301a64
    hash_before: c9845dd6d407dd06c90cd5fb74dfaf37b4e81004
    hash_after: 61e266b7dee01457ff9c6e91ab7078165002add6
  - step: retro/cloud
    hand: box d49afdfe301a64
    hash_before: 500fd9f9079ce5bf55a7071104930285a33b6870
    hash_after: 500fd9f9079ce5bf55a7071104930285a33b6870
  - step: retro/write
    hand: box d49afdfe301a64
    hash_before: fa0936e091ab0dd92d55e0be15b79a1604f8af96
    hash_after: fa0936e091ab0dd92d55e0be15b79a1604f8af96
    returns: 2
    why: the hand takes it back
  - step: retro/write
    hand: box d49afdfe301a64
    hash_before: 590d4fe90275fd98c35b914d9728eabceb137769
    hash_after: 590d4fe90275fd98c35b914d9728eabceb137769
  - step: retro/cloud
    hand: box d49afdfe301a64
    hash_before: 0666bf721e15413180332f74c30d6f154b53c604
    hash_after: 7b294effb503f70bb2ae2252ee5ad24eca2386ad
  - step: children
    hand: box d49afdfe301a64
    hash_before: 7cdc1828f7c128a64e37bd45e7b6a1756e8187cb
  - step: children
    hand: box d49afdfe301a64
    skipped: true
    why: the box leaves it while agent-pulls-ticket stand open
  - step: retro/notes
    hand: box d49afdfe301a64
    hash_before: 184c2e340103b15b6c68887c62ed03db2090ca57
    hash_after: 184c2e340103b15b6c68887c62ed03db2090ca57
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
  - step: retro/write
    hand: box d49afdfe301a64
    hash_before: 833b1d1b9d323c42eb27459af1a9c2fc772839a2
    hash_after: 833b1d1b9d323c42eb27459af1a9c2fc772839a2
  - step: retro/cloud
    hand: box d49afdfe301a64
    hash_before: c5665b398c5fa262dcea42c581434dd623a9fd92
    hash_after: c5665b398c5fa262dcea42c581434dd623a9fd92
step: children
---

# Ask

The agent pulls a ticket. This group lands the pull, its checks, its answers, the record, a hold per hand and the stop rule. So a box works a group's tickets leaf by leaf with no brief.

Done is one of two things, and the retro over the box's own window with it:

- the child ticket closes
- the child ticket parks at the one step this box lacks a hand for

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

- [[spec/tickets/agent-pulls-ticket]], under the standard process

## checked

- the one child is the engine whole. Its diff is the branch, and one reviewer reads it at the verdict step.
- the child's ask carries the brief's tables. The pull, the test verb, the hold, the stop rule and the wrapper stand inside it.
- the child waits on no other ticket, and the group's own dependencies stand on the group

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

- agent-pulls-ticket: the pull, its checks, its answers, the record and the hold stand in `src/scripts/pull.js`
- `branch test` answers green, assertion, build or missing over the delta from the take
- `branch pull --back` puts a leaf back into the hand that holds its record entry
- `branch pull --drop` drops a hold, and `--fields` hands the fields back as the payload
- a step that excludes the only hand answers `spawn`, and a hand under `--as` works that one step
- `branch done` refuses while a hand can take a step. The stop hook holds the turn while the box holds a group.
- the rule that ends turn one stays off a cloud box, and an open private ticket carries the turn
- `ticket open` turns a draft into a pullable ticket, and `retro notes` drains the private folder
- the schema renders a `checked` chapter under a leaf with a checklist. The ticket door lets the hand write it.
- the ticket door reads two chapters of one name apart, which a reviewer hand found and fixed
- the wrapper under `.claude/skills/level1` registers the pull as a tool, and spawns the hand a spawn answer names
- the pull on trunk runs the take, and a flow list keeps a comma inside its quotes
- two spawned hands worked the child's review and its verdict, and the verdict names three engine faults, now fixed
- the design output stands at `spec/design_output/pull.md`, and every function points at a chapter of it

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

- the fakes carry every case. Git stands on the process door, and a ticket stands as text in a map.
- the real pull walks every leaf of the child and of this group. Two spawned hands take the steps that exclude the box.
- the engine's refusals name the fault each time. A reviewer hand fixes the door, and the box fixes the engine.
- the payload road lets a hand work past a stale door, because the engine writes the fields itself

### badly

<!-- what did not, each with its moment in the log or the transcript -->
<!-- the form is list -->

- the first edits go through a shell heredoc past every rule. The bash door then refuses a `sed -i` with ShellWritesNothing.
- the test fixtures fail the slot check five times. A hand-written route names no reader for its outputs.
- three places read the record off a front object where the helper takes text. The group tests catch it late.
- the child ticket's chapters stand as level-one headings the schema names nowhere. The contract test names them after the first battery.
- the nested `claude -p` run under the plugin folder spends its turns on the canary gate and the stop. It times out twice.
- the plugin validator refuses the wrapper's import of the engine. So the judge's material moves into the shell as `--judge`.
- the hand-back lets the retro's evidence through past the voice rules. The sweep names it once the leaf leaves the hand.
- the box ran `branch done` with the review open, and the stop hook let the turn end. No rule read the held group.
- the hook loads the ticket door once, so the reviewer's fix reaches this session nowhere. The payload road goes around it.
- the verdict hand met five refusals on the engine's own faults. So the refusal cap put a person step before the verdict.

### improve

<!-- how each bad line stops happening, named by its home -->
<!-- the form is list -->

- a refusal, level zero: the bash door refuses a heredoc or a script that writes a governed file
- a gate, a test: a fixture takes its route from the process file. So the slot check reads the route the mint copies.
- a check, the sweep: a lint rule names a `recordIn` or `fieldOf` call handed a front object
- a prefill, the ticket schema: the mint writes the brief's tables under the ask as bold runs
- a verb, level one: `branch pull --judge` stands. The wrapper's end-to-end run waits for a desk with a live model.
- a knob, the config: a nested session under `-p` reads `stop.enabled false` off the environment. So a probe answers in time.
- a gate, the pull: the hand-back runs the voice rules over the chapter now. `--back` reopens a leaf the sweep names.
- a rule, the stop hook: `the-group-stands-in-hand` carries the turn, which stands now
- a knob, the config: a refusal from an engine fault counts for no person step, which the retro rules on
- a check, the sweep: the hook reloads its door on a fix, or the check names the stale hook

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The thoughts weigh the child's route against this box before a line of code stands. They settle four things the actions show as facts alone:

- the review and the verdict steps each name `not`, and one box holds one hand. So the box spawns a hand for each.
- the engine has to exist before a ticket can take a record. So the box builds it first, and walks its group after.
- `needs: ["retro"]` answers `wait` for good on a box with no retro verb. So `retro notes` stands as a stub.
- the owner rules that the box spawns the hand a `not` step needs. So the design input's line on a session's helper yields.

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->
<!-- the form is list -->

- a second hand on the box at first. Now the pull answers `spawn`, and the session spawns the hand it names.
- a session that answers in time under `claude -p`. It runs into the canary gate and the stop, twice. The log holds the tool line `select:mcp__level1__pull`.
- a hook that reloads its door on a fix. A reviewer's fix to the door reaches this session nowhere.
- a retro verb past `notes`, so the group's retro route carries a stub the retro branch replaces
- no host, no right and no install stood in the way

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->
<!-- the form is list -->

- the bash door, ShellWritesNothing, on a `sed -i` into the hook module and on a redirection into the scratchpad
- the write door, on the child ticket's brief chapters and on the design note's sentences, tense and paragraphs
- the bash door, on commit messages past the sentence, paragraph and shape caps
- the plugin validator, on the wrapper's import past its folder
- the ticket door, on every write to the child, until a reviewer hand found the two chapters of one name
- the refusal cap, which put a person step before the child's verdict after five refusals on engine faults
- no trunk guard, no conflict past two syncs, no cap, and no test that fails on the box alone

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->
<!-- the form is list -->

- agent-pulls-ticket stands open at `person-1`, a person's step before its verdict. The verdict chapter holds the reviewer's findings already.
- a person answers that step, or takes it out of the route. The next pull then spawns a hand for the verdict again.
- the three engine faults the verdict names stand fixed on the branch, so the next verdict reads a sound engine
- no ticket stands minted with no group
- this ticket is the handover. The group stays open at children until the child closes, and `branch done` names the child.

# Discussion

This is the first group a box works under the pull, so its own record is the first run of the group route as data. The child ticket carries the brief's tables, because the brief is where the owner wrote them.

The swap `implement` to `build` leaves the vocabulary on this branch. The standard route names a step `implement`, and the engine renders that name as a chapter heading. So a swap on the word turns every standard ticket red. The word belongs to the process file, and a rename there is the owner's call.
