---
kind: [[ticket]]
state: open
step: accept
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
    hand: box 57a5a484096e · claude-code-remote
    hash_before: 590a6a06f568a18650b52557879cacc6491b7aeb
  - step: sync
    hand: box 57a5a484096e · claude-code-remote
    hash_before: ef294dd556428914875cf733e7ff3004a2b0ba4e
    hash_after: 8316b1b9e5d706ea51dcb87b6523ba48048345cc
    answered:
      - name: sync
        exit: 0
        said: work/engine-verbs-hold took 2 commit(s) from main.
    def: 8a9850a81227554b
  - step: split
    hand: box 57a5a484096e · claude-code-remote
    hash_before: ea5d1445cca91b590f5096ce1ffb609c9a220e36
    hash_after: ea5d1445cca91b590f5096ce1ffb609c9a220e36
    inputs:
      - name: ask
        hash: c8bde0276841d2e6
        size: 661
    def: 19b6849b1f151cd5
  - step: children
    hand: the engine
    hash_before: 178d4a89409be22aad0ee925e4fd6b07412cbf26
    hash_after: 178d4a89409be22aad0ee925e4fd6b07412cbf26
  - step: accept
    hand: box 57a5a484096e · claude-code-remote
    hash_before: 7c8671449574184c4395638b76676d8659efbe69
    hash_after: 7c8671449574184c4395638b76676d8659efbe69
    answered:
      - name: sync/sync
        exit: 0
        said: work/engine-verbs-hold already carries every commit on main.
    inputs:
      - name: ask
        hash: c8bde0276841d2e6
        size: 661
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
    def: 07c43ae7253713ec
  - step: accept
    hand: box 57a5a484096e · claude-code-remote
    hash_before: 86232817d1c39b3f676d641b6a06d58b5cebd165
    hash_after: bb54f2fe39da8270397575fa4220901bfba9f73e
    answered:
      - name: sync/sync
        exit: 0
        said: work/engine-verbs-hold took 2 commit(s) from main.
    inputs:
      - name: ask
        hash: c8bde0276841d2e6
        size: 661
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box 57a5a484096e · claude-code-remote
    hash_before: 8e2b044cbb9e24e13e57f10d27f77f3eafe9ebe5
    hash_after: 8e2b044cbb9e24e13e57f10d27f77f3eafe9ebe5
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
  - step: retro/write
    hand: box 57a5a484096e · claude-code-remote
    hash_before: a6bb278b79201a2d6dcaae8e4ad36fd999abe7c7
    hash_after: a6bb278b79201a2d6dcaae8e4ad36fd999abe7c7
    inputs:
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: retro/notes
        hash: 310d2ddd3fe31ac9
        size: 36
    def: e7ed0badf886b5b5
  - step: retro/cloud
    hand: box 57a5a484096e · claude-code-remote
    hash_before: 609f36d49a566f075343007d278d1ca23812fcf9
    hash_after: 609f36d49a566f075343007d278d1ca23812fcf9
    inputs:
      - name: retro/write
        hash: 009e1d116c57637b
        size: 3161
    def: 4da1ca5da87d5bbc
  - step: children
    hand: the engine
    hash_before: e3e26e14c40c975155e5d082dbb2ee177ae5a287
    hash_after: e3e26e14c40c975155e5d082dbb2ee177ae5a287
---

# Ask

The engine's verbs carry a box from its first call to a merged pull request with no hand reaching past them. A ticket, a key, a fix group and a pull request each land through a verb, a pull hands out the work its plan names, and a fix on main reaches every running box. Every index tool a box sees answers, every path a note names stands, each helper and each default stands once, no commit carries a trailer naming a model, and a bare `./RUNME.sh` exits clean.

Boxes now clone front matter with sed, open drafts by hand, push branches with no pull request, count goldens again after each note edit, and fall back to the shell where a listed tool stays silent.

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

[[spec/tickets/accepts-reads-away-modules]] trivial
[[spec/tickets/attribution-trailer-meets-the-door]] trivial
[[spec/tickets/bare-runme-exits-clean]] standard
[[spec/tickets/box-opens-its-pr]] trivial
[[spec/tickets/branch-done-opens-the-pr]] standard
[[spec/tickets/collect-truthy-joins-yaml]] trivial
[[spec/tickets/commit-door-refuses-model-trailers]] standard
[[spec/tickets/copy-rule-drops-twin-word]] trivial
[[spec/tickets/dispatch-mints-fix-groups-open]] standard
[[spec/tickets/dispatch-skips-merged-done-branches]] trivial
[[spec/tickets/dispatch-update-collides]] trivial
[[spec/tickets/every-index-tool-answers]] standard
[[spec/tickets/every-named-path-resolves]] standard
[[spec/tickets/golden-readers-read-joined-paths]] trivial
[[spec/tickets/helpers-keep-the-plan-ticket]] trivial
[[spec/tickets/js-stale-reads-settings-default]] trivial
[[spec/tickets/model-trailer-refuses-in-place]] trivial
[[spec/tickets/one-send-door]] trivial
[[spec/tickets/pull-hands-the-working-ticket]] standard
[[spec/tickets/real-catalog-reads-accepts]] trivial
[[spec/tickets/running-work-takes-main-fixes]] standard
[[spec/tickets/shared-helpers-stand-once]] standard
[[spec/tickets/size-golden-drops-line-counts]] standard
[[spec/tickets/stale-span-reads-schema-unset]] trivial
[[spec/tickets/tool-call-hook-answers]] trivial
[[spec/tickets/tool-list-keeps-unreadable-actions]] trivial
[[spec/tickets/vehicle-truthy-joins-yaml]] trivial
[[spec/tickets/verbs-mint-tickets-and-keys]] standard

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

Every child stands closed, each small enough for one review: a standard child carried one change with its tests, and a trivial child one fix a gate or a retro named.
The children add up to the ask: verbs-mint-tickets-and-keys lands a ticket and a key, dispatch-mints-fix-groups-open a fix group, branch-done-opens-the-pr and box-opens-its-pr the pull request, pull-hands-the-working-ticket the work a plan names, running-work-takes-main-fixes a fix on main reaching each box, every-index-tool-answers the tools, every-named-path-resolves the paths, shared-helpers-stand-once each helper and default, commit-door-refuses-model-trailers the trailer, and bare-runme-exits-clean the bare call.
No child waits on another, since each stands closed, and each fix child landed with the parent change it pointed at.
Each child read its siblings through the branch it landed on, in the order the queue handed them, and the sync took main in last.
The diff stays one review: the folds the copy rule named landed under shared-helpers-stand-once, so no further split stands.

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

- quack-ending-files-go: the two ending files holding a package clause alone leave the tree
- standing-pull-takes-auto-merge: a standing pull request without auto-merge takes it, through one autoMerged the new path shares
- test-verb-comments-sit-home: the test verb and goTestNames comments sit on their own functions again
- accept passes over the three fixes, with the check at exit 0
- the retro drains four private notes: two done, one dropped, and inhand-reads-working-as-todo becomes inhand-skips-ticket-names in this group

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

- each fix took a red case first, and the standing pull case failed for the reason named before the code changed
- the fake hub records auto-merge on the pull it enables, so a second fire reads the first and the case proves one mutation
- the commit verb ran the check and pushed on every landing, so origin carried each closed step

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->
<!-- the form is list -->

- 23:16 the door refused git rm, the commit verb stages named paths alone, and the patch tool has no delete op; a plain rm and then the commit verb landed the deletion
- 23:21 the hand-back through the index tool met connection refused, since the commit rebuilt the index and restarted the server
- 23:22 to 23:27 the write tool answered level zero is starting three times after a commit or a test build, and each retry waited on a shell loop
- 23:24 the door refused a wait loop joined to a hand-back with a semicolon
- 23:32 the accept hand-back with the pass flag came back refused, since the verdict field decides
- 23:33 the door refused the ask of the minted ticket, since the note in hand bound the write, and the write named the note instead
- 23:36 the retro hand-back with fields alone reprinted the prompt and landed nothing, since a leaf holding no verdict field takes the pass flag
- no owner prompt in this window past the level zero clear that opened it

### improve

<!-- how each bad line stops happening, named by its home -->
<!-- the form is list -->

- the patch op list in `src/modules/edits/apply.go` takes a delete op, so a deletion needs no plain rm
- the commit verb in `src/quack/commit.go` waits for the server it restarts before it answers, so the next tool call meets a standing server
- the hand-back in `src/pull/pull_back.go` refuses fields with no flag on a leaf holding no verdict field, and names the pass flag, in place of a silent reprint
- `inhand-skips-ticket-names` stops a ticket named on the plan from standing in hand as a todo

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The three fixes were small, and most of the window went to waiting on the server after each commit. The door and the pull disagree on what a plan names, and this run met that twice: once as a refusal naming a ticket as the working todo, once as a write bound to the note in hand. The pass flag and the verdict field split the hand-backs in two, and both halves refused me once.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

one place: each improve line names the file owning its fix, and no rule repeats
numbers: the chapter adds no number past the times
headers: the chapter writes no file header
prompts and errors: each refusal of the run stands with its time, and the one owner-side event is the clear
role: the chapter names the box and the owner by role, with no address and no box path

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->
<!-- the form is list -->

- no host, right or install was refused in this window
- the patch tool lacked a delete op at 23:16, and a plain rm stood in

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->
<!-- the form is list -->

- the shell door refused git rm at 23:16, and the commit verb landed the deletion
- the door refused a hand-back joined by a semicolon at 23:24
- the server restart after each commit at 23:21 to 23:27, which the tools met as connection refused and level zero is starting
- the sync at 23:31 took main in with no conflict

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->
<!-- the form is list -->

- no person step parked, and no ticket minted outside this group
- inhand-skips-ticket-names stands in this group, to work before branch done
- the handover names that ticket, then branch done and the pull request against main with auto-merge on

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
