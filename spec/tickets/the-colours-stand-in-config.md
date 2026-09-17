---
kind: [[ticket]]
state: open
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
process_hash: 838dd6d003506639
step: design/review
record:
  - step: design/draft
    hand: box d42624a67d18a8 · claude-code
    hash_before: ed0af70d163e60af84f6268f93ad4cbfca22d075
    hash_after: ed0af70d163e60af84f6268f93ad4cbfca22d075
---

# Ask

A person sets a colour where they set every other value, and the code names it. The owner reads one file to see what the window wears.

`src/viewer/colour.go` holds 38 colour numbers, and `grep -c` over the file answers that. A person wanting the window a shade darker reads Go, edits Go, and builds Go.

| what stands in code today | how many |
|---|---|
| the kind colours, the tool colours, the level colours and the four styles a name carries | 38 |

The owner rules that a colour is a config value, so it stands where the config stands and the code points at it. [[spec/guidance/working]] holds the rule the ruling rests on.

Two roads carry it, and this ticket picks one:

| the road | what it costs |
|---|---|
| the viewer reads the config at run time | a path to the root off the session file, and a read on every start |
| the config projects into a Go file | one shape in `projection.js`, and the write door guards the target as it guards the Vale rules |

The second road matches the tree, because `spec/config/styles/VoiceParagraph` already projects that way. It keeps the binary whole, and it asks for no file at run time.

Where the values land wants a word too. `spec/config/styles` holds the Vale styles, and one of its folders is a projection target. So a reader meets prose rules and window colours under one name.

- the colour numbers stand in one file under `spec/config`, and `grep -c` over `src/viewer` answers 0 outside the generated file
- the note says which road the change takes, and why
- `./RUNME.sh check` answers 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

The config projects into a Go file, the way the paragraph schema projects into the Vale rules.

The ask names two roads, and this draft takes the second. A run time read asks the binary to find the root off the session path, and it reads a file on every start. A projection keeps the binary whole, and the write door guards the target for free.

| what lands | where |
|---|---|
| the values a person sets | `spec/config/colours.json` |
| the shape a checker holds them to | `spec/config/colours.schema.json` |
| the Go the projection writes | `src/viewer/colours.go`, generated |
| the entry naming the three | `spec/config/projections.json` |

The values stand beside `level0.json` and outside `spec/config/styles`. That folder holds the Vale styles, and one of its four is a projection target already. So a reader meeting `styles` meets prose rules there, and meets the window's colours under a name of their own.

**The shape.** `projection.js` names a shape a constant, and maps it to the ending its files take. A fourth shape joins `config commands`, `paragraph rules` and `output style`:

| what the shape does | where |
|---|---|
| reads the JSON, and writes one Go file | a writer beside `rulesFrom` |
| says the ending | the endings map |
| refuses a hand edit to the target | the write door, which reads the entry already |

**What moves.** `colour.go` keeps what it decides, and gives up what it names:

| what | after |
|---|---|
| `kindColours`, `toolColours`, the level colours, the four styles a name carries | the config |
| `kindStyle`, `levelStyle`, `saidStyle`, the hash over an unknown kind | `colour.go`, reading the generated values |

So the numbers stand in one file, and the reading stands in another. `grep -c` over `src/viewer` outside the generated file answers 0, which the first row of `done_when` asks for.

**The check.** `./RUNME.sh check` reads every projection against its source already, so a value a hand edits in the target turns the check red. The case covering it drives the projection over a small config, and reads the Go it writes.

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

The owner names this while [[spec/tickets/the-viewer-draws-the-note]] adds a colour for a note. That change puts the number in the kind list, and takes one copy out. `saidStyle` wrote the answer's number a second time, and it reads the list now.

So the kind list stands as the one home for a kind's colour today, and this ticket moves that home out of Go.
