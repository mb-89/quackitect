---
minted_in: i1
id: raid-harness-half-life
type: "[[raid]]"
kind: risk
statement: Scaffolding built to steer today's models expires when the next model generation stops needing it.
owner: the driving agent
trigger: every retro, asking which piece the newest model generation made pointless
status: open
breaks_how_badly: corrosive
how_likely: expected
impact: Effort spent on a steering mechanism the model no longer needs is effort spent twice, and the mechanism then has to be removed rather than merely abandoned.
source_refs:
  - the reading-proof mechanism
  - the narration toll
---

Some of this machine exists because models forget, drift, or skip. Those are
properties of a model generation, not of the problem.

The parts that survive are the ones about the WORK: the rigor matrix, the
evidence forms, the trace. The parts at risk are the ones about the WALKER.

The trigger is deliberately a question rather than an event, because the
expiry has no moment — it is noticed only by asking.

## Retro sweep 2026-08-13

This retro's answer to the standing trigger question ("which piece did
this period make pointless"): the handover document's single-role
assumption. It was written for one agent that boots the server, cages
itself, and walks — and that agent cannot exist, because a running
session cannot apply a cage to itself (the deny list and MCP config load
only at session start). The real shape needs two roles, an uncaged
bootstrap and a caged walker, and the handover did not say so.

Smaller instance of the same pattern: the harness's own permission
classifier refused to write `.claude/settings.json` on this host, so the
handover's documented cage-placement step was not available here at all
— command-line `--mcp-config`/`--settings` flags were the working path
instead.

Both are steering scaffolding (a handover doc, a placement convention)
breaking against the deployment reality, matching this entry's statement
though the cause here is a topology change rather than a model-generation
change. Fix: durable home is `.se/HANDOVER.md`, updated this retro with
the two-role split and the CLI-flag cage path. See the i8 field-report
§1.5, §1.6 and §3.
