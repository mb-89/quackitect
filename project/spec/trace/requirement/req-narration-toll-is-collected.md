---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: req-narration-toll-is-collected
type: "[[requirement]]"
statement: While the narration cadence is set, the engine shall demand an update within the notch's window, warning once and then refusing the next call without one.
kind: functional
verify_method: test
breaks_if_removed: The person's only view into a delegated walk depends on the agent volunteering, and silence reads as either working or dead.
breaks_how_badly: corrosive
refines:
  - uc-watch-the-walk-live
source_refs:
  - reverse-engineered from tests/narration.test.ts and tests/feed.test.ts
priority: should
weighs_against:
  - req-drawn-state-equals-a-row > — the person's only view into a delegated walk outranks the drawing's authoring parity
---

## Detail

- Both clocks run, minutes and calls, whichever falls due first; the cadence rides every pull so both hands see the setting.
- An update pays whatever the cadence, and the count starts over.
- Turned off, nothing is owed however long the silence runs.
- A failing update is named by its own refusal, never masked by the toll.
