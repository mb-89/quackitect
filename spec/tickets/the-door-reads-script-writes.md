---
kind: [[ticket]]
state: open
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
group: the-rules-hold-themselves
process: [[spec/processes/standard]]
process_hash: 838dd6d003506639
step: design/draft
record:
  - step: design/draft
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: 8c3cbf655d1c012f211fad758ea0f0b857d74fde
    hash_after: 8c3cbf655d1c012f211fad758ea0f0b857d74fde
  - step: design/review
    hand: box 5387e4f82b24 · claude-code-remote · helper-2
    hash_before: 99a6e900398f9162aa8ad8952e8818d909595d30
    hash_after: 99a6e900398f9162aa8ad8952e8818d909595d30
    returns: 1
    why: The refusal names Read, Write and Edit today, and no module under the door; names `mcp__level0__patch` or `mcp__level0__replace`. "The way the line rule; names them now" reads a thing standing nowhere. Write the message the two; roads share, and name the module owning it.; `node --test test/level0/bash.test.js` hands a runner a path, and that file; carries `writeFileSync("README.md", ...)` inside a string. A reading taking; every runner argument as a script refuses a plain test run. Say what; `scriptsIn` counts as a script, and what the reading skips.; `writesInScript(body)` already answers the tracked paths a script's text; writes. `writesIn(segment, bodies)` already holds the name the approach gives; a new function of another shape. Reuse the first, add `scriptsIn` alone, and; leave the second name where it stands.; The seam where the read happens goes missing. `findings(command, most, it)`; takes no disk, and `box.disk.read` stands in the bridge. Say which of the two; takes the script's text, because the choice moves the cases between test; files.; A copy out of the scratchpad into a tracked path refuses today, asserted over; `mv` and `cp` in `test/level0/bash.test.js`. Say it stands, and point at that; assertion.; `./RUNME.sh test` names no verb this tree carries. `VERBS` holds check,; branch, tui and doctor, and `TestRunPointsSomewhere` points a test run at; `./RUNME.sh check`. Decide the verb covering the script write and the; refusal.; What I check:; The table's three roads hold. A redirection, an in-place edit and a copy each; land through `writesAPath` today, and a heredoc and `node -e` land through; `writesInScript`. The script file on disk is the one road open.; A script writing under `.se` or the scratchpad passes, because `reaches`; reads the target against `FREE`.; `fakeDisk` stands for the door tests, so the disk this reading takes has a; fake.
---

# Ask

Every write to a tracked file meets the same rules, whatever tool carries it.

A hand writes past the voice rules by putting the write in a script file.

- The shell door refuses `node .se/scripts/edit.mjs` where that script writes a tracked file.
- The door refuses a write spliced in from the scratchpad.
- The refusal names `mcp__level0__patch` and `mcp__level0__replace` as the road.
- `./RUNME.sh test` covers a script write and a refusal.

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

The door reads the command line today, and a script hides the write behind a
file name. So the door reads the file the line names:

| what the line carries | what the door reads |
|---|---|
| a redirection, an editor in place, a copy | the path on the line, as it reads one now |
| a runner and a script, such as `node` and a path | the script's own text, off the disk door |
| a copy out of the scratchpad | the target path, which the same reading answers |

The pieces, in `.claude/skills/level0/lib/bash.js` beside `writesAPath`:

- `scriptsIn(command)` answers the paths a runner takes as its script, one a line
- `writesIn(text)` answers the tracked paths a script's text writes, off the same parse
- the door hands each script's text to that reading, so one rule answers both roads
- a script writing under `.se` or the scratchpad passes, because the rule reads the target

The refusal names `mcp__level0__patch` and `mcp__level0__replace` as the road,
the way the line rule names them now. So a hand meets one message, whichever
road it takes.

The cases stand in `test/level0/bash.test.js`, over a fake disk:

- a script writing a tracked path refuses
- a script writing under the private folder passes
- a copy out of the scratchpad into a tracked path refuses

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

fail

- The refusal names Read, Write and Edit today, and no module under the door
  names `mcp__level0__patch` or `mcp__level0__replace`. "The way the line rule
  names them now" reads a thing standing nowhere. Write the message the two
  roads share, and name the module owning it.
- `node --test test/level0/bash.test.js` hands a runner a path, and that file
  carries `writeFileSync("README.md", ...)` inside a string. A reading taking
  every runner argument as a script refuses a plain test run. Say what
  `scriptsIn` counts as a script, and what the reading skips.
- `writesInScript(body)` already answers the tracked paths a script's text
  writes. `writesIn(segment, bodies)` already holds the name the approach gives
  a new function of another shape. Reuse the first, add `scriptsIn` alone, and
  leave the second name where it stands.
- The seam where the read happens goes missing. `findings(command, most, it)`
  takes no disk, and `box.disk.read` stands in the bridge. Say which of the two
  takes the script's text, because the choice moves the cases between test
  files.
- A copy out of the scratchpad into a tracked path refuses today, asserted over
  `mv` and `cp` in `test/level0/bash.test.js`. Say it stands, and point at that
  assertion.
- `./RUNME.sh test` names no verb this tree carries. `VERBS` holds check,
  branch, tui and doctor, and `TestRunPointsSomewhere` points a test run at
  `./RUNME.sh check`. Decide the verb covering the script write and the
  refusal.

What I check:

- The table's three roads hold. A redirection, an in-place edit and a copy each
  land through `writesAPath` today, and a heredoc and `node -e` land through
  `writesInScript`. The script file on disk is the one road open.
- A script writing under `.se` or the scratchpad passes, because `reaches`
  reads the target against `FREE`.
- `fakeDisk` stands for the door tests, so the disk this reading takes has a
  fake.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

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

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

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

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->

<!-- the form is files -->

## verdict

<!-- pass or fail, findings one a line -->

<!-- the form is verdict -->

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
