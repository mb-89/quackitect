---
kind: [[ticket]]
state: open
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
    reads: [[spec/guidance/working]]
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
process_hash: 1f3006ec4b044a89
step: do
record:
  - step: answer
    hand: box d6f05e3a585030 · claude-code · the owner says so
    hash_before: 2c59cbac86f37527c768043c30c0fcd8d1c96a76
    hash_after: 2c59cbac86f37527c768043c30c0fcd8d1c96a76
---

# Ask

<!-- question, as text: what a person decides, and the ticket the question comes from -->
<!-- waits, as list: one line each, naming what stands still until the answer lands -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

Run the clear against the live client on a desk, and write what the log shows. The fake tests cover every step of [[spec/design_input/the-clear-hands-ephemeral-tickets]]. None of them sees the bridgehead run `/clear`, or the next conversation open on `read-handover`. A cloud box met a refusal from the harness when it started a second client, so a person runs the trial.

Run it in a clone you throw away, so the agent there touches no tree you keep:

    git clone <the repository> clear-trial && cd clear-trial
    git checkout -B main origin/main
    ./RUNME.sh
    git rm -rq spec/tickets && git commit -qm "trial: empty queue" --no-verify
    mkdir -p .se/.runtime && echo '{"context":{"handoverAt":1000}}' > .se/.runtime/config.json
    claude

The empty queue keeps the agent off real work, and the low key marks the session due at its first measure. Start from `origin/main` once the branch that builds the clear lands there, or from `origin/claude/exciting-carson-ddnxxn` before. Type this prompt in the client:

    Run ./RUNME.sh ticket pull and do what its answer asks. Keep pulling. Once read-handover closes, stop and report which tickets you held.

Watch the work tab in `./RUNME.sh tui` beside it, then read the log:

    grep -E '"kind":"(handover|clear)"' .se/.log/session.jsonl
    ls .se/.runtime/hold

Write what the log and the tab show into the answer, and name any step that runs another way.

- nothing else stands still: the clear works under the fakes, and this trial proves it in the live client
- a fault the trial finds turns into a fix under `do`

- the log carries a `handover` line past the key, then a `clear` line
- the agent's report names the three tickets in the order the pull hands them
- `ls .se/.runtime/hold` names no hold carrying `ephemeral` once `read-handover` closes
- the work tab draws each of the three at place `0` while it stands held

# answer

<!-- answers the question the ask carries -->

## answer

<!-- the answer, which the step behind this one reads -->

<!-- the form is text -->

The clear runs live on a desk, mid-retro, and the owner takes that run as the proof.

| done_when | what the log and the session show |
|---|---|
| a `handover` line past the key, then a `clear` line | a `handover` line names the context past `context.handoverAt`, and a `clear` line follows it |
| the three tickets in the order the pull hands them | the next conversation opens on `read-handover` in hand, and its pass hands the retro back |
| no hold carrying `ephemeral` once `read-handover` closes | `.se/.runtime/hold` holds the retro's hold alone |
| the work tab draws each of the three at place `0` | the owner takes the run as proof, and this answer reads no tab |

Two steps run another way, and each stands on a ticket of its own:

- a shell call naming `read-handover` meets `No ticket named read-handover`, since the ticket stands in no file: [[spec/tickets/the-todo-joins-the-queue]]
- the clear fires mid-retro on a binding reading `queue`: [[spec/tickets/the-retro-holds-the-clear]]

# do

<!-- carries the answer out, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
