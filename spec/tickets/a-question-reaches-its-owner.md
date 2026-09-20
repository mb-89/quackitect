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
step: verdict
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
  - step: design/review
    hand: box 0eb9ad6feedf · claude-code-remote · helper-4
    hash_before: cfce8ee10329dd002662da56afa239a2aa45aa0d
    hash_after: cfce8ee10329dd002662da56afa239a2aa45aa0d
    returns: 2
    why: Name the file owning the case, because `pull-escalate.test.js` covers the escalation verb alone.; Name what the case asserts past the one in `pull.test.js`, which reads the leaf and the record.; Write the seventh rule of `spec/guidance/working` whole, because the table drops the sentence standing there.
  - step: design/draft
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: 322993965b44c982f43a2dddba2606d1d54a2024
    hash_after: 322993965b44c982f43a2dddba2606d1d54a2024
  - step: design/review
    hand: box 0eb9ad6feedf · claude-code-remote · helper-6
    hash_before: e30c07a9816c072df2f01fb5dfd159adab51d698
    hash_after: e30c07a9816c072df2f01fb5dfd159adab51d698
  - step: implement/tests-red
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: 22111c66e9074a3b4be91575303d90058a179002
    hash_after: 22111c66e9074a3b4be91575303d90058a179002
    answered:
      - name: tests
        exit: 1
        said: assertion, 2 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: 14a8f8915516367b6a9ff566a3cbd8c47f54817f
    hash_after: 14a8f8915516367b6a9ff566a3cbd8c47f54817f
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: d29f13d0e1d0fedc76d7b574a54546866936fb50
    hash_after: d29f13d0e1d0fedc76d7b574a54546866936fb50
    answered:
      - name: tests
        exit: 0
        said: green, 21 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: The rules pass.
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
| `test/level0/pull.test.js` | takes the case under this table, beside the fail route it holds |
| [[spec/design_output/pull#a-person-step-goes-in]] | says which grade takes which road |
| `escalate` in `pull.js` | stands as it stands, and a design question alone reaches it |

**The rules.** The working note caps its list at the count its schema names, so the drafter's half joins the seventh rule. That rule already governs what a hand decides while the owner stands away. Both rules land unstarred, because neither rationale note holds a section for them.

| the note | the rule it takes |
|---|---|
| `spec/guidance/working` | Name the assumption you take where the owner says to carry on, and take it. Read `spec/design_input`, then ask the owner a design question before you build your own answer. |
| `spec/guidance/review/reviewing` | Grade each question a return names as design or craft, and hand a craft one back to the drafter. |

**The case.** It drives the fail verdict over a review leaf whose route carries `on_fail: draft`. It asserts three things:

- the ticket stands at the drafter's leaf
- the record carries the question as its reason
- the route takes on no person step

## review

<!-- reads the approach against the ask -->

### verdict

pass

| the question reviewing asks | the answer |
|---|---|
| does the approach answer the ask | yes, the two rules, the design input read and the case each stand |
| is what the draft touches beyond the ask trivial | yes, the draft writes this ticket alone |
| what does `./RUNME.sh check` answer | 0 on this commit, with the server standing |
| does every rule the approach adds carry a case | yes, the case drives the fail route the reviewer's rule names |
| does every claim carry a proof | yes, each row of both tables reads true against the code |

TL;DR:

- The case lands in `test/level0/pull.test.js`, beside the fail route that file already holds.
- Its third assertion goes past that case: the route takes on no person step.
- The seventh rule of `spec/guidance/working` stands whole, and the drafter's half joins it.
- Both rules land unstarred, so neither rationale note wants a chapter.

The findings, one a line:

- `escalate` puts a person step before the held leaf, as [[spec/design_output/pull#a-person-step-goes-in]] says.
- A fail sets `step` to `on_fail`, or to the held leaf where none stands, so the drafter's leaf wants none.
- `spec/schemas/guidance.schema.yaml` caps a list at fifteen, which the working note already reaches.
- The reviewing note stands under that cap, so the reviewer's rule joins its list.
- Each new rule holds its sentences under the list item bound of `spec/schemas/paragraph.schema.yaml`.
- `pull-escalate.test.js` covers the verb alone, so the craft case belongs beside the fail route.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test test/contract/question-grades.test.js test/level0/pull.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The command answers assertion, and both failing cases fail on their own assertion.

| the case | what it holds open |
|---|---|
| the working note asks the owner a design question | the seventh rule carries its own sentence alone |
| the reviewing note grades each question | the note carries no rule naming a grade |
| a craft question reaches the drafter | this one passes, because the fail route carries it today |

The third case passes the moment it stands, and that is what the approach says. A craft question rides the fail verdict, and the route grows no person step. So the case guards a road the engine holds already.

That surprises me at a tests-red step. The step wants red, and a guard over a standing road answers green. The two rule cases carry the red, so the command answers assertion and the guard rides beside them.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches no file the ask leaves out. One case file beside the fail route, one contract case file, and this ticket.
- every door the change reaches has a fake. The route case drives the pull doors' fake disk. The rule cases read the notes that ship.
- a comment names the approach the change implements. Each case carries a line pointing at this ticket.

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

./RUNME.sh check

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches no file the ask leaves out. The two notes, the chapter naming the roads, and the two case files.
- every door the change reaches has a fake. The route case drives the pull doors' fake disk. The rule cases read the notes that ship.
- a comment names the approach the change implements. The chapter names each grade and its road, and each case points at this ticket.

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh branch test test/contract/question-grades.test.js test/level0/pull.test.js

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

A question now carries a grade, and the grade picks the road.

| what lands | where |
|---|---|
| the drafter's rule | the seventh rule of `spec/guidance/working` |
| the reviewer's rule | one more rule in `spec/guidance/review/reviewing` |
| the table naming each grade and its road | [[spec/design_output/pull#a-person-step-goes-in]] |
| the case guarding the craft road | `test/level0/pull.test.js`, beside the fail route |
| the cases reading the two notes | `test/contract/question-grades.test.js` |

The engine gains no verb. A craft question the reviewer finds reaches the drafter through the fail verdict, which `on_fail` routes. A design question reaches the owner through `branch escalate`, as it did before this ticket.

The working note stands at the count its schema caps, so the drafter's half joins the seventh rule. That rule governs what a hand decides while the owner stands away, which is where the design question belongs. Both rules land unstarred, because neither rationale note holds a section for them.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches no file the ask leaves out. The two notes, the chapter naming the roads, and the two case files.
- every door the change reaches has a fake. The route case drives the pull doors' fake disk. The rule cases read the notes that ship.
- a comment names the approach the change implements. The chapter names each grade and its road, and each case points at this ticket.

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
