---
kind: [[ticket]]
state: open
reason: done
step: split
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
    hand: box d7e124b659cd · claude-code-remote
    hash_before: ab9633621116bdc4607ae0484b988047021615ab
    hash_after: a6828f7ed75c3b363e889a4e580e810a1c3826b1
  - step: sync
    hand: box d7e2385398cd · claude-code-remote
    hash_before: 469985e4e6e89b85e545bc0479617222c0afb143
    hash_after: ecce313ea77f77745060f8b03174ac52cdca7765
  - step: sync
    hand: box d7e2385398cd · claude-code-remote
    hash_before: ff04e84d71b1e5845bbdab14618f9a6ad2c5f792
    hash_after: ff04e84d71b1e5845bbdab14618f9a6ad2c5f792
    answered:
      - name: sync
        exit: 0
        said: work/the-engine-fixes-its-faults already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box d7e2385398cd · claude-code-remote
    hash_before: f7555284792e611f5daccc1403294db32558656a
    hash_after: f7555284792e611f5daccc1403294db32558656a
    inputs:
      - name: ask
        hash: 3827a3cc3d458ead
        size: 295
    def: cb8f90bc86fc7d39
  - step: children
    hand: the engine
    hash_before: b18c4bf11847b958951b423bf990a05669cfe4d6
    hash_after: b18c4bf11847b958951b423bf990a05669cfe4d6
  - step: accept
    hand: box d7e2385398cd · claude-code-remote
    hash_before: 6d4f462e92acba9ab1c1b745a730963eeb81ae30
    hash_after: 6d4f462e92acba9ab1c1b745a730963eeb81ae30
    answered:
      - name: sync/sync
        exit: 0
        said: work/the-engine-fixes-its-faults already carries every commit on main.
    inputs:
      - name: ask
        hash: 3827a3cc3d458ead
        size: 295
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box d7e2385398cd · claude-code-remote
    hash_before: 3cab481e32b02ad2f187143bf7958733bc134501
    hash_after: c74222d311ca962a62133c85821ac0fde7bf9ff6
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
  - step: retro/write
    hand: box d7e2385398cd · claude-code-remote
    hash_before: 4b4c962d1d59ae48bb4fc73c94d7d959ffeae344
    hash_after: 4b4c962d1d59ae48bb4fc73c94d7d959ffeae344
    inputs:
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: retro/notes
        hash: 310d2ddd3fe31ac9
        size: 36
    def: 1246a42e29e7ae98
  - step: retro/cloud
    hand: box d7e2385398cd · claude-code-remote
    hash_before: ae20021353c1f25ffb3df9db6d529c09f8498c37
    hash_after: ae20021353c1f25ffb3df9db6d529c09f8498c37
    inputs:
      - name: retro/write
        hash: 2d5e441b8968dccd
        size: 3237
    def: 4da1ca5da87d5bbc
  - step: children
    hand: box 6150d1759159 · claude-code-remote
    hash_before: ea6bbd599b16f8ca310e4c5e906d2880b5fc4d18
    hash_after: ea6bbd599b16f8ca310e4c5e906d2880b5fc4d18
    returns: 1
    why: the hand takes it back
---

# Ask

<!-- goal, as text: what these tickets add up to, for the hand that takes them -->

The engine guards `main` and keeps its own routes walking. A desk push lands with no engine running, and a cloud box leaves `main` to the desk. A ticket past its red tests reaches its end, and the badge and the work tab read one count.

Done when every child closes through the command it names.

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

- [[spec/tickets/a-rewind-spares-landed-tests]], standard
- [[spec/tickets/behind-read-reaches-past-ask]], trivial
- [[spec/tickets/box-keys-fold-drive-letters]], trivial
- [[spec/tickets/cloud-ask-names-the-hold]], trivial
- [[spec/tickets/cloud-boxes-ask-nobody]], standard
- [[spec/tickets/cloud-boxes-leave-trunk-alone]], standard
- [[spec/tickets/commit-skips-landed-moves]], trivial
- [[spec/tickets/kept-red-reads-red-list]], trivial
- [[spec/tickets/kept-red-subject-matches-whole]], trivial
- [[spec/tickets/one-writer-holds-a-branch]], standard
- [[spec/tickets/phase-two-carries-badge-lines]], trivial
- [[spec/tickets/prepush-reds-land-together]], trivial
- [[spec/tickets/push-gate-needs-the-engine]], standard
- [[spec/tickets/serve-probes-the-register-port]], trivial
- [[spec/tickets/sync-takes-its-own-branch]], standard
- [[spec/tickets/the-bridge-outlives-its-starter]], standard
- [[spec/tickets/the-queue-views-agree]], standard
- [[spec/tickets/the-reply-probe-runs]], question

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each child is one change a review reads whole
- the goal's parts each meet a child: the trunk guard, the desk push, the kept red leaf, and the one count. The desk trials stand as person questions such as a-desk-runs-probe-reply
- every child stands closed, so none waits on another

# children

# accept

<!-- reads the diff since its last verdict against the goal and every prose criterion, and names what falls short as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept

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

- a-rewind-spares-landed-tests: gate accepted with two points, then built. `keptRed` keeps a landed red leaf, and `stepOn` and `advanced` walk past it
- kept-red-subject-matches-whole and kept-red-reads-red-list: the whole-change subject match, and the red list read through `redListOf`
- cloud-boxes-ask-nobody and cloud-ask-names-the-hold: the cloud ask door, and the note naming it
- cloud-boxes-leave-trunk-alone, one-writer-holds-a-branch and push-gate-needs-the-engine: the three `holds` reads, landed together under prepush-reds-land-together
- sync-takes-its-own-branch: `branch sync` merges `origin/<the branch>` before trunk
- gate-points-pass-the-push: drafted off the retro note, for the owner to open

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

- every gate read the named functions and the git history before its verdict, so each draft's claims met the code before the build
- landing the three `holds` changes in one change let each `tests-green` pass on the shared red file
- the commit verb ran the check and pushed on every finished thing, so origin matched the box after each step

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->
<!-- the form is list -->

- 21:36 the plan tool answered that no server stood at the event port while the shell read 200 there. A second call passed with no change on this side
- 21:40, 21:52 and 22:03 the push door refused each gate hand-back, because the gate's points carry the todo tag
- 21:41 `./RUNME.sh commit -m` came back refused. The verb takes the message as its first argument
- 21:42 and 21:53 a ticket name under `working` in the plan turned into a todo, and the pull waited on it
- 21:45 `keptRed` read `leaf.leaves` off a bare walk entry and threw
- 21:44 the split verb moved `childrenSay` with no header and no imports, and the `pull.js` re-export broke `pull-steps`
- 21:45, 21:52 and 22:17 the Bash door refused a `git stash` and two chains whose landing followed a pipe
- 21:52 a doc-only trivial step found no green command: the check ends on another ticket's lint line, and `branch test` answers missing
- 22:03 three tickets held red cases in one test file, so no `tests-green` could pass alone

### improve

<!-- how each bad line stops happening, named by its home -->
<!-- the form is list -->

- the tagged gate points: gate-points-pass-the-push
- the plan tool's reach to the server: the bridge note in `spec/design_output/level0.md`, once a desk reproduces it
- the commit verb's usage: the refusal names the positional message
- a ticket name under `working`: the plan tool names a todo title, not a ticket
- the walk entry: `keptRed` reads the route order off the ticket text
- the split verb: it copies the imports and header a cut function needs
- the doc-only step: the trivial route names the owning test file
- the shared red file: a draft naming a test file another open ticket holds red names it under `depends_on`

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The pull hands gates and builds of one group to one box, so the builder reads the other tickets' drafts anyway. A shared red file turns that into one change. Each close still ran its own route, and the accept read the whole diff against the goal.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each fact stands in the file owning it, and the retro points there
- the retro adds no number
- the retro adds no file header
- no owner prompt came in this run, and each error carries its time
- the chapter names roles alone

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->
<!-- the form is list -->

- nothing the work needed: every tool stood installed, and no host or right came back refused
- 21:36 the level0 server stood down at session start, and `./RUNME.sh serve` brought it up

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->
<!-- the form is list -->

- the push door's todo refusal on each gate hand-back
- the Bash door's git write and landing rules
- the commit hook's test-beside-code rule, on a split module and a server wire
- the file ceiling on `pull-hand.js`
- no conflict at sync, since the branch already carried main

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->
<!-- the form is list -->

- gate-points-pass-the-push stands as a draft in no group, for the owner to open
- the desk trials in the group's Discussion stand as person question tickets, such as a-desk-runs-probe-reply
- the handover says the branch stands done, and the next session takes the next free branch

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

The owner moves every loose agent ticket into the cloud, so the group also carries two aims past its goal:

- the bridge on a desk outlives the editor and the shell that start it
- the bridge's last check asks the owner to close the editor and read `/health`
- the probe gains a `reply` run
- the probe's run on a desk with function hooks goes to the owner as a question
