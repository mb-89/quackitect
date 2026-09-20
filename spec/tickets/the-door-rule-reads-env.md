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
step: design/review
record:
  - step: design/draft
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: f3207481318c868ec4e9cd220a99279670c51544
    hash_after: f3207481318c868ec4e9cd220a99279670c51544
  - step: design/review
    hand: box 5387e4f82b24 · claude-code-remote · helper-2
    hash_before: ec36534a027da40fa81b8f4c0ad64c97f1d49a6b
    hash_after: ec36534a027da40fa81b8f4c0ad64c97f1d49a6b
    returns: 1
    why: The approach puts the pass list in `DoorsOnly.yml`. A rule there reads the; raw text of a file alone, so a list of roots in the rule file stands unread.; `.vale.ini` owns that fact already, in the sections standing the rule off; `src/doors` and the editor files. Put the roots there.; The approach gives `src/lsp` a door file and names no section standing the; Go reading off it. Name it, beside the sections `.vale.ini` already holds.; The approach hands the reads outside the two the ask names to the implement; step. The ask asks for a clean `./RUNME.sh lint src`, so say which of them; move behind a door and which take the value off the hand. A read of; `process.platform` that builds a path is the case the criterion leaves open.; The rest holds. `DoorsOnly.yml` stands, and `.vale.ini` runs it over `.go`; beside `.js`. The hand `src/scripts/cli-doors.js` builds carries `env`, so; the two reads the ask names take `it.env` and `box.env` as written.
  - step: design/draft
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: e0e917c2bfbf38d110d363a6555b197e0cecb84a
    hash_after: e0e917c2bfbf38d110d363a6555b197e0cecb84a
---

# Ask

Every reach outside runs through a door, so a test drives the code with a fake.

Code reads the environment and runs commands in place, and a test of it touches the real box.

- The door rule refuses a read of the environment outside `src/doors`.
- A rule holds Go to a door package for `os/exec` and file calls.
- The reads in `src/scripts/pull-hand.js` and `src/bridge/stop.js` move behind a door.
- `./RUNME.sh lint src` names no such read.

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

One rule file grows the reading, and the lint config says where it stands off:

| what grows | where it stands |
|---|---|
| the environment read | `spec/config/styles/VoiceVale/DoorsOnly.yml`, beside the imports it refuses |
| the Go reading | the same file, over an import of `os` or `os/exec` |
| the places standing off | `.vale.ini`, in a section for each, the way the fakes stand off today |

A rule under `spec/config/styles` reads one buffer and no path, so the pass list
belongs where every other path rule stands. `.vale.ini` already holds a section
for the doors, their fakes, the editor and the hooks modules.

The readings:

- the rule draws on `process.env`, `process.argv` and `process.platform` outside `src/doors`
- a root builds the hand every other module takes, so it reads the environment once
- the Go rule reads an import line, so one file of a package names the outside

| the section `.vale.ini` gains | why it stands off |
|---|---|
| `**/src/scripts/cli*.js` | the command roots build the `it` every verb takes |
| `**/src/scripts/precommit.js`, `**/src/scripts/prepush.js` | each is a hook a person's git runs, and it builds its own |
| `**/src/bridge/server.js` | the server root builds the box each door reads |
| `**/src/stub/**` | the template rides out as a copy, and the vehicle owns it |
| `**/src/lsp/doors.go` | the Go door file names the outside for its package |

Every other module takes the value off the hand. The implement step moves them,
and the two the ask names open the list:

| the module | what it takes |
|---|---|
| `src/scripts/pull-hand.js` | `it.env`, and the read of the process goes |
| `src/bridge/stop.js` | `box.env`, and the break mark rides the box beside it |
| `work.js`, `trust.js`, `copilot.js`, `vehicle.js` | `it.env`, off the hand the root builds |
| `src/bridge/bash.js`, `src/bridge/guidance.js` | `box.env`, off the box the server builds |

`process.platform` reads the same way: a root reads it once and hands it down,
and `src/scripts/cli-read.js` stands off as a root. So `./RUNME.sh lint src`
answers clean, and the rule names every read a later hand writes.

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

fail

- The approach puts the pass list in `DoorsOnly.yml`. A rule there reads the
  raw text of a file alone, so a list of roots in the rule file stands unread.
  `.vale.ini` owns that fact already, in the sections standing the rule off
  `src/doors` and the editor files. Put the roots there.
- The approach gives `src/lsp` a door file and names no section standing the
  Go reading off it. Name it, beside the sections `.vale.ini` already holds.
- The approach hands the reads outside the two the ask names to the implement
  step. The ask asks for a clean `./RUNME.sh lint src`, so say which of them
  move behind a door and which take the value off the hand. A read of
  `process.platform` that builds a path is the case the criterion leaves open.
- The rest holds. `DoorsOnly.yml` stands, and `.vale.ini` runs it over `.go`
  beside `.js`. The hand `src/scripts/cli-doors.js` builds carries `env`, so
  the two reads the ask names take `it.env` and `box.env` as written.

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
