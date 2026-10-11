---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: ask
    tags: ["code", "testing"]
    needs: ["branch test"]
    checklist: ["the change follows the ask, or the discussion says why it departs", "the cleanup the change reveals is in the change, or is a note of its own", "every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
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
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: hooks-v1-hold-the-line
step: do
record:
  - step: do
    hand: box f9a277082525 · claude-code-remote
    hash_before: 3ebcfd7ebe7f376c302ccda20cbc1ac97de25c8c
    hash_after: 279f83e280af6686555262524b5fc7238ac84594
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "   72.8  in all"
    inputs:
      - name: ask
        hash: e28cec7cdf9b8354
        size: 454
    def: df12650931d480c9
reason: done
---

# Ask

The GitHub MCP tools that commit on the server, and `gh api` merges, wait for a person's yes. An agent then commits to main or a version branch through the doors alone.

push_files, create_or_update_file and delete_file run unprompted on any branch, main among them (.claude/settings.json:50, finding 9).

- ./RUNME.sh test passes a settings case naming push_files, create_or_update_file, delete_file and gh api merge under deny
- ./RUNME.sh check passes

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh test src/quack

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The settings deny `push_files`, `create_or_update_file` and `delete_file` under both GitHub connectors the tree names, and `gh api` merges. The allow line `mcp__github` stands, so the reads, the pull request and its auto-merge still run. A deny refuses where the ask says a person's yes, since a cloud box has nobody to answer a prompt. The ask's own done line names deny. The change landed in 279f83e28.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: `TestTheSettingsDenyTheMergeToolUnderEveryConnectorAndLeaveAutoMergeOpen` names each new deny rule, and the auto-merge tool stays open
- the cleanup the change reveals: the cold probe pushes its branch back into the source checkout, a note of its own as `cold-probe-pushes-into-its`
- the deny list stands once, in `.claude/settings.json`, and the test reads it there

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
