---
kind: [[ticket]]
state: closed
step: do
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
group: the-engine-fixes-its-faults
record:
  - step: answer
    hand: box d6f05e3a585030 · claude-code · the owner says so
    hash_before: c1540a401286b74d1986ad3ed5cc5ecac7a18b7f
    hash_after: c1540a401286b74d1986ad3ed5cc5ecac7a18b7f
    inputs:
      - name: ask
        hash: 4a7ea35c497553e1
        size: 1382
      - name: [[spec/tickets/a-reply-follows-its-prompt]]
        hash: dab8242d80a4310b
        size: 26112
      - name: [[spec/design_output/level0]]
        hash: 22fc99331ec488bc
        size: 87937
    def: 2280015d497a3abd
  - step: do
    hand: box d7e124b659cd · claude-code-remote
    hash_before: 13d3c0686aae835511d3c50fca9db69be74d0b11
    hash_after: 1c1f21d03e8d2517b0864379da8c9d57e620d0ab
    answered:
      - name: tests
        exit: 0
        said: green, 65 test(s) pass in 4 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-queue-views-agree.md:241:1: CodeSpans: A sentence holds 4 code spans, and this one holds 10. Carry the "
    inputs:
      - name: answer
        hash: d4e0d7d69e9a0465
        size: 196
    def: 9395391d8c0e6392
reason: done
---

# Ask

<!-- question, as text: what a person decides, and the ticket the question comes from -->
<!-- waits, as list: one line each, naming what stands still until the answer lands -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

Run the reply probe on a desk whose client loads function hooks, and write what it shows. [[spec/tickets/a-reply-follows-its-prompt]] keys the answer door on the prompt, and puts the warning on the prompt's own event. Two things stand unmeasured, because the cloud box that built it loaded no function hooks:

| what the probe reads | what follows |
|---|---|
| the text of the call's own message on the `tool.call` event | `holdsForAnswer` pays off that field, and a case drives it |
| that text on no field | the same-message line goes back to the owner, with the log |
| the session reads the prompt opening on the `warns` line | the warning stands as built |
| the session reads the prompt without that line | the warning line goes back to the owner, with the log |

`./RUNME.sh probe` runs the client headless, and holds `compact` today. The `do` step adds `reply` beside it, the way [[spec/design_output/level0#what-the-probe-does]] reads `compact`.

- the reply in the same message as the first call after a prompt still meets the door
- the warning on the prompt stands unproven in the live client

- `./RUNME.sh probe reply` exits 0 and prints what `tool.call` carries at the first call after a prompt
- a case in `test/level0/answer-door.test.js` pays the door off the field the probe names. Where no field carries the text, the answer says so
- `./RUNME.sh check` exits 0

# answer

<!-- answers the question the ask carries -->

## answer

<!-- the answer, which the step behind this one reads -->
<!-- the form is text -->

The answer waits for the do step. The owner rules that the do step adds `./RUNME.sh probe reply` first, and then the probe runs on this Windows desk, whose client loads function hooks.

# do

<!-- carries the answer out, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh test test/level0/probe-reply.test.js test/level0/probe.test.js test/level0/bridgehead.test.js test/level0/answer.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

`./RUNME.sh probe reply` runs the client headless on a prompt asking for a line of text and a call in one message.

| part | what it does |
|---|---|
| `REPLY_PROBE` in `.claude/skills/level0/lib/guidance.js` | holds the prompt, its marker, the line it asks for, and the row's name |
| `probes` in the bridgehead | a prompt carrying the marker arms the next call, which writes one `probe.reply` row holding the event's short fields |
| `readsReply` in `src/scripts/probe-reply.js` | names each field carrying the line, and reads whether the answer quotes the warning as the prompt's first line |
| `probeReply` | prints the fields and both reads, and answers red where no row lands |

A cloud box loads no function hooks, so the run on a desk stays open. The case in `test/level0/answer-door.test.js` waits for the field that run names, and a question ticket carries the run.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change adds the probe the answer names first, and the desk run goes to the owner as a question ticket
- the file ceiling on the bridgehead stands from before this change, and a note carries it
- the design note names the probe once, and points at `REPLY_PROBE` for the prompt

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

On the owner's desk, `./RUNME.sh probe` holds `compact` and `cold` alone. The `do` step behind `answer` adds `reply`, so the run this question asks for waits on that step.
