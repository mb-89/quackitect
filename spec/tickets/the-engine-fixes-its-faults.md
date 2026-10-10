---
kind: [[ticket]]
state: open
reason: done
step: retro/cloud
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
  - step: split
    hand: box 6150d1759159 · claude-code-remote
    hash_before: 5b38728f5f1a8e41b94a4aadc521cfa8e46ab464
    hash_after: 0aac77679dcda0eed612be46ba3a6b885ade5e16
    inputs:
      - name: ask
        hash: 3827a3cc3d458ead
        size: 295
    def: 19b6849b1f151cd5
  - step: children
    hand: the engine
    hash_before: 5eef749b59194e8381c2a321978b73c9cb8b82e7
    hash_after: 5eef749b59194e8381c2a321978b73c9cb8b82e7
  - step: accept
    hand: box 6150d1759159 · claude-code-remote
    hash_before: 9b7a2cbc90120d2eadf0113130e70e773c78b196
    hash_after: 9b7a2cbc90120d2eadf0113130e70e773c78b196
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
    hand: box 6150d1759159 · claude-code-remote
    hash_before: 5f4afebf01eea313cab0125107c09cf597b588a3
    hash_after: 5f4afebf01eea313cab0125107c09cf597b588a3
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
  - step: retro/write
    hand: box 6150d1759159 · claude-code-remote
    hash_before: 9212d3ba17f6a591a6b2fd972125d656385045bd
    hash_after: 9212d3ba17f6a591a6b2fd972125d656385045bd
    inputs:
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: retro/notes
        hash: cd64de0d4d23e2c7
        size: 40
    def: e7ed0badf886b5b5
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

- [[spec/tickets/answer-rules-read-one-file]], trivial
- [[spec/tickets/replayed-red-leaf-reads-green]], trivial
- [[spec/tickets/command-fields-take-their-indent]], standard
- [[spec/tickets/failed-evidence-keeps-its-output]], standard
- [[spec/tickets/gate-findings-reach-the-queue]], standard
- the children of the first run stand closed

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each child is one change in one or two Go files a review reads whole
- the reopened goal is these five faults, each read against the Go code, and every one meets a child
- no child waits on another, since each touches its own function
- no child reads a sibling's output, so they land in any order
- the diff stays one review: five small changes and the reopen road

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

- `command-fields-take-their-indent` closes done: a hand-back writes a command field indented, so the commit hook reads its tests
- `failed-evidence-keeps-its-output` closes done: a red command's refusal names the session log and each failing Go case
- `gate-findings-reach-the-queue` closes done: a reject at a group's accept mints its rows as children and waits at children, and a nameless row refuses
- `reject-rows-reach-rejected` and `nameless-reject-meets-a-case` close became onto `gate-findings-reach-the-queue`, which built both
- the group passes accept, and the four private notes close

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

- a helper read each gate, so every gate kept a hand other than the draft's
- the new refusal of `failed-evidence-keeps-its-output` named its own failing case the first time the check met it
- the command line ran the pull in the same turn, where the MCP pull answered a turn later

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->
<!-- the form is list -->

- 19:45: the MCP pull failed twice with the index restarts on a tests-green hand-back, and the command line landed it
- 19:50: a tests field naming a go test run refused, because its last line read ok and cached in place of green
- 20:05 to 20:18: the helper pulls met wait and pull-queue-binds, because the plan still named a closed ticket. The plan field riding a report call left the plan file unchanged
- 20:25: the check refused an import of the log module from the hooks module, since a module imports no module
- 20:27 to 20:40: the closing commit refused a hooks file, because the hook drops the tests a closed ticket carries
- 19:42: the stop claimed the helpers still ran, and the hook refused it, since a cloud turn that ends stops its helpers

### improve

<!-- how each bad line stops happening, named by its home -->
<!-- the form is list -->

- the spawn sets the plan to the ticket it hands, in `src/pull/pull_hand.go`, so a helper pull binds there
- the hook reads the tests of the ticket the commit closes, in `src/modules/hooks/command/ticket.go`
- a case edits a draft past implement/change and reads the walk keep design/tests-red, in `src/pull/pull_kept_test.go`
- a tests field names the tests-red command, as the engine reads green off the test verb, per `spec/processes/standard.md`

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The gates cost the most time, and none of it on review. Each helper verdict came back accept within minutes, and the wait sat in binding the helper to the ticket. A spawn that sets the plan itself removes that wait.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each fact points at the file owning it
- the retro adds no number to the tree
- the retro writes no file header
- the chapter carries the errors with their times, and the session saw no owner prompt past the clear
- the chapter names roles, and no box or person

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

The owner reopens the group for five drafts written before the JavaScript left. The route runs this way:

- `./RUNME.sh branch open` commits a marker on `main` and pushes it, and refuses a closed group, so the box cuts `work/the-engine-fixes-its-faults` off `main` by hand, as the branches of `#138` and `#140` did
- the old remote branch sits inside `main`, so the fresh branch reaches it as a fast-forward
- `--back` answers the hand behind a leaf alone, and the engine passes `children`, so no hand reopens the group
- `engine-leaves-take-back` lets the hand on the group branch take back the engine's leaf, and the group reopens at `children`
