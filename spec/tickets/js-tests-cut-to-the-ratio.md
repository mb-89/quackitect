---
kind: [[ticket]]
state: open
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: ask
    tags: ["code", "testing"]
    needs: ["branch test"]
    checklist: ["the change follows the ask, or the discussion says why it departs", "the cleanup the change reveals is in the change, or is a note of its own", "every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
    evidence:
      - name: tests
        form: command
        expects: green
        says: the tests that cover the change, or the check where it touches no code
      - name: check
        form: command
        expects: 0
        says: the check is green on the commit
      - name: says
        form: text
        says: what changes and why, for a reader who was not there
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: code-is-pure-tests-behave
depends_on: [test-ratio-measure-reports]
step: do
record:
  - step: do
    hand: box 7b5a2726379b · claude-code-remote
    hash_before: 5d9d90f2ee4f9b4b6f315c04a6c91ed454a2a10f
    hash_after: 9b985a982d60ab29f02af2697305838120b1d4c9
    returns: 1
    why: the box refuses the delete of the test files the Discussion lists, as a destructive action, so the cut waits on the owner's word
    answered:
      - name: tests
        exit: 0
        said: green, 4 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "  114.9  in all"
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
The JavaScript tests shrink toward the code they test. Duplicated tests, and tests of an implementation detail or a harness, leave: migration twins, golden copies, and tests of deleted code.

<!-- breaks, as text: what breaks if it is never done -->
The ratio guard holds the JavaScript at a ratio far past one to one, and the battery keeps running tests that prove nothing new.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- the ratio report names fewer JavaScript test lines than before
- the Discussion lists each test file cut with its class: twin, golden copy, deleted code, or duplicate
- no test the javascript-leaves group deletes with its port stands cut here, which the Discussion reads off its branch
- `./RUNME.sh check` stands green

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test test/level0/battery-reporter.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The battery delta script and its test leave, since no caller reaches the delta and Go holds the median. TestTestArgv names battery-reporter.test.js in its place. The Discussion lists the further test files a survey verified as twins or tests of dead bridge code. The box refuses their delete, so that cut waits on the owner.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask in part: the battery cut lands, and the Discussion says why the rest waits
the cleanup: the dead bridge modules leave with their tests once the delete stands allowed
one place: the Discussion holds the cut list, and the handover points at it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

Cut and landed: `src/scripts/battery.js` with `test/level0/battery.test.js`, as deleted code. No caller reaches the delta, and `src/quack/retro_collect_values_test.go` holds the median. `TestTestArgv` names `battery-reporter.test.js` in its place.

Verified and waiting on the owner, since the box refuses the delete. The bridge modules these files test have no importer outside `src/bridge` and `test`, past a comment in `hooks/level0.js` and the cold-path list in `probe-cold.js`. The javascript-leaves branch touches none of the files.

| file | class | evidence |
|---|---|---|
| `test/level0/command-cases.test.js` | twin | `src/modules/hooks/command_test.go` runs every row of the same case table |
| `test/level0/commit-guards-cases.test.js` | twin | `src/modules/hooks/commits_test.go` runs the same table |
| `test/contract/write-door-cases.test.js` | twin | `src/modules/hooks/writes_test.go` and `src/quack/writedoor_test.go` read the same table |
| `test/level0/answer-read.test.js` | twin | `src/modules/drafts/drafts_test.go` reads the shared draft cases |
| `test/level0/viewer.test.js` | twin | `src/quack/tui_verb_test.go` carries each claim |
| `test/level0/agent.test.js` | deleted code | `src/bridge/agent.js` has no live importer |
| `test/level0/cloud-ask.test.js` | deleted code | `src/bridge/cloud-ask.js` |
| `test/level0/wait.test.js` | deleted code | `src/bridge/wait.js` |
| `test/level0/code-door.test.js` | deleted code | `src/bridge/code.js` |
| `test/level0/bash-engine.test.js` | deleted code | `src/bridge/bash.js` |
| `test/level0/bash-desk.test.js` | deleted code | `src/bridge/bash.js` |
| `test/level0/bash-commit.test.js` | deleted code | `src/bridge/bash.js` |
| `test/level0/bash-bless.test.js` | deleted code | `src/bridge/bash.js` and `bless.js` |
| `test/level0/trunk-door.test.js` | deleted code | `src/bridge/bash.js` |
| `test/level0/write.test.js` | deleted code | `src/bridge/write.js` |
| `test/level0/write-bless.test.js` | deleted code | `src/bridge/write.js` |
| `test/level0/prose.test.js` | deleted code | `src/bridge/prose.js` |
| `test/level0/tools-door.test.js` | deleted code | `src/bridge/guidance.js`, `bash.js` and `index-tools.js` |
| `test/level0/hand-tools.test.js` | deleted code | `src/bridge/tools.js` |
| `test/level0/handover-door.test.js` | deleted code | `src/bridge/guidance.js` |
| `test/level0/style-top.test.js` | deleted code | `src/bridge/guidance.js` |
| `test/level0/review-door.test.js` | deleted code | `src/bridge/review.js` |
| `test/level0/ask-door.test.js` | deleted code | `src/bridge/ask.js` |

Kept: the golden tests, since they hold the live JavaScript readers to the old section Go compares. Also kept: `check-twins`, which `src/quack/check_twins_test.go` runs, and every test that asserts a live function beside a dead bridge module.
