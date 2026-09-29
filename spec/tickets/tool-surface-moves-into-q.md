---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-mcp-module-lands/gate
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
group: go-cage-lands-in-shadow
parent: the-mcp-module-lands
record:
  - step: do
    hand: box d85490c97110e · claude-code-remote
    hash_before: 7ce3ef9739129bf8eb67f8f64829592bbf94b0bd
    hash_after: 3f1aabe0fe473538c155e8b827529af5d56aae89
    answered:
      - name: tests
        exit: 0
        said: green, src/q/tool passes; green, src/index passes; green, src/modules/hooks passes
      - name: check
        exit: 0
        said: "spec/tickets/vale-ls-windows-trial.md:41:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: ac667a9aa42966ea
        size: 284
    def: 831a3e612565a250
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the tool name, the Huma input schema, the wait read and the still running line stand in `src/index/tools.go` and `src/modules/hooks/hooks.go` already. The draft writes a third copy in `src/modules/mcp`. Move the shared piece into `src/q`, which the index core and every module import.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/q/tool src/index/tools_test.go src/modules/hooks/hooks_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The tool name and its reverse, the Huma input schema, the input past the wait, the wait read and the still running line stand once, in the new package src/q/tool. src/index/tools.go and src/modules/hooks call it in place of their own copies, and the mcp module calls it when it lands. The package sits under src/q, where ioonly holds the core, and q itself keeps to the standard library, since Huma reaches past it. A case in the index and one in hooks pin each to the shared surface.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the shared piece moves under src/q, as the package src/q/tool, so q itself imports no Huma
- the cleanup the change reveals stands in it: numberOf, progressOf, declares and the two prefix constants leave their old homes
- every fact stands once: the prefix, the wait argument, the bare property and the running line live in src/q/tool alone

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
