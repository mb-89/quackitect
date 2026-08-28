---
form: find_prior_art
judgment: passed at 2026-08-26T15:30:50.755Z with deliverable/engine/bin/outward-search.ts@6a89bb9173af
by: agent
signed_off: 2026-08-26T12:09:01.058Z
authors: agent
files: null
---

# Evidence form / find_prior_art

## current_situation

One function cluster stands for this record — the door regime, six functions holding one conversation to one stated rule.

The external sweep was already done at M1 and its six-system comparison stands in this record's own prior-art-one-door.md.

What had NOT been done is the predecessor sweep, and the card is emphatic that it is the one people skip. It paid immediately.

## applies

yes

## options

- spec/trace/option/opt-the-door-is-the-default-and-the-way-round-it-is-recorded.md
- spec/trace/option/opt-one-place-builds-what-a-caller-may-reach-and-it-is-a-whitelist.md
- spec/trace/option/opt-a-departure-cites-a-decision-node-rather-than-carrying-prose.md
- spec/trace/option/opt-drain-to-zero-then-arm-the-rule-with-no-departures-at-all.md
- spec/trace/option/opt-a-departure-that-has-stopped-being-needed-is-reported.md
- spec/trace/option/opt-freeze-the-standing-violations-and-let-the-count-only-fall.md
- spec/trace/option/opt-one-departure-covers-a-named-group-of-callers.md

## literature

THE PRIMARY WAS READ RATHER THAN AN ACCOUNT OF IT. Cockburn's hexagonal architecture paper, HaT Technical Report 2005.02, at alistair.cockburn.us/hexagonal-architecture. Two sentences did the work here.

The first is the definition: "A port identifies a purposeful conversation." The second is his worked failure — a weather system whose four interfaces were "identified and discussed by technology, linked to purpose", and whose fix was "to architect the system's interfaces by purpose rather than by technology, and to have the technologies be substitutable (on all sides) by adapters."

He also gives a port count. "My selection tends to favor a small number, two, three or four ports", and he says the wrong number does no particular damage. That figure is what made four doors worth remarking on rather than merely reporting.

AND HE SAYS WHERE THE PORTS COME FROM — follow the use case context diagram, and draw the primary ports and adapters on the left of the hexagon and the secondary ones on the right. That instruction is what the neighbours walk executed.

THE SIX-SYSTEM COMPARISON stands in prior-art-one-door.md and is not repeated here. Its one axis was whether a system can force a reason for a departure, and only ESLint can, through an opt-in third-party plugin.

WHAT THE LITERATURE DOES NOT COVER. Nothing found addresses a rule whose two callers are a write-time refusal and a whole-tree sweep reading one expression. The pattern literature treats enforcement as a build step, and the write-time half has no published account.

## shipped

THE PREDECESSOR IS THE FINDING, and it is worth the four entries separately.

ADR-IO-LANE-DEFAULT, at ref v2. This exact question was already adjudicated once, for the agent's file edits. The ruling is three-tiered — the door is the default, one narrow interactive case keeps its own path, and a byte-safe scripted edit is a recorded exception. The rejected option is named, which is the rarest thing a sweep can find: universal mediation with the direct path retired. It lost on edit latency and harness ergonomics, and the ruling records what would reverse it.

ADR-GRANDFATHERS-HISTORICAL, at ref v2. Departures already carry a CITATION rather than a sentence, and a departure citing nothing fails a named test. That is stronger than what this record's requirements ask for, and it answers the open question on the reason-quality assumption directly.

ADR-VOICE-RATCHET, at ref v2. The opposite ruling, for a different rule, on stated grounds — correct the history, never exempt it, because exemptions freeze debt and teach nothing. The two rulings together say the choice is per-rule rather than a house policy.

RAID-THE-ENGINE-INHERITS-EVERYTHING-BY-DEFAULT, at ref v2. The owner's standing law is recorded there in their own terms — guards are WHITELISTS — and the recorded fix is one place that builds what a caller may reach, used by every call site. Three defects in one day paid for it, and two of the three failed silently.

REVERSE ENGINEERING, ON OUR OWN ARTIFACT. deliverable/engine/widgets.ts line 136 shows the current departure grammar as a regular expression, and it demands exactly one non-space character after the dash. deliverable/engine/trace.ts line 333 shows the same shape at node level, refusing an EARS exemption that carries no reason. Neither refuses the write; both report.

COMPETITORS were swept at M1 and are not re-swept here.

## dry_wells

- The write-time half of the rule. Every system compared enforces at build or review time, and none was found that refuses the write itself, so this half of the design has no incumbent to learn from.
- One rule expressed once and read by two callers. Each system has one enforcement path, so the two-caller shape is unattested rather than rejected.
- The engine's own reach, as opposed to the agent's. Every account found governs what a CALLER outside the system may do; nothing was found about a system holding itself to a rule about its own internals.

## follow_up

THE PREDECESSOR SWEEP SHOULD RUN AT M1, NOT M4. It cost two searches and four reads, and it turned up the same decision already adjudicated with its loser and its reversal trigger recorded. Everything written before it was written without knowing that.

THE THREE-TIER SHAPE FROM adr-io-lane-default IS THE STRONGEST CANDIDATE INPUT and it changes what the other finders should look for. A middle tier of named narrow cases is a cell nobody had drawn.

THE TWO OPPOSITE PREDECESSOR RULINGS ARE A QUESTION FOR THE CHOICE, not a contradiction to resolve here. Which of the two applies turns on whether correcting the standing violations teaches anybody anything, and 79 modules is where that gets decided.

## anything_else

ONE THING THE SWEEP CHANGED ABOUT THIS RECORD'S OWN CLAIMS.

The requirement that a reasonless departure be refused at write time was written as a generalisation of the widget guard. The predecessor shows it is not a generalisation at all — v2 already demanded a CITATION rather than a reason, and enforced it with a test.

So our requirement is WEAKER than what the predecessor shipped, not stronger. A sentence can be copied down a column; a citation cannot.

That is not a defect in the requirement, which says what it says and is checkable. It is a finding about where the bar already sat, and the option node carries it into the chart so the choice is made rather than inherited.
