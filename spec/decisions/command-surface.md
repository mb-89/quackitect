---
id: command-surface
statement: The surface is three default-closed intents: note (capture), engage (start/next/ship), and review (readout/retro). A separate determinizer lane runs status, why, and bless. Ship is engage's terminal output. Field feedback is a retro question, not a milestone.
type: requirement
refines: [uc-engage-start]
class: judgment
killer: false
---

## Rationale (not load-bearing)

Mirrors sebot's todo/work/review default-closed surface: sub-operations (triage, defer, retire,
retro, ship) are reached through an intent, never promoted unless proven. Ship has no home under
"assess" — it is the output at the end of engage. The old field-feedback milestone was cumbersome
(nothing to measure on a fresh build, so the agent gold-plated and could not terminate); folding it
into retro's opening question at the next engage start removes the termination trap.
