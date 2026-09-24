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
step: implement/change
record:
  - step: design/draft
    hand: box 2bc65ec92430 · claude-code-remote
    hash_before: 3ba0d68d6aaf8ed96468301c50eac3e2b5e7f38a
    hash_after: 3ba0d68d6aaf8ed96468301c50eac3e2b5e7f38a
  - step: design/review
    hand: box 2bc65ec92430 · claude-code-remote · helper-2
    hash_before: 671713f72c32205c8d4afd58d2117c70fc39617c
    hash_after: 671713f72c32205c8d4afd58d2117c70fc39617c
  - step: implement/tests-red
    hand: box 2bc65ec92430 · claude-code-remote
    hash_before: f18376d690c84c21bc698886edf5854c48a11cbc
    hash_after: f18376d690c84c21bc698886edf5854c48a11cbc
    answered:
      - name: tests
        exit: 1
        said: assertion, 5 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

The editor fills a ticket with an empty route through the mint, and reads the result before anything lands on disk.

The editor copies the mint's shape by hand, and the two drift.

- `./RUNME.sh ticket fill <path> --stdout` prints the filled ticket `mintNote` in .claude/skills/level0/lib/schema-mint.js writes, and writes no file
- without `--stdout` the verb writes the filled ticket over the path
- ./RUNME.sh test test/level0/ticket-verb.test.js passes

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

`ticket fill <path>` reads the ticket a person saves, and builds the mint's fields from it:

| the field | from |
|---|---|
| every frontmatter key the person writes, `process` among them | the frontmatter, as it stands |
| `Ask` and `Discussion` | the body of each chapter, where it holds text |

`withRoute` in `src/scripts/process.js` copies the route and the hash in, and `mintedNote` writes the text. So the mint verb and the fill share one road.

| the ticket | the verb |
|---|---|
| carries a route already | copies nothing, says so, and exits 0 |
| names no process, or one standing nowhere | refuses with the reason `withRoute` gives, and exits 2 |
| carries a process and no route, under `--stdout` | prints the filled text, and writes no file |
| carries a process and no route | writes the filled text over the path, and prints JSON naming `ticket` and `process` |

A new file, `src/scripts/ticket-fill.js`, holds the verb, so `ticket.js` stays under the ceiling.


### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `src/scripts/ticket.js` `ticket`, which dispatches the new verb and prints its usage line
- `src/scripts/cli.js` the `ticket` entry, whose `says` names the verbs
- `src/scripts/process.js` `withRoute`, and `.claude/skills/level0/lib/schema-mint.js` `mintedNote`, which the verb calls unchanged


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

- `--stdout` prints the text `mintedNote` builds through `mintNote`, and writes no file.
- Without `--stdout` the verb writes the same text over the path.
- `withRoute` copies the route and the hash, the road the mint verb takes.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

./RUNME.sh test test/level0/ticket-fill.test.js


### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

Every case fails on its own assertion, with the verb unknown. The cases stand in a new file, `test/level0/ticket-fill.test.js`, since `test/level0/ticket-verb.test.js` sits close to the line ceiling. They read the shared ticket schema and the trivial route out of `test/level0/fixtures.js`. A refusal of a bare `process` reads the reason `processAt` gives.


### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches no file the ask leaves out. It adds the verb's module and its cases.
- every door the change reaches has a fake. The verb reaches the disk alone, and the cases drive the fake disk.
- a comment names the approach the change implements. Both new files open on the design input they build.


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
