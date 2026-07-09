---
template: item-criterion
artifact: node
applies_rigor: [lean, systematic]
applies_type: [default]
---
# criterion — one decision-scoring criterion (a trade-off axis measure)

Lives in the iteration beside its candidates. Candidates rate against crit- ids
in their `ratings:` map (0..1); the project chapter's per-axis Pugh tables
render the scores next to each candidate's derived verdict. A criterion nothing
ever rates against is dead weight. Id prefix `crit-`.

Success criteria are NOT criterion items: each need carries its own
`## Success criteria` pass lines (owner ruling 2026-07-08); the ch1 delta and
ch5 validation views render those from the needs.

## Fields
- `type` (criterion): fixed.
- `statement` (one sentence): what this axis weighs, checkable.
- `metric` (short name): what gets measured or compared.

## Body
How the scoring runs: the scale's anchors, and where the evidence lands.
Weights are fixed BEFORE the options are scored (anti-bias discipline).

```
---
id: crit-{{slug}}
type: criterion
metric: {{what-is-measured}}
statement: {{the-axis-claim}}
---
{{how-scored}}
```
