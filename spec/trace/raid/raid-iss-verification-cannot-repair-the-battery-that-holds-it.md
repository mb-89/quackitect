---
minted_in: i62-background-work-reports-its-own-end-the-
id: raid-iss-verification-cannot-repair-the-battery-that-holds-it
type: "[[raid]]"
kind: issue
statement: Verification's exit is the full battery and its tools are read-only, so a red battery holds the walk in a state that cannot fix what the battery found.
owner: the maintainer
trigger: every record that reaches verification with a red battery, and any change to that state's tools or exit script
status: open
looked: 2026-08-24
impact: "The walk oscillates between verification and fix-findings, and each crossing re-runs the whole battery. Measured on i62: verification took 97 calls and fix-findings 58, for a build that took 56."
breaks_how_badly: corrosive
how_likely: expected
source_refs:
  - i62-background-work-reports-its-own-end-the-
weighs_with: none
weighs_against: none
place: i52-the-route-can-go-back-a-walk-can-reach-a
---

## The shape

TWO PROPERTIES OF ONE STATE DO NOT COMPOSE.

- ITS EXIT SCRIPT IS THE FULL BATTERY, so a red battery leaves the exit
  condition unmet and the walk stays put.
- ITS TOOLS ARE READ-ONLY, so nothing the agent can call there changes the
  code the battery is red about.
- THE STATE THAT REPAIRS IS BEHIND THAT SAME EXIT. `fix-findings` is reached by
  a fallback, and every crossing pays another full battery.

## Why it is an issue and not a risk

IT HAPPENS EVERY TIME A BATTERY GOES RED, which is the ordinary case for a
record that builds anything.

MEASURED TWICE. i38 named it first and recorded the proposal in its own
emit-back list, where nothing routed it. i62 then paid it again: the walk
crossed between the two states repeatedly, and the two states together cost
155 calls against a build of 56.

AN EMIT-BACK LIST IN A SHIPPED RECORD IS A DRAWER, NOT A ROUTER. That is the
second half of this entry: the finding was written down twelve days ago, in
git, correctly, and no mechanism carried it anywhere.

## What the fix looks like

THE ENGINE ALREADY HAS THE MECHANISM. A state may declare `repair_tools`,
granted only while its own exit stands red, and `prepare_desk` already uses it —
its guidance says in as many words that while a check stands red the repair
tools are legal there.

VERIFICATION DECLARES NONE. Its row carries `exit_script` and a read-only
`legal_tools` and no `repair_tools` key.

SO THE CHANGE IS ONE ROW, not a new capability.

## What would make this the wrong call

A DELIBERATE READING THAT VERIFICATION MUST NOT WRITE, so that a fresh pair of
eyes judges the red before anyone touches it. If that is the intent it is not
written down anywhere, and the cost of the round trip should be recorded against
it rather than paid silently.
