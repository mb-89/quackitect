---
minted_in: i11-the-engine-fix-bundle-about-twenty-named
id: raid-dec-the-walk-never-reaches-a-state-it-cannot-leave
type: "[[raid]]"
kind: decision
statement: A state may not demand what it has no verb to supply, and a blessed gate must be passable — everything that can hold the route out of a gate is asked in the gate's own form.
owner: the owner
trigger: any escape from inside a record, or any gate that is blessed and still held
status: decided
impact: without these the walk reaches states with no legal move, and the only exit unbinds the record to fix a two-line problem. Three escapes in one walk of i11, each costing an unbind and a four-call re-entry.
breaks_how_badly: crippling
how_likely: certain
weighs_with: none
weighs_against: none
source_refs:
  - note-472d7ac75364
  - note-274b5cddb9ac
  - note-95fb9bf43a09
  - "owner ruling 2026-08-16: every time we leave the iteration, I consider this a failure"
  - "owner ruling 2026-08-16: if a gate is blessed, then you need to be able to continue"
---

## Two rulings, one shape

BOTH WERE RULED ON 2026-08-16, after i11's walk hit the same wall three times.
They share a cause: a demand written from the DEMANDER's side without checking
that the demanded state can answer it.

### One — leaving the iteration is a failure

THE OWNER'S WORDS: "every time we leave the iteration, I consider this a
failure. We need to analyze this and stop doing it."

`escape` IS DOCUMENTED AS THE HATCH for being mechanically stuck, and all three
uses that day were genuinely that. The ruling says the hatch FIRING AT ALL is
the defect. The fix is never "escape better".

THE THREE, in the order they were hit.

- verification owed a full battery and grants only the three readers. The
  battery had just been made legal ONLY there, so it could run nowhere.
- verification again, after its exit script came back red. The script guarded
  the FALLBACK too, so fix-findings — the drawn repair for a red battery — was
  unreachable exactly when it was needed.
- gate-validation was held by a story's empty evidence halves and grants no
  write verb. fill-story-evidence was struck at that size, so no state on the
  route could supply what the slide law demanded.

TWO OF THE THREE WERE BUILT THAT SAME DAY. The mechanism that trapped the walk
was the record's own.

### Two — a blessed gate must be passable

THE OWNER'S WORDS: "if a gate is blessed, then you need to be able to continue.
If there is anything needed from the engine, it needs to be asked in the gate
form and not after that."

A BLESS IS AN ADJUDICATION. Giving one and then being told the thing you
adjudicated does not pass means the bless was asked for against an incomplete
picture. The person answered a question the machine had not finished asking.

THE MECHANISM. A gate's form checks its own fields at submit. The ROUTE
separately asks whether the claim stands, and that question reaches further —
into the trace nodes the record touched. The two run at different moments
against different sets, so a form can be met while a claim is not.

## What was fixed already, and what stands

FIXED IN i11: an exit condition no longer guards a FALLBACK edge. A fallback is
the drawn path for the condition failing, so gating it made the repair
unreachable exactly when it was needed.

STANDING, and both are the harder halves.

- NO REFUSAL MAY NAME A STATE WHOSE LEGAL TOOLS CANNOT SATISFY IT. Nothing
  checks this today, and it is the half that bit twice.
- THE SUBMIT'S CHECK SET MUST COVER THE ROUTE'S. Whatever `claimBlockers` can
  say about a gate must be sayable at submit, so a blessed gate that cannot be
  left is impossible by construction rather than merely rare.

## Rejected options

- MAKE ESCAPE CHEAPER, by keeping the binding across it. It treats the symptom
  and leaves the walk still reaching states with no legal move.
- GRANT WRITE VERBS TO THE GATES. It would have unblocked all three cases and
  it destroys what a gate is: a state that judges rather than builds.

## The measure

ESCAPES PER RECORD. i11 ran three. The ruling implies zero, and it is countable
from the call log without anybody remembering to look.

## Where to look

`engine/session.ts`: `claimBlockers` and `stateBlockers` against the state-form
submit path, and the route's own refusal in `routeNow`. The fallback exemption
is in `assertConditions`.
