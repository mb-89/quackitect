---
kind: [[ticket]]
state: open
depends_on:
  - a-rule-carries-its-side
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
group: the-warnings-feed-a-refactorer
step: design/review
record:
  - step: design/draft
    hand: box dd2a59294365 · claude-code-remote
    hash_before: 95e62b529fbf4630939a7c7126594dd40f959748
    hash_after: 95e62b529fbf4630939a7c7126594dd40f959748
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

**The flag.** `parallel` false switches the spawn off. The session then drains the list itself before it pushes. The push door it meets is the one [[spec/tickets/a-rule-carries-its-side]] writes.

**Which file the hand takes.** The hand reads the list, groups its entries by file, and drops every file a write touched inside `untouchedFor`. It takes the oldest of the rest.

| what keeps the hands off one file | how |
|---|---|
| the file the working session holds | that file's last write stands inside the window |
| a file another hand took | its entries leave the list as that hand lands them |

**The guidance the hand reads.** `spec/guidance/refactoring.md` stands as a guidance note, and its frontmatter carries `env: [SE_REFACTOR]`. `bindsHere` in `.claude/skills/level0/lib/guidance.js` binds a note by that field. So the standing layer hands the note to a session carrying the variable. The spawn sets it, and the working hand carries it nowhere.

**The cases.**

- the check answers false under the number, and true past it
- the rule reads `continue`, so a turn meeting it holds open
- the spawn fires once a vote, and stops at `mostInARow`
- the flag false spawns nothing, and the session drains the list before it pushes
- the hand walks past a file written inside the window, and takes the oldest beyond it
- the standing layer hands the note to a session carrying the variable, and to no other

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

<!-- what anybody adds, at any time, on this ticket -->
