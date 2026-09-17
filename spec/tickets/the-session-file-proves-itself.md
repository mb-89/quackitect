---
kind: [[ticket]]
state: open
urgency: now
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
step: design/review
record:
  - step: design/draft
    hand: box d42624a67d18a8 · claude-code
    hash_before: 9a7324a8827986146b4246ec34746fc9cb12397d
    hash_after: 9a7324a8827986146b4246ec34746fc9cb12397d
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
