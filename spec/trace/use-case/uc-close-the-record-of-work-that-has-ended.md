---
minted_in: i62-background-work-reports-its-own-end-the-
id: uc-close-the-record-of-work-that-has-ended
type: "[[use-case]]"
statement: Keep the record of started work true by closing the entry of anything that has ended, whether or not it said so.
actor: stk-agent
trigger: a process the system launched ends, or an interval falls due on one it still holds
precondition: the system launched the work and holds a live handle to it
guarantee: no entry stays marked running once its process is gone, the closing outcome says which of the two closers settled it, and a second closer never reopens or re-counts a settled entry
refines:
  - sty-the-run-that-died-while-nobody-was-holding-it
priority: must
---

## Main scenario

1. The system launches a piece of work and records an entry for it, holding the live handle.
2. The process ends and the run writes its own closing record.
3. The system settles the entry with that outcome.
4. The system reports the entry as settled on the next answer that carries the account.
5. The walk leaves the step that owned it.

## Extensions

- 2a. The process ends without writing a closing record, because it crashed or was killed. The interval falls due, the system asks the handle whether the process still exists, finds it gone, and settles the entry itself.
- 2b. The process is alive and has nothing to say. The handle reports it exists, and the entry is left alone. Silence is not evidence of death.
- 2c. Both closers reach the entry at once. The second finds it already settled and does nothing. It does not reopen it, and it does not record a second outcome over the first.
- 3a. The two closers disagree about the outcome rather than the timing. The first outcome stands, and the disagreement is recorded rather than discarded.
- 4a. The entry belongs to a system instance that is no longer running. It is settled when the next instance starts, and the outcome says it was settled that way rather than by its own run.
- 4b. The handle cannot be asked at all on this platform. The system says so rather than treating silence as death, and falls back to the bound rather than to a guess.

## What is deliberately outside it

Restarting what was closed. Both comparable systems restart a workload they
kill; this one ends it and reports it, and the work is lost.

Entries that were already on disk before this behaviour existed. They are
cleared by the retention decision, not by this use case.
