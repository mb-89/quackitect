---
kind: [[ticket]]
state: open
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
step: do
---

# Ask

The cold probe proves the clear live, with the real client in its throwaway clone. Past a low `context.handoverAt` in the clone's runtime config, the session writes the handover, the conversation clears, and the next one opens on the resume prompt and pulls `read-handover`. The fakes in [[spec/tickets/the-clear-continues-the-session]] meet no remote client, and a remote client may refuse a clear a plugin asks for.

Without the check, a box past the key may still stand idle, and nobody reads why.

- the cold probe's `clear` check reads the clone's handover, then a pull handing `read-handover` past the clear, or the warn row naming the host's refusal. `./RUNME.sh probe cold` decides it
- the check reads recorded rows and streams in cases of `src/quack`. `go test ./src/quack/ -run Clear` decides it
- `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

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

The first trial ran on a cloud box. A cloud session ran the trial with `context.handoverAt` at 1000. The door ran the fold of [[spec/tickets/the-clear-continues-the-session]], and the plugin ran the module the session loaded at its start, which awaited `/clear` inside the hook. The pull handed `handover`, then `clear`, and the turn ended. The session log read:

    {"kind":"bridge","level":"warn","said":"the clear the handover asks for fails","event":"turn.complete","detail":"level0: command.run: called from a classic.Stop hook, it would wait on the turn this hook is holding; run it from a later event (turn.complete) (host check)"}

The `event` field names the hook the old module wrote on every row. The detail names the hook the call came from.

| question | what the row settles |
|---|---|
| does the door answer the clear | yes: the Stop answers it, and the plugin calls `/clear` |
| does a remote host clear at all | the host refuses a command inside a Stop hook alone, and names the turn's completion as the place |
| does the conversation clear | no: the refusal leaves it as it stood, with `clear` in hand |

So the plugin now runs a clear the Stop answers at the main agent's next `turn.complete`, after that event's hooks answer, and a timer covers a turn that completed before its Stop. The dry probe raises the Stop first, as the host names, and its fake host refuses a command inside every hook but the turn's completion.

What stands open: the next session past the key loads the new module, and proves the clear live. Run it as the ask says, with the key at 1000 in `.se/.runtime/config.json`, on a branch whose group ticket stands open. A pull on a work branch whose group ticket stands closed answers `done` before it reaches the due mark, so the handover never comes. The trial dropped its `clear` hold and due mark by hand, since only the clear's `session.end` drops them, and the verb refuses to hand `clear` back.

The owner's decision: one live benchmark stands, the cold probe, so this trial becomes its `clear` check, and no second live box or test stands. The ask above takes that shape.

The route: `./RUNME.sh branch open` pushes a marker on main, so the box cut `work/the-clear-continues-the-session` off main by hand, as the groups of #138 and #140 did. The group's own ticket stands closed and takes no child, and the pull refuses to take its leaf back for a hand that never passed it. So this ticket stands with no group, opens alone, and rides the group's branch and its pull request.
