---
state: read_contract
state_kind: work
priority: 0.01
tags: boot
legal_tools: se_file_read, se_note
exit_read:
  - workspace/AGENTS.md
  - product/guidance/contract.md
  - product/guidance/voice.md
  - product/guidance/walking.md
exit_read_consume:
  - .se/HANDOVER.md
guidance: BOOT METHOD rides in from guidance/method/boot.md by tag - follow it. The pull answers read here; it hands over one document and names its last words, and you return those on the next pull to get the next one. THE HANDOVER IS CONSUMED HERE. A left-behind .se/HANDOVER.md joins the read list, and the engine DESTROYS it the moment you leave this state. So read it as a briefing that is about to vanish. READ IT WITH THE OPTIONAL FLAG when reading it directly - most sessions leave no handover, and a boot that refuses over a file nobody promised looks broken to the person watching. Anything in it that must outlive this session gets carried out BEFORE you pull onward. Carry it as a note (se_note is legal here for exactly this), as a parked to-do, or as an edit to guidance where the fact really belongs. Treat every claim in it as dated - check it before you build on it, and never carry a stale one forward.
---

# Read the contract

The boot sequence's first step: the listed documents are read at every
session start — never remembered from training or a previous session.
A left-behind session handover (.se/HANDOVER.md) joins the read demand
while it exists — the engine adds it here, where reading is legal.

MOST SESSIONS HAVE NO HANDOVER, so read it with `optional: true`. Absence
comes back as `exists: false` instead of a refusal. The engine already leaves
it out of the read demand when it is not there; the flag is what stops the
agent's own read from printing an error nobody needed to see.

AND IT DOES NOT SURVIVE THE ROOM. Leaving this state destroys it (owner
ruling 2026-07-31). A handover that persists gets believed a second time,
and a claim nobody re-measured is worse than no claim at all — that failure
cost two sessions real time before the rule changed.

So the handover is a BRIEFING, never a store. Carry anything durable out of
it while you are still here:

- A fact that belongs to the project goes into guidance or a record.
- A job somebody must still do becomes a note or a parked to-do.
- A caution worth keeping gets CHECKED first, then written where it belongs.

What you leave in it is gone.

- AGENTS.md (the one rule; outside the vault, the engine serves it)
- [[guidance/contract|contract]]
- [[guidance/voice|voice]]
