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
step: verdict
record:
  - step: design/draft
    hand: box b99ea8ab11a8 · claude-code-remote
    hash_before: e5c9abde2eab783b0474065d8ad16b1685f9e9c1
    hash_after: e5c9abde2eab783b0474065d8ad16b1685f9e9c1
  - step: design/review
    hand: box 099c2ec7708d · claude-code-remote
    hash_before: 83db305002f2f014ced0157acea94ea6273d39b9
    hash_after: bde5798a60bb1aedcd14793f4102e8e81173e080
    returns: 1
    why: "the span `--since` takes has an owner already: `spanOf` under `src/scripts/group.js`, which `work.staleAfter` reads. The lib table names none, so an implementer writes a second parser; the flags table stands on this ticket, and the approach sends the same table into the design output. Say which of the two owns it, and point the other at it; the chapter the design output takes carries no title, so a reader finds no place for it; the ask names `./RUNME.sh test`, and the approach names no case file the filters land in; the ask's install line already holds: `./RUNME.sh branch list` on a warm box prints none of it. Say that, and name the case holding it there; the two tables read true: every name under `.claude/skills/level0/lib/log.js` exports, and `src/scripts/cli.js` holds the verbs map the verb joins"
  - step: design/draft
    hand: box 099c2ec7708d · claude-code-remote
    hash_before: 9841e79a0915ff919c359a251a0f1f01a5bc5332
    hash_after: 9841e79a0915ff919c359a251a0f1f01a5bc5332
  - step: design/review
    hand: box 099c2ec7708d · claude-code-remote · helper-4
    hash_before: 589386013a93874a229c77e6a634f0b990c3df7d
    hash_after: 589386013a93874a229c77e6a634f0b990c3df7d
    returns: 2
    why: "`src/viewer/filter.go` owns the log filter language, and `spec/design_output/viewer#the-filter-language` says it; the four flags spell that filtering a second time, and the approach points at neither owner; `plainRows` under `src/scripts/tui.js` reads `SESSION` and the rotated files under `OLD`; that function prints each row through `asRow`, and the verb the approach names reads the same; say which of the two owns the read, and point the other at it; `spanOf` answers seconds, and `timeOf` answers milliseconds; `queue.js` keeps `MS` for that crossing, so name the scale beside `--since`; `timeOf` answers one stamp, the rotated file's first line, so the table's word span misreads it; the install bullet names no case, and `test/contract/install.test.js` holds one case, on binaries rebuilding; name the case asserting a warm box prints no install line; the lib table reads true: `SESSION`, `OLD`, `rowsOf` and `asRow` export; `timeOf`, `writes` and `rank` export from the same file; `spanOf` exports from `src/scripts/group.js`, as the flags table says; the verbs map under `src/scripts/cli.js` holds no `log`, so the name stands free; `install.sh` guards both its `say` lines on `$missing`, and `./RUNME.sh branch list` prints neither here"
  - step: design/draft
    hand: box 099c2ec7708d · claude-code-remote
    hash_before: 7df5e7414b2a11c05c751e62d1ebce319313a652
    hash_after: 7df5e7414b2a11c05c751e62d1ebce319313a652
  - step: design/review
    hand: box 099c2ec7708d · claude-code-remote · helper-6
    hash_before: 640a18af6e72737c2db52d8df22fa016236ee38b
    hash_after: 640a18af6e72737c2db52d8df22fa016236ee38b
  - step: implement/tests-red
    hand: box 099c2ec7708d · claude-code-remote
    hash_before: cf82ce2dc149bcd923863f828cf55fea28db3e6d
    hash_after: cf82ce2dc149bcd923863f828cf55fea28db3e6d
    answered:
      - name: tests
        exit: 1
        said: assertion, 5 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box 099c2ec7708d · claude-code-remote
    hash_before: 86b8e099600d03c578aa8838a503feb44ea35035
    hash_after: 86b8e099600d03c578aa8838a503feb44ea35035
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box 099c2ec7708d · claude-code-remote
    hash_before: 33dcd8370b545808ed49eaef32366cddd03349a5
    hash_after: 33dcd8370b545808ed49eaef32366cddd03349a5
    returns: 1
    why: the seen field under implement/tests-red breaks Shape, so the tree check answers red
    answered:
      - name: tests
        exit: 0
        said: green, 6 test(s) pass in 1 file(s)
      - name: check
        exit: 1
        said:      1  in all
  - step: implement/tests-red
    hand: box 099c2ec7708d · claude-code-remote
    hash_before: 51f4b20359a3382c2cf54375374a0f72e695fb58
    hash_after: 51f4b20359a3382c2cf54375374a0f72e695fb58
    returns: 1
    why: the hand takes it back
  - step: implement/tests-red
    hand: box 099c2ec7708d · claude-code-remote
    hash_before: 52bf602c1e1af453ba2029506e493b249dd590ee
    hash_after: 52bf602c1e1af453ba2029506e493b249dd590ee
    returns: 2
    why: the seen field carries four paragraphs in one run, and this hand-back rewrites it as a list
    answered:
      - name: tests
        exit: 0
        said: green, 6 test(s) pass in 1 file(s)
  - step: implement/tests-green
    hand: box 099c2ec7708d · claude-code-remote
    hash_before: f036c0ea4eb87f104960e6a3ce30c0a3547b2ef5
    hash_after: f036c0ea4eb87f104960e6a3ce30c0a3547b2ef5
    returns: 2
    why: the hand takes it back
  - step: implement/tests-green
    hand: box 099c2ec7708d · claude-code-remote
    hash_before: 49f131dfdd6a6d43b490d3e69fce515299d0a759
    hash_after: 49f131dfdd6a6d43b490d3e69fce515299d0a759
    returns: 3
    why: the says field carries four paragraphs in one run, and this hand-back rewrites it as a table
    answered:
      - name: tests
        exit: 0
        said: green, 6 test(s) pass in 1 file(s)
      - name: check
        exit: 1
        said:      1  in all
  - step: implement/tests-green
    hand: box 099c2ec7708d · claude-code-remote
    hash_before: a8c83549a6aac5a9081968bbafaeb876627a8f00
    hash_after: a8c83549a6aac5a9081968bbafaeb876627a8f00
    answered:
      - name: tests
        exit: 0
        said: green, 6 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: The rules pass.
---

# Ask

A hand reads the session log by one verb, and the same filter serves every hand after it.

Each reading costs a fresh inline script, and the same filter goes in again and again.

- `./RUNME.sh log` filters the session log by time, level and kind.
- The verb prints the last lines of one kind on a flag.
- Every verb keeps the install lines quiet, so a branch list answers fast.
- `./RUNME.sh test` covers the filters the verb takes.

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->
<!-- the form is text -->

`./RUNME.sh log` filters the rows the log reader already answers, and both owners keep what they own.

Two owners stand, and this verb adds a third to neither:

| what stands | where it stands | what the verb does |
|---|---|---|
| the read over `SESSION` and `OLD` | `plainRows`, under `src/scripts/tui.js` | the read moves to `src/scripts/log-read.js`, and both verbs call it |
| the filter language | `filter.go`, under `src/viewer` | the verb takes flags, for the reason below |

Go owns the language, and the verb runs in node before any Go build stands. So the verb carries flags, and [[spec/design_output/viewer#the-filter-language]] stays the language's one home. Each flag names the narrow filter it holds:

| the flag | what it reads | the owner it calls |
|---|---|---|
| `--since <span>` | the rows stamped inside the span | `spanOf`, under `src/scripts/group.js` |
| `--level <name>` | the rows at that level and above | `writes` and `rank` |
| `--kind <name>` | the rows of that kind | the row's own field |
| `--last <count>` | the last rows, after every filter above | the verb itself |

`spanOf` answers seconds, and a row's `at` answers a stamp. `queue.js` keeps `MS` for that crossing, and the verb reads the same constant.

What the rotated files ask for:

- `timeOf` answers one stamp, off a rotated file's own name
- so `--since` opens a rotated file where that stamp falls inside the span
- `rowsOf` and `asRow` carry the rest, and the verb writes no shape of its own

Where each thing stands after:

- `src/scripts/log-verb.js` holds the verb, and `src/scripts/cli.js` names it in the verbs map
- `spec/design_output/log.md` takes the chapter `One verb reads the log`, which owns the flags table
- `test/level0/log-verb.test.js` holds a case a filter, over rows in memory
- `test/contract/install.test.js` takes a case asserting a warm tree runs the script silent
- a hand asking which kind fills the log runs `./RUNME.sh log --kind hook --last 20`

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->
<!-- the form is verdict -->

pass

- `queue.js` holds `MS` inside its own module, so another owner serves the verb
- `src/scripts/work-stands.js` exports `MS`, and `src/bridge/stop.js` holds a third copy
- name that one owner at implementation, and point the other copies at it
- every other name the approach cites holds
- `spanOf` exports from `src/scripts/group.js`, and answers seconds
- `SESSION`, `OLD`, `rowsOf` and `asRow` export from the level0 log lib
- `timeOf`, `writes` and `rank` export from the same file
- `timeOf` parses the stamp off a rotated file's name, as the approach says
- a row's `at` holds an ISO stamp, so the verb parses it to milliseconds
- `plainRows` under `src/scripts/tui.js` reads `SESSION` and `OLD`
- the move to `src/scripts/log-read.js` puts one owner on that read
- `src/viewer/filter.go` owns the filter language, and the viewer chapter `The filter language` stands
- the verbs map under `src/scripts/cli.js` holds no `log`, so the name stands free
- `spec/design_output/log.md` stands, and its new chapter owns the flags table
- `RUNME.sh` runs `install.sh` on every verb, so the install case lands in the contract test

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test test/level0/log-verb.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Five cases go red on their own assertions. Each filter in `src/scripts/log-read.js` answers the rows whole, so each case reads back what it hands in.

What surprises:

- the sixth case passes already, because `rowsIn` composes `rowsOf` over the paths
- that composition needs no body of its own
- the span case names the scale the review asks about

A row's stamp answers milliseconds, `spanOf` answers seconds, and `MS` crosses them. The change moves that constant beside `timeOf`, in the file owning the log's shapes.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the cases land in `test/level0/log-verb.test.js`, which the approach names
- the disk stands faked through `fakeDisk`, and the filters take rows in memory
- the header of `src/scripts/log-read.js` points at the chapter the approach names

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

./RUNME.sh lint src test

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the verb, the read, the cases and the chapter the approach names
- the disk and the clock reach the verb as doors, and `fakeDisk` drives the cases
- each header points at the chapter the approach names, and that chapter owns the flags

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh branch test test/level0/log-verb.test.js

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

`./RUNME.sh log` answers the rows the log holds, narrowed by four flags, and two owners keep what they own.

| what the verb does | where it stands |
|---|---|
| the four filters over rows | `src/scripts/log-read.js` |
| the read over the session file and the rotated ones | the same file, which `tui --plain` calls too |
| the flags and the printing | `src/scripts/log-verb.js` |
| the row a reader sees | `asRow`, which both verbs call |

The filter language keeps its owner. `src/viewer/filter.go` holds it, the window reads it, and these flags reach for none of it. Go owns that language, and this verb runs in node before any Go build stands.

Two numbers move to one owner each:

- `MS` stands beside `timeOf` in the level0 log lib, where a span crossing a stamp needs it
- `work-stands.js` takes it from there, so one place answers the seconds a stamp costs
- the install case asserts both announcement lines wait on a missing want, so a warm tree runs silent

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every fact the change adds stands in one place, and the chapter owns the flags table
- `MS` takes one owner, and the notes point at that file
- each header says what its file is for, and counts nothing

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
