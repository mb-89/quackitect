---
minted_in: i33-every-interface-a-person-or-an-agent-tou
id: tsp-work-past-its-bound-signals
type: "[[test-spec]]"
statement: Work still running past the bound named for it says so on the surface, and says it without taking the surface over.
method: "test"
verifies:
  - "req-work-past-its-bound-says-it-is-working"
files:
  - project/deliverable/tests/slow-work-signals.test.ts
---

## Scope

The panel, as the half of this demand a person sees. Both cases drive
`renderPanel` with a running operation among its values.

WHY THE PANEL. The requirement binds a person's surface and an agent's result
alike. The agent half arrives as a fact on the call result and is checked where
that result is built. This spec takes the person's half.

## Approach

TEST-FIRST, AND BOTH CASES ARE RED AT AUTHORING TIME. Nothing carries a running
operation onto the panel today, so there is no mechanism to assert against yet.
That is correct for this state rather than a shortfall — the spec defines how
the demand will be verified, and the build realizes it.

THE SECOND CASE IS WHAT KEEPS THE FIX HONEST. A signal that takes the surface
over would satisfy the first case and fail the owner's framing, which asks for
transparency and non-intrusiveness in one breath. A fix that passes one and
fails the other has not met the demand.

## Steps

Each case in the named file is one step, and the case name states its claim.

1. `a running operation past its bound is named on the panel` — RED.
   The measure behind it: the signal appears within 1 second of the bound being
   passed, on every operation that passes it. Today a thirty-second pull and a
   hung one look identical to a person watching.
2. `the running signal does not take the panel over` — RED.
   The signal rides beside what the panel already shows rather than replacing
   it. This is the non-intrusive half, and it is a separate case because it
   fails separately.

## What this spec does not cover

WHETHER THE SIGNAL HELPS. That is req-a-slowness-signal-never-shortens-the-wait,
verified by demonstration with people watched, and it is
tsp-a-slow-signal-keeps-the-wait. A signal can be present, prompt and
non-intrusive by these two cases and still drive somebody out of a wait worth
finishing, which is why the two specs are separate rather than one.

THE BOUND ITSELF. req-call-answers-in-one-second and
req-surface-answers-in-one-second still demand the answer INSIDE the bound.
Passing this spec while failing those is not meeting the demand, it is only
having stopped hiding.
