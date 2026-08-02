# The prompt layer — notes on the draft

## The answer to "wouldn't it be too big"

PROTOCOL.md as drafted: ~1,240 tokens. Its sources (contract.md +
walking.md) run ~3,800 today and travel by tool call, re-earned after
every compaction. Typical harness system prompts run 10k+; attention, not
fit, is the budget — and 1.2k is deep inside both. Verdict: not too big.
Not even close.

## What went in / what stayed out

IN (always-true, every state, every session): the 10 contract rules, the
se_pull protocol, narration/update rules, the git stance, the test stance,
the serial-read retreat (marked transient, with its lift condition).

OUT, deliberately:
- Voice — rides the output style (Claude) / inside the generated
  instructions text (Copilot).
- State guidance, forms, evidence — the packet layer. Situational.
- software.md, ux.md, method cards — the read layer. Sometimes-true.
- Boot's HANDOVER.md read — stays a read: it CHANGES per session, and the
  prompt layer is for constants only.

## Adoption steps (the walking agent's lane)

1. Owner reviews the draft register — every rule survived the compression,
   but he rules on the wording.
2. The terse register becomes the SOURCE register for these files
   (author-terse principle — no recurring LLM compaction step, ever).
   contract.md/walking.md either become this text or are superseded by it;
   the size/STE lint rows hold the line going forward.
3. The start-the-agent step (extension + RUNME) assembles and places:
   AGENTS.md / .github/instructions (Copilot — the walking agent already
   chose the door), CLAUDE.md or an @import pointer (Claude Code), plus the
   voice output style. Stamp generated-from + source hash; preflight
   verifies placed == projection of source.
4. Boot then SHRINKS: the reading loop drops what the prompt layer now
   carries; what remains is the per-session read (HANDOVER.md) and the
   confirm tick. Test boots get cheap for free (the 425s boot.test).
5. Retro gains the standing question: DID ANY RULE EARN PROMOTION (kept
   being violated mid-walk → move up) OR DEMOTION (never needed → move
   down)? On every promotion, also ask: can it be written terser? Placement
   and compression are both retro judgments; neither runs in the boot path.

## Caveats

- The read-proof disappears for promoted docs — by design: prompt-layer
  text is present every turn, a stronger guarantee than a hash of a read
  that compaction erases. Read-proofs remain for the pull layer.
- Cache economics claimed here are Claude-harness behavior; verify on
  Copilot (owner will ask it directly).
- PROTOCOL.md documents se_pull as walking.md describes it TODAY
  (2026-08-02 ~14:00Z); the lane is moving — re-check the five instruction
  names against the shipped engine before adoption.
