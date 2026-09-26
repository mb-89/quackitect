---
kind: [[ticket]]
state: open
group: each-thing-stands-in-place
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
    hand: box b8ae1b45d463 · claude-code-remote
    hash_before: 366f68ec11412f3d513b56a640c0f69d89f0bc87
    hash_after: 369d2106e7cf9c3ad1e7c838fcfc2f6f636f2dcd
  - step: design/review
    hand: box b8ae1b45d463 · claude-code-remote · helper-2
    hash_before: d24e17b72c02718522f6ded893a0075bb2b7890c
    hash_after: d24e17b72c02718522f6ded893a0075bb2b7890c
    returns: 1
    why: "the keep pushes the raw transcript to the remote, and a transcript carries the owner's name, email, home and note text, which the private half keeps home. `git hash-object` and `git commit-tree` walk past the commit door, so the draft's assumption that the door keeps a transcript off git holds for no commit this approach makes. For details, see [[spec/design_output/private#the-run-and-the-token]]; the keep leans on the cloud proxy taking a push to `refs/transcripts/<group>`, and the draft checks it nowhere. A box's proxy takes a push to a branch, and a refused keep answers `1` on every `branch done`, so the group stays held and never leaves; the group ticket's `retro` step already holds the box's own account of its transcript: `write` asks `badly` with its moment in the transcript and `thoughts` off the transcript, and `cloud` asks `lacked`, `met` and `left`. That chapter lands on trunk with `branch merge`, so `cloudInto` reading it answers the first two ask lines with no ref, no keep and no change to `leaves` in `src/scripts/work.js`; the fourth ask line stands against the private half as written. Name the answer the redraft gives it: the `write` step reads the transcript on the box and the chapter carries its account, or the ask goes back to the owner to drop the line; the third ask line, a cloud transcript beside the desk's own, falls with the fourth. The redraft reads the chapter's `badly` and `thoughts` beside the desk transcript over the hours the chapter covers; the composition with `the-retro-finishes-its-asks` still reads true: `copyTree` takes `window` last, `outsideInto` alone passes it, and `keptInto` copies `KEPT`, which `movedInto` skips. A redraft keeping `cloudInto` after `outsideInto` still meets separate hunks; the count and the second pass carry into the redraft as drafted: `sourceOf` names `groups`, and a group under `input/groups` stays out of `--again`"
  - step: design/draft
    hand: box b8ae1b45d463 · claude-code-remote
    hash_before: 8ea93b0107a57e656f1797d2e27dea0807ae3b03
    hash_after: 8ea93b0107a57e656f1797d2e27dea0807ae3b03
  - step: design/review
    hand: box b8ae1b45d463 · claude-code-remote · helper-4
    hash_before: 86aee6b0b70d99e4b2260b41ba8d139724e4b404
    hash_after: 86aee6b0b70d99e4b2260b41ba8d139724e4b404
  - step: implement/tests-red
    hand: box b8ae1b45d463 · claude-code-remote
    hash_before: 0ef134b9e64f715bdb95f9eec008db798389bd24
    hash_after: 0ef134b9e64f715bdb95f9eec008db798389bd24
    answered:
      - name: tests
        exit: 1
        said: assertion, 5 test(s) fail on their own assertion
  - step: implement/change
    hand: box b8ae1b45d463 · claude-code-remote
    hash_before: 5be1329cf2bf31fd630319550495a06d5c3268df
    hash_after: 0c1e146737aecc6ec7c1d3eb80cb6bc1d217473a
    answered:
      - name: lint
        exit: 0
        said: "spec/tickets/the-small-faults-land.md:184:5: Characters: The character ] stands outside the set a paragraph admits: lett"
---

# Ask

A retro reads what each cloud box writes of its own run, so the cloud's work in the window reaches the findings.

A cloud group writes its own retro into the group ticket, and no retro verb reads it. The box's transcript leaves with its branch, so the retro names the cloud's work as a limit.

- `retro collect` in `src/scripts/retro-collect.js` gathers the `retro` chapter of every group ticket that closes in the window. A case in `test/level0/retro-collect.test.js` decides it
- `spec/guidance/retro/read.md` hands each of those chapters to the reader whose hours hold the close
- the chapter readers read each cloud transcript beside the desk's own, over the hours it covers
- a cloud box's hand-back of a group keeps the session transcript where `retro collect` reads it once the branch leaves. A case under `test/level0` decides it
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

The group ticket's `# retro` chapter is the box's own account of its run, and `retro collect` gathers it off trunk:

| the part | the change | where |
|---|---|---|
| the account | the `write` step asks the run's owner prompts and errors off the transcript, each with its time | `spec/processes/group.yaml` |
| the landing | the chapter reaches trunk with `branch merge`, as every group ticket does | no change |
| the groups of the window | `cloudInto` lists the group tickets a commit since `since` closes | `src/scripts/retro-collect.js` |
| the chapter | `cloudInto` writes the `# retro` section to `input/groups/<group>.md`, and the close to `input/groups/closed.json` | `src/scripts/retro-collect.js` |
| the collect | `collect` calls `cloudInto` after `outsideInto`, and merges its refusals | `src/scripts/retro-collect.js` |
| the count | `sourceOf` names `groups` as a source, so the count prints the chapters | `src/scripts/retro-collect.js` |
| the reader | a rule hands each chapter to the reader whose hours hold its close | `spec/guidance/retro/read.md` |

No transcript leaves the box. The approach adds no ref and no keep, and `leaves` in `src/scripts/work.js` stands as it is.

The answer this design gives the third and the fourth ask line:

- a transcript carries the box's names, and `privateIn` in `.claude/skills/level0/lib/private.js` keeps them off git
- so the group's `# retro` chapter stands in for the cloud transcript, off the transcript on the box
- the chapter passes the commit door as every tracked line does, since `branch merge` lands it
- the readers read the chapter's `badly`, `thoughts` and owner prompts beside the desk transcript, over the hours it covers
- the hand-back keeps the account where `retro collect` reads it, on trunk, and the transcript stays on the box
- this departs from the two lines as written, and the redraft names it for the owner at the merge

The change to the `write` step in `spec/processes/group.yaml`:

- `badly` says: what did not go well, each error of the run and each owner prompt turning it, with its time
- a checklist line reads: the chapter carries the run's owner prompts and errors off the transcript, each with its time
- a checklist line reads: the chapter says the role, and carries no name, address or path of the box
- `baseOf` in `src/scripts/ticket-drift.js` reads a ticket's route off the hash it copies, so a standing group keeps its route

The collect reads the window off git, through `it.git.run`:

- `git log --since` over `spec/tickets` with `-G "^state: closed"` and `--name-only` names the candidates
- a candidate counts where `isGroup` holds and `fieldOf` reads `state` as `closed`, both in `src/engine/group.js`
- the close is the commit time of the newest commit in that log naming the ticket
- `chapterOf` in `src/scripts/pull-chapter.js` finds the `retro` section, and `cloudInto` writes it with its headings
- a group under `input/groups` stays out of a second pass, so `--again` takes each group once
- a group with no `# retro` text writes nothing, and the print names it

The chapter readers need no new verb:

- `TIMED` in `src/engine/retro/timeline.js` reads `transcripts` and `log` alone, so `input/groups` adds no timed line
- `retro chapters` places the desk lines as it does now, and no chapter meets a line past its cuts
- the rule in `read.md` reads `closed.json`, and the reader whose `from` and `to` hold a close reads that chapter file
- a finding names its evidence as `input/groups/<group>.md` and a line, as rule `6` asks

This composes with `the-retro-finishes-its-asks`:

- `copyTree` takes `window` last, and `outsideInto` alone passes it, so `cloudInto` leaves the cut alone
- `keptInto` copies `KEPT`, which `movedInto` skips, and this change leaves both as they stand
- `cloudInto` runs after `outsideInto`, so the two changes to `collect` meet separate hunks

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `src/scripts/retro.js`, `retro`, through `collect`
- `src/scripts/retro-collect.js`, `collect`, through `cloudInto`
- `src/scripts/retro-collect.js`, `linesOf`, through `sourceOf`
- `src/scripts/retro-collect.js`, `countsOf`, over the `from` that `sourceOf` names
- `src/scripts/retro-collect.js`, `said`, over the counts `countsOf` answers
- `src/scripts/ticket-drift.js`, `baseOf`, over the history of `spec/processes/group.yaml`
- `spec/processes/retro.yaml`, the step reading `spec/guidance/retro/read.md`

### tests

<!-- every test the change adds, one a line, as a file and a test name -->

<!-- the form is list -->

- `test/level0/retro-collect.test.js`, "collect gathers the retro chapter of every group closing in the window, with its close"
- `test/level0/retro-collect.test.js`, "a group closing before the window stays out, and a ticket closing that is no group stays out"
- `test/level0/retro-collect.test.js`, "a second pass takes each group once, and the count prints the groups"
- `test/level0/process.test.js`, "the group's write step asks the owner prompts and errors of the run off the transcript, with their times"

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- the keep pushes the raw transcript: no transcript leaves the box, and the approach drops the ref and the keep
- the proxy and the refused keep: no push past `branch merge`, so `branch done` meets no new refusal
- the group's `retro` step holds the box's account: `cloudInto` reads that chapter off trunk, and `leaves` stands as it is
- the fourth ask line: the `write` step reads the transcript on the box, and the chapter carries its account
- the third ask line: the readers read the chapter beside the desk transcript, over the hours its close falls in
- the composition with `the-retro-finishes-its-asks`: `cloudInto` runs after `outsideInto`, and the hunks stay separate
- the count and the second pass: `sourceOf` names `groups`, and a group under `input/groups` stays out of `--again`

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- [x] every file, function and verb the approach names stands opened, and each claim checked there: `retro-collect.js`, `retro-outside.js`, `group.js`, `pull-chapter.js`, `timeline.js`, `chapters.js`, `ticket-drift.js`, `private.js`, `group.yaml` and `read.md` stand read
- [x] the callers list names every caller of what the approach changes: a search for `collect(`, `sourceOf`, `countsOf`, `processes/group` and `retro/read` over `src`, `.claude`, `spec` and `test` backs it
- [x] every done_when line names the test that decides it: the first two lines map to the `retro-collect.test.js` cases, the next two to the `process.test.js` case, the last to `./RUNME.sh check`

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass, pass with findings naming a child a line, or fail with findings one a line -->

<!-- the form is verdict -->

pass

- the redraft names its departure from ask lines 3 and 4 plainly: `privateIn` in `.claude/skills/level0/lib/private.js` keeps the box names a transcript carries off git, so the group's `# retro` chapter stands in for the transcript, and the transcript stays on the box. The owner reads that departure at the merge
- the case the draft names for the `write` step reads the real `spec/processes/group.yaml`, and a case under `test/level0` takes fakes alone. The builder writes it in `test/contract/process.test.js`, and a fake-git case in `test/level0/retro-collect.test.js` decides that the chapter reaches `retro collect` once the branch leaves
- the close the draft reads is the commit time of the box's own closing commit, and `branch merge` in `src/scripts/work-merge.js` lands it later with `merge --no-ff`. A group the box closes before the last retro's collect and trunk takes after it falls outside both windows. The builder reads the close off the trunk commit that lands the ticket, such as `git log --first-parent` with `--diff-merges=first-parent`
- rule 1 in `spec/guidance/retro/read.md` holds a reader to its chapter's lines. The builder writes the new rule as the one reach past them, so the two rules read as one
- the fake git in `test/level0/retro-collect.test.js` answers `abc123` to every call, so the new cases need a fake answering `log` and the ticket text by its arguments

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

    ./RUNME.sh branch test test/level0/retro-collect.test.js test/contract/process.test.js

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

Five cases fail on their own assertion, and the rest stand green:

- `collect` writes no `input/groups` file, so the gather, the no-text print and the second pass fail
- the `write` step in `spec/processes/group.yaml` asks no owner prompt, so its contract case fails
- `spec/guidance/retro/read.md` names no `input/groups/closed.json`, so the reader rule case fails
- the case on a group before the window and a ticket that is no group passes now, as a guard
- `trunkGit` answers `rev-parse`, `log` and `show` by their arguments, and every older case now runs on it
- the surprise: the fake needs its own `-G` over the lines a commit adds or drops, else an edit reads as a close

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- [x] the change touches no file the ask leaves out: the tests touch `retro-collect.test.js` and `process.test.js` alone
- [x] every door the change reaches has a fake: `trunkGit` stands on `fakeGit`, and the disk is `fakeDisk`
- [x] a comment names the approach the change implements: each new case and helper carries `[[spec/tickets/the-retro-reads-cloud-retros]]`
- [x] every fact the change adds stands in one place, and a note points at the file instead of repeating it: the fake reads `TRUNK` off `trunk.js`
- [x] every row the design review passes with stands fixed in the change: the `write` case sits in `test/contract`, the close reads off the first-parent merge, the reach case reads rule one, and the fake answers by arguments

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->

<!-- the form is command -->

    ./RUNME.sh lint

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- [x] the change touches no file the ask leaves out: `retro-collect.js`, `group.yaml`, `read.md` and its rationale, the git fake and the tests
- [x] every door the change reaches has a fake: `cloudInto` reaches git alone, and `fakeTrunk` in `src/doors/fake/git.js` answers it
- [x] a comment names the approach the change implements: `cloudInto`, `landingsOf`, `retroChapterOf` and `fakeTrunk` carry `[[spec/tickets/the-retro-reads-cloud-retros]]`
- [x] every fact the change adds stands in one place, and a note points at the file instead of repeating it: `GROUPS`, `CLOSES` and `COMMIT_MARK` stand once, and `TRUNK` and `CLOSED` are imported
- [x] every row the design review passes with stands fixed in the change: the close reads off `git log --first-parent --diff-merges=first-parent`, and rule `10` is the one reach rule `1` names

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

### check

<!-- the check is green on the commit -->

<!-- the form is command -->

### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
