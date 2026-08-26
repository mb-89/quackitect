---
minted_in: i5-engine-hygiene-one-version-source-every-
id: raid-asm-a-fresh-clone-s-empty-inbox-means-no-local-state
type: "[[raid]]"
kind: issue
statement: An empty notes inbox means the retro is already done, and that reading holds on a fresh cloud clone as well as on a laptop.
owner: the owner
trigger: the first onboard-retro or desk retro that runs on a container created after the last one ended
status: open
impact: The onboard-retro skips on a signal that carries no information. Notes written on another machine are never seen, and the mining steps read one session instead of a period.
breaks_how_badly: corrosive
how_likely: expected
probe: FALSE ON A CLOUD CLONE, probed 2026-08-19 on this container. The inbox and the call log both live outside git — .se/notes.jsonl does not exist here at all, and .se/calls.jsonl opened at this session's first record, 10:40:44Z. So the inbox read zero because the container is new, not because a retro emptied it. The empty-inbox skip rule still produced the right ACT here, since there was genuinely nothing to drain on this clone, but it produced it for the wrong reason. On a laptop the assumption holds, because the same .se folder survives between sessions.
probed: 2026-08-19
source_refs:
  - i5-engine-hygiene-one-version-source-every-
  - raid-asm-a-cloud-clone-can-reach-the-remote-it-came-from
weighs_with: none
weighs_against: none
---

## What changed the kind

IT WAS WRITTEN AS AN ASSUMPTION AND PROBED FALSE IN THE SAME RECORD, at i5's
probe-assumptions on 2026-08-19. The id is kept, the kind moved, and this
section says what broke.

WHAT BROKE. The reading "an empty inbox means the retro is already done" does
not hold on a cloud clone. It held on a laptop, where the same `.se` folder
survives between sessions, and nobody had checked the other case.

WHAT NOW RESTS ON NOTHING. The empty-inbox skip rule reads a count, and a
count cannot tell a drained inbox from an absent one. On this container it
still produced the right ACT, because there was genuinely nothing to drain —
but for the wrong reason, which is the definition of a check that will
eventually be wrong.

WHAT DOES NOT FOLLOW. The skip rule itself is sound and is not withdrawn. What
is unproven is the signal it reads.

## Probe

READ THE TWO FILES THAT HOLD THE STATE, and read them on the machine in
question. Both are gitignored, so neither travels with a clone.

- `.se/notes.jsonl` is the inbox. Absent means no notes have ever been
  written on this machine.
- `.se/calls.jsonl` is the call log. Its first record is where any retro
  window can open at the earliest.

WHAT SEPARATES THE TWO READINGS. A drained inbox and an absent inbox look
identical to `se_survey`, which reports a count. The file's existence is what
tells them apart, and only a direct look answers it.

WHAT WOULD MAKE IT HOLD EVERYWHERE. Either the inbox becomes part of the
repository, or the survey says which of the two it is looking at. The second
is cheaper and is the one worth proposing first.

WHY IT IS RECORDED RATHER THAN FIXED HERE. The fix is a change to the survey
or to where the inbox lives, and neither is inside this iteration's goal. The
skip rule itself is sound; what is unproven is the signal it reads.
