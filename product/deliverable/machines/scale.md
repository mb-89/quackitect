---
id: autonomy-scale
statement: The autonomy levels — the slider's notches and their meaning. The engine READS this file; edit it here.
---

# The autonomy scale

Uniform 0.2 bands over a 0.01 floor. NO STATE IS EVER AUTHORED AT 0, and
that is what makes a full block possible — the gate refuses when a state's
priority is GREATER than the autonomy, so 0.01 is the least a step can
weigh and 0 admits nothing at all.

BLOCKED IS A SLIDER POSITION, NOT A PRIORITY ANCHOR. The other levels are
both: notches to click, and anchors to calibrate a state's `priority:`
against. Zero is only a notch. Authoring a state at 0 would let it run at
the blocked setting, which is the one thing the setting promises cannot
happen.

Edit the lines below; the mirror's notches and the level help follow on
the next reload.

## Levels

- 0 | B | blocked — nothing moves without the human
- 0.01 | M | mechanical
- 0.2 | R | routine
- 0.4 | E | everyday decision
- 0.6 | C | consequential
- 0.8 | K | killer / milestone
- 1 | I | ideation — the agent finds its own work
