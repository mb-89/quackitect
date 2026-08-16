---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: opt-probabilistic-threshold-classification
type: "[[option]]"
statement: score every candidate coupling, then sort automatically into match, non-match, and a middle band that alone is handed to a person
cluster: cluster-the-disposition
question: how does a ranked candidate coupling get its disposition
found_by: prior-art
source: "Fellegi & Sunter, \"A Theory for Record Linkage,\" Journal of the American Statistical Association 64(328), 1969 (via en.wikipedia.org/wiki/Record_linkage) — the m/u weight model and its three-way match/non-match/possible-match classification"
---

## Mechanism

Two thresholds split the score axis into three bands. Above the top
threshold, a candidate is disposed as coupled without asking. Below the
bottom, it is disposed as not-coupled without asking. Only the middle band
is a candidate node at all, in the sense record-a-coupling-disposition needs
one — the two edges are pre-decided, so the function only ever records a
verdict a person actually gave.

Costs calibrating two thresholds instead of one, and a wrong calibration
silently auto-disposes real couplings. Buys a smaller review queue than
disposing on every candidate, which matters if rank-candidate-couplings
returns more than a person can look at.
