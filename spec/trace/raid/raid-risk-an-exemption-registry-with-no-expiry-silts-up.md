---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: raid-risk-an-exemption-registry-with-no-expiry-silts-up
type: "[[raid]]"
kind: risk
statement: An exemption registry that never asks whether an entry is still needed fills with entries whose reason stopped being true, and stops being the map of where the design bends.
owner: the maintainer
trigger: the first design state that specifies the exemption registry, and any review at which the registry has grown since the last one
status: open
impact: The registry's whole value is that a person can read it and see where the design is being bypassed. Entries that are no longer needed dilute that. The reader cannot tell a live exception from a dead one, and the honest response is to stop reading. At that point the registry costs the work of maintaining it and returns nothing.
breaks_how_badly: corrosive
how_likely: expected
source_refs:
  - i54-everything-exported-has-a-door-a-sweep-o
  - raid-asm-the-widget-exemption-shape-generalises-to-a-whole-capability
weighs_with: none
weighs_against: none
---

## The evidence that this is expected rather than plausible

TWO INDEPENDENT TOOLCHAINS BUILT THE MECHANISM, which is what a common failure
looks like from outside.

RUST PUT IT IN THE COMPILER. `#[expect(...)]` suppresses a lint and reports
itself when the lint stops firing. The rustc book says that if the lint "is not
emitted, the `unfulfilled_lint_expectations` lint triggers on the expect
attribute, notifying you that the expectation is no longer fulfilled". Primary
at `doc.rust-lang.org/rustc/lints/levels.html`.

ESLINT TURNED IT ON BY DEFAULT. `reportUnusedDisableDirectives` reports a
disable comment that no longer suppresses anything, and the documentation says
"This setting defaults to `warn`". Primary at
`eslint.org/docs/latest/use/configure/rules`.

NEITHER TEAM BUILT THAT SPECULATIVELY. A default-on warning is what a project
ships after the problem has already cost its users something.

## What we have today

THE WIDGET PRECEDENT HAS NO EXPIRY. `deliverable/machines/widget-exemptions.md`
and the SE-C-146 section of `guidance/refusals.md` give one rule, one registry
and a reason per line. Nothing asks whether a line is still earning its place.

THAT IS SURVIVABLE AT THE WIDGET REGISTRY'S SIZE and is not survivable at the
size a disk door implies, with 79 engine modules importing `node:fs` directly.

## The mitigation, if it is taken

AN ENTRY THAT NO LONGER SUPPRESSES ANYTHING IS REPORTED. That is the shape both
systems above landed on, and it needs no new registry field. The check runs the
rule with the exemption removed and asks whether the rule still fires.

A DATE FIELD IS THE WEAKER ALTERNATIVE and is worth naming as the loser. A
review date makes somebody look, and a mechanical check makes the tool look.
The first depends on a person remembering, which is the thing that failed in
the first place.

## The full prior-art comparison

Written up at
`spec/iterations/i54-everything-exported-has-a-door-a-sweep-o/evidence/prior-art-one-door.md`,
covering six systems read at their own documentation.
