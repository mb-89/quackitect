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
    does: reads the standing children, and mints more where the goal needs them, each naming this group
    from: anyone
    by: anyone
    input: ask
    checklist: ["every child is small enough to review whole, or is a group itself", "the children add up to the goal, and nothing of the goal stands outside them", "a child that waits on another names it under depends_on", "each child names what it reads from its siblings, and the children land in that order", "a group whose diff grows past one review splits into a group of its own before it grows further"]
    evidence:
      - name: children
        form: list
        says: every child as a link, one a line, with its process
  - name: children
    by: children
    on_fail: split
  - name: accept
    gate: does the work of every child add up to the goal, and does every command of the route pass
    final: true
    does: reads the diff since its last verdict against the goal and every prose criterion, and names what falls short as points
    tags: ["review", "accept"]
    input: ["ask", "children"]
    evidence:
      - name: verdict
        form: verdict
        says: accept, accept with points naming a fix ticket a line, or reject with findings one a line
  - name: retro
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
        checklist: ["every fact the change adds stands in one place, and a note points at the file instead of repeating it", "every number the change adds carries a name in one place, and a copy a technical reason forces says so beside it", "every header the change writes says what its file is for, and counts nothing", "the chapter carries the run's owner prompts and errors off the transcript, each with its time", "the chapter says the role, and carries no name, address or path of the box"]
        evidence:
          - name: done
            form: list
            says: what was done, one line a ticket or a thing
          - name: well
            form: list
            says: what went well, and what made it go well
          - name: badly
            form: list
            says: what did not go well, each error of the run and each owner prompt turning it, with its time
          - name: improve
            form: list
            home: true
            says: how each bad line stops happening, each line naming its home as a link, a ticket in backticks or a path in backticks
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
process_hash: d9f9539fef3ec913
record:
  - step: sync
    hand: box 8c9d6ebe7819 · claude-code-remote
    hash_before: f45a0f1103d78c68fa054d0ab093dd2ce3e605a1
    hash_after: 9a9c79d348105d143f6c860291a407269d8a44f9
  - step: sync
    hand: box 2e87e70adc83 · claude-code-remote
    hash_before: 9a9c79d348105d143f6c860291a407269d8a44f9
  - step: sync
    hand: box 2e87e70adc83 · claude-code-remote
    hash_before: f0745c4a5de04f8a02d0f6d1c8fec9172c82389a
    hash_after: aac471454570dcc57cd0f3a7ecb46938c2ecf80b
    answered:
      - name: sync
        exit: 0
        said: work/retro-and-coordinator already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box 2e87e70adc83 · claude-code-remote
    hash_before: f32161270b84929a8e96b314a6f770e3bc41c5e6
    hash_after: f32161270b84929a8e96b314a6f770e3bc41c5e6
    inputs:
      - name: ask
        hash: 901e8175f30a8f12
        size: 458
    def: 19b6849b1f151cd5
  - step: children
    hand: the engine
    hash_before: 365015cdc1e3ee7b66a322a64fee291a7ecf37e4
    hash_after: 365015cdc1e3ee7b66a322a64fee291a7ecf37e4
  - step: accept
    hand: box 2e87e70adc83 · claude-code-remote
    hash_before: ac722d59c976c495f8113d919f861e6baff0f947
    hash_after: 33d00afa7e8199fa9f94116e598276045df8e93a
    answered:
      - name: sync/sync
        exit: 0
        said: work/retro-and-coordinator already carries every commit on main.
    inputs:
      - name: ask
        hash: 901e8175f30a8f12
        size: 458
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box 2e87e70adc83 · claude-code-remote
    hash_before: 852ed49bc9c5291a74c5f7fdc61954d2766a98a4
    hash_after: 852ed49bc9c5291a74c5f7fdc61954d2766a98a4
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
  - step: retro/write
    hand: box 2e87e70adc83 · claude-code-remote
    hash_before: 703a63ca95e81c8b32f7a990559c15c99fd5de90
    hash_after: 703a63ca95e81c8b32f7a990559c15c99fd5de90
    inputs:
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: retro/notes
        hash: 310d2ddd3fe31ac9
        size: 36
    def: e7ed0badf886b5b5
  - step: retro/cloud
    hand: box 2e87e70adc83 · claude-code-remote
    hash_before: d81b9e7596281d039c69ec9dffb808f924043ef0
    hash_after: d81b9e7596281d039c69ec9dffb808f924043ef0
    inputs:
      - name: retro/write
        hash: b8d2bf37f6ca4f64
        size: 4289
    def: 4da1ca5da87d5bbc
step: retro/cloud
reason: done
---

# Ask

The retro reads every record a run leaves and keeps what each trial and improve line finds, and the coordinator works under the same notes and doors as every box.

Rules on the way land with them: a split orders its children by what each reads, a defect fix first shows the fault, accept names the files nothing reaches, and a red check names each failing case where the dispatch sees it at once.

Done when every child closes and `./RUNME.sh check` exits 0.

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

- [[spec/tickets/a-defect-reproduces-before-fixing]], trivial
- [[spec/tickets/accept-runs-the-orphan-scan]], standard
- [[spec/tickets/ci-reds-name-their-cases]], standard
- [[spec/tickets/improve-lines-name-their-home]], standard
- [[spec/tickets/retro-audit-reads-the-decision]], standard
- [[spec/tickets/retro-read-reads-every-record]], standard
- [[spec/tickets/splits-name-what-siblings-read]], trivial
- [[spec/tickets/the-coordinator-guidance-stands]], trivial
- [[spec/tickets/the-coordinator-runs-under-level0]], standard

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each child holds one rule or one verb change, small enough to review whole
- the children cover each line of the goal: the retro reads, the trial decisions, the improve homes, the coordinator note and doors, and the four rules on the way
- no child waits on another, so none names depends_on
- the children read nothing from each other, and the coordinator note lands before the start road child that adds rule 8 to it
- the diff stays one review, so the group keeps one level

# children

# accept

<!-- reads the diff since its last verdict against the goal and every prose criterion, and names what falls short as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept
- the live check of the start refusal stands open as the person trial start-refusal-stops-trial, loose on main, since no box holds a client key

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

- `accept-runs-the-orphan-scan`: branch review names each Go file the group adds that nothing reaches, on both review roads
- `ci-reds-name-their-cases`: a red check ends on its red cases with file and line, and the dispatch fires a worker at a red work pull request at done
- `improve-lines-name-their-home`: the hand-back refuses an improve line naming no path, link or ticket, in Go and in the JavaScript road
- `retro-audit-reads-the-decision`: retro audit names a closed trial with no decision and no successor
- `retro-read-reads-every-record`: retro read lists queued owner prompts and quiet refusals, and retro effect finds the last retro in spec/retros
- `splits-name-what-siblings-read`: the split and draft checklists ask for sibling reads, an early split and the default files of a new key
- `the-coordinator-guidance-stands`: the coordinator note and its rationale stand
- `the-coordinator-runs-under-level0`: a desk session with no plugin meets a start refusal, and voice measure fails an answer past the ceiling
- `start-refusal-stops-trial`: a person trial, loose on main, for the one claim no box can check

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

- the box took over a stale hold by the take verb once the stale bar passed, and lost no commit of the box before it
- read-only gate reviews ran in parallel while the hold went stale, so every gate verdict stood ready at the take
- the new red-case line of the check named its own first fault, a test missing t.Parallel, at the first red run
- each helper carried the pitfalls the leaf before it met, so the same door refused nothing twice

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->
<!-- the form is list -->

- 17:53 UTC: the Bash door refused every command until a ticket stood in hand, and the group ticket stood on the remote branch alone
- 17:53 UTC: the branch take MCP tool answered no handler, and the Bash road served instead
- 17:55 UTC: the stop hook refused a turn end while helpers ran, since a cloud box that ends its turn stops its container
- 18:21 UTC: the index MCP road refused a connection mid-run, and the Bash pull served instead
- 18:22 UTC: the commit door refused a log-line change with no test beside it, and the change left the diff
- 18:25 UTC: the check failed once on the index contract case and once on the dry probe, each passing alone, cause unknown
- 18:30 UTC: a bare self-pointer in a design note failed the pointer rule and the twins golden
- 19:20 UTC: the mint wrote a guidance env as an inline list, which the shape rule refuses
- 19:37 UTC: the privacy door refused a made-up home path in a test
- 20:05 UTC: deciding a private note while the group stood in hand took four refused pulls before the helper road showed
- no owner prompt reached the run past the opening one

### improve

<!-- how each bad line stops happening, named by its home -->
<!-- the form is list -->

- the Bash door admits a branch read on a cloud box before the take, in `src/modules/hooks/command/ticket.go`
- the branch take tool gets its handler, in `src/modules/verbs`
- the index contract case and the dry probe count only the se-index processes they start, in `test/contract/index.test.js`
- the red fire takes a done branch into work before the worker fixes it, so the hourly dispatch fires once, in `src/branches/dispatch_fire.go`
- the mint writes a guidance env as a block list, in `src/quack`
- the notes leaf names the helper road for a note, the plan entry and a fresh hand, in `spec/design_output/pull.md`
- a self-pointer in a design note takes the full path, which the write door can name at the write, in `src/modules/hooks/write`

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The run spent its first half hour waiting on a stale hold, and the waiting paid off only because the reviews ran inside it. The doors refused often, and each refusal named its own fix, so the cost sat in round trips and not in wrong work. The one claim the run could not settle, whether the client stops a session at its start, rests on a client key no box holds, and the trial ticket hands it to the owner.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every fact stands in its ticket or design note, and the retro points at the tickets
- the retro adds no number past the times of its errors
- the retro writes no file header
- the badly list carries each error of the run with its time, and the run met no owner prompt past the opening one
- the retro names the role and the box by its role, and no name, address or path of the box

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->
<!-- the form is list -->

- a client key for the claude probe, at accept, so the start refusal stays unchecked on a live client
- a handler behind the branch take MCP tool, at the take
- the index MCP road for a span mid-run, at the first change hand-back

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->
<!-- the form is list -->

- a conflict at sync in the work skill file, where main added a subscribe step beside the red-fire step, and both stand
- the commit door, refusing code with no test beside it and a home path naming a person
- the stop hook, refusing a turn end while helpers ran
- the index contract case and the dry probe, each failing once inside the check and passing alone

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->
<!-- the form is list -->

- `start-refusal-stops-trial`, a person trial loose on main, which carries the commands the owner runs on a desk
- no ticket minted with no group past that trial
- no handover, since the group ends at done and the pull request carries the rest

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
