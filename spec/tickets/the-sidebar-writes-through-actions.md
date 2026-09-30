---
kind: [[ticket]]
state: closed
steps:
  - name: design
    steps:
      - name: owner-read
        does: reads the ask a handover carries, before any draft
        by: person
        when: handed
        input: ask
        evidence:
          - name: read
            form: verdict
            says: pass where the ask says what the owner said, or fail with the owner's words
      - name: draft
        does: writes the approach the ask calls for
        from: anyone
        by: anyone
        input: ask
        checklist: ["every file, function and verb the approach names stands opened, and each claim checked there", "the callers list names every caller of what the approach changes", "every done_when line names the test that decides it"]
        evidence:
          - name: approach
            form: text
            says: the approach here where it takes minutes, or a link to the design output where it takes a note
          - name: callers
            form: list
            says: every caller of what the approach changes, one a line, as a file and a function
          - name: tests
            form: list
            says: every test the change adds, one a line, as a file and a test name
          - name: answers
            form: list
            says: every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft
          - name: size
            form: list
            says: every file the approach touches, one a line
      - name: tests-red
        does: writes the tests the ask calls for
        tags: ["code", "testing"]
        needs: ["branch test"]
        input: draft
        checklist: ["every done_when line meets a test that fails, or a checkpoint the hand answers where no command decides", "every door the tests reach has a fake"]
        evidence:
          - name: tests
            form: command
            expects: assertion
            says: the tests you write fail on their own assertion
          - name: red
            form: list
            says: every test file standing red until tests-green closes, one a line, which the check leaves out
          - name: seen
            form: text
            says: what you see, and what surprises you
  - name: gate
    gate: does the approach answer the ask, and does a red test decide every done_when line
    does: reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points
    not: design/draft
    tags: ["review"]
    input: ["design/draft", "design/tests-red"]
    evidence:
      - name: verdict
        form: verdict
        says: accept, accept with points naming a fix ticket a line, or reject with findings one a line
  - name: implement
    tags: ["code", "testing"]
    needs: ["branch test"]
    input: ["design/draft", "gate"]
    checklist: ["the change touches no file the ask leaves out", "every door the change reaches has a fake", "a comment names the approach the change implements", "every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
    steps:
      - name: change
        does: makes the change
        evidence:
          - name: lint
            form: command
            expects: 0
            says: the tree builds and lints
      - name: tests-green
        does: makes the tests pass
        input: design/tests-red
        to: retro
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
  - name: accept
    gate: does the whole work answer the ask, and does every command of the route pass
    final: true
    when: backlog
    does: reads the diff since its last verdict against the ask and every prose criterion, and names what falls short as points
    not: implement/change
    tags: ["review", "accept"]
    input: ["ask", "implement"]
    evidence:
      - name: verdict
        form: verdict
        says: accept, accept with points naming a fix ticket a line, or reject with findings one a line
  - name: view
    does: reads the change in the view the ask names
    by: person
    when: view
    on_fail: implement
    to: retro
    input: ["ask", "implement/tests-green"]
    evidence:
      - name: seen
        form: verdict
        says: pass where the view shows the ask's number, or fail with what it shows
process: [[spec/processes/standard]]
process_hash: 22b42ea1501e8967
group: sidebar-switches-over
depends_on: [config-answers-keys-and-overrides, the-sidebar-reads-v1]
step: view
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box d88ef4f8a2d6 · claude-code-remote
    hash_before: 09f506dee71c934013082457ff1cd98a02e31ccc
    hash_after: ab2f39b9b76c79c58c654d4204b8036c4e28ca63
    inputs:
      - name: ask
        hash: 9c024090bdfb0cdb
        size: 870
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d8901b0331d5 · claude-code-remote
    hash_before: 33a5f73e490b852cf083bc50309779c918466b3c
    hash_after: 33a5f73e490b852cf083bc50309779c918466b3c
    answered:
      - name: tests
        exit: 1
        said: assertion, 7 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: 72598afa192c1458
        size: 5559
    def: 08e16d07b0de477c
  - step: gate
    hand: box d8901b0331d5 · claude-code-remote
    hash_before: 21be11ec52ee554f2afc91b4d3c7f7d50cd5ea7d
    hash_after: 21be11ec52ee554f2afc91b4d3c7f7d50cd5ea7d
    inputs:
      - name: design/draft
        hash: 72598afa192c1458
        size: 5559
      - name: design/tests-red
        hash: a9fc599b7b6295e6
        size: 1771
    def: dc4904ab364efa10
  - step: implement/change
    hand: box d8901b0331d5 · claude-code-remote
    hash_before: 6bd2bdb4343679f80bfc33c1d19bdd465b2408e7
    hash_after: cdc0712e66817ba07bfcc78a34fcbe0de4f1a1cf
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box d8901b0331d5 · claude-code-remote
    hash_before: 9bac5f891f9c87ffd27ebaed02b1538a2a55553d
    hash_after: 9bac5f891f9c87ffd27ebaed02b1538a2a55553d
    answered:
      - name: tests
        exit: 0
        said: green, 7 test(s) pass in 4 file(s); green, src/modules/holds passes; green, src/modules/log passes; green, src/modules/v
      - name: check
        exit: 0
        said: "spec/tickets/the-sidebar-writes-through-actions.md:389:3: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: design/tests-red
        hash: a9fc599b7b6295e6
        size: 1771
    def: ec253787263043a7
  - step: accept
    skipped: true
    why: the delivery's acceptance reads this ticket
  - step: view
    hand: box d8901b0331d5 · claude-code-remote
    hash_before: debafd33dd5f4ca02fde6072c297f843259c85a6
    hash_after: debafd33dd5f4ca02fde6072c297f843259c85a6
    inputs:
      - name: ask
        hash: 9c024090bdfb0cdb
        size: 870
      - name: implement/tests-green
        hash: 70b09eaaf803f0a7
        size: 1314
    def: 561b3819e1683d37
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
<!-- view, as text: the view the owner reads the change in and the number there, in the owner's words, or none -->
<!-- from, as text: handover where the ask comes off a handover line, so the owner reads it first, or none -->

Every sidebar write posts an action to `/v1/actions`. A click on a key posts `config/override` for the window. A new window posts `config/opened`, and writes no file. The bless button, the new ticket button, the log lines and the vehicle and stub buttons post actions too.

Today a new window wipes the local file, so a value the owner writes there by hand dies on the next window. The sidebar also writes the bless file, a new ticket and the session log itself.

- a case under `test/level0` opens a new window over a local file, and reads the file unchanged
- a case under `test/level0` clicks each button over a fake action door, and reads what it posts
- `git grep -n 'door.write\|door.append' src/extension/sidebar.js src/extension/lib` answers nothing
- `./RUNME.sh check` exits 0

view: the sidebar, a key set with a click and kept across a new window

from: none

# design

## owner-read

<!-- reads the ask a handover carries, before any draft -->

### read

<!-- pass where the ask says what the owner said, or fail with the owner's words -->

<!-- the form is verdict -->

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->
<!-- the form is text -->

Every sidebar write posts an action through `door.index`. Three actions stand already. The index gains three more, each running a node verb, as `config/set` runs one.

| the write today | the action it posts |
|---|---|
| `set` writes the local file | `config/override` |
| `opened` rewrites the local file | `config/opened` |
| the bless button writes the bless file | `bless/set`, new |
| `newTicket` writes a bare ticket | `tickets/new`, new |
| `logbook.say` appends the session log | `log/say`, new |
| a vehicle or stub button runs a terminal line | the action its line names |

1. `set` in `src/extension/sidebar.js` posts `config/override` with the key, the typed value and the window. The window is the pid `opened` takes.
2. `opened` posts `config/opened` with the window, and writes no file. The hand-written local value stays. `opened` in `src/extension/lib/session.js` leaves, with its callers.
3. `src/modules/holds/holds.go` registers `bless/set`. It takes `agent` and `person`, and runs `ticket bless --desk=<agent>` as a person, the way the verb actions run with `person`. The verb writes the bless file, and refuses where the hand reads an agent, so the rule in `src/scripts/pull-bless.js` holds: the button alone writes it.
4. `src/modules/verbs/actions.go` registers `tickets/new`, which runs `ticket new <path>`. The verb writes the bare ticket `NEW_TICKET` holds in `src/extension/lib/work.js` where no file stands, and moves that constant into the verb's program.
5. `src/modules/log/log.go` registers `log/say`. It takes `level`, `kind`, `said` and `extra`, and runs `log --say`, which appends one row through `.claude/skills/level0/lib/log.js`. `logbookOf` posts it, and keeps its level filter and its queue.
6. `press` reads `index/actions`. A button whose line names a topic and a verb standing there posts that action through `actsOn` in `src/extension/lib/lens.js`. A line naming no action runs in the terminal as today. So the vehicle and stub buttons post `vehicle/<verb>` and `stub/into`.

What I weigh and assume:
- The view line reads as if a clicked key survives a new window. The ask's own sentences post `config/override` for the window, and `config/opened` drops what other windows hold. I take the sentences: a click holds for its window, and a value the owner writes by hand in the local file survives a new window. The view step reads that.
- The bless action is the one an agent must never land. The verb's hand rule refuses it, and that rule reads the harness variables the person mark strips. A caller who forges the mark defeats it. So the guard stands as strong as the verb actions' guard, and no stronger.
- The three new verbs are subcommands of verbs that stand, so no new program comes in.
- What breaks this: an action that answers after the draw it feeds. Each post awaits its answer, and the watch draws what it writes.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/extension/sidebar.js sidebarOf: set, took, opened, newTicket, press
- src/extension/extension.js activate: sidebar.opened
- src/extension/lib/logbook.js logbookOf: say
- src/extension/lib/session.js opened
- src/extension/lib/work.js NEW_TICKET
- test/level0/sidebar.test.js, sidebar-work.test.js, sidebar-views.test.js, sidebar-v1.test.js, lens-actions.test.js: sidebarOf over a fake door
- test/level0/logbook.test.js: logbookOf
- test/level0/session.test.js: opened
- src/scripts/verbs/ticket.js: the new and bless subcommands
- src/scripts/verbs/log.js: the say mode

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- test/level0/sidebar-writes.test.js: a new window over a local file posts config/opened and leaves the file unchanged
- test/level0/sidebar-writes.test.js: a click on a key posts config/override for the window
- test/level0/sidebar-writes.test.js: each button posts its action over a fake action door
- test/level0/sidebar-writes.test.js: sidebar.js and lib name no door.write or door.append
- test/level0/ticket-new.test.js: ticket new writes the bare ticket where no file stands, and leaves a standing one
- test/level0/bless-desk.test.js: ticket bless --desk writes the bless file for a person, and refuses an agent
- test/level0/log-say.test.js: log --say appends one row and keeps a row another writer lands
- src/modules/holds/bless_test.go: TestBlessSetRunsTheDeskVerb
- src/modules/log/say_test.go: TestLogSayRunsTheVerb
- src/modules/verbs/new_test.go: TestTicketsNewRunsTheVerb

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/extension/sidebar.js
- src/extension/lib/logbook.js
- src/extension/lib/session.js
- src/extension/lib/work.js
- src/modules/holds/holds.go
- src/modules/log/log.go
- src/modules/verbs/actions.go
- src/scripts/verbs/ticket.js
- src/scripts/verbs/log.js
- test/level0/v1-index.js
- test/level0/sidebar-writes.test.js
- test/level0/ticket-new.test.js
- test/level0/bless-desk.test.js
- test/level0/log-say.test.js
- test/level0/logbook.test.js
- test/level0/session.test.js
- src/modules/holds/bless_test.go
- src/modules/log/say_test.go
- src/modules/verbs/new_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- opened sidebar.js at set, took, opened and newTicket, logbook.js, session.js opened, work.js NEW_TICKET, keys.go actions, action.go, disk.go Accept, verbs.go person mark, pull-bless.js, log.go, and read the live action catalog for config, vehicle, stub, ticket and verb
- the callers list names every file calling the functions the approach changes, and the tests driving them
- the unchanged-file line meets the new-window case, the buttons line meets the fake action door case, the grep line meets the grep case, and the check line meets its own run

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test test/level0/sidebar-writes.test.js test/level0/ticket-new.test.js test/level0/bless-desk.test.js test/level0/log-say.test.js src/modules/holds/bless_test.go src/modules/log/say_test.go src/modules/verbs/new_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- test/level0/sidebar-writes.test.js
- test/level0/ticket-new.test.js
- test/level0/bless-desk.test.js
- test/level0/log-say.test.js
- src/modules/holds/bless_test.go
- src/modules/log/say_test.go
- src/modules/verbs/new_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Every new case fails on its own assertion. Every older case in the same files and packages passes.

What surprised me:
- The mixed run's tail counts the JS cases alone. `go test` shows each Go case failing on its `t.Fatalf`.
- The door refuses a command naming the bless file path, so bless-desk.test.js imports `BLESS_FILE`.
- `holds.Registers` needs `tickets/all` seeded as `[]ticket.Ticket`.
- session.test.js stands nowhere. Only session-layer.test.js stands, so the size line names a missing file.
- The draft names no new case in logbook.test.js.
- The vehicle and stub buttons post their args without the quotes the line builder adds today.

The tests fix the input shapes the draft leaves open:
- `config/override` takes `key`, `value` and `window`, with the window as a string.
- `bless/set` runs `ticket bless --desk=<agent>` as a person.
- `tickets/new` runs `ticket new <path>`, and `log/say` runs `log --say <row>`.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the unchanged-file line meets the new-window case, the buttons line meets the fake action door case, and the grep line meets the grep case in sidebar-writes.test.js. The check line waits on the check itself
- the index door has its fake in test/level0/v1-index.js, which now answers every write action. The Go cases run on q/qtest

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept
- every done_when line meets a red case in test/level0/sidebar-writes.test.js, and the check runs at tests-green
- the JS and Go cases fail on their own assertion, and every older case in their files passes
- the size list names test/level0/session.test.js, which stands nowhere, so the build moves the `opened` cases in session-layer.test.js in place
- the bless guard holds as strong as the person mark on the verb actions, which the draft names and the ask accepts
- the view line reads as a click kept across a new window. The draft takes the ask's own sentences, where a hand-written local value survives, and the view step reads that

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint src/extension src/modules/holds src/modules/log src/modules/verbs src/scripts/ticket.js src/scripts/pull-bless.js src/scripts/log-verb.js spec/design_output/extension.md test/contract/tree-extension.test.js test/level0

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the verbs land in `src/scripts/ticket.js`, `pull-bless.js` and `log-verb.js`, where the red tests import them. The design note and the tree contract test follow the change. `session.test.js` stands nowhere
- the index door has its fake in test/level0/v1-index.js, which answers every write action. The Go cases run on q/qtest
- each changed file carries a comment pointing at this ticket
- `NEW_TICKET` moves into the `ticket new` verb, and `opened` leaves with `session.js`

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh test test/level0/sidebar-writes.test.js test/level0/ticket-new.test.js test/level0/bless-desk.test.js test/level0/log-say.test.js src/modules/holds/bless_test.go src/modules/log/say_test.go src/modules/verbs/new_test.go

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The sidebar writes no file of its own. Each write posts an index action, and the module owning the file writes it.

| the button | the action |
|---|---|
| a click on a key | `config/override`, held for the window |
| a new window | `config/opened`, which drops other windows' overrides |
| bless | `bless/set`, which runs `ticket bless --desk` as a person |
| new ticket | `tickets/new`, which runs `ticket new` |
| a log line | `log/say`, which runs `log --say` |
| a vehicle or stub button | the action its line names |

A value the owner writes into the local file by hand now survives a new window.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the size list, the three script files the red tests import, the design note, and the tree contract test that read a deleted file
- the index door has its fake in test/level0/v1-index.js, and the Go cases run on q/qtest
- each changed file carries a comment pointing at this ticket
- the bare ticket stands in the `ticket new` verb alone, and the design note states the new window rule once

# accept

<!-- reads the diff since its last verdict against the ask and every prose criterion, and names what falls short as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->

<!-- the form is verdict -->

# view

<!-- reads the change in the view the ask names -->

## seen

<!-- pass where the view shows the ask's number, or fail with what it shows -->
<!-- the form is verdict -->

pass
- no editor runs on this cloud box, so the view is the live index the sidebar posts to
- `config/override` for window w111 reads back at layer `override` in `config/keys`
- `config/opened` for window w222 drops it, and the key reads its built-in value again
- no local config file stands after either post, so a hand-written local value meets no rewrite
- the first take found the design note naming the schema as what types an override. The fix landed, the hold dropped, and this take reads the tip carrying it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
