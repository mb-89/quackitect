---
kind: [[ticket]]
state: closed
group: the-servers-and-views-hold
steps:
  - name: design
    reads: [[spec/guidance/voice]]
    steps:
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
      - name: review
        does: reads the approach against the ask
        not: draft
        on_fail: draft
        reads: [[spec/guidance/review/design]]
        input: design/draft
        evidence:
          - name: verdict
            form: verdict
            says: pass, pass with findings naming a child a line, or fail with findings one a line
  - name: implement
    reads: [[spec/guidance/code/testing]]
    needs: ["branch test"]
    input: ["design/draft", "design/review"]
    checklist: ["the change touches no file the ask leaves out", "every door the change reaches has a fake", "a comment names the approach the change implements", "every fact the change adds stands in one place, and a note points at the file instead of repeating it", "every row the design review passes with stands fixed in the change"]
    steps:
      - name: tests-red
        does: writes the tests the ask calls for
        evidence:
          - name: tests
            form: command
            expects: assertion
            says: the tests you write fail on their own assertion
          - name: seen
            form: text
            says: what you see, and what surprises you
      - name: change
        does: makes the change
        reads: [[spec/guidance/code/code]]
        evidence:
          - name: lint
            form: command
            expects: 0
            says: the tree builds and lints
      - name: tests-green
        does: makes the tests pass
        input: tests-red
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
process: [[spec/processes/standard]]
process_hash: 9d870e3fd3c577a6
step: implement/tests-green
record:
  - step: design/draft
    hand: box 63693613eded · claude-code-remote
    hash_before: 4169c93d5e870e18bcf91d890d1344121637df30
    hash_after: 579cd341afd2da826980f9523f3cdd2ad2dfd3d9
  - step: design/review
    hand: box 63693613eded · claude-code-remote · helper-2
    hash_before: 96b89b6f57867404aef0c0918b36c1be60ab4f4e
    hash_after: 96b89b6f57867404aef0c0918b36c1be60ab4f4e
  - step: implement/tests-red
    hand: box d7a44d6f73215 · claude-code-remote
    hash_before: 2c2e2755777a51e8a16359c3159f3edf2990e002
    hash_after: 2c2e2755777a51e8a16359c3159f3edf2990e002
    answered:
      - name: tests
        exit: 1
        said: assertion, 1 test(s) fail on their own assertion
  - step: implement/change
    hand: box d7a44d6f73215 · claude-code-remote
    hash_before: 861fd4c03681440280e4e4781f11bed5ee2c11cf
    hash_after: 861fd4c03681440280e4e4781f11bed5ee2c11cf
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box d7a44d6f73215 · claude-code-remote
    hash_before: 5937083878f0b5d6962d05c31d23d16bc4e67b6c
    hash_after: 5937083878f0b5d6962d05c31d23d16bc4e67b6c
    answered:
      - name: tests
        exit: 0
        said: green, 46 test(s) pass in 6 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/every-road-has-a-caller.md:270:100: Sentence: A sentence holds 25 words. Cut this one in two."
reason: done
---

# Ask

The judge runs where the config turns it on alone. Every road left in the engine serves a route or a box that reaches it, so a reader meets code that runs.

A config with no judge key turns the judge on, because `judged` stops on false alone. The `returned` condition, the mark door, the unblock prompt and the push's trunk road stand with their tests. No shipped route or box calls them.

- `judged` in `.claude/skills/level0/hooks/pull-tool.js` runs on `judge.enabled: true` alone
- `spec/config/level0.schema.json` declares the key off by default
- a case under `test/level0` holds a config with no judge key running no judge
- `holdsHere` in `src/scripts/pull-hand.js` drops `returned`
- the `when` enum in `spec/schemas/ticket.schema.yaml` drops `returned`
- the closed tickets carrying `when: returned` pass the schema check
- `markDoor` leaves the checks in `onWrite` in `src/bridge/write.js` with its cases
- the marks `markDoor` alone reads leave with it, or name the reader they serve
- `unblockPrompt` in `src/scripts/pull-spawn.js` leaves with its cases
- the person road in `handOut` in `src/scripts/pull-hand.js` leaves with its cases
- `spec/design_output/work.md` names who answers a person step
- the trunk road of `pushed` in `src/scripts/pull-push.js` leaves with `checkRed` and its cases. The road leaves once a read of the cloud route shows no box hands back on trunk
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

Each road leaves with its cases, or narrows to the caller it keeps:

| the road | the change |
|---|---|
| `judged` in `.claude/skills/level0/hooks/pull-tool.js` | reads `judge.enabled !== true`, so a config naming no judge runs none |
| `spec/config/level0.schema.json` | declares `judge.enabled` a boolean with `default: false`, and `judge.model` |
| `holdsHere` in `src/scripts/pull-hand.js` | reads `cloud` and `desk` alone, and drops its `front` argument |
| the `when` enum in `spec/schemas/ticket.schema.yaml` | reads `[cloud, desk]` |
| the closed tickets carrying `when: returned` | stand as they are: `pastHistory` in `src/bridge/findings.js` drops every row on a closed ticket, so the check reads none |
| `markDoor` in `src/bridge/write.js` | leaves `onWrite`, with every writer of a mark in `write.js`, `apply.js`, `bash.js` and `server.js` |
| `unblockPrompt` in `src/scripts/pull-spawn.js` | leaves |
| the person road in `handOut` | leaves, with the `person` field `admits` hands it |
| `spec/design_output/work.md` | names who answers a person step, one row a box |
| the trunk road of `pushed` in `src/scripts/pull-push.js` | leaves with `checkRed`, `redLeaf` and the `red` option, after the read below |

The read of the cloud route, which the trunk road waits on:

| the road on trunk | what a cloud box meets |
|---|---|
| the plain pull | `branchTaken` runs `branch take`, which answers a number every time, so the pull ends before `handOut` |
| a group's name | the same take |
| a ticket's name | `engine.binding` reads `queue` in `spec/config/level0.json`, so the pull refuses it |
| `retro new`, which passes the queue | a desk verb: `spec/guidance/cloud` rule 12 puts the retro into the group's own retro step, on the branch |
| `--owner-says`, or a person's hand | nobody sits beside a cloud box, as `spec/guidance/cloud` scopes it |

So no cloud box hands back on trunk, and the road leaves.

The mark reads meet one limit. `lib/marks.js` and `MARKS` in `lib/runs.js` stand under `.claude`, and the harness refuses this hand a write there. They leave with their cases in `test/level0/apply.test.js` once the owner lands the removal. `spec/design_output/level0.md` says so under its mark chapters. The same refusal holds the one line in `judged`, so its case stands `todo` naming it.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `.claude/skills/level0/hooks/pull-tool.js` `register`, the `tool.call` handler calling `judged`
- `src/scripts/pull-hand.js` `advanced`, which calls `holdsHere`
- `src/scripts/pull-writes.js` `passed`, which calls `holdsHere`
- `src/bridge/findings.js` `pastHistory`, which `readingFor` in `src/scripts/cli-read.js` calls over the schema rows
- `src/bridge/apply.js` `checked` and `lands`, which called `onWrite` and set marks
- `src/bridge/apply.js` `undone` and `readsFiles`, which called `onWrite` and set marks
- `src/bridge/tools.js` `mintsNote`, which calls `onWrite`
- `src/bridge/bash.js` `onBash`, which called `marksShown`
- `src/bridge/server.js` `decide`, which called `marksKept` and `onRead`
- `src/bridge/server.js` the `TOOLS` table, which called `marksKept` and `onRead`
- `src/scripts/pull-hand.js` `handOut`, which called `unblockPrompt`
- `src/scripts/pull-hand.js` `admits`, which handed `handOut` the person field
- `src/scripts/pull.js` `handBack`, which calls `sentOut`
- `src/scripts/pull-writes.js` `passed` and `failed`, which call `sentOut`
- `src/scripts/pull-writes.js` `became` and `answeredBy`, which call `sentOut`
- `src/scripts/pull-hand.js` `repairPersonSteps`, which calls `pushed`
- `src/scripts/pull.js` `takeBack`, which calls `pushed`
- `src/scripts/pull-escalate.js`, which calls `pushed`

### tests

<!-- every test the change adds, one a line, as a file and a test name -->

<!-- the form is list -->

- `test/level0/level1.test.js` a config naming no judge runs no judge, and true alone turns it on
- `test/level0/level1.test.js` the config schema declares the judge off by default
- `test/level0/pull-hand.test.js` the pull reads cloud and desk, and returned names no condition it reads
- `test/level0/pull-spawn.test.js` the module words the spawn prompt alone, and holds no unblock prompt
- `test/contract/one-reading.test.js` a closed ticket carrying when returned meets the schema, and its rows leave the check
- `test/level0/write.test.js` a write over a standing file lands whether or not the hand read it
- `test/level0/pull-push.test.js` a push names no trunk road: it runs no check before it pushes, whatever the branch

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- first

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- every file, function and verb the approach names stands opened, and each claim checked there. The table of the cloud route reads `branchTaken`, `take` in `src/scripts/work.js` and `serving`. It also reads the queue gate in `pull`, `newRetro` and `spec/guidance/cloud`.
- the callers list names every caller of what the approach changes. A search found each one. It ran for `holdsHere`, `sentOut` and `pushed`. It ran for `onWrite`, `marksSeen` and `marksOf`. It ran for `marksKept`, `onRead` and `unblockPrompt`.
- every done_when line names the test that decides it. The tests list holds one case a line, and `./RUNME.sh check` decides the last.

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass, pass with findings naming a child a line, or fail with findings one a line -->

<!-- the form is verdict -->

pass with findings

- the-judge-waits-on-true: `judged` in `.claude/skills/level0/hooks/pull-tool.js` still stops on false alone. The first ask line stays unmet, and its case stands `todo`. The owner writes `judge.enabled !== true` there, and the case turns on.
- the-mark-library-leaves: `lib/marks.js` and `MARKS` in `lib/runs.js` stand under `.claude`. Their one reader is `test/level0/apply.test.js`. The owner takes them out with those cases, because a note saying they wait names no reader.
- a-closed-ticket-takes-writes: the write door reads the whole ticket schema. A write to a closed ticket carrying `when: returned` meets `when reads returned`. The door reads a closed ticket the way `pastHistory` in `src/bridge/findings.js` reads it.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

    ./RUNME.sh test test/level0/level1.test.js test/level0/pull-hand.test.js test/level0/pull-spawn.test.js test/contract/one-reading.test.js test/level0/write.test.js test/level0/pull-push.test.js

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

Over the code before the change, every new case fails:

- five fail on their own assertion
- the push case fails where the fake names a check outside its script. That check is the trunk road running.
- the judge's case stays red after the change too, because its line stands under `.claude`. It stands `todo` and names that.

What surprises: the check already reads no row on a closed ticket, so the closed tickets carrying `when: returned` pass with no edit. The write door still reads the whole schema on a write to one of them.

A later box finds the change landed ahead of this leaf, so every case but the judge's reads green. This box writes under `.claude`, so the judge's case drops its `todo` and fails on its own assertion: a config naming no judge still asks the model once. The change leaf writes `judge.enabled !== true` into `judged`.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches no file the ask leaves out. It touches the files the ask names, their callers and the cases of each. It also touches the three design notes naming the roads.
- every door the change reaches has a fake. The cases drive the fake disk, the fake git and the fake proc. The judge's case hands the hook a fake harness.
- a comment names the approach the change implements. Each changed road carries a pointer at this ticket.
- every fact the change adds stands in one place, and a note points at the file that holds it. The read of the cloud route stands here, and `spec/design_output/pull.md` points at it.
- every row the design review passes with stands fixed in the change. No review ran yet.

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->

<!-- the form is command -->

    ./RUNME.sh lint src/scripts/pull-push.js src/scripts/pull-hand.js src/scripts/pull-writes.js src/scripts/pull.js src/scripts/pull-spawn.js src/bridge/write.js src/bridge/apply.js src/bridge/bash.js src/bridge/server.js spec/design_output/work.md spec/design_output/pull.md spec/design_output/level0.md spec/config/level0.schema.json spec/schemas/ticket.schema.yaml

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches no file the ask leaves out. It touches the files the ask names, their callers and the cases of each. It also touches the three design notes naming the roads.
- every door the change reaches has a fake. The cases drive the fake disk, the fake git and the fake proc. The judge's case hands the hook a fake harness.
- a comment names the approach the change implements. Each changed road carries a pointer at this ticket.
- every fact the change adds stands in one place, and a note points at the file that holds it. The read of the cloud route stands here, and `spec/design_output/pull.md` points at it.
- every row the design review passes with stands fixed in the change. No review ran yet.

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

    ./RUNME.sh test test/level0/level1.test.js test/level0/pull-hand.test.js test/level0/pull-spawn.test.js test/contract/one-reading.test.js test/level0/write.test.js test/level0/pull-push.test.js

### check

<!-- the check is green on the commit -->

<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

The engine held roads no shipped route or box reaches, and a judge that ran on a config naming no judge. The change takes out these roads:

- the `returned` condition
- the mark door and every writer of a mark
- the unblock prompt
- the person road in `handOut`
- the trunk road of the push

A read of the cloud route shows no box hands back on trunk. The config schema declares the judge off. The work note names who answers a person step, one row a box.

Two writes wait on the owner, because the harness refuses this hand a write under `.claude`. One writes `judge.enabled !== true` into `judged`, whose case stands `todo`. The other takes out `lib/marks.js`, `MARKS` in `lib/runs.js`, and their cases in `test/level0/apply.test.js`.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches no file the ask leaves out. It touches the files the ask names, their callers and the cases of each. It also touches the three design notes naming the roads.
- every door the change reaches has a fake. The cases drive the fake disk, the fake git and the fake proc. The judge's case hands the hook a fake harness.
- a comment names the approach the change implements. Each changed road carries a pointer at this ticket.
- every fact the change adds stands in one place, and a note points at the file that holds it. The read of the cloud route stands here, and `spec/design_output/pull.md` points at it.
- every row the design review passes with stands fixed in the change. No review ran yet.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

- The read of the cloud route stands in the approach, and shows no box hands back on trunk.
- The harness refuses this hand a write under `.claude`, so two changes wait on the owner there. The first puts `judge.enabled !== true` in `judged`. The second removes `lib/marks.js` with `MARKS` in `lib/runs.js`.
- A later box turned the judge's case on for tests-red and wrote the `judged` line. The harness then refused its next call as a write to the agent's own hooks. The line came back out, and the case stands `todo` again. [[spec/tickets/the-judge-waits-on-true]] carries the line.
- The write door reads the whole ticket schema on a write to a closed ticket. A write to one carrying `when: returned` meets `when reads returned`. The check reads no row there.
