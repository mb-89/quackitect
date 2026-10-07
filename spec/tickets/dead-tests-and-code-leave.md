---
kind: [[ticket]]
state: closed
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
    hand: box d2c15bcb53d2 · claude-code-remote
    hash_before: 04fdf6f3074ffe3f7dae3aeeea3a972e5b29ed88
    hash_after: 4ae4d26d19e4133fba12429f3d15767ce53fb36b
  - step: sync
    hand: box 34eba3f85616 · claude-code-remote
    hash_before: 3e92d5bac4bc2165f0d7b54cd8368c7b732cac3f
    hash_after: 3fe011a30b76c7732051d886ac686ece21f8b1c0
    model: unstated
    cost: 0
    final: "dead-tests-and-code-leave: every child closed, the check green, the retro written"
  - step: sync
    hand: box 34eba3f85616 · claude-code-remote
    hash_before: 12d4c5d6afc7f0a33f7d7ef8273a8204888c025b
    hash_after: 12d4c5d6afc7f0a33f7d7ef8273a8204888c025b
    answered:
      - name: sync
        exit: 0
        said: work/dead-tests-and-code-leave already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box 34eba3f85616 · claude-code-remote
    hash_before: e86f1d4f5ccbff7c139c8b58d3bf9a1bde25da07
    hash_after: e86f1d4f5ccbff7c139c8b58d3bf9a1bde25da07
    inputs:
      - name: ask
        hash: 0c167c1dcc40d01c
        size: 477
    def: 19b6849b1f151cd5
  - step: children
    hand: the engine
    hash_before: 00588f52e30d08d452d37e4eb25fc123fa7e50c5
    hash_after: 00588f52e30d08d452d37e4eb25fc123fa7e50c5
  - step: accept
    hand: box 34eba3f85616 · claude-code-remote
    hash_before: 05e618a9c5f62f875dc45bc7f5b029f65ea792e5
    hash_after: a1536ed95af3ab60d4cb7dd219a0a8f56dff9233
    answered:
      - name: sync/sync
        exit: 0
        said: work/dead-tests-and-code-leave took 2 commit(s) from main.
    inputs:
      - name: ask
        hash: 0c167c1dcc40d01c
        size: 477
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box 34eba3f85616 · claude-code-remote
    hash_before: 687205e82b21c32ff5fb7cff607d36b2d9b3b9ef
    hash_after: 687205e82b21c32ff5fb7cff607d36b2d9b3b9ef
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
  - step: retro/write
    hand: box 34eba3f85616 · claude-code-remote
    hash_before: b140f623e1469d1e8fb1d1190e0f5c38fe6c7c30
    hash_after: b140f623e1469d1e8fb1d1190e0f5c38fe6c7c30
    inputs:
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: retro/notes
        hash: 310d2ddd3fe31ac9
        size: 36
    def: e7ed0badf886b5b5
  - step: retro/cloud
    hand: box 34eba3f85616 · claude-code-remote
    hash_before: 51498837537f751eea5375686b7a067577cbea6a
    hash_after: 51498837537f751eea5375686b7a067577cbea6a
    inputs:
      - name: retro/write
        hash: ee39ce77262b47c4
        size: 4214
      - name: [[spec/guidance/cloud/cloud]]
        hash: 7c1b55b24304355c
        size: 3362
    def: 4da1ca5da87d5bbc
reason: done
---

# Ask

The test suite tests only code that runs, once each, and the tree holds the rules that keep it so.

The check spends its time on code nothing loads and on comparisons whose migration phase has passed. Two config readers disagree on a value, and the next box writes the same dead tests again.

- every child of the group stands closed
- the retro carries `./RUNME.sh check` time and the Go and JS test and code line counts, measured before and after
- `./RUNME.sh check` exits 0

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

- [[spec/tickets/dead-go-goldens-leave]], trivial
- [[spec/tickets/dead-js-tests-leave]], trivial
- [[spec/tickets/js-take-path-leaves]], trivial
- [[spec/tickets/one-config-reader-decides]], trivial
- [[spec/tickets/branches-fixtures-copy-a-template]], trivial
- [[spec/tickets/restated-tests-merge]], trivial
- [[spec/tickets/tests-guidance-note-lands]], trivial

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each child landed as its own few commits, small enough to review whole
- the children add up to the goal: dead tests and code leave, restated tests merge, one config reader decides, and the rules keep it so
- no child waits on another now, since every child stands closed
- the guidance child read the audit draft and the examples note, and landed last
- the diff stays one group, since the goal is one cut and no child grew past its own review

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

- the half-done merge of main an earlier box left behind lands, with the dead battery helper kept out of the retro effect file
- `restated-tests-merge` closes: one table test over the verb list, one over the wiring names, the branches natives the port suites restated, the tui root restatements, the log-tab and frame moves, one window port test, and the import rules in src/imports
- `tests-guidance-note-lands` closes: the note for a writer of tests with its rationale, testing rules 1 to 3 rescoped, the retro audit rule and its checklist line
- a quoted tag in a note now reads as its bare word, in the JS guidance reader
- a second merge of main lands after the doors branch merged, with its twelve conflicts resolved
- the check, warm against warm on one box: 107.1 seconds at the group's start, 73.9 at its head
- Go code lines: 74301 at the start, 78582 at the head, 78742 on main
- Go test lines: 51112 at the start, 54609 at the head, 56826 on main
- JS code lines: 35451 at the start, 21781 at the head, 35792 on main
- JS test lines: 52211 at the start, 21207 at the head, 52652 on main
- `.se/scripts/linecounts.sh` counts the lines at a commit, and its text stands in the thoughts chapter

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

- the audit branch mapped every restated test to the test restating it, so three helpers worked disjoint folders at once
- each helper checked the audit's pairs before deleting, and caught several pairs the audit called covered that were not
- a commit a helper, each through the commit verb, kept every landing green and pushed

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->
<!-- the form is list -->

- at the start the take refused, because an earlier box left a merge of main open with conflicts
- the conflict markers in a Go file kept the index down, so the gate refused every write until a hand took one side through git
- git rm, git add and git push came back refused, since the engine owns git writes
- a partial commit came back refused while the merge stood open
- an early stop claimed helpers still ran, and the stop hook refused it, since a cloud box ending its turn stops its helpers
- the first hand-back named `go test`, which the engine read as not green
- the minted note wrote its tags quoted, and the guidance tags test refused it as reaching no step
- main moved during the accept gate, and the sync stopped on twelve conflicts
- the doors branch replaced the branches template fixtures with fakes, so the code behind `branches-fixtures-copy-a-template` left, though its goal still holds
- no owner prompt reached this run

### improve

<!-- how each bad line stops happening, named by its home -->
<!-- the form is list -->

- the take names an open merge and its files, and hands the merge to the box in place of a refusal, in `src/branches/take.go`
- the gate passes `git checkout --ours` and `--theirs` on a conflicted file while the index stands down, in `.claude/skills/level0/hooks/start.js`
- the hand-back reads a plain `go test` exit as green, as it reads the test verb, in `src/pull/pull_chapter.go`
- the reader takes quoted tags, landed in `.claude/skills/level0/lib/guidance.js`
- a cloud box waits on its helpers with a loop inside its turn, as [[spec/guidance/cloud/cloud]] rule 10 asks
- a group syncs again right before accept, so a late main meets the review, as [[spec/guidance/cloud/cloud]] rule 3 asks

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The audit did most of the thinking, and the run went fastest where it trusted the audit's map and checked each pair anyway. The gate's refusals cost more turns than the work did. A dead index blocking the very write that would revive it is a loop worth breaking. The second merge showed a cost of long groups: a branch that cuts tests collides with every branch that edits them.

The line count script reads each tracked Go or JS file at a commit through git show, and sums lines by language and by test or code. A file ending in _test.go or .test.js, or standing under test/, counts as test.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each fact stands once: the counts stand here, and the notes point at the guidance and the audit
- each number carries its name beside it in the done list
- the headers the change writes say what their file is for
- the chapter carries the run's errors in order, and no owner prompt reached the run
- the chapter names roles alone, with no name, address or box path

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->
<!-- the form is list -->

- nothing: every tool the run needed stood on the box, and no host or right came back refused

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->
<!-- the form is list -->

- a merge of main left open by an earlier box, at the start
- a conflict at the second sync, twelve files, at the accept gate
- the gate's git-write rule, refusing git rm, git add and git push
- the stop hook, refusing a stop while helpers ran
- the dead index, refusing writes while a conflict marker stood

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->
<!-- the form is list -->

- no person step parked
- no ticket minted outside the group
- the handover: every child closed, the check green, the branch pushed, and the pull request opens next

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
