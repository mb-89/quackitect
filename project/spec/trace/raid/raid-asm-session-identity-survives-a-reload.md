---
minted_in: i3
id: raid-asm-session-identity-survives-a-reload
type: "[[raid]]"
kind: assumption
statement: A session keeps the same identity across an engine reload, so state written under it before the reload is findable after it.
owner: the driving agent
trigger: the reading credit's storage is built, or se_reload changes what it restarts
status: open
impact: The credit is written under one identity and looked up under another. Every reload then re-owes the whole reading exactly as today, and the fix ships looking correct while changing nothing.
breaks_how_badly: crippling
how_likely: plausible
probe: "unprobed, deliberately. The check needs an se_reload, and reloading mid-walk would disturb a bound record to answer a question that is not yet blocking. It runs before the credit's storage shape is chosen, inside this iteration."
probed: "2026-08-13"
source_refs:
  - req-reading-credit-survives-a-reload
  - "note-6fc953ffcdc8, which names the SE_SESSION token as the intended key"
---

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
