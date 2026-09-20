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
  - step: design/review
    hand: box 0eb9ad6feedf · claude-code-remote · helper-4
    hash_before: a69bafd762d2e94a3e63c4bdacb8809d8cd53016
    hash_after: a69bafd762d2e94a3e63c4bdacb8809d8cd53016
    returns: 2
    why: "| the question reviewing asks | the answer |; |---|---|; | does the approach answer the ask | no, it takes the road the owner rules against under `Discussion` |; | is what the diff touches beyond the ask trivial | yes, the commit writes this ticket alone |; | what does `./RUNME.sh check` answer | 0, with the server standing |; | does every rule the approach adds carry a case | the case it names covers the projection, which the ruling drops |; | does every claim carry a proof | yes, and the earlier findings land |; TL;DR:; The owner rules twice under `Discussion`. The redraft answers neither ruling.; The tree bears the owner out. Each file carrying that reads as the ruling says.; The three earlier findings close. A redraft keeps what they fixed.; The findings, one a line:; The draft projects a Go file. The owner rules the reader asks the config for a key.; `src/lsp/config.go` reads the three layers for a key. So a Go program reading config stands.; `SHARED` in `src/scripts/viewer.js` carries `quackitect/yaml` across programs. So a shared reader rides standing machinery.; The draft puts the values beside `level0.json`. The owner rules they stand under `spec/config/styles`.; `spec/config/projections.json` names one target under `spec/config/styles`. So a file beside it stands free.; The redraft names the command answering the shape count. It names `src/viewer/palette.go`, and it names this ticket first.; What the agent needs:; | number | need | status |; |---|---|---|; | 1 | the draft takes the reader road the owner rules for | open |; | 2 | the values land under `spec/config/styles` | open |; | 3 | the draft names where the shared reader stands, and the key the viewer asks it for | open |; | 4 | the review hand reads the approach again | open |"
  - step: design/draft
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: 56322670ee42c5ff24f37be947fd8fecbf3a6a44
    hash_after: 56322670ee42c5ff24f37be947fd8fecbf3a6a44
  - step: design/draft
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: c671e415aa7f9f0d63b7098084ff17fb80ab8099
    hash_after: c671e415aa7f9f0d63b7098084ff17fb80ab8099
    returns: 1
    why: the hand takes it back
  - step: design/draft
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: 719143ebec1cb91b4e0d44002d7f38028385ed3b
    hash_after: 719143ebec1cb91b4e0d44002d7f38028385ed3b
  - step: design/review
    hand: box 0eb9ad6feedf · claude-code-remote · helper-8
    hash_before: 252583fa2270dab17d966fcad45135065be0f228
    hash_after: 252583fa2270dab17d966fcad45135065be0f228
    returns: 3
    why: "| the question reviewing asks | the answer |; |---|---|; | does the approach answer the ask | in part, and the first line of `done_when` goes missing |; | is what the diff touches beyond the ask trivial | yes, the commit writes this ticket alone |; | what does `./RUNME.sh check` answer | 0, with the server standing |; | does every rule the approach adds carry a case | yes, a case a layer over a fixture root and a case over the shipped file |; | does every claim carry a proof | one fails, the grep the draft cites over `src/viewer` |; TL;DR:; The road holds. The redraft takes the reader the owner rules for, and lands the values under `spec/config/styles`.; The move stops at `colour.go`. A colour number stands outside it, so the grep the draft cites answers other than 0.; The notes naming what moves get no line in the draft.; The findings, one a line:; `src/viewer/ui.go` wears the selected row's background, and `src/viewer/tabs.go` wears the open tab.; `grep -rc` over `src/viewer` reads those files, so the first line of `done_when` fails.; The table of what moves names `colour.go` alone. Name both files there, or say why each colour stands in Go.; `src/viewer/detail_test.go` asserts the prompt's colour by number. Say whether that case reads the config or holds a fixture.; `spec/design_output/viewer#colours` points the reader at `kindColours` in `colour.go`. Name the line the move rewrites.; `spec/design_output/level0.md` gives `spec/config/styles` to Vale. A JSON file there wants that line to name the other kind.; The earlier findings close: the reader road, the folder the ruling names, and the shared reader riding `SHARED`.; What the agent needs:; | number | need | status |; |---|---|---|; | 1 | the table of what moves names every file under `src/viewer` holding a colour | open |; | 2 | the draft says what the standing case asserting a colour by number reads | open |; | 3 | the draft names the notes the move rewrites | open |; | 4 | the review hand reads the approach again | open |"
  - step: design/draft
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: ab5ba40b770e73b6e889d0685e20f88be572088c
    hash_after: ab5ba40b770e73b6e889d0685e20f88be572088c
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

The viewer asks the config for its colours, and holds what it reads.

| what the ruling under `Discussion` says | what this draft does |
|---|---|
| the reader asks the config for a key | a shared Go module answers a key out of a config file |
| the values stand under `spec/config/styles` | they stand in `spec/config/styles/colours.json` |

The road the two drafts before this took, a projection into Go, drops here.

**The reader.** `src/lsp/config.go` reads the three layers for `names.words` today. That read moves into a module of its own, `src/config`, and takes a key written with dots. `SHARED` in `src/scripts/viewer.js` carries the module across programs the way it carries `quackitect/yaml`, so the viewer builds against it.

| what the module answers | for |
|---|---|
| a value at a key, over the three layers | `src/lsp`, which keeps `names.words` and loses its own read |
| the map a named file holds at a key | `src/viewer`, which takes its colours |

**The root.** `workRoot` in `src/viewer/work.go` answers the root off the session path already. The colour read takes that root, so the window asks for no path of its own.

**What moves.** Every colour number under `src/viewer` moves, and `grep -rn 'lipgloss.Color("' src/viewer` answers which files hold one:

| the file | what it gives up |
|---|---|
| `colour.go` | `kindColours`, `toolColours`, the level colours, the styles a name carries, `spare` |
| `tabs.go` | `openStyle`, the colour the open tab wears |
| `ui.go` | the background the selected row wears |
| `detail_test.go` | the numbers it asserts, which read the fixture the case builds |

Each file keeps what it decides. `kindStyle`, `levelStyle`, `saidStyle` and the hash over a kind the list holds nowhere stay in `colour.go`, reading what the module answers. The window reads the file once, at start, and holds what it reads.

**The case reading a number.** `detail_test.go` asserts the prompt's colour by its number today. It takes a fixture root the case writes, so it reads the config the module reads and asserts against the fixture's own number. No case reads the shipped file for a number.

**What the notes say after.** Two lines point at what moves, and the change rewrites both:

| the note | the line |
|---|---|
| [[spec/design_output/viewer#colours]] | points a kind's colour at `kindColours` in `colour.go`, and points it at the config file after |
| [[spec/design_output/level0]] | gives `spec/config/styles` to Vale, and names the colours file standing beside the styles after |

**The check.** A Go case drives the module over a fixture root, one case per layer, beside the cases `src/lsp` carries today. A second case reads the shipped file and asserts a colour for every kind [[spec/design_output/viewer#colours]] names. A file the reader reaches nowhere leaves each colour empty, so the window wears the terminal's own and draws on.

**The order.** This ticket lands first, and [[spec/tickets/a-rename-reaches-every-note]] carries the folder after it. That rename then moves one config file and one reader, and no generated target.

## review

<!-- reads the approach against the ask -->

### verdict

fail

| the question reviewing asks | the answer |
|---|---|
| does the approach answer the ask | in part, and the first line of `done_when` goes missing |
| is what the diff touches beyond the ask trivial | yes, the commit writes this ticket alone |
| what does `./RUNME.sh check` answer | 0, with the server standing |
| does every rule the approach adds carry a case | yes, a case a layer over a fixture root and a case over the shipped file |
| does every claim carry a proof | one fails, the grep the draft cites over `src/viewer` |

TL;DR:

- The road holds. The redraft takes the reader the owner rules for, and lands the values under `spec/config/styles`.
- The move stops at `colour.go`. A colour number stands outside it, so the grep the draft cites answers other than 0.
- The notes naming what moves get no line in the draft.

The findings, one a line:

- `src/viewer/ui.go` wears the selected row's background, and `src/viewer/tabs.go` wears the open tab.
- `grep -rc` over `src/viewer` reads those files, so the first line of `done_when` fails.
- The table of what moves names `colour.go` alone. Name both files there, or say why each colour stands in Go.
- `src/viewer/detail_test.go` asserts the prompt's colour by number. Say whether that case reads the config or holds a fixture.
- `spec/design_output/viewer#colours` points the reader at `kindColours` in `colour.go`. Name the line the move rewrites.
- `spec/design_output/level0.md` gives `spec/config/styles` to Vale. A JSON file there wants that line to name the other kind.
- The earlier findings close: the reader road, the folder the ruling names, and the shared reader riding `SHARED`.

What the agent needs:

| number | need | status |
|---|---|---|
| 1 | the table of what moves names every file under `src/viewer` holding a colour | open |
| 2 | the draft says what the standing case asserting a colour by number reads | open |
| 3 | the draft names the notes the move rewrites | open |
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
