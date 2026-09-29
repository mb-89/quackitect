---
kind: [[ticket]]
state: closed
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
process: [[spec/processes/question]]
process_hash: d1a6e26348695e24
step: do
group: loose-fixes-99f4547
record:
  - step: answer
    hand: box d84e33ce20f7 · claude-code-remote
    hash_before: 22dce2f11f2a7f243a7a6a4cfc18a10e81586738
    hash_after: 22dce2f11f2a7f243a7a6a4cfc18a10e81586738
    inputs:
      - name: ask
        hash: 01df03a0e68cf73d
        size: 921
      - name: [[spec/tickets/an-action-fires-the-workers]]
        hash: a795442dd876e60f
        size: 19293
    def: 2280015d497a3abd
  - step: do
    hand: box d84e33ce20f7 · claude-code-remote
    hash_before: d3a0de9c89c59509cb0cf63772e635314bb4b960
    hash_after: d3a0de9c89c59509cb0cf63772e635314bb4b960
    answered:
      - name: tests
        exit: 0
        said: green, 43 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/vale-ls-windows-trial.md:41:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: answer
        hash: 641a8890c502519c
        size: 963
    def: 9395391d8c0e6392
reason: done
---

# Ask

The owner starts the dispatch Action once by hand, and says whether its first live run holds. The Action comes from [[spec/tickets/an-action-fires-the-workers]], and no box here reaches the real routine.

The agent takes these calls, and the owner confirms or turns each:

| the call | why |
|---|---|
| auto-merge asks for the merge method MERGE | MERGE keeps the write branch's commit as it stands, and a refused mutation names itself in the plan |
| an issue a question closes by hand | the dispatch opens issues and closes none, so a person closes it once the answer lands |
| the fire text names the branch | the routine's saved prompt runs the work skill, and the text stands as context |

Run these from a clone:

```sh
gh workflow run dispatch.yml
gh run watch
gh run view --log | tail -40
```

- the dispatch Action's first scheduled run

- the answer names whether the run fires, opens the issues and opens the write branch's pull request
- the answer confirms or turns each call in the table

# answer

<!-- answers the question the ask carries -->

## answer

<!-- the answer, which the step behind this one reads -->
<!-- the form is text -->

The dispatch Action ran once by hand on main, as run 36471796196, and holds.

- the run fires: the job ends green, and the plan held no ready group and no stuck hand-over, so it fired no worker
- the issues: that run opened one issue a question ticket, and the dispatch now opens none, as its skill says
- the write branch: it pushed claude/dispatch-4140d51 and opened pull request 26, which merged itself

The calls:

- auto-merge asks for MERGE: confirmed, since pull request 26 and the later dispatch pull requests land with no hand
- an issue a question closes by hand: turned, since the dispatch opens no issue, and a box closes any issue its ticket carries, per rule 8 of the cloud guidance
- the fire text names the branch: stands, unproven live, because the run fired no worker

Weighed: the run log and the merged pull requests on main. Assumed: the later dispatch runs, such as pull request 37, count as further live runs of the same Action.

# do

<!-- carries the answer out, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/dispatch.test.js test/level0/dispatch-fire.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The answer turns one call, and the tree already carries that turn: the dispatch skill opens no GitHub issue, and rule 8 of the cloud guidance has a box close any issue its ticket carries. The other two calls stand as the Action runs them. So no file moves, and the dispatch tests pass.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the answer: each call stands where the tree already writes it
- the answer reveals no cleanup
- each call stands once: the issue rule in the cloud guidance and the dispatch skill, the merge method in the work skill

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

The agent started the dispatch Action once through the GitHub connector, on `main`, as [run 36471796196](https://github.com/mb-89/quackitect/actions/runs/36471796196). It holds, and the owner's order takes the three calls as they stand:

| the ask | what the run shows |
|---|---|
| the run fires | the job ends green, and the plan holds no ready group and no stuck hand-over, so it fires no worker |
| the issues | it opens one issue a question ticket |
| the write branch | it pushes `claude/dispatch-4140d51` and opens [pull request 26](https://github.com/mb-89/quackitect/pull/26), which merges itself |
| auto-merge asks for MERGE | holds: pull request 26 lands with no hand |
| an issue closes by hand | stands, and the cloud guidance now has a box close an issue its ticket carries |
| the fire text names the branch | stands unproven live, because the run fires nothing |

The answer step waits for the next pull on `main`, which carries this answer into its field. The group [[spec/tickets/the-cloud-follow-ups-land]] closed before the engine could take the step on its branch.
