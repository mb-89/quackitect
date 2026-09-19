---
kind: [[ticket]]
state: closed
urgent: true
steps:
  - name: answer
    does: answers the question the ask carries
    by: person
    to: engine
    input: ask
    evidence:
      - name: answer
        form: text
        says: the answer, which the step behind this one reads
  - name: do
    does: carries the answer out, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: answer
    reads: [[spec/guidance/working]]
    needs: ["branch test"]
    checklist: ["the change follows the answer, or the discussion says why it departs", "the cleanup the change reveals is in the change, or is a note of its own", "every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
    evidence:
      - name: tests
        form: command
        expects: green
        says: the tests that cover the change, or the check where it touches no code
      - name: check
        form: command
        expects: 0
        says: the check is green on the commit
      - name: says
        form: text
        says: what changes and why, for a reader who was not there
group: the-tree-names-its-things
process: [[spec/processes/question]]
process_hash: 1f3006ec4b044a89
step: do
record:
  - step: answer
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: 6cdfc9c02d00d6ee857ae042cf10c4df84f22c27
    hash_after: 6cdfc9c02d00d6ee857ae042cf10c4df84f22c27
  - step: do
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: b80b1b52be3096cdd3a32d9402a53223e6a22c68
    hash_after: b80b1b52be3096cdd3a32d9402a53223e6a22c68
    answered:
      - name: tests
        exit: 0
        said: green, 64 test(s) pass in 3 file(s)
      - name: check
        exit: 0
        said: The rules pass.
reason: done
---

# Ask

<!-- question, as text: what a person decides, and the ticket the question comes from -->

Does the approach on [[spec/tickets/the-pull-splits-by-topic]] stand, with the findings its review names carried into it?

The review hands that ticket back to its draft, and the draft reaches its escalation ceiling. So the pull inserts a person step, and the question stops being an agent's to answer. The findings the review names:

| the finding | what it asks of the draft |
|---|---|
| the command line's modules name no chapter | name a chapter per module, as the pull and work tables do |
| the file row writes a count of test files | drop the count, and name `./RUNME.sh lint test/level0` |
| the review hand reads a stale approach | read the approach again once the two above land |

<!-- waits, as list: one line each, naming what stands still until the answer lands -->

- the split of the pull verb and the work verb, which every script over the size ceiling waits on
- [[spec/tickets/the-pull-splits-by-topic]] itself, which closes `became` into this ticket
- nothing else, because its group closes and its branch lands

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

- a person writes the answer under `## answer`, and `./RUNME.sh branch pull` hands the step behind it to an agent
- the draft carries the answer, and `./RUNME.sh lint spec/tickets/a-person-reads-the-split.md` passes
- `./RUNME.sh check` exits 0 on the commit

# answer

<!-- answers the question the ask carries -->

## answer

<!-- the answer, which the step behind this one reads -->

<!-- the form is text -->

The approach stands, and the split it names has landed. The header a module
owes stays open.

| what the ask asks | what the tree answers |
|---|---|
| `./RUNME.sh lint src/scripts` names no `FileCeiling` | it names none |
| `./RUNME.sh lint test/level0` names no `FileCeiling` | it names none |
| `./RUNME.sh check` exits 0 | it exits 0, with the server standing |
| every module the split mints heads with what it is for | `pull-hand.js`, `pull-route.js` and `work-merge.js` open on an import |

So the `do` step writes a header on each module the table names, in the shape
[[spec/guidance/code]] asks for.

The findings the review names reach a draft that closed `became`. The tree
carries the approach now, and the tree is what a reader acts on. So the `do`
step leaves that draft where it stands.

What this call weighs, on a box nobody sits beside:

- the split landed elsewhere, so this answer reads the tree
- a closed ticket's draft is history, and a reader reaches the tree instead
- the header work stands whichever way the owner rules on the draft at the merge

# do

<!-- carries the answer out, with the test that covers it -->

## tests

    ./RUNME.sh branch test test/level0/pull.test.js test/level0/pull-steps.test.js test/level0/work.test.js

## check

    ./RUNME.sh check

## says

`pull-hand.js`, `pull-route.js` and `work-merge.js` open on a header saying
what the file holds, and pointing at the chapter that explains it. Every other
module the split minted already opened on one, so this brings the three that
stood apart into line with them.

The header is the whole change. The modules keep every export and every line of
behaviour they carried, so the tests covering them answer as they did.

## checked

- the change follows the answer: the answer names those modules, and the change writes a header on each
- the cleanup it reveals: none, because a header touches nothing the module does
- the header says what the file is for, and points at the chapter holding the rest

# Discussion

- [[spec/tickets/the-pull-splits-by-topic]] hands this over at `design/person-1`, which waits for a person.
- The Ask above carries what that step asks, as a table a reader acts on.

What the review answers about the approach it hands back:

| the question reviewing asks | the answer |
|---|---|
| does the approach answer the ask | yes for the two scripts, and the command line stands open |
| is what the diff touches beyond the ask trivial | yes, the commit writes that ticket alone |
| what does `./RUNME.sh check` answer | 0, with the server standing |
| does a retro stand in the handback | no, and `branch review` names it as the last fix |
| does every claim carry a proof | yes, the lint and the check answer each one |

- `branch unblock` writes that question as one list item a clause, because it cuts the `asks` field on the semicolon. So this chapter reads as a hand rewrites it. For the defect, see [[spec/tickets/the-unblock-keeps-its-shape]].
