---
minted_in: i8
id: raid-asm-help-query-vocabulary-overlaps
type: "[[raid]]"
kind: assumption
statement: An agent's plain-words query shares enough vocabulary with a tool's own name and description that keyword overlap finds it.
owner: the driving agent
trigger: a demand-log entry whose query plainly describes an existing tool in different words than the tool's own description uses
status: open
probed: not yet - needs real se_help usage
probe: unprobed - no help-demand log exists yet, so there is no real usage to spot-check. Re-probe once query traffic accumulates.
impact: A real match is scored zero and treated as a miss, so the demand log fills with phantom gaps for tools that already exist, misleading the retro that reads it.
breaks_how_badly: corrosive
how_likely: plausible
---

Underlies req-help-searches-tools-and-guidance. The scoring in engine/help.ts
is plain word-overlap (see overlapScore) — no synonyms, no stemming. It
assumes an agent's words and the lane's own words are close enough. Not
established: nobody has measured this yet, se_help does not exist before
this iteration. Not controlled: the vocabulary an agent reaches for is
whatever it reaches for, not something this iteration can fix in advance.

## Probe

Once se_help has real usage, read .se/help-demand.jsonl (rankDemand) and
spot-check the top shapes by hand: for each one, does a tool or guidance
page actually exist that answers it? A shape that resolves to an existing
tool the agent could not find falsifies the assumption; a shape that
genuinely names something absent confirms it as a real gap instead.
