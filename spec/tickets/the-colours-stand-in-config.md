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
step: verdict
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
  - step: design/review
    hand: box 0eb9ad6feedf · claude-code-remote · helper-10
    hash_before: c06b292de36c32338384bc47487bb5b2a7f2cfb5
    hash_after: c06b292de36c32338384bc47487bb5b2a7f2cfb5
  - step: implement/tests-red
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: 142a47c993c15f94e6bb9769150351cab025b866
    hash_after: 142a47c993c15f94e6bb9769150351cab025b866
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/config fails
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: da53813bfa8ee13e6fad1e278733afd9a16a6a03
    hash_after: da53813bfa8ee13e6fad1e278733afd9a16a6a03
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: afc2822403378f4e8729a67c7f077315f02ce23d
    hash_after: afc2822403378f4e8729a67c7f077315f02ce23d
    answered:
      - name: tests
        exit: 0
        said: green, src/config passes; green, src/viewer passes
      - name: check
        exit: 0
        said: The rules pass.
  - step: verdict
    hand: box 0eb9ad6feedf · claude-code-remote · helper-15
    hash_before: 86bd2655e59892adebd5d925716d233748015161
    hash_after: 86bd2655e59892adebd5d925716d233748015161
    returns: 1
    why: "| the question reviewing asks | the answer |; |---|---|; | does the branch do what the ask asks | yes, the numbers stand in one config file and the window reads them there |; | is what the diff touches beyond the ask trivial | yes, the shared reader and the two notes the approach names |; | what does `./RUNME.sh check` answer | 0, with the server standing |; | does a retro stand in the handback | no |; | does every rule the branch adds carry a case | yes, a case per layer over a fixture root, and a case walking the window's own folder |; | does that case refuse something bad | yes, a file holding a colour number fails it by name |; TL;DR:; The road lands. `grep -rn 'lipgloss.Color(\"' src/viewer` answers the case file alone, and the window asks the config for what it wears.; `gofmt -l src` names `src/viewer/tabs.go`, and names no other file in the tree. The `openStyle` the change lifts leaves its blank line behind.; Go format rides in no gate, so this step catches that or nothing does.; The findings, one a line:; `src/viewer/tabs.go` carries a spare blank line where `openStyle` stood, and `gofmt -l src` names it. The same command over `main` names nothing.; `./RUNME.sh check` runs the cases and the rules, and reads no Go format. So the class this fault belongs to rides in no gate.; `spec/config/styles/colours.json` spells the spare list and the bold map in its comment. [[spec/design_output/viewer#colours]] spells both again, so point the comment at the chapter.; [[spec/design_output/viewer#colours]] names a colour in words for the prompt, the reply, the warning and the error. The file owns those values now, so a person editing one leaves the prose standing.; `spare` stands as a map keyed by a number written as text, and `orderedValues` sorts those keys as text. A key growing past one digit then reads out of its place.; `src/config/config_test.go` spells the colours file's path, where `coloursAt` in `src/viewer/colour.go` owns it. The fixture wants a path of its own.; What the agent needs:; | number | need | status |; |---|---|---|; | 1 | `gofmt -l src` names no file | open |; | 2 | the reflect step names the class, and says where a Go format gate stands | open |; | 3 | the colours file's comment points at the chapter | open |; | 4 | the colour words in [[spec/design_output/viewer#colours]] point at the file | open |; | 5 | the verdict hand reads the branch again | open |"
  - step: implement/reflect
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: 884bf3931dba0cb4ab981d45f219fe12b26e1641
    hash_after: 884bf3931dba0cb4ab981d45f219fe12b26e1641
  - step: implement/change
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: 4c672c1c0b493c2abbb83f3d944c3af67fe97cbd
    hash_after: 4c672c1c0b493c2abbb83f3d944c3af67fe97cbd
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: b945f1cf4f8722a281748aa79ab3f5b97a773ad3
    hash_after: b945f1cf4f8722a281748aa79ab3f5b97a773ad3
    answered:
      - name: tests
        exit: 0
        said: green, src/config passes; green, src/viewer passes
      - name: check
        exit: 0
        said: The rules pass.
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

pass

| the question reviewing asks | the answer |
|---|---|
| does the approach answer the ask | yes, and the first line of `done_when` wants a word for this road |
| is what the diff touches beyond the ask trivial | yes, the commit writes this ticket alone |
| what does `./RUNME.sh check` answer | 0, with the server standing |
| does every rule the approach adds carry a case | yes, a case a layer over a fixture root and a case over the shipped file |
| does every claim carry a proof | yes, and each file the draft cites reads as it says |

TL;DR:

- The road holds, and the earlier findings close.
- The table of what moves names every file `grep -rln 'lipgloss.Color(' src/viewer` answers.
- The lines standing open go to the implement step, and none of them moves the road.

The findings, one a line:

- The first line of `done_when` names a generated file. This road generates none. Say which command over `src/viewer` answers that line, and what a case's fixture number does to it.
- The module answers a colour out of a named file, and `names.words` out of the three layers. Say whether a local layer sets a colour. The ask puts a colour where every other value stands.
- [[spec/design_output/viewer#colours]] names `toolColours` on a line of its own. The change rewrites that line beside the `kindColours` one.
- `src/lsp/go.mod` requires local modules today, so `src/config` joins them there.
- The earlier findings close. The table names every file holding a colour. The standing case reads a fixture root, and the draft names both notes.

What the agent needs:

| number | need | status |
|---|---|---|
| 1 | the implement step names the command answering the first line of `done_when` | open |
| 2 | the implement step says whether a local layer sets a colour | open |
| 3 | the change rewrites the `toolColours` line beside the `kindColours` one | open |
| 4 | the ticket carries on to implement | open |

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/config/config_test.go src/viewer/colour_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The command answers assertion, and the cases fail on their own assertion.

| the case | what it holds open |
|---|---|
| an environment name reads off the key | `EnvOf` answers the empty string |
| a value reads the tracked layer | `Value` answers nothing |
| the environment beats the tracked layer | the same |
| the local layer beats the environment | the same |
| a key nobody writes answers nothing | this one passes, because nothing answers everything |
| a map reads the file the caller names | `Map` answers nothing |
| the shipped file holds a colour for every kind | the file stands nowhere |
| no colour number stands in the window's own code | `colour.go`, `tabs.go` and `ui.go` each hold one |

Go refuses a package calling a name nobody wrote, and the door reads build over that. So `src/config` ships the reader's names answering nothing, and each case asserts against them. That surprises me: a red case in Go wants the shape to stand first, where a red case in the other half wants it absent.

The review left three findings for this step. The second asks whether a local layer sets a colour. The case naming the file answers no: it writes a colour into both layers, and reads the named file.

The first finding asks what answers the line about the window's own code. The case walking the folder answers it, and skips the cases so a fixture number costs nothing.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches no file the ask leaves out. The new module, its case file, one case file under the window, and this ticket.
- every door the change reaches has a fake. Each case writes its own fixture root, and reads nothing the tree ships but the colours file.
- a comment names the approach the change implements. Each file carries a line pointing at this ticket, and the case names the line of done_when it answers.

## reflect

<!-- names the class of error in the findings, and the fix for the class -->

### class

<!-- the class of error the findings describe, and the fix for the class -->
<!-- the form is text -->

Three classes carry the six findings.

| the class | the findings in it | the fix for the class |
|---|---|---|
| a rule no gate reads | the spare blank line, and the gate that misses it | `gofmt -l` runs beside `go test`, one call a module, in `goHolds` |
| a fact standing twice | the comment, the colour words, the path the case spells | each place points at the one holding the fact |
| an order read off text | the spare keys sorting as text | the list keeps the file's own order |

The first class is the one the verdict names. Every rule this tree holds runs at the write door or in the check. Go's own format runs in neither, so a hand's eye is the only gate, and an eye misses a blank line.

The second class is the voice rule about saying a thing once. A value moving out of code leaves prose behind it, and that prose goes stale where nobody points it at the new home.

The third class is narrower. A map carries no order, so a list written as a map reads its order off its keys. Text order and number order part at the tenth key.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches no file the ask leaves out. The check gains the format gate, which the class fix names. Every other file stands in the table the approach carries.
- every door the change reaches has a fake. The gate runs the tool through the door the check runs every other tool through.
- a comment names the approach the change implements. The gate carries a line naming the class it closes.

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh check

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches no file the ask leaves out. The check gains the format gate the class fix names. Every other file stands in the approach's table.
- every door the change reaches has a fake. The gate runs its tool through the door the check runs every other tool through.
- a comment names the approach the change implements. The gate carries a line naming the class it closes, and each new name points at its chapter.

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh branch test src/config/config_test.go src/viewer/colour_test.go

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

A person sets a colour in the config now, and the window reads it there.

| what lands | where |
|---|---|
| the reader answering a key over the three layers | `src/config`, a module of its own |
| the colour numbers | `spec/config/styles/colours.json` |
| the read at start | `loadColours` in `src/viewer/colour.go`, called from `main.go` |
| the shared module beside `quackitect/yaml` | `SHARED` in `src/scripts/viewer.js` |
| the reader the server keeps | `src/lsp/config.go`, which calls the shared one |
| the gate reading Go format | `goHolds` in `src/scripts/cli-check.js` |

The round before this left a file the Go formatter writes another way, and no gate read that. So the check now names each such file, one line a file, beside the module's own cases. A probe file carrying a bad indent turns the check red and names itself.

The spare colours stand as a list, so the file's order is the order the window reads. `List` in the shared reader answers a list, where `Map` answers a map. The file's comment points at [[spec/design_output/viewer#colours]], which holds what each map carries.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches no file the ask leaves out. The check gains the format gate the class fix names. Every other file stands in the approach's table.
- every door the change reaches has a fake. The gate runs its tool through the door the check runs every other tool through.
- a comment names the approach the change implements. The gate carries a line naming the class it closes, and each new name points at its chapter.

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->

<!-- the form is files -->

- spec/tickets/the-colours-stand-in-config.md
- spec/config/styles/colours.json
- spec/design_output/viewer.md
- spec/design_output/level0.md
- src/config/config.go
- src/config/config_test.go
- src/config/go.mod
- src/lsp/config.go
- src/lsp/go.mod
- src/viewer/colour.go
- src/viewer/colour_test.go
- src/viewer/detail_test.go
- src/viewer/main.go
- src/viewer/tabs.go
- src/viewer/ui.go
- src/viewer/go.mod
- src/scripts/viewer.js

## verdict

<!-- pass or fail, findings one a line -->

<!-- the form is verdict -->

fail

| the question reviewing asks | the answer |
|---|---|
| does the branch do what the ask asks | yes, the numbers stand in one config file and the window reads them there |
| is what the diff touches beyond the ask trivial | yes, the shared reader and the two notes the approach names |
| what does `./RUNME.sh check` answer | 0, with the server standing |
| does a retro stand in the handback | no |
| does every rule the branch adds carry a case | yes, a case per layer over a fixture root, and a case walking the window's own folder |
| does that case refuse something bad | yes, a file holding a colour number fails it by name |

TL;DR:

- The road lands. `grep -rn 'lipgloss.Color("' src/viewer` answers the case file alone, and the window asks the config for what it wears.
- `gofmt -l src` names `src/viewer/tabs.go`, and names no other file in the tree. The `openStyle` the change lifts leaves its blank line behind.
- Go format rides in no gate, so this step catches that or nothing does.

The findings, one a line:

- `src/viewer/tabs.go` carries a spare blank line where `openStyle` stood, and `gofmt -l src` names it. The same command over `main` names nothing.
- `./RUNME.sh check` runs the cases and the rules, and reads no Go format. So the class this fault belongs to rides in no gate.
- `spec/config/styles/colours.json` spells the spare list and the bold map in its comment. [[spec/design_output/viewer#colours]] spells both again, so point the comment at the chapter.
- [[spec/design_output/viewer#colours]] names a colour in words for the prompt, the reply, the warning and the error. The file owns those values now, so a person editing one leaves the prose standing.
- `spare` stands as a map keyed by a number written as text, and `orderedValues` sorts those keys as text. A key growing past one digit then reads out of its place.
- `src/config/config_test.go` spells the colours file's path, where `coloursAt` in `src/viewer/colour.go` owns it. The fixture wants a path of its own.

What the agent needs:

| number | need | status |
|---|---|---|
| 1 | `gofmt -l src` names no file | open |
| 2 | the reflect step names the class, and says where a Go format gate stands | open |
| 3 | the colours file's comment points at the chapter | open |
| 4 | the colour words in [[spec/design_output/viewer#colours]] point at the file | open |
| 5 | the verdict hand reads the branch again | open |

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change puts each fact it adds in one place, and the note points at the file. The numbers stand in `spec/config/styles/colours.json` alone. [[spec/design_output/viewer#colours]] names the maps and carries no number. The file's comment spells the spare list the chapter spells. The chapter names a colour in words per kind the file owns. Both repeats ride in the findings.

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
