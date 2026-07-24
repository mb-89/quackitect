---
id: it.machine-build-steps-c8-record
kind: machine_state
statement: "c8 record instruments: the ETA calibration query, se_run single-line logging, the projection-verify ordering test."
machine: it.machine-build-steps
state: c8_record
state_kind: work
filled_by: agent
---

## Guidance
Realization: engine-ts. calibration() over updates vs completions (tolerant of the dirty early formats); the se_run dispatch stops double-logging (the observer owns the line); the multi-iteration last_verify ordering test pays V4.

## Evidence form
- what_landed | files touched and the mechanism, one breath | required
- run_ref | the green run for this chunk's checks | required
