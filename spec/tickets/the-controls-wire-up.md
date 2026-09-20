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
step: verdict
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
  - step: implement/tests-green
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: 51c04672c2119ea8019fb6d1a36549550defe2f3
    hash_after: 51c04672c2119ea8019fb6d1a36549550defe2f3
    answered:
      - name: tests
        exit: 0
        said: green, 6 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: The rules pass.
  - step: verdict
    hand: box 0eb9ad6feedf · claude-code-remote · helper-13
    hash_before: 626a33cbc0d7c0291ce442496afc630af45c4474
    hash_after: 626a33cbc0d7c0291ce442496afc630af45c4474
    returns: 1
    why: "| the question reviewing asks | the answer |; |---|---|; | does the branch do what the ask asks | the desk roads land, and a cloud pull on trunk hands out at `god` |; | is what the diff touches beyond the ask trivial | yes, the server hunk moves two names and drops a copy |; | what does `./RUNME.sh check` answer | 0, with the server standing |; | does a retro stand in the handback | no, and `branch review` names it at the branch's close |; | does every rule the change adds carry a case | the two pure names do, and the pull's own gate takes none |; | does a case feed the rule something bad | a case outside the tree does, and the tree holds none |; TL;DR:; The pull answers wait at `unbound` on a work branch and on trunk, with a free ticket standing.; `ENGINE_CHECKS` names the four the design output's table names, `warnings-standing` among them.; So the open need the design review carried forward lands.; `ranHere` asks the gate on its first line, so the four stand down at `god` alone.; The server reads `BINDING` and `GOD` off the stop door, so one place holds each.; A cloud pull on trunk takes a branch at `god`, because the branch-take stands above the gate.; No case drives `pull` itself, so the first done_when line stands open.; The findings, one a line:; The gate sits under the branch-take, and a cloud box on trunk reaches the take first.; A case driving `pull` at `god` on trunk reads a branch take, in place of the wait.; So the engine hands a cloud box work where the ask says it stands aside.; The done_when asks for a case where the plain pull answers wait, and `handsOut` takes that line.; `test/level0/pull-doors.js` drives `pull` over fakes already, and the box it builds takes `binding`.; The cases copy the check names, which `spec/config/stop/level0.yml` and its level1 file own.; So a check joining the door lands in neither list, and the last case passes green.; `queueWaits` spells the key bare, beside the `BINDING` the same file now exports.; The pull's named-ticket refusal spells `queue` bare, beside the `QUEUE` its route now exports.; What reads true against the tree, one a line:; `engine.binding` reaches the pull through `it.binding`, which the command line's box carries.; The `unbound` column of the stop table holds, because the gate reads `god` alone.; The `god` row of the config chapter holds, because `letsThrough` lets the stop block through.; `standsDown` answers false for every other check the stop rules name.; `./RUNME.sh check` answers 0, and every case in the tree passes.; What the agent needs:; | number | need | status |; |---|---|---|; | 1 | the gate stands above the branch-take, so a cloud pull on trunk waits at `god` | open |; | 2 | a case drives `pull` at `unbound` and at `god`, over the pull's own fakes | open |; | 3 | the cases read the check names off the stop rules, in place of a copy | open |; | 4 | `queueWaits` reads `BINDING`, and the pull's refusal reads `QUEUE` | open |; | 5 | the verdict hand reads the branch again | open |"
  - step: implement/reflect
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: 275d1d48fe6242f0e64e59270eacbc987157f277
    hash_after: 275d1d48fe6242f0e64e59270eacbc987157f277
  - step: implement/change
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: 85f659911a4382348a7b742aab40e9b46d53adb4
    hash_after: 85f659911a4382348a7b742aab40e9b46d53adb4
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: 20710d84cd6fb8b25aac0cbe4c8a1289ce79358d
    hash_after: 20710d84cd6fb8b25aac0cbe4c8a1289ce79358d
    answered:
      - name: tests
        exit: 0
        said: green, 14 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: The rules pass.
  - step: verdict
    hand: box 0eb9ad6feedf · claude-code-remote · helper-17
    hash_before: 7502d1da85f7d887a766d0345bee888c9c9db52b
    hash_after: 7502d1da85f7d887a766d0345bee888c9c9db52b
    returns: 2
    why: "| the question reviewing asks | the answer |; |---|---|; | does the branch do what the ask asks | yes, the three done_when lines land |; | is what the diff touches beyond the ask trivial | yes, the server hunk moves two imports |; | what does `./RUNME.sh check` answer | 0, with the server standing |; | does a retro stand in the handback | no, and `branch review` names it at the branch's close |; | does every rule the change adds carry a case | the gate does, and the check list takes none |; | does a case feed the rule something bad | the pull cases do, and the contract case holds nothing |; TL;DR:; Four of the five needs land, and the gate now stands above the branch-take.; A cloud box on trunk at `god` reads the wait, and the take stands untouched.; Three cases drive `pull` over the fakes, so the first done_when line lands.; `queueWaits` reads `BINDING`, and the pull's named-ticket refusal reads `QUEUE`.; The contract case's name promises a guard its assertions leave out.; The findings, one a line:; The contract case says every shipped check stands in one list or the other.; Its first loop asks whether `standsDown` answers a boolean, which holds for any string.; A shipped name outside both lists meets that loop, and the case passes green.; `EVERY` in `test/level0/binding.test.js` stands as a copy, and this round moves its comment alone.; So need 3 of the last round stands open, and a check joining the rules lands in neither list.; The fix: hold the shipped names against the list the stop door answers.; What reads true against the tree, one a line:; The gate stands above the branch-take, under the hand-back and the hold, in `src/scripts/pull.js`.; A cloud box on trunk at `god` answers wait, and reaches the take nowhere.; The same box at `queue` reaches the take, so the gate closes that road alone.; The config library owns `BINDING`, `QUEUE` and `GOD`, and four files read them there.; `./RUNME.sh check` answers 0, and `branch test` answers green over the two case files.; `./RUNME.sh branch review` names the retro alone, and the branch's close writes it.; What the agent needs:; | number | need | status |; |---|---|---|; | 1 | the contract case refuses a shipped check landing in neither list | open |; | 2 | the verdict hand reads the branch again | open |"
  - step: implement/reflect
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: f98005142aa54834a8d493257834f24e220b6ed5
    hash_after: f98005142aa54834a8d493257834f24e220b6ed5
  - step: implement/change
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: 28425da421f1da0c1c1999e74b22a01957123187
    hash_after: 28425da421f1da0c1c1999e74b22a01957123187
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: 28284b744b8937e3fd9452adfd45e7db5024daf0
    hash_after: 28284b744b8937e3fd9452adfd45e7db5024daf0
    answered:
      - name: tests
        exit: 0
        said: green, 14 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: The rules pass.
  - step: verdict
    hand: box 0eb9ad6feedf · claude-code-remote · helper-21
    hash_before: 3135a734db77266a4881dfc33247b7bf9de1b3e2
    hash_after: 3135a734db77266a4881dfc33247b7bf9de1b3e2
    returns: 3
    why: "| the question reviewing asks | the answer |; |---|---|; | does the branch do what the ask asks | yes, the three done_when lines land |; | is what the diff touches beyond the ask trivial | yes, this round touches the stop door, one case file and this ticket |; | what does `./RUNME.sh check` answer | 0, with the server standing |; | does a retro stand in the handback | no, and `branch review` names it at the branch's close |; | does every rule the change adds carry a case | yes, the gate and `knowsCheck` each carry one |; | does a case feed the rule something bad | yes, the case asks `knowsCheck` a name nobody wrote |; TL;DR:; The finding of the last round lands, and the case holds the shipped names against the door.; `CHECKS` gives the door one table, and `knowsCheck` opens that table to a case.; The table carries the object prototype, so `ranHere` reads a function for `constructor`.; So `ranHere` and `knowsCheck` part on such a name, which is the class this round sets out to close.; `## reflect` carries two `### checked` blocks, one a round.; The findings, one a line:; `ranHere` answers `CHECKS[name]?.(held)`, and reads the prototype where the table holds nothing.; `CHECKS.constructor` is `Object`, which answers the held box, so a rule naming it fires.; `toString` and `valueOf` answer the same way, where `knowsCheck` answers false for each.; spec/design_output/stop.md says a `runs` the code holds nowhere answers false and writes a warn line.; The chain this hunk replaces answers undefined for those names, so the hunk moves that road.; The fix: gate the table read on `knowsCheck`, and carry a case over `runs: constructor`.; `## reflect` carries this round's `### checked` beside the block the round before wrote.; The fix: hold one `### checked` block under `## reflect`.; What reads true against the tree, one a line:; `CHECKS` in `src/bridge/stop.js` holds a key for each name the shipped rules use.; `ranHere` asks `standsDown` first, so `ENGINE_CHECKS` stands down at `god`.; The contract case asks `knowsCheck` of every shipped name, and of a name nobody wrote.; The case leaves `never` out, and spec/design_output/stop.md names `never` as the value answering nothing.; `./RUNME.sh check` answers 0, with the server standing.; `./RUNME.sh branch review` names the retro alone, and the branch's close writes it.; This hand stands on the tip 3135a734, and that tip matches origin.; What the agent needs:; | number | need | status |; |---|---|---|; | 1 | `ranHere` answers nothing for a name the object prototype holds | open |; | 2 | one `### checked` block stands under `## reflect` | open |; | 3 | the verdict hand reads the branch again | open |"
  - step: implement/reflect
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: ea66db9ca702011de8b7a4b9d495ffb2bf24a30f
    hash_after: ea66db9ca702011de8b7a4b9d495ffb2bf24a30f
  - step: implement/change
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: ed36b0b4867ea98a9fe9e85ecace89555e821df0
    hash_after: ed36b0b4867ea98a9fe9e85ecace89555e821df0
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: baadae3a1d289e561f7698c46d4563b375dc3729
    hash_after: baadae3a1d289e561f7698c46d4563b375dc3729
    answered:
      - name: tests
        exit: 0
        said: green, 23 test(s) pass in 3 file(s)
      - name: check
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

Two classes stand under this round's findings.

| the class | the finding it carries | the fix for the class |
|---|---|---|
| a lookup reads a key the table holds nowhere | the rule at `runs: constructor` | the read asks the table first, and answers nothing where the table holds nothing |
| a field answers twice in one chapter | the doubled block under `## reflect` | one block stands, and the round rewrites it |

The first class is one a chain of comparisons had no room for. A table keyed by
a name answers the keys every object carries, so a name nobody wrote reaches a
function. That function answers a value the vote reads as a firing check, and a
rule takes such a name out of a config file.

`knowsCheck` already answers what the table holds. So the read asks it, and the
door's answer and the door's behaviour say one thing. A case drives a rule at
that name and reads the door refusing it.

The second class is a hand's, and one block answers it.

### checked

- the change touches no file the ask leaves out. The stop door and the two case files.
- every door the change reaches has a fake. The contract case drives the shipped rules, which is what a contract case is for.
- a comment names the approach the change implements. Each site points at the chapter owning the binding.

## change

<!-- makes the change -->

### lint

    ./RUNME.sh lint src/scripts/pull.js src/scripts/pull-route.js src/bridge/stop.js src/bridge/server.js .claude/skills/level0/lib/config.js test/level0/binding.test.js test/level0/stop-door.test.js test/contract/stop-rules.test.js

### checked

- the change touches no file the ask leaves out. The pull, its route, the stop door, the config library and the cases.
- every door the change reaches has a fake. The pull cases drive the fakes `pull-doors.js` builds, and the shipped rules meet a contract case.
- a comment names the approach the change implements. Each site points at [[spec/design_output/config#the-engine-controls]].

## tests-green

<!-- makes the tests pass -->

### tests

    ./RUNME.sh branch test test/level0/binding.test.js test/level0/stop-door.test.js test/contract/stop-rules.test.js

### check

    ./RUNME.sh check

### says

`engine.binding` reaches the pull and the stop hook, so the value a person
sets changes what a session takes and what holds its turn open.
[[spec/design_output/config#the-engine-controls]] owns what each value means.

| where | what it does |
|---|---|
| `handsOut` in `pull-route.js` | answers whether the plain pull hands work out, which the queue alone does |
| the pull | answers wait at `unbound` and at `god`, and names the binding it reads |
| `ENGINE_CHECKS` in `stop.js` | names the checks reading the engine's own work |
| `standsDown` | answers whether one of those steps aside, which `god` alone makes it do |
| `CHECKS` in `stop.js` | holds every check the door answers, one a key |
| `knowsCheck` | answers whether the door holds a name, so a case can ask |
| `ranHere` | asks the gate first, then reads the table |

The gate reads `god` alone, so the `unbound` column stands as it stood. A
session at `unbound` keeps every check it had, and takes a named ticket with
`pull <ticket>`.

The config library owns the key and its two values, and the pull, the stop door
and the server each read them there. So the bare spellings go.

The verdict found three things, and this round answers each:

| the finding | what answers it |
|---|---|
| the gate stands under the branch-take, so a cloud pull on trunk hands out at `god` | the gate stands above the take, under the hand-back and the hold |
| a case drives the pure name, and the pull's own road stands untested | three cases drive `pull` over the fakes `pull-doors.js` builds |
| the cases copy the names the stop rules own | a contract case reads the shipped rules and asks the door for each |

A case drives a cloud box on trunk at `god`, which is the road that carried the
fault. It reads the wait, and reads that the take stands untouched.

The round after that found the contract case reading a type, where its title
promises a set. So the door holds its checks in a table, `knowsCheck` answers
what stands in it, and the case asks that of every shipped name. It asks the
same of a name nobody wrote, and reads false.

The round after that found the table reading a key every object carries. A rule
at `runs: constructor` reached a function, and its answer read as a firing
check. So `ranHere` asks `knowsCheck` ahead of the table, and a case drives a
rule at that name and reads the stop standing.

### checked

- the change touches no file the ask leaves out. The pull, its route, the stop door, the config library and the cases.
- every door the change reaches has a fake. The pull cases drive the fakes `pull-doors.js` builds, and the shipped rules meet a contract case.
- a comment names the approach the change implements. Each site points at the chapter owning the binding.

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

- .claude/skills/level0/lib/stop.js
- spec/config/stop/level0.yml
- spec/config/stop/level1.yml
- spec/design_output/stop.md
- spec/guidance/review/reviewing.md
- spec/tickets/the-controls-wire-up.md
- spec/tickets/the-runtime-files-stand-apart.md
- src/bridge/stop.js
- test/contract/stop-rules.test.js
- test/level0/binding.test.js

## verdict

fail

| the question reviewing asks | the answer |
|---|---|
| does the branch do what the ask asks | yes, the three done_when lines land |
| is what the diff touches beyond the ask trivial | yes, this round touches the stop door, one case file and this ticket |
| what does `./RUNME.sh check` answer | 0, with the server standing |
| does a retro stand in the handback | no, and `branch review` names it at the branch's close |
| does every rule the change adds carry a case | yes, the gate and `knowsCheck` each carry one |
| does a case feed the rule something bad | yes, the case asks `knowsCheck` a name nobody wrote |

TL;DR:

- The finding of the last round lands, and the case holds the shipped names against the door.
- `CHECKS` gives the door one table, and `knowsCheck` opens that table to a case.
- The table carries the object prototype, so `ranHere` reads a function for `constructor`.
- So `ranHere` and `knowsCheck` part on such a name, which is the class this round sets out to close.
- `## reflect` carries two `### checked` blocks, one a round.

The findings, one a line:

- `ranHere` answers `CHECKS[name]?.(held)`, and reads the prototype where the table holds nothing.
- `CHECKS.constructor` is `Object`, which answers the held box, so a rule naming it fires.
- `toString` and `valueOf` answer the same way, where `knowsCheck` answers false for each.
- spec/design_output/stop.md says a `runs` the code holds nowhere answers false and writes a warn line.
- The chain this hunk replaces answers undefined for those names, so the hunk moves that road.
- The fix: gate the table read on `knowsCheck`, and carry a case over `runs: constructor`.
- `## reflect` carries this round's `### checked` beside the block the round before wrote.
- The fix: hold one `### checked` block under `## reflect`.

What reads true against the tree, one a line:

- `CHECKS` in `src/bridge/stop.js` holds a key for each name the shipped rules use.
- `ranHere` asks `standsDown` first, so `ENGINE_CHECKS` stands down at `god`.
- The contract case asks `knowsCheck` of every shipped name, and of a name nobody wrote.
- The case leaves `never` out, and spec/design_output/stop.md names `never` as the value answering nothing.
- `./RUNME.sh check` answers 0, with the server standing.
- `./RUNME.sh branch review` names the retro alone, and the branch's close writes it.
- This hand stands on the tip 3135a734, and that tip matches origin.

What the agent needs:

| number | need | status |
|---|---|---|
| 1 | `ranHere` answers nothing for a name the object prototype holds | open |
| 2 | one `### checked` block stands under `## reflect` | open |
| 3 | the verdict hand reads the branch again | open |

## checked

- every fact the change adds stands in one place. `CHECKS` in `src/bridge/stop.js` owns the names, and `knowsCheck` opens that table to a case. Each comment points at spec/design_output/stop.md, which owns what a `runs` value answers. The case reads `never` off that same chapter. The ticket says one thing twice, because `## reflect` carries two `### checked` blocks.

# Discussion

The binding half of this ticket stands ready. A cloud box cut the autonomy half out of the Ask. `engine.autonomy` reaches no schema, no config and no code, and three notes read it three ways. A ticket of its own takes it where the owner wants it back, with one reading named. The owner reads this call at the merge.

A session runs under `engine.binding` at `queue` today, and the stop rule hands it work while a free ticket stands. So the `unbound` row of the draft is the one a person reaches for, and it is the row the draft gets right.
