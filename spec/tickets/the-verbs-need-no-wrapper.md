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
    hash_before: 4becee0083ccd911a19d3584843fd30dc157c3e8
    hash_after: 4becee0083ccd911a19d3584843fd30dc157c3e8
  - step: design/review
    hand: box d7d6327f2b101 · claude-code-remote
    hash_before: 545a42b269093f13f9e77ade788d3a21baebc76b
    hash_after: 545a42b269093f13f9e77ade788d3a21baebc76b
  - step: implement/tests-red
    hand: box d7d6327f2b101 · claude-code-remote
    hash_before: 72177427e718767e41714ad1e6a875948d546d31
    hash_after: e75e95e4306e2eb2b20ae508f9e0b428b210f3c8
    answered:
      - name: tests
        exit: 1
        said: assertion, 9 test(s) fail on their own assertion
  - step: implement/change
    hand: box d7d6327f2b101 · claude-code-remote
    hash_before: 2864b19f9c8b403135cad5be2deb3873db4182d8
    hash_after: 2864b19f9c8b403135cad5be2deb3873db4182d8
    answered:
      - name: lint
        exit: 0
        said: "test/level0/work-group.test.js:1:1: FileCeiling: A file holds 600 lines, and the file holds 611. Split it by topic."
  - step: implement/tests-green
    hand: box d7d6327f2b101 · claude-code-remote
    hash_before: 9d3168fe282b51693da5b6c17f94b8cbde6613c8
    hash_after: 9d3168fe282b51693da5b6c17f94b8cbde6613c8
    answered:
      - name: tests
        exit: 0
        said: green, 82 test(s) pass in 8 file(s)
      - name: check
        exit: 0
        said: "test/level0/work-group.test.js:1:1: FileCeiling: A file holds 600 lines, and the file holds 611. Split it by topic."
reason: done
---

# Ask

A hand reads the failing case off the last lines of `check`, `test` and `branch merge`. It finds each verb's usage in the session's tools block. It adds a line to a standing note in place of a twin.

`check` ends on the whole run's output and takes no `--errors`, `test` counts failing tests and names none, and `branch merge` prints the check's last line alone. The tools block names tools and no verb, so a fresh session runs `--help` and calls Biome by path where `./RUNME.sh fix <file>` and `./RUNME.sh lint <file>` stand.

- `./RUNME.sh check --errors` prints the failing cases and the findings at error alone, with a case in a new `test/level0/check-errors.test.js`. It quiets `goHolds` in `src/scripts/cli-check.js` and keeps the errors of `lint` in `src/scripts/cli-read.js`.
- `testSays` in `src/scripts/work-test.js` names each failing case above its verdict line, with a case in `test/level0/test-verb.test.js`
- `checkSays` in `src/scripts/work-merge.js` prints the failing cases the check names, with a case in `test/level0/work-group.test.js`
- the `level0-tools` block names each verb of `src/scripts/cli.js` with its usage line, with a case in `test/level0/tools-door.test.js`. `toolsText` in `src/bridge/guidance.js` writes it.
- `./RUNME.sh ticket note` names a standing note whose words match the line before it writes, with a case in `test/level0/ticket-verb.test.js`
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

1. `src/scripts/cli.js` `verbs.check.run` reads `--errors` off `rest`. Under it, the parts run quiet, and the check then prints `errorsSaid` alone.
   - `test` takes a `quiet` flag, and `goHolds` in `src/scripts/cli-check.js` too. Each captures its spawn in place of `inherit`.
   - The check mutes `console.log` over `batteryRun`, so the green lines of the other parts stay off the screen.
   - `lint` in `src/scripts/cli-read.js` keeps its rows at error for a new `errorsStood`, the way `warningsStood` keeps the warnings.
   - A new pure `errorsSaid(lines, found)` in `cli.js` answers one row per red case off `redIn`, then one `asLine` row per finding at error.
2. `testSays` in `src/scripts/work-test.js` reads each `not ok` line of the TAP output. It puts those names above the verdict, so the verdict stays the last line. `pull-chapter.js` reads that last line's first word.
3. `checkSays` in `src/scripts/work-merge.js` runs `cli.js check --errors`, and answers every row of its output in place of the last one.
4. `toolsText` in `src/bridge/guidance.js` adds a `# The verbs` part to the `level0-tools` block.
   - It runs `cli.js help` once through `box.proc` and keeps the rows in `box.verbs`, the way `review.js` spawns the command line.
   - The help rows stand as the one source, so the block writes each verb as `./RUNME.sh <verb>` beside its `says`.
   - A spawn that fails leaves the part out, so a fake box untaught of the run still gets its block.
   - The bridge imports no `cli.js`, because `cli-doors.js` builds real doors under a top-level await, and `cli-check.js` imports `guidance.js`.
5. `note` in `src/scripts/ticket.js` reads the open notes in `NOTES` and `spec/tickets` before it writes. Where one's Ask holds most of the line's longer words, it names that path.
   - It names it on stderr with a line to add there in place of a twin, then writes as it does now.
6. `./RUNME.sh check` exits 0 on the commit, with the one existing merge case and one tools case bent to the new runs.
   - The merge case in `test/level0/work-group.test.js` keys its fake on `check --errors`.
   - The case "a surveyed box reads the file and runs nothing" counts the survey's runs alone, since the help run adds one.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `src/scripts/cli.js` the main dispatch, which runs `verbs.check.run`, `verbs.test.run`, `verbs.lint.run` and `verbs.ticket.run`
- `src/scripts/cli.js` `verbs.check.run`, the one caller of `goHolds`, `errorsSaid` and `errorsStood`
- `src/scripts/cli.js` `verbs.check.run` and `verbs.test.run`, the callers of `test`
- `src/scripts/cli.js` `verbs.check.run` and `verbs.lint.run`, the callers of `lint`
- `src/scripts/work-merge.js` `checkSays`, which spawns the check and now passes `--errors`
- `src/scripts/work-merge.js` `merge`, the one caller of `checkSays`
- `src/scripts/commit-verb.js` `landsAndPushes`, which spawns the check bare and reads its exit alone
- `src/scripts/pull-push.js` `checkRed`, which spawns the check bare and sees no change
- `src/scripts/work-review.js` `checkOn`, which spawns the check bare and sees no change
- `src/scripts/work-test.js` `testVerb`, the one caller of `testSays`
- `src/scripts/work.js` `work`, whose `test` row calls `testVerb`
- `src/scripts/cli.js` `namedTests`, which calls `testVerb`
- `src/scripts/pull-chapter.js` `commandsRun`, which reads the first word of the verb's last line
- `src/bridge/guidance.js` `onPromptContext`, the one caller of `toolsText`
- `src/bridge/server.js` the `DOORS` table, which routes `prompt.context` to `onPromptContext`
- `src/scripts/ticket.js` `ticket`, whose `doing` table calls `note`
- `src/scripts/cli.js` `verbs.ticket.run`, which calls `ticket`

### tests

<!-- every test the change adds, one a line, as a file and a test name -->

<!-- the form is list -->

- `test/level0/check-errors.test.js` "check --errors names each red case and each finding at error, and no warning"
- `test/level0/test-verb.test.js` "a red run names each failing case above its verdict line, and the verdict stays last"
- `test/level0/work-group.test.js` "merge on a red check prints each failing case the check names"
- `test/level0/tools-door.test.js` "the tools block names each verb of the command line with its usage line"
- `test/level0/ticket-verb.test.js` "ticket note names a standing note whose words match the line, before it writes"

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- first draft

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- I opened `cli.js`, `cli-read.js`, `cli-stamp.js`, `cli-check.js`, `battery.js`, `battery-reporter.js`, `work-test.js`, `work-merge.js`, `guidance.js` and `ticket.js`.
- Each claim of the ask holds there: `check` takes no `--errors`, `testSays` counts alone, and `checkSays` keeps `rows.at(-1)`.
- The tools block holds `toolLines` and the tiers, and no verb. I left the claims about `--help` and Biome by path unchecked, since they describe past sessions.
- I found the callers with grep over `src`, `test` and the plugin lib, for each changed function and for every spawn of `cli.js check`.
- Each of the first five done_when lines names its test above. The check itself decides the sixth, and no test holds it.

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass, pass with findings naming a child a line, or fail with findings one a line -->

<!-- the form is verdict -->

pass with findings

- wrapper-ask-names-its-files: approach items 1 and 4 change `src/scripts/cli-check.js`, `src/scripts/cli-read.js` and `src/bridge/guidance.js`. The ask names none of them, and the implement checklist refuses a file the ask leaves out. Name each on its ask line.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

    ./RUNME.sh test test/level0/check-errors.test.js test/level0/test-verb.test.js test/level0/work-group.test.js test/level0/tools-door.test.js test/level0/ticket-verb.test.js

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

Each new case fails on its own assertion, and the merge cases keyed on `check --errors` fail until `checkSays` passes the flag. A surprise: `cli.js` exits at import, so no case reaches a pure `errorsSaid` there. It stands in `src/scripts/cli-read.js` beside `warningsStood`, a file the ask names, and a case imports it there.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- The tests touch the five test files the ask names.
- Each case drives a fake disk or process, or a pure function.
- Each new case links this ticket, whose approach it tests.
- The help rows stay the one source of the verbs, and the case teaches the fake those rows.
- The review's one finding stands fixed on the ask, in `wrapper-ask-names-its-files`.

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->

<!-- the form is command -->

    ./RUNME.sh lint

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- The change touches the files the ask names, and four past it. The Discussion names each and why.
- The change reaches the process door alone, and each case drives `fakeProc` or a pure function.
- Each changed function carries a comment linking this ticket, whose approach it implements.
- The help rows stand as the one source of the verbs, and the block reads them.
- The review's one finding stands fixed on the ask.

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

    ./RUNME.sh test test/level0/check-errors.test.js test/level0/test-verb.test.js test/level0/work-group.test.js test/level0/tools-door.test.js test/level0/ticket-verb.test.js test/level0/battery-reporter.test.js test/contract/cli-verbs.test.js test/contract/cli-check-doors.test.js

### check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

A hand now reads the failing case off each verb's own lines:

- `./RUNME.sh check --errors` runs its parts quiet, then prints each red case and each finding at error.
- `./RUNME.sh test` names each failing case above its verdict, and the verdict stays last.
- `branch merge` hands on every row the check prints under `--errors`.
- The `level0-tools` block names each verb with its usage line, off the command line's help rows.
- `./RUNME.sh ticket note` names an open note whose Ask carries the line's words, before it writes.

A TODO case now reads as no red case, so none of these names a case that turns nothing red.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- The files past the ask stand in the Discussion, each with its reason.
- Each case drives `fakeProc`, a fake disk, a pure function or the source text.
- Each changed function links this ticket.
- The help rows stand as the one source of the verbs.
- The review's one finding stands fixed on the ask.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

Where the change departs from the approach:

| file | why |
|---|---|
| `src/scripts/cli-read.js` | `errorsSaid` stands here, because `cli.js` exits at import and no case reaches it there |
| `test/level0/work-doors.js` | the merge cases drive this fake, so it answers the check under `--errors` |
| `src/scripts/battery-reporter.js` | the row marks a TODO case, which fails by design |
| `src/scripts/battery.js` | `redIn` passes over a TODO case, so `check --errors` names no case that turns nothing red |
| `test/level0/battery-reporter.test.js` | the case for the TODO mark |
| `test/contract/cli-verbs.test.js` | the case for the check row under `--errors`, which the commit door asks beside `cli.js` |
| `test/contract/cli-check-doors.test.js` | the case for the quiet Go part, which the commit door asks beside `cli-check.js` |
