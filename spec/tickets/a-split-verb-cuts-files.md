---
kind: [[ticket]]
state: closed
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
group: the-verbs-take-the-shell
process: [[spec/processes/standard]]
process_hash: 838dd6d003506639
step: verdict
record:
  - step: design/draft
    hand: box b99ea8ab11a8 · claude-code-remote
    hash_before: 258c594894a140c023429cb14b35509ce9f17ed6
    hash_after: 258c594894a140c023429cb14b35509ce9f17ed6
  - step: design/review
    hand: box 099c2ec7708d · claude-code-remote
    hash_before: 9ba66489302a66beb6191050d36b1eb605d31e44
    hash_after: 9ba66489302a66beb6191050d36b1eb605d31e44
    returns: 1
    why: "the mint says nothing about a second refusal, so one file past the ceiling takes a ticket each time; say which hand runs the mint: the door itself, or the hand the refusal names; the journal's writer reads as a verb. Name `src/bridge/apply.js`, the batch edit behind the patch and replace tools; the flags table stands here and in the level0 note. Say which of the two owns it; the ask names `./RUNME.sh test`, and the approach names no case file the cut and the mint land in; `sizeFaults`, `FILE_RULE`, `journalOf` and the `trivial` process all stand, and the ceiling chapter takes the verb; `./RUNME.sh lint src test` answers clean, so the verb guards the next file and cuts none today"
  - step: design/draft
    hand: box 099c2ec7708d · claude-code-remote
    hash_before: 3d23fed7b1fbe96664ed331b1035f7dd38f599bb
    hash_after: 3d23fed7b1fbe96664ed331b1035f7dd38f599bb
  - step: design/review
    hand: box 099c2ec7708d · claude-code-remote · helper-4
    hash_before: 141fb7a55dceafdff6b4f7c437e82fd05c5c9177
    hash_after: 141fb7a55dceafdff6b4f7c437e82fd05c5c9177
    returns: 2
    why: the verb's code takes no owner file here. `src/scripts/cli.js` holds the verbs table, and each verb takes a module; the mint on refusal takes no owner file. `src/bridge/code.js` holds the door reading `grows`; the minted ticket's fields stand unnamed. `trivial` asks `gain`, `breaks` and `done_when`, so the door fills three; the minted ticket's path and `group` stand unnamed, so the implementer picks both; the journal entry's `on` and `by` stand unnamed. The command line carries no undo verb, and the `undo` tool takes the newest entry; the size lib holds `sizeFaults`, `FILE_RULE` and `grows`; the undo lib holds `journalOf`, and `spec/processes` holds `trivial`; `src/bridge/apply.js` stands as the batch edit behind the patch and replace tools; `spec/design_output/level0.md` holds `The size ceiling`, so the flags table takes an owner; `./RUNME.sh lint src/scripts` and `./RUNME.sh lint src test` both answer the rules pass; the earlier read's seven findings each take an answer here
  - step: design/draft
    hand: box 099c2ec7708d · claude-code-remote
    hash_before: e9d0693219c480673f64f0613014f0cc2459ae65
    hash_after: e9d0693219c480673f64f0613014f0cc2459ae65
  - step: design/review
    hand: box 099c2ec7708d · claude-code-remote · helper-6
    hash_before: 36ee3423bfe8ec7c11b64c6ea095f9af1d9bc905
    hash_after: 36ee3423bfe8ec7c11b64c6ea095f9af1d9bc905
  - step: implement/tests-red
    hand: box 099c2ec7708d · claude-code-remote
    hash_before: 30f525827f4e3999043b9a6c8c101d06911b2dab
    hash_after: 30f525827f4e3999043b9a6c8c101d06911b2dab
    answered:
      - name: tests
        exit: 1
        said: assertion, 6 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box 099c2ec7708d · claude-code-remote
    hash_before: cb7d8c850e3b189311c3e5afa092ac7d37d02325
    hash_after: cb7d8c850e3b189311c3e5afa092ac7d37d02325
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box 099c2ec7708d · claude-code-remote
    hash_before: abd8ba20a9c5eec60b34dae06cca73675d6f22f6
    hash_after: abd8ba20a9c5eec60b34dae06cca73675d6f22f6
    answered:
      - name: tests
        exit: 0
        said: green, 9 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: The rules pass.
  - step: verdict
    hand: box 099c2ec7708d · claude-code-remote · helper-11
    hash_before: 272b2ce68a0fa531211fc60e55668c1e31474cf7
    hash_after: 272b2ce68a0fa531211fc60e55668c1e31474cf7
    returns: 1
    why: "the verb reads a target as its source: `splitVerb` slices `argv`, and `rest` carries no verb name; so `./RUNME.sh split <file>` cuts the file `--to` names, and the ask's first bullet stands unmet; the mint the door runs comes back refused: `gain names no field of a ticket note`; `trivial` asks `gain`, `breaks` and `done_when` under the ask, and the mint takes frontmatter fields alone; `splitTicket` reads a refused mint as silence, so a live refusal names no ticket; `ticketFor` builds `.se/tickets/split-<name>.md`, and the chapter names `spec/tickets/split-<name>.md`; the design review's note for implement stands unanswered: `splitTicket` reads existence, so a closed ticket blocks the mint; the approach names an open ticket, and the code reads any file standing at that path; `fakeProc` answers every argv the same, so the mint case asserts a call the real mint refuses; no case drives `codeDoor` past the file ceiling with a `proc` door, so the new branch fires under no test; the journal names `on` as `split`, and the approach names `on` as the session the write runs under; the retro stands absent from the handback, which `./RUNME.sh branch review` names; `./RUNME.sh check` exits 0, and `./RUNME.sh lint src/scripts` exits 0; `export { join }` at the foot of `src/scripts/split-verb.js` reaches nobody"
  - step: implement/reflect
    hand: box 099c2ec7708d · claude-code-remote
    hash_before: e84f2499e217aaecafe44ed3c980d62427b55d6c
    hash_after: e84f2499e217aaecafe44ed3c980d62427b55d6c
  - step: implement/change
    hand: box 099c2ec7708d · claude-code-remote
    hash_before: e00516c2f8b2282ea09a6c35446c567cc01bfc89
    hash_after: e00516c2f8b2282ea09a6c35446c567cc01bfc89
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box 099c2ec7708d · claude-code-remote
    hash_before: 140f3894a58a511421b9bb549151fb1a7267e426
    hash_after: 140f3894a58a511421b9bb549151fb1a7267e426
    answered:
      - name: tests
        exit: 0
        said: green, 10 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: The rules pass.
  - step: verdict
    hand: box 099c2ec7708d · claude-code-remote · helper-15
    hash_before: e96b5bb7e4ca88e3294e5440b80a91a98c8e6d31
    hash_after: e96b5bb7e4ca88e3294e5440b80a91a98c8e6d31
    returns: 2
    why: "`noteFor` reads the basename alone, so `src/bridge/code.js` and `src/doors/code.js` name one note; the second long file takes `names this cut already`, so its own cut parks nowhere; this tree holds many basenames twice, and no case feeds `noteFor` two paths of one name; fix: carry a folder word into the name, inside the five the name rule allows; `wrote` writes the journal entry, then throws ENOENT where a target's folder stands nowhere; the run answers a stack, and the reflect chapter asks for a line; `src/bridge/apply.js` answers a line on that same throw, so the journal's owner stands as the model; fix: make the target's folder, or refuse the range with the line the verb says; `--to` over a standing file replaces it whole, and the journal alone carries it back; the command line cuts a scratch file into two targets, and `mcp__level0__undo` takes the whole cut back; the ranges refuse a backwards range, a zero start, a reach past the end and an overlap; `--dry` names the cuts and writes nothing; `splitVerb` reads `rest` whole, so the source stands where the caller names it; the note parks through `./RUNME.sh ticket note`, off git, and `test/contract/split-note.test.js` drives it for real; `splitTicket` reads the exit, so a refused run answers `stands unwritten`; `test/level0/code-door.test.js` drives the door's branch both ways, and `fakeProc` throws on an untaught command; the journal names `on` as the run, and `mcp__level0__undo` takes the newest entry back; `export { join }` stands gone from `src/scripts/split-verb.js`; `./RUNME.sh check` exits 0, `./RUNME.sh lint src/scripts` exits 0, and `./RUNME.sh test` passes; the diff holds the verb, the cut, the note, the door, the chapter and three case files; every hunk serves the ask, and one chapter stands beside the code; the handback's retro chapter stands empty, which `./RUNME.sh branch review` names"
  - step: implement/reflect
    hand: box 099c2ec7708d · claude-code-remote
    hash_before: 8d452d4a7c237643bfdf15b8ac36966cb194de22
    hash_after: 8d452d4a7c237643bfdf15b8ac36966cb194de22
  - step: implement/change
    hand: box 099c2ec7708d · claude-code-remote
    hash_before: 7986db8c0750c1a2328025fb00d298c0fb2f467a
    hash_after: 7986db8c0750c1a2328025fb00d298c0fb2f467a
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box 099c2ec7708d · claude-code-remote
    hash_before: 5cbae2965ef4cb76f3bef4d03f3c74b511f7365e
    hash_after: 5cbae2965ef4cb76f3bef4d03f3c74b511f7365e
    answered:
      - name: tests
        exit: 0
        said: green, 13 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: The rules pass.
  - step: verdict
    hand: box 099c2ec7708d · claude-code-remote · helper-19
    hash_before: 41157eb406684309f3093d90845630cf9f058de2
    hash_after: 41157eb406684309f3093d90845630cf9f058de2
reason: done
---

# Ask

A file past the ceiling comes down by a verb, and the work it blocks carries on.

Every write to a long file meets a refusal, and hands squeeze lines to get past it.

- `./RUNME.sh split <file>` takes line ranges and target files, and keeps its own undo.
- A ceiling refusal on a file already past the ceiling mints a split ticket and names it.
- `./RUNME.sh lint src/scripts` names no FileCeiling after the splits land.
- `./RUNME.sh test` covers the verb and the minted ticket.

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->
<!-- the form is text -->

`./RUNME.sh split <file>` cuts by range into targets, and the journal that already stands takes it back.

| the flag | what it takes |
|---|---|
| `<file>` | the file the cut reads |
| `--to <path> --lines <from>-<to>` | one target and the range it takes, named again for each target |
| `--dry` | the cuts it would write, and no write |

Where the code lands:

| the piece | its file |
|---|---|
| the verb | `src/scripts/split-verb.js`, which `src/scripts/cli.js` names in the verbs table |
| the mint on a refusal | `src/bridge/code.js`, the one caller of `grows` |
| the ranges and the cut over text | `src/scripts/split-cut.js`, which the cases drive in memory |

What each piece calls:

| what it needs | what stands |
|---|---|
| the ceiling and the faults | `sizeFaults` and `FILE_RULE`, under `.claude/skills/level0/lib/size.js` |
| the undo | the journal under `.claude/skills/level0/lib/undo.js` |
| the journal's writer | `src/bridge/apply.js`, the batch edit behind the patch and replace tools |
| the ticket | `./RUNME.sh mint ticket <path> --process=trivial` |

The verb writes every target and the rest of the source through the journal, in one entry. The entry names `on` as the session the write runs under and `by` as `split`, so `mcp__level0__undo` takes the whole cut as its newest entry. The command line carries no undo verb, and this change adds none.

The refusal that mints:

- the write door reads `grows`, so a file past the ceiling takes a cut and refuses a growth
- `src/bridge/code.js` mints, and the refusal names the ticket it writes
- the ticket lands at `spec/tickets/split-<name>.md`, off the source file's own name
- it carries no `group`, so it stands loose on trunk where a person sorts it
- the door reads `spec/tickets` first, and mints where no open split ticket names that file
- a second refusal on the same file names the standing ticket, and writes none

What the door writes into the three fields `trivial` asks for:

| the field | what the door writes |
|---|---|
| `gain` | the file comes under the ceiling, so every write to it passes the door |
| `breaks` | every write to the file meets a refusal, and a hand squeezes lines to pass |
| `done_when` | `./RUNME.sh lint <file>` names no `FileCeiling` |

Where each thing stands after:

- `spec/design_output/level0.md` owns the flags table, under `The size ceiling`
- this approach's copy is the draft that chapter takes, and no second copy lands
- `test/level0/split.test.js` holds the cases: each flag, the undo, and the mint
- a case feeds the door a file past the ceiling twice, and asserts one ticket
- `./RUNME.sh lint src test` answers clean today, so the verb guards the next file

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->
<!-- the form is verdict -->

pass

- `src/scripts/cli.js` holds the verbs table, so `src/scripts/split-verb.js` lands as one row
- `src/bridge/code.js` stands as the one caller of `grows`, so the mint takes an owner
- the size lib holds `sizeFaults`, `FILE_RULE` and `grows`
- the undo lib holds `journalOf`, and `spec/processes` holds `trivial`
- the door fills `gain`, `breaks` and `done_when`, which `trivial` asks for
- the ticket lands at a named path and stands loose on trunk, so the implementer reads both
- the journal entry names `on` and `by`, and `journalOf` takes `by` as an argument
- `spec/design_output/level0.md` holds `The size ceiling`, so the flags table takes one owner
- `test/level0/split.test.js` runs under `./RUNME.sh test`, and a case asserts one ticket on two refusals
- `./RUNME.sh lint src/scripts` exits 0 today, so the verb guards the next file
- each finding of the two earlier reads takes an answer here
- for implement: the mint refuses a path that stands, so a closed split ticket blocks a fresh mint

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test test/level0/split.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Six cases go red on their own assertions. `cutsIn` answers an empty list, and `splitText` answers the text whole, so each case reads back a shape its own claim refuses.

What surprises:

- the ranges carry three refusals of their own, before any file opens
- a range reading backwards, a range starting at zero and a range past the file each want a line
- two ranges reaching one line want a refusal too, which the cut alone can see

The verb's own file and the door's mint both wait on this pair. Each takes a case once the cut answers, because a fake disk and a fake git stand behind them.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the cases land in `test/level0/split.test.js`, which the approach names
- the cut and the ranges take text and arguments, so no door stands behind them
- the header of `src/scripts/split-cut.js` points at the chapter the approach names

## reflect

<!-- names the class of error in the findings, and the fix for the class -->

### class

<!-- the class of error the findings describe, and the fix for the class -->
<!-- the form is text -->

Each fault takes the tree's shape for granted, where the tree guarantees nothing. One assumes a name stands alone, and one assumes a folder stands.

| what the code assumes | what the tree holds |
|---|---|
| a basename names one file | dozens of names stand twice, under different folders |
| a target's folder stands | a target names a folder nothing holds yet |

The fix for the class runs in two moves:

- read what the tree holds before you key on it, so a folder word joins the name
- make what a write needs, or refuse with the line the verb says

`src/bridge/apply.js` owns the second move already. It catches the same throw the cut meets, and answers a line, so the cut follows that model.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the fix touches the note's name and the verb's write, and the cases beside each
- the disk reaches both through a door, and `fakeDisk` drives each case
- the class above names the approach each hunk follows

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the verb, the cut, the mint, the door and the chapter the approach names
- the disk, the clock and the process reach each piece as doors, and the fakes drive all three
- each header points at the chapter the approach names, and that chapter owns the flags

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh branch test test/level0/split.test.js

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

`./RUNME.sh split <file>` cuts a file into the targets a caller names, and one journal entry takes the whole cut back.

| the piece | its file |
|---|---|
| the ranges and the cut over text | `src/scripts/split-cut.js` |
| the verb, and the write through the journal | `src/scripts/split-verb.js` |
| the note a refusal parks | `src/bridge/split-ticket.js`, which the code door calls |

The ranges refuse before any file opens. Four refusals stand: a range reading backwards, a range starting at zero, a range past the last line, and two ranges reaching one line.

The refusal parks a private ticket through `./RUNME.sh ticket note`, and names where it stands:

- the note lands off git, so the retro decides it and the check stays green
- a door minting a tracked ticket leaves placeholders the lint names, which turns the check red
- a second refusal on the same file names the note that stands, and writes none
- a refused run answers the line the verb says, so no refusal goes quiet

Two verdict rounds found faults where the code takes the tree's shape for granted:

| what the code assumed | what stands now |
|---|---|
| a basename names one file | the folder above it joins the note's name |
| a target's folder stands | the write makes it, and a refusal answers a line |

`test/contract/split-note.test.js` drives the real verb, and it catches the name rule a fake hid.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every fact the change adds stands in one place, and the chapter owns the flags table
- the ranges and the cut take text alone, and a contract case drives the real verb
- each header says what its file is for, and counts nothing

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->
<!-- the form is files -->

- .claude/skills/level0/lib/folders.js
- .claude/skills/level0/lib/names.js
- .claude/skills/level0/lib/size.js
- .claude/skills/level0/lib/undo.js
- spec/config/level0.json
- spec/design_output/apply.md
- spec/design_output/level0.md
- spec/tickets/a-split-verb-cuts-files.md
- src/bridge/code.js
- src/bridge/split-ticket.js
- src/scripts/cli-check.js
- src/scripts/cli.js
- src/scripts/split-cut.js
- src/scripts/split-verb.js
- test/contract/split-note.test.js
- test/level0/code-door.test.js
- test/level0/split.test.js

## verdict

<!-- pass or fail, findings one a line -->
<!-- the form is verdict -->

pass

- `noteFor` joins the folder above the file, so `src/bridge/code.js` and `src/doors/code.js` name two notes
- `noteFor` over every sized file this tree tracks answers one name each, and no name stands twice
- the note name stands inside the cap `names.words` sets
- `wrote` makes each target's folder, so a target under a folder nothing holds yet lands
- the live cut writes `.se/scripts/fresh/a.txt`, and no folder stands there before the run
- the journal write takes its own guard, so a refusal there writes no target
- a refused write answers one line, and names the entry holding the way back
- a case asserts no stack reaches the reader on that refusal
- `./RUNME.sh split` cuts a scratch file into two targets, and `mcp__level0__undo` takes all three back
- the ranges refuse a backwards range, a zero start, a reach past the end and an overlap
- `--dry` names the cuts and writes nothing
- the code door mints on `FileCeiling` alone, and a function ceiling parks no note
- `test/contract/split-note.test.js` drives the real verb, and the note lands off git
- a refused mint answers the verb's own line, so no refusal goes quiet
- `./RUNME.sh check` exits 0, `./RUNME.sh lint src/scripts` exits 0, and `./RUNME.sh test` passes
- every hunk serves the ask, and the chapter beside the code owns the flags
- note: the verb with no source takes the first `--to` target as its source
- note: the dry run names that target twice, and the journal takes the cut back
- note: refuse where the source names a target, so the verb answers a line
- note: the retro stands absent from the handback, which `./RUNME.sh branch review` names
- note: this verdict sends the ticket to retro, where that chapter takes its line

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the chapter owns the flags table, and `USAGE` carries one terminal line with a comment naming that owner
- `TICKETS` in `folders.js` owns the note folder, so `split-ticket.js` points and names no path
- the journal shape stands in `undo.js`, and each header points at the chapter owning it
- the approach's flags table copies the chapter's, which the approach itself names as the draft

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
