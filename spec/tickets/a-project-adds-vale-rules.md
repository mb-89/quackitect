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
group: the-rules-hold-themselves
process: [[spec/processes/standard]]
process_hash: 838dd6d003506639
step: design/review
record:
  - step: design/draft
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: 5178b2a8949b7d702d95a4febc5b96653082e82f
    hash_after: 5178b2a8949b7d702d95a4febc5b96653082e82f
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->

A project writes a Vale rule of its own, and the vehicle's rules keep standing over it:

- the method's styles come down, and the project's stand over them by name
- the result is a derived folder nobody edits, and this tree forks the method for none of it

<!-- breaks, as text: what breaks if it is never done -->

The write door reads one styles folder, the method's. A project wanting a word of its own edits the method, and every other project reads that edit.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

- the styles both roots hold assemble into a derived folder nobody edits, and the door reads the config there
- a rule the project alone holds refuses a write inside the project, and refuses nothing in the method
- `./RUNME.sh check` exits 0, with a case over two fake roots

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

The styles both roots hold assemble into one folder under the work root, and the
vale door reads the config standing there.

| what | where it stands |
|---|---|
| the assembly | `assemble` in `src/scripts/styles.js` |
| the styles it writes | `.se/vale/styles` under the work root |
| the config it writes | `.se/vale/.vale.ini`, whose `StylesPath` names that folder |
| the rewrite of that key | `stylesIn` in `.claude/skills/level0/lib/vale.js` |
| the door reading it | `src/doors/vale.js`, which takes both roots |

- The method's style files come down first, and the work root's stand over them by name. The unit is the file. [[spec/design_output/vehicle#the-work-root-inherits]]
- The config comes from the work root where it holds one, and from the method otherwise.
- A tree driving itself assembles nothing, and the door reads the method's own config.
- The assembly runs on the first lint a box takes, so a box that lints nothing writes nothing.
- The door hands the config to `lintText`, which carries the flag already.

`.se` stands off git, so nobody edits what the assembly writes, and a project
adds a word of its own without forking the method.

Four cases hold it:

- a fake disk over two roots, on the file the work root replaces
- a fake disk over two roots, on the name the work root alone holds
- a contract case on disk, where the project's own rule refuses a write there
- a contract case on disk, where the method driving itself refuses nothing

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

- This ticket names no group, so it stands in the pool on trunk.
- A branch the platform cut carries a first cut of this. It holds `src/scripts/styles.js`, a `stylesIn` in the standing layer, and a contract case. Trunk stands without it.
- That branch stands a week old and hundreds of commits behind. Its `vehicle.js` predates the two roads trunk reads today.
- Its plumbing conflicts in five files, so a hand writes the approach again from the ask.
- That first cut survives the branch as the tag `kept/vale-styles-first-cut`.
- Read its shape before you draft: `git show kept/vale-styles-first-cut:src/scripts/styles.js`.
- The two roots trunk reads today stand under [[spec/design_output/vehicle]].
