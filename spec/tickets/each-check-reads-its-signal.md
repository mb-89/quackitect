---
kind: [[ticket]]
state: closed
steps:
  - name: design
    reads: [[spec/guidance/voice]]
    steps:
      - name: draft
        does: writes the approach the ask calls for
        from: anyone
        by: anyone
        input: ask
        evidence:
          - name: approach
            form: text
            says: the approach here where it takes minutes, or a link to the design output where it takes a note
      - name: review
        does: reads the approach against the ask
        not: draft
        on_fail: draft
        reads: [[spec/guidance/review/reviewing]]
        input: design/draft
        evidence:
          - name: verdict
            form: verdict
            says: pass or fail, with findings one a line
  - name: implement
    reads: [[spec/guidance/code/testing]]
    needs: ["branch test"]
    input: design/draft
    checklist: ["the change touches no file the ask leaves out", "every door the change reaches has a fake", "a comment names the approach the change implements"]
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
      - name: reflect
        does: names the class of error in the findings, and the fix for the class
        when: returned
        input: verdict
        evidence:
          - name: class
            form: text
            says: the class of error the findings describe, and the fix for the class
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
  - name: verdict
    does: reads every hunk against the ask and the approach
    not: implement
    on_fail: implement/reflect
    reads: [[spec/guidance/review/reviewing]]
    input: ["diff", "implement"]
    to: retro
    checklist: ["every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
    evidence:
      - name: read
        form: files
        says: every file you read, one a line
      - name: verdict
        form: verdict
        says: pass or fail, findings one a line
group: the-review-lands-overnight
process: [[spec/processes/standard]]
process_hash: 838dd6d003506639
step: verdict
record:
  - step: design/draft
    hand: box dcd73916add7 · claude-code-remote
    hash_before: d83d8224fbde532d08b9bbb3416d58c2ed94204b
    hash_after: d83d8224fbde532d08b9bbb3416d58c2ed94204b
  - step: design/review
    hand: box dcd73916add7 · claude-code-remote · helper-2
    hash_before: 60feab72a4ff04e848f4df6c3b0e884899c6b611
    hash_after: 60feab72a4ff04e848f4df6c3b0e884899c6b611
    returns: 1
    why: "design: the unresolved rule refuses `$TMPDIR/msg.md`, and the design output keeps a temp variable free. Test `FREE` before the unresolved rule, and drop that cost.; craft: `echo x > $HOME/y.md` refuses today already, so that case starts green. Use `echo x > $out/y.md` for the unresolved case.; craft: `writesIn` reads one segment, so the `NAME=value` state lives in `writesAPath` across segments.; craft: `precommit.js` runs with no hand, so name how it finds the hold. `holdsAnywhere` answers for every hand on the box.; craft: the carried paths take `test/` alone, so a Go tests-red leaf carries nothing. Take `_test.go` paths too.; craft: `SOURCE` takes `src/**/*.go`, so keep `_test.go` out of it.; craft: the awake release ends the child and hides it. The exit wait needs a change in `src/doors/awake.js` and its fake.; craft: `retro-collect.js` writes the median, so name it in the table.; craft: the median reads a part only from the runs that ran it, because a red run leaves parts unrun.; craft: `filesUnder` reads an empty list as a file. Read the file in the catch, and read an empty folder as empty."
  - step: design/draft
    hand: box dcd73916add7 · claude-code-remote
    hash_before: ac029435a0cdf34ed28517ecc6c4a9001a93b4c3
    hash_after: ac029435a0cdf34ed28517ecc6c4a9001a93b4c3
  - step: design/review
    hand: box dcd73916add7 · claude-code-remote · helper-4
    hash_before: 9b58a423e46b84729aa91740ec3f498abe48de9b
    hash_after: 9b58a423e46b84729aa91740ec3f498abe48de9b
  - step: implement/tests-red
    hand: box dcd73916add7 · claude-code-remote
    hash_before: e0a40d3143d5f5073c8b0d7fc71ede80016d703f
    hash_after: e0a40d3143d5f5073c8b0d7fc71ede80016d703f
    answered:
      - name: tests
        exit: 1
        said: assertion, 13 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box dcd73916add7 · claude-code-remote
    hash_before: e6486496538198c175240daa05955b227a6947e7
    hash_after: e6486496538198c175240daa05955b227a6947e7
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box dcd73916add7 · claude-code-remote
    hash_before: 9e6e78bd10788f0a86d5df0b1dc38e4ecf0001a0
    hash_after: 9e6e78bd10788f0a86d5df0b1dc38e4ecf0001a0
    answered:
      - name: tests
        exit: 0
        said: green, 100 test(s) pass in 9 file(s)
      - name: check
        exit: 0
        said: The rules pass.
  - step: verdict
    hand: box dcd73916add7 · claude-code-remote · helper-9
    hash_before: 06c24d5c469607e09b0552ed45ee53884c66f946
    hash_after: 06c24d5c469607e09b0552ed45ee53884c66f946
reason: done
---

# Ask

Each door and measure reads the thing it claims, so a pass means the change holds. [[spec/tickets/a-comment-hunk-is-prose]] plans the comment hunk, and this ticket takes the rest.

The test door misses Go and the level0 lib and hooks, and asks a test the ticket carries. The shell door passes a target behind a variable. The battery reads one run, and the fake disk hides a fault the real disk throws on.

- `SOURCE` in `tested.js` takes Go and the level0 lib and hooks
- the test door counts a test the tests-red leaf lands
- `ShellWritesNothing` resolves a variable target and refuses one it cannot resolve
- a first retro records a baseline, and the battery keeps a median
- the awake case waits on the child's end
- `fakeDisk.list()` throws on a file
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

Six readers, each changed to read the thing it claims. The comment hunk stays
with [[spec/tickets/a-comment-hunk-is-prose]].

| part | the file | what changes |
|---|---|---|
| the sources | `.claude/skills/level0/lib/tested.js` | `SOURCE` takes `src/**/*.go` past `_test.go`, and `lib/*.js` and `hooks/*.js` under `.claude/skills/level0` |
| the Go test | the same | `TEST` takes `_test.go`, and a Go test names every file of its own folder |
| the carried test | the same | `untestedIn` takes the test paths the held ticket's command fields name, beside the staged ones |
| what it carries | the same | a path under `test/`, or a `_test.go` path, in a command field |
| the hold | `precommit.js` and `src/bridge/bash.js` | each finds the hold through `holdsAnywhere` in `guidance-hand.js`, and reads its ticket |
| the variable | `.claude/skills/level0/lib/bash.js` | `writesAPath` keeps the `NAME=value` segments across the command, and `writesIn` resolves a `$NAME` target off them |
| the unresolved | the same | a target holding `$` with no value in the command refuses under `ShellWritesNothing` |
| the free paths | the same | `FREE` reads first, so a temp variable's path stays free as `bash.md` says |
| the baseline | `src/engine/retro/effect.js` | a retro with no last one writes its battery with `baseline: true`, and the report names it |
| the runs | `src/scripts/cli-stamp.js` | the stamp keeps the last runs' parts, up to the count the config names |
| the median | `src/scripts/retro-collect.js` | collect writes each part's median, over the runs that reached that part |
| the count | `spec/config/level0.json` | `battery.runs`, beside the weights |
| the awake door | `src/doors/awake.js` and its fake | `release` answers a promise that settles on the child's `exit`, or at a timeout |
| the awake case | `test/contract/awake.test.js` | the case awaits that promise, in place of the fixed wait |
| the fake disk | `src/doors/fake/disk.js` | `list` on a file path throws `ENOTDIR`, the way the real disk does |

The cases:

- `tested.test.js`: a Go, a lib and a hook file each ask a test, and a carried test answers it
- `bash.test.js`: `f=README.md; echo x > $f` refuses, and `echo x > $out/y.md` refuses as unresolved
- `bash.test.js`: `echo x > $TMPDIR/msg.md` passes, as the free list says
- `retro-effect.test.js` and `battery.test.js`: a first retro writes the baseline, and three runs keep a median
- `test/contract/disk.test.js`: the fake and the real disk both throw on a list of a file

The callers:

- `filesUnder` in `one-reader.test.js` reads the file in its catch, and an empty list reads as an empty folder
- every other `list` caller hands a folder, and the check names any that breaks
- `onBash` and `precommit.js` call `untestedIn`, and both gain the carried paths
- the retro's report reads the median where it read the one run

The answers to the earlier review:

- the temp path: `FREE` reads before the unresolved rule
- the case starting green: the unresolved case writes `$out`
- the variable state: it lives in `writesAPath`, across segments
- the hold in the git hook: `holdsAnywhere` finds it
- the Go tests: a `_test.go` path carries, and `SOURCE` leaves `_test.go` out
- the awake door: the door and its fake change, beside the case
- the median: `retro-collect.js` writes it, over the runs that reached a part
- `filesUnder`: it reads the file in its catch

The cost: the stamp grows by the kept runs.

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

pass

- craft: `echo x > $out/y.md` refuses today too, because the `.md` suffix reaches. Use `echo x > $f` for the unresolved case.
- craft: `out=/tmp; echo x > $out/y.md` refuses today and passes once resolved. Add it as the resolved free case.
- craft: `holdsAnywhere` answers the first hold, and several hands hold on one box. Take the carried tests of every hold.
- craft: every `release` answers a promise, the no-hold branches and the fake included. Listen for `exit` at the spawn.
- craft: the median covers `parts`, and `slowest` and `files` stay from one run. Name that in the table.
- craft: the kept runs span commits. Keep only runs at the stamp's `sha`, or name why a mix holds.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

    ./RUNME.sh branch test test/level0/tested.test.js test/level0/precommit.test.js test/level0/bash-commit.test.js test/level0/bash.test.js test/level0/retro-effect.test.js test/level0/battery.test.js test/level0/cli-stamp.test.js test/contract/awake.test.js test/contract/disk.test.js

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

Thirteen cases fail on their own assertion, and each reads the part the approach names.

- `untestedIn` passes a Go file, a lib file and a hook file with no test.
- A test the held ticket carries answers nothing yet, at the hook and at the shell door alike.
- `f=README.md; echo x > $f` and `echo x > $f` both pass today.
- `out=/tmp; echo x > $out/y.md` refuses today, because the door reads no value.
- A first retro writes its battery with no baseline mark.
- The stamp keeps one run, and `battery.js` holds no median.
- The awake release answers nothing, and the child still stands after the call.
- The fake disk lists a file as an empty folder, where the real disk throws `ENOTDIR`.
- The surprise: this box holds `systemd-inhibit`, so the real awake case runs here and does not skip.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- The tests touch only the files the approach names, beside the two door tests the carried test reaches.
- The disk and awake cases hold the fake to the real door, and every other case takes a fake.
- Each new case carries a pointer to the design chapter its approach row names.

## reflect

<!-- names the class of error in the findings, and the fix for the class -->

### class

<!-- the class of error the findings describe, and the fix for the class -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->

<!-- the form is command -->

    ./RUNME.sh lint .claude/skills/level0/lib/bash.js .claude/skills/level0/lib/tested.js spec/config/level0.json spec/config/level0.schema.json spec/design_output/bash.md spec/design_output/doors.md spec/design_output/level0.md spec/design_output/tree.md spec/design_output/work.md src/bridge/bash.js src/doors/awake.js src/doors/fake/awake.js src/doors/fake/disk.js src/engine/retro/effect.js src/scripts/battery.js src/scripts/cli-stamp.js src/scripts/guidance-hand.js src/scripts/precommit.js src/scripts/retro-collect.js test/level0/guidance-hand.test.js test/level0/one-reader.test.js test/level0/retro-collect.test.js .claude/skills/level0/lib/shell-values.js test/level0/retro-collect-median.test.js test/level0/shell-values.test.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- The change touches the files the approach names, beside `shell-values.js`, which keeps `bash.js` under its ceiling.
- The disk and awake doors change with their fakes, and each contract case holds the fake to the real door.
- Each changed module carries a pointer to the design chapter that states the approach.

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

    ./RUNME.sh branch test test/level0/tested.test.js test/level0/precommit.test.js test/level0/bash-commit.test.js test/level0/bash.test.js test/level0/retro-effect.test.js test/level0/battery.test.js test/level0/cli-stamp.test.js test/contract/awake.test.js test/contract/disk.test.js

### check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

Each door and measure now reads the thing it claims.

- The test door reads Go under `src` and the level0 lib and hooks as source.
- A Go test answers for every Go file of its own folder.
- The door counts the tests every held ticket's command lines carry, beside the staged ones.
- The shell door resolves a target behind a variable, and refuses a name with no value.
- A temp variable reads free before that rule, so `$TMPDIR` stays free.
- A first retro writes its battery as the baseline and names its total.
- The stamp keeps the runs at its own commit, up to `battery.runs`.
- Collect writes each part's median, and the slowest cases stay off the last run.
- Every awake release answers a promise that settles on the child's exit or a timeout.
- The fake disk throws `ENOTDIR` on a list of a file, as the real disk does.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- The green run touches the approach's files, beside the projection `battery.runs` writes under `.claude/commands`.
- The awake and disk doors each pass their contract case against the real box and the fake.
- The pointers in each changed module name the chapter holding its approach, and the check resolves them.

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->

<!-- the form is files -->

- spec/tickets/each-check-reads-its-signal.md
- .claude/commands/se-config-battery-runs.md
- .claude/skills/level0/lib/bash.js
- .claude/skills/level0/lib/shell-values.js
- .claude/skills/level0/lib/tested.js
- spec/config/level0.json
- spec/config/level0.schema.json
- spec/design_output/bash.md
- spec/design_output/doors.md
- spec/design_output/level0.md
- spec/design_output/tree.md
- spec/design_output/work.md
- src/bridge/bash.js
- src/doors/awake.js
- src/doors/fake/awake.js
- src/doors/fake/disk.js
- src/engine/retro/effect.js
- src/scripts/battery.js
- src/scripts/cli-stamp.js
- src/scripts/cli.js
- src/scripts/guidance-hand.js
- src/scripts/precommit.js
- src/scripts/retro-collect.js
- test/contract/awake.test.js
- test/contract/disk.test.js
- test/level0/bash-commit.test.js
- test/level0/bash.test.js
- test/level0/battery.test.js
- test/level0/cli-stamp.test.js
- test/level0/guidance-hand.test.js
- test/level0/one-reader.test.js
- test/level0/precommit.test.js
- test/level0/retro-collect-median.test.js
- test/level0/retro-collect.test.js
- test/level0/retro-effect.test.js
- test/level0/shell-values.test.js
- test/level0/tested.test.js

## verdict

<!-- pass or fail, findings one a line -->

<!-- the form is verdict -->

pass

- Every item of the Ask lands, and each carries a case that fails before the change.
- `./RUNME.sh check` exits 0 on this branch.
- No retro stands on the ticket yet, and the next step writes one.
- craft: `landing` tests `FREE` on the raw word alone, so `out=$TMPDIR; echo x > $out/a.md` refuses.
- craft: `server.js` calls `release()` twice and awaits neither, so the server still ends before the child.
- craft: `battery.test.js` reads the namespace one line above its import. Move the import up.
- craft: the schema `help` for `battery.runs` repeats the config comment word for word.
- craft: a carried test of another hand's ticket answers this hand's commit too.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- The config comment points at the retro guidance, and the design tables hold each rule once.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
