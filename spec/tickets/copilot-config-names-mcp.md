---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: copilot-meets-the-hooks-door/gate
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
parent: copilot-meets-the-hooks-door
record:
  - step: do
    hand: box d85490c97110e · claude-code-remote
    hash_before: d7a097b736fefeaa22cdc906c894842452b1fa52
    hash_after: 163957f2ded21456d1906b7f8f5316eddbe4ea0d
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/mcp passes
      - name: check
        exit: 0
        said: "src/scripts/copilot-shadow.js:5:1: correctness/noUnusedFunctionParameters: This parameter result is unused."
    inputs:
      - name: ask
        hash: 1a1c11dcb6612e0f
        size: 294
    def: 60c95432c26efd34
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the ask routes Copilot through MCP, and the draft hands Copilot's MCP config to go-cage-switches-over, whose ask names no Copilot config, so the MCP half lands nowhere; name the mcp module's server in the config Copilot reads, in shadow, or write that line into the ask of go-cage-switches-over

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

The mcp listener takes a fresh port and token at each start, so the config Copilot reads names no fixed address for it. A stdio verb on se-index, reading mcp.json and relaying each message, gives Copilot one command to name. That verb and the setup line land with the switch-over, when Copilot starts to answer off the new path. The line stands under the Discussion of go-cage-switches-over, the one chapter a hand holding no step of that ticket writes. In shadow, the hooks door alone compares decisions, and the mcp server answers no decision the cage reads.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change takes the second road the ask offers, and writes the line under Discussion, since a hand holding no step writes nowhere else
- the change reveals the stdio verb as the cleanup, which the line names for the switch-over, and a stray binary a hand-back staged, which leaves in the same commit
- the fact stands once, on go-cage-switches-over, and links this ticket

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
