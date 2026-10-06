---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-hooks-feed-the-sentinel/gate
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
group: failures-stand-registered
parent: the-hooks-feed-the-sentinel
record:
  - step: do
    hand: box 83c32b2b4d58 · claude-code-remote
    hash_before: b5cab2116297a36f3c3060fa079296ac38401d6a
    hash_after: da7c7928d730fc8687b2e6c21b7d3dd6339c8a2a
    answered:
      - name: tests
        exit: 0
        said: green
      - name: check
        exit: 0
        said: green
    inputs:
      - name: ask
        hash: f6cf96e2ffcd7c67
        size: 477
    def: d79e6f2f77a124a8
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

src/modules/hooks/hooks_test.go, the done_when line asks for a test under src/modules/hooks that posts a matched event over the fakes and reads the row in the log, and TestHookHandsEachPostToHear reads only the heard event while the row lands in src/quack/sentinel_test.go. Add a case to hooks_test.go that sets Hear to failure.NewSentinel over FakeDir, FakeClock and FakeRunner, firing through a say the case holds, posts tool.call with the watched command, and reads the row.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh check > /dev/null 2>&1 && echo green

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check > /dev/null 2>&1 && echo green

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

A case in src/modules/hooks/hooks_test.go posts a tool call the node take-watched watches. Hear runs a real sentinel over a fake registry and a fake runner. The case reads the fired row through the say it holds, which the ask's done_when line asks for under src/modules/hooks. It stands red until Hook hands each post to Hear, the parent's implement/change. The check holds hooks_test.go apart until then, so the tests field names the check. The timer is a still one local to the case, because the import rules refuse a module importing the clock module. The watch carries no quiet span, so the sentinel never arms it.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask, except a still timer in place of FakeClock, since the import rules refuse the clock module here
- the cleanup this reveals is none: the case leaves the red list with its sibling at the parent's tests-green
- the watched node's text stands in this case and in src/quack/sentinel_test.go, one per package, since a test fixture crosses no module

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
