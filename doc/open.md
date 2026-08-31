# Still open

Level 0 is built and its tests pass. What follows is not a hole in the design.
It is validation that could not run in this room, plus what the design called
for and nobody built. Each entry says what it is, why it stands open,
and what would close it.

## Not built

### UC-33 — a session measured for voice

The voice checker works. It reads `util/voice-rules.json`, it runs on every
write of prose, and it refuses a write that breaks a rule. The other half does
not exist. Nothing reads a finished session record, counts the findings by
rule, and says how the session went.

*Why it stands open.* The per-write check is a guard, so it lives in the hook.
The per-session measure is a report, so it lives elsewhere. Only the viewer
reads a session record today, and the viewer shows lines rather than counts.

*What closes it.* A `se --voice <session.jsonl>`. It walks the record, runs the
same `VoiceRules.Check` over every message the agent wrote, and prints one line
per rule with a count. The rules are already data, so the report follows a
change to them without a change to itself. A test writes a fake record with
three known breaks in it and asserts the three counts.

## No editor here, and no agent here

### UC-29 — idle to ready, with Claude
### UC-30 — idle to ready, with Copilot

Both walks start at the welcome page. Press the button, and end at a caged
agent that has said it is ready. Both carry a budget of fifteen seconds for the
agent's own preparation.

*Why they stand open.* This room holds no editor and no harness. Every part
underneath has a test. The projections land, the cage file arrives, the engine
starts and prints its line, the register resolves. The walk itself is a person
pressing a button and watching a clock.

*What closes them.* Doing it by hand on the reference machine, once per
harness, with the clock running. To make it automatic later takes the editor's
own test host, which is a larger thing than Level 0.

### UC-6 — the engine dies mid-session

The engine writes a heartbeat. The extension watches it and turns the button
red when the heartbeat stops.

*Why it stands open.* The watcher sits in the extension, and no test drives the
extension. A test that kills the engine proves the heartbeat stops. That is the
dull half. The half worth proving is that the editor notices.

*What closes it.* An extension test host, or a smaller claim: start an engine,
kill it, and assert that `--driver` and the heartbeat file both say what a
watcher would need to see. That much is worth its weight even without the
editor.

## Guarded by nothing, on purpose

### UC-4 — a shell command

A shell command goes into the log like everything else. No ruling refuses one.

*Why it stands open.* This is not a gap in the tests. There is nothing to
assert beyond what `TestTheGuardAppendsToTheRunningSession` already asserts. It
sits here in writing so that nobody later reads "not tested" in the coverage
table and adds a ruling nobody wanted.

*What closes it.* Nothing. It stays as it is until a ruling exists that a shell
command could break.

## The shape of what is left

Most of what is left is validation rather than building. None of it stands in
the way of Level 1 or Level 2. The cage holds, the record fills, a write to a
projection meets a refusal, and the copy-and-drive story runs end to end in one
command.
