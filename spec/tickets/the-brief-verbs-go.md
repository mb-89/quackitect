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
step: implement/tests-red
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

./RUNME.sh branch test test/level0/work-brief-goes.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The case seeds a branch carrying both a root handover and a group ticket. The listing reads the handover, so the kind column says `brief` where the ask wants `group`.

What surprises: the two roads stand so close that one fixture holds both. `standingAll` reads the brief first, so the group's own standing hides behind a file the merge already drains.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the case stands in a file of its own, because `work.test.js` sits at the ceiling
- the case drives `doorsSaying`, so git and the disk stand fake
- the header names the one brief a work branch carries, and points at its chapter

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

./RUNME.sh lint

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- this leaf lands no hunk, so it touches no file the ask leaves out
- the case standing red drives `doorsSaying`, so git and the disk stand fake
- the approach under `design/draft` names every place, and this leaf adds nothing beside it

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
