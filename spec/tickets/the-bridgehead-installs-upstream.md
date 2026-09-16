---
kind: [[ticket]]
state: closed
urgency: soon
depends_on: [the-bridgehead-imports-its-vehicle, the-stub-takes-shape]
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
process_hash: 484b33f9aed1254b
record:
  - step: sync
    hand: box 99aa60a14c3f
    hash_before: 272c26697052a4f9e4896160e12d148a2d499680
  - step: sync
    hand: box 99aa60a14c3f
    hash_before: d6901e35952bf087fa5284905e47bbf912e04031
    hash_after: 7970d1baeb22238a8615259c85e98016475b682a
    answered:
      - name: sync
        exit: 0
        said: work/the-bridgehead-installs-upstream took 390 commit(s) from main.
  - step: split
    hand: box 99aa60a14c3f
    hash_before: a4ed2a5289e73a8ea625e37227d9c6a2edd9624f
    hash_after: a4ed2a5289e73a8ea625e37227d9c6a2edd9624f
  - step: children
    hand: the engine
    hash_before: ccc1589a34bc28d33100a8e6630785797b4950d3
    hash_after: ccc1589a34bc28d33100a8e6630785797b4950d3
  - step: retro/notes
    hand: box 99aa60a14c3f
    hash_before: 5c280431c4230b7ff39e5cd286352e62050884fc
    hash_after: 5c280431c4230b7ff39e5cd286352e62050884fc
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
  - step: retro/write
    hand: box 99aa60a14c3f
    hash_before: c3dc2e0150c084830bba5d8886b87d7b229d29d3
    hash_after: c3dc2e0150c084830bba5d8886b87d7b229d29d3
  - step: retro/cloud
    hand: box 99aa60a14c3f
    hash_before: f719505c0e947916212e65666680ab6538d49162
    hash_after: bed02c7400dfe1865437fd31feb0e2471fb05373
step: retro/cloud
reason: done
---

# Ask

On a box with no vehicle, the bridgehead clones the upstream repo `vehicle.json` names. It runs its RUNME, registers it and attaches the stub to it.

The design input [[spec/design_input/a-stub-takes-its-vehicle]] names this group, its proof and what it waits for. The funnel [[spec/funnel/a-button-makes-a-vehicle]] carries the owner's ask.

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

- [[spec/tickets/bridgehead-installs-upstream]], under the standard process, which stands minted on trunk and names this group

## checked

<!-- one line per item of the checklist -->

- The one child is the install road, its tests and its chapter. One reviewer reads its diff whole at the verdict.
- The child's ask carries every line of the brief. The cloud run stays for a person, and the retro names it under left.
- The child waits on no other ticket. The design input's two groups stand closed on trunk.

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

- bridgehead-installs-upstream: the install road in the stub's bridgehead, its tests and its chapter, closed done
- the bridgehead finds the vehicle on three roads, clones the upstream where none stands, and attaches through the vehicle's verb
- the vehicle verb reads `SE_WORK`, and `attach` writes the driver, the register entry, the pointer and the hook
- the road starts the vehicle's server where the port answers nothing, and hands one context block
- eight unit tests over a fake git and a fake disk, two over the attach, and one slow contract test
- the Vale config exempts the stub's hook from the door rule, and the vocabulary gains `json`
- four private notes become four tree tickets, each under the trivial process
- two reviewer hands read the draft, and one read the diff at the verdict

### well

<!-- what went well, and what made it go well -->

<!-- the form is list -->

- the first reviewer failed the draft on five findings, and the rewrite met every one. A second hand caught what the writer read past.
- the fakes behave: the fake clone writes the RUNME, and the fake attach writes the driver. So the hook's test reads real files back.
- the slow contract test caught the uncommitted verb at once, because it clones the tree's head and nothing else
- the write door names each break with its line, so a refused write costs one rewrite

### badly

<!-- what did not, each with its moment in the log or the transcript -->

<!-- the form is list -->

- the pull's commit met the privacy door and said nothing, at the tests-red and change hand-backs. Two leaves passed on one hash.
- the first review's reason landed in the record with a colon, at the first fail. Vale read no file of the ticket after it.
- the Ask as minted breaks the voice rules, and the door refused every write once Vale could read the ticket
- the stub's hook met the door rule on its clock, at the change lint. The switch-off comment reached no Vale rule.
- the pull hands the group's retro leaf out before the notes, at retro/notes. The box dropped the hold and tagged each note.
- the server answers nothing on this box, at session start. The box started one by hand for the check.

### improve

<!-- how each bad line stops happening, named by its home -->

<!-- the form is list -->

- the pull, `src/scripts/pull.js`: a refused commit answers refused, under [[spec/tickets/the-pull-says-refused-commit]]
- the record writer, `src/scripts/pull.js`: a reason with a colon takes quotes, under [[spec/tickets/the-record-quotes-its-why]]
- the open verb, `src/scripts/ticket.js`: the Ask meets the voice rules before it opens, under [[spec/tickets/ticket-open-lints-the-ask]]
- the Vale config: a hooks module folder takes its own section, which this branch adds
- the pull, `src/scripts/pull.js`: a private note goes out before the group's retro leaf, as the earlier retro already names
- the take, `src/scripts/work.js`: a cloud box starts its server, under [[spec/tickets/the-cloud-box-starts-serving]]

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->

<!-- the form is text -->

The thoughts circled two things longer than the actions show.

- the bridgehead's design: the stub verb wrote an import road, and the level zero chapter says the import fails. The design input's file table, written after that probe, names the one hook that posts to a server. So the road attaches through the vehicle's verb and imports nothing. The reviewer asked for that argument in the draft.
- the check: the whole tree lints red on lines the engine owns. So the box named the lint's paths and wrote the reason on the ticket. The engine's faults went into tickets of their own.

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->

<!-- the form is list -->

- a server behind the bridgehead at session start. The box ran `./RUNME.sh serve` by hand before the first check.
- a verb that decides a private note. The box dropped the group's hold, tagged each note, and pulled them one by one.
- a stub repo and a routine for it, so the cloud proof of the road stays for a person
- no tool, no host and no right stood in the way. The install of the clone ran under the proxy at the slow test.

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->

<!-- the form is list -->

- the write door on every ticket chapter and the vehicle chapter, each naming its line, and one rewrite each
- the ticket door on the Ask and the record, which the engine owns once the ticket opens
- the privacy hook on one fake home path, at the change leaf. The pull said nothing, and the box committed by hand after the fix.
- the door rule on the stub's hook, which a Vale section now exempts
- the sync took trunk in clean, and every test stayed green after it
- no trunk guard, no cap, and no test that fails on the box alone

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->

<!-- the form is list -->

- no person step stands parked, and the child closes done
- four tickets stand minted with no group, drafts under the trivial process, one a line below
- [[spec/tickets/the-cloud-box-starts-serving]]: the take starts the server on a cloud box
- [[spec/tickets/the-record-quotes-its-why]]: the record writer quotes a reason with a colon
- [[spec/tickets/the-pull-says-refused-commit]]: a refused commit answers refused
- [[spec/tickets/ticket-open-lints-the-ask]]: the open verb lints the Ask first
- the cloud proof of the road: one routine run against a stub repo, read off its log. It takes a stub repo, an environment with the trust setup, and a routine whose prompt is `./RUNME.sh branch take`.
- three findings of the verdict stay open. The stub plugin's two manifests describe the import road. The attach and serve failures carry no test. The hook reads the register under the home alone.
- this ticket is the handover. The improve list names six fixes, each by its home, for the owner to rule on.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

Nothing stands here yet.
