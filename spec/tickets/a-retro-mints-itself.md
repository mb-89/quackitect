---
kind: [[ticket]]
state: closed
urgency: now
step: verdict
steps:
  - name: design
    reads: [[spec/guidance/voice]]
    steps:
      - name: settle-1
        does: decides between the step and the findings, and writes why
        by: anyone
        to: engine
        asks: "design/review failed back 2 times: Five of the six findings close, and two gaps stand:; | the gap | the fix |; |---|---|; | the config glob names `se-config-*.md`, and `se-agent-control-*.md` finds no owner | name a glob covering every file that entry writes |; | `writes` reaches the entry table nowhere | add its row to [[spec/design_output/projection]], which owns the keys |; | the earlier finding | what closes it |; |---|---|; | the entry names no source | the retro process is the source, and the banner names it |; | two entries tie on one folder | an entry declares `writes`, and the lookup prefers the match |; | `--as` carries a hand's name | the flag reads `--name` here |; | the mint copies what a pull prints | `retro new` calls the mint and the pull, and prints nothing |; | `retro collect` stands nowhere | the sibling lands it, and `depends_on` names that sibling |; | the two knobs project two commands | the change carries both command files |; One caution for the draft hand: the verb list carries `collect` already, so `new` is the row that lands there.; `./RUNME.sh check` exits 0 on this branch."
        evidence:
          - name: answer
            form: text
            says: the decision, and why it stands
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
record:
  - step: design/draft
    hand: box d42624a67d18a8 · claude-code
    hash_before: ed8bb2787df33550776b3a688995e52fb3272c23
    hash_after: ed8bb2787df33550776b3a688995e52fb3272c23
  - step: design/review
    hand: box d42624a67d18a8 · claude-code · helper-2
    hash_before: 2daddc687fe72a63a9e2ed398e3fce4dffb53ef9
    hash_after: 2daddc687fe72a63a9e2ed398e3fce4dffb53ef9
    returns: 1
    why: the entry names no source, so the generated banner points at nothing; the command folder already carries a projection, so a refusal names the wrong source; `--as` names the hand at every other verb, so the ticket name wants its own flag; the mint prints the leaf itself, so name the pull it calls and copy no printing; the first leaf calls for `retro collect`, which stands nowhere, so say what the hand runs there; the two knobs mint two config commands, so the change carries them as well
  - step: design/draft
    hand: box d42624a67d18a8 · claude-code
    hash_before: 15fb5a5a0ff7cf3cca68896bfaca8cd04e26e5ec
    hash_after: 15fb5a5a0ff7cf3cca68896bfaca8cd04e26e5ec
  - step: design/review
    hand: box d42624a67d18a8 · claude-code · helper-21
    hash_before: 770861465afe3337da194a627f59a2c3936e4ab1
    hash_after: 770861465afe3337da194a627f59a2c3936e4ab1
    returns: 2
    why: "Five of the six findings close, and two gaps stand:; | the gap | the fix |; |---|---|; | the config glob names `se-config-*.md`, and `se-agent-control-*.md` finds no owner | name a glob covering every file that entry writes |; | `writes` reaches the entry table nowhere | add its row to [[spec/design_output/projection]], which owns the keys |; | the earlier finding | what closes it |; |---|---|; | the entry names no source | the retro process is the source, and the banner names it |; | two entries tie on one folder | an entry declares `writes`, and the lookup prefers the match |; | `--as` carries a hand's name | the flag reads `--name` here |; | the mint copies what a pull prints | `retro new` calls the mint and the pull, and prints nothing |; | `retro collect` stands nowhere | the sibling lands it, and `depends_on` names that sibling |; | the two knobs project two commands | the change carries both command files |; One caution for the draft hand: the verb list carries `collect` already, so `new` is the row that lands there.; `./RUNME.sh check` exits 0 on this branch."
  - step: design/settle-1
    hand: box d42624a67d18a8 · claude-code
    hash_before: 37ab51bd3baa40c4f2fa70c1989b2502440cdf86
    hash_after: b96685f67b77fc6bf566fb972ef7963c8810e803
  - step: design/draft
    hand: box d42624a67d18a8 · claude-code
    hash_before: 2d8a655bb8120166961261e9323b02e3a293deea
    hash_after: 2d8a655bb8120166961261e9323b02e3a293deea
  - step: design/review
    hand: box d42624a67d18a8 · claude-code · helper-24
    hash_before: 230cc6130a5a5149e96d6ba8ada96f55a6acc025
    hash_after: 230cc6130a5a5149e96d6ba8ada96f55a6acc025
  - step: implement/tests-red
    hand: box d42624a67d18a8 · claude-code
    hash_before: 8fae8a2f84c19611ecac1e38f515326adc484bbe
    hash_after: 8fae8a2f84c19611ecac1e38f515326adc484bbe
    answered:
      - name: tests
        exit: 1
        said: assertion, 5 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box d42624a67d18a8 · claude-code
    hash_before: 0375730202004712f98a85af9c0b5bf786bb7c3c
    hash_after: 0375730202004712f98a85af9c0b5bf786bb7c3c
    answered:
      - name: lint
        exit: 0
        said: 75 stand at warning, which the panel draws and check allows.
  - step: implement/tests-green
    hand: box d42624a67d18a8 · claude-code
    hash_before: fff6ff418428f1f1b372e0c2527d3372fd039d1c
    hash_after: fff6ff418428f1f1b372e0c2527d3372fd039d1c
    answered:
      - name: tests
        exit: 0
        said: green, 27 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: 75 stand at warning, which the panel draws and check allows.
  - step: verdict
    hand: box d42624a67d18a8 · claude-code · helper-30
    hash_before: 88796e7db9d81d21447c959d930135ae3cadef17
    hash_after: 88796e7db9d81d21447c959d930135ae3cadef17
group: the-retro-runs
depends_on: ["the-retro-takes-the-box"]
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->

A person starts a retro with one command, and the route it takes is the process file:

- the command mints the ticket, opens it, and pulls its first leaf
- the hands a collect spawns take their cap from the config
- the projection writes the command beside the config commands

<!-- breaks, as text: what breaks if it is never done -->

A retro takes a hand-written ticket. The route on it drifts from the process file, and the drift shows up as a step nobody answers.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

- `/se-retro` mints a retro off its process, opens it, and hands out its first leaf
- `work.retroReaders` and `work.retroCap` stand in the config with their defaults
- the projection writes the command, and `./RUNME.sh project` leaves the tree clean
- `./RUNME.sh check` exits 0

# design

## settle-1

<!-- decides between the step and the findings, and writes why -->

### answer

The findings stand, and the draft takes both.

| the finding | why it stands |
|---|---|
| the glob names one family, and another family finds no owner | the write door names the source a hand edits, and a file with no owner takes the wrong name |
| `writes` reaches the entry table nowhere | one place owns the keys an entry carries, and a key nobody writes down drifts |

Neither finding costs anything past this branch. A wrong glob names the wrong source in a refusal, and a later commit puts it right. So this hand settles both and hands nothing out.

The caution stands too. The verb list carries `collect` already, so `new` is the one row landing there.

<!-- the form is text -->

## draft

<!-- writes the approach the ask calls for -->

### approach

One sub-verb mints the ticket, and one projection writes the command calling it. The review names six faults in the first draft, and each row below answers one.

| what lands | where |
|---|---|
| `retro new`, a sub-verb beside `retro notes` | `src/scripts/retro.js` |
| `new` and `collect`, beside `notes` in the verb list | `src/scripts/pull-route.js` |
| the shape writing one command file | `.claude/skills/level0/lib/projection.js` |
| `writes`, a glob an entry owns under its target | `.claude/skills/level0/lib/projection.js` |
| the entry, naming the retro process as its source | `spec/config/projections.json` |
| `retroReaders` and `retroCap`, with their defaults | `spec/config/level0.json` and its schema |
| the two command files those keys project | `.claude/commands` |

The source is `spec/processes/retro.yaml`. The command stands because the route stands, so the generated line names that route as the file to edit.

| the fault | what answers it |
|---|---|
| the entry names no source | the retro process is the source, and the generated line says so |
| two entries tie on one folder | an entry declares `writes`, and the owner lookup prefers the entry matching the path |
| `--as` carries a hand's name already | the flag reads `--name` here |
| the mint copies what a pull prints | `retro new` calls the mint and the pull, and prints nothing of its own |
| `retro collect` stands nowhere | this ticket waits for [[spec/tickets/the-retro-takes-the-box]] under depends_on |
| the knobs project two more commands | the change carries both files |

`retro new` mints a ticket off the retro process, writes the reason into its ask, opens it, and hands out its first leaf. Each of the four is a call into the verb owning it.

The ticket's name reads `retro-<short>`, off the commit the window ends at. A name holds five words, and two of them stand here. A hand naming its own takes `--name <name>`.

| the field | what it takes |
|---|---|
| `why` | what calls for it, off `--why`, or the standing line where nobody says |
| `state` | open, because `ticket open` runs inside the verb |

An entry declares `writes`, a list of globs it owns under its target. The config-commands entry owns two families, because the widgets in the schema project their own:

| the entry | what it writes |
|---|---|
| the config commands | `se-config-*.md` and `se-agent-control-*.md` |
| the retro command | `se-retro.md` |
| an entry declaring none | its whole target, as every entry does today |

A tie on the command folder reads one owner now, so the write door names the file a hand edits. `writes` is a key an entry carries, and one place owns those keys. So its row lands in [[spec/design_output/projection]] beside the rest.

The two knobs stand in the config as numbers, beside the other work knobs. `retroReaders` caps the hands a collect spawns, and `retroCap` caps the tickets the improve step mints.

<!-- the form is text -->

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

pass

The draft closes both gaps, and the approach answers the ask.

| the gap the first round names | what closes it |
|---|---|
| `se-agent-control-*.md` finds no owner | the config entry owns that glob beside `se-config-*.md` |
| `writes` reaches the entry table nowhere | its row lands in [[spec/design_output/projection]], which owns the keys |

| what the ask asks | what the approach answers |
|---|---|
| one command mints, opens and pulls | `retro new` calls the verb owning each of the four |
| the two knobs stand with their defaults | `retroReaders` and `retroCap` land in the config and its schema |
| the projection writes the command | the entry names the retro process as its source |
| the tree stays clean | the change carries the three command files those keys project |

The caution stands answered: `new` is the row the verb list gains, and `collect` stands there already.

`./RUNME.sh check` exits 0 on this branch.

<!-- the form is verdict -->

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

    ./RUNME.sh branch test test/level0/retro-new.test.js test/level0/projection.test.js

<!-- the form is command -->

### seen

Five cases stand, and each one fails on its own assertion.

| the case | what it asks |
|---|---|
| the mint writes | a ticket off the retro route, named for the commit it stands on |
| the mint opens | the ticket reads open, at the route's first leaf |
| the mint takes words | the reason lands in the ask, and a hand names its own |
| the mint refuses | a name a ticket holds already stops it, and nothing writes over |
| the owner lookup | two entries share one folder, and each owns what it writes |

What surprises me is how little the verb owes. The mint, the open and the pull each stand already, so the verb calls three things and prints none of their words.

The owner lookup takes the harder half. An entry naming no `writes` owns its whole target, as every entry does today, so the key adds a road and closes none.

### checked

- the change touches no file the ask leaves out. One case file lands, and the projection cases take one more.
- every door the change reaches has a fake. The cases drive the fake disk, the fake git and the fake clock.
- a comment names the approach the change implements. Each header points at the chapter ruling it.

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

    ./RUNME.sh lint

<!-- the form is command -->

### checked

- the change touches no file the ask leaves out. The verb, its dispatch, the shape, the entry, the two knobs and the design row.
- every door the change reaches has a fake. The verb reads the disk and git through their doors, and the cases drive the fakes.
- a comment names the approach the change implements. Each function points at the chapter ruling it.

<!-- the form is checklist -->

## tests-green

<!-- makes the tests pass -->

### tests

    ./RUNME.sh branch test test/level0/retro-new.test.js test/level0/projection.test.js

<!-- the form is command -->

### check

    ./RUNME.sh check

<!-- the form is command -->

### says

`/se-retro` stands, and it runs `./RUNME.sh retro new` before the turn opens.

| what lands | where |
|---|---|
| the verb, which mints, opens and hands out | `src/scripts/retro-new.js` |
| the dispatch beside collect and the drain | `src/scripts/retro.js` |
| the shape writing the one command file | the projector |
| the entry naming the retro route as its source | `spec/config/projections.json` |
| the two knobs, with their defaults | `spec/config/level0.json` and its schema |
| the `writes` row, beside the other entry keys | `spec/design_output/projection` |

The verb writes none of the pull's words again. It mints the note, opens it at the route's first leaf, and hands that leaf out through the pull itself.

The owner lookup moves to a file of its own, because the projector stands past the file ceiling. Nothing outside it moves, because the projector reads the lookup out to every caller it holds.

| what an entry names | what owns the file |
|---|---|
| `se-config-*.md` and `se-agent-control-*.md` | the config commands |
| `se-retro.md` | the retro command |
| nothing | whatever no neighbour claims |

### checked

- the change touches no file the ask leaves out. The verb, its dispatch, the shape, the entry, the knobs, the design row and the projected files.
- every door the change reaches has a fake. The cases drive the fake disk, the fake git and the fake clock.
- a comment names the approach the change implements. The lookup's own file says why it stands apart.

<!-- the form is checklist -->

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->

- .claude/commands/se-config-work-retroCap.md
- .claude/commands/se-config-work-retroReaders.md
- .claude/commands/se-retro.md
- .claude/skills/level0/lib/projection-owner.js
- .claude/skills/level0/lib/projection.js
- .claude/skills/level0/lib/stop.js
- spec/config/level0.json
- spec/config/level0.schema.json
- spec/config/projections.json
- spec/config/stop/level0.yml
- spec/design_input/the-agent-pulls-tickets.md
- spec/design_output/projection.md
- spec/design_output/pull.md
- spec/design_output/stop.md
- spec/design_output/work.md
- spec/guidance/cloud.md
- spec/guidance/guidance.md
- spec/guidance/working.md
- spec/processes/retro.yaml
- spec/rationales/cloud.md
- spec/rationales/guidance.md
- spec/rationales/working.md
- spec/tickets/a-retro-mints-itself.md
- spec/tickets/a-return-asks-another-hand.md
- spec/tickets/retro-018ba26.md
- spec/tickets/the-retro-cuts-its-window.md
- spec/tickets/the-retro-lays-its-leaves.md
- spec/tickets/the-retro-runs.md
- spec/tickets/the-retro-takes-the-box.md
- spec/tickets/the-runtime-folder-holds-state.md
- src/doors/disk.js
- src/doors/fake/disk.js
- src/scripts/cli-doors.js
- src/scripts/guidance-hand.js
- src/scripts/hand.js
- src/scripts/pull-chapter.js
- src/scripts/pull-hand.js
- src/scripts/pull-route.js
- src/scripts/pull-writes.js
- src/scripts/pull.js
- src/scripts/retro-collect.js
- src/scripts/retro-leaves.js
- src/scripts/retro-new.js
- src/scripts/retro.js
- src/scripts/ticket.js
- src/scripts/work-stands.js
- src/scripts/work.js
- test/contract/disk.test.js
- test/contract/pull-payload.test.js
- test/contract/stop-rules.test.js
- test/level0/hand.test.js
- test/level0/person-step.test.js
- test/level0/projection.test.js
- test/level0/pull-leaves.test.js
- test/level0/pull-steps.test.js
- test/level0/retro-collect.test.js
- test/level0/retro-leaves.test.js
- test/level0/retro-new.test.js
- test/level0/stop.test.js
- test/level0/work.test.js

<!-- the form is files -->

## verdict

<!-- pass or fail, findings one a line -->

pass

The change answers every line of the ask, and each rule it adds carries a test.

| what the ask asks | where it lands |
|---|---|
| one command mints, opens, and hands out the first leaf | `src/scripts/retro-new.js`, which calls the mint and the pull |
| the two knobs stand with their defaults | `spec/config/level0.json` and its schema |
| the projection writes the command | the retro entry in `spec/config/projections.json` |
| the tree stays clean | `git status --porcelain` answers empty, and check exits 0 |

| what the reviewing guidance asks | what stands |
|---|---|
| the branch does what the brief asks | the three command files, the sub-verb, and the owner lookup |
| the diff beyond the brief | the siblings' own work, which this branch carries alongside |
| a rule with a test proving it fires | the owner lookup takes each family and answers the right entry |
| a bad input meets a refusal | `retro new` on a name a ticket holds writes nothing and exits 1 |
| a retro handback | none stands, because this ticket runs at the desk |

One fault stands, too small to hold the ticket, and a private note carries it.

| the fault | where |
|---|---|
| the moved lookup leaves two pointers above `staleIn`, which names another chapter | `.claude/skills/level0/lib/projection.js` |

`./RUNME.sh check` exits 0 on this branch, and `node --test` passes over the two test files.

<!-- the form is verdict -->

## checked

<!-- one line per item of the checklist, on how you take it into account -->

- the `writes` key stands once in [[spec/design_output/projection]], and the code points at that chapter

<!-- the form is checklist -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
