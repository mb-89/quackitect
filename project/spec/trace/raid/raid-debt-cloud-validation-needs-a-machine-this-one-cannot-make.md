---
minted_in: i28-the-cloud-runs-from-its-seed-alone-a-fre
id: raid-debt-cloud-validation-needs-a-machine-this-one-cannot-make
type: "[[raid]]"
kind: debt
statement: This iteration ships its bootstrap without validating it on a genuinely fresh machine, because the machine walking it cannot produce one.
owner: the owner
trigger: the first cloud run after this iteration ships
status: accepted
impact: The acceptance criterion is that a fresh machine, a seed id and one command produce a walking agent. Everything else can be verified here; the freshness cannot. So the criterion is proven in parts and not end to end, and a step that only fails on a clean host stays undetected until somebody uses one.
breaks_how_badly: corrosive
how_likely: expected
source_refs:
  - i28-the-cloud-runs-from-its-seed-alone-a-fre
---

## Repayment

THE OWNER RUNS THE BOOTSTRAP ON A CLOUD MACHINE, from nothing but a clone, a
seed id and the one command. The debt is repaid when that run produces a
walking agent with no step typed by hand and no document read as prose.

WHAT COUNTS AS REPAID, so it is not argued about later:

- The entrypoint runs to completion, or exits non-zero with one sentence
  naming what failed.
- The agent reaches its first pull without a person editing anything.
- Nothing in the run required reading a handover.

WHAT DOES NOT COUNT. A run on this machine, a run on a machine that already
has the toolchain, or a run where somebody fixed a step by hand and carried on.
Each of those tests something, and none of them tests freshness.

## Why it is taken rather than avoided

The owner ruled on 2026-08-15 that this becomes a debt and that nothing in the
walk stops for it. The alternative was holding the whole iteration behind a
machine that does not exist yet, which trades a real delay for a check that can
be run later at no loss.

TRIGGER AND REPAYMENT ARE DIFFERENT SENTENCES. The trigger is the first cloud
run. The repayment is that the run works from the seed alone.
