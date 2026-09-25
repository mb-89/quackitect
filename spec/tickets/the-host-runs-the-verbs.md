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
          - name: callers
            form: list
            says: every caller of what the approach changes, one a line, as a file and a function
          - name: answers
            form: list
            says: every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft
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
process: [[spec/processes/standard]]
process_hash: 7a1a6e274b56e7ee
group: the-editor-holds-the-drawing
depends_on: [the-inset-folds-the-frontmatter, the-ticket-answers-the-editor, the-drawing-draws-a-route]
step: implement/tests-red
record:
  - step: design/draft
    hand: box 75b31b3d5012 · claude-code-remote
    hash_before: b591f43f5f7b9f9f2da4f58b8920959557b016c7
    hash_after: b591f43f5f7b9f9f2da4f58b8920959557b016c7
  - step: design/review
    hand: box 75b31b3d5012 · claude-code-remote · helper-11
    hash_before: cf85e458a4e58ac8ac801e765e811b509c92c188
    hash_after: cf85e458a4e58ac8ac801e765e811b509c92c188
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

A press in the drawing does what it shows. A jump opens the chapter at its line, an edit moves the route, and a press on the pointer takes or hands back. The host runs each verb as a child process, the way the lens runs its buttons. The plan stands in [[spec/design_input/the-editor-draws-the-ticket#the-editor-holds-the-drawing]].

Without it the drawing draws and does nothing, so a person edits the route as YAML and level one stays open.

- a jump opens the ticket at the chapter and the line its node names, and a test drives it
- a route edit runs `ticket route`, and a test reads the verb and its arguments
- a press on the pointer runs the take or the hand-back, and a test drives it
- a verb that fails shows its refusal in the editor, and a test drives it
- `./RUNME.sh check` passes

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

The host answers every press the page posts, and runs a verb through the road the ticket buttons run. So the take, the hand-back and a refusal read alike from a button and from the drawing.

| the press | the host runs | through |
|---|---|---|
| `jump` | opens the ticket, and puts the cursor on the node's `line` | `door.jumps(path, line)` |
| `edit` | `ticket route <ticket> --steps=<json>`, with the whole route the page posts | `door.runsVerb`, as `routeArgvOf(ticket, steps)` answers it |
| `take` | the pull the take button runs | `ticketLensOf(door).took("take", ticket, path)` |
| `handback` on a verdict leaf | the pull the verdict button runs | `ticketLensOf(door).took("back", ticket, path)` |
| `handback` on another leaf | a pick of pass or fail, then the pull that button runs | `door.picks`, then `ticketLensOf(door).took` |

| part | file | what it does |
|---|---|---|
| the answers | `src/extension/lib/route-host.js`, `took` | routes each press as the table says, and posts nothing to the page. The next `changed` redraws the route the verb writes |
| the route line | `src/extension/lib/lens.js`, `routeArgvOf(ticket, steps)` | the argv of `ticket route`, beside `argvOf` |
| the refusal | `src/extension/lib/route-host.js`, `took` | reads the route verb's JSON, and a `refused` raises a warning through `door.tells` and says the lines through `door.says` |
| the verdict leaf | `src/extension/lib/route-host.js`, `took` | reads the leaf `stepsIn` answers for the step, the way `handBackOf` does |
| the jump | `src/extension/editor-inset.js`, `jumps(path, line)` | `showTextDocument` with a selection on the line |
| the pick | `src/extension/editor-lens.js`, `picks(prompt, options)` | `showQuickPick`, and an empty answer where the person closes it |

The tests stand in `test/level0/route-host.test.js`, over the fake door:

| case | what it asserts |
|---|---|
| a jump opens the chapter's line | `jumps` gets the path and the node's line |
| an edit runs the route verb | `runsVerb` gets `ticket route <ticket> --steps=<json>` |
| a take runs the pull | `runsVerb` gets `ticket pull <ticket>` |
| a hand-back on a verdict leaf runs the pull | `runsVerb` gets `ticket pull <ticket>`, and the ticket saves first |
| a hand-back on another leaf asks | a pick of pass runs `--pass`, and a closed pick runs nothing |
| a refused route shows its refusal | `tells` gets the refusal as a warning |

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `src/extension/lib/route-host.js`, `routeHostOf`, whose `took` answers each press
- `src/extension/lib/lens.js`, `ticketLensOf().took`, which the host calls for the take and the hand-back
- `src/extension/editor-lens.js`, `lensDoor`, which gains `picks`
- `src/extension/editor-inset.js`, `insetDoor`, which gains `jumps`
- `test/level0/route-host.test.js`, `doorOf`, which gains a fake for each door call the table names, and `runsVerb`

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- first

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

pass

The approach answers each line of the ask, and no finding blocks it.

| the ask | the approach |
|---|---|
| a jump opens the chapter's line | `door.jumps(path, line)`, with a case |
| a route edit runs `ticket route` | `routeArgvOf`, with a case reading the argv |
| a press on the pointer takes or hands back | `ticketLensOf(door).took`, with three cases |
| a refusal shows in the editor | the route JSON through `door.tells`, with a case |
| `./RUNME.sh check` passes | it answers 0 on this commit |

The findings, each a detail the implement step carries:

- The graph's `line` counts from one, so `jumps` selects `line - 1` in the editor.
- `took` in the host reads the path from the `pageFor` closure, since `one` holds none.
- The route verb writes the disk, so the host saves a dirty ticket before the edit.
- The case "the verbs wait for the next ticket" goes, since the verbs now run.
- A take through the lens shows its own refusal, so the route case covers the new road.

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
