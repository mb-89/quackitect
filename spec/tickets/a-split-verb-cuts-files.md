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
group: the-verbs-take-the-shell
process: [[spec/processes/standard]]
process_hash: 838dd6d003506639
step: design/draft
record:
  - step: design/draft
    hand: box b99ea8ab11a8 · claude-code-remote
    hash_before: 258c594894a140c023429cb14b35509ce9f17ed6
    hash_after: 258c594894a140c023429cb14b35509ce9f17ed6
  - step: design/review
    hand: box 099c2ec7708d · claude-code-remote
    hash_before: 9ba66489302a66beb6191050d36b1eb605d31e44
    hash_after: 9ba66489302a66beb6191050d36b1eb605d31e44
    returns: 1
    why: "the mint says nothing about a second refusal, so one file past the ceiling takes a ticket each time; say which hand runs the mint: the door itself, or the hand the refusal names; the journal's writer reads as a verb. Name `src/bridge/apply.js`, the batch edit behind the patch and replace tools; the flags table stands here and in the level0 note. Say which of the two owns it; the ask names `./RUNME.sh test`, and the approach names no case file the cut and the mint land in; `sizeFaults`, `FILE_RULE`, `journalOf` and the `trivial` process all stand, and the ceiling chapter takes the verb; `./RUNME.sh lint src test` answers clean, so the verb guards the next file and cuts none today"
---

# Ask

A file past the ceiling comes down by a verb, and the work it blocks carries on.

Every write to a long file meets a refusal, and hands squeeze lines to get past it.

- `./RUNME.sh split <file>` takes line ranges and target files, and keeps its own undo.
- A ceiling refusal on a file already past the ceiling mints a split ticket and names it.
- `./RUNME.sh lint src/scripts` names no FileCeiling after the splits land.
- `./RUNME.sh test` covers the verb and the minted ticket.

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->
<!-- the form is text -->

`./RUNME.sh split <file>` cuts by range into targets, and the journal that already stands takes it back.

| the flag | what it takes |
|---|---|
| `<file>` | the file the cut reads |
| `--to <path> --lines <from>-<to>` | one target and the range it takes, named again for each target |
| `--dry` | the cuts it would write, and no write |

| what the verb needs | what stands |
|---|---|
| the ceiling and the faults | `sizeFaults` and `FILE_RULE`, under `.claude/skills/level0/lib/size.js` |
| the undo | the journal under `.claude/skills/level0/lib/undo.js`, which `apply` writes |
| the ticket | `./RUNME.sh mint ticket <path> --process=trivial` |

The verb writes every target and the rest of the source through the journal, so one `undo` puts the whole cut back.

The refusal that mints:

- the write door reads `grows`, so a file past the ceiling takes a cut and refuses a growth
- the refusal on such a file mints a split ticket off `trivial`, and names it in the refusal
- the ticket's ask names the file, what the lint says, and the topics the cut follows

`./RUNME.sh lint src/scripts` names no `FileCeiling` today, so the verb guards the next file. The cases drive the cut over text in memory, and drive the refusal into the mint.

[[spec/design_output/level0#the-size-ceiling]] takes the verb and the mint.

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->
<!-- the form is verdict -->

fail

- the mint says nothing about a second refusal, so one file past the ceiling takes a ticket each time
- say which hand runs the mint: the door itself, or the hand the refusal names
- the journal's writer reads as a verb. Name `src/bridge/apply.js`, the batch edit behind the patch and replace tools
- the flags table stands here and in the level0 note. Say which of the two owns it
- the ask names `./RUNME.sh test`, and the approach names no case file the cut and the mint land in
- `sizeFaults`, `FILE_RULE`, `journalOf` and the `trivial` process all stand, and the ceiling chapter takes the verb
- `./RUNME.sh lint src test` answers clean, so the verb guards the next file and cuts none today

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
