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
group: the-bridge-keeps-transport
process: [[spec/processes/standard]]
process_hash: 838dd6d003506639
step: design/review
record:
  - step: design/draft
    hand: box fa49097ce66c · claude-code-remote
    hash_before: 8db360a439c2b09c473fbbed07d6c3197c77eae5
    hash_after: 8db360a439c2b09c473fbbed07d6c3197c77eae5
---

# Ask

A hook that answers nothing shows up in the first minute, where a hand can act on it.

A dead hook writes a failure on every event, and the session runs blind to it.

- `./RUNME.sh doctor` probes every hook URL the settings files name.
- The doctor reports a hook that answers nothing as a warn line.
- The entry at `127.0.0.1:36368` leaves `.claude/settings.local.json`.
- `./RUNME.sh test` covers a hook answering nothing.

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

- one reader collecting every hook address the settings name
- one probe a hook, beside the probe the server already takes
- one row a hook in the doctor, and the third line of the ask off this tree

**What stands.** `doctor` in `src/scripts/cli-check.js` prints a row a thing,
and `serverLine` probes the one address it knows. Nothing there reads a
settings file, and nothing probes a hook.

| what the doctor names today | where it comes from |
|---|---|
| every tool the survey found | `.se/.runtime/tools.json` |
| the editor, the sidebar, the commit hook | the tree |
| the server | one health call |

**The reader.** A settings file holds its hooks under one key, and an address
there stands as a string. The reader walks the three files the client reads,
takes every string under `hooks` that parses as a URL, and keeps where it came
from.

| the file | who writes it | does git track it |
|---|---|---|
| `.claude/settings.json` | this tree | yes |
| `.claude/settings.local.json` | the box | no |
| the settings under the home of the box | the box | no |

**The probe.** Each address takes the same shape the server probe takes: one
call, a short wait, and an answer read as a row.

| what the probe meets | the row |
|---|---|
| an answer | `stands at <the address>` |
| nothing, inside the wait | a `warn` row naming the address and the file |
| an address no reader parses | a `warn` row naming the string |

The wait stands in one place beside the server's own, so a slow box moves both
together. A file standing nowhere reads as no hooks, and the doctor says
nothing of it.

**The cases.** Each drives the reader and the probe over fakes.

- the reader takes an address out of each of the three files
- the reader passes a settings file holding no hooks
- the probe answers a row a hook, over a fake wire
- a hook answering nothing reads as a warn row naming its file

**The third line.** The ask names an entry at a port in
`.claude/settings.local.json`. That file stands in `.gitignore`, and nothing in
this tree reads or writes it. So a hand on the box it belongs to takes that
line, and the doctor is what shows them the entry.

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

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
