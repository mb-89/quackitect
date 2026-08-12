---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: req-no-agent-act-destroys-work
type: "[[requirement]]"
statement: While an agent walks at any autonomy setting, the engine shall leave 100 % of work already committed recoverable from the repository, without a person's act.
kind: quality
characteristic: safety
verify_method: test
breaks_if_removed: An unattended night can end with committed work gone and no way back, which makes the unattended walk unsafe to leave.
breaks_how_badly: crippling
measure: 0 agent-reachable operations that make committed content unrecoverable from git, across the whole lane surface.
refines:
  - uc-quality-safety
source_refs:
  - "guidance/refusals.md: SE-C-002 — no history rewrite"
  - "guidance/refusals.md: SE-C-003 — the agent never pushes"
  - req-archive-read-only
  - req-land-is-one-piece
priority: must
---

## Scenario

SOURCE. Any agent, at any point on the autonomy slider, including one running
overnight with nobody watching.

STIMULUS. Any operation the lane offers — a write, a delete, a move, a merge,
a git verb, a shell command.

ENVIRONMENT. Normal operation, and also the failure cases: a crash mid-write,
a host that dies, a walk that runs out.

ARTIFACT. The repository, and everything committed to it.

RESPONSE. Whatever the operation did, the committed content is still
recoverable from git without anybody's intervention.

RESPONSE MEASURE. Zero agent-reachable operations that make committed content
unrecoverable, across the whole lane surface.

## Detail

WHAT SAFETY MEANS HERE. Nobody's life is at risk. What is at risk is work,
and a record that cannot be reconstructed once it is gone. The standard's
frame still applies: the irreversible act is the hazard.

THIS IS A CROSS-CUTTING DEMAND, not a restatement of the refusals that serve
it. SE-C-002 stops a history rewrite, SE-C-003 stops a push, the archive is
read-only, and a land is one merge or none. Each is one mechanism. This row
is the property they exist to hold, and it is what a NEW mechanism has to be
checked against.

WHY IT IS WORTH WRITING SEPARATELY. A new lane verb is added by asking
whether it is useful. Nothing today asks whether it is safe. This row is what
that question would read.

THIS ROW CAME FROM THE CHECKLIST (owner design 2026-08-07). Safety is new in
ISO/IEC 25010:2023 and it had no answer here at all.
