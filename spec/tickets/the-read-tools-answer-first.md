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
step: design/review
record:
  - step: design/draft
    hand: box b99ea8ab11a8 · claude-code-remote
    hash_before: aea57a0ab08f3573035259dcb4b2268fc10b3981
    hash_after: aea57a0ab08f3573035259dcb4b2268fc10b3981
  - step: design/review
    hand: box 099c2ec7708d · claude-code-remote
    hash_before: 703fa45aa005c5361748df70aea64f032c5045fd
    hash_after: 703fa45aa005c5361748df70aea64f032c5045fd
    returns: 1
    why: "the hook's header says it imports nothing, three times, and it re-spells constants for that reason; say what that invariant becomes, because specs under `lib` make the hook import; say what happens to the constants the hook spells again today, which that invariant forces; the third row carries a bare number. `REASONS` in the hook names code 6, so point there; the specs' new home carries no file name. `findSpec` stands in `src/bridge/search.js`, and `SPECS` in `src/bridge/apply.js`; the ask asks for a case per tool, and the approach names no case file; what holds: `START`, `register` and `REASONS` all stand in the hook, and the chapter takes the order"
  - step: design/draft
    hand: box 099c2ec7708d · claude-code-remote
    hash_before: 2c02125ca5f0d2fc6378e8cbe65fe33b57dee72e
    hash_after: 2c02125ca5f0d2fc6378e8cbe65fe33b57dee72e
  - step: design/review
    hand: box 099c2ec7708d · claude-code-remote · helper-4
    hash_before: 93644d2ae38826ab2a8a8dd64cd72bee5a699962
    hash_after: 93644d2ae38826ab2a8a8dd64cd72bee5a699962
    returns: 2
    why: "`test/level0/bridgehead.test.js` owns the stub's install road under [[spec/design_output/vehicle#the-bridgehead-installs-the-upstream]]. Name another home.; `test/level0/hand.test.js` drives the hook's `register` today, so the cases land beside it.; the chapter puts the install on the setup, and the approach puts it on `START`. Say what that sentence becomes.; an implementer guesses the install command and the code the start answers.; `REASONS` code 6 says the setup brings no modules. Say what that code answers once the install road stands.; the chapter holds a session start to milliseconds, and an install takes minutes. Name that cost.; `patchSpec`, `replaceSpec` and `undoSpec` already stand under `.claude/skills/level0/lib`, so the first row overstates the move.; what holds:; the narrowed invariant reads against the tree. Every import under `lib` is relative or `node:`, and the plugin ships the folder whole.; `.claude/skills/level1/hooks/level1.js` already registers a tool at `session.start` and holds the same narrowed invariant.; `findSpec` in `src/bridge/search.js` and `SPECS` in `src/bridge/apply.js` both read as the approach names them.; the server answers `/health`, so the tool road's wait stands.; the three constants the approach hands back to their owners are `PORT`, `SESSION` and `HAND_FILE`.; every finding of the earlier `why` stands answered."
  - step: design/draft
    hand: box 099c2ec7708d · claude-code-remote
    hash_before: fe4386b67592e91b645cb1e0f8574de90f74a2dc
    hash_after: fe4386b67592e91b645cb1e0f8574de90f74a2dc
---

# Ask

a read goes through find and patch, and the shell keeps the rest

hundreds of shell reads stand where one verb answers

- find, patch and replace answer on the first call of a session
- a case covers each tool answering through the bridgehead

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->
<!-- the form is text -->

The plugin registers every read tool at session start, and the first call brings the server up.

| what stands today | what it costs |
|---|---|
| the specs ride the server's answer to `session.start` | a box whose server answers nothing carries no read tool all session |
| `starts` runs after that answer falls | the start lands, and the registration stands already past |

| what changes | where |
|---|---|
| `findSpec` moves under the skill folder | `.claude/skills/level0/lib/search.js`, and `src/bridge/search.js` points there |
| `register` names all four specs at session start | the plugin's `register` |
| a handler meeting no server starts one, waits on its health, and calls again | the plugin's tool road |

Three of the four specs stand under the skill folder already:

| the spec | where it stands today |
|---|---|
| `patchSpec` and `replaceSpec` | `.claude/skills/level0/lib/apply.js` |
| `undoSpec` | `.claude/skills/level0/lib/undo.js` |
| `findSpec` | `src/bridge/search.js`, which the move takes |

The bridgehead installs nothing, and the chapter's line on that stands as it stands. A session start waits for nothing, as that chapter says.

| what keeps its shape | what it answers |
|---|---|
| `START` | the same road, with the same codes |
| `REASONS` | every code, code 6 among them |

A handler meeting a code from the start answers the line `REASONS` names for it. So a box whose setup brings no modules says that, in place of standing silent.

What the hook's invariant becomes:

- the hook imports nothing outside `.claude/skills/level0`, and the plugin ships that folder whole
- `PORT`, `SESSION` and `HAND_FILE` each come from their owner
- a file under `lib` failing to load blocks the hook, which is what this buys the registration
- `.claude/skills/level1/hooks/level1.js` holds that same narrowed invariant already

So a hand calls `find` on its first turn, and that call pays for the server.

Where each thing stands after:

- `test/level0/hand.test.js` takes the cases, because it drives the hook's `register` today
- one case a tool, each with no server standing, reading the answer the handler gives
- one case drives a start answering a code, and reads the line the handler says
- the answer's `register` list stands, so a server carrying a newer spec still names it
- [[spec/design_output/level0#the-bridgehead-starts-it-too]] takes the order

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->
<!-- the form is verdict -->

fail

- `test/level0/bridgehead.test.js` owns the stub's install road under [[spec/design_output/vehicle#the-bridgehead-installs-the-upstream]]. Name another home.
- `test/level0/hand.test.js` drives the hook's `register` today, so the cases land beside it.
- the chapter puts the install on the setup, and the approach puts it on `START`. Say what that sentence becomes.
- an implementer guesses the install command and the code the start answers.
- `REASONS` code 6 says the setup brings no modules. Say what that code answers once the install road stands.
- the chapter holds a session start to milliseconds, and an install takes minutes. Name that cost.
- `patchSpec`, `replaceSpec` and `undoSpec` already stand under `.claude/skills/level0/lib`, so the first row overstates the move.

what holds:

- the narrowed invariant reads against the tree. Every import under `lib` is relative or `node:`, and the plugin ships the folder whole.
- `.claude/skills/level1/hooks/level1.js` already registers a tool at `session.start` and holds the same narrowed invariant.
- `findSpec` in `src/bridge/search.js` and `SPECS` in `src/bridge/apply.js` both read as the approach names them.
- the server answers `/health`, so the tool road's wait stands.
- the three constants the approach hands back to their owners are `PORT`, `SESSION` and `HAND_FILE`.
- every finding of the earlier `why` stands answered.

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
