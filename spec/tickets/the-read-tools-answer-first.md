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
step: implement/tests-red
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
  - step: design/review
    hand: box 099c2ec7708d · claude-code-remote · helper-6
    hash_before: c8a3cdf15d74319922624104e2ae614f20e839b9
    hash_after: c8a3cdf15d74319922624104e2ae614f20e839b9
    returns: 3
    why: "`src/bridge/vehicle.js` copies `hooks/level0.js` and its manifests into a stub, so an import of `../lib` dies there.; `test/level0/vehicle.test.js` asserts the file list that copy takes, so the change reaches a case the ask leaves out. Name it.; the invariant sentence stands under [[spec/design_output/level0#the-bridgehead-and-the-server]], and the approach names the start chapter alone. Say what it becomes.; the row naming the stub's copy stands under [[spec/design_output/vehicle#the-bridgehead-installs-the-upstream]]. Say what that row becomes.; an implementer guesses the wait on `/health` and the answer where that wait runs out.; what holds:; every finding of both earlier `why` lines stands answered.; `findSpec`, `patchSpec`, `replaceSpec` and `undoSpec` stand where the approach names them.; `lib/apply.js`, `lib/undo.js` and `lib/folders.js` carry no `node:` import, so the hook's environment takes them.; `PORT_BASE` stands in `lib/vehicle.js`, and `SESSION` stands in `lib/log.js`.; `test/level0/hand.test.js` drives the hook's `register`, so the cases land beside it.; `.claude/skills/level1/hooks/level1.js` registers a tool at `session.start` already.; `REASONS` holds code 6, and [[spec/design_output/level0#the-bridgehead-starts-it-too]] says the bridgehead installs nothing."
  - step: design/draft
    hand: box 099c2ec7708d · claude-code-remote
    hash_before: b70660fe8d933469e97f46d36cebea9f8837aa42
    hash_after: b70660fe8d933469e97f46d36cebea9f8837aa42
  - step: design/review
    hand: box 099c2ec7708d · claude-code-remote · helper-8
    hash_before: d4d32372cec7ae9d59433e715726b068f05a1992
    hash_after: d4d32372cec7ae9d59433e715726b068f05a1992
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

Three of the four specs stand under the skill folder already:

| the spec | where it stands today |
|---|---|
| `patchSpec` and `replaceSpec` | `.claude/skills/level0/lib/apply.js` |
| `undoSpec` | `.claude/skills/level0/lib/undo.js` |
| `findSpec` | `src/bridge/search.js`, which the move takes |

| what changes | where |
|---|---|
| `findSpec` moves under the skill folder | `.claude/skills/level0/lib/search.js`, and the bridge points there |
| `register` names all four specs at session start | the plugin's `register` |
| a handler meeting no server starts one, waits on its health, and calls again | the plugin's tool road |

The bridgehead installs nothing, and that line stands as it stands. A session start waits for nothing, as its chapter says. `START` keeps its road and `REASONS` keeps every code. A handler meeting a code from the start answers the line `REASONS` names for it.

The tool road's wait:

- the handler asks `/health` every 200 milliseconds, and `STARTING` in the hook caps that wait
- the wait running out answers the line naming the port and the log the server writes to
- a call after that wait reaches the server, and the answer rides back as the tool's own

What the hook's invariant becomes:

- the hook imports its own folder, and nothing outside `.claude/skills/level0`
- `PORT_BASE` from `lib/vehicle.js` and `SESSION` from `lib/log.js` each come from their owner
- `HAND_FILE` stands in no lib module, so it takes one, beside the folder `folders.js` owns
- a file under `lib` failing to load blocks the hook, which is what this buys the registration
- `.claude/skills/level1/hooks/level1.js` holds that same narrowed invariant already

The stub takes the same files. `FILES` in `src/bridge/vehicle.js` copies the hook and its two manifests today, so an import of `../lib` dies in a stub:

| what the copy takes now | what it takes after |
|---|---|
| `hooks/level0.js` and its two manifests | the same three |
| nothing under `lib` | `lib/apply.js`, `lib/undo.js`, `lib/folders.js`, `lib/search.js`, `lib/vehicle.js` and `lib/log.js` |

Each note naming that copy takes the new list:

- [[spec/design_output/level0#the-bridgehead-and-the-server]] carries the invariant sentence, which becomes the narrowed one
- [[spec/design_output/vehicle#the-bridgehead-installs-the-upstream]] carries the copy's row, which names the lib files
- `test/level0/vehicle.test.js` asserts that copy file by file, so its list grows with `FILES`

So a hand calls `find` on its first turn, and that call pays for the server.

Where each thing stands after:

- `test/level0/hand.test.js` takes the cases, because it drives the hook's `register` today
- one case a tool, each with no server standing, reading the answer the handler gives
- one case drives a start answering a code, and reads the line the handler says
- one case drives the wait running out, and reads the line naming the port
- the answer's `register` list stands, so a server carrying a newer spec still names it
- [[spec/design_output/level0#the-bridgehead-starts-it-too]] takes the order

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->
<!-- the form is verdict -->

pass

what holds:

- `findSpec` stands in `src/bridge/search.js` and imports nothing, so the move to `lib/search.js` takes no import.
- `patchSpec` and `replaceSpec` stand in `lib/apply.js`, where the approach puts them.
- `undoSpec` stands in `lib/undo.js`, where the approach puts it.
- `FILES` in `src/bridge/vehicle.js` names the hook and its two manifests, so the copy table reads true.
- The copy list closes under its own imports, and no module in it reaches `node:`.
- `test/level0/vehicle.test.js` asserts each copied file, so its list grows with `FILES`.
- `test/level0/hand.test.js` drives the hook's `register`, so the cases land beside it.
- `PORT_BASE` stands in `lib/vehicle.js`, and `SESSION` stands in `lib/log.js`.
- `HAND_FILE` stands in no lib module, so it takes the new home the approach names.
- The server answers `/health`, and `STARTING` caps the wait the approach puts on it.
- Every anchor the approach links stands in its note.
- `.claude/skills/level1/hooks/level1.js` registers a spec at `session.start` and holds the narrowed invariant.
- The register at session start covers `find`, `patch`, `replace` and `undo`, which the ask calls for.
- Every finding of all three earlier `why` lines stands answered.

what the implement step carries:

- `spec/design_output/level0.md` carries the invariant in two more chapters, on the cloud start and the start road.
- The implementer narrows both sentences the way the approach narrows the first.


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
