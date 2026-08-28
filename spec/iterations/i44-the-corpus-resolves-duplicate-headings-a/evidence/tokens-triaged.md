---
form: tokens-triaged
by: agent
signed_off: 2026-08-28T11:37:26.761Z
authors: agent
files:
---

# Evidence form / tokens-triaged

## current_situation

Eleven work tokens stand with no corpus node referencing them. The requirement expected fourteen when the overhaul counted them; eleven is what the pool holds today.

All eleven land in the same pile: still wanted, waiting on a ready-when that has not fired. None is already done, and none is superseded.

That result is the interesting one, because it says the check reports the pool's normal state rather than a defect.

## built

### The three piles, and what fell into each

| pile | count |
| --- | --- |
| STANDING AND WAITING — the work is still wanted, its ready-when has not fired | 11 |
| ALREADY DONE — the work landed since the token was minted | 0 |
| SUPERSEDED — a later ruling or redesign overtook it | 0 |

### How each was judged

EVERY TOKEN CARRIES ITS OWN TEST. The `ready_when` names the change that would wake it, so the judgment is whether that change has landed.

- reload and live-iteration recovery — not changed
- node-table forms and their documentation — not changed
- gate review fields and gate guidance — not changed
- durable test-job scheduling and reporting — not changed
- the state-machine surface and the MCP session lifecycle — not changed
- mirror controls and session configuration persistence — not changed
- iteration build-step authoring and submachine seeding — not changed
- iteration admission and concurrent-worker coordination — not changed
- the Copilot stop-hook integration — not changed
- test-suite hygiene enforcement and its developer guidance — not changed
- iteration design-input guidance and use-case derivation — not changed

### Two were checked against the code, not only against the diff

These two looked most likely to have been served since minting.

- EXPOSE WHETHER A TEST JOB IS QUEUED. A search of the engine for queue wording finds five hits, none of them in the test-job path. The job answer today carries progress, a projection and its basis, and says nothing about a place in line. The token stands.
- PUBLISH THE HOME FOR TEST-SUITE HYGIENE CHECKS. The same search finds no hygiene home in the engine. i44 met one such check today, the direct-read ceiling in `deliverable/tests/files.test.ts`, and its rules live in comments beside the number rather than anywhere a reader would look. The token stands.

### One token was weighed against a retirement and survives it

MAKE ITERATION ACTIVATION PUBLISH AN OWNERSHIP MARKER reads like the claim ledger, which `raid-dec-the-machine-locking-specification-is-retired-whole` struck out entirely.

IT IS NOT SUPERSEDED. That decision's own trigger says the specification is written fresh if machine-to-machine work is taken up again. A token asking for a fresh, lighter marker is what the trigger describes, not what it retired.

## follow_up

### For arm-the-rest

WIRE THE TOKEN CHECK AS A REPORT AND NEVER AS A RED. `req-a-work-token-nothing-references-is-reported` says so in its own words, and this triage is the measurement behind it: eleven of eleven unreferenced tokens are healthy.

A BACKLOG TOKEN IS UNREFERENCED BY CONSTRUCTION. It is minted into the pool precisely because nothing points at it yet. Arming this class as a failure would make every future mint turn the sweep red on the day it lands.

### For the retro

THE COUNT IS THE SIGNAL, NOT THE LIST. Eleven tokens waiting is worth a glance at whether the pool is growing faster than it drains. That is the retro's judgment and not this chunk's.

### Not done here

No token was retired, and none should have been.

## anything_else

