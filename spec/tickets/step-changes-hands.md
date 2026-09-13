---
kind: [[ticket]]
state: open
urgency: soon
step: design/person-1
steps:
  - name: design
    reads: [[spec/guidance/voice]]
    steps:
      - name: person-1
        does: answers the question the engine asks
        by: person
        to: engine
        asks: "design/review failed back 2 times: The table under The three answers lists five words, and the heading and the Scope line name three. The heading and the Scope line name five."
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
    needs: ["work test"]
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
    evidence:
      - name: read
        form: files
        says: every file you read, one a line
      - name: verdict
        form: verdict
        says: pass or fail, findings one a line
process: [[standard]]
record:
  - step: design/draft
    hand: box b71bba5a7b0c
    hash_before: 7cc6056895245ab2e0dc5945cfd609d6d51dfaae
    hash_after: 7cc6056895245ab2e0dc5945cfd609d6d51dfaae
  - step: design/review
    hand: box b71bba5a7b0c · helper-2
    hash_before: 666e313b04a7c7916fc2f1cbee59d68fb20fecbc
    hash_after: 666e313b04a7c7916fc2f1cbee59d68fb20fecbc
    returns: 1
    why: The ask rules that an inserted step counts for no `not`. The hand rule says where a `not` meets an inserted step.; The ask rules that the shell pull off a plugin parks the step for a person. A hand of its own says so.; The three answers table names three words, and A hand of its own adds two. One table lists all five.; The ask proves the person step by `step` pointing at the inserted row. A person step goes in says where `step` lands.
  - step: design/draft
    hand: box b71bba5a7b0c
    hash_before: fc2c7c45cfbb4c8f2f92c0e6f98fe96fbef6e140
    hash_after: fc2c7c45cfbb4c8f2f92c0e6f98fe96fbef6e140
  - step: design/review
    hand: box b71bba5a7b0c · helper-4
    hash_before: 085829be36d10ddb72a67b33e0cbcedf2b62c6ad
    hash_after: 085829be36d10ddb72a67b33e0cbcedf2b62c6ad
    returns: 2
    why: The table under The three answers lists five words, and the heading and the Scope line name three. The heading and the Scope line name five.
group: a-step-changes-hands
---

# Ask

The pull learns who holds a step:

- the hand carries the box, the session and the agent
- a helper carries the session's hand
- a person's step refuses an agent
- an escalation inserts a person step through a verb

The chapters below say where it stands, what waits and the rules to hold.

**Where it stands.**

- the design input [[spec/design_input/the-agent-pulls-tickets]] says what the owner asks for, and the page beside it draws it
- the pull lands before this branch, and this one teaches it who holds a step
- the chapters to read are Hands, Escalation is a step, and Children and private tickets

| what stands today | where |
|---|---|
| the spawn hook, which hands the guidance to a helper | `.claude/skills/level0/hooks/level0.js`, `agent.spawn` |
| the session id, read in one place | `.claude/skills/level0/lib/copilot.js` |
| the pull, its hold and its record | the pull branch |

**What waits.**

| the piece | where | proves it |
|---|---|---|
| the hand id | `work.js` | the box, the session and the agent stand in the record |
| the spawn for a step | the plugin wrapper | a `by` that excludes the hand spawns one, with a prompt the engine writes |
| the spawned hand's road back | `work.js` | its pull answers `done` after its hand-back, and touches no other hold |
| the helper's tag | the spawn hook | a helper the session spawns carries the session's hand, so `not <step>` still holds |
| the person's hand | `work.js` | the verb refuses `by: person` where the environment names an agent's harness |
| `work.personSigns` | the config and `work.js` | switched on, a person's hand-back needs a signed commit |
| `work escalate <question>` | `work.js` | it inserts a person step with `asks` and one `answer` field, and points `step` at it |
| `options` | `work.js` | an `asks` with options takes a `choice` answer, and one word passes |
| the refusal count | `work.js` | `work.refusalsBeforePerson` inserts a person step with the findings |
| the split refusal | `work.js` | past `work.stepsBeforeSplit` the pull answers the ask, and the close waits for the successors |
| the group leaves | `work.js` | a box with nothing at an agent step leaves the group at `todo` |

**The rules to hold.**

- A role is a property of a step, and no agent holds one for life.
- An inserted step counts for no `not`.
- A gate the mint writes and an escalation the engine inserts are one mechanism.
- On a box with no plugin, the shell pull parks the step for a person and says so.

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

The approach stands in [[spec/design_output/pull#the-hand-and-the-hold]].

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

fail
- The table under The three answers lists five words, and the heading and the Scope line name three. The heading and the Scope line name five.

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

# Discussion

The box meets four defects on the way to the person step, each for the implement leaf:

- the wrapper judges the ticket on disk before the shell writes the fields, so the judge reads an empty chapter
- the wrapper reads a spawn answer at the first line alone, and misses the spawn that follows a pass
- the judge refuses a list of links and passes one bare link, so the approach field holds one link
- the second review fails on one small finding, and the fail cap parks the ticket at `design/person-1` for a person
