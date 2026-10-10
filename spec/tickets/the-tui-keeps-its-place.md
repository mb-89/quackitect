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
    hand: box b0a22705166b · claude-code-remote · helper-4
    hash_before: baaeb56cc53419c155d289b7559af0e67f6abdf9
    hash_after: baaeb56cc53419c155d289b7559af0e67f6abdf9
    answered:
      - name: sync
        exit: 0
        said: work/the-tui-keeps-its-place already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box b0a22705166b · claude-code-remote · helper-4
    hash_before: 9fae3801986fde4f7e35df5b3796511714236bbc
    hash_after: 9fae3801986fde4f7e35df5b3796511714236bbc
    inputs:
      - name: ask
        hash: cc970d23e318d3cb
        size: 346
    def: 19b6849b1f151cd5
  - step: children
    hand: box a84d8c0a18eb · claude-code-remote
    hash_before: e882db9d4e2840df8b2b9bf7b241fde8949d7e23
    session: cse_01BZXtnZDaLGMkGopXHPxfTe
  - step: children
    hand: the engine
    hash_before: cde9c5d8b758aa80ac582110d72c55dfd25e182d
    hash_after: cde9c5d8b758aa80ac582110d72c55dfd25e182d
  - step: accept
    hand: box a84d8c0a18eb · claude-code-remote
    hash_before: 9b7008afdcbc8fe74372dd3a6d776a187f22385f
    hash_after: fdd61a4f84bb22c525b02e547a9d3455f0544767
    answered:
      - name: sync/sync
        exit: 0
        said: work/the-tui-keeps-its-place took 48 commit(s) from main.
    inputs:
      - name: ask
        hash: cc970d23e318d3cb
        size: 346
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box a84d8c0a18eb · claude-code-remote
    hash_before: 568cf65eea1135bcece4b79e2667b80ecddcf6fb
    hash_after: 568cf65eea1135bcece4b79e2667b80ecddcf6fb
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
  - step: retro/write
    hand: box a84d8c0a18eb · claude-code-remote
    hash_before: 7cb1614d86cc45fddd5474c1b15dcde5ac29e614
    hash_after: 7cb1614d86cc45fddd5474c1b15dcde5ac29e614
    inputs:
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: retro/notes
        hash: cd64de0d4d23e2c7
        size: 40
    def: e7ed0badf886b5b5
  - step: retro/cloud
    hand: box a84d8c0a18eb · claude-code-remote
    hash_before: d869a52db357f0699ed591366d3af6c0ec4324f4
    hash_after: d869a52db357f0699ed591366d3af6c0ec4324f4
    inputs:
      - name: retro/write
        hash: f2d2de55203a4261
        size: 2465
      - name: [[spec/tickets/open-edits-outlive-redraws]]
        hash: 97110e026beedf1c
        size: 671
      - name: [[spec/tickets/a-filter-keeps-the-cursor]]
        hash: ae3a3ee001420f25
        size: 508
      - name: [[spec/tickets/a-redraw-keeps-the-sort]]
        hash: 2e7172410cde3169
        size: 396
      - name: [[spec/guidance/cloud/cloud]]
        hash: 7c1b55b24304355c
        size: 3362
    def: 4da1ca5da87d5bbc
reason: done
---

# Ask

<!-- goal, as text: what these tickets add up to, for the hand that takes them -->
goal: the TUI keeps a person's place across a redraw. An open cell edit, the cursor under a filter, the column sort and the registry selection stand where the person left them. The src/q store and scheduler findings of the same review stand fixed, or close naming why the fix costs more than it buys. Each fix carries a case that fails before it.

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

- [[spec/tickets/open-edits-outlive-redraws]], standard
- [[spec/tickets/a-filter-keeps-the-cursor]], standard
- [[spec/tickets/a-redraw-keeps-the-sort]], standard
- [[spec/tickets/a-refetch-keeps-the-selection]], standard
- [[spec/tickets/commits-read-moves-locked]], standard
- [[spec/tickets/unwatched-providers-meet-a-caller]], standard, routed onto one decide leaf

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each child holds one finding and one to three files, small enough to review whole
- the six children hold the six findings of the list, and nothing of the goal stands outside them
- no child waits on another: the three tree children each touch Carry, and land one after another on one branch
- the three tree children read nothing from each other past the shared Carry function
- the group diff stays inside one review

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

- [[spec/tickets/open-edits-outlive-redraws]]: `Carry` carries the open edit, the marks and the last mark by name path, and a take on a row that left names it with `RowLeft`
- [[spec/tickets/a-filter-keeps-the-cursor]]: tests-green handed back on the carry an earlier box landed
- [[spec/tickets/a-redraw-keeps-the-sort]]: tests-green handed back on the carry an earlier box landed
- the group accept, over every child and the store and registry fixes
- a merge of main, taking main side of the laid-types check in `src/quack/check.go`

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

- the red tests an earlier box wrote decided the edit carry whole, so the change went green on its first run
- the draft-3 approach named every file and caller, so the build needed no read past it

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->
<!-- the form is list -->

- 21:06 the gate hand-back refused a finding row naming the ticket in hand, since a row mints a child
- 21:12 the implement/change hand-back refused twice: first on empty lint and checklist evidence, then on the commit hook, since the red tests landed in an earlier commit and no test stood staged
- 21:19 the accept hand-back refused on a sync conflict in `src/quack/check.go` and its test, where main landed the same laid-types fix under another constant name
- 21:02 the level0 server dropped at the session start, so every write ran through the verbs and a script in place of the patch door
- no owner prompt reached the run, which a schedule fired

### improve

<!-- how each bad line stops happening, each line naming its home as a link, a ticket in backticks or a path in backticks -->
<!-- the form is list -->

- a gate row names a new child, and a fix the builder makes in place rides as a plain pass: `spec/guidance/review/design.md`
- the tested hook counts a test file a held ticket lists under its red evidence: `src/modules/hooks/command/tested.go`
- a box fixing a check fault searches main for the same fix first: [[spec/guidance/cloud/cloud]]
- a session meeting a dropped level0 server says so in its first line: `.claude/skills/level0`

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The run read as a hand-back loop more than a build. Three of the four refusals came from the hand-back shape, not the code, so a reader judging this group reads the store and tree diffs and can trust the ticket record for the rest. The laid-types conflict shows two boxes meeting the same red check on the same day.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each fact points at the ticket or file owning it
- the retro adds no number past the times
- the change writes no header
- the badly list carries each error with its time, and says no owner prompt came
- the chapter names the box by role alone

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->
<!-- the form is list -->

- 21:02 the level0 server dropped, so the patch door and the pull tool stood absent
- the box held no gh CLI, so the pull request goes through the GitHub connector

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->
<!-- the form is list -->

- 21:19 a conflict at sync in `src/quack/check.go` and its test, taken from main
- 21:12 the commit hook refusing code with no staged test

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->
<!-- the form is list -->

- no person step parked
- no ticket minted outside the group

# Discussion

Owner-approved group, from the review fleet's confirmed findings, at `groups/the-tui-keeps-its-place.md` on the fleet's review branch.

The route: `branch open` pushes `main` to mark the group cloud, and a box pushes no `main`. So `work/the-tui-keeps-its-place` stands cut off `main` by hand, as pull requests `#138` and `#140` cut theirs, and the group carries no `cloud` mark.

The mint verb refuses a group with no child, so `mint_note` wrote this ticket first and `ticket update --over` copied the group route in.
