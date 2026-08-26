---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: opt-the-no-match-is-a-returned-value-not-an-absence
type: "[[option]]"
cluster: the-sizing
question: what happens when no rung matches
statement: the block always returns a value and no-match is one of the values it can return, named in the same vocabulary as a driver, so a receiver never has to distinguish a silence from a failure
found_by: prior-art
source: XACML's four-value decision vocabulary, where NotApplicable is a standardised returned result rather than an absent one — commissioned deep scan, 2026-08-20
---

## Mechanism

THE STANDARD SETTLED THIS TWENTY YEARS AGO AND WE DID NOT KNOW. XACML's policy
decision point returns one of four values — Permit, Deny, Indeterminate,
NotApplicable — and the last two are the interesting ones. NotApplicable means no
policy matched. Indeterminate means the evaluation itself failed. They are
different results and both are results.

OUR REQUIREMENT PUBLISHES NOTHING INSTEAD.
req-an-unmatched-rung-names-itself-and-publishes-no-driver says the block names
itself and publishes no driver. That leaves a receiver with an absence, and an
absence is ambiguous in exactly the way the standard's fourth value exists to
prevent: nothing arrived because nothing matched, nothing arrived because the
block crashed, and nothing arrived because the block never ran all look the same
on the wire.

WHAT THE OPTION CHANGES. The published thing is always a decision. Its value may
be a rung, or `not-applicable` with the difficulty that found no match, or
`indeterminate` with what went wrong. The receiver switches on a value it always
has rather than on a timeout.

IT MAKES THE SAFETY RULE READ AS A VALUE RATHER THAN AS A GAP.
req-the-machine-names-a-driver-and-starts-nothing is about not spawning; this is
about the shape of what is said. A machine that returns not-applicable has plainly
not instructed anything, and it has said so in a form somebody can log, count and
alert on.

AND IT PAIRS WITH TOTALITY CHECKING.
opt-the-mapping-is-checked-for-totality-when-the-machine-compiles makes no-match
unreachable at run time; this makes it legible if it happens anyway. Taking both
is belt and braces, and taking only the second is the cheaper half.

WHAT IT COSTS: a vocabulary that is now three kinds of thing rather than one, and
a receiver that must handle values it will almost never see — which is the usual
way a fourth value ends up unhandled in practice.
