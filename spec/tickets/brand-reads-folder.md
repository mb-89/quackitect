---
kind: [[ticket]]
state: open
urgency: whenever
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
    needs: ["work test"]
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
    evidence:
      - name: read
        form: files
        says: every file you read, one a line
      - name: verdict
        form: verdict
        says: pass or fail, findings one a line
process: [[spec/processes/standard]]
process_hash: 8cc8301e3ca3ba8d
group: the-brand-reads-the-folder
step: design/review
record:
  - step: design/draft
    hand: box 02ae9414623e
    hash_before: af9a78c7f10daebe7b393d747fc593eeb7757fd3
    hash_after: af9a78c7f10daebe7b393d747fc593eeb7757fd3
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
Two brands in one editor get in each other's way nowhere, and a vehicle carries its own name from the day it is made.

<!-- breaks, as text: what breaks if it is never done -->
Every vehicle calls itself quackitect, and two of them fight over one extension id.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- the editor link derives <brand>.<brand> and <brand>.sidebar from the folder name, and writes the manifest at link time
- a vehicle draws its initials as its icon, in a file under spec/config the owner swaps, and this tree keeps its icon
- the 30 places that write the name in read the brand instead, listed in the design output
- two trees linked into one editor show two entries, proven in the editor test with two fake folders

Read [[spec/design_input/a-stub-takes-its-vehicle]] first, the chapters The stub's files and The bridgehead step by step.

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

The brand is the method root's folder name, and `brandOf` answers it today. One
write carries it: the link verb stamps the manifest before it links. Every
other piece reads the manifest it already loads.

| piece | today | with the brand |
|---|---|---|
| the manifest | tracked, naming one brand | the link writes `name`, `displayName`, `publisher`, the container and the view from the brand |
| the extension's three keys | constants | derived from the `name` the manifest beside them carries |
| the output channel and the view command | a constant | the same manifest |
| the language client's id | a constant | the same manifest |
| the icon | one file in the extension folder | `spec/config/icon.svg`, which the link copies in |
| a vehicle's icon | the duck it copied | its initials, which `produce` draws over the copy's file |

Three pure functions carry the work, and each takes a test with no editor and no
disk:

- `brandedManifest(said, brand)` returns the manifest with every brand field set
- `initialsIcon(brand)` returns the mark a vehicle wears until the owner swaps it
- `idsOf(said)` returns the view id, the here key and the rest key off a manifest

The link verb stays the one place that writes. It reads the manifest, stamps it,
copies the icon in, then links and registers as it does today. So a tree linked
twice under two names writes two entries, and the editor draws two.

The manifest stays tracked, because the packaging script and the editor both
read it before the link runs. The stamp is idempotent: a second link writes the
same bytes.

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

## reflect

<!-- names the class of error in the findings, and the fix for the class -->

### class

<!-- the class of error the findings describe, and the fix for the class -->

<!-- the form is text -->

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->

<!-- the form is command -->

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

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->

<!-- the form is files -->

## verdict

<!-- pass or fail, findings one a line -->

<!-- the form is verdict -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
