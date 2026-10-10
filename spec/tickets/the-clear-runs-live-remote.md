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
step: do
record:
  - step: do
    hand: box 17969d0d25e0 · claude-code-remote
    hash_before: 2db242a4e59cb039f2ba7d97a18e517a44b0565d
    hash_after: ea227f3d311543a6c0244b3f2b16aa43d62a105e
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "   63.4  in all"
    inputs:
      - name: ask
        hash: 5e4482433349ef26
        size: 835
      - name: [[spec/tickets/the-clear-continues-the-session]]
        hash: f737dd67dfda93a1
        size: 936
    def: df12650931d480c9
reason: done
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

./RUNME.sh test src/quack/probe_cold_test.go src/quack/probe_cold_clear_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The cold probe proves the clear on a live client. Once its start checks pass, it mints the probe's group and leaf in the clone, sets `context.handoverAt` low in the clone's runtime config, and runs the client a second time through the real pull.

The `clear` check in src/quack/probe_cold_clear.go reads that run:

- PASS: a pull closes the handover and hands the clear, a prompt opens on the resume prompt, and a pull past it hands `read-handover`
- WARN: the plugin's warn row names the host's refusal, and the probe still passes
- FAIL: anything else

The first live run showed level zero consumes `.se/HANDOVER.md` into its block at the clear, so the check reads the pull's close line, not the file. The stream reader now keeps tool results and user prompts. Cases over recorded rows and streams hold every road. Live on this cloud box, the uncut probe passed every check, and the commit gate's probe passed again.

What I weigh: past the clear the session works the probe's leaf until it ends, so the run costs the leaf's time inside the probe's bound. The compaction probe stays its own run, and a note weighs folding it in.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: the clear check reads handover, clear, resume prompt and read-handover live, or the refusal as a warning, with cases in src/quack
the cleanup: the client env stands once in coldEnv; the compaction fold and the client drift on the types part stand as notes
one place: the resume prompt stays in hooks.ResumePrompt, the read line in dryReadHeld, and the group and key in grouped and keyed

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

The route: `./RUNME.sh branch open` pushes a marker on main, so the box cut `work/the-clear-continues-the-session` off main by hand, as the groups of #138 and #140 did. The group's own ticket stands closed and takes no child, and the pull refuses to take its leaf back for a hand that never passed it. So this ticket stands with no group and opens alone. The pull reads the branch name as the group, and refuses work on a branch whose group stands closed, so the box renamed its unpushed branch to `work/the-clear-runs-live-remote`, and the pull request rides that branch.

The live runs, on a cloud box whose client signs in through the host:

| run | what it read |
|---|---|
| the probe before the change | the six start checks pass |
| the first clear check | the clear ran live, and the check failed, because level zero consumes the handover file into its block at the clear |
| the corrected check | the client was cut once read-handover stood in hand; PASS clear |
| the final run, uncut | every check passes, PASS clear, and the client ends on its own |

Past the clear the session holds neither the probe's prompt nor the handover's stop line as a stop: it passes read-handover and works the probe's leaf until it ends. The check decides before that, and the run costs the leaf's time inside the probe's bound.
