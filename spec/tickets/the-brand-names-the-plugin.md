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
step: design/review
record:
  - step: design/draft
    hand: box d42624a67d18a8 · claude-code
    hash_before: ad522192f4a8f0c4c092881fdaccd4ef723c3d93
    hash_after: ad522192f4a8f0c4c092881fdaccd4ef723c3d93
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
One answer settles which name a vehicle stamps. The brand design then runs to its end, with no second person step in it.

<!-- breaks, as text: what breaks if it is never done -->
The brand design holds at its review. A draft stamping the plugin name renames every `mcp__level0` tool. A draft leaving that name alone parts no two vehicles under one marketplace.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- the answer names which name the brand reaches: the plugin name, the marketplace name, or both
- the answer names the cost it takes for the `mcp__level0` tool names
- the answer names the path under `spec/config` the icon file stands at
- the answer says what `brandOf` writes for a folder carrying a dot
- `./RUNME.sh lint spec/tickets/the-brand-names-the-plugin.md` reads the ticket clean

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

The brand reaches the marketplace and leaves the plugin name alone.

[[spec/design_output/level0#a-stub-names-its-vehicle]] already measured this road. A stub names the vehicle's folder as a marketplace, enables `level0@<brand>`, and the tools keep the name `level0`. So the brand parts two vehicles at the marketplace, and the plugin name carries no weight it already carries.

| the name | what it reads | who writes it |
|---|---|---|
| `marketplace.json` name | the brand | `brandOf` |
| `marketplace.json` owner name | the brand | `brandOf` |
| `plugin.json` author name | the brand | `brandOf` |
| `plugin.json` name | `level0` | nobody, and it stands |
| the enabled id | `level0@<brand>` | the stub's settings |

The cost for the tool names is nothing. `grep -rl mcp__level0` answers 29 files outside `node_modules` and `.se`, and every one of them stands as it is. A draft stamping the brand on the plugin name moves all 29, and buys a parting the marketplace already gives.

The icon stands at `spec/config/brand/icon.svg`. `spec/config` already holds a folder for each thing a projection reads, as `styles` and `stop` do, so the brand takes one of its own. `src/extension/icon.svg` is the target it projects into, and the extension build reads its own path as it does now.

`brandOf` answers the folder name whole, so a folder carrying a dot answers a name carrying a dot. A marketplace name takes no dot, so `brandOf` slugs what it answers:

| the folder | what `brandOf` answers |
|---|---|
| `quackitect` | `quackitect` |
| `my.app` | `my-app` |
| `Acme Tools` | `acme-tools` |
| `.hidden` | `hidden` |

The rule is one line: lower the case, turn every run of characters outside `a-z0-9` into one hyphen, and cut a hyphen off each end. A folder answering an empty name fails the stub, and says which folder it read.

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


- [[spec/tickets/brand-reads-folder]] hands this over at `design/person-1`, which waits for a person.
  - design/review failed back 2 times: The redraft answers the design output list, the `when` clause and the two
  - fake folders. The plugin name, the icon file and the lock file want a third draft.
  - the plugin name is the role, and the marketplace name is the brand. Stamping the plugin name renames every `mcp__level0` tool
  - the bridge modules and the cage settings write `mcp__level0` in, so a branded plugin name costs a prompt
  - the marketplace name alone parts two vehicles, because the client keys a plugin under its marketplace
  - the icon row names a config file, and the ask names a file under `spec/config`. Name that path, so the implement writes there
  - the ask says this tree keeps its icon. The icon row reads as the link writing initials over the mark this tree wears
  - `src/extension/package-lock.json` writes the name twice, and `npm install` rewrites it. The stamp leaves the two out of step
  - `src/extension/webview/package.json` writes the name, and wants a row in the table
  - `brandOf` answers the folder name raw. A folder carrying a dot or a space makes an id the editor refuses
  - `links(files, home, root)` drops the verb, so the `linked` query stands outside the test the ask asks for
  - the design output list names the command that counts the places, and carries a count from that command alone
