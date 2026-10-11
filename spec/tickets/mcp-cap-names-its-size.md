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
group: checks-and-index-read-right
step: do
record:
  - step: do
    hand: box f689bbb375f6 · claude-code-remote
    hash_before: 8d7cbf7d3251d00ce738af4a75e46948d8656840
    hash_after: ac7532df1c8a96e5feea60e4080617fcd2fbe96e
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/mcp passes
      - name: check
        exit: 0
        said: "   61.7  in all"
    inputs:
      - name: ask
        hash: bd27dd31f62b6c06
        size: 459
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
gain: an MCP body past the cap answers a status naming the cap, and JSON that does not parse answers the JSON-RPC parse error.

<!-- breaks, as text: what breaks if it is never done -->
breaks: `serves` in `src/modules/mcp/mcp.go` cuts the body at the cap with no error, so a large tool call answers success with an invalid-params code that points away from the size.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
done_when:

- `go test ./src/modules/mcp/ -run 'TestABodyPastTheCapNamesTheCap|TestBadJSONAnswersAParseError'` passes
- `./RUNME.sh check` answers 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh test src/modules/mcp

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

`serves` in `src/modules/mcp/mcp.go` reads the body through `http.MaxBytesReader`, so a body past the cap answers 413 with a line naming the cap, where it answered 200 with a bad-params code before. `Handle` answers JSON that does not parse with the JSON-RPC parse error `-32700`. Both new cases failed red and pass now.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the fix sketch, with 413 for the cap
- the parse code stands under a name beside the other codes
- the cap stands in `bodyCap` alone

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
