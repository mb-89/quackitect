---
kind: [[ticket]]
state: open
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
    hand: box 2dca9acd8cb4 · claude-code-remote
    hash_before: 10bb4e6ec233a0ffdfe8fb73c1040abf7c2e51cf
  - step: sync
    hand: box 2dca9acd8cb4 · claude-code-remote
    hash_before: b0e9a317a0d81bd8c968b1216b21b4a620e3e0d4
    hash_after: b0e9a317a0d81bd8c968b1216b21b4a620e3e0d4
    answered:
      - name: sync
        exit: 0
        said: work/examples-are-the-tests already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box 2dca9acd8cb4 · claude-code-remote
    hash_before: a69a0df3cc67fde8eac356ab5bbbb7e32836748a
    hash_after: a69a0df3cc67fde8eac356ab5bbbb7e32836748a
    inputs:
      - name: ask
        hash: ec95a41be42e2146
        size: 430
    def: cb8f90bc86fc7d39
  - step: children
    hand: the engine
    hash_before: 250bffc26cdadd320113a296a41b23b147d374ec
    hash_after: 250bffc26cdadd320113a296a41b23b147d374ec
  - step: accept
    hand: box 2dca9acd8cb4 · claude-code-remote
    hash_before: 9d73104ecf6b3c03458fa0b1215979026495a4f2
    hash_after: 9d73104ecf6b3c03458fa0b1215979026495a4f2
    answered:
      - name: sync/sync
        exit: 0
        said: work/examples-are-the-tests already carries every commit on main.
    inputs:
      - name: ask
        hash: ec95a41be42e2146
        size: 430
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
    def: 07c43ae7253713ec
  - step: retro/notes
    hand: box 2dca9acd8cb4 · claude-code-remote
    hash_before: b96d35803f323ca4dc4e6dc4e97e02cc4cd45a45
    hash_after: 75d6030d4bcaa5e275f4b88cb193188ef7fd09a5
    answered:
      - name: drained
        exit: 0
        said: .se/tickets holds no open note, so the box leaves nothing behind.
    def: cb5a549f0e587fc2
  - step: retro/write
    hand: box 2dca9acd8cb4 · claude-code-remote
    hash_before: 1e2f22c9aea12b072580b036be01b7c7799a82bd
    hash_after: 1e2f22c9aea12b072580b036be01b7c7799a82bd
    inputs:
      - name: children
        hash: 811c9dc59e3779b9
        size: 0
      - name: retro/notes
        hash: 310d2ddd3fe31ac9
        size: 36
    def: 1246a42e29e7ae98
step: retro/cloud
---

# Ask

The design of examples stands written: one Markdown file a behavior is tutorial, use case, documentation and behavior test at once, run detached against the real system from a Tutorial tab and by one Go harness against faked doors in the tests. The owner's words stand as design input, the design as a design note, the rules in the testing guidance and the retro's audit, and the implementation as a draft group a later box takes.

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

- [[spec/tickets/examples-design-input]], trivial
- [[spec/tickets/examples-design-note]], trivial
- [[spec/tickets/examples-testing-rules]], trivial
- [[spec/tickets/examples-implementation-drafts]], trivial
- [[spec/tickets/restated-table-runs-in-time]], trivial

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each child writes one note or one rule set, small enough to review whole
- the children add up to the goal: the design input, the design note, the rules, and the implementation drafts; the timing fix keeps the check green under it
- the design note waits on the design input, and the rules and the drafts wait on the design note, each under depends_on

# children

# accept

<!-- reads the diff since its last verdict against the goal and every prose criterion, and names what falls short as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept: the design input holds the seven points with pylib and the pyqtgraph explorer; the design note holds the format, the places, the suite, one runner with two drivers, the Tutorial tab, its two-mode search, the editor road, the checks, and the doors, fixtures and ratio; the rules stand in spec/guidance/code/examples.md behind a pointer from testing.md, since testing.md stands at its cap, and in the audit guidance and the retro checklist; the implementation group stands as eight drafts; the check stands green

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

- examples-design-input: the owner's points on examples stand as design input, with pylib and the pyqtgraph explorer
- examples-design-note: spec/design_output/examples.md holds the format, the places, the suite, the runner, the Tutorial tab, the search, the editor road and the checks
- examples-testing-rules: spec/guidance/code/examples.md holds the rules, testing.md points there, and the audit guidance and the retro checklist carry the counts
- examples-implementation-drafts: the group examples-run-as-tests stands as a draft with its children
- restated-table-runs-in-time: the RestatedTable rule runs in linear time, with a contract case
- examples-design-meets-review: the review's points on the design input and the design note

### well

<!-- what went well, and what made it go well -->
<!-- the form is list -->

- the sibling branch showed the road for a group a cloud box mints, a commit on its own work branch then a take
- an independent reviewer read the diff and found what the author's own gate missed

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->
<!-- the form is list -->

- 18:45 the mint refused the group before a child named it, and branch open refused off main, and a push to main refused from a cloud box
- 19:00 the vocabulary rule read stale terms until ./RUNME.sh project ran
- 19:03 the design input pointed at a design note not yet written, and the check went red
- 19:20 mint_note wrote the Scope alone and dropped every other chapter, for the design input and the design note both
- 19:30 to 20:00 the check went red three times on a Vale script timeout under load
- 19:50 testing.md stood at the guidance cap, so the rules took a note of their own
- 20:26 the author passed the group accept on a grep, before the reviewer reported, and missed the dropped chapters

### improve

<!-- how each bad line stops happening, named by its home -->
<!-- the form is list -->

- the work skill names the road for a group a cloud box mints: commit on work/<group>, push, then branch take, in .claude/skills/work/SKILL.md
- the commit verb runs the projection where spec/vocabulary changes, in src/quack
- mint_note writes every chapter its fields name, or refuses the ones it drops, in the mint module
- the RestatedTable fix holds the timeout, and the check runs Vale in batches, in src/modules/lsp/tools.go
- the accept gate waits on the review a hand starts, in spec/guidance/working.md

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->
<!-- the form is text -->

The design sits on decisions the owner left open: the expect lines as shell comments, the ./RUNME.sh-only rule for steps, and the filter pane and F5 for the tab. Each one keeps a single file readable on GitHub, runnable in Runme and fakeable in the harness. The cap on testing.md was a real constraint, and the separate note tagged testing reaches the same readers.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each fact stands once: the notes point at the doors, the fakes and the ratio's owner
- the run adds no number past the run length the schema names
- the headers say what each file is for
- the badly list carries each error with its time, and the run had no owner prompt past the first
- the chapter names roles alone

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->

<!-- the form is list -->

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->

<!-- the form is list -->

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->

<!-- the form is list -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
