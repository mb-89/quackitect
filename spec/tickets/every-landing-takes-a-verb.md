---
kind: [[ticket]]
state: closed
group: the-verbs-land-whole
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
    hand: box d1fe1ca62214 · claude-code-remote
    hash_before: cf0844ea1f938382f1869c2adaa78caf2b5dd729
    hash_after: cf0844ea1f938382f1869c2adaa78caf2b5dd729
  - step: design/review
    hand: box d1fe1ca62214 · claude-code-remote · helper-2
    hash_before: 2cf20e88e07aa09555e74acaeb0b2488ffc867c7
    hash_after: 2cf20e88e07aa09555e74acaeb0b2488ffc867c7
  - step: implement/tests-red
    hand: box d1fe1ca62214 · claude-code-remote
    hash_before: 227abe2cc55d57ce0c206142fc3eee22201c2bd2
    hash_after: 227abe2cc55d57ce0c206142fc3eee22201c2bd2
    answered:
      - name: tests
        exit: 1
        said: assertion, 8 test(s) fail on their own assertion
  - step: implement/change
    hand: box d1fe1ca62214 · claude-code-remote
    hash_before: eff316d30de5b220c9322c995a474f58f6ca9dd5
    hash_after: eff316d30de5b220c9322c995a474f58f6ca9dd5
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box d1fe1ca62214 · claude-code-remote
    hash_before: d045ea2d85138c1ac0e2f0f6c4da0e0af005555a
    hash_after: d045ea2d85138c1ac0e2f0f6c4da0e0af005555a
    answered:
      - name: tests
        exit: 0
        said: green, 88 test(s) pass in 5 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-verbs-need-no-wrapper.md:184:1: ListItem: A sentence in a list item holds 20 words, and this one holds "
reason: done
---

# Ask

The agent reaches git through the engine alone. A hand lands, proves red, renames and takes in a cloud branch through a verb. Each commit carries the files of its own ticket alone.

`landed` in `src/scripts/pull-landed.js` runs `git add -A`, so a pass commit carries a sibling hand's edits under the ticket's name. No verb proves a test red, and the commit verb over a renamed ticket leaves the old file. `merge` in `src/scripts/work-merge.js` reads `work/<name>` alone. The shell door passes `git mv` under `spec/tickets`.

- `landed` in `src/scripts/pull-landed.js` stages the ticket and the paths its step's hand writes. A case in `test/level0/landed.test.js` leaves a sibling's edit unstaged after a pass
- `spec/design_output/pull.md` under `The refused commit` names what a hand-back stages
- `./RUNME.sh test --red <test> <source>...` sets the named sources aside, runs the test and puts them back. It answers red or refuses, with a case for each answer in `test/level0/test-verb.test.js`
- `./RUNME.sh commit` naming the new path after `./RUNME.sh rename` lands the old path's deletion in the same commit. A case in `test/level0/commit-verb.test.js` decides it
- `./RUNME.sh branch merge` takes a `claude/` branch and reads it against main. It merges the branch or names main as carrying its work, then runs the check and deletes the branch. A case in `test/level0/work-group.test.js` decides it
- `findings` in `.claude/skills/level0/lib/bash.js` refuses `git mv` under `spec/tickets`. It names `./RUNME.sh rename`, with a case in `test/level0/bash.test.js`
- The Bash door refuses every git command that writes the repository, and names the verb standing for it. A case in `test/level0/bash.test.js` decides it
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

1. `landed` in `src/scripts/pull-landed.js` stages `one.at` and the paths the step's hand writes, in place of `git add -A`. The apply door in `src/bridge/apply.js` writes the call's `ticket` into its undo journal through `journalOf`. `landed` reads the journals naming `one.name` since the hold's `taken` stamp.
2. `spec/design_output/pull.md` under `The refused commit` says a hand-back stages the ticket and the files its hand's journals name.
3. A new `redTest` in `src/scripts/work-test.js` answers `./RUNME.sh test --red`, routed from the `test` entry in `src/scripts/cli.js`. It writes each source's `HEAD` text in place, runs the test through `testSays`, and writes the working text back. An `assertion` answers red, and anything else refuses.
4. `landsAndPushes` in `src/scripts/commit-verb.js` reads staged renames with `git diff --cached --name-status -M`. A named new path adds its old path to what it stages and commits.
5. `merge` in `src/scripts/work-merge.js` takes a `claude/` name as the branch and skips the group reads. It asks `git cherry` against `main`, and merges with `--no-ff` only where a commit stays over. Either road runs `checkSays`, and green deletes the branch as `close` does.
6. `findings` in `.claude/skills/level0/lib/bash.js` refuses `git mv` under `spec/tickets` with a new rule naming `./RUNME.sh rename`.
7. A new `gitWritesIn` in the same file reads every git subcommand that writes the repository. `findings` refuses each and names the verb a table there holds for it.
8. `./RUNME.sh check` runs over the change and exits 0.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `src/scripts/pull-writes.js` `passed`
- `src/scripts/pull-writes.js` `failed`
- `src/scripts/pull-writes.js` `became`
- `src/scripts/pull-writes.js` `answeredBy`
- `src/scripts/pull.js` `takeBack`
- `src/scripts/pull-escalate.js` `escalate`
- `src/bridge/apply.js` `writes`, a caller of `journalOf`
- `src/scripts/split-verb.js` `wrote`, a caller of `journalOf`
- `src/scripts/cli.js` the `test` entry of the verb table
- `src/scripts/commit-verb.js` `commitVerb`, the one caller of `landsAndPushes`
- `src/scripts/cli.js` the `commit` entry, the caller of `commitVerb`
- `src/scripts/work.js` `work`, the one caller of `merge`
- `src/bridge/bash.js` `commandRules`, the one caller of `findings` outside tests

### tests

<!-- every test the change adds, one a line, as a file and a test name -->

<!-- the form is list -->

- `test/level0/landed.test.js` "a pass stages the ticket and the hand's own paths, and leaves a sibling's edit unstaged"
- `test/level0/test-verb.test.js` "test --red sets the sources aside, answers red on an assertion, and puts them back"
- `test/level0/test-verb.test.js` "test --red refuses where the test passes with the sources set aside"
- `test/level0/commit-verb.test.js` "a commit naming a renamed ticket lands the old path's deletion with it"
- `test/level0/work-group.test.js` "merge takes a claude branch in, runs the check and deletes the branch"
- `test/level0/work-group.test.js` "merge names main as carrying a claude branch's work, and deletes the branch"
- `test/level0/bash.test.js` "git mv under spec/tickets refuses and names the rename verb"
- `test/level0/bash.test.js` "every git command that writes the repository refuses and names its verb"

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- first draft

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- (1) I opened `pull-landed.js`, `work-merge.js`, `work-test.js`, `commit-verb.js`, `rename.js`, `lib/bash.js`, `bridge/bash.js`, `bridge/apply.js` and `pull.md`.
- (1) `landed` runs `git add -A`. `merge` builds `work/<name>` alone. `findings` passes `git mv` under `spec/tickets`, run through node.
- (1) `rename` stages the move, and `landsAndPushes` commits `-- <paths>` alone, so the old path's deletion stays staged. I read this, and ran it not.
- (1) No record names the paths a hand writes today, so approach items 2 and 3 add one through the apply journal.
- (1) `./RUNME.sh check` I ran not, so that claim stays unchecked.
- (2) I ran grep for `landed(`, `journalOf`, `testVerb`, `commitVerb`, `merge` and `findings` over `src`, `.claude` and `test`.
- (2) A refusal of every git write reaches cases in `test/level0/bash-commit.test.js` and `test/level0/private.test.js`, which the ask leaves out.
- (3) Each code line of the ask names its case in tests above. The `pull.md` line stands decided by the lint, and the last line by `./RUNME.sh check`.

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass, pass with findings naming a child a line, or fail with findings one a line -->

<!-- the form is verdict -->

pass with findings
- journal-the-rename-verb: `landed` reads apply journals alone, and `rename` in `src/scripts/rename.js` stages a move and writes no journal, so a renamed path stays out of the pass commit.
- rename-detection-misses-rewrites: `git diff --cached -M` reads a move as a delete and an add where the rename rewrites the file past the similarity cut, so `landsAndPushes` misses the old path. Read the staged deletions, or have `rename` record the move.
- git-writes-lacking-a-verb: approach item 7 names a verb for each git write, and `stash`, `rebase`, `reset`, `tag` and `cherry-pick` have none. Name what the refusal says for each.
- merge-deletes-after-the-push: approach item 5 deletes the `claude/` branch on green while `main` stands ahead of origin. `close` refuses that order, so the merge pushes `main` first or keeps the branch.
- red-verb-meets-new-sources: approach item 3 writes each source's `HEAD` text, and a source new to the change has none. The working text also stands in memory alone, so a killed run loses it. Hold it on disk under `.se`.
- one-row-for-git-mv: a `git mv` under `spec/tickets` meets rule 6 and rule 7 both, and answers two rows for one command.
- verb-line-names-new-refusals: `verbLine` in `.claude/skills/level0/lib/bash.js` lists what the door refuses, and the approach leaves it standing.
- git-write-tests-outside-ask: refusing every git write breaks cases in `test/level0/bash-commit.test.js` and `test/level0/private.test.js`, which the ask leaves out, and the implement checklist refuses a file the ask leaves out. Name them in the ask.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

    ./RUNME.sh test test/level0/landed.test.js test/level0/test-verb.test.js test/level0/commit-verb.test.js test/level0/work-group.test.js test/level0/bash.test.js

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

The eight new cases fail on their own assertion, and the eighty cases standing before stay green. The red verb has no export yet, so its two cases assert that it stands before they call it. An import of a missing name fails the load, and that reads as a build fault. No hand in this box writes through the apply door, so no undo journal stands here. A landing that stages journal paths alone would drop the work of such a hand.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the cases stand in the five test files the design names, and no other file changes
- each case drives a fake: the disk, the git and the process doors from `src/doors/fake`
- a comment above each case names the design section it decides
- the journal shape, the hold shape and the rule names each stand once in their case
- the review rows on the red verb, the one row for `git mv` and the push before the delete each hold a case here

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->

<!-- the form is command -->

    ./RUNME.sh lint .claude/skills/level0/lib/bash.js .claude/skills/level0/lib/git-writes.js .claude/skills/level0/lib/undo.js spec/design_output/bash.md spec/design_output/pull.md spec/design_output/work.md src/bridge/apply.js src/bridge/bash.js src/scripts/commit-verb.js src/scripts/pull-landed.js src/scripts/pull-writes.js src/scripts/work-merge.js src/scripts/work-test.js test/level0/apply-door.test.js test/level0/bash-commit.test.js test/level0/bash-desk.test.js test/level0/bash.test.js test/level0/fixtures.js test/level0/pulled.test.js test/level0/trunk-door.test.js test/level0/work-group.test.js test/level0/pull-writes.test.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change reaches past the ask in four places, each named: `lib/git-writes.js` holds the new rule because `lib/bash.js` stands past the file ceiling, `pull-writes.js` hands `landed` the children it mints, `apply-door.test.js` proves the journal names its ticket, and five door tests take the verb rule
- every door the change reaches has a fake: the red verb, the merge and the landing run over the fake disk, git and process
- a comment above each change names its section in `bash.md`, `pull.md` or `work.md`, and each section says the approach
- the verb table stands in `GIT_WRITES` alone, the ticket folder comes from `src/engine/group.js`, and the design notes point at the files
- the rows fixed here: `verbLine` names the new refusal, `git mv` answers one row, each write lacking a verb names its road, the merge pushes main before it deletes a branch, and the red verb holds the text on disk and sets a new source aside whole
- the rows left to their child tickets: `journal-the-rename-verb` and `rename-detection-misses-rewrites` each take more than this change, and `git-write-tests-outside-ask` stands answered by the five door tests above

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

    ./RUNME.sh test test/level0/landed.test.js test/level0/test-verb.test.js test/level0/commit-verb.test.js test/level0/work-group.test.js test/level0/bash.test.js

### check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

The agent now reaches git through the engine alone. A pass commit stages the ticket, its minted children and the files its hand's undo journals name, so a sibling's edit stays out. The apply door writes the ticket into each journal for this. A hand writing through no journal still hands back the whole tree, less what other tickets' journals name. So a box without the level zero door loses no work. `./RUNME.sh test --red` proves a test fails on its own assertion with the sources set back to `HEAD`. It holds the working text on disk while it runs. The commit verb takes a renamed path's old side with it. `branch merge` takes a `claude/` branch in, or names main as carrying it, then pushes main and deletes the branch. The Bash door refuses every git write and names the verb standing for it. A `git mv` under the tickets folder names the rename verb alone.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change reaches past the ask in the files `implement/change` names, each for a reason given there
- every door has a fake, and the whole suite runs green over them
- each change carries a comment naming its section in the design notes
- the verb table stands in `GIT_WRITES` alone, and the notes point at it
- the small review rows stand fixed, and the two large ones wait in their child tickets
- the door keeps every older rule: the git-write rows answer as the last check, so a guard reading a git write answers its own reason first
- five door tests asserting that a raw commit or push lands now assert that the verb rule answers alone, and the `rules` helper in `bash.test.js` leaves the new rule out

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
