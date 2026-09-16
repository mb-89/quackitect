---
kind: [[ticket]]
state: open
urgency: soon
step: implement/tests-green
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
process: [[standard]]
process_hash: d1fd9cd113889f29
group: level-zero-hands-over
record:
  - step: design/draft
    hand: box 747cff5c2f2a
    hash_before: 347b6637434a6a9e8b048964f1e9968e28e1821f
    hash_after: 347b6637434a6a9e8b048964f1e9968e28e1821f
  - step: design/review
    hand: box 747cff5c2f2a · helper-2
    hash_before: f37ce609bbfc3d843a956d98c971ad9dfbb25435
    hash_after: f37ce609bbfc3d843a956d98c971ad9dfbb25435
  - step: implement/tests-red
    hand: box 747cff5c2f2a
    hash_before: 1faa9b14f661bd49749bc38ff442b499490b975f
    hash_after: 1faa9b14f661bd49749bc38ff442b499490b975f
    answered:
      - name: tests
        exit: 1
        said: assertion, 5 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box 747cff5c2f2a
    hash_before: a582eb8874b6e45ddd04deccd5e32041df3a6fa2
    hash_after: a582eb8874b6e45ddd04deccd5e32041df3a6fa2
    answered:
      - name: lint
        exit: 0
        said: 51 stand at warning, which the panel draws and check allows.
---

# Ask

The engine also hands the agent the tool list. At session start it surveys
which tools stand on the box, the way v4 did. The standing layer carries one
line per tool saying when to reach for it. Today `./RUNME.sh tools`
writes `.se/tools.json`, and no session reads it. So an agent reads the disk
with Grep and skips the index, patch and replace.

Where it stands: the design input `spec/design_input/the-agent-pulls-tickets.md`
says what the owner asks for, and the page beside it draws it. Read the note
first. Level zero holds every door it holds today, and this branch wires the
pull into them. Its chapter is What level zero changes.

| what stands today | where |
|---|---|
| the brief door, which hands over `HANDOVER.md` and deletes it | `.claude/skills/level0/hooks/level0.js` |
| the answer door, which reads the session's messages and admits one tool | `.claude/skills/level0/lib/answer.js` |
| `work-waiting`, which counts tasks | `spec/config/stop/level0.yml` |
| the viewer's colours | `src/extension/webview/` |
| `engine.binding` and `engine.autonomy` | `spec/config/level0.schema.json` |

What waits:

| the piece | where | proves it |
|---|---|---|
| the brief door goes | the hooks | the block on a cloud box says to run the pull, once `branch list` names no brief |
| `work-waiting` | the stop rule | it reads the session's hold file and counts private tickets |
| the answer door | `lib/answer.js` | it reads the `note` row off the log, where the prompt names a note |
| the viewer | the webview | `note` draws pink, under the prompt it answers |
| `unbound` | the binding | it hands out nothing, and `pull <ticket>` takes a named one |
| `engine.autonomy` | the pull | `finish` mints notes alone, `start` mints into its own group, `ideation` mints loose tickets |
| the old verbs | `work.js` | `take`, `done` and `collect` over a brief go once the last brief merges |

The rules to hold:

- A note answers no other prompt, so the readback stays owed everywhere else.
- The trunk guard stays as it is.
- A loose ticket from a cloud box rides the group's branch and lands at the merge.

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

| the ask asks | the answer |
|---|---|
| who reads the survey | the guidance door, at every session start |
| what the standing layer carries | one line per tool, saying when to reach for it |
| what a fresh box does | runs the survey first, then reads it |

- The guidance door reads the survey at session start and hands the session a tools block beside the rules block.
- Every entry of the wanted list carries when to reach for the tool, as data beside the name.
- A registered tool's line comes off its description, so the text stands once.
- The canary keeps its counts of rules and notes.

| piece | where | does |
|---|---|---|
| `for` on every entry of the wanted list | the tools library | says when to reach for the tool |
| `toolLines` | the tools library | one line per tool the survey finds, with its version and its `for`. One line per tool level zero registers, with the first sentence of its description |
| the tools block | the guidance door | reads the survey at session start, runs it first on a fresh box, and rides beside the rules block |
| the callers table | the tools note | gains the guidance door as a caller, and a chapter says what the tools block carries |

The brief's other rows, and where each stands on trunk:

| row | stands | next |
|---|---|---|
| the brief door goes | done | the hook leaves the brief alone, and the cloud block names the pull |
| `work-waiting` reads the hold and the private tickets | done | the level one stop rules read them |
| `pull <ticket>` takes a named group | done | a name on trunk takes its branch |
| the answer door reads the `note` row | open | the group's split |
| the viewer draws `note` in its own colour | open | the group's split |
| `unbound` and `engine.autonomy` | open | the group's split |
| the old verbs over a brief go | open | the group's split |

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

pass

- The approach answers the ask. A tools block rides beside the rules block at session start, one line per tool. `for` on every wanted entry says when to reach for it.
- A registered tool's line comes off its description. `patch` opens with what it does, and the line says when only where the first sentence does.
- `work-waiting` counts tasks still. `ticket-in-hand` in the level one rules reads the hold folder and the private tickets. The row stands done under that name.
- The tools note's callers table names the hooks module reading the survey at session start. The hook reads no survey. The row goes where the guidance door takes its place.
- The other rows read true. The hook carries no brief door, and the cloud block names the pull. A group name on trunk takes its branch. `note`, `unbound`, `engine.autonomy` and the old verbs stand open, as the table says.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

    ./RUNME.sh branch test

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

Five tests fail on their own assertion: two over the door and three over the library.
The surprise is the word the verb answers: a missing export reads as a build fault. So a bare stub stands under each new name, and the assertion fails first.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches the tools library, the guidance door, the server, the tools note and two test files
- the door reaches the disk and the process through the fakes, so the tests run in memory
- the header of the door test names the approach, and the code points at the tools note

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

    ./RUNME.sh lint

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches the tools library, the guidance door, the server, the tools note and two test files
- the stop door and its test take two lines more, so the queue check reads the environment off the box
- the door reaches the disk and the process through the fakes, so the tests run in memory
- the door test's header names the approach, and the code points at the tools note

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

The design draft went back through the shell after the judge refused five rewrites and named no rule. The red tests went the same road after two refusals. The judge reads the voice rules over the evidence, and two of them describe an answer. A private note carries the finding for the retro.
