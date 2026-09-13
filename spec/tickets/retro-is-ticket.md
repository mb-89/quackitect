---
kind: [[ticket]]
state: draft
urgency: soon
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
    needs: ["work test"]
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
    evidence:
      - name: read
        form: files
        says: every file you read, one a line
      - name: verdict
        form: verdict
        says: pass or fail, findings one a line
process: [[standard]]
group: the-retro-is-a-ticket
---

# Ask

# Where it stands

The design input `spec/design_input/the-agent-pulls-tickets.md` says what the
owner asks for, and its chapter The retro says what this branch builds. The
two routes stand in the tree already: `spec/processes/retro.yaml` and
`chapter.yaml`, beside `group.yaml`, whose retro phase shares the notes
command with this branch.

A retro is a ticket. Its readers are its children, one per chapter of the
window, and the retro's own hand mines the rest leaf by leaf. The report is
the ticket's own evidence, in git.

| what stands today | where |
|---|---|
| the pull, the record, the hold and the spawn | the pull branch and the hands branch |
| the log, one row per tool call, prompt and refusal under the plugin | `.se/log/session.jsonl`, through `lib/log.js` |
| the harness transcripts, with the thoughts as `thinking` blocks | the harness's own project folder, one JSONL per session |
| v4's retro verb, which rotates, drains, copies and refuses | `origin/v4:src/engine/retro.go`, as prior art and no more |
| the routes | `spec/processes/retro.yaml`, `chapter.yaml` |

Read v4's verb before you write this one. It settles what drains and what
copies, and why a retro refuses while anyone holds work.

# What waits

| the piece | where | proves it |
|---|---|---|
| `retro collect` | `src/scripts/work.js` | it rotates the log, drains `.se/log`, `.se/scripts` and the scratchpad, copies the transcripts, and refuses while a hand holds a ticket |
| the take list | `retro collect` | it takes what it names and nothing else, so `.se/retro/`, the hold, the box id, the config, the bin and the handover stand as they are |
| every line a reader | `retro collect` and the routes | the manifest names each thing taken, and the `unread` leaf checks it against what the leaves read |
| the manifest | `.se/retro/<stamp>/manifest.jsonl` | one line per thing taken, with its origin and its fate |
| the window | `retro collect` | from the last retro's close commit to now, and from the first commit where none stands |
| the chapters | `retro collect` | six hours that hold activity, off the timestamps, one private `chapter` ticket each with its counts as the ask |
| the counts | `retro collect` | prompts, tool calls, shell commands, refusals by kind, errors, tickets that move, notes that appear, the median length of a thought |
| the files the mine leaves read | `retro collect` | the shell commands by job, the refusals by rule, the closed tickets' records, the counts per chapter, the scripts, the merged groups' retro leaves |
| `/se-retro` | the projection, beside the config commands | it mints a retro and pulls it |
| `by: helper` | the pull | a reader goes to a hand the engine spawns for it, and to nobody else |
| `work.retroReaders` | the config and the pull | four hands read the chapters at once, and each takes the next chapter until none stands |
| the `method` leaf | the retro route | the retro reads its own run, and what it changes in the route goes out as a ticket |
| `retro notes` | `work.js` | it passes when `.se/tickets/` holds no note, and the group's retro phase runs the same command |
| `retro score` | `work.js` | it prints how many of the last retro's improvements stand in the tree |
| the lists in the folder | `retro collect` | the tickets that close in the window with their records, the retro leaves of the groups that merge in it, and the earlier retros |
| `work.retroCap` | the config | it reads, default 7 |
| the first retro | a desk, with the owner | one retro of this project runs end to end, and its report stands as a closed ticket |
| `retro` as its own verb | `src/scripts/cli.js` | `./RUNME.sh retro collect`, `retro notes` and `retro score` stand beside `work`, and `/se-retro` starts a retro |

# The rules to hold

- A retro is blameless. It repairs the generator of a bad output, and the finding is the generator.
- The drain has no undo. So the verb refuses while a hand holds a ticket, and the manifest names every file.
- The transcripts are another program's files. Copy them, and delete none.
- A person can take every step of the retro. `collect` is a command, and `mine` is a reading with fields.
- Nothing under `.se/retro` reaches git. The ticket's evidence is what travels.
- A chapter's reader is a spawned hand, and four read at once. The retro's own hand reads no chapter.
- The window's first retro is long, and that is the point: the project holds no earlier one.

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

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

## reflect

<!-- names the class of error in the findings, and the fix for the class -->

### class

<!-- the class of error the findings describe, and the fix for the class -->

<!-- the form is text -->

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->

<!-- the form is command -->

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

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->

<!-- the form is files -->

## verdict

<!-- pass or fail, findings one a line -->

<!-- the form is verdict -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
