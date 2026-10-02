---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: plan-writes-off-go/gate
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
group: go-cage-switches-over
parent: plan-writes-off-go
record:
  - step: do
    hand: box 3e46c581114 · claude-code-remote
    hash_before: 22f5b8c76a14dbf450fe8af35a0248f2697004d0
    hash_after: 22f5b8c76a14dbf450fe8af35a0248f2697004d0
    answered:
      - name: tests
        exit: 0
        said: green, 34 test(s) pass in 2 file(s); green, src/modules/hooks passes; green, src/index passes
      - name: check
        exit: 0
        said: "src/scripts/copilot-door.js:7:1: correctness/noUnusedFunctionParameters: This parameter it is unused."
    inputs:
      - name: ask
        hash: c8b3a08004a15fe7
        size: 566
    def: fb0edd2816ac320f
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

Door.calls in src/modules/hooks/hooks.go answers an IO action's said.Result bare, stepOf in .claude/skills/level0/hooks/cage.js hands it on unchanged, and door in level0.js returns it to the harness, which reads a tool's result as an object with a result key, the shape plan.js answers today. So the plan action's answer, a string as the waits module answers, never reaches the agent. Wrap a string result as an object under result in Door.calls once, for plans and waits alike, with a case in src/modules/hooks driving a string-answering IO action through Door.Hook

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/modules/hooks/hooks_test.go src/index/failed_start_test.go test/level0/review-cases.test.js test/level0/answer-read.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Door.calls answers a string an IO action returns under a result key, the shape the harness reads as a tool's result. The bridge answers that shape today, and stepOf hands it on unchanged. Any other value goes on as it stands, so the grep and glob shapes keep their road. The wrap stands in posts.go beside textOfValue. TestAStringResultReachesTheHarnessUnderAResultKey decides it, and the default-wait case now reads the wrapped shape.

The check stood red on faults other hands left on this branch, and this change greens it:
- the drafts and review case tables move into their packages' testdata and ride into the Go tests through embed, since a module imports no os. The JS readers import them as JSON, since a test imports no node:fs. The Go cases over them stay red until their own tickets reach tests-green.
- TestAFailedV1StartStopsThePartsItReached dialed a freed port, which another package's test can bind while the check runs every package at once. It now reads the old listener's own close, waiting on Serve's goroutine up to a named cap.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: one wrap in Door.calls, for plans and waits alike, with a case driving a string-answering action through Door.Hook
- the cleanup the change reveals stands in the change: the moved tables, the JSON imports and the failed-start case, each needed for a green check
- every fact the change adds stands in one place: resultKey and harnessResult in posts.go, each table in its package's testdata alone

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
