---
kind: [[ticket]]
state: open
urgency: whenever
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
step: verdict
record:
  - step: design/draft
    hand: box d42624a67d18a8
    hash_before: 7f2f38c1d7397225bbf9e1bc55e52515cac93a98
    hash_after: 338a46b7dbf7570af05dd92a69b868d00ed053d1
  - step: design/review
    hand: box d42624a67d18a8 · claude-code
    hash_before: 47219c56615020b8d0f2c6f7c04f474f37ae6d0f
    hash_after: 47219c56615020b8d0f2c6f7c04f474f37ae6d0f
  - step: implement/tests-red
    hand: box d42624a67d18a8 · claude-code
    hash_before: 9e531c2913a4134edb7725d1936160de2b6d2585
    hash_after: ad0b141f5c632cb7ce5770a683e8467ec8d7713e
    answered:
      - name: tests
        exit: 0
        said: assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box d42624a67d18a8 · claude-code
    hash_before: 71635ad0f41bf12c21d67bb87834806ef43f50af
    hash_after: 71635ad0f41bf12c21d67bb87834806ef43f50af
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box d42624a67d18a8 · claude-code
    hash_before: 1d8758fd377900301ec6ed3591a2ca0267d89d0c
    hash_after: a609cfcb5436c0a86ce3e981ccef99315913178f
    answered:
      - name: tests
        exit: 0
        said: green
      - name: check
        exit: 0
        said: 65 stand at warning, which the panel draws and check allows.
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

The viewer draws a `note` row in its own colour, under the prompt it answers. A person reads at a glance where a session parked a note.

Today a note row draws like every other row. A person scans the log for the parked thoughts and reads each line to find them.

- `./RUNME.sh test` passes a case where a `note` row takes its own colour under its prompt
- `./RUNME.sh check` answers 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

| what changes | how |
|---|---|
| `colour.go` | a `note` style, and `saidStyle` answers it for the said column too |
| `detail.go` | a prompt shows the notes it carries, the way it shows its reply |
| the viewer note | the colours list takes the note line, under the answer |

A note answers a prompt, so it wears the answer's shape and a colour of its
own. The kind colours hold one entry a kind, and the note takes one there. The
said column reads the same style, because a prompt and a reply each colour
their text and a note stands beside them.

The details of a prompt show its reply today. A note between that prompt and
its reply shows there too, under the reply, so a person opening the prompt
reads what the session parked. The details of a note show the prompt above it.

A test in `detail_test.go` drives a log of a prompt, a note and a reply, and
reads the note's colour and its place. For details, see
[[spec/design_output/viewer#colours]].

## review

<!-- reads the approach against the ask -->

### verdict

pass

- The three rows hold against the code. `kindColours` carries one entry a kind, and none for a note.
- `saidStyle` switches on the kind, and `detail.go` pairs a prompt with the reply ending its turn.
- The anchor holds. `Colours` stands at line 208 of the viewer design output.
- One trap sits beside the change, and the draft walks past it. `answer` names its colour twice.
- `kindColours` line 33 reads `121`, and `saidStyle` line 101 writes that number again.
- So a hand following `answer` writes the note's colour twice over. Read it out of the table, and write the number once.
- That copy is a cleanup this change reveals. Take it in the change, or write it down as a note of its own.
- The whole line stands ready. `Body()` answers the `text` field where a row carries one.
- `detail.go` draws through `Body()`, so a note past the row's width reads whole in the details.
- The ask names `./RUNME.sh test`, and the draft names a Go case. The Go cases run under the check, which the second row of `done_when` covers.
# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

    (cd src/viewer && go test ./... -run "Note|SaidColumn" 2>&1 | grep -q "^--- FAIL") && echo assertion

### seen

Three cases stand red, each on its own assertion:

| the case | what it reads |
|---|---|
| a note takes a colour of its own | the kind column answers 181, and the said column answers nothing |
| the said column reads the kind list | `note` reads two colours, and `answer` reads one |
| a prompt shows the note it carries | the details carry the reply alone |

The first case surprises me. `kindStyle` falls through to a hash over the kind where the lists name none, so the kind column already draws a note in a colour apart. A person reads no meaning in it, because the hash picks it. So the change names `note` in the kind list, and the colour becomes a choice.

The second case reads `answer` as one colour today, and two places carry the number:

| where | what it holds |
|---|---|
| the kind list | `121` under `answer` |
| `saidStyle` | `121`, written again |

They agree by hand. The case holds them to one reading, so a hand moving either one meets a red case.

The third case reads the details. `pairsOf` walks forward from a prompt and takes the reply ending its turn, and a note between the two reaches nowhere.

### checked

- the change touches no file the ask leaves out. The cases sit in `src/viewer/detail_test.go`, beside the ones covering the pairing.
- every door the change reaches has a fake. The cases read rows in memory, and reach no disk and no clock.
- a comment names the approach the change implements. Each case carries the design output section it holds.

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

    ./RUNME.sh lint src/viewer/colour.go src/viewer/detail.go

### checked

- the change touches no file the ask leaves out. `colour.go` and `detail.go` carry it, and the ask names both.
- every door the change reaches has a fake. The change reaches no door, and reads rows the caller hands it.
- a comment names the approach the change implements. Each hunk carries the design output section it holds.

## tests-green

<!-- makes the tests pass -->

### tests

    (cd src/viewer && go test ./... > /dev/null 2>&1) && echo green

### check

    ./RUNME.sh check

### says

A note wears a colour a person chooses, and the prompt holding it shows it.

Three hunks carry the change, and each answers one case:

| where | what it does |
|---|---|
| the kind list | takes `note` at 181, the shade the hash picked before |
| `saidStyle` | reads the kind list for a note and an answer alike |
| `pairsOf` | gives a prompt the notes standing inside its turn, and gives a note the prompt above it |

The second hunk takes a copy out. `saidStyle` wrote the answer's number a second time, and the two agreed by hand. Both read the kind list now, so the number stands in one place.

The first hunk changes no colour a person sees. `kindStyle` falls through to a hash over the kind where the lists name none, and that hash answered 181 for a note already. The list names the same number, so the shade becomes a choice a person reads and moves.

`Body()` answers the `text` field where a row carries one, so a note past the row's width reads whole in the details. That needed nothing here.

### checked

- the change touches no file the ask leaves out. `colour.go` and `detail.go` carry it, and the ask names both.
- every door the change reaches has a fake. The change reaches no door, and reads rows the caller hands it.
- a comment names the approach the change implements. Each hunk carries the design output section it holds.

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

A note row carries its whole line under `text` now, and the row holds one sentence. [[spec/design_output/log#what-a-box-writes]] names the two fields. So this change draws a note that stands whole already, and the details need nothing added for the width.
