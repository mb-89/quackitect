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
step: retro/cloud
record:
  - step: sync
    hand: box a5167492d95e · claude-code-remote
    hash_before: d8d35fc1b144fd4c530e0874c8dd90fdea019c8c
    session: cse_01Q81whv9ndwkuBwHR3RFoDm
  - step: sync
    hand: box a5167492d95e · claude-code-remote · helper-12
    hash_before: 52844a46301b7959c7bf47fdd7fc8ed0fe3c500b
    hash_after: 52844a46301b7959c7bf47fdd7fc8ed0fe3c500b
    answered:
      - name: sync
        exit: 0
        said: work/edits-and-files-hold already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box a5167492d95e · claude-code-remote · helper-13
    hash_before: 3fa22f8f92164288774261e4cb00a54710863963
    hash_after: 3fa22f8f92164288774261e4cb00a54710863963
    inputs:
      - name: ask
        hash: 602b0febc4ae825f
        size: 216
    def: 19b6849b1f151cd5
  - step: children
    hand: the engine
    hash_before: 557b6653b6795f28b6c1c88dd8a181f3833d1a65
    hash_after: 557b6653b6795f28b6c1c88dd8a181f3833d1a65
  - step: accept
    hand: box a5167492d95e · claude-code-remote · helper-15
    hash_before: 30993860f7055b11390b61fa04fcd986339b5495
    hash_after: 30993860f7055b11390b61fa04fcd986339b5495
    answered:
      - name: sync/sync
        exit: 0
        said: work/edits-and-files-hold already carries every commit on main.
    inputs:
      - name: ask
        hash: 602b0febc4ae825f
        size: 216
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
    def: 07c43ae7253713ec
  - step: accept
    hand: box a5167492d95e · claude-code-remote · helper-17
    hash_before: 049975a3c7dc2fb1f60e651a437b00f7fe9d3567
    hash_after: 049975a3c7dc2fb1f60e651a437b00f7fe9d3567
    answered:
      - name: sync/sync
        exit: 0
        said: work/edits-and-files-hold already carries every commit on main.
    inputs:
      - name: ask
        hash: 602b0febc4ae825f
        size: 216
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box a5167492d95e · claude-code-remote
    hash_before: 1968368221dd0b7a9afb24ea33f6869d33796a6d
    hash_after: 1968368221dd0b7a9afb24ea33f6869d33796a6d
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
  - step: retro/write
    hand: box a5167492d95e · claude-code-remote
    hash_before: b604e75ecb0d3b1c25b30cf5eb3a47d3d416b7e5
    hash_after: b604e75ecb0d3b1c25b30cf5eb3a47d3d416b7e5
    inputs:
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: retro/notes
        hash: cd64de0d4d23e2c7
        size: 40
    def: e7ed0badf886b5b5
  - step: retro/cloud
    hand: box a5167492d95e · claude-code-remote
    hash_before: ddf19556b4888c419277a723a9e21208fb984468
    hash_after: ddf19556b4888c419277a723a9e21208fb984468
    inputs:
      - name: retro/write
        hash: 44e58e0644742ea7
        size: 3414
      - name: [[spec/guidance/working]]
        hash: d86fb2c80be2ce1c
        size: 4128
      - name: [[spec/guidance/cloud/cloud]]
        hash: 7c1b55b24304355c
        size: 3362
      - name: [[spec/guidance/review/reviewing]]
        hash: 17d4b8ac167e577c
        size: 1532
    def: 4da1ca5da87d5bbc
reason: done
---

# Ask

The edits module keeps every text it means to keep and undoes every apply it journals. The files family follows every change on disk from the seed on, and the git module keeps its last good read through a failed one.

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

- [[spec/tickets/a-part-written-apply-undoes]], standard
- [[spec/tickets/disk-list-skips-gone-folders]], trivial
- [[spec/tickets/free-name-reads-missing-folder]], trivial
- [[spec/tickets/git-parsers-stand-once]], standard
- [[spec/tickets/git-reads-keep-last-values]], standard
- [[spec/tickets/journal-names-stay-unique]], standard
- [[spec/tickets/journal-note-names-the-count]], trivial
- [[spec/tickets/regex-replacements-read-js-groups]], standard
- [[spec/tickets/seed-survives-bad-files]], standard
- [[spec/tickets/staged-adds-drop-the-tab]], trivial
- [[spec/tickets/watch-adds-skip-bad-folders]], trivial
- [[spec/tickets/watch-hands-new-folders]], standard
- [[spec/tickets/watch-opens-before-the-seed]], standard

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- size: each child changes one or two files beside its test, so each reads whole in one review
- goal: the children cover every finding on the owner's list, and the owner bars any child past it
- depends_on: watch-opens-before-the-seed lands after seed-survives-bad-files, since both change seedsIn, and the implement order holds it
- order: the three gate children closed into their parents, which carry their work
- size of the group: the diff stays one review, so the group splits no further

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

- seed-survives-bad-files: tests-green handed back, closed done
- watch-hands-new-folders: tests-green handed back, closed done
- watch-opens-before-the-seed: tests-green handed back, closed done
- the quack dump test waits for the standing file, which the watch change made it race
- the group's Discussion names the road taken out of the tests-green block
- the branch took main in, with the check green on the merged head
- files-start-stands-unused: the accept minted it, and a helper closed it
- the accept passed twice by a helper hand, the second time clean

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

- a stress run of the red test caught its race at once, since the case failed alone in a few hundred runs and never in three
- the helper hand for each accept kept the main hand free for the handover and the retro
- the accept caught a function left with no caller, since its reviewer read each child's code beside its test

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->
<!-- the form is list -->

- 21:20 UTC: the check stood red on the quack dump test, and the handover called the package green, since the files watch change made a test outside the package race
- 21:21 UTC: the git door refused a git stash list, which rode in a read command
- 21:24 UTC: the commit refused the model trailer the harness asks for
- 21:25 UTC: the write door refused a patch on a held ticket, since tests-green takes its fields through the pull
- 21:42 UTC: the stop refused a turn ending on a background helper, since a cloud box stops its helpers with its turn
- 21:50 UTC: a pkill on a loop's pattern killed the shell running it
- 21:55 UTC: a proxy error on a helper's push sent its commit to a rescue branch
- 21:58 UTC: the accept's point named one test of files.Start, and another test still called it
- 22:05 UTC: the main hand's hold on the accept went stale once a helper passed it, and one pull spent itself on that
- no owner prompt turned the run, and the plugin's clear opened it

### improve

<!-- how each bad line stops happening, each line naming its home as a link, a ticket in backticks or a path in backticks -->
<!-- the form is list -->

- implement/change runs the whole check beside the package tests, so a race the change makes elsewhere shows before tests-green: `spec/processes/standard.yaml`
- a handover names the full path of a tool folder it hands on, since each session takes a new scratchpad: [[spec/guidance/working]]
- a helper waits inside the turn through a foreground poll on the ticket's step: [[spec/guidance/cloud/cloud]]
- a review point naming a deletion lists every caller and test, read off a search: [[spec/guidance/review/reviewing]]
- a background shell stops through its task id, and a pattern kill matches its own shell: [[spec/guidance/working]]

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The red check looked at first like a flake, and the stress run turned it into a cause. The watch now hands a late folder in, so any test comparing two reads of the files family across the serve's start races the same way. The dump test is the one the check met. The stale hold after a helper's pass reads as the engine working as built, though one wasted pull says the main hand could drop its hold where a helper takes the step.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- one place: each fact points at its ticket or its guidance note, and nothing restates a rule
- numbers: the retro adds no number past the times of the run
- headers: the retro writes no header
- transcript: each error carries its time, and the line on owner prompts says none turned the run
- role: the retro names the main hand and the helpers by role, with no name, address or path of the box

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->
<!-- the form is list -->

- 21:20 UTC: the claude and the tsc that CI pins. The check ran with copies from an earlier scratchpad, ahead on PATH.
- 21:55 UTC: one push met a proxy error, and the commit went to a rescue branch.

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->
<!-- the form is list -->

- 21:20 UTC: a test that races on this box. The quack dump test failed once in a few hundred runs.
- 21:30 UTC: a sync with main took many commits in, and no conflict met it.
- 21:42 UTC: the stop hook refused a turn ending on a running helper.
- 21:24 UTC: the commit hook refused a model trailer.

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->
<!-- the form is list -->

- no person step stands parked.
- no ticket stands minted with no group. The accept minted files-start-stands-unused into this group, and it closed.
- the handover says branch done and the pull request with auto-merge wait.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

- The branch stands cut off `main` by hand, as #138 and #140 cut theirs. `branch open` reads the group off `origin/main` and marks it there, so it pushes `main`, and this box pushes no `main`.
- The children run in severity order where the pull allows it. The pull hands a held ticket each of its steps, so the order bends where a ticket waits on a gate.
- The queue stalled at `a-part-written-apply-undoes` tests-green, since its tests and the files `ratio` guard waited on the siblings' code. The box took the road on its implement/person-1: every sibling's implement/change landed first, and then each tests-green handed back over the whole package, the engine and rule 6 of the tests guidance left as they stand.
- Every child's gate verdict reached its pull, and every child closed done.
- The files watch change made `TestQuackDumpWritesWhatTheIndexAnswers` race, since the standing file now reaches the files family after the seed. The test waits for it now, through `seed-survives-bad-files`.
- The `types` part reads the engine's types, and this box's claude lays none. The check runs here with the claude and the tsc that CI pins, out of the scratchpad, ahead on `PATH`.
