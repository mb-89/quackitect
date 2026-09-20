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
group: the-tree-names-its-things
process: [[spec/processes/standard]]
process_hash: 838dd6d003506639
step: design/review
record:
  - step: design/draft
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: 1e5d89a75f884bc7be7d77ad4f31f9c887d8af1d
    hash_after: 1e5d89a75f884bc7be7d77ad4f31f9c887d8af1d
  - step: design/review
    hand: box 0eb9ad6feedf · claude-code-remote · helper-2
    hash_before: 4504a852cc5e340fa0744f71419f0526b27967ec
    hash_after: 4504a852cc5e340fa0744f71419f0526b27967ec
    returns: 1
    why: Name where `escalate --craft` sends a question the drafter raises on `design/draft`.; `target` answers the held leaf itself where `on_fail` stands empty, so the leaf stays put.; Name what `escalate --craft` owns beside the fail verdict, which already returns review to draft.; Name the rationale section each new rule takes, or leave the rule unstarred.
  - step: design/draft
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: 1f5ffebfe9bb2676a0d710a19355507584651e14
    hash_after: 1f5ffebfe9bb2676a0d710a19355507584651e14
---

# Ask

The owner answers design questions alone, and the build starts once they answer.

The agent builds ahead of the owner, and craft questions and settled ones take the owner's time.

- A rule in `spec/guidance/working.md` asks the owner the design question before the build.
- A review return grades each question as design or craft, and craft goes back to the drafter.
- The drafter reads `spec/design_input` before it offers the owner a choice.
- `./RUNME.sh test` covers a craft question going back to its drafter.

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

Two rules grade the question, and the roads the engine holds carry each grade.

The notes under `spec/design_input` settle what the tree is for. A question those notes answer is craft, and the drafter answers it by reading them. A question they leave open is design, and the owner answers that.

| the grade | who answers it | the road it takes |
|---|---|---|
| design | the owner | `branch escalate`, which puts a person step before the held leaf |
| craft, found by the reviewer | the drafter | the fail verdict, which `on_fail: draft` routes today |
| craft, found by the drafter | the drafter | the design input, read before the drafter offers a choice |

The earlier draft asked for `escalate --craft`, and this one drops it. A craft question the reviewer finds already reaches the drafter through the fail verdict. A second road to one outcome breaks the rule of [[spec/guidance/working]] giving one thing one owner.

A craft question the drafter raises reaches no verb, because the design input answers it. Where the input leaves it open the question is design, so `escalate` takes it. So the drafter's own leaf wants no `on_fail` of its own.

| what changes | how |
|---|---|
| `spec/guidance/working.md` | its seventh rule takes the drafter's half |
| `spec/guidance/review/reviewing.md` | takes the reviewer's rule, one more on its list |
| `test/level0/pull-escalate.test.js` | takes the case under this table |
| [[spec/design_output/pull#a-person-step-goes-in]] | says which grade takes which road |
| `escalate` in `pull.js` | stands as it stands, and a design question alone reaches it |

**The rules.** The working note caps its list at the count its schema names, so the drafter's half joins the seventh rule. That rule already governs what a hand decides while the owner stands away. Both rules land unstarred, because neither rationale note holds a section for them.

| the note | the rule it takes |
|---|---|
| `spec/guidance/working` | Read `spec/design_input`, then ask the owner a design question before you build your own answer. |
| `spec/guidance/review/reviewing` | Grade each question a return names as design or craft, and hand a craft one back to the drafter. |

**The case.** It drives the fail verdict over a review leaf whose route carries `on_fail: draft`. It asserts three things:

- the ticket stands at the drafter's leaf
- the record carries the question as its reason
- the route takes on no person step

## review

<!-- reads the approach against the ask -->

### verdict

fail

- Name where `escalate --craft` sends a question the drafter raises on `design/draft`.
- `target` answers the held leaf itself where `on_fail` stands empty, so the leaf stays put.
- Name what `escalate --craft` owns beside the fail verdict, which already returns review to draft.
- Name the rationale section each new rule takes, or leave the rule unstarred.

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
