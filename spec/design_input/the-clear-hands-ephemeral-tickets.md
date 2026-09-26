---
kind: [[design_input]]
---

# Scope

The engine hands the agent work that no ticket file carries, as an ephemeral
ticket. The clear runs as ephemeral tickets first, and the cleanups follow.
The work tab shows the agent at each one.

# An ephemeral ticket stands held

| kind | where it stands | travels | its states |
|---|---|---|---|
| tracked | `spec/tickets/` | yes | `draft`, `open`, `closed` |
| private | `.se/tickets/` | no, it dies with the box | `draft`, `open`, `closed` |
| ephemeral | the hold alone, `.se/.runtime/hold/<hand>.json` | no, it dies at its hand-back | `held` |

- The engine shall mint an ephemeral ticket at a pull, and hand it out held.
- The hold shall carry the ticket's name, its ask and its hand-back check, in place of a path to a ticket file.
- The hand-back shall run the check, and delete the hold where the check passes.
- The ticket schema shall stay as it stands, and no `held` joins its `state` enum.
- The work tab shall draw a held ephemeral ticket the way it draws a plan todo.
- The stop hook shall carry a turn while an ephemeral ticket stands held, as it does for any hold.
- A held `clear` stands as the one exception, and the clear's chapter names it.

For the hold, see [[spec/design_output/pull#the-hand-and-the-hold]]. For the
plan todo, see [[spec/design_output/stop#the-plan]].

# The ticket ends first

- A session past `context.handoverAt` shall go due, and no block rides a call.
- The ticket in hand shall run to its end: the pull hands its next leaf to this hand while one admits it.
- The clear shall start at the first pull that reaches past that ticket.
- No stage stops a step, and `context.writeAt` goes.

The owner accepts the cost: a long ticket runs past `context.handoverAt` with
no brake, up to the harness's own compaction.

# Three tickets run the clear

| order | the ticket | the agent does | what closes it |
|---|---|---|---|
| 1 | `handover` | writes `.se/HANDOVER.md` | the hand-back, where the file stands and names no file under `.se/.retro` |
| 2 | `clear` | ends the turn | the engine, at `session.end` with reason `clear`, after the bridgehead runs `/clear` |
| 3 | `read-handover` | reads the handover block the first message carries | the hand-back on `--pass`, and the queue hands the next leaf |

- The agent types no `/clear`, and the bridgehead runs it at the turn's end.
- A held `clear` shall let the turn end, where every other hold carries it.
- The hold outlives the clear on disk, so the engine closes `clear` in the next conversation and puts `read-handover` in hand.
- The prompt opening the next conversation shall send the agent to the pull, which hands `read-handover` first.
- These tickets shall take the place of the plan's handover todo. For the todo, see [[spec/design_output/work#one-handover-stands]].

# The binding decides who clears

| the binding | the clear |
|---|---|
| `queue` | runs as the three tickets |
| `god` | runs where the owner asks for it, and nowhere else |
| `unbound` | runs nowhere here, and a later gate asking for a ticket before a write catches the session |

For details, see [[spec/design_output/stop#the-queue-alone-clears]].

# Cleanups turn ephemeral

The refactor and check cleanups become ephemeral tickets, so the work tab
shows the agent at them. The refactoring hand changes apart from this note.
For the cleanups, see [[spec/design_output/pull#an-empty-queue-hands-cleanup]].
