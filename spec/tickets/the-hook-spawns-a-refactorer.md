---
kind: [[ticket]]
state: closed
urgency: now
step: design/person-1
steps:
  - name: design
    reads: [[spec/guidance/voice]]
    steps:
      - name: person-1
        does: answers the question the engine asks
        by: person
        to: engine
        asks: "design/review failed back 2 times: One answer leaves the stop door: `seen` takes the `spawn` branch and drops `result` beside it.; So the `continue` side hands back no block, and the turn ends where the rule holds it open.; `spawns` awaits `$.agent.spawn`, so the session waits on the hand the ask says costs no turns.; Name the door that starts the hand beside the stop door, since one answer carries both nowhere.; `onAgentSpawn` reads no kind, and the review spawn carries `subagentType` `general-purpose` too.; Name the field the refactoring spawn sets, so the refactor layer reaches that hand alone.; No code reads a note's `scope` today, so say that `guidanceHere` starts reading it.; `refactor.mostInARow` counts hands and `stop.mostInARow` counts turns, so name the new key apart.; `./RUNME.sh check` answers 1, on warnings standing across the tree before this branch.; The git source, the successor pointer and the note's `scope` answer the earlier findings.; The stop rule, the four keys, the flag and the file the hand takes answer the rest of the ask."
        evidence:
          - name: answer
            form: text
            says: the answer, which the step behind this one reads
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
record:
  - step: design/draft
    hand: box dd2a59294365 · claude-code-remote
    hash_before: 95e62b529fbf4630939a7c7126594dd40f959748
    hash_after: 95e62b529fbf4630939a7c7126594dd40f959748
  - step: design/review
    hand: box dd2a59294365 · claude-code-remote · helper-2
    hash_before: 010c618d7665b207550853778c522bd67d994025
    hash_after: 010c618d7665b207550853778c522bd67d994025
    returns: 1
    why: The spawned hand takes the helper layer, which the working box builds from its own `process.env`.; So the variable the spawn sets reaches that layer nowhere, and the note stands off the hand.; Name how the note reaches the spawned hand alone, where `onAgentSpawn` hands that layer over.; The resolver beside `work-waiting` answers a boolean alone, so the check spawns nothing.; Name the hook that returns the spawn, as the review tool returns one off a tool call.; The pointer for the push door names a ticket closed as `became`, so point at its successor.; `untouchedFor` names no source for a file's last write, so say whether git answers it.; The guidance note carries `env` alone, and its schema requires `scope` beside it.; `./RUNME.sh check` answers 1, on warnings standing across the tree before this branch.; The stop rule, the four keys and the flag answer the rest of the ask.
  - step: design/draft
    hand: box dd2a59294365 · claude-code-remote
    hash_before: 4d09f82c8554b7e92f5bd41adef39a3a96f34d0d
    hash_after: 4d09f82c8554b7e92f5bd41adef39a3a96f34d0d
  - step: design/review
    hand: box dd2a59294365 · claude-code-remote · helper-4
    hash_before: a510cdadbcf9b88430fe5c0da35f069d30302d87
    hash_after: a510cdadbcf9b88430fe5c0da35f069d30302d87
    returns: 2
    why: "One answer leaves the stop door: `seen` takes the `spawn` branch and drops `result` beside it.; So the `continue` side hands back no block, and the turn ends where the rule holds it open.; `spawns` awaits `$.agent.spawn`, so the session waits on the hand the ask says costs no turns.; Name the door that starts the hand beside the stop door, since one answer carries both nowhere.; `onAgentSpawn` reads no kind, and the review spawn carries `subagentType` `general-purpose` too.; Name the field the refactoring spawn sets, so the refactor layer reaches that hand alone.; No code reads a note's `scope` today, so say that `guidanceHere` starts reading it.; `refactor.mostInARow` counts hands and `stop.mostInARow` counts turns, so name the new key apart.; `./RUNME.sh check` answers 1, on warnings standing across the tree before this branch.; The git source, the successor pointer and the note's `scope` answer the earlier findings.; The stop rule, the four keys, the flag and the file the hand takes answer the rest of the ask."
group: the-warnings-feed-a-refactorer
depends_on: ["a-rule-carries-its-side"]
reason: became
successors: [the-spawn-reaches-its-guidance]
---

# Ask

**The gain.** A session past the number spawns a refactoring hand and carries on with its own work. The cleaning costs the work no turns.

**What breaks otherwise.** A growing list has nobody to drain it. The push door then holds every push, and a person drains the list by hand.

- a stop rule fires where the warnings stand past the number the config names
- the flag switches the parallel half off, and the session then drains the list before it pushes
- the hand takes a file nothing has touched inside the window the config names
- `spec/guidance/refactoring` stands, the hand reads it, and the working hand does not
- `./RUNME.sh check` answers 0

# design

## person-1

<!-- answers the question the engine asks -->

### answer

<!-- the answer, which the step behind this one reads -->

<!-- the form is text -->

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

The tooth votes over rules a folder holds, and a mechanical rule names a check the hook resolves. So this adds:

- one stop rule, under `spec/config/stop/level0.yml`
- one check, beside `work-waiting` in `src/bridge/stop.js`
- four config keys, under one `refactor` key
- one guidance note, which the spawned hand alone reads

**What the list is.** [[spec/tickets/one-list-holds-the-warnings]] decides the shape of the list this reads, and this approach names it `the list` throughout.

| who reads it | what it takes |
|---|---|
| the check below | its length |
| the hand below | its entries, grouped by file |

Neither reads a path of its own, so the answer to that ticket lands in one place.

**The stop rule.** One entry joins `spec/config/stop/level0.yml`:

| field | what it reads |
|---|---|
| `id` | `warnings-stand-past-the-number` |
| `side` | `continue`, so the turn holds open and the work carries on |
| `decides` | `mechanical` |
| `runs` | `warnings-standing`, resolved beside `work-waiting` in `src/bridge/stop.js` |
| `says` | the line naming the count and the hand it spawns |

The check answers true where the list runs past the number. The hook spawns the refactoring hand as the vote lands, and the session takes its next turn without waiting.

**The four config keys.** They join `spec/config/level0.json`, and `spec/config/level0.schema.json` says what each does:

| key | what it holds |
|---|---|
| `mostWarnings` | the entries the list holds before the rule fires |
| `untouchedFor` | the age a file's last write carries before the hand takes it |
| `parallel` | the flag, true by default |
| `mostInARow` | the hands the session spawns one after another |

**What returns the spawn.** The resolver beside `work-waiting` answers a boolean, so it spawns nothing. The stop door carries the spawn instead:

| what | where |
|---|---|
| the check, answering the boolean the vote reads | the resolver in `src/bridge/stop.js` |
| the answer carrying `spawn`, where that vote lands | the stop door in the same file |
| the call on that answer | `spawns` in `.claude/skills/level0/hooks/level0.js` |

`src/bridge/review.js` answers the same shape off a tool call, so the door follows a road the tree already walks.

**The flag.** `parallel` false switches the spawn off. The session then drains the list itself before it pushes. The push door it meets is the one [[spec/tickets/one-list-holds-the-warnings]] settles.

**Which file the hand takes.** The hand reads the list, groups its entries by file, and drops every file a write touched inside `untouchedFor`. It takes the oldest of the rest.

| what it asks | who answers |
|---|---|
| a file's last write | the git door, at `log -1 --format=%cI -- <path>` |
| the file the working session holds | that same answer, standing inside the window |
| a file another hand took | its entries leave the list as that hand lands them |

**The guidance the hand reads.** `spec/guidance/refactoring.md` stands as a guidance note. Its schema wants a `scope`, so the note's scope names the refactoring hand, and the note carries no `env`.

The layers stand in `guidanceHere`, under `src/bridge/guidance.js`. Two build off `here`, which filters by the working box's own variables. A note reaching the spawned hand alone reaches neither, so the function builds a third:

| layer | what it holds | who takes it |
|---|---|---|
| `standing` | the session's own notes | the working hand |
| `helper` | the same, for a hand the pull spawns | a helper |
| `refactor` | the notes whose scope names the refactoring hand | the hand this rule spawns |

`onAgentSpawn` reads the spawn's kind and hands the matching layer over. So the working hand reads the note nowhere, and the spawned hand reads it once.

**The cases.**

- the check answers false under the number, and true past it
- the rule reads `continue`, so a turn meeting it holds open
- the door answers a spawn where the vote lands, and none under the number
- the spawn fires once a vote, and stops at `mostInARow`
- the flag false spawns nothing, and the session drains the list before it pushes
- the hand walks past a file written inside the window, and takes the oldest beyond it
- the refactor layer holds the note, and the standing layer holds it nowhere
- the spawn of that kind takes the refactor layer, and a helper takes its own

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

fail

- One answer leaves the stop door: `seen` takes the `spawn` branch and drops `result` beside it.
- So the `continue` side hands back no block, and the turn ends where the rule holds it open.
- `spawns` awaits `$.agent.spawn`, so the session waits on the hand the ask says costs no turns.
- Name the door that starts the hand beside the stop door, since one answer carries both nowhere.
- `onAgentSpawn` reads no kind, and the review spawn carries `subagentType` `general-purpose` too.
- Name the field the refactoring spawn sets, so the refactor layer reaches that hand alone.
- No code reads a note's `scope` today, so say that `guidanceHere` starts reading it.
- `refactor.mostInARow` counts hands and `stop.mostInARow` counts turns, so name the new key apart.
- `./RUNME.sh check` answers 1, on warnings standing across the tree before this branch.
- The git source, the successor pointer and the note's `scope` answer the earlier findings.
- The stop rule, the four keys, the flag and the file the hand takes answer the rest of the ask.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the same tests pass -->

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
