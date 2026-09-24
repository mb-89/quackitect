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
          - name: callers
            form: list
            says: every caller of what the approach changes, one a line, as a file and a function
          - name: answers
            form: list
            says: every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft
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
process_hash: 7a1a6e274b56e7ee
group: the-ticket-answers-the-editor
step: verdict
record:
  - step: design/draft
    hand: box 2bc65ec92430 · claude-code-remote
    hash_before: b4915f89595781fc657a7e01b1bd0c11231fa55d
    hash_after: b4915f89595781fc657a7e01b1bd0c11231fa55d
  - step: design/review
    hand: box 2bc65ec92430 · claude-code-remote · helper-2
    hash_before: e80e872ef031cc568b9740c37f4a37a6128cf0bf
    hash_after: e80e872ef031cc568b9740c37f4a37a6128cf0bf
  - step: implement/tests-red
    hand: box 2bc65ec92430 · claude-code-remote
    hash_before: a587c08a244752dcd56db7e1b9d0854389d81df7
    hash_after: a587c08a244752dcd56db7e1b9d0854389d81df7
    answered:
      - name: tests
        exit: 1
        said: assertion, 1 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box 2bc65ec92430 · claude-code-remote
    hash_before: 8e8d613a71038911f65d530ea43f84ec0f2c8d71
    hash_after: 8e8d613a71038911f65d530ea43f84ec0f2c8d71
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box 2bc65ec92430 · claude-code-remote
    hash_before: 25420b6976a8983f4114ff92f9b5a977808f6cfb
    hash_after: 25420b6976a8983f4114ff92f9b5a977808f6cfb
    answered:
      - name: tests
        exit: 0
        said: green, 25 test(s) pass in 3 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/each-node-names-its-place.md:260:3: Sentence: A sentence holds 25 words. Cut this one in two."
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

The editor jumps from a node in the drawing to the chapter and the line that step writes under. Each node the graph verb answers carries that place.

A click on a node lands nowhere, and the drawing group's edits-and-clicks child stands blocked.

- `./RUNME.sh graph spec/tickets/<ticket>` prints each leaf node with its chapter heading and its line in the ticket body
- a node drawn from a bare process carries no place, and the test in test/level0/graph.test.js says so
- ./RUNME.sh test test/level0/graph.test.js passes

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

`graphIn` reads a note's sections where the text opens on frontmatter, and hands them to `graphOf`. Each node whose chapter stands in the body carries two keys:

| the key | what it holds |
|---|---|
| `chapter` | the heading as the body writes it, such as `## draft` |
| `line` | the heading's line in the file, counted from one |

A process file holds no body, so its nodes carry neither key. A node whose chapter stands nowhere in the body carries neither key too.

`sectionAt` finds a step's heading in `src/scripts/pull-chapter.js` today, and that file imports the voice doors. So `sectionAt` moves into `.claude/skills/level0/lib/schema-read.js` beside `readNote`, and `pull-chapter.js` imports it from there. The extension loads the emitter, so the emitter keeps off the voice doors.


### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `src/scripts/cli.js` `drawing`, which prints the graph unchanged
- `src/extension/lib/drawing.js` the emitter read, which hands the graph to the editor unchanged
- `src/scripts/pull-chapter.js` `withFieldText` and `voiceText`, which call `sectionAt` from its new home


### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- first draft


## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

pass

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

./RUNME.sh test test/level0/graph.test.js


### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

The ticket case fails on its own assertion, since no node carries a place yet. The bare process case passes already, and it holds that road while the change lands. A leaf whose chapter the body lacks, `do` here, carries no place either.


### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches no file the ask leaves out. The cases join the graph's own test file.
- every door the change reaches has a fake. The emitter reads text alone, and reaches no door.
- a comment names the approach the change implements. The new cases point at the design input.


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

./RUNME.sh lint src/scripts/graph.js src/scripts/pull-chapter.js .claude/skills/level0/lib/schema-read.js .claude/skills/level0/lib/schema.js test/level0/graph.test.js test/level0/pull-chapter.test.js


### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches no file the ask leaves out. It touches the emitter, the reader `sectionAt` moves into, and the chapter file that calls it.
- every door the change reaches has a fake. The emitter and the reader read text alone.
- a comment names the approach the change implements. `placed` and `sectionAt` point at their notes.


## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

./RUNME.sh test test/level0/graph.test.js test/level0/pull-chapter.test.js test/level0/drawing.test.js


### check

<!-- the check is green on the commit -->

<!-- the form is command -->

./RUNME.sh check


### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

Each node `./RUNME.sh graph` answers over a ticket now carries its place in the body:

| the key | what it holds |
|---|---|
| `chapter` | the heading as the body writes it, such as `## draft` |
| `line` | the heading's line in the file, counted from one |

A process file holds no body, so its nodes carry neither. `sectionAt` moves into `.claude/skills/level0/lib/schema-read.js` beside `readNote`, so the emitter the extension loads stays off the voice doors. `chapterOf` calls it too, so one walk finds a step's heading.


### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches no file the ask leaves out. It touches the emitter, the reader, the chapter file, and their cases.
- every door the change reaches has a fake. The cases hand the emitter text, and it reaches no door.
- a comment names the approach the change implements. Each new function points at its note.


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
