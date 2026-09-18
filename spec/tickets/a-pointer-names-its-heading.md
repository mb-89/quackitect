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
group: the-warnings-feed-a-refactorer
step: design/draft
record:
  - step: design/draft
    hand: box a5e189c39e1d · claude-code-remote
    hash_before: 9c88da1bf3b10754ac711f81c7505a5a77b404b6
    hash_after: 9c88da1bf3b10754ac711f81c7505a5a77b404b6
  - step: design/review
    hand: box a5e189c39e1d · claude-code-remote · helper-2
    hash_before: 26e21ce695f0ee858694c9a37d2a525097a150c9
    hash_after: 26e21ce695f0ee858694c9a37d2a525097a150c9
    returns: 1
    why: "`./RUNME.sh check` hands `.` to `se-lsp check`, and that takes `Sweep`. A rule under `Checker.Over` draws nothing in the lint.; Carry the rule in `Rules` instead, so it walks `Tree.Paths`. The pointers the Go, the JavaScript and the shell hold draw too.; Say which characters the slug drops. The heading `The owner's prompt comes first` answers the anchor `the-owners-prompt-comes-first`.; Name where a pointer's target resolves to a path. `pointsAt` stands in the index alone, so say which side the checker asks.; More notes than `spec/design_output/lsp` lack a heading a pointer names. Run the new rule over the tree, and name every note it draws."
---

# Ask

**The gain.** A pointer naming a heading that stands nowhere draws like any other finding.

**What breaks otherwise.** A note losing a heading takes every pointer at it down. The checker drops the half after the `#` before it resolves, so it reads each one as good. `spec/design_output/lsp.md` stands as the case. It holds one heading. Pointers from the installer, the extension, the Go sources and the command line name headings it lacks.

- the checker reads the half of a link after the `#` against the target's headings
- such a pointer draws in the panel and in the lint
- `./RUNME.sh check` answers 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

One rule in the checker reads the heading half of every pointer, and faults the
pointer whose heading stands nowhere. The panel and the lint both ask that
checker, so one rule feeds both.

| piece | what it does |
|---|---|
| the rule | reads every pointer in a file, and faults where the target holds no such heading |
| the slug | lowercases the heading and joins its words with a dash, as the anchor a reader clicks |
| `Tree.Read` | answers the target's text, so an open buffer stands ahead of the copy on the disk |
| `Checker.Over` | carries the rule, so the finding draws per file, in the panel and in the lint alike |

The rule walks past a fence, so an example pointer inside one draws nothing.

[[spec/design_output/lsp]] regains the chapters its pointers name, because it
holds its scope alone today. Every other pointer naming a heading that stands
nowhere either gets that heading back or names the heading that stands.

The index keeps its own resolution. `pointsAt` answers which note a pointer
reaches, and the heading half decides nothing there.

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

fail

- `./RUNME.sh check` hands `.` to `se-lsp check`, and that takes `Sweep`. A rule under `Checker.Over` draws nothing in the lint.
- Carry the rule in `Rules` instead, so it walks `Tree.Paths`. The pointers the Go, the JavaScript and the shell hold draw too.
- Say which characters the slug drops. The heading `The owner's prompt comes first` answers the anchor `the-owners-prompt-comes-first`.
- Name where a pointer's target resolves to a path. `pointsAt` stands in the index alone, so say which side the checker asks.
- More notes than `spec/design_output/lsp` lack a heading a pointer names. Run the new rule over the tree, and name every note it draws.

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
