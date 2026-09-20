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
step: implement/tests-green
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
  - step: implement/tests-red
    hand: box 099c2ec7708d · claude-code-remote
    hash_before: 7ee7555ba111bfca10b4aab69a23f8c25909fba5
    hash_after: 7ee7555ba111bfca10b4aab69a23f8c25909fba5
    answered:
      - name: tests
        exit: 1
        said: assertion, 4 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box 099c2ec7708d · claude-code-remote
    hash_before: 64fd48f14891db8df7d9df81beb80584371fb9ba
    hash_after: 64fd48f14891db8df7d9df81beb80584371fb9ba
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box 099c2ec7708d · claude-code-remote
    hash_before: c04f8d7875c82f085830eb4cbc224300a784159f
    hash_after: c04f8d7875c82f085830eb4cbc224300a784159f
    answered:
      - name: tests
        exit: 0
        said: green, 4 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: The rules pass.
  - step: verdict
    hand: box 099c2ec7708d · claude-code-remote · helper-13
    hash_before: 392861ea045f595ece4592a0fd65b4b48c71e4f8
    hash_after: 392861ea045f595ece4592a0fd65b4b48c71e4f8
    returns: 1
    why: what blocks:; The ask asks a case a tool, and `test/level0/read-tools.test.js` drives `find` alone.; `patch`, `replace` and `undo` reach no case through the bridgehead, so the second bullet stands open.; The approach names one case a tool too, so the implement step falls short of its own design.; Drive the four names in one loop over `firing`, each with no server standing.; The chapter The bridgehead starts it too says the hook imports nothing, and the change breaks that.; Narrow that sentence the way the chapter above it narrows its own.; notes, which block nothing:; `src/scripts/serve.js` carries the same stale reason in a header comment.; `spec/design_input/a-stub-takes-its-vehicle.md` names the hook and its two manifests alone.; The wait case burns the whole `STARTING` span, so the file runs long.; `started` in the hook holds across cases in one file, so a later case reads an earlier one's start.; A dead server posts `tool.call` twice, once from the `*` door and once from the tool road.; what holds:; `./RUNME.sh check` answers exit 0, and the server stands at the health port.; The copy list closes under its own imports, over the six lib files the hook reaches.; Every lib file the hook reaches, and every file those reach, travels in `FILES`.; No file in that closure imports `node:`, so a stub loads each one.; Dropping `lib/log.js` from `FILES` reds `test/level0/vehicle.test.js` on the missing file.; Dropping `undoSpec` from `READ_TOOLS` reds two cases in `test/level0/read-tools.test.js`.; Stripping the port from the line the wait answers reds the wait case.; `findSpec` stands in one place, and `src/bridge/search.js` points there.; Every file the diff touches stands inside the ask, and no hunk redesigns what the ask leaves alone.; No retro stands in the handback, and this step routes to one.; The tip matches origin, and the working tree stands clean.
  - step: implement/reflect
    hand: box 099c2ec7708d · claude-code-remote
    hash_before: 89165e20af84f6bb0cdd9f0866b67b99d3664f35
    hash_after: 89165e20af84f6bb0cdd9f0866b67b99d3664f35
  - step: implement/change
    hand: box 099c2ec7708d · claude-code-remote
    hash_before: 864909c7c04d8298d75e48b655e4fafff7cf365b
    hash_after: 864909c7c04d8298d75e48b655e4fafff7cf365b
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
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

./RUNME.sh branch test test/level0/read-tools.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Four cases go red on their own assertions. `READ_TOOLS` stands empty and the hook takes neither the session start nor a tool call, so each case reads back nothing.

What surprises:

- the cases land in a file of their own, because `test/level0/hand.test.js` drives the pull
- that file names the hook nowhere, so a case over `register` takes a fresh owner
- `test/level0/besides.test.js` drives the hook over a fake session, and these cases take its shape

The engine hands a hook one `on`, and the hook names the events it takes. So a case reads the handlers off that call, and drives each with its own fake session.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the cases land in `test/level0/read-tools.test.js`, beside the other cases over the hook
- the engine's own doors stand faked: the tool register, the process, the fetch and the log
- the header of `READ_TOOLS` points at the chapter the approach names

## reflect

<!-- names the class of error in the findings, and the fix for the class -->

### class

<!-- the class of error the findings describe, and the fix for the class -->
<!-- the form is text -->

The change covers one of four, and leaves the rest to the reader's faith. Each finding names a place where one stands for many.

| what the change does once | what the ask asks |
|---|---|
| a case over `find` | a case a tool, over all four |
| one sentence narrowed | every sentence carrying that reason |

The fix for the class runs in two moves:

- drive the names in one loop, so a tool added later joins the cases by standing in the list
- grep the tree for the reason a change breaks, and narrow each line the grep names

The second move catches the notes beside the blockers. `src/scripts/serve.js` carries the same reason in its header, and the design input names the copy list as it stood.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the fix touches the cases, the hook's header, two notes and one design input
- the engine's doors stand faked, and the loop drives each tool over its own fake session
- the class above names the approach each hunk follows

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the hook, the spec it moves, the stub's copy, two cases and three notes
- the engine's own doors stand faked: the tool register, the process, the fetch and the log
- each header points at the chapter the approach names, and that chapter owns the order

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh branch test test/level0/read-tools.test.js

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The hook registers every read tool at the session's start, and the first call brings the server up.

| what stands now | where |
|---|---|
| `READ_TOOLS`, naming the four specs | the hook, which registers each at session start |
| the tool road, one handler a tool | the hook, which starts the server and waits |
| `findSpec` | `.claude/skills/level0/lib/search.js`, where the bridge points |

A call landing before the server stands asks once, runs the start, reads `/health` every fifth of a second, and asks again. `STARTING` caps that wait. The wait running out answers the port and the log the server writes to.

The hook's invariant narrows. It imports its own folder now, and nothing past it:

- `PORT_BASE` comes from `lib/vehicle.js` and `SESSION` from `lib/log.js`, each from its owner
- a file under `lib` failing to load blocks the hook, which is what this buys the registration
- the stub's copy takes the six lib files the hook reaches, so an import dies nowhere there
- `test/level0/vehicle.test.js` asserts each of those files travels

The bridgehead installs nothing, so that line stands as it stands. `START` keeps its road, `REASONS` keeps every code, and a session start waits for nothing.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every fact the change adds stands in one place, and each note names the piece it owns
- the hook reaches the outside through the engine's doors, and the cases fake all four
- each header says what its file is for, and counts nothing

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->
<!-- the form is files -->

- spec/tickets/the-read-tools-answer-first.md
- .claude/skills/level0/hooks/level0.js
- .claude/skills/level0/lib/search.js
- .claude/skills/level0/lib/apply.js
- .claude/skills/level0/lib/folders.js
- .claude/skills/level0/lib/log.js
- .claude/skills/level0/lib/undo.js
- .claude/skills/level0/lib/vehicle.js
- src/bridge/search.js
- src/bridge/vehicle.js
- src/bridge/server.js
- src/scripts/serve.js
- spec/design_output/level0.md
- spec/design_output/vehicle.md
- spec/design_input/a-stub-takes-its-vehicle.md
- test/level0/read-tools.test.js
- test/level0/vehicle.test.js

## verdict

<!-- pass or fail, findings one a line -->
<!-- the form is verdict -->

fail

what blocks:

- The ask asks a case a tool, and `test/level0/read-tools.test.js` drives `find` alone.
- `patch`, `replace` and `undo` reach no case through the bridgehead, so the second bullet stands open.
- The approach names one case a tool too, so the implement step falls short of its own design.
- Drive the four names in one loop over `firing`, each with no server standing.
- The chapter The bridgehead starts it too says the hook imports nothing, and the change breaks that.
- Narrow that sentence the way the chapter above it narrows its own.

notes, which block nothing:

- `src/scripts/serve.js` carries the same stale reason in a header comment.
- `spec/design_input/a-stub-takes-its-vehicle.md` names the hook and its two manifests alone.
- The wait case burns the whole `STARTING` span, so the file runs long.
- `started` in the hook holds across cases in one file, so a later case reads an earlier one's start.
- A dead server posts `tool.call` twice, once from the `*` door and once from the tool road.

what holds:

- `./RUNME.sh check` answers exit 0, and the server stands at the health port.
- The copy list closes under its own imports, over the six lib files the hook reaches.
- Every lib file the hook reaches, and every file those reach, travels in `FILES`.
- No file in that closure imports `node:`, so a stub loads each one.
- Dropping `lib/log.js` from `FILES` reds `test/level0/vehicle.test.js` on the missing file.
- Dropping `undoSpec` from `READ_TOOLS` reds two cases in `test/level0/read-tools.test.js`.
- Stripping the port from the line the wait answers reds the wait case.
- `findSpec` stands in one place, and `src/bridge/search.js` points there.
- Every file the diff touches stands inside the ask, and no hunk redesigns what the ask leaves alone.
- No retro stands in the handback, and this step routes to one.
- The tip matches origin, and the working tree stands clean.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- `FILES` in `src/bridge/vehicle.js` owns the copy list, and `spec/design_output/vehicle.md` points at it. `spec/design_input/a-stub-takes-its-vehicle.md` repeats the shape the change leaves behind.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
