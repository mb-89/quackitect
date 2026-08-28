---
form: log-risks
by: agent
signed_off: 2026-08-24T15:51:35.722Z
authors: agent
files: null
---

# Evidence form / log-risks

## current_situation

The vision is signed and inherited by pointer. Its goal system named four conflicts and ruled each one.

The register opens here. Six entries land: one issue that is already measured, four risks the delta exposes, and one assumption the whole design rests on.

Every entry is a node under spec/trace/raid/, not a row in this form. A row could never be pointed at, and an assumption recorded as a row could never be probed by a later record.

## raid_opened

- raid-iss-a-finished-run-keeps-reporting-itself-as-running
- raid-risk-the-heartbeat-ends-a-process-that-is-alive-but-quiet
- raid-risk-two-closers-reach-one-entry-and-disagree
- raid-risk-two-engines-run-one-folder-and-neither-says-so
- raid-risk-the-one-engine-guard-locks-out-a-restart-after-a-crash
- raid-asm-a-launched-process-can-be-asked-whether-it-still-exists
- raid-risk-widening-a-verb-s-legality-weakens-the-state-gate

## follow_up

The assumption is the one entry that owes work rather than watching. raid-asm-a-launched-process-can-be-asked-whether-it-still-exists carries its probe already, and M3's probe state is where it is answered.

Its POSIX half is the part to watch. deliverable/engine/run.ts line 59 detaches on POSIX and not on Windows, and guidance/method/cloud-runner.md records that every machine that has run this engine was Windows.

Nothing else is parked. The next state frames the delta against the actual.

## anything_else

One risk here is a pair rather than a single entry, and the two are recorded as weighing against each other.

Two engines on one folder is the fault. A guard that stops the second one is the fix, and a guard that strong can also stop a legitimate restart after a crash.

Binding the port rather than writing a lock file is what keeps the second cost at zero, because the operating system already holds the answer and nothing written down can go stale.
