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
group: the-verbs-take-the-shell
process: [[spec/processes/standard]]
process_hash: 838dd6d003506639
step: design/review
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

The schema calls both files a handover, and the two carry different things. `HANDOVER.md` is the brief this ticket removes. `.se/HANDOVER.md` is a session one box hands the next, and it stands as it stands.

| the file | what it carries | after |
|---|---|---|
| `HANDOVER.md`, tracked, on a work branch | the brief | goes |
| `.se/HANDOVER.md`, untracked, on any box | the session | stays |

`grep -rn BRIEF src .claude` names every reader, and `grep -rln HANDOVER spec src test` names every note and case.

| where the brief stands | what stands after |
|---|---|
| `take`, and the claim behind it | the group claim alone, so `freeIn` answers groups |
| `done`, and the drop behind it | the group's leaves road alone |
| `read` and `review` | the group ticket as the text they show |
| `release`, and the status it writes | the group's record, which `letGo` already writes |
| `list`, which names a kind | the one kind, so the column goes |
| `new`, which takes a brief off trunk | the group ticket, which the mint writes |
| `src/scripts/work-merge.js` and `src/scripts/work-stands.js` | the group ticket, at the path the ticket names |

Every branch on this box carries a group, so each verb walks the group road and the other road stands dead. The change reads each verb, cuts the brief half, and leaves the group half as it stands.

The copilot lane, read by read:

| where | what stands after |
|---|---|
| `copilot-dispatch.js`, the read at the claim | the group ticket, at the path the ticket names |
| `copilot-dispatch.js`, inside its prompts | the prompts name the group ticket |
| `copilot-runtime.js`, the status read | the group's own state |
| `copilot-runtime.js`, the loop over both paths | the loop reads `.se/HANDOVER.md` alone |
| `copilot-runtime.js`, the result read | the group ticket |

Each note naming the brief answers:

| the note | what stands after |
|---|---|
| work, What a work branch is | the group ticket names the branch, and the brief line goes |
| work, A brief drains first | goes whole, because one road stands |
| work, What the status says | the group's `state` and its record say it |
| work, Two handovers | one handover, and the table reads one row |
| work, The round trip | the trip runs through the group ticket |
| work, Every brief carries the contract | the contract goes, because the hand-out says it |
| [[spec/design_output/private]] | the rows and the door line name `.se/HANDOVER.md` alone |
| [[spec/design_output/schema]] | the schema line names `.se/HANDOVER.md` alone |
| [[spec/design_output/review]] | the brief row and the handback row read the group ticket |
| [[spec/guidance/cloud]] | a box writes its result into the group's retro |
| [[spec/schemas]] | the handover kind keeps `.se/HANDOVER.md`, and drops the root file |

The rows above under `work` stand in [[spec/design_output/work]], chapter by chapter.

`test/level0` drives the brief road, and `src/lsp` drives the root file as a governed path. Each case moves to the group ticket it stands for, and the schema case drops the root path.

`withContract` writes the routine's steps into a brief, and the pull's hand-out says the same to a hand. So the contract goes with the brief, and `branch new` takes a group name in place of a file.

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->
<!-- the form is verdict -->

fail

- `spec/design_output/private.md` names the root file twice, and the notes table leaves it out
- `spec/design_output/schema.md` says the schema governs both files, so that note answers too
- `spec/design_output/review.md` names the root file in its own table, which the draft leaves out
- `BRIEF` also stands in `src/scripts/work-merge.js` and `src/scripts/work-stands.js`
- the language server tests under `src/lsp` drive the root file as a governed path
- the counts and the how-many column drop, because a grep answers them, and one reads stale [[spec/guidance/voice]]

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

The two rounds agree on the code and part on the tree. The table says which verb loses which half, and the notes teaching the brief stand as they stand.

The order the redraft takes is the safe one. `HANDOVER.md` at the root goes, and `.se/HANDOVER.md` stays, because the schema calls the second a session. A draft saying so in one line clears the largest risk this change carries.
