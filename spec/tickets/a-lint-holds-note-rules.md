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
group: the-rules-hold-themselves
process: [[spec/processes/standard]]
process_hash: 838dd6d003506639
step: implement/change
record:
  - step: design/draft
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: 57005e0893d436fc164ecbaafdff228c38b608bb
    hash_after: 57005e0893d436fc164ecbaafdff228c38b608bb
  - step: design/review
    hand: box 5387e4f82b24 · claude-code-remote · helper-2
    hash_before: 1674b8341abf3251dda3e726d5336b8e8f823ed4
    hash_after: 1674b8341abf3251dda3e726d5336b8e8f823ed4
    returns: 1
    why: "| the finding | what to do |; |---|---|; | `matches: explains` in the rationale schema owns the star-to-chapter rule | Read that key in `underFaults`, and drop `StarNeedsSection` |; | The paragraph schema names no bad word, by its own header | Put the `History` markers beside `Antithesis.yml` |; | `.vale.ini` switches `PastTense` off over `spec/rationales` | Switch `History` off there the same way |; | `RuleNamesItsFailure` reads one buffer, and `tree.js` holds the pair rules | Put it beside `GuidanceChapter` under `VoiceShape` |; | Four notes star a rule whose rationale opens no chapter | Name the landing for each, below |; | `fault()` writes severity error | Say where the warning stage lives, or drop the stage |; | The failure rule answers rule twelve | Keep rule twelve in the note |; The drift the star rule finds, which the lint at zero wants cleared:; | the note | the starred rule standing with no chapter |; |---|---|; | `spec/guidance/cloud.md` | ten, fourteen, fifteen |; | `spec/guidance/tickets.md` | eight, nine, ten |; | `spec/guidance/working.md` | six, eleven |; | `spec/guidance/code/code.md` | ten |"
  - step: design/draft
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: b2a3a5a306aa40d668642ebfac3793625ecdd8d8
    hash_after: b2a3a5a306aa40d668642ebfac3793625ecdd8d8
  - step: design/review
    hand: box 5387e4f82b24 · claude-code-remote · helper-4
    hash_before: e50002bf80eb38157cdfe4c62b93235f306f4992
    hash_after: e50002bf80eb38157cdfe4c62b93235f306f4992
    returns: 2
    why: "| the finding | what to do |; |---|---|; | The drift table reads the star direction alone, and a rationale chapter whose rule carries no star stands the same drift | Say which direction `matches: explains` reads, and name that drift too where it reads both |; | `History.yml` names no marker | List the words it refuses, and say what they catch past what `PastTense` holds already |; | `RuleNamesItsFailure` names no test | Say what makes a rule pass it, because most rules stand as one sentence |; | `.vale.ini` switches each `VoiceShape` rule off by name over `spec/vocabulary` and `spec/config/stop` | Say whether the new rule joins those two lists |; | The drift the two Vale rules find stands unnamed | Name it the way the star drift stands named, so the lint at zero holds |; Answered from the last round, one a line:; the star check reads `matches: explains` in `underFaults`, and `StarNeedsSection` goes; `History.yml` lands beside `Antithesis.yml`, with its switch in `.vale.ini`; `RuleNamesItsFailure` lands beside `GuidanceChapter` under `VoiceShape`; each new rule opens at error, so the warning stage goes; rule twelve stays in the guidance note; the drift table names the four notes and their starred rules as the tree holds them; `./RUNME.sh check` answers 0 on this branch."
  - step: design/draft
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: 98c618889abf2a47fa0887e2a34167bfd57c0c56
    hash_after: 98c618889abf2a47fa0887e2a34167bfd57c0c56
  - step: design/review
    hand: box 5387e4f82b24 · claude-code-remote · helper-6
    hash_before: 23efc7e9d7a176caa842d11f4d8684e1be2a36e2
    hash_after: 23efc7e9d7a176caa842d11f4d8684e1be2a36e2
    returns: 3
    why: "| the finding | what to do |; |---|---|; | `spec/rationales/code/refactoring` names no file in the tree | Write `spec/rationales/refactoring`, and leave `spec/rationales/code` to the note it explains |; | The chapter-past-a-star table stops at the guidance notes | Add `spec/rationales/apply` 1 to 4, `extension` 1 to 5, `index` 1 to 3 and `vehicle` 1 to 2, whose notes mark no item at all |; | `spec/rationales/pull` carries no `explains` | Say what the star check answers where that key stands absent |; | `checkNote` takes a text and the schemas, and the write door hands it one buffer | Say where `underFaults` reads the note `explains` names, because its callers hold no tree |; | `spec/rationales/guidance` opens chapter 12 for the rule that leaves | Say whether that chapter goes with rule twelve |; Answered from the last round, one a line:; the star check reads from the marked rule to its chapter, and a chapter past a star passes; `History.yml` lists its markers, and they read present tense past `PastTense`; rule twelve leaves the note, and `RuleNamesItsFailure` leaves with it; the word list and the stop folder take `VoiceShape` alone, so the marker rule stands off both; the marker drift stands named, one file to a marker; `./RUNME.sh check` answers 0 on this branch, and the drift tables read as the tree stands, past the one path above."
  - step: design/draft
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: 9ae0159039ceca0a985e799b78d911d580486ef4
    hash_after: 9ae0159039ceca0a985e799b78d911d580486ef4
  - step: design/review
    hand: box 5387e4f82b24 · claude-code-remote · helper-8
    hash_before: d43f20ee1e87158716438f9644a5b25904a3faa1
    hash_after: d43f20ee1e87158716438f9644a5b25904a3faa1
  - step: implement/tests-red
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: 1bbc6868d5460402efc8290e0026809d449a90a8
    hash_after: 8496a8c40af02fdf0171b8ca074ba951f72c07bb
    answered:
      - name: tests
        exit: 1
        said: assertion, 1 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
---

# Ask

The notes hold the rules they set, so a reader trusts a rule's own note.

Section numbers drift from rule numbers, history sits outside the rationales, and rule 12 stands unheld.

- A lint matches each starred rule to a rationale section of its number.
- A rule refuses history markers outside `spec/rationales`.
- Rule 12 carries a check, or it leaves the guidance note.
- `./RUNME.sh lint spec/guidance spec/rationales` exits 0.

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

Two checks land, each with the owner already standing for its reading:

| the check | where it lands | what it reads |
|---|---|---|
| a starred rule wants its chapter | `underFaults` in `src/lsp/schema-body.go` | the rationale, and the note its `explains` names |
| a history marker stands off the rationales | `spec/config/styles/VoiceVale/History.yml` | one buffer, with `.vale.ini` switching it off over `spec/rationales` |

The star check reads two notes, so it stands where the tree stands. The Go
checker holds that tree, and every front asks it for a named path.
[[spec/design_output/lsp#a-second-copy-draws]] says how a rule reading a pair
lands there.

| the reader | what it holds | what it does with `matches` |
|---|---|---|
| `underFaults` in `src/lsp/schema-body.go` | the tree, through the checker | reads the note `explains` names, and draws |
| `underFaults` in `.claude/skills/level0/lib/schema.js` | the buffer the write door hands it | passes over it, as it passes over every reading past one file |

`spec/schemas/rationale.schema.yaml` already declares the first check, as
`matches: explains` under `subsections`. The schema checker reads `numbered` and
`order` beside it, and passes over `matches`. So the work is that key's reader,
and the schema stays the one place saying the rule.

The marker check reads one buffer, so Vale holds it the way it holds
`Antithesis`. A style file of its own carries it, because the projection writes
the register the paragraph schema owns.

The lint at zero wants the drift cleared, so the implement step writes the
chapter each starred rule lacks:

| the note | the starred rules wanting a chapter |
|---|---|
| `spec/guidance/cloud` | 10, 14, 15 |
| `spec/guidance/tickets` | 8, 9, 10 |
| `spec/guidance/working` | 6, 11 |
| `spec/guidance/code/code` | 10 |

`matches: explains` says one chapter per marked item, so the star check reads
from the marked rule to the chapter. A rationale chapter standing where its rule
carries no star passes, because a note arguing more than it must costs a reader
nothing.

| the rationale | the chapter standing past a star |
|---|---|
| `spec/rationales/cloud` | 12 |
| `spec/rationales/refactoring` | 1, 2, 3 |
| `spec/rationales/voice` | 7 |
| `spec/rationales/working` | 9 |
| `spec/rationales/tickets` | 1 |
| `spec/rationales/apply` | 1 to 4 |
| `spec/rationales/extension` | 1 to 5 |
| `spec/rationales/index` | 1 to 3 |
| `spec/rationales/vehicle` | 1 to 2 |

The last four explain a design output marking no item at all, so every chapter
of theirs stands. A rationale carrying no `explains` reads nothing against
anything, and `spec/rationales/pull` is the one standing so today.

`History.yml` refuses the words placing a claim in a tree that stands no more:

- `previously`, `formerly`, `used to`
- `originally`, `until recently`, `in the past`
- `as before`, `legacy`

`PastTense` refuses a past verb, and every note but the rationales takes it
already. These markers read in the present tense, so they pass that rule and
carry the history anyway.

| what draws today | the marker |
|---|---|
| `spec/design_output/stop.md` | `as before` |
| `spec/design_output/index.md` | `used to` |

The word list and the stop folder take `VoiceShape` alone, so the marker rule
stands off both. `.vale.ini` switches it off over `spec/rationales`, the way it
switches `PastTense` off there.

Rule twelve takes the ask's second road, and the measurement carries that call.
Most starred rules stand as one sentence, in nearly every guidance note, so a
check over them asks for a rewrite of each. That stands far past this ask.

| what the rule costs | where it lands |
|---|---|
| a rewrite of most starred rules | a ticket of its own, with the check |
| the note holding a rule a check holds | this ticket, by rule twelve leaving |

So rule twelve goes from `spec/guidance/guidance.md`, and chapter 12 of
`spec/rationales/guidance.md` goes with it, because that chapter argues that
rule alone. Both stand last in their note, so nothing renumbers. The new ticket
carries the rule, the chapter and the rewrites the check wants.

The rule leaving takes `RuleNamesItsFailure` with it, so this change writes two
rules and no third.
Each new rule opens at error, because the drift it names goes in the same
change.

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

pass

| the reading | what it answers |
|---|---|
| the ask, bullet by bullet | each one carries a decided approach, and the lint target stands named |
| both drift tables | each reads as the tree stands, over every rationale carrying `explains` |
| `spec/rationales/pull` | the one rationale carrying no `explains`, as the approach says |
| `src/lsp/check.go` | both Go fronts hold `one.tree`, so the checker reaches the note `explains` names |
| `src/bridge/write.js` | the write door hands one buffer, and the approach lets the check pass over it |
| `spec/guidance/guidance.md` beside its rationale | rule twelve stands last, and chapter 12 stands last, so nothing renumbers |
| the marker table | the two design outputs are the files drawing a marker, and a test's string literal stays off Vale |
| `./RUNME.sh lint spec/guidance spec/rationales` | exits 0 today, and the star check adds the drift the first table names |
| `./RUNME.sh check` | exits 0 on this branch |

What the implement step carries, one a line:

- mint the follow-up ticket with `./RUNME.sh mint ticket`, so rule twelve, chapter 12 and the rewrites land on it
- write each chapter the first table names in its number's place, because `order: strict` holds a rationale's chapters
- switch `History` off over `spec/rationales` in `.vale.ini`, where that section switches the paragraph rules off

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

    ./RUNME.sh branch test test/contract/vale.test.js

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

- the Vale case asks for `History`, and the style folder holds no such rule yet
- `src/lsp/marked_test.go` drives `checkNoteIn`, which passes the tree to the schema reading
- that function stands as a pass through today, so the marked case draws nothing and fails
- the three quiet cases pass already, because a reader passing over `matches` draws nothing

What surprises the hand: the Go side and the JavaScript side each hold a reader
named `underFaults`, and both pass over `matches`. So the write door keeps its
reading, and the checker takes the pair.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the cases touch the Vale contract test and a new Go file, which the ask names
- the Go case writes its own tree through `fixture`, and the Vale case drives the real binary
- each case carries the pointer at the chapter saying what a pair rule reads

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

- the change touches the checker, the style folder, the lint config and the notes the drift stands in
- the Go reading takes the tree the checker holds, and the fixture writes one of its own
- each piece carries the pointer at the chapter saying what a pair rule reads

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
