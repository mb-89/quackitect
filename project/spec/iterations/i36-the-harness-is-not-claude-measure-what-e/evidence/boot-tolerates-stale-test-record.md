---
form: boot-tolerates-stale-test-record
by: agent
signed_off: 2026-08-19T16:20:04.715Z
authors: agent
files:
---

# Evidence form / boot-tolerates-stale-test-record

## current_situation

Item 12 of the record inspection read the LATEST se_test_verdict in the call log and required it to carry both a question and a scope.

Records written before 2026-08-17 carry neither, because the fix that writes them did not exist yet. The check judged such a record anyway and pushed a finding, which made boot red.

THE ONLY WAY OUT WAS BY HAND. An agent had to run se_test purely to mint a fresh record in the newer shape. That is the manual repair the requirement forbids, and it depended on knowing a coupling nothing announces.

The register entry is raid-boot-test-metadata-coupling, whose own trigger is every boot preflight.

## built

project/deliverable/engine/bin/record-inspect.ts, in testRunsCarryTheirQuestion.

THE CHANGE. A verdict record carrying NEITHER question nor scope is the pre-2026-08-17 shape. It is now counted as stale and skipped, so `latest` holds the newest record that could actually carry the metadata.

WHEN EVERY RECORD IS PRE-FIX, item 12 reports a caveat naming how many it read, and returns without a finding. Boot reaches the desk.

THE CHECK IS NOT SILENCED. A record carrying one key and not the other is a modern record with a real hole, and it is still a finding. That is the case that would have been lost by simply skipping anything incomplete.

TESTS. project/deliverable/tests/record-inspect.test.ts, three cases, all green:

- a log of only pre-fix records leaves boot green, and the output says why
- a pre-fix record arriving after a modern one does not unseat it
- a modern record missing its question is still red

Run on 2026-08-19: 3 passed, 0 failed.

THE SPEC MOVED WITH IT. tsp-boot-needs-no-manual-test-metadata-repair first named tests/boot.test.ts. It now names tests/record-inspect.test.ts, because the claim is about the inspector's judgment and a boot-level case would stand up a whole boot to observe one branch.

## follow_up

THE STALE TEST IS THE SHAPE, NOT A VERSION STAMP. A record is judged pre-fix because it carries neither key. Nothing in the record says which engine wrote it.

That reading is safe in one direction and worth knowing in the other. A modern record always writes both keys together, so "neither" cannot be a modern record. If a future change ever writes one key without the other by design, this check would read it as modern and red, which is the correct outcome anyway.

A VERSION ON THE RECORD WOULD BE BETTER than inferring from absence, and it is not this chunk's to add.

## anything_else

