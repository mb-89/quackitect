---
id: i26-judgment-the-comment-system-everywhere-m
status: seeded
opened: 2026-08-12T19:48:51.531Z
goal: "JUDGMENT — the comment system everywhere: mark anything on any surface, speak, and the comment lands as text anchored to the mark."
vision: "NEEDS THE OWNER. This is his vision and he said plainly he does not know how well it can be implemented or how much rework it costs.\n\nWAITS ON THE BOOK. Build the comment layer there first — v1 proved that surface, and it is the one that travels to other people. The live surfaces come after they settle.\n\nTHE VISION, in his words: he marks something on any surface, the microphone opens, he says what he does not like about it, and it is stored AS TEXT linked to the place he marked. His words for it: the absolute perfect thing.\n\nWHY IT FITS HIM PARTICULARLY. He dictates by voice already, and the voice guidance carries a whole section on reading him — dictation misfires on short words, an odd word is probably a slip, map it to the nearest sensible term. A mark-then-speak loop removes the worst of that: THE MARK CARRIES THE CONTEXT, so the transcription only has to carry the OPINION. A misheard word next to an exact anchor is recoverable; a misheard word floating free is not.\n\nIT COMPOSES FROM PARTS ALREADY RULED. v1's comment layer gives the anchoring model. The notes pipeline gives the rest: a spoken comment is RAW CAPTURE — private, local, never committed — and triage rewrites the keepers into the options pool. v1 already stripped author names at exactly that crossing.\n\nWHERE IT IS ACTUALLY HARD, and these are the design questions.\n\nEVERYWHERE MEANS SEVERAL ANCHORING MODELS, NOT ONE. Prose anchors on a quote selector. A state machine drawing anchors on a node or edge id. The trace graph anchors on a node. A table anchors on a cell. An evidence form anchors on a field. So the comment SCHEMA is shared and the ANCHOR is per-surface. Getting that wrong gives either a comment that cannot find its home or five incompatible comment systems.\n\nSPEECH TO TEXT IS NOT FREE. It needs a VS Code extension API, an OS service, or a hosted one. A HOSTED ONE SENDS THE OWNER'S SPOKEN WORDS OFF THE MACHINE, which meets the same privacy line that keeps raw notes out of version control. Answer that before building.\n\nTHE SURFACES ARE IN FLUX. The HTML mirror is ruled out, the panel is where things move, and the machine format changes to PlantUML with a new renderer. Building anchors against surfaces about to be replaced is wasted work — which is why the book goes first.\n\nFULL CONTEXT: project/spec/version-planning.md, section J8 and the comment-system vision.\n\nFROM THE POOL, 2026-08-13. One more, and the owner has NOT chartered it - the design discussion is owed first.\n\nPICTURE-IN-PICTURE TO-DO STATE MACHINES (owner idea, note-ed999c4b64b1), which would replace the update panel. Each state carries its own small to-do state machine, minted when work starts there. The view always shows the CURRENT state's to-do machine, and today's updates, checklists and checkmarks land in these machines instead of the panel. LEAVING A STATE WHILE ITS TO-DO MACHINE STANDS OPEN DEMANDS A REASON, as an escape-like act. The machine STAYS with its state, and re-entering resumes it. A to-do can be added to a DIFFERENT state, which the next entry there owes - the defer op, made visible. Maybe a bubble per state showing its open to-dos. IT RESHAPES NARRATION AND THE MIRROR TOGETHER, so it is not a small build, and it sits here because this is the nearest chartered surface rather than because it belongs to the comment layer."
inputs:
  - "project/spec/version-planning.md"
  - "i20-judgment-emit-book-the-whole-product-as-"
  - "spec/decisions/adr-comment-anchoring.md at ref main"
depends_on:
  - i20-judgment-emit-book-the-whole-product-as-
  - i13-the-machine-format-state-machines-become
---

# i26-judgment-the-comment-system-everywhere-m

## Goal

JUDGMENT — the comment system everywhere: mark anything on any surface, speak, and the comment lands as text anchored to the mark.

## Rough vision

NEEDS THE OWNER. This is his vision and he said plainly he does not know how well it can be implemented or how much rework it costs.

WAITS ON THE BOOK. Build the comment layer there first — v1 proved that surface, and it is the one that travels to other people. The live surfaces come after they settle.

THE VISION, in his words: he marks something on any surface, the microphone opens, he says what he does not like about it, and it is stored AS TEXT linked to the place he marked. His words for it: the absolute perfect thing.

WHY IT FITS HIM PARTICULARLY. He dictates by voice already, and the voice guidance carries a whole section on reading him — dictation misfires on short words, an odd word is probably a slip, map it to the nearest sensible term. A mark-then-speak loop removes the worst of that: THE MARK CARRIES THE CONTEXT, so the transcription only has to carry the OPINION. A misheard word next to an exact anchor is recoverable; a misheard word floating free is not.

IT COMPOSES FROM PARTS ALREADY RULED. v1's comment layer gives the anchoring model. The notes pipeline gives the rest: a spoken comment is RAW CAPTURE — private, local, never committed — and triage rewrites the keepers into the options pool. v1 already stripped author names at exactly that crossing.

WHERE IT IS ACTUALLY HARD, and these are the design questions.

EVERYWHERE MEANS SEVERAL ANCHORING MODELS, NOT ONE. Prose anchors on a quote selector. A state machine drawing anchors on a node or edge id. The trace graph anchors on a node. A table anchors on a cell. An evidence form anchors on a field. So the comment SCHEMA is shared and the ANCHOR is per-surface. Getting that wrong gives either a comment that cannot find its home or five incompatible comment systems.

SPEECH TO TEXT IS NOT FREE. It needs a VS Code extension API, an OS service, or a hosted one. A HOSTED ONE SENDS THE OWNER'S SPOKEN WORDS OFF THE MACHINE, which meets the same privacy line that keeps raw notes out of version control. Answer that before building.

THE SURFACES ARE IN FLUX. The HTML mirror is ruled out, the panel is where things move, and the machine format changes to PlantUML with a new renderer. Building anchors against surfaces about to be replaced is wasted work — which is why the book goes first.

FULL CONTEXT: project/spec/version-planning.md, section J8 and the comment-system vision.

FROM THE POOL, 2026-08-13. One more, and the owner has NOT chartered it - the design discussion is owed first.

PICTURE-IN-PICTURE TO-DO STATE MACHINES (owner idea, note-ed999c4b64b1), which would replace the update panel. Each state carries its own small to-do state machine, minted when work starts there. The view always shows the CURRENT state's to-do machine, and today's updates, checklists and checkmarks land in these machines instead of the panel. LEAVING A STATE WHILE ITS TO-DO MACHINE STANDS OPEN DEMANDS A REASON, as an escape-like act. The machine STAYS with its state, and re-entering resumes it. A to-do can be added to a DIFFERENT state, which the next entry there owes - the defer op, made visible. Maybe a bubble per state showing its open to-dos. IT RESHAPES NARRATION AND THE MIRROR TOGETHER, so it is not a small build, and it sits here because this is the nearest chartered surface rather than because it belongs to the comment layer.

## Inputs

- project/spec/version-planning.md
- i20-judgment-emit-book-the-whole-product-as-
- spec/decisions/adr-comment-anchoring.md at ref main
