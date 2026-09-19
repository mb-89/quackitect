---
kind: [[ticket]]
state: open
urgent: true
step: implement/reflect
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
  - step: design/draft
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: 19e5c998e3245e7941be1a1cda89ecbdd85e16d6
    hash_after: 19e5c998e3245e7941be1a1cda89ecbdd85e16d6
  - step: design/review
    hand: box 0eb9ad6feedf · claude-code-remote · helper-7
    hash_before: 5bdb114d4b7957217d9b5838a641170df02bb9a2
    hash_after: 5bdb114d4b7957217d9b5838a641170df02bb9a2
    returns: 3
    why: "Three faults stand: one from the last review, and two the redraft brings.; The four asked answers stand: the marketplace name, the zero cost, the icon path, the dotted folder.; The count drift goes, and the draft names `grep -rl mcp__level0` alone.; The anchor stands, and `spec/design_output/level0.md` measures the tools keeping `level0`.; The marketplace rows read true. `RUNME.sh` runs `install.sh` ahead of `cli.js`.; The `brandOf` row reads true. `stub.js` hands it to `linkOf`, which writes the `vehicle.json` name.; The brand folder carries one reader now, and the lint reads the ticket clean.; The enabled id row stands open. `stub.js` writes `.claude/settings.json` through `settingsOf`.; No file in this tree writes `enabledPlugins`. Name the hand that writes the id, or cut the row.; The icon write reaches no vehicle. Git tracks `src/extension/icon.svg`, so every copy carries it.; So `spec/config/brand/icon.svg` reaches nothing. Say which hand reads it.; `plugin.json` carries `author.name`, which reads the folder name. Give it a row in the table."
  - step: design/draft
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: 902089cf410d50427be4e46c4a3cc31d196fdfc7
    hash_after: 902089cf410d50427be4e46c4a3cc31d196fdfc7
  - step: design/review
    hand: box 0eb9ad6feedf · claude-code-remote · helper-9
    hash_before: bfcfe3ac7fe5b0c0f61cfb5376e5daa0344806b6
    hash_after: bfcfe3ac7fe5b0c0f61cfb5376e5daa0344806b6
  - step: implement/tests-red
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: a0b3f6e35ac3951e5ae556c8198f977ea491cec2
    hash_after: a0b3f6e35ac3951e5ae556c8198f977ea491cec2
    answered:
      - name: tests
        exit: 1
        said: assertion, 8 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: cc4c08e6ce89e901253a013c251b13c6ed35a72d
    hash_after: cc4c08e6ce89e901253a013c251b13c6ed35a72d
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: c7560d1f227ed2b87a8024de4ff0d8a222d70428
    hash_after: c7560d1f227ed2b87a8024de4ff0d8a222d70428
    answered:
      - name: tests
        exit: 0
        said: green, 8 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: The rules pass.
  - step: verdict
    hand: box 0eb9ad6feedf · claude-code-remote · helper-14
    hash_before: 208019661194d2b0e9ac259c59b5cf9b52563f1b
    hash_after: 208019661194d2b0e9ac259c59b5cf9b52563f1b
    returns: 1
    why: "| the question reviewing asks | the answer |; |---|---|; | does the branch do what the ask asks | the four answers stand, and the code carries each one |; | is what the diff touches beyond the ask trivial | yes, every hunk lands in a file the ask names |; | what does `./RUNME.sh check` answer | 0, with the server standing |; | does a retro stand in the handback | no, `HANDOVER.md` leaves this ticket at `design/review` |; | does every rule the change adds carry a case | the three pure names, yes. `stamps` and the refusal, no |; | does a case feed the rule something bad | `shimSettings` takes a broken file. The empty brand meets no case |; TL;DR:; The stamp writes nothing in this tree, and every `mcp__level0` tool keeps its name.; `./RUNME.sh check` answers 0, and the eight cases pass.; The icon lands. Git ignores the path `src/extension/package.json` names, and the install script writes it.; A folder name outside `a-z0-9` slugs to an empty brand, and three hands take it.; `stamps` reaches the disk door, and no case hands it a fake.; The findings, one a line:; `brandOf` answers an empty string for a folder name outside `a-z0-9`.; `stub.js` hands that string to `linkOf`, so `vehicle.json` records an empty name.; The shim reads that name, and its clone path drops the folder it looks for.; `shimSettings` then keys a marketplace on the empty string, and enables `level0@`.; The draft says an empty name fails the stub. `brand.js` alone refuses it.; That refusal stands under the main block, so a case reaches it nowhere.; `stamps` takes the disk door as an argument, and `src/doors/fake/disk.js` drives it nowhere.; So no case reads the two branded files, and no case reads the icon write.; The comments point at this ticket in four files, where the `checked` line names one chapter.; What the agent needs:; | number | need | status |; |---|---|---|; | 1 | an empty brand refuses where `stub.js` writes the record | open |; | 2 | a case feeds a folder name outside `a-z0-9` to that refusal | open |; | 3 | a case drives `stamps` off `src/doors/fake/disk.js` | open |; | 4 | the `checked` line of implement/change names where each comment points | open |; | 5 | the verdict hand reads every hunk again | open |"
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

The brand reaches the marketplace name, and the plugin name stands.

[[spec/design_output/level0#a-stub-names-its-vehicle]] measures this road. A
stub names the vehicle's folder as a marketplace, enables `level0@<brand>`, and
the tools keep the name `level0`. So the marketplace name is the name parting
two vehicles under one client, and the brand reaches it.

| the name | what it reads after | who writes it |
|---|---|---|
| the marketplace name | the brand | the install script |
| the marketplace owner name | the brand | the install script |
| the plugin's author name | the brand | the install script |
| the plugin name | `level0` | nobody, and it stands |
| the stub's enabled id | `level0@<brand>` | the shim |

RUNME calls the install script before it calls the command line, so those names
answer the folder before a session reads them. A shell script imports nothing,
so the install script hands the edit to a node script beside it.

Git tracks the marketplace file and the plugin file alike. It shows the write
where the folder name and the standing name part. In this tree they agree, and
a vehicle under another folder name takes the stamp on its first run.

The shim resolves the vehicle on every stub command, and `vehicle.json` hands
it the brand. So the shim writes the marketplace and the enabled id where the
path belongs:

| the file | what the shim writes into it |
|---|---|
| `.claude/settings.local.json` | the vehicle's folder under `extraKnownMarketplaces`, and `level0@<brand>` under `enabledPlugins` |

That file stands outside git, because the vehicle's path differs per box.

The cost for the tool names is nothing, and every file naming a tool stands as
it is. `grep -rl mcp__level0` answers which files those are. A draft stamping
the brand on the plugin name moves every one, and buys a parting the
marketplace already gives.

The icon stands at `spec/config/brand/icon.svg`, and a vehicle draws its own
there. `spec/config` holds what a tool reads off the tree, and the install
script reads the brand folder.

| the file | who owns it |
|---|---|
| `spec/config/brand/icon.svg` | the vehicle, which draws the mark it wears |
| `src/extension/icon.svg` | the install script, which writes it on every run, and git ignores it |

So one icon stands, and a vehicle changing it changes what the extension wears.
Two vehicles wear two marks, and nothing holds those two in step.

`brandOf` answers the vehicle's folder name, and a marketplace name takes no
dot. So `brandOf` slugs what it reads. It lowers the case, turns each run of
characters outside `a-z0-9` into a hyphen, and cuts a hyphen off each end.

| the folder | what `brandOf` answers |
|---|---|
| `quackitect` | `quackitect` |
| `my.app` | `my-app` |
| `Acme Tools` | `acme-tools` |
| `.hidden` | `hidden` |

A folder slugging to an empty name fails the stub, and the refusal names the
folder it read. `stub.js` hands `brandOf` to `linkOf`, which writes the
`vehicle.json` name, so the shim reads the slug there.

## review

<!-- reads the approach against the ask -->

### verdict

pass

- The three faults of the last review close, and the design goes to the implement.
- The four asked answers stand: the marketplace name, the zero cost, the icon path, the dotted folder.
- The enabled id row names the shim, and the cited anchor carries the same write.
- The shim reads the brand off `vehicle.json`, which `stub.js` writes through `brandOf` and `linkOf`.
- The icon row stands. `src/extension/package.json` names `icon.svg`, so the install write feeds the sidebar.
- The author row stands. `plugin.json` carries `author.name`, reading the folder name today.
- The marketplace rows read true. `RUNME.sh` runs `install.sh` ahead of `cli.js`.
- The anchor stands, and `spec/design_output/level0.md` measures the tools keeping `level0`.
- The slug table follows its own rule, and the bridgehead builds the clone path off that name.
- The settings block restates the anchor beside it. The implement holds one wording, at the anchor.
- The lint reads the ticket clean.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

    ./RUNME.sh branch test test/level0/brand.test.js

### seen

`test/level0/brand.test.js` drives the three things the approach lands, and
each case fails on its own assertion:

| the case | what it reads today |
|---|---|
| a folder name answers the slug a marketplace takes | `brandOf` answers `my.app` where the slug reads `my-app` |
| a folder carrying no letter and no digit answers an empty brand | it answers the dots it reads |
| the brand reaches the marketplace name and its owner | `brandedJson` stands undefined |
| the brand reaches the plugin's author and leaves the plugin name alone | the same |
| a file the brand reaches nowhere comes back as it stands | the same |
| the shim names the vehicle a marketplace, and enables the brand's plugin | `shimSettings` stands undefined |
| the shim keeps every key the settings already hold | the same |
| settings the disk holds in no readable shape answer a fresh pair | the same |

The dotted folder surprises me. `brandOf` answers `...` for a folder of dots,
and a marketplace under that name reaches no plugin. So the empty answer wants
a refusal beside it, which `stub.js` carries at the one place the brand lands.

The two new names stand pure, so a case reaches neither disk nor clock. The
install script and the shim read a file and write one, and the shell carries
that half. `test/contract` holds what a shell does.

### checked

- the change touches no file the ask leaves out. One case file joins, and it drives the library the ask names.
- every door the change reaches has a fake. The cases reach no door, and read a string the caller hands them.
- a comment names the approach the change implements. Each case points at this ticket.

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

    ./RUNME.sh lint src/scripts/brand.js .claude/skills/level0/lib/vehicle.js src/scripts/install.sh src/stub/RUNME.sh spec/design_output/vehicle.md

### checked

- the change touches no file the ask leaves out. The library, one script, the install script, the shim, the icon and the note the code points at.
- every door the change reaches has a fake. The two new names stand pure, and `brand.js` takes the disk door as an argument.
- a comment names the approach the change implements. Each one points at [[spec/design_output/vehicle#the-brand-a-vehicle-stamps]].

## tests-green

<!-- makes the tests pass -->

### tests

    ./RUNME.sh branch test test/level0/brand.test.js

### check

    ./RUNME.sh check

### says

A vehicle stamps its folder name on the marketplace, and every `mcp__level0`
tool keeps the name it carries.
[[spec/design_output/vehicle#the-brand-a-vehicle-stamps]] holds the rule.

| where | what it does |
|---|---|
| `brandOf` | slugs the folder name, so a dot and a space reach a marketplace |
| `brandedJson` | takes the brand to an owner, an author, and a name beside an owner |
| `shimSettings` | names the vehicle a marketplace, and adds `level0@<brand>` to what stands |
| `src/scripts/brand.js` | runs the first two over the two files, and writes the icon |
| `src/scripts/install.sh` | calls it, ahead of every verb |
| `src/stub/RUNME.sh` | calls the third, into the settings file git ignores |

The icon moves to `spec/config/brand/icon.svg`, and git ignores the path
`src/extension/package.json` names. So a vehicle draws one mark, and the
install script carries it where the extension reads it.

The slug changes what `vehicle.json` records for a folder carrying a dot. The
shim builds its clone path off that same name, so the two stay in step and the
lookup stands.

In this tree the brand answers the name the marketplace already holds, so the
stamp writes nothing. A vehicle under another folder name takes it on the
first run.

### checked

- the change touches no file the ask leaves out. The library, one script, the install script, the shim, the icon and the note.
- every door the change reaches has a fake. `brand.js` takes the disk door as an argument, and the two new names stand pure.
- a comment names the approach the change implements. Each one points at the chapter holding the rule.

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

- .claude-plugin/marketplace.json
- .claude/skills/level0/.claude-plugin/plugin.json
- .claude/skills/level0/lib/vehicle.js
    - .gitignore
- HANDOVER.md
- RUNME.sh
    - spec/config/brand/icon.svg
- spec/design_output/vehicle.md
- spec/guidance/code/testing.md
- spec/guidance/review/reviewing.md
- spec/tickets/the-brand-names-the-plugin.md
- src/doors/disk.js
- src/extension/package.json
- src/scripts/brand.js
- src/scripts/install.sh
- src/scripts/stub.js
- src/stub/RUNME.sh
- test/contract/install.test.js
- test/contract/sidebar.test.js
- test/level0/brand.test.js

## verdict

fail

| the question reviewing asks | the answer |
|---|---|
| does the branch do what the ask asks | the four answers stand, and the code carries each one |
| is what the diff touches beyond the ask trivial | yes, every hunk lands in a file the ask names |
| what does `./RUNME.sh check` answer | 0, with the server standing |
| does a retro stand in the handback | no, `HANDOVER.md` leaves this ticket at `design/review` |
| does every rule the change adds carry a case | the three pure names, yes. `stamps` and the refusal, no |
| does a case feed the rule something bad | `shimSettings` takes a broken file. The empty brand meets no case |

TL;DR:

- The stamp writes nothing in this tree, and every `mcp__level0` tool keeps its name.
- `./RUNME.sh check` answers 0, and the eight cases pass.
- The icon lands. Git ignores the path `src/extension/package.json` names, and the install script writes it.
- A folder name outside `a-z0-9` slugs to an empty brand, and three hands take it.
- `stamps` reaches the disk door, and no case hands it a fake.

The findings, one a line:

- `brandOf` answers an empty string for a folder name outside `a-z0-9`.
- `stub.js` hands that string to `linkOf`, so `vehicle.json` records an empty name.
- The shim reads that name, and its clone path drops the folder it looks for.
- `shimSettings` then keys a marketplace on the empty string, and enables `level0@`.
- The draft says an empty name fails the stub. `brand.js` alone refuses it.
- That refusal stands under the main block, so a case reaches it nowhere.
- `stamps` takes the disk door as an argument, and `src/doors/fake/disk.js` drives it nowhere.
- So no case reads the two branded files, and no case reads the icon write.
- The comments point at this ticket in four files, where the `checked` line names one chapter.

What the agent needs:

| number | need | status |
|---|---|---|
| 1 | an empty brand refuses where `stub.js` writes the record | open |
| 2 | a case feeds a folder name outside `a-z0-9` to that refusal | open |
| 3 | a case drives `stamps` off `src/doors/fake/disk.js` | open |
| 4 | the `checked` line of implement/change names where each comment points | open |
| 5 | the verdict hand reads every hunk again | open |

## checked

- every fact the change adds stands in one place. The chapter owns the slug rule, and six code sites point at a note or this ticket. The icon pair stands in `brand.js`, and the chapter names it once.

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
