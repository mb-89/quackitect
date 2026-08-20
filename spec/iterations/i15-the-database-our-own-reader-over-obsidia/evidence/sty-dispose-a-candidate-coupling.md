---
form: sty-dispose-a-candidate-coupling
by: agent
signed_off: 2026-08-19T20:26:02.343Z
authors: agent
files:
---

# Evidence form / sty-dispose-a-candidate-coupling

## current_situation

se_couplings was wired this iteration but never demonstrated end to end against a real change description. gate-implementation blessed the build on unit tests alone.

## built

The demonstration ran against the real engine (deliverable/engine/disposition.ts, rankCandidateCouplings and recordCouplingDisposition), via reports/demo-dispose-a-candidate-coupling.ts, describing a real change made this session (the parseBase fix). 706 candidates scored above threshold; every one got exactly one pending disposition row, none silently dropped. The top 15 by score were read and disposed for real with reasoning: 3 accepted as real couplings, 12 rejected. A below-threshold check with a deliberately unrelated description returned 314 candidates rather than zero, a real finding about lexical overlap on ordinary words in a self-referential corpus, matching the embeddings-later gap record.md already names. Full account: reports/rpt-dispose-a-candidate-coupling.md.

## follow_up

The story pass line asks that no candidate ship pending. This run does not meet that at the full 706-candidate scale - only the top 15 were individually disposed. That gap is named in the report and the story deck rather than absorbed, and is real work for whoever next runs this verb against a real change at this scale.

## anything_else


