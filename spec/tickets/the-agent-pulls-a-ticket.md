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
step: retro/cloud
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

- the one child is the engine whole, and its diff is the branch, which one reviewer reads at the verdict step
- the child's ask carries the brief's tables, so the pull, the test verb, the hold, the stop rule and the wrapper stand inside it
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

- agent-pulls-ticket: the pull, its five checks, its three answers, the record and the hold stand in `src/scripts/pull.js`, under twenty-six fake-door tests
- `branch test` answers green, assertion, build or missing over the delta from the take
- `ticket open` turns a draft into a pullable ticket, and `retro notes` drains the private folder
- the schema renders a `checked` chapter under a leaf whose chain carries a checklist, and the ticket door lets the hand write it
- the stop hook reads the hold folder, and the rule stands in `spec/config/stop/level1.yml`
- the plugin wrapper under `.claude/skills/level1` registers the pull as a tool and asks the judge over the shell's JSON
- a flow list keeps a comma inside its quotes, which the group's own checklist tripped over
- this group walked its own route under the pull: sync, split, children left, notes, write and cloud each carry a record entry
- the design output stands at `spec/design_output/pull.md`, and every function points at a chapter of it

### well

<!-- what went well, and what made it go well -->

<!-- the form is list -->

- the fakes carried every case, because git stands on the process door and a ticket is text in a map
- the real pull walked the child's draft leaf and every leaf of this group on the first run, because the tests drove the same code
- the write door caught the child ticket's brief chapters at the first edit, so the schema fault surfaced before the check did
- the voice door held the design note and the commit message to the caps, and each rewrite read better than the draft

### badly

<!-- what did not, each with its moment in the log or the transcript -->

<!-- the form is list -->

- the first edits went through a shell heredoc past every rule, until the bash door refused a `sed -i` with ShellWritesNothing, and the formatter then moved bytes under the next patch
- the test fixtures failed the slot check five times over, because a hand-written route names no reader for its outputs, and each round cost a full test run
- the record was read off a front object in three places where the helper takes text, which the fake caught only once the group tests ran
- the child ticket's chapters stood as level-one headings the schema names nowhere, which the contract test named after the first battery
- the nested `claude -p` run under the plugin folder spent its turns on the canary gate and the stop, and timed out twice before the pull tool answered
- the plugin validator refused the wrapper's import of the engine, so the judge's material moved into the shell as a `--judge` flag

### improve

<!-- how each bad line stops happening, named by its home -->

<!-- the form is list -->

- a refusal, level zero: the bash door refuses a heredoc or a script that writes a governed file, the way it refuses `sed -i`
- a gate, a process file: the mint refuses a route whose output nothing reads, which stands, and the test fixture takes the route from the process file in place of a hand-written one
- a check, the sweep: a lint rule names a `recordIn` or `fieldOf` call handed a front object, or the helpers take both
- a prefill, the ticket schema: the mint writes the brief's tables under the ask as bold runs, so a cut brief lands in shape
- a verb, level one: `branch pull --judge` stands, and the wrapper's end-to-end run waits for a desk with a live model and no stop hook in the way
- a knob, the config: a nested session under `-p` takes `stop.enabled false` off an environment variable, so a probe answers inside its timeout

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->

<!-- the form is text -->

The thoughts weighed the child's route against this box before a line of code stood: the review and the verdict steps each name `not`, and one box holds one hand. So the child parks at review whatever the engine does, and the group stays open by design. The actions show a box that builds the engine, then walks its own group with it, and the thoughts show that order as a choice: the engine had to exist before the ticket could take a record. The thoughts also settled that the retro's `needs: ["retro"]` would answer `wait` forever on a box with no retro verb, which is why `retro notes` stands as a stub now and the design says so.

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

This is the first group a box works under the pull, so its own record is the first run of the group route as data. The child ticket carries the brief's tables, because the brief is where the owner wrote them.
