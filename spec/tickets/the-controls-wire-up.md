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
group: the-tree-names-its-things
process: [[spec/processes/standard]]
process_hash: 838dd6d003506639
step: implement/tests-green
record:
  - step: design/draft
    hand: box d42624a67d18a8
    hash_before: 1647c00af456caf124ee2fed93df96603c59514f
    hash_after: 759f94974cf0dcc94b87f77a42f67104f875acc4
  - step: design/review
    hand: box d42624a67d18a8 · claude-code
    hash_before: 7b982e4f36e63a0e5076b054b970ac5ffcb2ad5d
    hash_after: 7b982e4f36e63a0e5076b054b970ac5ffcb2ad5d
    returns: 1
    why: The binding table holds. The three values each get a row, and the `pull <ticket>` column reads true against the ask.; Three notes read `engine.autonomy` three ways, and the draft picks one without naming the other two.; The schema's own `help` reads "How far the session goes on its own". That says nothing about what a session mints.; `spec/design_output/extension.md` line 98 reads "finish your own token", "start new tokens", "ideation".; The ask and the draft read it as notes, a group ticket and a loose ticket. An implementer following the draft writes code the extension note refuses.; Name which of the three stands, and say what the other two become.; `god` stands undefined. The draft gives it the row `queue` takes, so three values carry two behaviours.; `src/bridge/stop.js` line 244 reads `engine.binding` against `queue` alone, so `god` already falls outside the queue rule there.; So the draft's pull and the standing stop rule read `god` two ways. Say which one moves.; The draft says the mint refuses a kind the autonomy leaves out, and names no file. The verb stands at `src/scripts/cli.js` line 225.; `engine.autonomy` has no reader today, and `grep -rn autonomy --include=*.js src .claude` answers that.; The evidence field carries the two comments mint writes, above the table. Cut them, so the field reads as what a hand wrote.; The anchor holds. `The hand-out` stands at line 33 of the pull design output.
  - step: design/draft
    hand: box d42624a67d18a8 · claude-code
    hash_before: c44525874ec9225cb01b2e144e6b54a3c9d3e579
    hash_after: c44525874ec9225cb01b2e144e6b54a3c9d3e579
  - step: design/review
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: b4b4cf28dbcd31b637409aee8dac8f2debfb4c19
    hash_after: b4b4cf28dbcd31b637409aee8dac8f2debfb4c19
    returns: 2
    why: "| the question reviewing asks | the answer |; |---|---|; | does the approach answer the ask | for the binding, yes. The autonomy half stands cut, and the Ask still asks for it |; | is what the diff touches beyond the ask trivial | yes, the commit writes this ticket alone |; | what does `./RUNME.sh check` answer | 0, with the server standing |; | does every rule the approach adds carry a case | for the pull at `unbound`, yes. For the three stop rows, no |; | does every claim carry a proof | yes but one, and the `queue` row reads other than the tree |; TL;DR:; The autonomy cut holds. `grep -rn autonomy src .claude spec` answers nothing, so the draft matches the tree.; The stop table reads true. `queueWaits` reads `engine.binding`, and the three rows above it read none.; The anchor stands. `spec/design_output/config` carries The engine controls.; One row of the binding table reads other than the tree, and two things the approach adds carry no case.; The findings, one a line:; The `queue` row's `pull <ticket>` column reads other than the tree. `pull.js` refuses a named ticket there.; Its own comment says so, and [[spec/design_output/pull#the-hand-out]] carries the rule.; So the row says what the draft leaves standing, or the draft says that road moves too.; The Ask carries the autonomy table and its done_when line, and the approach cuts that half.; Cut both from the Ask, or write the owner's word on the drop into the Discussion.; The three stop rows standing down at `god` carry no case. Name one, beside the pull at `unbound`.; What the agent needs:; | number | need | status |; |---|---|---|; | 1 | the `queue` row reads the tree, or names the road it moves | open |; | 2 | the Ask drops the autonomy half, or the Discussion carries its word | open |; | 3 | the done_when names a case for the three stop rows at `god` | open |; | 4 | the review hand reads the approach again | open |"
  - step: design/draft
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: 281eb05784b3d6187c319ff32ad5b7c2cfbc9f93
    hash_after: 281eb05784b3d6187c319ff32ad5b7c2cfbc9f93
  - step: design/review
    hand: box 0eb9ad6feedf · claude-code-remote · helper-6
    hash_before: f14236bf90d974af82833d98b3b8243886900b9f
    hash_after: f14236bf90d974af82833d98b3b8243886900b9f
    returns: 3
    why: "| the question reviewing asks | the answer |; |---|---|; | does the approach answer the ask | for the pull, yes. The stop half names its rows short |; | is what the diff touches beyond the ask trivial | yes, the draft commit writes this ticket alone |; | what does `./RUNME.sh check` answer | 0 |; | does a retro stand in the handback | no, and the retro stands at the branch's close |; | does every rule the approach adds carry a case | yes, the done_when carries a line for each |; | does every claim read true | yes but one, and the gate sentence reads other than its table |; TL;DR:; The three needs of the last round land. The `queue` row, the Ask and the done_when each read true now.; The `queue` row matches `pull.js`, which refuses a named ticket there and names the queue.; The autonomy half stands out of the Ask, and the Discussion carries the call for the owner.; `engine.autonomy` reaches the schema, the config and the code nowhere, so the cut holds.; The gate sentence under the stop table reads other than the table above it.; The findings, one a line:; The gate `queueWaits` carries reads `queue`, so it stands down at `unbound` too.; A check taking that gate stands down at `unbound`, and the table above it reads refuses.; Write the gate as a read of `god`, so the `unbound` column holds.; The stop table leaves `no-stop-line` and `warnings-standing` out, and each holds a turn open.; Say what each does at `god`, because [[spec/design_output/config#the-engine-controls]] puts nothing in its refuses column.; The word mechanical takes in the owner's hold and `stop-hook-off`, which the sentence leaves standing.; What the agent needs:; | number | need | status |; |---|---|---|; | 1 | the gate sentence reads `god`, so the `unbound` column holds | open |; | 2 | the stop half says what `no-stop-line` and `warnings-standing` do at `god` | open |; | 3 | the sentence names the rows that move, beside the word mechanical | open |; | 4 | the review hand reads the approach again | open |"
  - step: design/draft
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: 452ca25609f3dc46820eea09ea8e58a520a5dc4a
    hash_after: 452ca25609f3dc46820eea09ea8e58a520a5dc4a
  - step: design/review
    hand: box 0eb9ad6feedf · claude-code-remote · helper-8
    hash_before: 40cc13de664b780fe5cdfe80aff576c91d14b820
    hash_after: 40cc13de664b780fe5cdfe80aff576c91d14b820
  - step: implement/tests-red
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: 747588d9afcfe8642682d40dc27bcc42add7a389
    hash_after: 747588d9afcfe8642682d40dc27bcc42add7a389
    answered:
      - name: tests
        exit: 1
        said: assertion, 6 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: de52afb1977d624b54f06728b1220d24d8921b95
    hash_after: de52afb1977d624b54f06728b1220d24d8921b95
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

`engine.binding` reaches the pull. At `unbound` and at `god` the plain pull hands out nothing, and `pull <ticket>` takes a named one.

Today the pull reads the binding for the queue alone. A person sets `unbound`, and the box keeps pulling.

- `./RUNME.sh branch test` passes a case where the plain pull at `unbound` answers wait
- `./RUNME.sh branch test` passes a case per stop check that stands down at `god`
- `./RUNME.sh check` answers 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

This ticket carries `engine.binding` alone. `engine.autonomy` stands nowhere in the schema, the config or the code, and the Ask now asks for the binding alone.

[[spec/design_output/config#the-engine-controls]] owns what each binding value means. This draft names where the code reads it, and restates none of it.

| control | who reads it today | who reads it after |
|---|---|---|
| `engine.binding` | the stop hook, for the queue rule, and the pull, for a named ticket | the pull's plain hand-out too |

The box the command line builds asks the config for each control, beside the
words and the counts it asks for already. So the pull reads one field of `it`,
and the config door stays the one reader of the file.

| binding | the plain pull | `pull <ticket>` |
|---|---|---|
| `queue` | hands out the next leaf | refuses, and names the queue |
| `unbound` | answers wait, and names the binding | hands out that ticket |
| `god` | answers wait, and names the binding | hands out that ticket |

The `queue` row stands as `pull.js` writes it today, and this ticket leaves that
road alone. The two rows under it are what it lands.

The stop hook stands half done already, and the table says which half:

| the check | at `queue` | at `unbound` | at `god` |
|---|---|---|---|
| `ticket-in-hand` | refuses | refuses | **stands down** |
| `group-in-hand` | refuses | refuses | **stands down** |
| `work-waiting` | refuses | refuses | **stands down** |
| `queue-waits` | refuses | stands down | stands down |

`queueWaits` reads the binding against `queue` today, so the last row holds.
The three rows above it read the binding nowhere. Each takes a gate of its own,
a read of `god`, so the `unbound` column stands as the table says.

`god` is the engine standing aside, so a check reading the engine's own work
stands down there. These do, and the done_when carries a case for each:

| the check | what it reads |
|---|---|
| `ticket-in-hand` | a hold, or an open private ticket |
| `group-in-hand` | a take with no hand-back |
| `work-waiting` | a todo, or a branch at `held` |
| `warnings-standing` | a refactorer wanting a hand |

Every other check reads something else, so the binding leaves it standing:

| the check | what it reads |
|---|---|
| `stop-hook-off` | `stop.enabled`, which a person sets |
| `owner-holds`, `owner-finishes` | the owner's hold |
| `chat-is-new` | the session log, on the opening turn |
| `no-stop-line` | the claim against the rules a stop names |
| `a-person-sits-here` | the box |
| `queue-waits` | the binding already, as its row above says |

## review

<!-- reads the approach against the ask -->

### verdict

pass

| the question reviewing asks | the answer |
|---|---|
| does the approach answer the ask | yes, the pull half and the stop half each land |
| is what the diff touches beyond the ask trivial | yes, the draft commits write this ticket alone |
| what does `./RUNME.sh check` answer | 0 |
| does a retro stand in the handback | no, and `branch review` names it at the branch's close |
| does every rule the approach adds carry a case | yes, the done_when carries a line for each |
| does every claim read true | yes, against `stop.js`, `pull.js` and the config chapter |

TL;DR:

- The three needs of the last round land, so this design output goes to implement.
- The gate reads `god`, so the `unbound` column of the stop table holds.
- The word mechanical stands cut, and two tables carry what it said.
- The two tables between them name every check `ranHere` holds.
- Each row's reading matches the function `ranHere` calls for that check.

The findings, one a line:

- The column table leaves `warnings-standing` out, and the table under it names that check standing down.
- The implement step takes its gate list from the table naming what stands down at `god`.
- The `queue` row matches `pull.js`, which refuses a named ticket there and names the queue.
- The box the command line builds carries `binding` already, so the pull reads one field of `it`.

What the agent needs:

| number | need | status |
|---|---|---|
| 1 | the implement step gates `warnings-standing` beside the other checks standing down | open |
| 2 | the branch's close writes the retro | open |

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

    ./RUNME.sh branch test test/level0/binding.test.js

### seen

`test/level0/binding.test.js` drives two names the doors call, and each case
fails on its own assertion:

| the case | what it reads today |
|---|---|
| the plain pull hands work out at the queue alone | `handsOut` stands undefined |
| a binding the config leaves unsaid hands work out | the same |
| the checks reading the engine's own work stand down at god | `standsDown` stands undefined |
| those same checks hold at the queue and at unbound | the same |
| every other check holds at god, because it reads something else | the same |
| the list names the four, and the stop door answers each of them | `ENGINE_CHECKS` stands undefined |

The last case is the one the review's open need asks for. It holds the list
against every name the stop door answers. So a check joining the door lands in
one list or the other, and the gate reaches `warnings-standing` beside the rest.

Both names stand pure, so a case reaches neither disk nor clock. The stop
door's own wiring reads the config through `asks`, and `stop-door.test.js`
drives that half over a fake box.

### checked

- the change touches no file the ask leaves out. One case file joins, and it drives the pull's route and the stop door.
- every door the change reaches has a fake. The cases reach no door, and read a string the caller hands them.
- a comment names the approach the change implements. Each case points at the chapter owning the binding.

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

    ./RUNME.sh lint src/bridge/stop.js src/bridge/server.js src/scripts/pull.js src/scripts/pull-route.js test/level0/binding.test.js

### checked

- the change touches no file the ask leaves out. The pull, its route, the stop door, the server's import and the cases.
- every door the change reaches has a fake. The two new names stand pure, and the stop door reads the config through `asks` as it did.
- a comment names the approach the change implements. Each site points at [[spec/design_output/config#the-engine-controls]].

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

The binding half of this ticket stands ready. A cloud box cut the autonomy half out of the Ask. `engine.autonomy` reaches no schema, no config and no code, and three notes read it three ways. A ticket of its own takes it where the owner wants it back, with one reading named. The owner reads this call at the merge.

A session runs under `engine.binding` at `queue` today, and the stop rule hands it work while a free ticket stands. So the `unbound` row of the draft is the one a person reaches for, and it is the row the draft gets right.
