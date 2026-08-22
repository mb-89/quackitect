---
form: a-fresh-session-knows-a-deciding-step
by: agent
signed_off: 2026-08-21T11:37:12.361Z
authors: agent
files:
---

# Evidence form / a-fresh-session-knows-a-deciding-step

## current_situation

The last of nine build chunks, and the fatal one. [[raid-ar-walk-resumes-from-repo]] said a session that dies mid-judgment leaves a step whose verdict nobody can settle. Eight chunks made the verdict durable: `recordVerdict` writes `passed` or `not passed` onto the step's own form as soon as the judgment settles.

What was still open is the other half. What does a session do when it finds a step deciding and no live judgment behind it?

The answer turned out to be closed by construction, and the work here was to prove that rather than assert it.

## built

TWO NEW CASES in `deliverable/tests/handback.test.ts`, bringing that file to 9 cases, 9 pass, 0 fail, TSC EXIT 0.

- `a fresh session never finds a step deciding, so it re-runs the judgment` — builds a `Scripts` over a stub host with an empty run map, then asks `scriptStanding` for a step whose form carries no verdict. It answers `not passed`, never `deciding`, so the walk re-runs the judgment.
- `only a settled verdict is ever written to a form` — drives `recordVerdict` both ways and reads back what landed. Only `passed` and `not passed` ever reach disk.

THE ARGUMENT THE CASES PIN DOWN, in two steps.

- `scriptStanding` returns `deciding` from ONE place only: `this.scriptRuns`, an in-memory Map in `deliverable/engine/sessionscript.ts`. A fresh process starts it empty.
- `recordVerdict` in `deliverable/engine/session.ts` writes only a settled word, through `withJudgment` in `deliverable/engine/forms.ts`.

So the losing state has no way to exist across a process boundary. A fresh session reads `not passed` and the walk re-runs the judgment, which is the fallback [[raid-ar-walk-resumes-from-repo]] names.

The cases are the guard against that decaying. Anything that later persists the deciding word, or writes an unsettled verdict to a form, turns one of them red.

## follow_up

BUILD IS COMPLETE — nine of nine chunks land. The remaining work in this record is checking, not building.

- Run the full battery over the whole record, then commit and push.
- `trace-design` next, then `verification`, `fix-findings` and `gate-implementation`.
- Two notes stay parked for design work the owner raised by voice, both `must`: aiming at the front desk should trigger an escape, and walking back to a state you came from should always be allowed, with rewind and stepping back distinguished.
- `raid-asm-a-check-left-running-survives-on-every-platform` is measured on Linux only. Windows and macOS stay unmeasured, and the assumption says so.

## anything_else

THE RISK ENTRY NEEDED CORRECTING, and it is corrected. [[raid-ar-walk-resumes-from-repo]] opened saying the work was lost. The three spikes showed it is not: the operation record needed two fields, `state` and `total`, and nothing else. The entry now carries that correction in its own words rather than the original fear.
