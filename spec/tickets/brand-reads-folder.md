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
  - step: design/review
    hand: box 02ae9414623e · helper-2
    hash_before: 78bc292e6b744b1ea0c20fbd6a829ef91d9a56d2
    hash_after: 78bc292e6b744b1ea0c20fbd6a829ef91d9a56d2
    returns: 1
    why: The approach carries the manifest, the ids and the icon. The list and the; editor test wait on a second draft.; the design output holds a list of the places that write the name in, and the approach links it; the plugin manifests join the table, where each writes the name as the plugin name. So two vehicles hand the client one name twice; the approach plans a test for each pure function. The two fake folders the ask names wait on a test over the link verb; the stamp writes the name, the display name, the publisher, the container and the view. The `when` clause of the view carries the brand too; the manifest and the icon travel tracked, so the link dirties every vehicle past this brand. The stamp reads idempotent in this tree alone; the diff touches this ticket and its group ticket, each a trivial fix; `./RUNME.sh check` answers 1 on the branch, from a server absent at its port; the handback waits on a retro, which the branch review names
  - step: design/draft
    hand: box 02ae9414623e
    hash_before: 9c208fa9d41f45a1d766e3635e327da3eb68b74f
    hash_after: 9c208fa9d41f45a1d766e3635e327da3eb68b74f
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
Two brands stand side by side in one editor, and a vehicle carries its own name from the day the button makes it.

<!-- breaks, as text: what breaks if it is never done -->
Every vehicle calls itself quackitect, and two of them fight over one extension id.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- the editor link derives `<brand>.<brand>` and `<brand>.sidebar` from the folder name, and writes the manifest at link time
- a vehicle draws its initials as its icon, in a file under `spec/config` the owner swaps. This tree keeps its icon
- the 30 places that write the name in read the brand instead, listed in the design output
- two trees linked into one editor show two entries, proven in the editor test with two fake folders

Read [[spec/design_input/a-stub-takes-its-vehicle]] first, the chapters The stub's files and The bridgehead step by step.

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

The brand is the method root's folder name, and `brandOf` answers it today. The
link verb becomes the one writer: it stamps the manifests, writes the icon, then
links and registers as it does today.

| kind | what carries the brand | with the brand |
|---|---|---|
| the extension manifest | the name, the display name, the description, the publisher, the container, the view id, the view name, the `when` clause | the link stamps each from the brand |
| the extension's modules | the view key, the here key, the rest key, the output channel, the view command, the language client's id | each derives from the `name` its own manifest carries |
| the icon | the mark, and the title inside it | the link writes it from the config file the owner swaps |
| the link script | the name it keeps the editor's list under | derives from the brand |
| the plugin manifests | the plugin name the marketplace offers, and the name the skill declares | the link stamps both, so two vehicles hand the client two names |

The implement adds the chapter The brand reads the folder to
[[spec/design_output/extension]], which holds that list one a line. The module
path each Go build carries stays as it stands, because the editor reads the
extension manifest alone.

Four pure functions carry the work, and each takes a test with no editor and no
disk:

- `brandedManifest(said, brand)` returns the manifest with every brand field set, the `when` clause among them
- `brandedPlugin(said, brand)` returns a plugin manifest under the brand
- `initialsIcon(brand)` returns the mark a vehicle wears until the owner swaps it
- `idsOf(said)` returns the view id, the here key and the rest key off a manifest

`main` in the link script stands unexported, behind a gate on the argument
vector. So a test reaches the link path nowhere today. The change lifts its body
into an exported `links(files, home, root)`, and the gate calls that.

The editor test then drives two fake roots through one fake home, and reads two
entries out of the list. That is the proof the ask names.

- a second link writes the same bytes as the first
- the manifest and the icon travel tracked, so the first link in a fresh vehicle writes them once
- `produce` stamps the copy's manifests and writes its icon, so a vehicle lands under its own brand

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

fail. The approach carries the manifest, the ids and the icon. The list and the
editor test wait on a second draft.

- the design output holds a list of the places that write the name in, and the approach links it
- the plugin manifests join the table, where each writes the name as the plugin name. So two vehicles hand the client one name twice
- the approach plans a test for each pure function. The two fake folders the ask names wait on a test over the link verb
- the stamp writes the name, the display name, the publisher, the container and the view. The `when` clause of the view carries the brand too
- the manifest and the icon travel tracked, so the link dirties every vehicle past this brand. The stamp reads idempotent in this tree alone
- the diff touches this ticket and its group ticket, each a trivial fix
- `./RUNME.sh check` answers 1 on the branch, from a server absent at its port
- the handback waits on a retro, which the branch review names

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
