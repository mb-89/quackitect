---
template: item-verification-record
artifact: node
applies_rigor: [systematic]
applies_type: [manufactured_good, cyber_physical]
---
# verification-record — one measured run, wrapped

Lives beside its test. The physical types' analogue of the run log: the six-part
record (lab-documentation digest). Append-only in spirit — a correction is a new
record superseding, never an edit. Id prefix `rec-`.

## Fields
- `type` (record): fixed.
- `record_of` (a test- id): the test this run executed.
- `equipment` (list of instrument names WITH serials): what measured.
- `conditions` (phrase): ambient conditions during the run.
- `result` (value ± uncertainty WITH unit): the result contract — significant
  digits honest, confidence level named.
- `verdict` (pass | fail): against the test's acceptance rule, mechanical.
- `statement` (one sentence): run summary.

## Body
Setup with sketch (text-based figure), measured-value tables, disturbances and
deviations. The report layer discusses errors MANDATORILY; a result without its
uncertainty is not a result.

```
---
id: rec-{{slug}}
type: record
record_of: test-{{slug}}
equipment: [{{instrument-serial}}]
conditions: {{ambient}}
result: {{value ± uncertainty unit}}
verdict: pass
statement: {{run-summary}}
class: review
killer: false
---
## Setup
{{sketch}}
## Values
{{tables}}
## Disturbances
{{deviations}}
```
