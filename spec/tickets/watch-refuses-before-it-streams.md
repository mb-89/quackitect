---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: v1-watch-sends-changes/gate
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
group: tui-shell-switches-over
parent: v1-watch-sends-changes
record:
  - step: do
    hand: box d88aea6eafd6 · claude-code-remote
    hash_before: a249a3603c6b428fd85a697745c227cd1ae41db5
    hash_after: a249a3603c6b428fd85a697745c227cd1ae41db5
    answered:
      - name: tests
        exit: 0
        said: green
      - name: check
        exit: 0
        said: "spec/tickets/watch-refuses-before-it-streams.md:41:311: Vocabulary: huma stands outside the words this tree writes. Writ"
    inputs:
      - name: ask
        hash: 321328347d40ee00
        size: 480
    def: 2e7737b6a696941d
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

`sse.Register` in huma v2.36.0 wraps the handler in a `StreamResponse` that writes 200 and `text/event-stream` before `f` runs, so the handler cannot answer the 404 problem `TestV1WatchAnswersANameTheCatalogLacksWithAProblem` wants. The builder checks `store.Declared` in a `huma.Resolver` on the input, which huma runs before the handler and whose `StatusError` sets the status, or registers through `huma.Register` and returns `huma.Error404NotFound` before the `StreamResponse`

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh check > /dev/null 2>&1 && echo green

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The watch approach checked each name inside the stream handler. sse.Register in the pinned huma version sets the event-stream header before it calls that handler, so the refusal comes too late for the 404 the red test wants. The correction stands under the Discussion of v1-watch-sends-changes: the watch input carries a Resolve method, and the missing name answers there. The implement step reads it. No code changes, so the check covers it.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- follows the ask: it takes the first road the ask names, the resolver, and the discussion says why the check moves there.
- cleanup: none revealed, and the closed v1-watch-streams-changes keeps its record.
- one place: the line points at sse.Register and the input, and repeats no code.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
