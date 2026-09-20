---
kind: [[ticket]]
state: closed
urgent: true
step: design/person-1
steps:
  - name: design
    reads: [[spec/guidance/voice]]
    steps:
      - name: person-1
        does: answers the question the engine asks
        by: person
        to: engine
        asks: "design/review failed back 2 times: | the question reviewing asks | the answer |; |---|---|; | does the approach answer the ask | yes for the two scripts, and the command line stands open |; | is what the diff touches beyond the ask trivial | yes, the commit writes this ticket alone |; | what does `./RUNME.sh check` answer | 0, with the server standing |; | does a retro stand in the handback | no, and `branch review` names it as the last fix the branch owes |; | does every claim the approach makes carry a proof | yes, the lint and the check answer each one |; TL;DR:; Every finding of the last round closes for the pull and the work verb.; Each chapter the two tables name stands in the design output today.; The command line keeps its modules in prose, and names a chapter for none of them.; The file row counts the test files, and the table under it lists fewer.; The findings, one a line:; The command line's modules name no chapter. Name one a module, as the pull and work tables do.; The file row writes a count of test files, and the table under it lists fewer.; The voice asks for the command answering a count. Cut that number, and name `./RUNME.sh lint test/level0`.; What the agent needs:; | number | need | status |; |---|---|---|; | 1 | the draft names a chapter for each command line module | open |; | 2 | the file row drops its count and names the lint | open |; | 3 | the review hand reads the approach again | open |"
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
process: [[spec/processes/standard]]
process_hash: 838dd6d003506639
record:
  - step: design/draft
    hand: box 0fc2b4132f94 · claude-code-remote
    hash_before: 4e539df340aeedf85645ff9bc65d83cd5bdf2519
    hash_after: 4e539df340aeedf85645ff9bc65d83cd5bdf2519
  - step: design/review
    hand: box 0fc2b4132f94 · claude-code-remote · helper-2
    hash_before: 3645f8ce7ee0777f9d5d33dd834fb12d4598cac8
    hash_after: 3645f8ce7ee0777f9d5d33dd834fb12d4598cac8
    returns: 1
    why: "Cut `test/level0/schema.test.js` as well, because it stands past the ceiling and the approach leaves it out.; That test drives the schema reader, so the split of the three scripts hands it no subject.; Until it comes down, `./RUNME.sh lint test/level0` names `FileCeiling`, and the ask's second item stands open.; Name the head every minted module writes: a line on what it holds, then its design output link.; The approach answers that item with the module's name alone, and a name says less than a head.; Point each pull module at a chapter that stands: the leaf, the stand and the verb name none.; The work module the reading names no chapter of `spec/design_output/work` either.; Name `./RUNME.sh check` among the proofs, because the ask asks for its exit.; The cut list for the pull and the work verb holds, and each cut moves a function whole.; `./RUNME.sh check` exits 0 on this commit."
  - step: design/draft
    hand: box 0fc2b4132f94 · claude-code-remote
    hash_before: e2019e2997f16ecc93a3a9785911b6b35208dbeb
    hash_after: e2019e2997f16ecc93a3a9785911b6b35208dbeb
  - step: design/review
    hand: box 220c71584772 · claude-code-remote
    hash_before: eea1f6bc300d1a5881096fbfff9654e4e4620402
    hash_after: eea1f6bc300d1a5881096fbfff9654e4e4620402
    returns: 2
    why: "| the question reviewing asks | the answer |; |---|---|; | does the approach answer the ask | yes for the two scripts, and the command line stands open |; | is what the diff touches beyond the ask trivial | yes, the commit writes this ticket alone |; | what does `./RUNME.sh check` answer | 0, with the server standing |; | does a retro stand in the handback | no, and `branch review` names it as the last fix the branch owes |; | does every claim the approach makes carry a proof | yes, the lint and the check answer each one |; TL;DR:; Every finding of the last round closes for the pull and the work verb.; Each chapter the two tables name stands in the design output today.; The command line keeps its modules in prose, and names a chapter for none of them.; The file row counts the test files, and the table under it lists fewer.; The findings, one a line:; The command line's modules name no chapter. Name one a module, as the pull and work tables do.; The file row writes a count of test files, and the table under it lists fewer.; The voice asks for the command answering a count. Cut that number, and name `./RUNME.sh lint test/level0`.; What the agent needs:; | number | need | status |; |---|---|---|; | 1 | the draft names a chapter for each command line module | open |; | 2 | the file row drops its count and names the lint | open |; | 3 | the review hand reads the approach again | open |"
group: guidance-rides-the-step
reason: became
successors: [a-person-reads-the-split]
---

# Ask

Every script the engine runs comes under `code.fileLines`, so the write door takes a growth again.

The door refuses a growth on a file already past its ceiling, and takes a cut. So every change to the pull or the work verb carries a larger cut with it, in the same write. That cost lands on work having nothing to do with the file's size.

What breaks where nobody does it: each change to these files pays the same toll again, and the toll grows as the files do.

- `./RUNME.sh lint src/scripts` names no `FileCeiling`
- `./RUNME.sh lint test/level0` names no `FileCeiling`
- every module the split mints heads with what it is for, and says it once
- `./RUNME.sh check` exits 0 on the branch

For the change paying this toll, see [[spec/tickets/guidance-rides-step]].

# design

## person-1

<!-- answers the question the engine asks -->

### answer

<!-- the answer, which the step behind this one reads -->

<!-- the form is text -->

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

| the ask asks | the approach answers |
|---|---|
| which files come down | the pull, the work verb, the command line, and four test files |
| what decides a cut | a chapter that already stands in the design output |
| what moves | whole functions, with the text they hold, and nothing else |
| what each module heads with | a line on what it holds, then the link to that chapter |
| what proves the move | the tests standing today, and the lint and the check after each cut |

TL;DR:

- No behaviour changes. Every cut moves a function whole, and its callers import it back.
- Each cut lands as its own write, because the door reads a file before and after.
- The pull comes down first, because the work verb and the tests read it.
- Each module points at a chapter standing in the design output today, and names no new one.

The pull, by topic:

| the module | what it takes | the chapter it heads with |
|---|---|---|
| the verb | the flags, the roads the verb takes, and the judge's material | [[spec/design_output/pull#the-answers]] |
| the stand | which tickets stand, which are takeable, and which wait | [[spec/design_output/pull#children-before-their-group]] |
| the hand-out | the offer, the hold and the spawn prompt | [[spec/design_output/pull#the-hand-and-the-hold]] |
| the answer | the work answer, the leaf's chapter and its fields | [[spec/design_output/pull#the-work-answer]] |
| the checks | the forms, the voice, the commands and the hand rules | [[spec/design_output/pull#the-checks]] |
| the hand-back | passed, failed, became, refused, and the record each writes | [[spec/design_output/pull#the-hand-back]] |

The work verb, by topic:

| the module | what it takes | the chapter it heads with |
|---|---|---|
| the round trip | new, take, sync, done and release | [[spec/design_output/work#the-round-trip]] |
| the trunk | merge, close and what reads as merged | [[spec/design_output/work#a-merged-branch-closes]] |
| the reading | read, review and list | [[spec/design_output/work#what-the-standing-says]] |

The command line comes down the same way, one module per verb group, each heading with the chapter its verbs serve.

The tests, by subject:

| the test file | what it drives |
|---|---|
| the pull test | one file per pull module, each beside its subject |
| the work test | one file per work module |
| the schema test | the schema reader, cut along the readers it drives |

Every module heads with a line saying what it holds, then the link above. It counts nothing and lists no section, as the code guidance asks.

| proof | claim |
|---|---|
| every test standing today | the tree answers the same before and after each cut |
| `./RUNME.sh lint src/scripts` | no `FileCeiling` stands |
| `./RUNME.sh lint test/level0` | no `FileCeiling` stands |
| `./RUNME.sh check` | it exits 0 on the branch |

What the agent needs:

| number | need | status |
|---|---|---|
| 1 | the review hand reads this approach against the ask | open |
| 2 | a pass moves this ticket to the implement phase | open |

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

fail

| the question reviewing asks | the answer |
|---|---|
| does the approach answer the ask | yes for the two scripts, and the command line stands open |
| is what the diff touches beyond the ask trivial | yes, the commit writes this ticket alone |
| what does `./RUNME.sh check` answer | 0, with the server standing |
| does a retro stand in the handback | no, and `branch review` names it as the last fix the branch owes |
| does every claim the approach makes carry a proof | yes, the lint and the check answer each one |

TL;DR:

- Every finding of the last round closes for the pull and the work verb.
- Each chapter the two tables name stands in the design output today.
- The command line keeps its modules in prose, and names a chapter for none of them.
- The file row counts the test files, and the table under it lists fewer.

The findings, one a line:

- The command line's modules name no chapter. Name one a module, as the pull and work tables do.
- The file row writes a count of test files, and the table under it lists fewer.
- The voice asks for the command answering a count. Cut that number, and name `./RUNME.sh lint test/level0`.

What the agent needs:

| number | need | status |
|---|---|---|
| 1 | the draft names a chapter for each command line module | open |
| 2 | the file row drops its count and names the lint | open |
| 3 | the review hand reads the approach again | open |

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the same tests pass -->

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
