---
kind: [[ticket]]
state: closed
urgent: true
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
    hand: box 36d4a566c587
    hash_before: f404ac8bd5b48bd57f074eec2ec3a84ed88d7203
  - step: sync
    hand: box 36d4a566c587
    hash_before: da84f29ac90fa5302046ad42b46c16defb6485ab
    hash_after: da84f29ac90fa5302046ad42b46c16defb6485ab
    answered:
      - name: sync
        exit: 0
        said: work/the-stub-takes-shape already carries every commit on main.
  - step: split
    hand: box 36d4a566c587
    hash_before: 6054740320208c5ef5f2c86a1197a7d0462973b8
    hash_after: 6054740320208c5ef5f2c86a1197a7d0462973b8
  - step: children
    hand: the engine
    hash_before: 3140683cc7b50d384e620f4dd81ecae9ae91564b
    hash_after: 3140683cc7b50d384e620f4dd81ecae9ae91564b
  - step: retro/notes
    hand: box 36d4a566c587
    hash_before: 6d6d1cfcd89dc25d917f9144e8b5e098dcbd4519
    hash_after: 6d6d1cfcd89dc25d917f9144e8b5e098dcbd4519
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
  - step: retro/write
    hand: box 36d4a566c587
    hash_before: 158614f408d6d4fade7e8f259ec21ab6a537a777
    hash_after: 158614f408d6d4fade7e8f259ec21ab6a537a777
  - step: retro/cloud
    hand: box 36d4a566c587
    hash_before: 63b861cecfb94d79bfd205b8d95953e8a7f42cc2
    hash_after: 1534f60ff4d775254ef03981794f210d434ac0a9
step: retro/cloud
reason: done
---

# Ask

One verb writes a stub: `./RUNME.sh stub into <folder>` lays down the project folders, `vehicle.json`, the RUNME shim, the cage's settings and the bridgehead plugin folder.

The design input [[spec/design_input/a-stub-takes-its-vehicle]] names this group, its proof and what it waits for. The design output [[spec/design_output/vehicle]] carries what stands built.

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

- [[spec/tickets/stub-takes-shape]], under the standard process

## checked

- the one child is the verb, its proof and its chapter. One reviewer reads its diff whole at the verdict.
- the child's ask carries every line of the brief. The design input hands the shim and the import to later groups.
- the child waits on no other ticket, and the design input says this group waits for nothing

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

- stub-takes-shape: the verb `stub into` writes a stub out of the vehicle it runs in, and closes done
- the pure vehicle module names the stub's files, reads the brand off the folder and builds the record
- the verb refuses a vehicle with no remote unless `--upstream` names one
- the template under `src/stub` carries the shim and the bridgehead plugin, copied as they stand
- a unit test file drives the fakes, and a contract test walks a real stub and drives the command line
- the vehicle design output carries the chapter, and every new function points at it
- a reviewer hand read the approach, and a second one read every hunk at the verdict
- the one private note closed under the retro, through the todo tag and a hand named retro

### well

<!-- what went well, and what made it go well -->

<!-- the form is list -->

- the fakes carry every case of the verb, and the contract test drives the real disk and git beside them
- the write door names each break with its line, so a refused write costs one rewrite
- the pull spawns the hands the route excludes the box from, and each answers in one round
- the contract case on the command line caught a dropped argument the unit tests read past

### badly

<!-- what did not, each with its moment in the log or the transcript -->

<!-- the form is list -->

Five things cost a round each, and the judge's silence cost the most. Each has its fix under improve.

- the judge refuses the draft four times, names no rule, and the log holds no line of its reading
- the first bridgehead reaches disk through `node:` imports, which the hooks environment lacks. The lint names it.
- the draft chapter lands before the design output chapter it links, so the reviewer reads a link to nothing
- the retro verb counts notes and closes none, so the box finds the todo road by reading the pull
- the pull as a hand named retro takes the group's leaf first, and the box drops that hold by hand

### improve

<!-- how each bad line stops happening, named by its home -->

<!-- the form is list -->

- the judge, level one: reads the step's rules and leaves the answer rules off the evidence, and logs its reading
- the plugin authoring skill, the guidance: a hooks module reaches everything through the engine interface
- the standard route, the process file: the draft step writes the design output chapter it links
- the retro verb, level one: a decide verb closes a note, with no todo tag and no second hand
- the pull, level one: a hand named by a step's `by` takes that step before the group's leaf

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->

<!-- the form is text -->

The box takes the shell hand-back past the judge, and gives the bridgehead its plainest shape. Both are choices the record shows as facts alone.

- the shell hand-back: the tool road refuses four times with no reason, and one more refusal parks a person step. The pull's own answer names the shell road, so the box takes it and parks the doubt.
- the bridgehead's shape: the design input says the import stands unproven, so the module carries the plainest form. The chapter says which group proves it.

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->

<!-- the form is list -->

- a judge that names the rule it refuses on. The log holds the pull's tool line and no reading of the draft.
- a verb that closes a private note. The box tags the note todo and pulls it as a hand named retro.
- a live client to load the bridgehead into, so the import at session start stays a later group's proof
- no tool, no host, no right and no install stood in the way

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->

<!-- the form is list -->

- the judge on the draft, four times, and the fifth refusal stood one short of the cap
- the write door on the design output chapter, the ticket chapters and the retro, each naming its line
- the ticket door on the note's state field, which the verbs hold
- the pull's hold on the note while the group stood in hand, and the todo tag went around it
- no trunk guard, no conflict at sync, no hook fault, and no test that fails on the box alone

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->

<!-- the form is list -->

- no person step stands parked, and the child closes done
- no ticket stands minted with no group
- this ticket is the handover. The improve list names five fixes, each by its home, for the owner to rule on.
- the shim's register road and the bridgehead's import wait on the two groups the design input names

# Discussion

The one child carries the verb, its proof and the chapter. The shim's register road and the bridgehead's import each belong to a group of their own, which the design input names.
