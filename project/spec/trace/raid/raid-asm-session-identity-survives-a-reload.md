---
minted_in: i3-the-walk-s-feedback-loop-the-reading-cre
id: raid-asm-session-identity-survives-a-reload
type: "[[raid]]"
kind: assumption
statement: A session keeps the same identity across an engine reload, so state written under it before the reload is findable after it.
owner: the driving agent
trigger: the reading credit's storage is built, or se_reload changes what it restarts
status: probed
impact: The credit is written under one identity and looked up under another. Every reload then re-owes the whole reading exactly as today, and the fix ships looking correct while changing nothing.
breaks_how_badly: crippling
how_likely: plausible
probe: "FALLS. Two reloads ran mid-walk on 2026-08-15 and the decision graph's id space restarted both times. decisions.jsonl carries d241 at 17:19 and then d1 again at 18:54 and at 18:59 - one d1 per reload, each with a different brief. The FILE survived every reload; the IDENTITY did not, so one id now means three things."
probed: "2026-08-15"
source_refs:
  - req-reading-credit-survives-a-reload
  - "note-6fc953ffcdc8, which names the SE_SESSION token as the intended key"
---

## The probe that settled it, 2026-08-15

IT DID NOT NEED A SPECIAL RUN. Two reloads happened for other reasons while a
record was bound, and the evidence landed in the record's own decision log.

WHAT SURVIVED: every line of `decisions.jsonl`. Nothing was lost from disk.

WHAT DID NOT: the identifier. Node ids ran to `d241` before the first reload
and restarted at `d1` after it, then restarted again after the second.

SO THE SAME ID NAMES THREE DIFFERENT THINGS in one file, and nothing in the
record distinguishes them. A lookup by id cannot find what was written before
a reload, because it finds something else with the same name.

THE ASSUMPTION IS EXACTLY BACKWARDS. It supposed the identity would hold and
the question was whether the state was findable. The state is all there and
unfindable.

## What this costs the thing it was minted for

THE READING CREDIT KEYED TO A SESSION WOULD BE WRITTEN AND THEN COLLIDE. The
impact line predicted the fix would ship looking correct while changing
nothing, and that is now measured rather than feared.

WHATEVER KEY THE CREDIT USES, it cannot be a session-scoped counter.

## What is being relied on

The credit must outlive the engine process. So it is written somewhere the
process does not own, and found again afterwards by some identity.

The intended identity is the session token. Nothing has established that the
token is the same value on both sides of a reload.

## Why it is an assumption and not a decision

The token is minted by the harness, not by us. `se_reload` swaps the engine
under a session the host is holding open.

We do not control what the host does with its own identifier when the thing
behind it restarts.

## Probe

Start a session, read one document, note the token. Call `se_reload`. Read the
token again and compare.

Then read the same document's credit and see whether it is found.

Two outcomes, both useful.

- Same token and credit found: the assumption holds and the register records
  the check.
- Different token: the credit needs an identity that is ours, and the design
  changes before anything is built rather than after.

The probe costs one session and answers before the storage shape is chosen.

## What makes it survivable

It is caught cheaply and early. The cost of being wrong is a redesign of one
key, not of the mechanism.
