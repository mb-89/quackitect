---
unreachable_citations:
  - scratchpad/reasons.mjs
  - scratchpad/spikes2.mjs
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: raid-asm-a-demanded-reason-is-a-considered-reason
type: "[[raid]]"
kind: assumption
statement: A registry that refuses an entry without a reason collects considered reasons, rather than one boilerplate sentence copied down the column.
owner: the maintainer
trigger: the first design state that specifies the registry's reason field, and any review at which the registry has more entries than the last one
status: probed
impact: The whole claim against the scanned field is that the reason is the product. If the reasons are boilerplate, the registry is a list of bypasses with a decorative column, which is what dependency-cruiser and ArchUnit already give for free and with less work. The differentiator would be gone while the cost stayed.
breaks_how_badly: crippling
how_likely: plausible
probe: HOLDS at 8 percent templated. The earlier reading that no list here refuses a reasonless entry was WRONG - three verbs do, and the amend verb has collected 113 readable reasons. 9 read as one repeated template, and all 9 sit in a single record where an upstream re-sign rippled through a chain of forms.
probed: 2026-08-26
source_refs:
  - i54-everything-exported-has-a-door-a-sweep-o
  - raid-asm-the-widget-exemption-shape-generalises-to-a-whole-capability
  - raid-risk-an-exemption-registry-with-no-expiry-silts-up
weighs_with: none
weighs_against: none
---

## Why this is an assumption and not a hope

THE ITERATION IS ALREADY RELYING ON IT. Every comparison against the six
scanned systems turns on our reasons being worth reading. Rust displays its
reason in the lint message and nobody argues that Rust's `#[allow]` comments
are insightful.

A FIELD IS NOT A DISCIPLINE. Making a field required makes it non-empty. What
makes it useful is that filling it costs enough thought to be worth the reader's
time, and nothing about a required field guarantees that.

## Probe

READ THE WIDGET REGISTRY'S EXISTING ENTRIES, at
`deliverable/machines/widget-exemptions.md`.

FOR EACH ENTRY, ASK ONE QUESTION. Is this reason specific to this line, or
would it read the same under any other line?

TWO COUNTS COME BACK.

- Reasons that name something only true of that one place.
- Reasons that are a general phrase, such as needed for performance or the door
  cannot do this.

WHAT THE RESULT MEANS. Mostly specific confirms it, at the small size the
widget registry has reached. Mostly general falsifies it, and the design must
then find something other than a required field to make the reason worth
writing.

THE SAMPLE IS SMALL AND THAT IS A LIMIT ON THE PROBE, not a reason to skip it.
One registry written by people who knew it was an experiment is weak evidence
about a registry written under deadline. Say so when the result is recorded.

WHO RUNS IT: the walker of the state that specifies the registry.

## What a stronger design would do instead

TWO OPTIONS ARE WORTH COMPARING WHEN THIS IS PROBED, and neither is a longer
field.

- REFUSE A REASON THAT ALREADY APPEARS. A duplicate sentence is the exact
  symptom, and the corpus already has a verbatim-overlap check for a different
  purpose.
- MAKE THE REASON NAME SOMETHING CHECKABLE. A reason that must cite a file, a
  line or a register entry cannot be copied down a column without becoming
  wrong.

## Probe result, 2026-08-26 — the first reading

NOT PROBEABLE IN THIS TREE, and that is the finding rather than a failure to
look.

THE ASSUMPTION IS ABOUT A REGISTRY THAT REFUSES AN ENTRY WITHOUT A REASON. No
such registry exists here.

`scratchpad/spikes2.mjs` found ONE departure list in the whole of
`deliverable/machines`, and `deliverable/engine/widgets.ts` line 108 states the
opposite behaviour in its own comment:

> A BULLET WITH NO REASON IS IGNORED.

IGNORED IS NOT REFUSED. A reasonless entry is dropped silently, so nobody is
ever asked for a reason and the assumption has nothing to be true or false
about.

THE MACHINERY EXISTS ELSEWHERE, which is worth saying because it makes the fix
cheap. `deliverable/engine/session.ts` line 1394 already carries
`if (reason.trim() === "")` for a different field. Refusing an empty reason is
a shape this engine already knows.

WHAT WOULD MAKE IT PROBEABLE is exactly the graft this record adopted: the
entry cannot be written without a reason, and the remedy stops pre-filling the
slot. Once that ships, this assumption has a population to be measured against.

## Probe result, 2026-08-26 — the corrected reading

HOLDS. 104 OF 113 COLLECTED REASONS ARE CONSIDERED.

### The earlier reading was wrong, and this corrects it

This record had recorded the assumption as not probeable, on the grounds that no list here refuses a reasonless entry.

Three verbs do refuse one.

- `deliverable/engine/session.ts:1394` — the escape hatch.
- `deliverable/engine/sessionclaims.ts:903` — a claim verb.
- `deliverable/engine/sessionclaims.ts:995` — the amend, which says an amend that says nothing is an untracked edit.

Two more mechanisms fall short of a refusal and are worth naming. `deliverable/engine/calllog.ts:192` MARKS a weaker walk with no reason as `unreasoned`. `deliverable/engine/stateform-problems.ts:866` REPORTS a rank-cut row moved with no reason as a form problem.

Only the widget exemption list IGNORES a missing reason, and its own file says so on purpose. That one case was mistaken for the whole tree.

### The population and the count

Every amend writes its reason onto the evidence file, so the reasons are readable at rest. `scratchpad/reasons.mjs` pulled all 113, across 15 records.

The classifier rule was fixed before counting: a reason is templated if it says an upstream state re-signed and this form's contents are unchanged.

It flagged 17. Eight are false positives, each read individually to confirm it. That leaves 9, or 8.0 percent.

### The nine are one cluster

All nine sit in `i33-every-interface-a-person-or-an-agent-tou`, and they are 9 of that record's 20.

Every other record scores zero, including the three largest populations at 17, 11 and 10 reasons.

Mean length is a second, independent measure. The templated pile averages 95 characters; the considered pile averages 139.

### What the cluster means

The nine came from one author re-stamping a chain of forms after an upstream re-sign. In each case the honest reason genuinely is that nothing here moved.

THE MECHANISM ASKED A QUESTION WHOSE ANSWER WAS THE SAME NINE TIMES. That is a mechanism which should have asked once, rather than an author writing thin reasons.

### What the run relied on

The classifier is a proxy for a judgment and is marked as one. Without the hand-check the answer would have read 15.0 percent instead of 8.0 percent, so the proxy nearly doubled the figure.
