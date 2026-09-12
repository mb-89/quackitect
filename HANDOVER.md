---
kind: [[handover]]
status: done
urgency: now
---

# Where it stands

The canary bites. A session that skips the line meets a warning on its next
tool call and a refusal on every one after.

`./RUNME.sh check` answers 0 on client 2.1.269.

| the piece | where it stands |
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

The canary carries no tooth at all before this branch. `heardCanary` writes a
warning and the session runs on. Every other rule in this tree bites at a door.
So the one rule proving the cage holds a session is the one rule holding
nothing.

The box starts this branch on client 2.1.266. The design measures
`session.compact` against 2.1.269, so the plugin validator refuses the module
and the battery reads red. The owner takes the client to 2.1.269, the battery
turns green, and the code wants no change.
