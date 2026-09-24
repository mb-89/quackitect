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
step: design/draft
record:
  - step: design/draft
    hand: box 2bc65ec92430 · claude-code-remote
    hash_before: a3f4e059640d0b9a89ebe7f2d2db34dd512a89e2
    hash_after: 2b0bcf56b2369620d5fec2bd3cffec184672d926
  - step: design/review
    hand: box 2bc65ec92430 · claude-code-remote · helper-2
    hash_before: ff3c6492b7d870d2668fd5494b8f633db43d3ee5
    hash_after: ff3c6492b7d870d2668fd5494b8f633db43d3ee5
    returns: 1
    why: "design: the new check `rerouted` stands a case apart from `reRouted`. Give the check a distinct name.; design: the shared rule changes `update` and `updated` in `src/scripts/ticket.js`. List both under callers.; design: `updated` copies reached leaves over, and the new rule refuses. Say which rule `update` follows.; design: \"changes a phase holding one\" refuses a new step past the pointer in its phase. Name the phase fields held fixed.; craft: the approach names no test for each refusal road. Name one test a road."
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

A person reshapes the steps ahead of the pointer through one verb, and the record of what already happened stays as it stood.

The editor edits the frontmatter by hand, and a slip rewrites the record or the step under the pointer.

- `./RUNME.sh ticket route <ticket>` takes a route edit and writes it over the steps past the pointer
- the verb refuses an edit reaching the pointer's step or the record, and names the step it refuses
- the verb writes JSON naming the route it leaves
- ./RUNME.sh test test/level0/ticket-verb.test.js passes

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

`ticket route <ticket> --steps=<json>` takes the whole route the drawing leaves, as a JSON list of steps. The verb reads the reached leaves the way `updated` in `src/scripts/ticket.js` reads them. That is every leaf at or before the pointer, and every step the record names.

| the new route | the verb |
|---|---|
| opens on the reached leaves, in their order, each the same as it stood | writes the route through `reRouted`, and keeps `process_hash`, so the drift from the process shows |
| drops, moves or changes a reached leaf, or a phase holding one | refuses, names the first such step, and writes nothing |
| no longer holds the pointer's leaf | refuses, and names the pointer |
| arrives as no JSON list | refuses, and says the flag it wants |

Both roads print one JSON object:

| the road | the keys |
|---|---|
| a write | `ticket`, `step`, `steps` |
| a refusal | `refused`, `at` |
 The exit is 0 on a write and 1 on a refusal. One function, `rerouted`, holds the check, so the update child reads the same rule.


### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `src/scripts/ticket.js` `ticket`, which dispatches the new verb and prints its usage line
- `src/scripts/cli.js` the `ticket` entry, whose `says` names the verbs
- `.claude/skills/level0/lib/schema-mint.js` `reRouted`, which the verb calls unchanged


### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- first draft


## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

fail
- design: the new check `rerouted` stands a case apart from `reRouted`. Give the check a distinct name.
- design: the shared rule changes `update` and `updated` in `src/scripts/ticket.js`. List both under callers.
- design: `updated` copies reached leaves over, and the new rule refuses. Say which rule `update` follows.
- design: "changes a phase holding one" refuses a new step past the pointer in its phase. Name the phase fields held fixed.
- craft: the approach names no test for each refusal road. Name one test a road.

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
