---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: probe-at-revision-guards-merges/gate
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
point: gate
todo: false
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: level-zero-smoke
parent: probe-at-revision-guards-merges
record:
  - step: do
    hand: box a694567529c5 · claude-code-remote
    hash_before: 5f431b1e36c29f5d45804cfa03995e277024b7fa
    hash_after: 0652101e8e3b743173a3e3c4f7a810f0a6d9d390
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "   85.0  in all"
    inputs:
      - name: ask
        hash: d945b21bdfca39f5
        size: 430
    def: 7ed4c456d3f8a624
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the deny names mcp__github__merge_pull_request alone, and this box also carries a second GitHub connector whose merge_pull_request tool sits under its own mcp__<uuid>__ prefix, and gh pr merge through Bash. Deny the merge tool under every GitHub connector the box loads, and leave enable_pr_auto_merge open, since the work skill turns auto-merge on through the connector. Unchecked: whether the client takes a glob in a deny rule.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/settings_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The tracked settings now deny the merge tool under both GitHub connectors this box loads, mcp__github and the second connector under its own prefix, and gh pr merge through Bash. They leave enable_pr_auto_merge open, since the work skill turns auto-merge on through the connector. So auto-merge stays the one road to main. The client takes no glob over a server name as far as the docs read, so the deny names each connector in full. The client dropped both merge tools from the live session the moment the file changed, which shows it reads the deny.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: every GitHub connector and the gh road stand denied, and auto-merge stays open
the cleanup: the case name now says the whole claim, and the old single constant gave way to the list
the roads stand once in .claude/settings.json, and the case lists what it asserts

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
