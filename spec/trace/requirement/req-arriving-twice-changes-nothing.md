---
minted_in: i35-the-cloud-run-s-findings-land-the-fix-fi
id: req-arriving-twice-changes-nothing
type: "[[requirement]]"
statement: Where the arrival runs on a clone that has already arrived, the system shall reuse what stands and start no second lane.
kind: constraint
verify_method: demonstration
breaks_if_removed: A session that resumes, or a hook that fires twice, would start a competing lane on a port the first one holds — and two lanes over one call log is a corrupted record, not a slow one.
breaks_how_badly: crippling
refines:
  - uc-arrive-on-an-unattended-machine
source_refs:
  - uc-arrive-on-an-unattended-machine extension 1a
priority: must
---

## Detail

IDEMPOTENT MEANS EVERY STEP, not just the lane. The fetch skips branches that
resolve, the install skips dependencies that are present, and the lane step
probes the port before spawning anything.

IT IS ALSO THE OPT-OUT'S SAFETY NET. A developer machine whose editor owns the
lane must not have a second one started under it.
