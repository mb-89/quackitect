---
minted_in: i35-the-cloud-run-s-findings-land-the-fix-fi
id: flow-repository-refs
type: "[[flow]]"
statement: the branches the corpus cites, as local revisions
kind: material
crosses: out
source_refs:
  - req-every-ref-the-corpus-cites-resolves-on-arrival
---

## Why it crosses out

THE REFS ARE HANDED TO GIT AND GIT HOLDS THEM. Resolving the cited refs makes
the local object store carry the branches the corpus names. That store is not a
thing this function structure models, so nothing here consumes the flow and
nothing should.

THE REQUIREMENT IS ABOUT PRESENCE RATHER THAN USE. It asks that every ref the
corpus cites RESOLVES on arrival. What happens next is an ordinary read at a
ref, served by the lane against whatever git holds.

AND THAT IS A JUDGMENT ABOUT WHERE THE EDGE RUNS, not a mechanical fact. The
alternative reading is that a consuming function is missing — something that
reads at a ref, modelled explicitly. That reading was rejected because the lane
serves a ref read through the same verb it serves any read, so modelling it
separately would split one capability across two functions to satisfy a
counter.

MARKED 2026-08-18, when a re-walk of i16 ran the flow-closure check from the
start and found this flow with one end. It was minted in i35 without the key.
