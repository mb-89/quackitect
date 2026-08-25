---
minted_in: i62-background-work-reports-its-own-end-the-
id: fn-run-a-governed-walk.keep-the-account-true
type: "[[function]]"
cluster: the-record-life
statement: notice that work the session started has ended, however it ended, and mark it finished exactly once
satisfies:
  - req-the-engine-holds-what-it-launched-and-asks-whether-it-exists
  - req-a-run-closes-its-own-entry-when-its-process-exits
  - req-settling-an-entry-is-idempotent-and-the-first-outcome-stands
inputs:
  - flow-work-under-way
  - flow-existence-answer
outputs:
  - flow-settled-entry
controls:
  - whether the work can be asked about itself at all on this platform
  - whether the work is able to report its own ending before it goes
source_refs:
  - uc-close-the-record-of-work-that-has-ended
  - raid-iss-a-finished-run-keeps-reporting-itself-as-running
  - vp-autonomy-range
---

## Rationale

ONE FUNCTION AND NOT THREE, because the three demands fail together. Noticing
an ending, learning it from the work itself, and writing it once are one job
seen from three sides. A design that notices and writes twice has not done two
thirds of this; it has produced the fault it was built to remove.

WHY IT IS SEPARATE FROM ACCOUNTING FOR WORK OUT OF SIGHT. That function states
what is under way and how long it has left. This one decides when something
stops being under way. The account reads what this function writes, and a
design could keep either without the other.

WHAT KEEPS IT SOLUTION-NEUTRAL. It does not say the ending is noticed on a
timer, that a handle is held, or that anything is asked at all. A design where
each piece of work reports its own ending and nothing ever asks satisfies this,
and so does one where nothing reports and everything is asked.

"HOWEVER IT ENDED" IS THE LOAD-BEARING PHRASE. It covers an ordinary exit, a
crash, and a kill from outside, without naming which mechanism catches which.

THE CONTROLS ARE THE HONEST PART. Both are outside this function's gift. A
platform where the question cannot be asked, and work that dies before it can
speak, are the two conditions that decide which half of the design carries the
load.
