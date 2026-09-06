---
kind: [[work-token]]
process: [[trivial]]
guidance: [[work-token]]
title: a look steals work
status: closed
disposition: done
---

## detail

TakeBackWhatWasLookedAt in src/engine/investigate.go reclaims a held token unconditionally, though its doc comment says it reclaims only if the holder is still not pulling. Reclaim in arrival.go asks StillPulling and this other door into the same reclaim does not. Call StillPulling with the same config the reclaim in arrival.go uses, and refuse to move a token whose holder is alive. Check that the hold is still the one that was looked at, and do not reclaim from whoever took it since. Give the investigate notice two different gestures for leave it and take it, because coming back to se pull today means both. Seen twice on 2026-09-01: work-a on wk-24be1c06ae held by one reviewer, and work-b on wk-02e17b9eb4 taken by another.

## done when

- Test: still-pulling holder, reclaim refuses, red then green.
- Test: newer holder, reclaim refuses.
- Taker reads both paths: same StillPulling config as arrival.go. The notice offers leave and take gestures.

