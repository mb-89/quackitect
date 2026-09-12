---
kind: [[handover]]
status: held
urgency: now
---

# Where it stands

The canary bites. The door stands in `hooks/level0.js` as `canaryDoor`, the
wording in `lib/guidance.js` as `OWES`, the chapter in
`spec/design_output/level0#the-canary-owes-a-debt`, and five tests in
`test/level0/hooks.test.js` hold it.

`./RUNME.sh check` answers 1, and no test fails. The one error stands on main
already and this branch never touches it. For details, see the last chapter.

| the piece | where it landed |
|---|---|
| the debt opens on a first answer missing the line | `hooks/level0.js`, `turn.complete` |
| a later answer holding the line clears it | the same hook |
| one warning, then a refusal | `canaryDoor`, beside `answerDoor` |
| the refusal carries the sentence | `OWES.denies` |
| a wrong count owes what silence owes | `canaryIn` answers `other`, and the door reads it unpaid |
| a helper and the owner's road pass | `e.agentId` and `reachesTheOwner` |
| god mode passes it | `godPasses` wraps the hook, so this costs no code |

# What waits

A person merges this into main, because trunk only ever comes towards a box.

Run `./RUNME.sh work done` once the battery answers green. The verb refuses a
red one, and it is right to.

# The error this branch inherits

`hooks/level0.js` registers `on("session.compact", ...)`. The client on this box
reads 2.1.266 and holds no such event, so the plugin validator refuses the
module and `check` answers 1.

`spec/design_output/level0#three-roads-to-a-compaction` measures that event
against client 2.1.269. So the code names an event a later client carries, and
the skew is the whole of the fault. The validator reads the module source, so
no runtime guard reaches it.

Three roads stand open, and the owner picks one:

| road | what it costs |
|---|---|
| take the client to 2.1.269 or past it | the box changes, and the design already measures this road |
| drop the `session.compact` hook | the compaction line leaves the log |
| pin the design to 2.1.266 and drop the hook | the two say the same thing again |
