---
kind: [[ticket]]
state: closed
steps:
  - name: design
    steps:
      - name: owner-read
        does: reads the ask a handover carries, before any draft
        by: person
        when: handed
        input: ask
        evidence:
          - name: read
            form: verdict
            says: pass where the ask says what the owner said, or fail with the owner's words
      - name: draft
        does: writes the approach the ask calls for
        from: anyone
        by: anyone
        input: ask
        checklist: ["every file, function and verb the approach names stands opened, and each claim checked there", "the callers list names every caller of what the approach changes", "every done_when line names the test that decides it"]
        evidence:
          - name: approach
            form: text
            says: the approach here where it takes minutes, or a link to the design output where it takes a note
          - name: callers
            form: list
            says: every caller of what the approach changes, one a line, as a file and a function
          - name: tests
            form: list
            says: every test the change adds, one a line, as a file and a test name
          - name: answers
            form: list
            says: every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft
          - name: size
            form: list
            says: every file the approach touches, one a line
      - name: tests-red
        does: writes the tests the ask calls for
        tags: ["code", "testing"]
        needs: ["branch test"]
        input: draft
        checklist: ["every done_when line meets a test that fails, or a checkpoint the hand answers where no command decides", "every door the tests reach has a fake"]
        evidence:
          - name: tests
            form: command
            expects: assertion
            says: the tests you write fail on their own assertion
          - name: red
            form: list
            says: every test file standing red until tests-green closes, one a line, which the check leaves out
          - name: seen
            form: text
            says: what you see, and what surprises you
  - name: gate
    gate: does the approach answer the ask, and does a red test decide every done_when line
    does: reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points
    not: design/draft
    tags: ["review"]
    input: ["design/draft", "design/tests-red"]
    evidence:
      - name: verdict
        form: verdict
        says: accept, accept with points naming a fix ticket a line, or reject with findings one a line
  - name: implement
    tags: ["code", "testing"]
    needs: ["branch test"]
    input: ["design/draft", "gate"]
    checklist: ["the change touches no file the ask leaves out", "every door the change reaches has a fake", "a comment names the approach the change implements", "every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
    steps:
      - name: change
        does: makes the change
        evidence:
          - name: lint
            form: command
            expects: 0
            says: the tree builds and lints
      - name: tests-green
        does: makes the tests pass
        input: design/tests-red
        to: retro
        evidence:
          - name: tests
            form: command
            expects: green
            says: the same tests pass
          - name: check
            form: command
            expects: 0
            says: the check is green on the commit
          - name: says
            form: text
            says: what changes and why, for a reader who was not there
  - name: accept
    gate: does the whole work answer the ask, and does every command of the route pass
    final: true
    when: backlog
    does: reads the diff since its last verdict against the ask and every prose criterion, and names what falls short as points
    not: implement/change
    tags: ["review", "accept"]
    input: ["ask", "implement"]
    evidence:
      - name: verdict
        form: verdict
        says: accept, accept with points naming a fix ticket a line, or reject with findings one a line
  - name: view
    does: reads the change in the view the ask names
    by: person
    when: view
    on_fail: implement
    to: retro
    input: ["ask", "implement/tests-green"]
    evidence:
      - name: seen
        form: verdict
        says: pass where the view shows the ask's number, or fail with what it shows
process: [[spec/processes/standard]]
process_hash: 22b42ea1501e8967
group: the-cloud-works-its-queue
depends_on: [dispatch-prints-its-plan, fix-groups-end-the-chain]
step: implement/tests-green
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box d7e093d924e2 · claude-code-remote
    hash_before: 92d2a92fd9306e5cc5888e0cf4191611aa91f4c4
    hash_after: 92d2a92fd9306e5cc5888e0cf4191611aa91f4c4
    inputs:
      - name: ask
        hash: cdb31e14a8203fe3
        size: 1517
      - name: [[spec/design_input/the-cloud-runs-itself]]
        hash: 5a2557d24d86ab34
        size: 13510
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d7e093d924e2 · claude-code-remote
    hash_before: 18d75c5ae31a8b7b7ec03c761e438cf8ccba156e
    hash_after: 18d75c5ae31a8b7b7ec03c761e438cf8ccba156e
    answered:
      - name: tests
        exit: 1
        said: assertion, 9 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: 199329f3676e2920
        size: 3307
    def: 08e16d07b0de477c
  - step: gate
    hand: box d7e093d924e2 · claude-code-remote · helper-4
    hash_before: 483c0bab95cee6554a6fc18dfa8a0fba75a62ccb
    hash_after: 483c0bab95cee6554a6fc18dfa8a0fba75a62ccb
    inputs:
      - name: design/draft
        hash: 199329f3676e2920
        size: 3307
      - name: design/tests-red
        hash: f77d5a0fe7fea05e
        size: 746
    def: dc4904ab364efa10
  - step: implement/change
    hand: box d7e093d924e2 · claude-code-remote
    hash_before: 4b24003f2daeecd22417108335f19badc4066f9b
    hash_after: 4b24003f2daeecd22417108335f19badc4066f9b
    answered:
      - name: lint
        exit: 0
        said: "spec/tickets/the-queue-views-agree.md:271:115: Sentence: A sentence holds 25 words. Cut this one in two."
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box d7e093d924e2 · claude-code-remote
    hash_before: 620ae89ca1419b6a583ed6abe2d56e8fcbc47202
    hash_after: 620ae89ca1419b6a583ed6abe2d56e8fcbc47202
    answered:
      - name: tests
        exit: 0
        said: green, 24 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-queue-views-agree.md:271:115: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: design/tests-red
        hash: f77d5a0fe7fea05e
        size: 746
    def: ec253787263043a7
  - step: accept
    skipped: true
    why: the delivery's acceptance reads this ticket
  - step: view
    skipped: true
    why: the ask names no view the owner reads
reason: done
---

# Ask

`./RUNME.sh dispatch` carries the plan out. It writes a fix group carrying `fix: true`, and moves each loose agent ticket under it through `group`. It opens `work/<name>` for each ready group standing with no branch. It commits every write onto `claude/dispatch-<commit>`, named after the `origin/main` commit it reads, and pushes that branch alone. The cloud marker a branch open writes rides that branch too, in place of a push to `main`. For the road, see [[spec/design_input/the-cloud-runs-itself#the-writes-ride-a-branch]].

Without it every loose agent ticket waits for a person to sort it into a group. A ready group waits for a desk to open its branch, and the dispatch skill starts workers on nothing.

- a case in `test/level0/dispatch.test.js` finds one fix group, holding the loose agent tickets
- a case there finds one commit on `claude/dispatch-<commit>`, and no push naming `main`
- a case there runs the verb twice over one `main`, and finds one branch and one commit
- a case there finds no write while an earlier `claude/dispatch-*` branch stands unmerged
- that case finds the verb still naming the workers to start
- a case there leaves a ticket for a person loose, and names it under the questions
- a case there opens `work/<name>` for a ready group with no branch, and leaves a standing one
- the fix group's name holds `names.words` at most
- `askFaults` in `src/scripts/ticket-ask-lint.js` finds nothing in the fix group's ask
- `./RUNME.sh check` exits 0

The view: none.

The source: none.

# design

## owner-read

<!-- reads the ask a handover carries, before any draft -->

### read

<!-- pass where the ask says what the owner said, or fail with the owner's words -->

<!-- the form is verdict -->

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->
<!-- the form is text -->

dispatch without --dry carries the plan out in src/scripts/dispatch.js, and --dry keeps printing it with no write. The run reads origin/main once, as the commit C it names, and the write branch is claude/dispatch-<short C>. Where any claude/dispatch-* branch stands on origin unmerged into origin/main, the run writes nothing and prints the plan, so the skill still starts the workers it names. Where claude/dispatch-<short C> stands already, the run writes nothing too, so a second run over one main makes no second commit. Otherwise it gathers the writes. A fix bundle mints one group ticket named loose-fixes-<short C>, through withRoute and mintedNote with the group process, carrying fix: true and an ask the dispatch writes, and each loose agent ticket takes group: that name. A ready group on origin/main standing with no work branch, open, carrying no cloud marker and waiting on nothing, opens: its work branch gets a commit off the trunk tree, pushed to work/<name>, and its ticket takes cloud: true. A ticket for a person stays loose, and the plan names it under questions. With writes in hand, the run adds a detached worktree at .se/.runtime/dispatch off origin/main, writes each file there through the disk door, and runs git -C on it: add, commit, push HEAD to refs/heads/claude/dispatch-<short C>. It then removes the worktree. No push names main, and the box checkout moves nowhere. The plan grows opens, the groups on main to open. askFaults in src/scripts/ticket-ask-lint.js reads the fix group ask before the write, and a fault stops the run with code 1.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/scripts/cli.js: the dispatch verb row, which already calls dispatch(it.work, rest, it)
- src/scripts/dispatch.js: planOf gains opens, and dispatch gains the write road
- src/scripts/process.js: withRoute copies the group route into the fix group
- .claude/skills/level0/lib/schema-mint.js: mintedNote writes the fix group text

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- test/level0/dispatch.test.js: the run writes one fix group carrying fix: true, holding the loose agent tickets
- test/level0/dispatch.test.js: the run makes one commit on claude/dispatch-<commit>, and no push names main
- test/level0/dispatch.test.js: a second run over one main finds the branch standing and writes nothing
- test/level0/dispatch.test.js: an unmerged claude/dispatch branch stops every write, and the plan still names the workers
- test/level0/dispatch.test.js: a ticket for a person stays loose, and stands under the questions
- test/level0/dispatch.test.js: a ready group on main with no branch opens work/<name>, and a group with a branch stays
- test/level0/dispatch.test.js: the fix group name holds names.words at most
- test/level0/dispatch.test.js: askFaults finds nothing in the fix group ask

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/scripts/dispatch.js
- src/scripts/dispatch-write.js
- test/level0/dispatch.test.js
- test/level0/work-doors.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- opened dispatch.js, work.js openGroup and markOff, work-merge.js marksTrunk, cli.js mint, process.js withRoute, schema-mint.js mintedNote, ticket-ask-lint.js askFaults and the git door, and each claim stands there
- the callers list names the verb row, the plan, the route copy and the mint
- each done_when line names its case, and ./RUNME.sh check decides the last

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test test/level0/dispatch.test.js

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- test/level0/dispatch.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Nine write cases fail on their own assertion, since the run without --dry answers 2 today. The case holding the run to --dry leaves, because this ask turns that road into the writes. The fake answer to the dispatch branch list reads what the run itself pushed, so the second run meets the branch the first one made, as a real remote does. The fix group mints over a seeded ticket schema and a small group process, and the ask meets the semicolon Vale the level0 cases use.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every done_when line meets a failing case, and ./RUNME.sh check decides the last
- the cases reach git, the disk and Vale through the fakes alone

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- dispatch-reuses-mark-off: the approach opens work/<name> on a commit off the trunk tree, which markOff in src/scripts/work.js already makes but does not export; export it and call it from dispatch, and add src/scripts/work.js to size, in place of a second copy
- dispatch-drops-the-trunk-marker: marksTrunk in src/scripts/work-merge.js commits and pushes main, so the open road must write cloud: true into the worktree and never call marksTrunk or openGroup; name that in the change comment
- dispatch-cuts-the-fix-name: loose-fixes-<short> holds three words, so a names.words below three overruns it; cut the name through cutTo in src/scripts/ticket.js, as the mint does
- dispatch-removes-its-worktree: no case holds the .se/.runtime/dispatch worktree removed and the box checkout unmoved after a run; add one beside the write cases
- dispatch-write-file-size: size names src/scripts/dispatch-write.js and test/level0/work-doors.js, and the tests-red diff needed no work-doors change; drop what the build leaves untouched, and drop the --dry-alone refusal naming this ticket from dispatch.js

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches dispatch.js, dispatch-write.js and dispatch.test.js, which the ask names; work.js exports markOff for dispatch-reuses-mark-off, and ticket.js exports cutTo for dispatch-cuts-the-fix-name, each on a point ticket's ask
- the git and front doors each take a fake in test/level0/dispatch.test.js, and the clock takes fakeClock
- the head comment of src/scripts/dispatch-write.js names the approach and links the-writes-ride-a-branch
- the branch cut calls markOff and the name cut calls cutTo, so neither stands twice

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh test test/level0/dispatch.test.js

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The dispatch verb now carries its plan out. It writes a fix group holding the loose agent tickets, and opens a work branch for each ready group standing with none. Every write rides one commit on a dispatch branch named after the trunk commit it reads, so no push names the trunk. Earlier the plan printed and nobody acted on it.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change stays inside the files the ask and its point tickets name
- the git, front and clock doors each take a fake in the dispatch tests
- the head comment of the write module names the approach and links its design
- the branch cut and the name cut each call the one function standing in the work and ticket modules

# accept

<!-- reads the diff since its last verdict against the ask and every prose criterion, and names what falls short as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->

<!-- the form is verdict -->

# view

<!-- reads the change in the view the ask names -->

## seen

<!-- pass where the view shows the ask's number, or fail with what it shows -->

<!-- the form is verdict -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

- The build commit `061bd246` touches these files, and the `size` list under the draft stands in its place:
  - `src/scripts/dispatch.js`
  - `src/scripts/dispatch-write.js`
  - `src/scripts/ticket.js`
  - `src/scripts/work.js`
  - `test/level0/dispatch.test.js`
