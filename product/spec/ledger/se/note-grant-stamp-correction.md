---
id: se.note-grant-stamp-correction
kind: note
statement: "Correction of record: the i5-worktrees gate_kickoff grant (hash de4039a6...) reads adjudicated_by=owner but was in truth a DELEGATED self-bless by the agent under se.decision-delegated-adjudication."
provenance:
  iteration: i5-worktrees
  ai_involvement: agent-drafted
breaks_if_removed: The one grant whose stamp contradicts its true adjudication would stand uncorrected in the audit trail.
---

## What happened

- The delegated bless lane shipped with a new 'delegated' boolean on se_gate_bless.
- The harness validates args against its cached schema and silently STRIPPED the flag.
- The handler fell through to the owner stamp: the grant line for i5-worktrees/gate_kickoff records channel=chat, adjudicated_by=owner.
- The bless act itself was genuine and hash-bound; only the stamp is wrong.

## The correction

- True adjudication: agent, channel chat-grant, delegated_via se.decision-delegated-adjudication.
- Grant records are append-only; the wrong line stays as the honest record of what the tool did, THIS node is the correction beside it.
- The lane now accepts 'delegated:<hash>' inside the hash param, immune to arg-stripping; every later i5/i8 grant carries the agent stamp directly.

## The lesson (baked)

A new ARG on an existing tool is unreachable until the harness reconnects, and a silently-dropped flag can invert a semantic. Flags that must work mid-session ride existing params; the first use of any new arg gets verified.
