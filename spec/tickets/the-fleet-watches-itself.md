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
    checklist: ["every child is small enough to review whole, or is a group itself", "the children add up to the goal, and nothing of the goal stands outside them", "a child that waits on another names it under depends_on"]
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
process_hash: 5d4a884bfb2491ff
record:
  - step: sync
    hand: box 238560a34a48 · claude-code-remote
    hash_before: 981a99851912e128768b07ed4757be9ee64dec44
    hash_after: cb7bdbddcc0c13a6a0f254a5dc201b5f17954bdf
  - step: sync
    hand: box 238560a34a48 · claude-code-remote
    hash_before: 4380533f528f83e410b805e56310c66fff29cef3
    hash_after: 4380533f528f83e410b805e56310c66fff29cef3
    answered:
      - name: sync
        exit: 0
        said: work/the-fleet-watches-itself already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box 238560a34a48 · claude-code-remote
    hash_before: 39b545ea73c56411f6555e745457b92b0f9d4c14
    hash_after: 39b545ea73c56411f6555e745457b92b0f9d4c14
    inputs:
      - name: ask
        hash: 99540b9882270163
        size: 510
    def: cb8f90bc86fc7d39
  - step: children
    hand: the engine
    hash_before: d6d1f31348d0c455c105ea5c586d4ce2a3483b46
    hash_after: d6d1f31348d0c455c105ea5c586d4ce2a3483b46
  - step: accept
    hand: box 238560a34a48 · claude-code-remote
    hash_before: 886922f5354053e542161ccb7b41f4425ee2c4d2
    hash_after: 886922f5354053e542161ccb7b41f4425ee2c4d2
    answered:
      - name: sync/sync
        exit: 0
        said: work/the-fleet-watches-itself already carries every commit on main.
    inputs:
      - name: ask
        hash: 99540b9882270163
        size: 510
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
    def: 07c43ae7253713ec
  - step: accept
    hand: box 238560a34a48 · claude-code-remote
    hash_before: ac94537fa3f5988d4c491d9362f18ad4b9820d70
    hash_after: ac94537fa3f5988d4c491d9362f18ad4b9820d70
    answered:
      - name: sync/sync
        exit: 0
        said: work/the-fleet-watches-itself already carries every commit on main.
    inputs:
      - name: ask
        hash: 99540b9882270163
        size: 510
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box 238560a34a48 · claude-code-remote
    hash_before: e3e42957d018fe3c7c535d728a1e7e148ba31f86
    hash_after: e3e42957d018fe3c7c535d728a1e7e148ba31f86
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
  - step: retro/write
    hand: box 238560a34a48 · claude-code-remote
    hash_before: b4e4bb5f3e1f1342c1ee3164fea1ec53ed04531e
    hash_after: b4e4bb5f3e1f1342c1ee3164fea1ec53ed04531e
    inputs:
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: retro/notes
        hash: 310d2ddd3fe31ac9
        size: 36
    def: 1246a42e29e7ae98
  - step: retro/cloud
    hand: box 238560a34a48 · claude-code-remote
    hash_before: 0240041cccfe641e09a20443bee52ac78b918198
    hash_after: 0240041cccfe641e09a20443bee52ac78b918198
    inputs:
      - name: retro/write
        hash: efa423c4d4866fe7
        size: 3466
    def: 4da1ca5da87d5bbc
step: retro/cloud
reason: done
---

# Ask

The fleet watches itself, so the coordinator stops building its view by hand. One verb lists every box, the ones the dispatch fires among them, with its branch tip, hold age, pull request and final record, and a box that stalls wakes the coordinator at once. One stored routine checks the fleet on a schedule, a pull request event wakes the box that drives it, and every box prompt comes from the route and the ticket rather than from a typed copy.

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

- [[spec/tickets/boxes-write-their-final-record]], standard
- [[spec/tickets/the-fleet-verb-watches-boxes]], standard
- [[spec/tickets/one-routine-checks-the-fleet]], standard
- [[spec/tickets/a-verb-writes-box-prompts]], standard
- [[spec/tickets/size-misses-held-and-branch]], trivial
- [[spec/tickets/prompt-flags-follow-prompt-verb]], trivial
- [[spec/tickets/fleet-prompt-awaits-fleet-verb]], trivial
- [[spec/tickets/pr-events-reach-their-box]], trivial

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- Each standard child touches a handful of files in src/branches, and each trivial child one line or one field, so each reviews whole.
- The four standard children cover the four clauses of the ask: the final record, the fleet verb, the routine with the pull request route, and the prompt verb. The trivial children are the gates' fixes.
- one-routine-checks-the-fleet names the-fleet-verb-watches-boxes under depends_on, since its prompt runs the fleet verb.

# children

# accept

<!-- reads the diff since its last verdict against the goal and every prose criterion, and names what falls short as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept
- The diff since the last verdict prints each box's model, cost and final line, which answers the one point. Every clause of the ask now stands: the fleet verb with tip, age, pull request and final record, the wake, the routine with its stored prompt waiting on the owner's ticket, the box's own pull request subscription, and the prompt verb.

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

- boxes-write-their-final-record: branch done writes the model, the cost and the final line into the record
- a-verb-writes-box-prompts: one verb writes a box prompt off the route and the ticket
- the-fleet-verb-watches-boxes: the fleet verb lists every box, the dispatch's among them, with tip, hold age, pull request and final record, and exits red on a stall
- one-routine-checks-the-fleet: the fleet routine stands in the route, and a pull request event reaches the box holding its branch
- size-misses-held-and-branch, prompt-flags-follow-prompt-verb, fleet-prompt-awaits-fleet-verb, pr-events-reach-their-box, fleet-rows-print-final-record: the findings the gates and accept minted, closed inside the group
- the-fleet-routine-stands: left loose on main for the owner, since a box stores no routine

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

- every child passed gate on the first round, because each design drafted its red tests before the change
- the accept step caught the missing final record in the fleet rows and the group closed it before done
- the handover carried the work across two context clears with no step lost

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->
<!-- the form is list -->

- 16:27 the dispatch prompt 'run the work skill' opened the run; the first calls named no ticket or a ticket that stood on main alone, and the door refused them
- 16:28 a git merge and 16:33 a git push to main met the trunk guard; branch open needs main, so the group commit went up through switch and push and the box took the branch by name
- 16:33 to 16:58 the plan grace ran out on several calls, since a call carried no plan answer
- 16:46 the stop hook fed back twice, since the turn tried to end while helpers ran
- 16:59 a probe clone under the scratchpad met ShellWritesNothing
- 17:13 the handover write broke its schema at the first try
- 17:17 the MCP pull tool answered once, then lost its tool.call hook, and the CLI ran the same verb
- 17:32 a chained test and pull command met LandingFollowsItsGate
- 17:36, 18:15, 18:22 a pass that closed a ticket left it as the plan's working item, so the next write named it and the door refused
- 18:00 the person ticket the-fleet-routine-stands failed its do back, because a box stores no routine

### improve

<!-- how each bad line stops happening, named by its home -->
<!-- the form is list -->

- src/pull: a pass that closes the working ticket clears the plan's working item in the same call
- the level0 plugin's tool registry: index_ticket_pull keeps its tool.call hook across a reload, with a test that calls it twice
- src/branches: branch open on a cloud box pushes to the work branch alone and reads the group off its own tip, so it needs no write to main
- the work skill: its first step names the plan call and the ticket a description carries, so the first calls meet the door clean

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The thoughts kept weighing whether a refusal was a fault of the tree or of the hand. Most refusals named a ticket out of hand after a close, which reads as one defect in the pull rather than many slips. The thoughts also took the dispatch's fire as the ask's acceptance, a call the merge hand judges.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- single place: each improve line names the home that owns the fix, and no fact repeats a note
- numbers: the chapter adds no number but the times the badly list owes
- headers: the change writes no file header
- prompts and errors: the badly list carries the dispatch prompt, the stop hook feedback and each refusal, each with its time off the transcript
- role: the chapter names the box and the owner by role, with no name, address or path

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->
<!-- the form is list -->

- 18:00 the right to store a routine: a box holds no claude.ai routine store, so the-fleet-routine-stands waits for a person
- no tool, host or install went missing in this run

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->
<!-- the form is list -->

- 16:28 and 16:33 the trunk guard refused a merge and a push to main, and the group commit went up as the work branch
- 17:17 the MCP pull tool lost its tool.call hook, and the CLI ran the verb
- 16:46 the stop hook fed back twice while helpers ran
- 17:13 and 18:23 the context cap cleared the conversation, and the handover carried the work
- no conflict at sync, and no test failed on the box alone

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->
<!-- the form is list -->

- the-fleet-routine-stands: a person ticket on main with no group, at do, for the owner to store the fleet routine
- the handover says every child stands closed and the branch waits on done, the pull request and its subscription

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
