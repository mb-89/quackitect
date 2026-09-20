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
    hand: box d42624a67d18a8
    hash_before: d248ef965fa407e15019f6460dc42588001238c9
    hash_after: 95484c2790d805874cf2fa8b06113b661095578d
  - step: design/review
    hand: box d42624a67d18a8 · claude-code
    hash_before: 8a76181190b5f8eb134bdc87e8df4d77d5925d84
    hash_after: 8a76181190b5f8eb134bdc87e8df4d77d5925d84
    returns: 1
    why: The table holds. Each row names a verb, the code behind it, and what stands after, and the rows read true against `src/scripts/work.js`.; The redraft answers one finding of the last round and leaves five. The prose under the table reads as it read before.; The six chapters of the work design output stand unnamed. The last round asked for each, and what stands in its place.; The redraft points its details at `A brief drains first`. The last round named that chapter as one the change takes away.; The cloud guidance stands unanswered. Actionable 10 sends a box's result into `HANDOVER.md`, and no row says what a box writes instead.; The handover schema stands unanswered. It governs the root brief, and it says one kind covers two paths.; The box handover stands unanswered. `copilot-runtime.js` reads `.se/HANDOVER.md` and `HANDOVER.md` in one loop, and the redraft says the brief is one file.; An implementer reading this cuts both paths. Say that `.se/HANDOVER.md` stays, and say it where the copilot row stands.; The copilot row carries one line for seven references across two modules. `copilot-dispatch.js` holds three, and `copilot-runtime.js` holds four.; Two of those seven sit inside a prompt this tree writes for a person to read. Say what that prompt says after.; The first row of `done_when` decides nothing. `./RUNME.sh branch list` names every branch a group today, and 8 groups stand with no brief among them.; The evidence field carries the two comments mint writes, above the table. Cut them, so the field reads as what a hand wrote.
  - step: design/draft
    hand: box d42624a67d18a8 · claude-code
    hash_before: d4031266a00984eae5060e8b6e705fc13b51a12f
    hash_after: d4031266a00984eae5060e8b6e705fc13b51a12f
  - step: design/review
    hand: box b99ea8ab11a8 · claude-code-remote
    hash_before: 837693c39c5df41b995f41bcdad0ef2969ae78b7
    hash_after: 837693c39c5df41b995f41bcdad0ef2969ae78b7
    returns: 2
    why: "`spec/design_output/private.md` names the root file twice, and the notes table leaves it out; `spec/design_output/schema.md` says the schema governs both files, so that note answers too; `spec/design_output/review.md` names the root file in its own table, which the draft leaves out; `BRIEF` also stands in `src/scripts/work-merge.js` and `src/scripts/work-stands.js`; the language server tests under `src/lsp` drive the root file as a governed path; the counts and the how-many column drop, because a grep answers them, and one reads stale [[spec/guidance/voice]]"
  - step: design/draft
    hand: box b99ea8ab11a8 · claude-code-remote
    hash_before: 4039a66eebd569cb12590b944f8bcd706dfbf890
    hash_after: 4039a66eebd569cb12590b944f8bcd706dfbf890
  - step: design/review
    hand: box b99ea8ab11a8 · claude-code-remote · helper-22
    hash_before: a641a4ea258f70b01d3516af38380d745c48bd81
    hash_after: a641a4ea258f70b01d3516af38380d745c48bd81
    returns: 3
    why: "`spec/design_output/work` names the brief in six further chapters, and the notes table answers none; `The listing reads git once` carries a brief row, and `A row per group` carries a brief kind; `A box landing on trunk`, `A merged branch goes` and `Why a routine needs this` each teach the brief; `The routine a verb names` says `freeNow` reads the briefs, and the draft leaves that line standing; `grep -rn BRIEF src .claude` misses the copilot lane, which reads the string literal; `grep -rln HANDOVER spec src test` leaves out `.claude`, where three modules stand; `.claude/skills/level0/lib/review.js` holds its own `BRIEF`, and no row names it; that module writes a review prompt naming the brief, and no row says what it says after; the verbs table, the copilot table and the notes table read true everywhere else"
  - step: design/draft
    hand: box b99ea8ab11a8 · claude-code-remote
    hash_before: b7c1f76819e20c5db88181277e914630eff7eea8
    hash_after: b7c1f76819e20c5db88181277e914630eff7eea8
  - step: design/review
    hand: box b99ea8ab11a8 · claude-code-remote · helper-23
    hash_before: 1e55dd707f61d05f37a1f6d15df3b1fa211f813d
    hash_after: 1e55dd707f61d05f37a1f6d15df3b1fa211f813d
  - step: implement/tests-red
    hand: box b99ea8ab11a8 · claude-code-remote
    hash_before: 9aafbfe40e6a7719b161de01776f70d9ab73f543
    hash_after: 9aafbfe40e6a7719b161de01776f70d9ab73f543
    answered:
      - name: tests
        exit: 1
        said: assertion, 1 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box b99ea8ab11a8 · claude-code-remote
    hash_before: 8c7eefa0825b8193aeaf34c9dfdd7d8347ef6054
    hash_after: 8c7eefa0825b8193aeaf34c9dfdd7d8347ef6054
    returns: 1
    why: the change spans the code, the cases, the Go cases and the notes, and this box leaves the tree green
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/change
    hand: box b99ea8ab11a8 · claude-code-remote
    hash_before: 51814ab54e01101d0ab923bb5966d3ab14a69a97
    hash_after: 51814ab54e01101d0ab923bb5966d3ab14a69a97
    returns: 2
    why: the change spans the code, the cases, the Go cases and the notes, and this box leaves the tree green
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-red
    hand: box b99ea8ab11a8 · claude-code-remote
    hash_before: 842fc913c23a7919dcb34c655c865c9d46ecb542
    hash_after: 842fc913c23a7919dcb34c655c865c9d46ecb542
    returns: 1
    why: the hand takes it back
  - step: implement/tests-red
    hand: box b99ea8ab11a8 · claude-code-remote
    hash_before: fdae28aa75157064b3bf8de8324dbb8fa4a5cbcf
    hash_after: fdae28aa75157064b3bf8de8324dbb8fa4a5cbcf
    returns: 2
    why: the case goes red only beside the change, and this box leaves the tree green
    answered:
      - name: tests
        exit: 0
        said: "# duration_ms 12445.668614"
  - step: implement/tests-red
    hand: box b99ea8ab11a8 · claude-code-remote
    hash_before: 8d3261f797e9dd711767a05e5f34b8fa8e31ca95
    hash_after: 8d3261f797e9dd711767a05e5f34b8fa8e31ca95
    returns: 3
    why: the case goes red only beside the change, and this box leaves the tree green
    answered:
      - name: tests
        exit: 0
        said: "# duration_ms 12620.990085"
  - step: implement/tests-red
    hand: box 099c2ec7708d · claude-code-remote
    hash_before: 05d5b2745ee160de1822f4f4653e60d927651071
    hash_after: b096e4ebc9843445a7415fa72df9ed8bd2a72be4
    answered:
      - name: tests
        exit: 1
        said: assertion, 1 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box 099c2ec7708d · claude-code-remote
    hash_before: 6cbdb6d0064a36e9a090315ca4c62b013e372476
    hash_after: 934280e2a9b184603d546923aafaf36334d2a048
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box 099c2ec7708d · claude-code-remote
    hash_before: 2a390b9bde6b3b28ac3e5ec0c989bd693e5a3191
    hash_after: 2a390b9bde6b3b28ac3e5ec0c989bd693e5a3191
    answered:
      - name: tests
        exit: 0
        said: green, 24 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: The rules pass.
  - step: verdict
    hand: box 099c2ec7708d · claude-code-remote · helper-20
    hash_before: cbe5bc0b8305cbfad1a524eaf49126832c6b121f
    hash_after: ca61e937d707c1f7fa2b2c03ddbf167c20fe8dea
    returns: 1
    why: "`work-stands.js` drops `COL.kind`, and `work-list.js` still pads the queue place with it; the queue listing shifts its name column past single digits, because `padStart(undefined)` pads nothing; `USAGE` in `branch-usage.js` names the `new` verb, and `work.js` drops it from the verb table; `./RUNME.sh branch new <name>` prints the usage, so the row sends a reader at a verb that goes; the branch drops the case over `done` refusing a branch trunk stands ahead of; `ready` in `work.js` refuses a branch behind trunk, and no case drives that refusal; fix: give the queue place a width `work-list.js` owns, and cut the `new` row from `USAGE`; fix: drive `ready` on a branch behind trunk, so the refusal carries a case; `branch review` reads no retro on the handback, and the retro step after this one writes it; the rest reads true: every verb reads the group ticket, and `./RUNME.sh check` exits zero"
  - step: implement/reflect
    hand: box 099c2ec7708d · claude-code-remote
    hash_before: 8731aaef4ae5f58dc71e7e0c13147e007b55be9b
    hash_after: 8731aaef4ae5f58dc71e7e0c13147e007b55be9b
  - step: implement/change
    hand: box 099c2ec7708d · claude-code-remote
    hash_before: 544be3d8524f833be7d93ad20be04280e22c27cd
    hash_after: 544be3d8524f833be7d93ad20be04280e22c27cd
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box 099c2ec7708d · claude-code-remote
    hash_before: ed7fd895604b23075ae0e82c113ff3f7518ee9e4
    hash_after: ed7fd895604b23075ae0e82c113ff3f7518ee9e4
    answered:
      - name: tests
        exit: 0
        said: green, 24 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: The rules pass.
  - step: verdict
    hand: box 099c2ec7708d · claude-code-remote · helper-24
    hash_before: fc7526341b9e2d2280ff515fc616ccae1dd08567
    hash_after: fc7526341b9e2d2280ff515fc616ccae1dd08567
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

The branch verbs read a group alone, and the brief code goes with them:

- `take` over a brief
- `done` over a brief
- `read` and `review` over a brief
- `release` over a brief
- the brief file the copilot lane reads

Every brief has merged, so the verbs carry two roads and walk one. A reader of the work verbs learns the brief first, and the brief left the tree.

- `./RUNME.sh branch list` names every branch as a group
- `./RUNME.sh check` answers 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

`HANDOVER.md` at the root goes, `.se/HANDOVER.md` stays, and the group ticket takes the brief's work.

`grep -rn HANDOVER spec src test .claude` names every reader, note and case. The constant `BRIEF` names fewer, because the copilot lane reads the string itself.

| the file | what it carries | after |
|---|---|---|
| `HANDOVER.md`, tracked, on a work branch | the brief | goes |
| `.se/HANDOVER.md`, untracked, on any box | the session | stays |

| where the brief stands | what stands after |
|---|---|
| `take`, and the claim behind it | the group claim alone, so `freeIn` answers groups |
| `done`, and the drop behind it | the group's leaves road alone |
| `read` and `review` | the group ticket as the text they show |
| `release`, and the status it writes | the group's record, which `letGo` already writes |
| `list`, which names a kind | the one kind, so the column goes |
| `new`, which takes a brief off trunk | the group ticket, which the mint writes |
| `BRIEF` in `src/scripts/work-stands.js` | goes, with the readers above |
| `BRIEF` in `.claude/skills/level0/lib/review.js` | goes, and its review prompt names the group ticket |
| `src/scripts/work-merge.js` | the group ticket, at the path the ticket names |

The copilot lane reads the string itself:

| where | what stands after |
|---|---|
| `copilot-dispatch.js`, the read at the claim | the group ticket, at the path the ticket names |
| `copilot-dispatch.js`, inside its prompts | the prompts name the group ticket |
| `copilot-runtime.js`, the status read | the group's own state |
| `copilot-runtime.js`, the loop over both paths | the loop reads `.se/HANDOVER.md` alone |
| `copilot-runtime.js`, the result read | the group ticket |

[[spec/design_output/work]] names the brief in these chapters, and each answers:

| the chapter | what stands after |
|---|---|
| Scope | the group on the branch, and the brief line goes |
| What a work branch is | the group ticket names the branch |
| A brief drains first | goes whole, because one road stands |
| The listing reads git once | the reads table drops its brief row |
| A row per group | the kind column goes, and the row reads one kind |
| Two handovers | one handover, and the table reads one row |
| The round trip | the trip runs through the group ticket |
| Every brief carries the contract | goes, because the pull's hand-out says it |
| A box landing on trunk | the group ticket, which trunk carries |
| A merged branch goes | the merge drops the brief line |
| Why a routine needs this | the take prints the group's ask |
| The routine a verb names | `freeNow` answers off the group tickets |

Each note outside that one answers too:

| the note | what stands after |
|---|---|
| [[spec/design_output/private]] | the rows and the door line name `.se/HANDOVER.md` alone |
| [[spec/design_output/schema]] | the schema line names `.se/HANDOVER.md` alone |
| [[spec/design_output/review]] | the brief row and the handback row read the group ticket |
| [[spec/guidance/cloud]] | a box writes its result into the group's retro |
| [[spec/schemas]] | the handover kind keeps `.se/HANDOVER.md`, and drops the root file |

`test/level0` drives the brief road, and `src/lsp` drives the root file as a governed path. Each case moves to the group ticket it stands for, and the schema case drops the root path.

A fixture holding the name as a string stays, because it reads the same either way.

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->
<!-- the form is verdict -->

pass

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test test/level0/work.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The case seeding a branch with both a root handover and a group ticket goes red. `standingAll` reads the handover first, so the row draws `brief  held` where the group's own `todo  urgent` belongs.

What surprises: the field stood on `./RUNME.sh test`, whose last line is a duration, so the gate read no word from a run that failed. `./RUNME.sh branch test` is the verb answering one word, and the step's `needs` already names it.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the case lands in `test/level0/work.test.js`, which the ask's own command names
- the case drives `doorsSaying`, so git and the disk stand fake
- the comment over the case points at this ticket, and the approach under `design/draft` names every place

## reflect

<!-- names the class of error in the findings, and the fix for the class -->

### class

<!-- the class of error the findings describe, and the fix for the class -->
<!-- the form is text -->

A cut leaves its readers standing. Each finding names one name this branch drops, and one place still reaching for it.

| what the cut drops | what still reaches for it |
|---|---|
| `COL.kind` | `work-list.js`, padding the queue place with it |
| the `new` verb | `USAGE`, which keeps its row |
| a case over `ready` | the refusal stands, and no case drives it |

The fix for the class runs in three reads:

- grep the tree for every name the cut drops, and read each hit
- grep for every verb the cut drops, so its usage row goes with it
- for each case the cut deletes, ask what code it drives, and whether that code stands

A cut leaving the code standing takes a case with it, and the last read catches that one.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the fix touches `work-list.js`, `branch-usage.js` and the work cases, each a file the change already reaches
- git and the disk stand faked through `doorsSaying`, as the case over `ready` drives them
- the class above names the approach the fix follows, and each hunk carries it

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the fix touches `work-stands.js`, `work-list.js`, `branch-usage.js` and two case files the change already reaches
- git and the disk stand faked through `doorsSaying`, which both new cases drive
- the class under `implement/reflect` names the approach each hunk follows

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh branch test test/level0/work.test.js

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The brief left the tree. A work branch carries its group ticket under `spec/tickets`, and every verb reads that one note.

Each verb walked two roads before, one for a branch carrying the root handover and one for a branch carrying a group. Each walks the group road alone now:

| the verb | what it reads now |
|---|---|
| `take` | the group's record, and it prints the ask |
| `done` | the group's leaves, and it writes `hash_after` |
| `release` | the group's record, which `letGo` already writes |
| `read` and `review` | the group ticket as the text they show |
| `list` | the one kind, so the kind column goes |
| `merge` | the group's state, and it drops no file |
| `new` | goes, because the mint writes the ticket and `open` pushes the branch |

The copilot lane read the root file three ways: the claim, the standing at session start, and the result at the end. Each reads the group ticket now, through `groupStanding`. Its loop over two handover paths reads the session handover alone.

Three more things move with it:

- the review lane calls its first question the ask, and its prompt shows the group ticket
- `retroIn` goes, because `retroOnTicket` is the one road left
- the session handover stays, and its schema governs that one path

The verdict round caught three readers the cut left standing, and each takes its fix:

| what the cut drops | what stands now |
|---|---|
| `COL.kind` | `COL.place`, which the queue listing pads with |
| the `new` verb | `USAGE` drops its row, so the usage names the verbs that stand |
| a case over `ready` | a group case drives the refusal, and a second drives the queue width |

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every fact the change adds stands in one place, and the notes point at the file holding it
- the column widths stand in `COL`, and the queue place takes its own name there
- each header says what its file is for, and counts nothing

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->
<!-- the form is files -->

- spec/tickets/the-brief-verbs-go.md
- spec/tickets/the-verbs-take-the-shell.md
- spec/design_output/work.md
- spec/design_output/review.md
- spec/design_output/copilot.md
- spec/design_output/private.md
- spec/design_output/schema.md
- spec/guidance/cloud.md
- spec/guidance/review/reviewing.md
- spec/schemas/handover.schema.yaml
- spec/vocabulary/terms.yml
- spec/funnel/level-zero-closes.md
- src/scripts/work.js
- src/scripts/work-stands.js
- src/scripts/work-list.js
- src/scripts/work-merge.js
- src/scripts/branch-usage.js
- src/lsp/schema_test.go
- src/yaml/yaml_test.go
- .claude/skills/level0/lib/copilot-dispatch.js
- .claude/skills/level0/lib/copilot-runtime.js
- .claude/skills/level0/lib/review.js
- test/level0/work.test.js
- test/level0/work-group.test.js
- test/level0/work-orphan.test.js
- test/level0/work-open.test.js
- test/level0/work-answer.test.js
- test/level0/review.test.js
- test/level0/copilot-runtime.test.js
- test/level0/copilot-dispatch.test.js

## verdict

<!-- pass or fail, findings one a line -->
<!-- the form is verdict -->

pass

- `COL.place` stands in `work-stands.js`, and `work-list.js` pads the queue place with it
- a case asserts every queue place pads to one width, so the names line up
- `USAGE` drops its `new` row, and the verb table in `work.js` names no `new`
- a group case drives `ready` on a branch behind trunk, and reads the sync line back
- a case drives `done` on a branch carrying no group, so that refusal stands covered
- `./RUNME.sh check` exits 0, and `./RUNME.sh branch list` names every branch with no kind column
- every branch verb, the copilot lane and the review lane read the group ticket alone
- the notes, the schema and `terms.yml` answer, and no reader of the root file stands
- `copilot-runtime.js` asks a box for a fresh result and retro in `.se/HANDOVER.md`, as trunk asks
- that wording stands outside the ask, and the ticket's retro chapter owns the retro
- the Go fixtures name the root path as a string, which the approach keeps
- `spec/funnel` and `spec/design_input` teach the brief, and the ask leaves that record alone
- `branch review` reads no retro on the handback, and the retro step after this one writes it

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- `COL.place`, `ORPHAN` and `baseOnTrunk` each stand in one file, and the notes point there

# Discussion

The two rounds agree on the code and part on the tree. The table says which verb loses which half, and the notes teaching the brief stand as they stand.

The order the redraft takes is the safe one. `HANDOVER.md` at the root goes, and `.se/HANDOVER.md` stays, because the schema calls the second a session. A draft saying so in one line clears the largest risk this change carries.
