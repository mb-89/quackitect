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
    hand: box f689bbb375f6 · claude-code-remote
    hash_before: 7388a284eb61da57ea9233b10034dde3da03024b
    session: cse_018wkr3ZZD91bVtBerPg7zA3
    hash_after: 8619469182513d7037d2065a3950bafc686226d5
    model: claude-opus-5-5
    cost: 0
    final: "RECEIPT: branch=work/checks-and-index-read-right prompted=no canary=no"
  - step: sync
    hand: box f689bbb375f6 · claude-code-remote
    hash_before: 52efc15164d74ff70dcac424e1219e838dcbd1c3
    hash_after: f8e208ee80963ece302b9faa3eda0efee29fb1ac
    answered:
      - name: sync
        exit: 0
        said: work/checks-and-index-read-right already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box f689bbb375f6 · claude-code-remote
    hash_before: 517aee02d22faadcbb0262014ac2f07b71444897
    hash_after: 517aee02d22faadcbb0262014ac2f07b71444897
    inputs:
      - name: ask
        hash: a8db2a84f2f89dd4
        size: 336
    def: 19b6849b1f151cd5
  - step: children
    hand: the engine
    hash_before: 8cb72e8a4966f937c8d71865315fbc6fcc1b5f6d
    hash_after: 8cb72e8a4966f937c8d71865315fbc6fcc1b5f6d
  - step: accept
    hand: box f689bbb375f6 · claude-code-remote
    hash_before: 27b59d0c072916d4595ec170c18a3a38ad89366a
    hash_after: 83f66f8df518c017eb3a14201283c515a5c3b4a1
    answered:
      - name: sync/sync
        exit: 0
        said: work/checks-and-index-read-right took 104 commit(s) from main.
    inputs:
      - name: ask
        hash: a8db2a84f2f89dd4
        size: 336
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box f689bbb375f6 · claude-code-remote
    hash_before: 11d4ef2e3741a89c51cd9e395614893dea8eb28e
    hash_after: 11d4ef2e3741a89c51cd9e395614893dea8eb28e
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
  - step: retro/write
    hand: box f689bbb375f6 · claude-code-remote
    hash_before: f5dbe99cc1650108c787f9969093024484860fe6
    hash_after: f5dbe99cc1650108c787f9969093024484860fe6
    inputs:
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: retro/notes
        hash: cd64de0d4d23e2c7
        size: 40
    def: e7ed0badf886b5b5
  - step: retro/cloud
    hand: box f689bbb375f6 · claude-code-remote
    hash_before: 315928370a951c33ec6bff13368a00e6fafad8f5
    hash_after: c0be8002749b4b39311f0862c9da8be8f1e4c13e
    inputs:
      - name: retro/write
        hash: a631c108eb10dc12
        size: 4329
    def: 4da1ca5da87d5bbc
reason: done
---

# Ask

The check rules fire where their notes say and read only what they name, and the index answers every query and every hung action in bounded time. The verbs that move, split, commit and run report what happened on disk. Done when every child closes through the command it names, or closes with the reason its fix costs more than it buys.

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

- [[spec/tickets/a-missing-path-stays-unquiet]] trivial
- [[spec/tickets/check-over-leaves-for-sweep]] trivial
- [[spec/tickets/check-tree-drops-dead-caches]] trivial
- [[spec/tickets/code-cut-blanks-strings-first]] trivial
- [[spec/tickets/dead-anchor-reads-pointers-once]] trivial
- [[spec/tickets/door-guards-watch-and-drain]] trivial
- [[spec/tickets/find-quotes-its-words]] trivial
- [[spec/tickets/glob-reads-whole-runes]] trivial
- [[spec/tickets/group-rule-fires-in-sweep]] trivial
- [[spec/tickets/index-actions-carry-a-deadline]] trivial
- [[spec/tickets/index-open-clears-its-companions]] trivial
- [[spec/tickets/loaded-keys-writers-by-instance]] trivial
- [[spec/tickets/mcp-cap-names-its-size]] trivial
- [[spec/tickets/no-log-deleted-reads-go]] trivial
- [[spec/tickets/proc-keeps-late-pipe-runs]] trivial
- [[spec/tickets/rename-text-moves-nothing]] trivial
- [[spec/tickets/slow-call-holds-no-timer]] trivial
- [[spec/tickets/split-guard-cleans-paths]] trivial
- [[spec/tickets/sweep-counts-written-rows]] trivial
- [[spec/tickets/take-back-names-failed-reset]] trivial
- [[spec/tickets/v1-client-carries-a-bound]] trivial

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each child holds one finding and its case, small enough to review whole
- the children cover every finding of the review list, and the two door findings share one child
- no child waits on another, since each touches its own code
- no child reads a sibling, so the order of landing stands free
- the diff stays one review, so no child splits into a group

# children

# accept

<!-- reads the diff since its last verdict against the goal and every prose criterion, and names what falls short as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept: every child closes through its named case, each red before its fix but `TestOpenClearsTheWalAndShm`, whose replay did not reproduce, and the check answers green on the head after the merge of main

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

- `check-over-leaves-for-sweep`: `Rules` alone names the check rules, and the engine-field hint reaches the sweep
- `check-tree-drops-dead-caches`: the tree keeps the memo one sweep reuses
- `code-cut-blanks-strings-first`: a slashed string keeps the code after it
- `dead-anchor-reads-pointers-once`: one rule reads a pointer's chapter
- `door-guards-watch-and-drain`: the door keeps its watch, sweeps on overflow, and drains outside its guard
- `find-quotes-its-words`: a search reads its words as text
- `glob-reads-whole-runes`: a glob reads letters past ASCII whole
- `group-rule-fires-in-sweep`: the group rule reads the tickets in every source
- `index-actions-carry-a-deadline`: a hung writer ends and holds its slot until its run returns
- `index-open-clears-its-companions`: a corrupt index rebuilds
- `loaded-keys-writers-by-instance`: each instance takes its own writer
- `mcp-cap-names-its-size`: a body past the cap answers 413
- `no-log-deleted-reads-go`: the log guard reads Go and shell
- `proc-keeps-late-pipe-runs`: a run whose child holds the pipe keeps its exit
- `rename-text-moves-nothing`: a text rename moves no file, and the cold probe drops the branch an earlier clone left
- `slow-call-holds-no-timer`: the call cases read no wall clock
- `split-guard-cleans-paths`: split refuses its source in any spelling
- `sweep-counts-written-rows`: a sweep counts the rows it writes
- `take-back-names-failed-reset`: a take-back the reset refuses names the commit
- `v1-client-carries-a-bound`: a read to a wedged index ends on an error

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

- each child opened on a red case, so every fix but one meets a fault it saw fail first
- the review file on the `review/` branch carried a fix sketch a finding, so each child started from a traced path
- the commit verb's check caught a gofmt slip, a file past the ceiling and a ratio overrun before any push

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->
<!-- the form is list -->

- 21:40 UTC: the level0 MCP server dropped after the take, so every write ran through Edit and Bash in place of the patch door
- 21:45 UTC: the first commit carried the model trailer, which the commit door refuses
- 21:58 UTC: an appended case read off gofmt, and the commit went red on it
- 22:12 UTC: a staged lint refused `EveryNamedPathStands` on tracked paths right after the index rebuilt, and the same lint alone passed, one occurrence with its cause unproven
- 22:21 UTC: a glob case of mine wanted `[!x]` to refuse `!`, a wrong claim the run caught
- 22:33 UTC: the replay of an old journal did not reproduce, so `TestOpenClearsTheWalAndShm` passes on the old code too
- 23:00 UTC: the cold probe failed twice on `work/dry-probe-clears`, a branch an earlier probe clone pushed into the box tree
- 00:39 UTC: the merge of main put `src/quack` past the ratio guard, since main stood eight lines under it
- no owner prompt reached the run

### improve

<!-- how each bad line stops happening, each line naming its home as a link, a ticket in backticks or a path in backticks -->
<!-- the form is list -->

- the MCP drop: `spec/guidance/working.md` names the fallback for rule 13 where the server stands gone
- the trailer: `.claude/skills/work/SKILL.md` names the trailer rule beside the commit step
- gofmt: `src/quack/commit.go` runs the formatter over the staged Go before the lint
- the staged lint: `src/quack/commit.go` asks the lint once the index answers ready
- the glob case: `spec/guidance/code/testing.md` rule 5 holds, since the red run caught it
- the journal replay: `src/index/index.go` keeps the removal, and the case stays as the guard
- the probe branch: `src/quack/probe_clear.go` drops it before it branches
- the ratio: `src/branches` runs the ratio guard in the sync, so the merge names the overrun

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The group was a list of independent findings, so it ran as twenty small loops: read the sketch, write the red case, fix, commit through the verb. The commit check takes three to fifteen minutes, which set the pace more than the fixes did. Two faults the check met belonged to no ticket: the probe branch leak and the ratio overrun after the merge, and both stood in the way of the hand-back, so both got fixed here.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each fact stands in its code or its design note, and the retro points at the file
- the retro adds no number beyond the times
- the retro writes no file header
- the badly list carries each error with its time, and names that no owner prompt came
- the chapter names the agent and the box by role alone

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->
<!-- the form is list -->

- 21:40 UTC: the level0 MCP server, which dropped after the take, so the patch door and the ticket tools ran through the shell verbs
- no host the proxy refused, no right the platform refused, and no install

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->
<!-- the form is list -->

- the commit door refusing the model trailer
- the cold probe failing on a branch an earlier probe clone pushed into the box tree
- the ratio guard on `src/quack` after the merge of main
- a staged lint reading a partial tree once, right after the index rebuilt
- a merge of main with no conflict, twice

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->
<!-- the form is list -->

- no person step parked
- no ticket minted outside the group
- no handover, since the group reaches done in this session

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

The owner approves this group off the review fleet's list on the `review/` branch, each finding re-checked by a skeptic. The route runs this way:

- `./RUNME.sh branch open` commits a marker on `main` and pushes it, so the box cuts `work/checks-and-index-read-right` off `main` by hand, as the branches of `#138` and `#140` did
- each child runs the trivial route: the finding's fix sketch is the design, and its `do` step lands a failing case before the fix
- the two door findings on `src/index/door.go`, the dropped watch error and the guard held through a drain, share one child
- a child whose fix costs more than it buys closes with that reason, and the group widens past the list nowhere
