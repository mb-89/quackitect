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
    hash_before: 0de3b3f411719a815d051fc6a474343c6473abc3
    hash_after: 0de3b3f411719a815d051fc6a474343c6473abc3
  - step: design/review
    hand: box d1fe1ca62214 · claude-code-remote · helper-2
    hash_before: 418083ca590f33bed4555e29790a1c6d8a3097ee
    hash_after: 418083ca590f33bed4555e29790a1c6d8a3097ee
  - step: implement/tests-red
    hand: box d1fe1ca62214 · claude-code-remote
    hash_before: c2daf2b5c9cdea96ef9621e07707b0b119fd72c3
    hash_after: c2daf2b5c9cdea96ef9621e07707b0b119fd72c3
    answered:
      - name: tests
        exit: 1
        said: assertion, 3 test(s) fail on their own assertion
  - step: implement/change
    hand: box d1fe1ca62214 · claude-code-remote
    hash_before: b725878524324842e809751c050743c08ddff6a9
    hash_after: b725878524324842e809751c050743c08ddff6a9
    answered:
      - name: lint
        exit: 0
        said: ".claude/skills/level0/lib/trunk.js:11:1: correctness/noUnusedVariables: This variable GIT_VERB is unused."
  - step: implement/tests-green
    hand: box d1fe1ca62214 · claude-code-remote
    hash_before: a3c74ed07261114e934e72efb9d858df1737d855
    hash_after: a3c74ed07261114e934e72efb9d858df1737d855
    answered:
      - name: tests
        exit: 0
        said: green, 84 test(s) pass in 4 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-verbs-need-no-wrapper.md:184:1: ListItem: A sentence in a list item holds 20 words, and this one holds "
reason: done
---

# Ask

A read, a grep and a scratch write pass the shell door, and a landing behind a pipe meets it. A pure move commits with no test, and the pull tool and the shell verb read one hand.

`GIT_VERB` in `.claude/skills/level0/lib/trunk.js` matches `git push` or `git commit` anywhere in the text, so a read quoting either meets the commit verb refusal. `LandingFollowsItsGate` refuses a read before `;` and passes a pipe before `&&`. The harness scratchpad reads as a tree path, and a pure move asks a test. The pull tool runs the verb with no harness env.

- `touchesGit` in `.claude/skills/level0/lib/trunk.js` reads git as the command word of a segment. A case in `test/level0/trunk.test.js` passes a grep whose quoted pattern names `git push` or `git commit`
- `LandingFollowsItsGate` in `.claude/skills/level0/lib/bash.js` passes a read-only segment before `;` and refuses a pipe before `&&` ahead of a landing. Both cases stand in `test/level0/bash.test.js`
- `FREE` in `.claude/skills/level0/lib/bash.js` takes the harness scratchpad, and a case in `test/level0/bash.test.js` passes a redirect into it
- `untestedIn` in `.claude/skills/level0/lib/tested.js` passes a delta whose lines move and change nothing, with a case in `test/level0/tested.test.js`
- `.claude/skills/level0/hooks/pull-tool.js` runs the verb under the session's harness env. A case in `test/level0/level1.test.js` reads the hand the tool's pull takes as the hand the shell verb reads
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

Each fix stays inside the function the ask names, and reads the command through the tokenizer `lib/tokens.js` already owns.

1. `touchesGit` in `lib/trunk.js` splits the command on `tokensOf` breaks, and reads `commit` or `push` where `git` is the command word of a segment, past the `PASSES` prefixes and the `-C <dir>` style flags `GIT_VERB` skips today. `gitSaid` and `VERB_WORDS` stay for `landsOnTrunk`, which reads the push refs.
2. `landingsAfterGates` in `lib/bash.js` settles a segment against the segment before it: a segment whose landing follows `;`, `||` or `&` refuses only where the segment before it runs a gate, as a test, a check or a commit. A read-only segment, as `cat`, `grep`, `ls` or `git status`, gates nothing. A pipe counts as a gate break, so `./RUNME.sh check | tail && git commit` refuses, because the pipe answers the exit of `tail`.
3. `FREE` in `lib/bash.js` takes the harness scratchpad shape, a `scratchpad` folder under a `claude-*` folder, beside `/tmp`, so a desk whose scratchpad stands outside `/tmp` writes there freely.
4. `untestedIn` in `lib/tested.js` drops a file whose added lines and removed lines hold the same multiset, trimmed, so a move inside a file asks no test.
5. `toolCall` in `hooks/pull-tool.js` passes `{ env }` to `$.process.run`, carrying the harness keys `HARNESS` in `src/scripts/pull-hand-of.js` names off `process.env`, so `handOf` reads the same agent in the tool and the shell verb.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `src/bridge/bash.js` `todoOnPush`, `deskGuard` and `trunkGuard` call `touchesGit`
- `.claude/skills/level0/lib/trunk.js` `landsOnTrunk` calls `touchesGit`
- `.claude/skills/level0/lib/copilot-runtime.js` calls `landsOnTrunk`
- `.claude/skills/level0/lib/bash.js` the rules loop calls `landingsAfterGates`
- `.claude/skills/level0/lib/bash.js` `reaches` and `landing` read `FREE`
- `.claude/skills/level0/lib/scripted.js` reads `FREE`
- `src/bridge/bash.js` the tested guard calls `untestedIn`
- `src/scripts/precommit.js` calls `untestedIn`
- `.claude/skills/level0/hooks/pull-tool.js` `pulled` and `judged` call `toolCall`

### tests

<!-- every test the change adds, one a line, as a file and a test name -->

<!-- the form is list -->

- `test/level0/trunk.test.js` "a read quoting git push or git commit touches no git"
- `test/level0/bash.test.js` "a read before ; gates nothing, and a landing after it passes"
- `test/level0/bash.test.js` "a pipe before && ahead of a landing refuses"
- `test/level0/bash.test.js` "a redirect into the harness scratchpad passes"
- `test/level0/tested.test.js` "a delta whose lines move and change nothing asks no test"
- `test/level0/level1.test.js` "the pull tool runs the verb under the harness env the shell verb reads"

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- first draft

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- every function named above stands opened in its file, and `$.process.run` takes its options object in `hooks/level0.js` and `hooks/pull-tool.js`; the `env` key there is unchecked against the engine surface, and the level1 test fakes it
- the callers list comes off a grep for each changed name over `src`, `.claude` and `test`
- every done_when line maps to one test above, and `./RUNME.sh check` decides the last

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass, pass with findings naming a child a line, or fail with findings one a line -->

<!-- the form is verdict -->

pass with findings
- a-nested-git-still-lands: `touchesGit` reading git as the command word misses `bash -c "git push origin main"` and `xargs git commit`, which `GIT_VERB` catches today, so `trunkGuard` in `src/bridge/bash.js` and `landsOnTrunk` in `lib/copilot-runtime.js` pass a trunk push; read into a `SHELLS` `-c` body the way `writesAPath` in `lib/bash.js` does, and add a `trunk.test.js` case
- only-a-read-gates-nothing: step 2 names both a gate list (a test, a check, a commit) and a read list (`cat`, `grep`, `ls`, `git status`); refuse every segment before `;`, `||` or `&` except one on a read list, so an unnamed gate still refuses
- a-reorder-asks-a-test: an added and removed multiset match in `untestedIn` passes a reorder of statements, as a `return` moved above a call, which changes code; pass only a block moved whole, contiguous lines kept in order, and add a `tested.test.js` case where a reorder still asks a test
- pull-env-meets-the-engine: the `env` key on `$.process.run` stands unchecked against the engine, and the `level1.test.js` case fakes it, so that done_when line passes while the real tool still runs with no harness env; check the engine surface first, or have the verb read `--tool` input carrying the agent
- the-scratchpad-reads-absolute: anchor the `FREE` scratchpad pattern to an absolute path, as `^/.*/claude-[^/]+/.*/scratchpad/`, since the harness nests the scratchpad below a project folder and a session id, and a relative tree path holding `claude-*/…/scratchpad` stays under the rules

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

    ./RUNME.sh test test/level0/bash.test.js test/level0/level1.test.js

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

Three cases fail on their own assertion: a read before `;` still gates, a scratchpad outside `/tmp` meets the write rule, and the pull tool hands the verb no env. The trunk case and the move case stand green already, because `a-nested-git-still-lands` and `a-reorder-asks-a-test` landed them first.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches `lib/bash.js`, `hooks/pull-tool.js` and their tests, which the ask names
- every door the change reaches has a fake: the level1 case fakes `$.process.run`
- a comment above each change names this ticket
- the scratchpad shape stands in `FREE` alone, and the read words stand in one set in `lib/bash.js`
- the review rows each stand as a child ticket, and the two landed children hold their rows

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->

<!-- the form is command -->

    ./RUNME.sh lint .claude/skills/level0/lib/bash.js .claude/skills/level0/hooks/pull-tool.js .claude/skills/level0/lib/trunk.js .claude/skills/level0/lib/tested.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches `lib/bash.js` and `hooks/pull-tool.js`, which the ask names
- the level1 case fakes `$.process.run`, the one door the change reaches
- a comment above each change names this ticket
- the read words stand in `READS` and `GIT_READS` alone, and the scratchpad shape in `FREE` alone
- the review rows land here: the read list refuses a gate nobody listed, the scratchpad reads absolute alone, and the hook guards a scope holding no process

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

    ./RUNME.sh test test/level0/bash.test.js test/level0/level1.test.js test/level0/trunk.test.js test/level0/tested.test.js

### check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->

The shell door reads what a command does, where it read the words a command holds.

- `touchesGit` reads git as a command word, so a grep quoting `git push` lands nowhere
- `landingsAfterGates` lets a landing follow a read, and refuses one after a gate piped into a read
- `FREE` takes the harness scratchpad on any box, as an absolute path alone
- `untestedIn` passes a block moved whole, and a reordered statement still asks a test
- the pull tool hands the verb the session env, so both read one hand

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches the files the ask names, and `trunk.js` drops the regex its reading left unused
- the level1 case fakes `$.process.run`, the one door the change reaches
- a comment above each change names this ticket
- each rule stands in one function, and the tickets point at it
- every review row stands fixed here or in a child that closed

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
