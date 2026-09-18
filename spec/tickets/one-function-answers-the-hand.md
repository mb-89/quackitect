---
kind: [[ticket]]
state: open
urgency: now
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
process: [[spec/processes/standard]]
process_hash: 838dd6d003506639
group: the-warnings-feed-a-refactorer
step: design/review
record:
  - step: design/draft
    hand: box dd2a59294365 · claude-code-remote
    hash_before: 76b837882ffc68781c948011510418618edf8a09
    hash_after: 76b837882ffc68781c948011510418618edf8a09
  - step: design/review
    hand: box dd2a59294365 · claude-code-remote · helper-2
    hash_before: eac3bf933183e533094a696430e359148d343985
    hash_after: eac3bf933183e533094a696430e359148d343985
    returns: 1
    why: "Say which refusals the function answers, because `admits` refuses on `by`, `needs` and `excludes`.; `takeable` walks past a `by: children` leaf and `admits` admits one, so name the one answer.; `admits` lets a `by: person` leaf through on `ownerSays`, and `takeable` walks past it.; `takeable` offers a `by: retro` leaf, and `admits` refuses it away from a retro.; Say how `writesHere` and `placesIn` divide the question, because both walk `steps` in one file.; Take the leaf `admits` resolves already, or say why the function walks the ticket again.; Name the file holding the case, and the refusal that case asserts.; The move's reason is that nothing imports past the plugin root. [[spec/design_output/level0#nothing-imports-past-the-plugin]]; `./RUNME.sh check` answers 0 on this commit."
  - step: design/draft
    hand: box dd2a59294365 · claude-code-remote
    hash_before: 3318e1a9080119aa8973f42f85c83e6b3fdfc999
    hash_after: 3318e1a9080119aa8973f42f85c83e6b3fdfc999
---

# Ask

**The gain.** One function answers whether a hand writes at a leaf, and the pull
and the write door both call it. A disagreement between the two stops being
possible, in place of stopping by agreement.

**What breaks otherwise.** Each module works the answer out for itself, and the
two land apart:

| module | what it reads | what it concludes |
|---|---|---|
| `src/scripts/pull.js` | the leaf's `by`, against the hand it builds | a leaf reading `by: person` refuses an agent |
| `src/bridge/write.js` | the frontmatter fields the engine owns | an agent writes no `state`, `step` or `steps`, and every chapter stands open |

So an agent writes its answer into a chapter a person owns. The pull refuses
that same hand the moment it hands the leaf back. A box measures it on this
group, and its handover names it.

The door reads the ticket's `step` and `steps` already, so the material stands
in its hands.

- one function takes the ticket, the leaf and the hand, and answers whether that hand writes there
- the pull calls it at the hand-out, and the write door calls it before a chapter lands
- a case drives an agent's write at a leaf reading `by: person`, and the door refuses it
- `./RUNME.sh check` answers 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

One function stands in `.claude/skills/level0/lib/ticket.js`, which the write door already imports:

    writesHere(leaf, hand) -> { writes, why }

It takes a resolved leaf and a hand, and answers whether that hand works there. The hand is `{ agent, ownerSays, atRetro }`, which the pull builds at the hand-out already.

**What it answers.** The leaf's `by` alone. `admits` refuses on three counts, and the other two stay where they stand:

| what refuses | where it lives after | why |
|---|---|---|
| `by` | `writesHere` | both sides work it out, and they land apart |
| `needs` | `admits` | it reads the verbs this box carries, not the leaf |
| `excludes` | `admits` | it reads the record naming the hands before this one |

**The drift it closes.** `takeable` and `admits` disagree on three values today, and one answer settles each:

| leaf | `takeable` today | `admits` today | the one answer |
|---|---|---|---|
| `by: children` | walks past | admits | no hand works there, because the children do |
| `by: person`, the owner sending the hand | walks past | admits | the hand works there, and the record names both |
| `by: retro`, away from a retro | offers | refuses | no hand works there |
| `by: retro`, at a retro or under a tagged note | offers | admits | the hand works there |

The three moves the function takes:

- `admits` holds the leaf `leafOf` resolved for it, hands that in, and the function walks nothing again
- `leafOf` moves beside the function, because a plugin imports nothing past its own root [[spec/design_output/level0#nothing-imports-past-the-plugin]]
- `pull-route.js` re-exports `leafOf`, so its callers change nothing, and the move takes `entriesIn` alone

**Beside `placesIn`.** `placesIn` answers which chapters a hand writes, off the schema's `x-written` and the ticket's `state`. `writesHere` answers whether this hand works the leaf at all. The two share the `steps` walk, so they read one walk in one file.

**The callers.** A caller holding the front alone calls `leafOf(front, path)` first, and the door is that caller.

| caller | where it calls | what it does with the answer |
|---|---|---|
| `admits` in `src/scripts/pull-hand.js` | at the hand-out | hands the leaf on, or names the wait |
| `takeable` in `src/scripts/pull-hand.js` | while it picks a ticket | walks past a ticket this hand works nowhere |
| a new check in `src/bridge/write.js` | before a chapter lands | refuses the write, naming the leaf and its `by` |

The door reads the ticket's `step` and `steps` for the schema check already. So it runs the new check on a write to a ticket alone, off the same front.

**The case.** `test/level0/hooks.test.js` drives the write door, and two cases land there:

- an agent writes a chapter at a step reading `by: person`, and the door answers the refusal `writesHere` writes
- the same write carries the owner's word, and the door passes it

The refusal says the same words at both doors, because one function writes them. A hand meeting it at the write meets it before the work, in place of after.

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

fail

- Say which refusals the function answers, because `admits` refuses on `by`, `needs` and `excludes`.
- `takeable` walks past a `by: children` leaf and `admits` admits one, so name the one answer.
- `admits` lets a `by: person` leaf through on `ownerSays`, and `takeable` walks past it.
- `takeable` offers a `by: retro` leaf, and `admits` refuses it away from a retro.
- Say how `writesHere` and `placesIn` divide the question, because both walk `steps` in one file.
- Take the leaf `admits` resolves already, or say why the function walks the ticket again.
- Name the file holding the case, and the refusal that case asserts.
- The move's reason is that nothing imports past the plugin root. [[spec/design_output/level0#nothing-imports-past-the-plugin]]
- `./RUNME.sh check` answers 0 on this commit.

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

<!-- what anybody adds, at any time, on this ticket -->
