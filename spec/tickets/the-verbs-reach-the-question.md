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
    hash_before: b8d9fe4e8bb28f1a355f07fd1a3b2cb48993a853
    hash_after: b8d9fe4e8bb28f1a355f07fd1a3b2cb48993a853
  - step: design/review
    hand: box dcd73916add7 · claude-code-remote · helper-2
    hash_before: e30b60728e00f16ed6c5eed2eb82c8448cdb7d3a
    hash_after: e30b60728e00f16ed6c5eed2eb82c8448cdb7d3a
    returns: 1
    why: "design: `onStop` in `src/bridge/stop.js` returns at once, and `checksAnswer` awaits Vale.; design: five test files read the `onStop` answer at once, so an awaiting gate breaks them.; design: `stop.js` holds 594 lines, and the write door refuses a file past 600.; design: the gate moves into the awaited `classic.Stop` door or a neighbour file, and the approach names those tests.; craft: `runsFind` lives in `src/bridge/search.js`, and `search-door.test.js` tests it.; craft: `runsFind` takes `words` over the index, so a body read needs a new field and a file read.; craft: the `test` row in the verb table calls `test()` bare, so it passes `rest` through.; craft: `testSays` reads tap counts, so a file run takes the tap reporter.; craft: `testSays` and `goSays` stand exported already.; craft: the wait tool registers in `server.js`, and the table leaves that file out.; craft: a helper's stop passes ahead of the gate, and a held turn runs Vale again.; craft: the log count, the lint order and the Go env match the code they name."
  - step: design/draft
    hand: box dcd73916add7 · claude-code-remote
    hash_before: 6f6b6bc907394789601ac347db01903c617acd76
    hash_after: 6f6b6bc907394789601ac347db01903c617acd76
  - step: design/review
    hand: box dcd73916add7 · claude-code-remote · helper-4
    hash_before: 653971f3f8272c25bb182f403ab9ccba5c80595e
    hash_after: 653971f3f8272c25bb182f403ab9ccba5c80595e
  - step: implement/tests-red
    hand: box dcd73916add7 · claude-code-remote
    hash_before: cfab9a80dc02cab14797d458eff3b71145051065
    hash_after: cfab9a80dc02cab14797d458eff3b71145051065
    answered:
      - name: tests
        exit: 1
        said: assertion, 23 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box dcd73916add7 · claude-code-remote
    hash_before: ed42b5cb63e88ea172fa50729a56a375747762b1
    hash_after: ed42b5cb63e88ea172fa50729a56a375747762b1
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box dcd73916add7 · claude-code-remote
    hash_before: 02e479b2a271b633a0f9161ef9c4217cb32ec32f
    hash_after: 02e479b2a271b633a0f9161ef9c4217cb32ec32f
    answered:
      - name: tests
        exit: 0
        said: green, 52 test(s) pass in 8 file(s)
      - name: check
        exit: 0
        said: The rules pass.
  - step: verdict
    hand: box dcd73916add7 · claude-code-remote · helper-9
    hash_before: d18c1e307f644e040079513ce3117dd56a7a1ba7
    hash_after: d18c1e307f644e040079513ce3117dd56a7a1ba7
reason: done
---

# Ask

The hand asks a verb and reads one answer, where it types a shell script today. The owner reads fewer shell calls, and each answer stands on the verb's own tests.

The hand retypes `node -e` log readers, `sed -n` function reads, the Go test env and wait loops, turn after turn. Each copy drifts, and each costs the owner a read.

- `./RUNME.sh test` takes a file or a Go package, with the check's env
- `./RUNME.sh log` takes a count mode
- `./RUNME.sh lint` ends on the finding lines under the count
- a wait tool returns on a helper report, an output's end or a quiet file set
- `mcp__level0__find` answers a function by name with its body
- the stop gate runs `check_answer` over the answer itself
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

Each shell habit the ask names takes a verb or a tool of its own, built on the
reader that stands already.

| part | the file | what changes |
|---|---|---|
| the test verb | `src/scripts/cli.js` | the `test` row hands `rest` to `test(argv)`, which runs the named `.test.js` files or the Go package a folder names |
| its reporter | the same | a named run takes `--test-reporter=tap`, so `testSays` reads its counts, and a bare run keeps the whole suite as it runs |
| its env | the same | a file run takes the spawn tally, and a Go run takes `goEnvOf` from `cli-go.js` |
| its answer | `src/scripts/work-test.js` | the verb reads the run through the `testSays` and `goSays` it exports already |
| the count | `src/scripts/log-verb.js` | `--count` prints one row a kind, with the rows the filters keep |
| the lint | `src/scripts/cli-read.js` | the lint prints the count table first, and the finding lines under it last |
| the wait | a new `src/bridge/wait.js` | `mcp__level0__wait` returns on the first of three signals, or at its cap |
| a helper report | the same | a new `report` row in the log from a helper's `agentId` |
| an output's end | the same | the named output file stands unchanged past the quiet span, or its process exits |
| a quiet file set | the same | every named file stands unchanged past the quiet span |
| its wiring | `src/bridge/server.js` | one import and one spread into `TOOLS`, beside the plan's |
| the cap | `spec/config/level0.json` | `wait.most` and `wait.quiet`, beside the other spans |
| the body | `runsFind` in `src/bridge/search.js` | takes a `function` field beside `words`, finds its definition line in the index, and reads the body off the disk to its matching close |
| the reading | a new `src/bridge/answer-read.js` | `readsAnswer(box, text, stop)` holds the reading `checksAnswer` runs, and `checksAnswer` calls it |
| the stop gate | the `classic.Stop` door in `server.js` | awaits `readsAnswer` over the turn's last text before `onStop`, and a draft past the ceiling holds the turn with its findings |
| a helper's stop | the same | passes before the gate, as it does today |

The cases:

- `test/contract/cli-verbs.test.js`: `./RUNME.sh test` over one file and one Go folder
- `log-verb.test.js`: `--count` prints one row a kind
- a new `wait.test.js`: each signal returns the wait, and the cap returns it too
- `search-door.test.js`: a function name answers its body
- a new `answer-read.test.js`: at the server's stop door, a draft past the ceiling holds, and a clean one ends

The callers:

- `check` calls `test()` bare, and a bare call runs the whole suite as before
- `findingsOver` feeds the lint, and its order changes the print alone
- `onStop` keeps its answer as it returns now, so the cases calling it directly stand
- `ENDS_TURN` names `check_answer`, and the gate reads the same reading

The answers to the earlier review:

- the gate in `onStop`: it moves into the server's stop door, which `decide` awaits
- no room in `stop.js`: the reading stands in a new file, and `stop.js` gains nothing
- `find.js`: the body lives in `runsFind` in `search.js`, with its case in `search-door.test.js`
- the `test` row: it hands `rest` through
- the reporter: a named run takes tap
- the wait's wiring: `server.js` gains the import and the spread
- the cost claim: a helper's stop runs no Vale, and a held turn reads again at its next stop

The cost: each stop of the session's own runs Vale over the answer once.

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

pass
- design: every earlier finding stands answered, and the gate moves into the awaited stop door.
- craft: `checksAnswer` lives in `src/bridge/tools.js`, and the table leaves that file out.
- craft: the `function` field enters `findSpec` in `.claude/skills/level0/lib/search.js`, so the table names it.
- craft: `testVerb` in `work-test.js` runs named files and Go modules, so the `test` row reuses it.
- craft: the named run takes the spawn tally, because the ask names the check's env.
- craft: a Go run names a folder, and `goModulesOf` reads only `_test.go` paths.
- craft: `server.js` holds 591 lines, so the gate body lives in `answer-read.js`.
- craft: the wait's spec joins `specsOf` in `server.js` beside its tool.
- craft: the gate holds ahead of the tooth, so a cap bounds its holds in a row.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

    ./RUNME.sh branch test test/level0/answer-read.test.js test/level0/wait.test.js test/level0/search-door.test.js test/level0/test-verb.test.js test/level0/cli-read.test.js test/level0/log-verb.test.js test/contract/cli-verbs.test.js test/contract/proc.test.js

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

The cases stand in eight files, and each fails on its own assertion.

- `answer-read.test.js` drives the stop door through `decide` with a Vale fake, and no gate holds yet.
- `wait.test.js` drives each signal on a fake clock, and the stub answers nothing.
- `search-door.test.js` asks `runsFind` for a function, and it takes words alone today.
- `test-verb.test.js` names a file and a Go folder, and `testVerb` reads the branch today.
- `log-verb.test.js` and `cli-read.test.js` read `countsOf` and `lintRows`, which answer nothing yet.
- `cli-verbs.test.js` runs the real verb over one file, and the row hands nothing through.
- `proc.test.js` reads `alive` on the real door, and the stub answers false.

The surprise: an output's end needs a process's life, and no door reads it. The process door takes `alive`, and its fake takes a set of numbers.

A second surprise: `runsFind` stands with no case in `search-door.test.js`, so these cases are its first.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the cases touch the files the approach names, and the process door takes `alive` for the output's end.
- the clock, the disk, the process, the log and Vale each run through a fake.
- each new file points at a section of `spec/design_output`, and the approach names each one.

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

    ./RUNME.sh lint .claude/skills/level0/lib/search.js spec/config/level0.json spec/config/level0.schema.json src/bridge/answer-read.js src/bridge/search.js src/bridge/server.js src/bridge/tools.js src/bridge/wait.js src/doors/proc.js src/doors/fake/proc.js src/scripts/cli-read.js src/scripts/cli.js src/scripts/log-verb.js src/scripts/work-test.js test/contract/cli-verbs.test.js test/contract/proc.test.js test/level0/answer-read.test.js test/level0/log-verb.test.js test/level0/search-door.test.js test/level0/test-verb.test.js test/level0/wait.test.js test/level0/cli-read.test.js spec/design_output/level0.md spec/design_output/index.md spec/design_output/lsp.md spec/design_output/pull.md spec/design_output/log.md .claude/commands/se-config-wait-most.md .claude/commands/se-config-wait-quiet.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches the files the approach names, the process door for `alive`, the config pair and the design notes.
- the process door takes `alive`, and its fake answers off a set of numbers a case fills.
- each new function points at a section of `spec/design_output`, and each section names the approach.

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

    ./RUNME.sh branch test test/level0/answer-read.test.js test/level0/wait.test.js test/level0/search-door.test.js test/level0/test-verb.test.js test/level0/cli-read.test.js test/level0/log-verb.test.js test/contract/cli-verbs.test.js test/contract/proc.test.js

### check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

The shell habits the ask names each take a verb or a tool, with cases of its own.

- `./RUNME.sh test` hands the names to `testVerb`, with the check's spawn tally.
- A named Go folder names its module through `goModulesOf`, and the Go run takes `goEnvOf`.
- `./RUNME.sh log --count` prints one row a kind, over the rows the filters keep.
- `./RUNME.sh lint` prints the count first, and ends on the finding lines.
- `mcp__level0__wait` returns on a helper's report, an output's end or quiet files, and at its cap.
- A helper's stop writes a `report` row, and the process door takes `alive` for an exit.
- `mcp__level0__find` takes `function`, and answers the body from the index row to its close.
- `readsAnswer` in `answer-read.js` holds the reading, and `checksAnswer` calls it.
- The stop door holds a draft in the `rewrite` band, ahead of the tooth.
- The gate counts its holds, and past `stop.mostInARow` it lets the turn go.
- `wait.most` and `wait.quiet` join the config, and the design notes carry each fact.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches the files the approach names, the process door for `alive`, the config pair and the design notes.
- the process door takes `alive`, and its fake answers off a set of numbers a case fills.
- each new function points at a section of `spec/design_output`, and each section names the approach.

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->

<!-- the form is files -->

- spec/tickets/the-verbs-reach-the-question.md
- .claude/commands/se-config-wait-most.md
- .claude/commands/se-config-wait-quiet.md
- .claude/skills/level0/lib/search.js
- spec/config/level0.json
- spec/config/level0.schema.json
- spec/design_output/index.md
- spec/design_output/level0.md
- spec/design_output/log.md
- spec/design_output/lsp.md
- spec/design_output/pull.md
- src/bridge/answer-read.js
- src/bridge/search.js
- src/bridge/server.js
- src/bridge/stop.js
- src/bridge/tools.js
- src/bridge/wait.js
- src/doors/fake/proc.js
- src/doors/proc.js
- src/scripts/cli-read.js
- src/scripts/cli.js
- src/scripts/log-verb.js
- src/scripts/work-test.js
- src/stub/.claude/skills/level0/hooks/bridgehead.js
- test/contract/cli-verbs.test.js
- test/contract/proc.test.js
- test/level0/answer-read.test.js
- test/level0/cli-read.test.js
- test/level0/log-verb.test.js
- test/level0/search-door.test.js
- test/level0/test-verb.test.js
- test/level0/wait.test.js

## verdict

<!-- pass or fail, findings one a line -->

<!-- the form is verdict -->

pass
- design: each of the seven ask lines lands, with a case of its own.
- design: `./RUNME.sh check` exits 0 on the branch.
- design: `alive` stands justified, because an output's end needs a process's life.
- design: `alive` lives in the one door reaching a process, and its fake and contract case hold it.
- design: the gate calls `readsAnswer`, which `check_answer` calls too, so one reading serves both.
- design: a helper's stop still passes, as `onStop` answers it today.
- craft: `bodyFound` reads the ranked rows alone, so a common name can miss its definition row.
- craft: the gate and the tooth each count up to `stop.mostInARow`, so a turn holds up to twice that.
- craft: `box.reports` grows for the box's whole life, and nothing drops an id once read.
- craft: the wait holds one server call up to 600s, and no case covers a client's own timeout.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- each new fact stands in one design section, and the config comment and each code comment point at it.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
