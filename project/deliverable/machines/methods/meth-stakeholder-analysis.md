---
kind: method
statement: "Stakeholder analysis: find every role, then place it on the portfolio with its disposition."
---

## Situation

Guidance for M2 map-stakeholders. This is the one card the step draws from.

A stakeholder provides input, expects results, or is affected without asking
to be. Different groups matter for requirements, for architecting, and for
portfolio decisions.

## Where stakeholders come from

Three sources, in this order. The first is the cheapest and is usually
skipped.

### 1. The value propositions

Every value prop names an `audience`. That audience is a stakeholder, and the
props are the reason the product exists, so they come first.

Sweep them and ask what each one is FOR. A prop whose audience resolves to no
node is a hole. A node no prop serves is a role nobody is building for, which
is worth noticing rather than hiding.

### 2. The always-on classes

Some roles are served by every project, whatever it builds. Walk the register
and keep or strike each one deliberately.

- acquirer — decides whether to fund, buy or adopt.
- user — operates the thing.
- newcomer — arrives with no context and has to get oriented.
- communicator — explains the thing to others.
- assessor — judges whether it is sound.
- project-owner — carries the effort.
- agent — an AI operating on or retrieving from the project.

A product with hardware or a service life adds more.

- developer-maintainer
- installer-commissioner
- integrator
- operator-sysadmin
- production-engineer
- regulator-certifier
- service-technician
- supplier
- tester
- transport-logistics
- end-of-life

### 3. The project and the organisation

- Who funds it.
- Who must approve it.
- Who inherits it when this effort ends.
- Who is affected without ever being asked.

These never fall out of the value props, and they are the ones a walk misses.

## Procedure

- ROLES, NEVER PERSONS. One person may hold several roles, and the role
  outlives the person. This is also the privacy law.
- TYPE each role. The DICET set: Decider (formal power, holds the budget),
  Influencer (informal power), Customer (provides requirements), Expert
  (know-how), Team (will work on the thing).
- PLACE each on the portfolio: INTEREST against INFLUENCE. High on both means
  take care of them.
- MARK THE DISPOSITION in each cell — how the role stands toward the effort.
  `++` wins if you win, down to `--` loses if you win, with `0` neutral.
- An antagonist gets a ROOT CAUSE, never a route around. The goal is turning
  them into a protagonist.
- MARK ADAPTABILITY, innovator against conservative, where change is part of
  what ships.
- CHECK CONTACT. Each role needs some intensity of contact — necessary,
  helpful, or on-demand. Compare it against the contact that actually exists.

## Who needs what depth

The Stakeholder/View matrix. Rows are stakeholders, columns are views, and
each cell says what depth that role needs of that view.

It prioritises documentation work, and it is what the book's entry page
derives from. A role that needs one view deeply and the rest not at all is
the normal case, and writing everything for everyone is the failure it
prevents.

## Coverage is the check

This is what the step actually proves, and what the M2 gate reads.

- Every value prop's audience resolves to a role that exists.
- Every always-on class is present, or explicitly ruled out with its reason.
- At M3 every requirement sources to a role that exists here. A goal without
  a traceable stakeholder is a wish.

## Tensions are RAID entries

Where two roles pull against each other, that is a
RISK. It goes in the RAID register with an owner and a trigger, like any
other risk. It is not a table of its own.

The evidence for the ruling is in both earlier versions of this system. v1
modelled a tension as a connection node and minted ZERO across 27
iterations. v2 made it a required field, and every entry it collected read as
a risk with a mitigation — one of them pointing at a RAID entry outright.

See [[meth-stakeholder-tensions]], which now says only this.

## Sources

- SyA Situation Analysis (Kreuter 2022, owner-mapped digest @ai/sya_kb) —
  the stakeholder portfolio, and the DICET roles from "Roles in a Buying
  Center".
- Software Architecture in Practice (Bass, Clements, Kazman) — the
  Stakeholder/View matrix.
- The always-on class register, harvested from v1 at ref main
  (`product/quackitect/project_types/classes/`).
