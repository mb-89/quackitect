---
template: item-experiment
artifact: node
id_prefix: exp-
folder: spec/trace/experiment
applies_rigor:
  - systematic
applies_type:
  - default
checks:
  - field: statement
    ban_words:
      - appropriate
      - adequate
      - sufficient
      - robust
      - reasonable
      - probably
      - maybe
    hint: a weasel word cannot be settled by a run
  - field: statement
    ban_markers:
      - TBD
      - TBC
      - TBR
      - ???
  - field: form
    one_of:
      - calculation
      - simulation
      - script
      - tracer
      - skeleton
    hint: the cheapest form that yields the evidence — the ladder is in meth-spike-tracer
  - field: verdict
    one_of:
      - pending
      - holds
      - falls
      - unsettled
    hint: unsettled is the timebox running out — a verdict, never a failure
  - field: timebox
    ban_markers:
      - TBD
      - TBC
      - TBR
      - ???
    hint: the box is the budget, written before the run
  - field: faked
    ban_markers:
      - TBD
      - TBC
      - TBR
      - ???
    hint: an unnamed stub is where a false positive lives — write none only when the run touched the real thing
  - field: fallback
    ban_markers:
      - TBD
      - TBC
      - TBR
      - ???
    hint: pre-agreed, before the run — a fallback invented after a red is a rationalisation
---

# experiment — one spike's record, question to verdict

Lives in `spec/trace/experiment/`. A STANDING ARTIFACT: the run is
throwaway, the record is not. What survives a spike is this node.

ONE QUESTION PER EXPERIMENT, written before the run starts. The statement
IS the question, phrased so a run can answer it. Everything else on the
node says how the answer was earned and what it moved.

THE THROWAWAY LAW: the spike's code is not a head start on the build.
Nothing enters the product from here except as fresh build code, through
the gate. The finding is the product.

The run method is [[meth-spike-tracer]]. The fold-back writes the last
two keys; everything above them is written before and during the run.

## The template

```skeleton
---
# The engine writes id and the type link. id is exp- plus a slug.
#
# THE QUESTION, one sentence, phrased so the run can answer yes or no.
statement: TODO — can <the thing> do <the demand>, measured as <the measure>?
#
# The register entries this run settles — what made it worth running.
probes:
  - TODO — the raid- ref this settles
#
# The budget, written before the run. Running out is a verdict.
timebox: TODO — e.g. half a day
#
# The cheapest form that yields the evidence.
form: TODO — calculation | simulation | script | tracer | skeleton
#
# What the run stubbed or skipped. An unnamed stub is where a false
# positive lives. Write none only when the run touched the real thing.
faked: TODO — what was stubbed, or none
#
# Pre-agreed, BEFORE the run. What the design does if the answer is no.
fallback: TODO — the move if this falls
#
# Written when the run ends.
verdict: pending
measured: <!-- the result in numbers, with its date -->
#
# THE FOLD-BACK'S TWO KEYS, written at fold-back through its form.
folds_to: <!-- what this changes upstream — a requirement, a register entry, a structure edit. Or nothing moved. -->
promote: <!-- what enters the build through the gate, or none -->
source_refs:
  - rank-unknowns, the seeded pick
---

## Setup

<!-- how it ran — the real channel, the machine, the data -->

## Result

<!-- what came back, dated, numbers first -->
```
