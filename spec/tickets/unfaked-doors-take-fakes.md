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
group: tests-meet-the-doors-once
step: retro/cloud
record:
  - step: sync
    hand: box e97c7a20bbd2 · claude-code-remote
    hash_before: 64d2c1612bdafeef3c33ce29641b5eff5c448248
    hash_after: 7c10da94588f99740e350ccea4c6bf2394a364bd
    answered:
      - name: sync
        exit: 0
        said: work/tests-meet-the-doors-once took 20 commit(s) from main.
    def: 8a9850a81227554b
  - step: split
    hand: box e97c7a20bbd2 · claude-code-remote
    hash_before: dba685e0cb6568c83074770408f320007faa74a1
    hash_after: dba685e0cb6568c83074770408f320007faa74a1
    inputs:
      - name: ask
        hash: 5495474fd0152fe7
        size: 964
    def: cb8f90bc86fc7d39
  - step: children
    hand: the engine
    hash_before: 4b3376d5271c8019316b8f2e39eaea1e664df9ed
    hash_after: 4b3376d5271c8019316b8f2e39eaea1e664df9ed
  - step: accept
    hand: box e97c7a20bbd2 · claude-code-remote
    hash_before: a65e74b8f3d280b1afd96003b710bce080611c1f
    hash_after: 1b64f585f08ece59e7bd5754bea8b177e5fc879e
    answered:
      - name: sync/sync
        exit: 0
        said: work/tests-meet-the-doors-once took 51 commit(s) from main.
    inputs:
      - name: ask
        hash: 5495474fd0152fe7
        size: 964
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box e97c7a20bbd2 · claude-code-remote
    hash_before: 47d76293764c8f9ebf3439c35a2b2cfb6aa44375
    hash_after: 23e4f6ccefc2f85f8e81ddf79f8f6c1662692e80
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
  - step: retro/write
    hand: box e97c7a20bbd2 · claude-code-remote
    hash_before: 5d3cef502e7b31eefecd54646da521078785278c
    hash_after: 5d3cef502e7b31eefecd54646da521078785278c
    inputs:
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: retro/notes
        hash: 310d2ddd3fe31ac9
        size: 36
    def: 1246a42e29e7ae98
  - step: retro/cloud
    hand: box e97c7a20bbd2 · claude-code-remote
    hash_before: b4744d918a5b653e36973c48685829e3d9059d37
    hash_after: b4744d918a5b653e36973c48685829e3d9059d37
    inputs:
      - name: retro/write
        hash: 0a463b0335f6ff95
        size: 3899
    def: 4da1ca5da87d5bbc
reason: done
---

# Ask

<!-- goal, as text: what these tickets add up to, for the hand that takes them -->
The doors the door audit lists with no fake take one, so the tests reaching them run in memory. The git the branch verbs, the quack verbs and the pull run speaks the whole command line, pushes and merges among it, where `FakeGit` holds four reads. So a git door carrying writes, and a process door for quack, each take a fake and one contract suite running both ways. The cases in the rows of the family table for the branch verbs, the quack verbs over a repository, the quack verbs sleeping or spawning, and the pull move onto those fakes.

Done when a design output names the git door and the process door with their fakes and contract suites; each of those four rows of the family table in `spec/design_output/doors.md` names its cases as moved, or names the door test each keeps; the real-wait guard in `src/imports/clock.go` stands green with those rows narrowed; and `./RUNME.sh check` stands green, with its time measured before and after in the Discussion.

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

- [[spec/tickets/git-and-process-doors-designed]], standard, at its gate
- [[spec/tickets/pull-meets-fake-git]], standard, waits for the design
- [[spec/tickets/quack-repos-meet-fake-git]], standard, waits for the design
- [[spec/tickets/quack-spawns-meet-fake-process]], standard, waits for the design
- [[spec/tickets/branch-verbs-meet-fake-git]], standard, waits for the design

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each move reviews whole once the door it takes stands, and the branch verbs move, the widest, splits into a child group at its draft where one review cannot hold it
- the children add up to the goal: the design names both doors, and the four moves narrow the four rows
- each move names the design under depends_on, and the design builds the process door, which pull-meets-fake-git takes first

# children

# accept

<!-- reads the diff since its last verdict against the goal and every prose criterion, and names what falls short as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

pass
- the doors chapter names the git door with FakeRepo and the process door with FakeRunner, each beside its contract suite run on both
- the quack verbs row names its cases as moved onto the process door fake. The rows for the branch verbs, the quack verbs over a repository and the pull leave the table, and a guard in each package fails once one returns or a case spawns
- under src/quack, exec stands in the box and check doors alone, which checkdoors.go and boxdoors.go are
- the real-wait guard stands green with the rows narrowed, and the check stands green at 100.6 seconds against 122.7 before, which the Discussion carries

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

- quack-spawns-meet-fake-process: the node module child road and the voice verb Vale run through the process door, Command.Drop holds on the real runner, the index import case walks the shared packages load, and the family row re-files by what each file waits on
- quack-spawns-all-take-the-runner: the eight quack spawns left run through the process door, which gains Streams and Signalled with contract cases on both runners
- quack-waits-poll-on-a-fake-clock: the wait cases read an op end off its saved row, with no sleep
- quack-git-reads-take-door: the five quack git reads run through proc.Real, and a guard holds them there
- signalled-meets-notstarted-readers and spawn-stubs-match-the-draft: the gate points, decided and closed
- red-commands-log-their-output: a red command field logs its whole output, off the note check-red-once-unnamed
- the eight private notes decided: two done, one became, five dropped
- the check takes 100.6 seconds against 122.7 before the group
- scripts under .se/scripts: draft_spawns.py builds a draft fields JSON, decide_notes.py holds the note table, and decide_one.py tags, takes and hands back one note under a helper name

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

- the Over form beside a binding over proc.Real repeats one shape across ten spawns, so each case reads the same and each caller stays unchanged
- the gate helpers caught two real gaps, the git reads past the eight functions and the Signalled readers, because the gate reads the grep the ask names
- racing the wait cases three times under the race detector proved the saved-row wait before it landed

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->
<!-- the form is list -->

- 17:53 UTC: a contract row asserted a box variable the fake cannot hold, and the commit ran beside the failing suite, so 103044adf landed with the row red; 35c71ba2c took it back
- 18:04 UTC: the tests-green hand-back refused on the check, whose refusal quoted only its timing row; a rerun found a gofmt fault in twins.go
- 18:26 UTC: the Streams pointer on proc.Command broke vet over a %q format in src/modules/lsp/tools_test.go, and the check went red after the git reads commit landed
- 18:53 UTC: tests-red named its command as a raw go test, and the step reads the branch test verb alone, so the hand-back refused once
- 19:10 UTC: deciding the private notes cost many refused pulls, since the group leaf holds the hand and a note takes its own plan binding, a todo tag and a helper name
- the group grew from one ticket in hand to six closed and one minted, each follow-up the draft or gate named joining the group

### improve

<!-- how each bad line stops happening, named by its home -->
<!-- the form is list -->

- a commit beside its gate: LandingFollowsItsGate already refuses a chain; run every suite alone before ./RUNME.sh commit, as the shell door asks
- the hidden red: red-commands-log-their-output, landed in this group
- a field added to a struct others print: run go vet ./... before the commit, which the check runs, so the change and its fallout land together
- the tests command form: the tests-red field names ./RUNME.sh branch test, which spec/processes/standard.yaml owns
- deciding notes: the handover names the road, the plan working the note, ticket todo, then the pull under a fresh helper name

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The draft of each follow-up named work past its own ask, and every name it spoke became a ticket the group had to close. Naming fewer things in a draft keeps a group its size. The fake and real runner agree on Streams only where a writer is a Go value, so the viewer still meets the real terminal alone.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each fact points at its ticket or file, and the check time stands in the group Discussion alone
- the numbers are the check times, which the Discussion holds, and the commit hashes the badly lines cite
- the retro writes no file header
- the badly lines carry each error with its time off the undo journal, and no owner prompt arrived in the window
- the chapter says the agent and the helpers, and names no box path

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->
<!-- the form is list -->

- none: every tool the box survey names answered, and no host or right was refused in this window

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->
<!-- the form is list -->

- the commit door refused code with no test beside it twice, at 17:53 and 18:49 UTC, and a contract row answered each
- LandingFollowsItsGate refused a ticket pull or commit chained after another command four times, and each ran alone after
- the engine refused calls until the plan answered its three questions, several times
- no conflict at sync and no test failing on this box alone

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->
<!-- the form is list -->

- no person step parked, and no ticket minted with no group
- the handover names the branch at done and the pull request against main with auto-merge on

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

The check time, as `./RUNME.sh check` prints it in all:

| when | seconds |
|---|---|
| before the group | 122.7 |
| after quack-waits-poll-on-a-fake-clock closes | 100.6 |
