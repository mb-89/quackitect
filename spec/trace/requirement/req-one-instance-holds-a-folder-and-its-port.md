---
minted_in: i62-background-work-reports-its-own-end-the-
id: req-one-instance-holds-a-folder-and-its-port
type: "[[requirement]]"
statement: When the product is started against a folder whose network port is already taken, it shall report which folder and port are held and exit non-zero, and it shall decide this from the port alone.
kind: functional
verify_method: test
measure: "instances serving one folder at a time: at most one. Starts refused after the previous instance died: zero."
breaks_if_removed: "Two instances write one call log and one machine-state folder, so neither log is the whole trail and a reader of either cannot tell that it is partial. It also breaks the reasoning that lets an instance settle a previous one's entries."
breaks_how_badly: corrosive
priority: should
refines:
  - uc-hold-a-folder-against-a-second-engine
source_refs:
  - raid-risk-two-engines-run-one-folder-and-neither-says-so
  - raid-risk-the-one-engine-guard-locks-out-a-restart-after-a-crash
  - vp-autonomy-range
---

## Detail

THE PORT IS THE ONLY TRUTH, and nothing is written to disk to record the hold.

| signal | why it is or is not used |
| --- | --- |
| the port bind | used — a live listener is a fact the operating system holds |
| a lock file | not used — it outlives the instance that wrote it |
| a process listing | not used — it cannot say which folder a process serves |

WHY A LOCK FILE IS REFUSED HERE. A crash leaves it behind, a later start reads
it, and a recoverable crash becomes a folder nobody can work in. On an
unattended machine there is no person to clear it.

WHAT THE REPORT SAYS. One line naming the folder and the port. No stack trace,
because the condition is expected rather than exceptional.

WHY THIS ROW IS LOAD-BEARING FOR ANOTHER. Settling a previous instance's
entries is only safe because one instance holds the folder. That reasoning is
already relied on, and nothing checks it today. This row turns the assumption
into a check.

WHY IT IS `should` AND NOT `must`. The other rows in this set fail visibly
without it, and it does not fail visibly without them. It makes an existing
assumption true rather than adding a capability.

NO BEHAVIOUR MODEL HERE. The table states every branch.
