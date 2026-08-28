---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: raid-iss-the-call-log-names-every-vehicle-the-engine-produced
type: "[[raid]]"
kind: issue
statement: The lane logs every call's arguments, so the engine's own call log holds the path, the name and the minted identity of every vehicle it has produced, which the test-spec forbids in as many words.
owner: the driving agent
status: open
breaks_how_badly: corrosive
how_likely: expected
impact: The isolation law is graded fatal, and a log the engine can read is mechanically a registry — grepping it enumerates every vehicle this engine made. The claim that the engine keeps no record of what it produced is false as written, and it is a claim the product makes about its own safety.
source_refs:
  - tsp-the-engine-keeps-no-record-of-what-it-produced
  - req-nothing-a-copy-does-reaches-its-source
  - req-the-source-keeps-no-record-of-a-copy
  - raid-dec-a-vehicle-is-a-copy-with-a-one-way-upstream-link
place: i42-the-served-word-matches-the-machine-guid
---

## What is happening

FOUND BY THE i16 TESTER, 2026-08-18, reading the spec against the code.

[[tsp-the-engine-keeps-no-record-of-what-it-produced]] says it plainly: "NO LOG
LINE NAMING IT. Pass — the call log records that a producing act ran and does
not record what it produced."

THE LANE LOGS EVERY CALL'S ARGUMENTS, which is the whole point of the lane. So
`.se/calls.jsonl` in the engine's tree carries each vehicle's destination path,
its name, and the identity the act minted. The mirror's produce route logs the
result as well.

BOTH READ FINE ALONE. The spec is right about what should be true, the logging
is right about what a lane does, and nothing in the corpus resolves them.

## Two resolutions, and they are not equal

REDACT. The producing verbs log that they ran and not what they produced. This
keeps both halves true and makes the isolation claim mechanically checkable
rather than argued. It costs a special case in the logging path, which is a real
cost — the log's value is that it has no special cases.

SCOPE THE SESSION STATE OUT, on the argument that a call log is the operator's
record of their own acts, on their own machine, never copied and never read by
the product; while a REGISTRY is something the product consults to find its
copies. That distinction is sound and it is written down nowhere.

THE SECOND IS WEAKER THAN IT SOUNDS. Nothing stops the engine reading its own
log. "It is only a log" is exactly the shape of argument that erodes a
fatal-graded law, and the erosion is invisible until somebody builds the feature
that reads it.

## Why it is an issue rather than a risk

IT IS HAPPENING NOW, in this repository, on every producing call. Nothing about
it is conditional.

## What would close it

EITHER RESOLUTION, WRITTEN DOWN. What is not acceptable is leaving the spec
saying one thing and the code doing another, because the next reader will
believe whichever they happen to open.
