---
id: i14-the-ladder-engine-half-comparison-moves-
status: seeded
opened: 2026-08-12T19:42:27.402Z
goal: "The ladder, engine half: comparison moves from numbers to rung order, and every numeric priority left in the engine, the scale and the guidance goes."
vision: |-
  PAIRS WITH i13 AND MUST NOT RACE IT. i13 rewrites the machine FILES and carries the tag rename there. This is everything else: the engine, the scale, the guidance and the tests.

  DONE LOOKS LIKE: no number anywhere decides whether a step is the agent's. The comparison asks which rung, in order. The word is the truth.

  THE RULING: numeric priorities are abolished. Not 0.01, not 0.1, not 0.2, not 0.8. The 1.5 tier becomes the word blocked. The tag is called autonomy.

  WHY blocked WORKS ONCE THE NUMBERS GO. Today blocked means 0 at the control end and the archives sit at 1.5 at the state end, which reads as a contradiction. With words and an ordered ladder it is one meaning: the agent never enters. The contradiction was an artifact of the numbers.

  EVERY SITE, SWEPT 2026-08-12. engine/iterations.ts lines 264, 273, 300, 342, 382, 646, 670, 696, 704, 1014. engine/expmachine.ts lines 42, 149, 244, 299, 345, 361. engine/rigor-matrix.ts lines 625, 662, 681. engine/session.ts line 1780, which mints a state at priority 0 while machines/scale.md says no state is ever authored at 0.

  DOCUMENTATION: guidance/authoring/machines.md line 79 still documents the range as "0.01 .. 1". machines/scale.md lines 45 to 51 still carry numbers beside the rungs as transitional anchors.

  SERVED PAYLOADS CARRY NUMBERS ON THE WIRE and must carry the word instead: the pull's options, se_survey's doors, and the packet's states.

  THREE TEST FILES WERE PINNED TO THE CURRENT NUMBERS on 2026-08-12 and are redone here: threshold.test.ts, route.test.ts and editsafety.test.ts. Two of them carry comments saying exactly that, including one that asserts an un-swept 0.01 deliberately, as a tripwire for this work.

  WATCH THE COMPARISON LOGIC. engine/machines/compile.ts asPriority accepts a tier WORD and looks it up in the scale, and accepts a NUMBER unchanged. The numeric path goes when the sweep lands. Nothing floors a value today, which is why boot's 0.01 survives at the machine level.

  EDITSAFETY NEEDS CARE. Its test edits idle.md's priority line and depends on the replacement having the SAME BYTE COUNT, because a cache stamped by size and mtime would sail past an edit of a different length. It currently pads a number to ten characters to match the word mechanical. Whatever the tag becomes, that trick has to keep working or the test stops proving what it exists to prove.

  FULL CONTEXT: project/spec/version-planning.md, section D2 and i14.

  FROM THE POOL, 2026-08-13. One more, and it changes what a session is.

  ONE ENGINE PER PROJECT, MANY HANDS (owner design, note-ac0d51fafb55, kind B of three). A project is opened by one engine at a time, or conflicts follow - that is the owner's law. That one engine drives several hands: two agents, or two agents and a person. Both agents show in the editor extension, colour-coded per agent. THE ENGINE WORK IS TWO THINGS: sessions become per-hand, and the panel renders several walks. Kind A of the three shipped as i2, and kind C - an agent spawning sub-agents below its own autonomy tier - rides i10 as guidance rather than engine work.
inputs:
  - project/spec/version-planning.md
  - i13-the-machine-format-state-machines-become
  - machines/scale.md
  - engine/machines/compile.ts asPriority
depends_on:
  - i13-the-machine-format-state-machines-become
---

# i14-the-ladder-engine-half-comparison-moves-

## Goal

The ladder, engine half: comparison moves from numbers to rung order, and every numeric priority left in the engine, the scale and the guidance goes.

## Rough vision

PAIRS WITH i13 AND MUST NOT RACE IT. i13 rewrites the machine FILES and carries the tag rename there. This is everything else: the engine, the scale, the guidance and the tests.

DONE LOOKS LIKE: no number anywhere decides whether a step is the agent's. The comparison asks which rung, in order. The word is the truth.

THE RULING: numeric priorities are abolished. Not 0.01, not 0.1, not 0.2, not 0.8. The 1.5 tier becomes the word blocked. The tag is called autonomy.

WHY blocked WORKS ONCE THE NUMBERS GO. Today blocked means 0 at the control end and the archives sit at 1.5 at the state end, which reads as a contradiction. With words and an ordered ladder it is one meaning: the agent never enters. The contradiction was an artifact of the numbers.

EVERY SITE, SWEPT 2026-08-12. engine/iterations.ts lines 264, 273, 300, 342, 382, 646, 670, 696, 704, 1014. engine/expmachine.ts lines 42, 149, 244, 299, 345, 361. engine/rigor-matrix.ts lines 625, 662, 681. engine/session.ts line 1780, which mints a state at priority 0 while machines/scale.md says no state is ever authored at 0.

DOCUMENTATION: guidance/authoring/machines.md line 79 still documents the range as "0.01 .. 1". machines/scale.md lines 45 to 51 still carry numbers beside the rungs as transitional anchors.

SERVED PAYLOADS CARRY NUMBERS ON THE WIRE and must carry the word instead: the pull's options, se_survey's doors, and the packet's states.

THREE TEST FILES WERE PINNED TO THE CURRENT NUMBERS on 2026-08-12 and are redone here: threshold.test.ts, route.test.ts and editsafety.test.ts. Two of them carry comments saying exactly that, including one that asserts an un-swept 0.01 deliberately, as a tripwire for this work.

WATCH THE COMPARISON LOGIC. engine/machines/compile.ts asPriority accepts a tier WORD and looks it up in the scale, and accepts a NUMBER unchanged. The numeric path goes when the sweep lands. Nothing floors a value today, which is why boot's 0.01 survives at the machine level.

EDITSAFETY NEEDS CARE. Its test edits idle.md's priority line and depends on the replacement having the SAME BYTE COUNT, because a cache stamped by size and mtime would sail past an edit of a different length. It currently pads a number to ten characters to match the word mechanical. Whatever the tag becomes, that trick has to keep working or the test stops proving what it exists to prove.

FULL CONTEXT: project/spec/version-planning.md, section D2 and i14.

FROM THE POOL, 2026-08-13. One more, and it changes what a session is.

ONE ENGINE PER PROJECT, MANY HANDS (owner design, note-ac0d51fafb55, kind B of three). A project is opened by one engine at a time, or conflicts follow - that is the owner's law. That one engine drives several hands: two agents, or two agents and a person. Both agents show in the editor extension, colour-coded per agent. THE ENGINE WORK IS TWO THINGS: sessions become per-hand, and the panel renders several walks. Kind A of the three shipped as i2, and kind C - an agent spawning sub-agents below its own autonomy tier - rides i10 as guidance rather than engine work.

## Inputs

- project/spec/version-planning.md
- i13-the-machine-format-state-machines-become
- machines/scale.md
- engine/machines/compile.ts asPriority
