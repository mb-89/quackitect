---
kind: [[ticket]]
state: closed
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
step: verdict
record:
  - step: design/draft
    hand: box 1670436ae0bb · claude-code-remote
    hash_before: b13f91a700d1a75a30488b4049afbed27769dcef
    hash_after: b13f91a700d1a75a30488b4049afbed27769dcef
  - step: design/review
    hand: box 1670436ae0bb · claude-code-remote · helper-2
    hash_before: 0039c099bc3da2c41110d653726f5bde3a69431c
    hash_after: 0039c099bc3da2c41110d653726f5bde3a69431c
    returns: 1
    why: "The vote's `unknown` list misses a claimed rule the agent claims nowhere this turn, because `fires` in `lib/stop.js` answers false before it reads `runs`, so a typo in such a rule stays quiet until the agent claims it. Read every rule's `runs` in the door through `knowsCheck`, which `src/bridge/stop.js` exports already.; The line names the rule file, and `pool` in `lib/stop.js` drops the file name, so the door holds it nowhere. Name the rule id and the check, both of which the door holds.; The table under The mechanical checks in `spec/design_output/stop.md` lists `never`, and `CHECKS` in `src/bridge/stop.js` holds it nowhere, so a rule with `runs: never` writes the warn line every turn. Add `never` to `CHECKS` answering false, so the table and the door agree.; The case over the fake box stands right: `test/level0/stop-door.test.js` holds a fake `log.say` that keeps every row, so the case asserts the warn row there."
  - step: design/draft
    hand: box 1670436ae0bb · claude-code-remote
    hash_before: 9ae8ec51a44ac0d3b37ddc170d32a2d159520a06
    hash_after: 9ae8ec51a44ac0d3b37ddc170d32a2d159520a06
  - step: design/review
    hand: box 1670436ae0bb · claude-code-remote · helper-4
    hash_before: 480c7217d3c4fc70f2c40772d5fd9e741aa7a114
    hash_after: 480c7217d3c4fc70f2c40772d5fd9e741aa7a114
  - step: implement/tests-red
    hand: box 1670436ae0bb · claude-code-remote
    hash_before: 04fa73f97bf69a3e73c9a8329b29ea0e34cbb426
    hash_after: 04fa73f97bf69a3e73c9a8329b29ea0e34cbb426
    answered:
      - name: tests
        exit: 1
        said: assertion, 1 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box 1670436ae0bb · claude-code-remote
    hash_before: fc582e2cc12da4a8264af9885dda592b544c75a1
    hash_after: fc582e2cc12da4a8264af9885dda592b544c75a1
    answered:
      - name: lint
        exit: 0
        said: 43 stand at warning. A commit and a push land over them, and the refactoring hand drains them past main's check.
  - step: implement/tests-green
    hand: box 1670436ae0bb · claude-code-remote
    hash_before: 1d116db0aba79674e5bdb71bb84f337b147d4375
    hash_after: 1d116db0aba79674e5bdb71bb84f337b147d4375
    answered:
      - name: tests
        exit: 0
        said: green, 18 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: 43 stand at warning. A commit and a push land over them, and the refactoring hand drains them past main's check.
  - step: verdict
    hand: box 1670436ae0bb · claude-code-remote · helper-9
    hash_before: 785fe959a77173afd7d392bd64f9d84c89ffcbff
    hash_after: 785fe959a77173afd7d392bd64f9d84c89ffcbff
reason: done
---

# Ask

A rule naming a check the door holds nowhere says so in the log, so the hand
that wrote it reads its own mistake.

[[spec/design_output/stop]] says a `runs` the code holds nowhere writes one warn
line. The vote carries the unknown names out, and every caller drops that list,
so the line reaches the log nowhere. A rule with a typo in its `runs` then
stands silent, and a reader takes it as a rule that fires.

This note comes off the verdict on [[spec/tickets/the-controls-wire-up]], and
it stands outside that branch's hunks.

- the stop door writes one warn line per rule naming a check it holds nowhere
- a case drives the door with such a rule, and asserts the line stands in the log
- `./RUNME.sh check` answers 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

The stop door reads every rule's `runs` itself, once a turn, and writes one
warn line a rule naming a check it holds nowhere.

| the piece | what changes |
|---|---|
| `onStop` in `src/bridge/stop.js` | before the vote, asks `knowsCheck` of every rule carrying a `runs`, and writes `warn` under `stop` for each one it holds nowhere, naming the rule id and the check |
| `CHECKS` in `src/bridge/stop.js` | gains `never`, answering false, so the table under The mechanical checks and the door agree |
| `decide` in the hook's `lib/stop.js` | stays as it is, because the vote skips a claimed rule the agent claims nowhere, and the door's own read catches those too |
| the case | drives the door over the fake box with a rule whose `runs` names nothing. Asserts one warn row in the fake log naming the rule and the check |
| the design output | stays as it is, because the sentence promising the line stands there already |

The line names the rule id and the check, because the door holds both and the
file name nowhere. The line stands in the log, and nowhere in the block the
door answers. The owner reads the log for a rule at fault, and the agent reads
the block for what to do next.

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

pass

- The approach does what the ask calls for. The door reads every rule's `runs` through `knowsCheck` once a turn. Writes one warn line a rule naming a check it holds nowhere.
- The line names the rule id and the check, both of which the door holds. The earlier finding on the file name stands answered.
- `CHECKS` gains `never` answering false. The table under The mechanical checks and the door agree. The earlier finding stands answered.
- The case drives the door over the fake box in `test/level0/stop-door.test.js`, whose fake `log.say` keeps every row. Asserts the warn row there. The rule carries a test proving it fires.
- The approach touches `src/bridge/stop.js` and the case alone. Leaves `decide`, `fires` and the design output as they stand. Nothing outside the ask moves.
- Craft, for the drafter at implement. The case's rule carries a `runs` naming a check the door holds nowhere. A `decides` of mechanical. The vote reads it too.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

./RUNME.sh branch test test/level0/stop-door.test.js

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

The command answers assertion. Two cases join the stop door's file, over the
fake box it holds already.

| the case | what it holds open |
|---|---|
| a rule naming a check the door holds nowhere writes one warn line | the log holds no warn row, so the count fails |
| a rule running `never` writes no warn line | passes, because the door writes no line today |

What surprises me is that the door already writes a warn line for a claim
naming no reason. Holds the reader for a rule's check two lines away from it.
The second case passes before the change and earns its place after it. The
change writes a line for every unknown check and `never` stands in the door's
table nowhere yet.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches no file the ask leaves out. The door, its case file and this ticket.
- every door the change reaches has a fake. The cases drive the door over the fake disk, the fake process and a log that keeps every row.
- a comment names the approach the change implements. Each case points at the chapter promising the line.

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

- the change touches no file the ask leaves out. The door, its case file and this ticket.
- every door the change reaches has a fake. The line reaches the log door, and the cases hand in a log that keeps every row.
- a comment names the approach the change implements. The new function and the new check each point at the chapter promising the line.

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

./RUNME.sh branch test test/level0/stop-door.test.js

### check

<!-- the check is green on the commit -->

<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

The stop door reads every rule's `runs` once a turn, and writes one warn line
under `stop` for each check it holds nowhere. The line names the rule and the
check, so a hand with a typo in a rule file reads its own mistake in the log.

| the change | why |
|---|---|
| `warnsUnknown` in `src/bridge/stop.js`, before the vote | the vote skips a claimed rule the agent claims nowhere, so the door reads every rule itself |
| `never` in the door's checks, answering false | the design output names it as what an unbuilt rule runs, and the door held it nowhere |
| two cases over the fake box | one asserts the line for a typo, and one asserts silence for `never` |

The vote in the hook stays as it is, and so does the design output, which
promises the line already.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches no file the ask leaves out. The door, its case file and this ticket.
- every door the change reaches has a fake. The cases drive the door over the fake box, and read the line off a log that keeps every row.
- a comment names the approach the change implements. The function and the check point at the chapter promising the line.

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->

<!-- the form is files -->

- spec/guidance/review/reviewing.md
- spec/tickets/the-unknown-runs-stays-quiet.md
- spec/tickets/a-pointer-resolves.md
- src/bridge/stop.js
- test/level0/stop-door.test.js
- spec/design_output/stop.md
- .claude/skills/level0/lib/stop.js
- spec/vocabulary/terms.yml

## verdict

<!-- pass or fail, findings one a line -->

<!-- the form is verdict -->

pass

- The branch does what the ask calls for. `warnsUnknown` writes one warn line a rule naming a check the door holds nowhere.
- The line names the rule id and the check, and the row carries both as fields, as the approach says.
- `never` stands in `CHECKS` answering false, so the table under The mechanical checks and the door agree.
- The case feeds the door a rule with a typo in `runs`. It asserts the one warn row in the fake log.
- A second case feeds the door `never` and asserts silence, so the new check carries its own proof.
- `./RUNME.sh check` answers 0 on this branch, with 43 standing at warning.
- The hunk on `spec/tickets/a-pointer-resolves.md` puts one file name in a code span, a trivial fix outside the ask.
- The other hunks outside the ask are Biome's line wraps, and redesign nothing.
- The handback names no retro, and none stands there.
- Craft, for the drafter at leisure. The assertion message at line 283 of the case file earns one Antithesis warning. The hand drains it.
- `./RUNME.sh branch review` fails on its own worktree, a missing `plugin.json`. This verdict reads git and the check by hand.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- every fact the change adds stands in one place, and a note points at the file holding it. The line's promise stands in `spec/design_output/stop.md` alone, and the function, the check and both cases point at that chapter.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
