---
kind: [[handover]]
status: todo
urgency: now
---

# Where it stands

The canary bites. A session that skips the line meets a warning on its next
tool call and a refusal on every one after.

`./RUNME.sh check` answers 0 on client 2.1.269.

| the piece | where it landed |
|---|---|
| the debt opens on a first answer missing the line | `hooks/level0.js`, `turn.complete` |
| a later answer holding the line clears it | the same hook |
| one warning, then a refusal | `canaryDoor`, beside `answerDoor` |
| the refusal carries the sentence | `OWES` in `lib/guidance.js` |
| a wrong count owes what silence owes | `canaryIn` answers `other`, and the door reads it unpaid |
| a helper and the road to the owner pass | `e.agentId` and `reachesTheOwner` |
| god mode passes it | `godPasses` wraps the hook, so this costs no code |
| the chapter says the tooth | `spec/design_output/level0#the-canary-owes-a-debt` |

Five tests in `test/level0/hooks.test.js` hold the door.

# What waits

Nothing on this branch. Merge it and close it.

# What surprises me

The canary carried no tooth at all. `heardCanary` wrote a warning and the
session ran on. Every other rule in this tree bites at a door, so the one rule
proving the cage holds a session was the one rule holding nothing.

The box ran client 2.1.266 while the design measured `session.compact` against
2.1.269, so the plugin validator refused the module and the battery read red.
The owner took the client to 2.1.269 and the battery went green. The code wants
no change.
