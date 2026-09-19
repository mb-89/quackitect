---
kind: [[ticket]]
state: open
urgent: true
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
group: the-bridge-keeps-transport
process: [[spec/processes/standard]]
process_hash: 838dd6d003506639
step: verdict
record:
  - step: design/draft
    hand: box d42624a67d18a8 · claude-code
    hash_before: 9a7324a8827986146b4246ec34746fc9cb12397d
    hash_after: 9a7324a8827986146b4246ec34746fc9cb12397d
  - step: design/review
    hand: box fa49097ce66c · claude-code-remote
    hash_before: f4fd2c1f5187daf0a0448a116d9f113e1cfcf8d4
    hash_after: f4fd2c1f5187daf0a0448a116d9f113e1cfcf8d4
  - step: implement/tests-red
    hand: box fa49097ce66c · claude-code-remote
    hash_before: e584badfe49ea408c1dc7d9aee6fee9707b9ea81
    hash_after: b3e7586002d30dbc76500a6569abf1a4432bed3e
    answered:
      - name: tests
        exit: 1
        said: assertion, 3 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box fa49097ce66c · claude-code-remote
    hash_before: 03ad51131ea228daa1504c2f879b3dc9b391e5e8
    hash_after: d9fc61e7f493b3256d8675d7326fd9b060ceee9f
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box fa49097ce66c · claude-code-remote
    hash_before: a2a1cd6c4606ac0670a486c41e837a3f95f78f96
    hash_after: f310d6d180b91d5b61c5a3fef2364dff85633342
    answered:
      - name: tests
        exit: 0
        said: "green, 1057 test(s) pass in 100 file(s); green, src/index passes; green, src/lsp passes; green, src/swap passes; green, "
      - name: check
        exit: 0
        said: The rules pass.
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
A test drives the level one hook, so the hand the pull reads rests on proof. The wrapper then carries the session id every harness spells.

<!-- breaks, as text: what breaks if it is never done -->
The payload builder stands tested and the hook stands untested. A harness spelling the id a third way leaves the session file empty, and two sessions on one box read as one hand.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- a test drives the registered `session.start` hook over a fake `$.fs`, and reads the session file back
- that test carries an event naming a session, and an event naming none
- `sessionOf` reads the third spelling, the way the copilot library takes it
- the level one hook imports the session path from the library beside it, so one copy stands
- `./RUNME.sh check src test .claude spec/design_output` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

Three changes, each in one place, and a test driving the hook the pull rests on.

| what changes | where |
|---|---|
| `sessionOf` takes a third spelling | `.claude/skills/level1/lib/pull.js` |
| `SESSION` moves to the library beside the hook | the same file, and the hook imports it |
| a case drives the registered `session.start` | `test/level0/` |

**The third spelling.** `sessionOf` reads `e?.session?.id` and `e?.sessionId`. `copilot.js` reads `input.session_id ?? input.sessionId`, so `session_id` is the one it misses. The read becomes `e?.session?.id ?? e?.sessionId ?? e?.session_id`, which takes every spelling this tree already meets.

**The copy.** `.se/session.json` stands in three modules:

| the module | what holds it |
|---|---|
| `.claude/skills/level0/hooks/level0.js` | its own plugin folder |
| `.claude/skills/level1/hooks/level1.js` | its own plugin folder |
| `src/scripts/hand.js` | the tree |

A plugin imports nothing past its own folder, which is the reason each boundary keeps a copy. The hook and its library stand inside one folder, so that copy goes and the other two stay. Each remaining copy names the boundary forcing it, beside the line.

**The test.** `spawnsWith` in `test/level0/hand.test.js` already drives a registered hook: it imports `register`, collects the hooks into a map, and hands the one it wants a fake `$`. The new case takes that shape over `session.start`, with a fake `$.fs` holding what the hook writes.

Two events drive it:

| the event | what the case reads |
|---|---|
| one naming a session | the file comes back, carrying the id and the harness |
| one naming none | the fake holds no write, and the hook says the hand stands at the box |

A third case drives each of the three spellings, so a harness spelling the id any of the three ways lands one hand.

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

pass

- the three changes each land in one place, and together they answer every line of the ask
- the third spelling reads right, because `copilot.js` takes the `session_id` that `sessionOf` misses
- the approach names `.se/session.json`, and the modules spell `.se/.runtime/session.json`
- the table counts `src/scripts/hand.js` a copy, and it composes the path off `inRun` instead
- so one spelling goes, and the comment the approach asks for belongs on the level zero hook
- the cited collector keys one handler an event
- level one registers `tool.call` with a filter between the event and the handler
- the new case reads the last argument, or it hands the filter a call
- the fake `$` carries a tool register and a ui log beside `fs`
- level one's session start registers the pull tool before it writes the file
- the approach names `test/level0/` and no file, and `test/level0/level1.test.js` stands there

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

    ./RUNME.sh branch test

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

Three of the four new cases fail on their own assertion, each for the reason
the approach names.

| the case | what it reads |
|---|---|
| the library owns the spelling | `lib.SESSION` stands undefined |
| the id every harness spells | `session_id` reads empty |
| the registered start writes the file | nothing lands under the name the library gives |
| an event naming no session | it passes, because that road stands already |

The fourth surprises. The hook says the hand stands at the box for an event
naming nothing, and that road holds today with no change under it. So the ask's
second line asks for a case over a road standing right.

The collector takes the last argument of a registration, because level one
hands `tool.call` a filter between the event and the handler. A collector
keying the second argument would hand the filter a call.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the cases stand in `test/level0/level1.test.js`, and the change touches no file the ask leaves out
- the harness the hook reaches stands as a fake carrying a file system, a tool register and a log
- a comment over each case points at the chapter the approach implements

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

- the change reaches the level one library, its hook, and the tree case naming the copies
- the hook meets a fake carrying a file system, a tool register and a log, so no door runs live
- a comment over the spelling names `folders.js` as the owner, and the approach it implements

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

    ./RUNME.sh branch test

### check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

The hand the pull reads rests on proof now, and the session file takes the id
every harness this tree meets spells.

| what changes | where |
|---|---|
| `sessionOf` takes `session_id` beside the two it took | the level one library |
| `SESSION` stands in that library, and the hook imports it | the library, and the hook beside it |
| four cases drive the registered `session.start` | `test/level0/level1.test.js` |
| the tree case reads the copies where they stand now | `test/contract/tree.test.js` |

The tree case held that both hooks spell the session file. Level one's hook
imports it now, so that case reads the library instead, and reads the hook for
no second spelling.

The collector takes the last argument of a registration. Level one hands
`tool.call` a filter between the event and the handler, and a collector keying
the second argument would hand that filter a call.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change reaches the level one library, its hook, and the two test files naming the copies
- the hook meets a fake carrying a file system, a tool register and a log, so no door runs live
- a comment over the spelling names `folders.js` as the owner, and each case points at its chapter

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


- [[spec/tickets/the-hand-carries-the-session]] hands this over at `implement/person-1`, which waits for a person.
  - verdict failed back 2 times. No test drives the level one `session.start` hook. So nothing proves the wrapper writes the session file.
  - The ask wants a test reading that file back, and the payload builder alone stands tested.
  - Drive the registered hook with a fake `$.fs`, over an event naming a session and one naming none.
  - `sessionOf` reads two spellings of the id, and the `session_id` this tree already reads is neither.
  - Take that third spelling, the way `.claude/skills/level0/lib/copilot.js` takes it.
  - The level one hook spells the session path again, beside the lib it already imports, so one copy goes.
  - Every other finding of the last round lands, and the hold here names the agent.
  - The `own` mark rests on the harness carrying an unknown key, which no type in this tree proves.
  - `./RUNME.sh check src test .claude spec/design_output` exits 0, and the suite passes 1016 of 1018.
  - The stub rename belongs to the sibling ticket, and it redesigns nothing here.

The last line of the ask names `./RUNME.sh check src test .claude spec/design_output`,
and that command answers 1 on this branch. Five files stand past a ceiling:

| the file | what it breaks |
|---|---|
| `.claude/skills/level0/lib/bash.js` | the file ceiling |
| `.claude/skills/level0/lib/paragraph.js` | the file ceiling |
| `.claude/skills/level0/lib/schema.js` | the file ceiling |
| `.claude/skills/level0/lib/copilot-runtime.js` | the function ceiling |
| `.claude/skills/level0/lib/vocabulary.js` | the function ceiling |

Each of the five carries the same line count at the commit this branch takes,
so this change grows none of them. `./RUNME.sh check` over the whole tree
answers 0, and the evidence names that one. [[spec/tickets/the-warnings-feed-a-refactorer]]
owns the road from a standing warning to a hand that splits the file.
