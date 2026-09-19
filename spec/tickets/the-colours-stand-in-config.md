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
group: the-tree-names-its-things
process: [[spec/processes/standard]]
process_hash: 838dd6d003506639
step: design/review
record:
  - step: design/draft
    hand: box d42624a67d18a8 · claude-code
    hash_before: ed0af70d163e60af84f6268f93ad4cbfca22d075
    hash_after: ed0af70d163e60af84f6268f93ad4cbfca22d075
  - step: design/review
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: 0a4ec85b0a388eb3f34006feba035e885ac46729
    hash_after: 0a4ec85b0a388eb3f34006feba035e885ac46729
    returns: 1
    why: "| the question reviewing asks | the answer |; |---|---|; | does the approach answer the ask | yes, and it names the road it takes and why |; | is what the diff touches beyond the ask trivial | yes, the commit writes this ticket alone |; | what does `./RUNME.sh check` answer | 0, with the server standing |; | does every rule the approach adds carry a case | yes, the case drives the projection and reads the Go |; | does every claim carry a proof | yes but one, and the shape count reads other than the tree |; TL;DR:; The road holds. A projection keeps the binary whole, and `spec/config/styles/VoiceParagraph` stands as the pattern.; The write door guards a target already. `ownerDoor` refuses a write to any target `projections.json` names.; The folder call holds. `styles` carries the Vale styles, and a name of its own suits the colours.; The shape count reads other than the tree, and the target's name sits one letter from a standing file.; The findings, one a line:; `projection.js` holds four shapes today, and `retro command` is the one the draft leaves out.; So the colour shape joins as the fifth. Name all four, or name the command answering the count.; `src/viewer/colours.go` stands one letter from `src/viewer/colour.go`, in one package.; Give the target a name a reader parts from the reader beside it, such as `colourvalues.go`.; [[spec/tickets/a-rename-reaches-every-note]] moves `src/viewer` under another name. Name which lands first.; What the agent needs:; | number | need | status |; |---|---|---|; | 1 | the shape count reads the tree, or names the command answering it | open |; | 2 | the generated target takes a name a reader parts from `colour.go` | open |; | 3 | the draft names which of the two folder tickets lands first | open |; | 4 | the review hand reads the approach again | open |"
  - step: design/draft
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: 3d20683e3ca37238ea9b78270575d336ab7e5c04
    hash_after: 3d20683e3ca37238ea9b78270575d336ab7e5c04
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
| the Go the projection writes | `src/viewer/palette.go`, generated |
| the entry naming the three | `spec/config/projections.json` |

The values stand beside `level0.json` and outside `spec/config/styles`. That folder holds the Vale styles, and one of its four is a projection target already. So a reader meeting `styles` meets prose rules there, and meets the window's colours under a name of their own.

**The shape.** `projection.js` names a shape a constant, and maps it to the ending its files take. A colour shape joins the shapes standing there, which `grep -n '"shape"' spec/config/projections.json` answers:

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

**The order.** This ticket lands first, and [[spec/tickets/a-rename-reaches-every-note]] carries the folder after it. That rename moves the generated file the way it moves every other, so it proves its own verb over a file a projection writes.

## review

<!-- reads the approach against the ask -->

### verdict

fail

| the question reviewing asks | the answer |
|---|---|
| does the approach answer the ask | yes, and it names the road it takes and why |
| is what the diff touches beyond the ask trivial | yes, the commit writes this ticket alone |
| what does `./RUNME.sh check` answer | 0, with the server standing |
| does every rule the approach adds carry a case | yes, the case drives the projection and reads the Go |
| does every claim carry a proof | yes but one, and the shape count reads other than the tree |

TL;DR:

- The road holds. A projection keeps the binary whole, and `spec/config/styles/VoiceParagraph` stands as the pattern.
- The write door guards a target already. `ownerDoor` refuses a write to any target `projections.json` names.
- The folder call holds. `styles` carries the Vale styles, and a name of its own suits the colours.
- The shape count reads other than the tree, and the target's name sits one letter from a standing file.

The findings, one a line:

- `projection.js` holds four shapes today, and `retro command` is the one the draft leaves out.
- So the colour shape joins as the fifth. Name all four, or name the command answering the count.
- `src/viewer/colours.go` stands one letter from `src/viewer/colour.go`, in one package.
- Give the target a name a reader parts from the reader beside it, such as `colourvalues.go`.
- [[spec/tickets/a-rename-reaches-every-note]] moves `src/viewer` under another name. Name which lands first.

What the agent needs:

| number | need | status |
|---|---|---|
| 1 | the shape count reads the tree, or names the command answering it | open |
| 2 | the generated target takes a name a reader parts from `colour.go` | open |
| 3 | the draft names which of the two folder tickets lands first | open |
| 4 | the review hand reads the approach again | open |

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

The owner reads the draft and rules against it twice. A reader takes this over the approach above, and the review reads both.

| what the draft says | what the owner rules |
|---|---|
| a projection writes the Go | the reader asks the config for a key, and holds what it reads |
| the values stand beside `level0.json` | the values stand under `spec/config/styles` |

The tree bears the owner out, and the evidence stands in the tree:

| what the draft claims | what stands |
|---|---|
| a Go program reads no config | `src/lsp/config.go` reads the three layers already, for the key `names.words` |
| a shared Go module is new machinery | `SHARED` in `src/scripts/viewer.js` carries `quackitect/yaml` across programs already |
| `spec/config/styles` holds a projection target | the entry names `spec/config/styles/VoiceParagraph`, so a file beside it stands free |

So a projection buys nothing a reader gives. The shape the owner names is one reader, asked for a key, holding what it reads until the file moves. `src/lsp/config.go` answers one key today, so the work is to let that reader take any key, and to share it.

A redraft takes this road, and names where the shared reader stands.
