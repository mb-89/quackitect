---
kind: [[ticket]]
state: open
urgent: true
step: design/draft
steps:
  - name: design
    reads: [[spec/guidance/voice]]
    steps:
      - name: person-1
        does: answers the question the engine asks
        by: person
        to: engine
        asks: "design/review failed back 2 times: Two findings of the last review stand open, and two new faults join them.; The count drift goes. The draft names `grep -rl mcp__level0` and carries a count nowhere.; The reader rows read true. `stop.js` reads `spec/config/stop`, and `vale.js` reads `spec/config/styles`.; The shape claim reads true. `projection.js` holds `COMMANDS`, `PARAGRAPH` and `STYLE`.; The `brandOf` row reads true. `stub.js` hands it to `linkOf`, which writes the `vehicle.json` name.; The anchor stands, the slug table follows its own rule, and the lint reads the ticket clean.; One reader a folder reads other than the tree. `cli.js` reads three folders under `spec/config/styles`.; A projection writes `spec/config/styles/VoiceParagraph`, so ground the brand folder on another reason.; The marketplace hand stays unnamed. Say who writes `.claude-plugin/marketplace.json`, and when it runs.; `stub.js` writes the stub's own files, so the reader lands on the wrong hand.; The brand folder's reader carries two names, the build and the install script. Use one.; The copy road lets `src/extension/icon.svg` drift. Name what holds it in step with its source."
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
group: the-tree-names-its-things
process: [[spec/processes/standard]]
process_hash: 838dd6d003506639
record:
  - step: design/draft
    hand: box d42624a67d18a8 · claude-code
    hash_before: ad522192f4a8f0c4c092881fdaccd4ef723c3d93
    hash_after: ad522192f4a8f0c4c092881fdaccd4ef723c3d93
  - step: design/review
    hand: box d42624a67d18a8 · claude-code · helper-2
    hash_before: ed1616d0e2e213d38b6bc58d8c5cd95f11033dce
    hash_after: ed1616d0e2e213d38b6bc58d8c5cd95f11033dce
    returns: 1
    why: "The four asked answers stand: the marketplace name, the zero cost, the icon path, the dotted folder.; The cited anchor stands. `spec/design_output/level0.md` carries the heading, and it measures the tools keeping `level0`.; The count drifts. `grep -rl mcp__level0` answers 30 today, and the draft writes 29.; The draft's own file joined that list. Name the command, and drop both numbers.; The config claim reads other than the tree. The stop door reads `spec/config/stop`, and Vale reads `spec/config/styles`.; A projection writes `spec/config/styles/VoiceParagraph`, so that folder stands as a target too.; Ground `spec/config/brand` on the folder a door reads, and say which door reads it.; The icon projection wants a shape. `projection.js` holds three shapes, and a copy of an svg fits none.; The table names `brandOf` the writer of three fields. Today `brandOf` feeds the `vehicle.json` record name alone.; `.claude-plugin/marketplace.json` carries a literal name. Name who rewrites it, and when.; The lint reads the ticket clean."
  - step: design/draft
    hand: box d42624a67d18a8 · claude-code
    hash_before: 26590a5e95246ff66192a37104991e9a7a9c976b
    hash_after: 26590a5e95246ff66192a37104991e9a7a9c976b
  - step: design/review
    hand: box d42624a67d18a8 · claude-code · helper-4
    hash_before: a5eaededdfba7305152b8bec5f240d31067e48d8
    hash_after: a5eaededdfba7305152b8bec5f240d31067e48d8
    returns: 2
    why: Two findings of the last review stand open, and two new faults join them.; The count drift goes. The draft names `grep -rl mcp__level0` and carries a count nowhere.; The reader rows read true. `stop.js` reads `spec/config/stop`, and `vale.js` reads `spec/config/styles`.; The shape claim reads true. `projection.js` holds `COMMANDS`, `PARAGRAPH` and `STYLE`.; The `brandOf` row reads true. `stub.js` hands it to `linkOf`, which writes the `vehicle.json` name.; The anchor stands, the slug table follows its own rule, and the lint reads the ticket clean.; One reader a folder reads other than the tree. `cli.js` reads three folders under `spec/config/styles`.; A projection writes `spec/config/styles/VoiceParagraph`, so ground the brand folder on another reason.; The marketplace hand stays unnamed. Say who writes `.claude-plugin/marketplace.json`, and when it runs.; `stub.js` writes the stub's own files, so the reader lands on the wrong hand.; The brand folder's reader carries two names, the build and the install script. Use one.; The copy road lets `src/extension/icon.svg` drift. Name what holds it in step with its source.
  - step: design/person-1
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: 9ec37964b86bf4ab2bcbee86f06a646ed2388179
    hash_after: 9ec37964b86bf4ab2bcbee86f06a646ed2388179
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

## person-1

<!-- answers the question the engine asks -->

### answer

The owner answers each open finding, and one of them turns a fault into the point.

| the finding | the owner's answer |
|---|---|
| the folder claim reads other than the tree | ask whether the claim earns its place, and cut it where it does not |
| the marketplace hand stays unnamed | name it where the reader acts on it, and leave it out where they do not |
| the brand folder's reader carries two names | the install script, and the word build goes |
| the copy lets the icon drift | a vehicle takes an icon of its own, so the drift is the point |

The icon this tree ships stands as an initial, so a fresh vehicle draws something. A vehicle changes it, and nothing holds the two in step. So the copy road takes the ticket, and the redraft says the drift is what a vehicle wants.

The owner rules on the voice besides. A reader wants what they act on, and a mechanism belongs in a rationale. So a draft states what a hand does next, points at the note holding the rest, and asserts nothing about a thing it leaves alone.

## draft

<!-- writes the approach the ask calls for -->

### approach

The brand reaches the marketplace and leaves the plugin name alone.

[[spec/design_output/level0#a-stub-names-its-vehicle]] already measured this road. A stub names the vehicle's folder as a marketplace, enables `level0@<brand>`, and the tools keep the name `level0`. So the brand parts two vehicles at the marketplace, and the plugin name carries no weight it already carries.

| the name | what it reads after | who writes it today |
|---|---|---|
| `marketplace.json` name | the brand | nobody, and the file carries a literal |
| `marketplace.json` owner name | the brand | nobody, and the file carries a literal |
| `plugin.json` author name | the brand | nobody, and the file carries a literal |
| `plugin.json` name | `level0` | nobody, and it stands |
| the enabled id | `level0@<brand>` | nobody, and this ticket writes it |

`brandOf` in the vehicle library answers the folder name, and `stub.js` writes it into the vehicle record alone. So the change takes that one answer to the four rows above it, and the third column reads a hand where it reads nobody today.

The cost for the tool names is nothing, and every file naming a tool stands as it is. `grep -rl mcp__level0` answers which, and a draft stamping the brand on the plugin name moves every one. It buys a parting the marketplace already gives.

The icon stands at `spec/config/brand/icon.svg`. Each folder under `spec/config` answers to one reader, and the brand takes a folder of its own:

| the folder | the reader |
|---|---|
| `stop` | `stop.js` |
| `styles` | `vale.js` |
| `brand` | the build, which carries the icon to the extension |

`src/extension/icon.svg` stands as a tracked file today, and `package.json` names it. Two roads carry the brand's icon there:

| the road | what it costs |
|---|---|
| the build copies the file | one line in the install script, and the target stays tracked |
| a projection writes it | a fourth shape in `projection.js`, which handles three and copies no image |

The first road takes this ticket, because the second asks for a shape the projection lacks.

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

fail

- Two findings of the last review stand open, and two new faults join them.
- The count drift goes. The draft names `grep -rl mcp__level0` and carries a count nowhere.
- The reader rows read true. `stop.js` reads `spec/config/stop`, and `vale.js` reads `spec/config/styles`.
- The shape claim reads true. `projection.js` holds `COMMANDS`, `PARAGRAPH` and `STYLE`.
- The `brandOf` row reads true. `stub.js` hands it to `linkOf`, which writes the `vehicle.json` name.
- The anchor stands, the slug table follows its own rule, and the lint reads the ticket clean.
- One reader a folder reads other than the tree. `cli.js` reads three folders under `spec/config/styles`.
- A projection writes `spec/config/styles/VoiceParagraph`, so ground the brand folder on another reason.
- The marketplace hand stays unnamed. Say who writes `.claude-plugin/marketplace.json`, and when it runs.
- `stub.js` writes the stub's own files, so the reader lands on the wrong hand.
- The brand folder's reader carries two names, the build and the install script. Use one.
- The copy road lets `src/extension/icon.svg` drift. Name what holds it in step with its source.

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
