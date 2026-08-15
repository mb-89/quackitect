---
minted_in: i27
id: opt-reload-the-whole-engine
type: "[[option]]"
statement: restart the one engine process when its code changes, so every record's walk picks up the new version together
cluster: cluster-the-walk
question: how a change to the engine's own code takes effect
found_by: heuristic
source: "what stands today — se_reload restarts the single server, and every walk on the machine restarts with it"
---

## Mechanism

One engine serves every record. Its code changes on disk. Somebody calls the
reload verb, the process comes up again, and every open record is now served
by the new version.

WHAT IT COSTS THE PERSON WHO MADE THE CHANGE. They leave whatever they were
doing. Measured 2026-08-13: eight step-outs in one session, three of them
inside a single verification.

WHAT IT COSTS EVERYBODY ELSE. Every other open record is restarted by a
change it did not ask for and cannot see. A half-finished engine edit made
in one iteration is live in all of them until it is fixed.

WHY IT IS ON THE CHART AT ALL. It is what stands, it costs nothing to build,
and a row whose only answers are new machinery is a row nobody checked
against the baseline.

## What it rules out

Nothing structural. Every candidate can pick it, which is exactly why it is
the row's null answer.
