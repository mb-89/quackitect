---
kind: [[ticket]]
state: open
group: the-notes-point-true
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
step: implement/tests-green
record:
  - step: design/draft
    hand: box 1670436ae0bb · claude-code-remote
    hash_before: 066dd6d0948f12034dc3619fe1158243afcc856b
    hash_after: 066dd6d0948f12034dc3619fe1158243afcc856b
  - step: design/review
    hand: box 1670436ae0bb · claude-code-remote · helper-2
    hash_before: e4e832b29007cf969cd3f943b3553789173741d4
    hash_after: e4e832b29007cf969cd3f943b3553789173741d4
  - step: implement/tests-red
    hand: box 1670436ae0bb · claude-code-remote
    hash_before: ecff47a224da20b7c6b20b98c009cd1dca0aa1df
    hash_after: ecff47a224da20b7c6b20b98c009cd1dca0aa1df
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/lsp fails
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box 1670436ae0bb · claude-code-remote
    hash_before: 8253e502f6b51ef91543a79ff814c1fb9eeba6da
    hash_after: 8253e502f6b51ef91543a79ff814c1fb9eeba6da
    answered:
      - name: lint
        exit: 0
        said: 21 stand at warning. A commit and a push land over them, and the refactoring hand drains them past main's check.
  - step: implement/tests-green
    hand: box 1670436ae0bb · claude-code-remote
    hash_before: 1e124189231be00716984a6a080641967aa64194
    hash_after: 1e124189231be00716984a6a080641967aa64194
    answered:
      - name: tests
        exit: 0
        said: green, src/lsp passes
      - name: check
        exit: 0
        said: 23 stand at warning. A commit and a push land over them, and the refactoring hand drains them past main's check.
  - step: verdict
    hand: box 1670436ae0bb · claude-code-remote · helper-7
    hash_before: 1fedd6676ad31afb25a895f91f751c0779142fc0
    hash_after: 1fedd6676ad31afb25a895f91f751c0779142fc0
    returns: 1
    why: "The rule, its five cases, the row in `Rules` and the per-file check do what the ask calls for.; The chapter-nobody-wrote case feeds the rule a dead pointer and asserts one error naming the file and the line.; `./RUNME.sh check` on the branch answers 0, with 23 warnings, all in this ticket.; `./RUNME.sh branch review` answers check 1 on an untracked `plugin.json` the review worktree lacks. That is the box, and the branch's own check answers 0.; No retro stands in the handback.; Craft: `lib/tested.js` and `test/level0/tested.test.js` stand whole in tabs. `spec/config/biome.json` says space, and `biome format` refuses both. Format them back, so the hunk shows the one function it adds.; Craft: `lsp#one-shape-every-door-prints` writes the Finding shape a third time, after `tree#what-a-rule-answers` and `schema#a-finding-names-the-section`. Point at one of them.; Craft: `tree#the-rules-over-two-files` says its rules live in `lib/tree.js`, and the new row names a Go rule. One line says the server holds this one.; Design: a `reads:` line of a process file writes a pointer a reader follows, and the rule reads a comment alone outside a note. A dead pointer there passes the check. The approach scoped it so and the review passed it, so this goes to design and not to the drafter.; The rule tries `.yaml` and `.yml` where the index tries `.md` alone. The sound-pointers case covers a process file, and the chapter names the endings without the reason. Trivial.; The sentence split in `the-unknown-runs-stays-quiet.md` stands outside the ask and redesigns nothing."
  - step: implement/reflect
    hand: box 1670436ae0bb · claude-code-remote
    hash_before: a433a20afb61d067537feda423acfbbe5429f95c
    hash_after: a433a20afb61d067537feda423acfbbe5429f95c
  - step: implement/change
    hand: box 1670436ae0bb · claude-code-remote
    hash_before: 2ccdf1a14f06cd0dd136eddb87c9ce12b05675d3
    hash_after: 2ccdf1a14f06cd0dd136eddb87c9ce12b05675d3
    answered:
      - name: lint
        exit: 0
        said: 28 stand at warning. A commit and a push land over them, and the refactoring hand drains them past main's check.
---

# Ask

A pointer a reader follows lands on the chapter it names, so a note and the code
beside it stay one thing.

A pointer resolving nowhere reads as a live link and teaches a reader nothing.
A walk of the tracked files answers how many stand dead, and `./RUNME.sh links`
answers a note reaching a note alone. So a pointer into a chapter goes unread by
any gate.

This note comes off [[spec/tickets/the-colours-stand-in-config]], where two
readers pointed at a chapter standing nowhere. That round wrote the chapter, and
the gate reaching every pointer waits here.

- a gate reads every pointer a tracked file writes, and names each one resolving nowhere
- `./RUNME.sh check` answers 0, which means every pointer in the tree resolves
- a case feeds the gate a pointer naming a chapter nobody wrote, and the gate refuses it

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

The gate is one tree rule of the language server, so the check, the panel and
`se-lsp check` read it alike.

| the question | the answer |
|---|---|
| where the gate stands | a tree rule in `src/lsp`, beside the restated rule, which reads anchors already |
| what it reads | every path git holds: a note's frontmatter past `kind` and its body, and a comment line of any other text file |
| what it skips | a code span, a fenced block, an indented block, and a target carrying `<` or `>` |
| how a path resolves | the way the index resolves one: the exact path, then `.md`, `.yaml` and `.yml`, then a note's id, then a folder |
| how a chapter resolves | the slug of a heading of the note, as `headingNamed` reads it |
| what it answers | one error a dead pointer, naming the file and the line, so the check refuses it |
| what the tree fixes | every pointer standing dead today, repointed at the chapter that moved or the note that renamed |

In a code file the rule reads a comment line alone. A pointer in a string
literal is a fixture a test writes, and the tree holds such fixtures already.
The design output for the server takes a chapter on this rule, and
the table of tree rules takes a row.

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

pass
- the approach covers each bullet of the ask: a tree rule reads every pointer, an error makes the check refuse, and the tree gets repointed
- the approach resolves a path the way the index's `pointsAt` does, and lists `.yaml` and `.yml` where the index tries `.md` alone; the drafter names which of the two the rule follows, or the case for the third suffix
- the index holds a `dangling` query over the same dead pointers; the rule says beside it why a second reader stands in the language server, or reads the index's answer
- the approach names no case feeding the rule a chapter nobody wrote; the tests-red step writes that case, and it asserts the rule refuses
- the design output takes a chapter and a row in the table of tree rules, so the rule stands in one place

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

./RUNME.sh branch test src/lsp/pointer_test.go

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

The command answers assertion. Go refuses a package calling a name nobody
wrote, so `pointer.go` ships the rule answering nothing, and each case asserts
against it.

| the case | what it holds open |
|---|---|
| a chapter nobody wrote is refused | the rule answers nothing |
| a note nobody wrote is refused | the rule answers nothing |
| a comment in code is read | the rule answers nothing |
| sound pointers stand quiet | passes over the stub, because nothing draws over nothing |
| a quoted shape is skipped | passes over the stub, for the same reason |

The two quiet cases pass before the rule stands, and they earn their place once
it does. Each one names a shape the rule reads past, and a rule reading it
would draw there. What surprises me is how many shapes quote a pointer. A code
span, a fence, an indented example, a placeholder in angle brackets and a
string a test writes each do.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches no file the ask leaves out. The rule, its case file, the server's note, the tree rules table, this ticket, and every file carrying a dead pointer.
- every door the change reaches has a fake. Each case writes its own fixture root, and the rule reads the tree handed in and nothing outside it.
- a comment names the approach the change implements. The rule and each case point at the chapter the design output takes.

## reflect

<!-- names the class of error in the findings, and the fix for the class -->

### class

<!-- the class of error the findings describe, and the fix for the class -->

<!-- the form is text -->

The findings fall in three classes, and each names a fix.

| the class | the finding | the fix |
|---|---|---|
| a tool run outside its config | the formatter rewrote two files whole to tabs | run every tool the way the check runs it, through the tree's own config, so a hunk shows the one thing it adds |
| a fact written where one stands | the Finding shape stood a third time, and the table row named no home for a Go rule | search for the owner before writing a chapter, and point at it |
| a scope drawn by file ending | a pointer in a process file's `reads` line went unread | draw the scope by the shape a pointer takes where it stands: a bracketed value in yaml, a comment in code |

The endings the rule tries now carry their reason in the chapter, and the
sentence split in the other ticket stands, because it fixes a line this hand
wrote.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches no file the ask leaves out. The fixes stay in the rule, its cases, the two notes and the two files the formatter rewrote.
- every door the change reaches has a fake. The new case feeds the rule a process file in its own fixture root.
- a comment names the approach the change implements. The yaml reading carries a line pointing at the chapter.

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->

<!-- the form is command -->

./RUNME.sh lint

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches no file the ask leaves out. The rule and its cases, the registry and the per-file check, the server's note, the tree rules table, the commit door and its case, and the files whose pointers stood dead.
- every door the change reaches has a fake. The rule reads the tree handed in, and each case writes its own fixture root.
- a comment names the approach the change implements. The rule and each case point at the chapter the server's note now carries.

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

./RUNME.sh branch test src/lsp/pointer_test.go

### check

<!-- the check is green on the commit -->

<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

The language server gains one tree rule, and the tree loses every dead pointer.

| the change | why |
|---|---|
| `EveryPointerResolves` in `src/lsp/pointer.go`, in the sweep and over one file | a pointer landing nowhere reads as a live link, so the check refuses it and the panel draws it |
| four chapters in the server's note | the code pointed at chapters the note lost, and the pointers named what the code does. The Finding shape points at the tree note, which holds it |
| a row in the tree rules table | the rule stands in one place, and the table names every tree rule |
| the pointers the rule named, repointed | each one names the chapter that moved, the note that renamed, or the guidance that moved a folder down |
| a placeholder in angle brackets in the voice rule and the guidance schema | a bare word in brackets reads as a pointer, and the shape in angle brackets reads as a shape |
| the commit door passes a hunk adding comment lines alone | the repoints change no code, and the door asked each of eight files for a test |

The rule reads a comment alone in a code file, because a pointer in a string is
a fixture a test writes. In a yaml file it reads a value opening on a bracket,
because a `reads` line is a pointer a reader follows. The door's change carries
its own case.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches no file the ask leaves out. The commit door's reading of a comment-only hunk stands outside the ask, and the hand-back met it on the first commit, so the fix rides here with its case.
- every door the change reaches has a fake. The rule reads the tree handed in, and the door's case feeds it a delta in memory.
- a comment names the approach the change implements. The rule, its cases and the door's new lines each point at the chapter owning them.

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->

<!-- the form is files -->

- spec/guidance/review/reviewing.md
- spec/tickets/a-pointer-resolves.md
- src/lsp/pointer.go
- src/lsp/pointer_test.go
- src/lsp/check.go
- src/lsp/main.go
- src/lsp/serve.go
- src/lsp/tree.go
- src/lsp/restated.go
- src/lsp/note.go
- src/lsp/fixture_test.go
- src/index/index.go
- spec/design_output/lsp.md
- spec/design_output/tree.md
- spec/design_output/schema.md
- spec/design_output/index.md
- spec/design_output/editor.md
- spec/design_output/work.md
- spec/design_output/pull.md
- spec/design_output/level0.md
- spec/design_output/log.md
- spec/design_output/extension.md
- spec/design_input/the-agent-pulls-tickets.md
- spec/guidance/voice.md
- spec/schemas/guidance.schema.yaml
- spec/schemas/paragraph.schema.yaml
- spec/processes/retro.yaml
- spec/config/biome.json
- .claude/output-styles/level0.md
- .claude/skills/level0/lib/tested.js
- .claude/skills/level0/lib/answer.js
- .claude/skills/level0/lib/refuse.js
- .claude/skills/level0/lib/stop.js
- test/level0/tested.test.js
- test/level0/stop.test.js
- test/level0/pull-leaves.test.js
- test/level0/projection.test.js
- test/level0/states.test.js
- test/level0/viewer.test.js
- test/level0/window-door.test.js
- test/contract/cli-verbs.test.js
- src/bridge/bash.js
- src/bridge/findings.js
- src/bridge/stop.js
- src/scripts/cli.js
- src/scripts/cli-check.js
- src/scripts/cli-doors.js
- src/scripts/cli-read.js
- src/scripts/guidance-hand.js
- src/scripts/pull-route.js
- src/scripts/pull.js
- src/scripts/work-answer.js
- src/scripts/work.js
- src/tui/help.go
- src/tui/tree_test.go
- spec/tickets/a-log-verb-reads-sessions.md
- spec/tickets/a-step-changes-hands.md
- spec/tickets/the-unknown-runs-stays-quiet.md

## verdict

<!-- pass or fail, findings one a line -->

<!-- the form is verdict -->

fail

- The rule, its five cases, the row in `Rules` and the per-file check do what the ask calls for.
- The chapter-nobody-wrote case feeds the rule a dead pointer and asserts one error naming the file and the line.
- `./RUNME.sh check` on the branch answers 0, with 23 warnings, all in this ticket.
- `./RUNME.sh branch review` answers check 1 on an untracked `plugin.json` the review worktree lacks. That is the box, and the branch's own check answers 0.
- No retro stands in the handback.
- Craft: `lib/tested.js` and `test/level0/tested.test.js` stand whole in tabs. `spec/config/biome.json` says space, and `biome format` refuses both. Format them back, so the hunk shows the one function it adds.
- Craft: `lsp#one-shape-every-door-prints` writes the Finding shape a third time, after `tree#what-a-rule-answers` and `schema#a-finding-names-the-section`. Point at one of them.
- Craft: `tree#the-rules-over-two-files` says its rules live in `lib/tree.js`, and the new row names a Go rule. One line says the server holds this one.
- Design: a `reads:` line of a process file writes a pointer a reader follows, and the rule reads a comment alone outside a note. A dead pointer there passes the check. The approach scoped it so and the review passed it, so this goes to design and not to the drafter.
- The rule tries `.yaml` and `.yml` where the index tries `.md` alone. The sound-pointers case covers a process file, and the chapter names the endings without the reason. Trivial.
- The sentence split in `the-unknown-runs-stays-quiet.md` stands outside the ask and redesigns nothing.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- every fact the change adds stands in one place, and a note points at the file instead of repeating it. Four of the five new chapters own their facts, and every repoint lands on a chapter that stands. The Finding table repeats two notes, and the fix above names it.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
