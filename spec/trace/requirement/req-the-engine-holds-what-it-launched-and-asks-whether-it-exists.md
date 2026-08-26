---
minted_in: i62-background-work-reports-its-own-end-the-
id: req-the-engine-holds-what-it-launched-and-asks-whether-it-exists
type: "[[requirement]]"
statement: While a piece of work it launched is recorded as running, the product shall ask that work's own handle whether the process still exists before it composes any answer that reports that work, and shall settle the entry when the answer is that it does not.
kind: functional
verify_method: test
measure: "answers reporting an entry as running whose process was already gone when the answer was composed: zero. Entries settled while their process still exists: zero."
breaks_if_removed: A process that dies without writing a closing record leaves an entry that says running for ever, and a leaving judgment reads as still deciding while such an entry stands, so the walk stops at the step that owns it.
breaks_how_badly: crippling
priority: must
refines:
  - uc-close-the-record-of-work-that-has-ended
source_refs:
  - raid-iss-a-finished-run-keeps-reporting-itself-as-running
  - raid-asm-a-launched-process-can-be-asked-whether-it-still-exists
  - raid-risk-the-heartbeat-ends-a-process-that-is-alive-but-quiet
  - vp-autonomy-range
---

## Detail

THE QUESTION IS EXISTENCE, NEVER RESPONSIVENESS, and that distinction is the
whole of this row.

| asked | of what | answer that settles the entry |
| --- | --- | --- |
| does this process still exist | the handle the product holds | no |
| did this process answer | nothing — this is not asked | not applicable |

A PROCESS THAT IS ALIVE AND SILENT IS LEFT ALONE. Silence is not evidence of
death, and a supervisor that treats it as such ends work that was running.

WHY THE WEAKER QUESTION IS THE RIGHT ONE. The two systems that ask the stronger
one can only ask it of workloads written to answer. sd_notify(3) documents
`WATCHDOG=1` as the ping the SERVICE issues. Kubernetes runs an exec, an HTTP
request or a gRPC call INSIDE the container. This product launches a shell, a
test runner and a state's exit script, and not one of them was written to
answer a supervisor.

## When the asking happens

THIS ROW USED TO SAY `at a fixed interval`, and it was written before the
design was made. The build has no timer, and the words are corrected to the
mechanism rather than the mechanism to the words.

THE ASKING RIDES THE READ. Composing the work account is the one moment the
product reliably holds both the handles and a reason to look, so the handles are
asked there.

THAT IS SOONER THAN AN INTERVAL, NOT LATER. An interval lets a dead entry ride
an answer until the next tick. Asking on the read means no answer can report a
process that was already gone when the answer was composed — which is what the
measure now says.

A TIMER WOULD ALSO ASK WHEN NOBODY IS LISTENING. On an idle machine it burns
work to update a table no one will read.

WHAT THE READ COSTS IS WHY THIS IS ALLOWED. Twenty handles asked in 78
microseconds, a hundred in 147, measured on this machine. A design that read a
file per piece of work would not have this licence.

A FLOOR STOPS A BURST re-asking the same handles a hundred times a second. It is
a minimum gap between two asks, never a promise of a maximum.

WITH NO READ AT ALL, NOTHING IS ASKED, and that is the honest limit of this
choice. It costs nothing, because an entry nobody reads misleads nobody.

WHAT THIS ROW DOES NOT COVER. A process that exists and is hung. That is caught
by the bound in `req-every-wait-declares-a-bound-and-expiry-acts`, and the two
rows answer different questions on purpose.

NO BEHAVIOUR MODEL HERE. The row is one condition and one response, and a
diagram would restate it in a second notation that could drift.
