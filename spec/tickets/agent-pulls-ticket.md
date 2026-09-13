---
kind: [[ticket]]
state: open
urgency: soon
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
group: the-agent-pulls-a-ticket
step: implement/tests-red
record:
  - step: design/draft
    hand: box d49afdfe301a64
    hash_before: 498aad19b4261f5a7e49f30bee2d9b19b79659a4
    hash_after: 498aad19b4261f5a7e49f30bee2d9b19b79659a4
  - step: design/review
    hand: box d49afdfe301a64 · helper-2
    hash_before: dfceb7dfbcf41bd854dfad206c132fe05a3cdcef
    hash_after: dfceb7dfbcf41bd854dfad206c132fe05a3cdcef
---

# Ask

The agent pulls: one verb hands it a leaf of a ticket, and the same verb takes the leaf back with a verdict. Done is two verbs standing under the fakes, with the record, the hold and the stop rule around them:

- `./RUNME.sh branch pull`
- `./RUNME.sh branch test`

**Where it stands.** The design input `spec/design_input/the-agent-pulls-tickets.md` says what the
owner asks for, and the page beside it draws it. Read the note first. It
stands on the branch `claude/relaxed-knuth-f0uk4d` until the owner merges it,
so take that branch in where `work sync` leaves it absent.

This branch is the engine. Its chapters are The pull, The test verb, Evidence
per step, Children and private tickets, and the three rules at the top.

| what stands today | where |
|---|---|
| the schemas, the routes, the record and the render | the two branches before this one |
| the group verbs and the claim | the group branch |
| the judge, which runs through `$.model.classify` inside the hook process | `.claude/skills/level0/hooks/level0.js` |
| the stop rules, one file | `spec/config/stop/level0.yml` |
| the box id v4 keeps | none here yet |

**What waits.**

| the piece | where | proves it |
|---|---|---|
| `work pull [ticket]` | `src/scripts/work.js` | it hands back the ticket in hand and answers `work`, `refused` or `wait` |
| the five checks, cheapest first | `work.js` | the hold and the take hash, the schema and the fields, the commands, the hand rule, the judge |
| the idempotent hand-back | `work.js` | a hand-back the record answers gets the recorded answer, and a stale take hash gets `refused` |
| the pass | `work.js` | the record entry, the step, `state: open`, one commit named by ticket and step, the push, the next ticket |
| the rejected push | `work.js` | it fetches, rebases the one commit, tries once, else answers `refused` |
| the fail | `work.js` | `on_fail` or the step itself, the reason, the return in the record |
| `work.failsBeforePerson` | `work.js` and the config | a step failing back twice inserts a person step |
| `when` at the hand-out | `work.js` | the pull skips a leaf whose condition fails to hold, and the record says so |
| `needs` at the hand-out | `work.js` | a verb the box lacks answers `wait` with the reason |
| the `checked` field | `work.js` | the pull refuses a hand-back with a line short of the checklist |
| `work test` | `work.js` | it answers `green`, `assertion`, `build` or `missing` over the delta from the first take |
| the hold per hand | `.se/hold/<hand>.json`, `.se/box.json` | the pull refuses a second live hold for one session |
| the two-level pull | `work.js` | on trunk a box takes a group, on a branch it takes the group's own leaves around its tickets |
| the derived `children` | `work.js` | a parent advances once every child closes `done` or `became`, and a `dropped` child sends it to `on_fail` |
| the private queue | `work.js` | a box's private tickets come after the group's run out |
| the stop rule | `spec/config/stop/level1.yml` | `work-waiting` reads the session's hold |
| the plugin wrapper | `.claude/skills/level1/` | the pull runs under the tool, and the judge check runs there alone |

**The rules to hold.**

- The agent holds three verbs, and this branch lands one. The shell is the verb, and the tool wraps it.
- A `work` answer hands the leaf, with its fields, its guidance and `does` first.
- A leaf holding a `verdict` field takes the verdict from the field, and the pull refuses the flag there.
- The pull fetches the branch before every hand-out and hand-back.
- A person's hand-back from the shell meets the four mechanical checks. The judge reads it at the next agent pull.

**The tests.**

Every check and every answer takes a test under the fake doors, and the
rejected push takes one of its own. Drive one real pull under
`claude --plugin-dir` before `work done`, and write what you see in the retro.

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

One module beside the work verbs holds the engine, and the branch verb hands it `pull` and `test`. The hand-out reads every ticket on the branch and offers four pools in order: a tagged note, the children, the group, the private tickets. The hand-back runs the four mechanical checks in the shell and leaves the judge to the plugin wrapper. Every case runs under the fakes, and one real pull walks this ticket. For details, see [[spec/design_output/pull]].

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->
<!-- the form is verdict -->

pass
- the approach covers every row of the ask, from the hand-out to the plugin wrapper
- the design note holds the three answers, the five checks, the pass, the fail and the rejected push
- the ask names `work.js` and the note names `pull.js`, so the implement step settles the file
- the ask names the stop rule `work-waiting` and the note names `the-group-stands-in-hand`, so one name wins
- the note names no test for the rejected push, so the tests-red step adds one
- the note names no stop config file, so the implement step writes `spec/config/stop/level1.yml`

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

## reflect

<!-- names the class of error in the findings, and the fix for the class -->

### class

<!-- the class of error the findings describe, and the fix for the class -->

<!-- the form is text -->

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->

<!-- the form is command -->

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

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->

<!-- the form is files -->

## verdict

<!-- pass or fail, findings one a line -->

<!-- the form is verdict -->

# Discussion

The review step and the verdict step each name `not`, so one box takes one side alone. On a box with no second hand the pull parks them, and a person or the next box answers on the branch.

The engine, its tests and its design note landed in the branch's commits before this ticket's route reached its build phase. The pull had to exist before a record could take a hand. So the leaves under `implement` carry no record, and the review reads the branch's diff against the approach.
