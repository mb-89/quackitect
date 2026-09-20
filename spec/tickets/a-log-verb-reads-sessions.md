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

`./RUNME.sh log` reads the session log through the lib that writes it, and the filters compose.

| the flag | what it reads | the owner it calls |
|---|---|---|
| `--since <span>` | the lines stamped inside the span | `spanOf`, under `src/scripts/group.js` |
| `--level <name>` | the lines at that level and above | `writes` and `rank` |
| `--kind <name>` | the lines of that kind | the row's own field |
| `--last <count>` | the last lines, after every filter above | the verb itself |

`src/scripts/log-verb.js` holds the verb, and `src/scripts/cli.js` names it in the verbs map. The lib under `.claude/skills/level0/lib/log.js` answers each remaining piece:

| what the verb needs | what the lib names |
|---|---|
| the file, and the rotated ones | `SESSION` and `OLD` |
| the lines out of the text | `rowsOf` |
| the row a reader sees | `asRow` |
| the span a rotated file covers | `timeOf` |

So the verb reads doors and composes, and it writes no shape of its own.

Where each thing stands after:

- `spec/design_output/log.md` takes the chapter `One verb reads the log`, which owns the flags table
- this approach's copy is the draft that chapter takes, and no second copy lands
- `test/level0/log-verb.test.js` holds the cases, one a filter, over rows in memory
- the install line already holds: `install.sh` guards both its lines on `$missing`, so a warm box says nothing

A hand asking which kind fills the log runs `./RUNME.sh log --kind hook --last 20`.

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->
<!-- the form is verdict -->

fail

- `src/viewer/filter.go` owns the log filter language, and `spec/design_output/viewer#the-filter-language` says it
- the four flags spell that filtering a second time, and the approach points at neither owner
- `plainRows` under `src/scripts/tui.js` reads `SESSION` and the rotated files under `OLD`
- that function prints each row through `asRow`, and the verb the approach names reads the same
- say which of the two owns the read, and point the other at it
- `spanOf` answers seconds, and `timeOf` answers milliseconds
- `queue.js` keeps `MS` for that crossing, so name the scale beside `--since`
- `timeOf` answers one stamp, the rotated file's first line, so the table's word span misreads it
- the install bullet names no case, and `test/contract/install.test.js` holds one case, on binaries rebuilding
- name the case asserting a warm box prints no install line
- the lib table reads true: `SESSION`, `OLD`, `rowsOf` and `asRow` export
- `timeOf`, `writes` and `rank` export from the same file
- `spanOf` exports from `src/scripts/group.js`, as the flags table says
- the verbs map under `src/scripts/cli.js` holds no `log`, so the name stands free
- `install.sh` guards both its `say` lines on `$missing`, and `./RUNME.sh branch list` prints neither here

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
