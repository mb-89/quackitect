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
group: the-bridge-keeps-transport
process: [[spec/processes/standard]]
process_hash: 838dd6d003506639
step: design/draft
record:
  - step: design/draft
    hand: box fa49097ce66c · claude-code-remote
    hash_before: cdf685ad92d873867f538ae2cd8c5320702067f9
    hash_after: cdf685ad92d873867f538ae2cd8c5320702067f9
  - step: design/review
    hand: box fa49097ce66c · claude-code-remote · helper-4
    hash_before: 75a12d571cbebf0c8ff62882a658e60ce6702e0e
    hash_after: 75a12d571cbebf0c8ff62882a658e60ce6702e0e
    returns: 1
    why: "The four moves and the swap cost hold, and two claims under them miss the code.; Name `ownerDoor` and `marksStale` beside `freshens`, because `src/bridge/write.js` runs all three off a write event.; Say where those two land, so the engine keeps the rule the draft sets.; Answer the third line of the ask: name the files moving out of `src/scripts`.; The draft names the `cli-` and `pull-` groups alone.; The `retro-`, `work-` and `guidance-` groups share that shape, so name each one too.; Sort `queue.js`, `group.js` and `landed.js`, which each answer a question about the tree.; Each of those three stands outside the verb table in `cli.js`.; Give `goModulesOf` a disk handle in the plan, because it takes path strings alone today.; **What holds.**; `./RUNME.sh check` exits 0 on this branch.; `goModulesIn` and `goModulesOf` each stop one level under `src`, so the swap move drops the module.; `status.js` and `tense.js` export readers alone, which matches the engine rule.; The draft names the open second line of the ask, and leaves the door cut to a later ticket.; The draft commit touches the ticket file alone.; A retro stands absent from the handback, which suits a ticket at design review.; `./RUNME.sh branch review` reports a 1 from a Vale timeout, which this box causes."
  - step: design/draft
    hand: box fa49097ce66c · claude-code-remote
    hash_before: 8782253b9cb47ebe4b53d397e020f3507b149a2e
    hash_after: c32f9c806e0f8e5fb69f49ee9a353f6ba4cb3fae
  - step: design/review
    hand: box fa49097ce66c · claude-code-remote · helper-5
    hash_before: dde7a5fa787dfe812b8bf52673a72657f58866a6
    hash_after: dde7a5fa787dfe812b8bf52673a72657f58866a6
    returns: 2
    why: "The rule, the four moves, the projection cut and the swap cost hold, and three claims miss the code.; `guidance-` serves `branch guidance`, which `src/scripts/work.js` wires as a row of the branch verb.; Correct that row, because the group table names `standing` today.; `freshens` and the session start call `projectionsHere` and `sourcesOf`.; `ownerDoor` and `marksStale` read the `box.projections` and `box.sources` fields alone.; Correct the caller column of the projection cut table to match those two lines.; `hand.js`, `stand.js` and `trust.js` stand outside the five groups and the verb table.; `spawn.js`, `unblock.js`, `editor.js` and `process.js` stand outside both as well.; Sort each of those, because the third ask line covers every file under `src/scripts`.; Name the folder taking `queue.js`, `group.js` and `landed.js`, which the mover table leaves open.; **What holds.**; `./RUNME.sh check` exits 0 on this branch, and `./RUNME.sh branch review` exits 0 with the check passing.; `status.js` and `tense.js` export readers alone, which matches the engine rule.; `goModulesIn` lists dirs one level under `src`, and `goModulesOf` matches one level by regex.; `src/bridge/write.js` runs `ownerDoor` as a check and `marksStale` after a write, as the cut table says.; `src/bridge/server.js` runs `freshens` inside `decide`, so the bridge keeps it.; The draft names the open second line of the ask, and leaves the door cut to a later ticket.; The two draft commits touch the ticket file alone, which leaves rules and tests to implement.; A retro stands absent from the handback, which suits a ticket at design review.; **What the last verdict asks.**; The draft answers the finding on `ownerDoor`, `marksStale` and `freshens`.; The draft answers where those two land: both stay in the bridge.; The draft answers the finding naming the `retro-`, `work-` and `guidance-` groups.; The draft answers the finding sorting `queue.js`, `group.js` and `landed.js`.; The draft answers the finding giving `goModulesOf` a disk handle.; The third ask line stands open, because the draft reaches three files of many."
  - step: design/draft
    hand: box fa49097ce66c · claude-code-remote
    hash_before: f42ec376c5f0a1d33c5f0257736add0597a3a8bb
    hash_after: 0b9bf9d00059a57c9b38deb8dbb3c5a98f385a08
  - step: design/review
    hand: box fa49097ce66c · claude-code-remote · helper-6
    hash_before: 0439d8a2e5376cfee54543ee5908a77188d99fe5
    hash_after: 0439d8a2e5376cfee54543ee5908a77188d99fe5
    returns: 3
    why: The rule, the four moves, the projection cut and the swap cost hold, and the third ask line stands open.; Eight files under `src/scripts` stand outside the five groups and outside every table.; Name `graph.js`, `probe.js`, `stub.js` and `ticket.js` there.; Name `tools.js`, `tui.js`, `vehicle.js` and `voice.js` there too.; Add a row saying a file named for its own verb stands, which sorts seven of the eight.; Give `tools.js` a row of its own, because four files outside the folder read it.; `src/doors/biome.js` and `src/doors/vale.js` read it, as `src/bridge/guidance.js` and `src/bridge/findings.js` do.; That shape matches `group.js`, which the draft sends to the engine for the same reason.; The stay table says five files and lists eight across six rows, so correct the count.; **What holds.**; `./RUNME.sh check` exits 0 on this branch, and `./RUNME.sh branch review` exits 0.; `status.js` and `tense.js` export readers alone, which matches the engine rule.; `src/swap` holds a `go.mod`, and `goModulesIn` lists dirs one level under `src`.; `goModulesOf` matches a test path by regex one level down, so the swap move drops the module.; `src/bridge/write.js` runs `ownerDoor` as a check and `marksStale` after a write.; `ownerDoor` reads `box.projections`, and `marksStale` reads `box.sources`, as the cut table says.; `freshens` runs inside `decide`, and `opensSession` fills those two fields at the session start.; `group.js` reaches `src/bridge/bash.js` and `src/bridge/stop.js`, so the engine suits it.; `work-stands.js` stands, so `stand.js` takes a name of its own under that prefix.; `guidance-verb.js` serves `branch guidance`, which `src/scripts/work.js` wires as a branch row.; The draft names the open second line of the ask, and leaves the door cut to a later ticket.; The draft commits touch the ticket file alone, which leaves rules and tests to implement.; A retro stands absent from the handback, which suits a ticket at design review.; **What the last verdict asks.**; The draft answers the `guidance-` row, which now names `branch guidance` and its wiring.; The draft answers the caller column of the projection cut table, and the code matches it.; The draft answers the finding sorting `hand.js`, `stand.js` and `spawn.js`.; The draft answers the finding sorting `unblock.js`, `editor.js`, `process.js` and `trust.js`.; The draft answers the folder taking `queue.js`, `group.js` and `landed.js`.; The third ask line stands open for the eight files above, which two rows close.
---

# Ask

Each piece of work stands in the folder owning its topic, where a reader looks for it.

The bridge grows engine work, and src/scripts holds whatever fits nowhere else.

- Status, projection, the tense reader and swap stand under `src/engine`.
- The bridge holds transport alone.
- Every file under `src/scripts` names the topic it serves, and the rest move out.
- `./RUNME.sh check` exits 0 after the moves.

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

- one rule sorting a file into its folder
- four moves the ask names, and one of them cuts a file in two
- every file under `src/scripts` sorted, by a prefix or by a move
- one change the swap move forces under the Go module reader

**The rule.** A file under `src/bridge` answers an event off the wire. A file
under `src/engine` answers a question about the tree, with no event standing. A
file under `src/scripts` serves one verb of the command line, and its name says
the verb.

| the folder | what a file there does | what it imports |
|---|---|---|
| `src/bridge` | takes an event and answers the hook | the engine, and the doors |
| `src/engine` | reads the tree and answers a question | the doors alone |
| `src/scripts` | serves a verb a person types | either of the two |

**The four moves.** Each lands as its own commit, and the check decides each.

| what moves | from | to |
|---|---|---|
| status | `src/bridge/status.js` | `src/engine/status.js` |
| the tense reader | `src/bridge/tense.js` | `src/engine/tense.js` |
| swap | `src/swap` | `src/engine/swap` |
| the projection's readers | `src/bridge/projection.js` | `src/engine/projection.js` |

`status.js` and `tense.js` export readers alone, so those two rename whole.

**The projection cuts in two.** Three of its exports run off an event, and the
rule holds each of the three in the bridge.

| the export | what reaches it | where it lands |
|---|---|---|
| `ownerDoor` | the write door, as one of its checks | the bridge |
| `marksStale` | the write door, after a write | the bridge |
| `freshens` | `decide`, on every event | the bridge |
| `projectionsHere` | `freshens`, and `opensSession` | the engine |
| `sourcesOf` | the same two | the engine |

`ownerDoor` and `marksStale` read the fields `freshens` fills, so the two
readers reach them through the box.

So `src/bridge/projection.js` keeps the three and imports the two, and
`src/engine/projection.js` holds the reading. A reader wanting the whole
projection in one folder reads a door answering an event, which the rule puts
in the bridge.

**What swap costs.** `goModulesIn` lists a module as a folder holding `go.mod`
straight under `src`, and `goModulesOf` reads the same one level. A module at
`src/engine/swap` reads as none. Its tests leave the battery, and nothing says
so.

| what changes | so that |
|---|---|
| `goModulesIn` walks a folder below `src` too | the battery finds a module either way |
| `goModulesOf` takes a disk handle beside the paths | it reads the folder holding `go.mod` |
| a case drives both over a module one level down | the fault stays fixed |

`goModulesOf` reads path strings alone today, so the plan threads it the handle
its caller already holds.

**The command line.** The third line of the ask names every file under
`src/scripts`. Five groups there carry a topic in the name, and each serves one
verb already.

| the group | the verb it serves |
|---|---|
| `cli-` | the command line itself, and `check` |
| `pull-` | `ticket pull` |
| `retro-` | `retro` |
| `work-` | `branch` |
| `guidance-` | `branch guidance`, which `work.js` wires |

Every other file there sorts one of two ways. A file serving one verb takes
that verb's prefix, and a file the whole tree reads goes to the engine.

| what takes a prefix | the verb it serves | its name |
|---|---|---|
| `ask-lint.js` | `ticket open` | `ticket-ask-lint.js` |
| `spawn.js` | `ticket pull` | `pull-spawn.js` |
| `landed.js` | `ticket pull` | `pull-landed.js` |
| `branch-usage.js` | `branch` | `work-usage.js` |
| `test-verb.js` | `branch test` | `work-test.js` |
| `review.js` | `branch review` | `work-review.js` |
| `unblock.js` | `branch unblock` | `work-unblock.js` |
| `stand.js` | `branch list` | `work-free.js` |
| `go-tests.js` | `check` | `cli-go.js` |
| `viewer.js` | `tui` | `tui-build.js` |

`work-stands.js` stands already, so `stand.js` takes a name of its own under
the same prefix.

| what goes to the engine | what it answers |
|---|---|
| `group.js` | a group, read off its ticket |
| `queue.js` | the score weighing a ticket against the rest |
| `hand.js` | the hand a step stands in |
| `tools.js` | where every tool stands on this box |

Each of those reads the tree for every caller. `group.js` reaches the bridge
through the command door and the stop door. `tools.js` reaches the two linter
doors and two doors of the bridge. So a script folder is the wrong home for
either.

A file carrying the name of its own verb stays where it stands, and its name
says its topic already:

| what stays | the verb it is |
|---|---|
| `graph.js` | `graph` |
| `probe.js` | `probe` |
| `stub.js` | `stub` |
| `ticket.js` | `ticket` |
| `tui.js` | `tui` |
| `vehicle.js` | `vehicle` |
| `voice.js` | `voice` |

These stay as well, because each one runs outside the verb table:

| what stays | who runs it |
|---|---|
| `precommit.js`, `prepush.js` | git, at the commit and the push |
| `trust.js`, `install.sh` | the setup, before a session starts |
| `copilot.js` | a cloud box, as its entry point |
| `editor.js` | the install, and the doctor |
| `serve.js` | the bridgehead, and the `serve` verb |
| `process.js` | `mint`, which `cli.js` wires |

**What the ask leaves open.** The second line of the ask wants the bridge
holding transport alone. The moves above leave it holding the doors: the write
door, the stop door, the answer door and the rest.

- an event runs a door, so the rule above counts every door as transport
- the line reads as met where each door keeps its wiring and hands its thinking down
- the bridge files past these each want that cut, the way the projection takes one
- this ticket moves what the first and third lines name, and mints nothing else

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

fail

- The rule, the four moves, the projection cut and the swap cost hold, and the third ask line stands open.
- Eight files under `src/scripts` stand outside the five groups and outside every table.
- Name `graph.js`, `probe.js`, `stub.js` and `ticket.js` there.
- Name `tools.js`, `tui.js`, `vehicle.js` and `voice.js` there too.
- Add a row saying a file named for its own verb stands, which sorts seven of the eight.
- Give `tools.js` a row of its own, because four files outside the folder read it.
- `src/doors/biome.js` and `src/doors/vale.js` read it, as `src/bridge/guidance.js` and `src/bridge/findings.js` do.
- That shape matches `group.js`, which the draft sends to the engine for the same reason.
- The stay table says five files and lists eight across six rows, so correct the count.

**What holds.**

- `./RUNME.sh check` exits 0 on this branch, and `./RUNME.sh branch review` exits 0.
- `status.js` and `tense.js` export readers alone, which matches the engine rule.
- `src/swap` holds a `go.mod`, and `goModulesIn` lists dirs one level under `src`.
- `goModulesOf` matches a test path by regex one level down, so the swap move drops the module.
- `src/bridge/write.js` runs `ownerDoor` as a check and `marksStale` after a write.
- `ownerDoor` reads `box.projections`, and `marksStale` reads `box.sources`, as the cut table says.
- `freshens` runs inside `decide`, and `opensSession` fills those two fields at the session start.
- `group.js` reaches `src/bridge/bash.js` and `src/bridge/stop.js`, so the engine suits it.
- `work-stands.js` stands, so `stand.js` takes a name of its own under that prefix.
- `guidance-verb.js` serves `branch guidance`, which `src/scripts/work.js` wires as a branch row.
- The draft names the open second line of the ask, and leaves the door cut to a later ticket.
- The draft commits touch the ticket file alone, which leaves rules and tests to implement.
- A retro stands absent from the handback, which suits a ticket at design review.

**What the last verdict asks.**

- The draft answers the `guidance-` row, which now names `branch guidance` and its wiring.
- The draft answers the caller column of the projection cut table, and the code matches it.
- The draft answers the finding sorting `hand.js`, `stand.js` and `spawn.js`.
- The draft answers the finding sorting `unblock.js`, `editor.js`, `process.js` and `trust.js`.
- The draft answers the folder taking `queue.js`, `group.js` and `landed.js`.
- The third ask line stands open for the eight files above, which two rows close.

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
