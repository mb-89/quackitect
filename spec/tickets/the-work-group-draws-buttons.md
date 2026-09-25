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
depends_on: [the-ticket-answers-the-editor, a-save-fills-the-ticket]
step: implement/tests-red
record:
  - step: design/draft
    hand: box 75b31b3d5012 · claude-code-remote
    hash_before: 71b21c6846ab7a4b348874ba61258361a4c6e63d
    hash_after: 71b21c6846ab7a4b348874ba61258361a4c6e63d
  - step: design/review
    hand: box 75b31b3d5012 · claude-code-remote · helper-2
    hash_before: 93d057508dc51c5efc59ee42bd68ccdd795b86e8
    hash_after: 93d057508dc51c5efc59ee42bd68ccdd795b86e8
    returns: 1
    why: "| grade | finding | fix |; |---|---|---|; | blocking | Four done lines each call for a test, and the approach names none. | Name one test a done line in `test/level0/sidebar.test.js`, with the fake each feeds. |; | detail | `runsVerb` takes an argv, and `counts` holds a shell line opening with `./RUNME.sh`. | Drop the `./RUNME.sh` head and split the rest into the argv. |; | detail | `runsVerb` wraps each run in a progress toast, and `html` runs on every redraw. | Run the count on a road that shows no toast. |; | detail | `work.pull` carries `runs`, and the approach keys the pull on `pulls`, which no row adds. | Add `pulls` in the config row, or key the pull on `work.pull`. |; | detail | `door.asks` in the sidebar opens a folder picker, and a ticket name wants a line. | Ask the name through `asksLine`, and name it in the callers list. |; | detail | `ticket yours --next` answers `{\"ticket\":null}` on an empty queue. | Name what pull for me tells the person then. |; `./RUNME.sh check` answers 0 on this commit."
  - step: design/draft
    hand: box 75b31b3d5012 · claude-code-remote
    hash_before: d3385d91d3712a26988317d4f965829fb7b1d5cb
    hash_after: d3385d91d3712a26988317d4f965829fb7b1d5cb
  - step: design/review
    hand: box 75b31b3d5012 · claude-code-remote · helper-4
    hash_before: f818c23ca75ef164f5d376eaa4b21c91642afee2
    hash_after: f818c23ca75ef164f5d376eaa4b21c91642afee2
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

A person starts every piece of work from one place in the sidebar: the work editor, pull for me and new ticket. Pull for me takes the ticket the queue hands them, and new ticket opens a file with a process to pick. The plan stands in [[spec/design_input/the-editor-draws-the-ticket#the-work-group]].

Without it a person reaches the queue and a new ticket through the terminal alone, and level one stays open.

- the work group draws the three buttons the config declares, and a test reads them
- the work editor's button carries the count `ticket yours --count` answers, and a test drives it
- pull for me pulls the ticket `ticket yours --next` names and opens it, and a test drives it
- new ticket asks for a name and opens a file with an empty `process`, and a test drives it
- `./RUNME.sh check` passes

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

The config already declares the buttons, and the sidebar draws a group where an entry names it. So the change marks the buttons' group, and teaches the sidebar the keys the entries carry.

| part | file | what it does |
|---|---|---|
| the group | `spec/config/level0.schema.json`, `work.editor`, `work.pull`, `work.new` | each names `group: work`, a row and a column, so `groupsIn` draws them. `work.pull` gains `pulls: true` |
| the line | `src/extension/lib/work.js`, `argvOf(line)` | drops the `./RUNME.sh` head of a config line, and splits the rest into the argv a verb takes |
| the count | `src/extension/sidebar.js`, `html` | runs the line an entry's `counts` names through `door.asksVerb`, a run with no progress toast, and hands the count to the panel |
| the badge | `src/extension/lib/panel.js`, `widget` | draws the count beside the mark |
| the pull | `src/extension/sidebar.js`, `took` | where the entry carries `pulls`, runs its line, and takes the ticket the answer names through `ticketLensOf(door).took`. It then opens the path |
| the empty queue | `src/extension/sidebar.js`, `took` | where the answer names no ticket, tells the person that nothing waits on them, and runs no pull |
| the new ticket | `src/extension/sidebar.js`, `took` | where the entry carries `opens`, asks the name through `door.asksLine`, writes a ticket with `kind` and an empty `process` where no file stands, and opens it |
| the answers | `src/extension/lib/work.js` | reads the count and the next ticket off the verb's JSON, turns a name into a path, and holds the new ticket's text. It calls no editor |
| the doors | `src/extension/editor-files.js`, `opens(path)`, and `src/extension/editor-lens.js`, `asksVerb(argv)` | open a file in the markdown editor, and run a verb with no toast |

The pull runs as a person, through the road the ticket buttons run. The fill on save then writes the new ticket's route. For details, see [[spec/tickets/a-save-fills-the-ticket]].

The tests stand in `test/level0/work-group.test.js`, over the sidebar's fake door with a fake for each new door call:

| done line | case |
|---|---|
| the group draws the three buttons | the HTML carries `work.editor`, `work.pull` and `work.new` in the section `work` |
| the count rides the work editor | an `asksVerb` answering `{"count":3}` draws the count 3 on `work.editor`, and the line it ran is `ticket yours --count` |
| pull for me pulls and opens | a press runs `ticket yours --next`, then `ticket pull` on the answer, and opens its path. An empty queue tells and pulls nothing |
| new ticket asks and opens | a press asks a name, writes `spec/tickets/<name>.md` with an empty `process`, and opens it. A name standing already opens the file and writes nothing |

`test/level0/work.test.js` holds the strings of `lib/work.js`.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `src/extension/extension.js`, `activate`, which hands the sidebar its door
- `src/extension/editor.js`, `editorDoor`, which spreads the file door and the lens door the sidebar now calls
- `src/extension/editor-lens.js`, `asksLine`, which the new ticket asks the name through
- `src/extension/lib/lens.js`, `ticketLensOf().took`, which pull for me takes the ticket through
- `src/extension/lib/panel.js`, `panelHtml`, which draws the badge
- `src/extension/lib/widgets.js`, `groupsIn`, which reads the group the config names
- `test/level0/sidebar.test.js`, `doorOf`, the fake the new test builds on, whose cases stay green on a door with no `asksVerb`

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- a test a done line: the case table names one for each
- the shell line: `argvOf` drops the head and splits the rest
- the toast on every redraw: the count runs through `asksVerb`, which shows none
- the `pulls` key: the config row adds it
- the folder picker: the name comes through `asksLine`
- the empty queue: the person reads that nothing waits on them, and no pull runs

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

pass

| grade | finding | fix |
|---|---|---|
| detail | The cases sit in `work-group.test.js`, and `doorOf` stands unexported in `sidebar.test.js`. | Put the cases in `sidebar.test.js`, or lift the fake into a shared module. |
| detail | The fake door seeds a test schema, and the first done line reads the config. | Seed the real `level0.schema.json` for the work group case. |
| detail | `ticketLensOf().took` calls `says`, `tells`, `saves` and `lensChanged` on the door. | Give the fake door each of these, and assert the pull runs `ticket pull`. |
| detail | `work.new` carries `asks`, so `lineOf` opens the folder picker first. | Branch on `opens` ahead of `lineOf` in `took`. |
| detail | A typed name can carry a slash or a dot pair. | Refuse a name outside the ticket name form, and test the refusal. |
| detail | The new `argvOf` in `lib/work.js` shares a name with the `lens.js` export. | Name the new one for the config line it splits. |

Every finding of the earlier review meets its answer:

- a test a done line: met, by the case table
- the shell line: met, by the split
- the toast on every redraw: met, by `asksVerb`
- the `pulls` key: met, in the config row
- the folder picker: met, by `asksLine` in the callers list
- the empty queue: met, by the line telling the person

`./RUNME.sh check` answers 0 on this commit.

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
