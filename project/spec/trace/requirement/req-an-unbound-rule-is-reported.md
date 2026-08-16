---
minted_in: i6-conformance-goes-mechanical-checks-bind-
id: req-an-unbound-rule-is-reported
type: "[[requirement]]"
statement: When a declared rule binds to nothing the corpus holds, the engine shall report it as unbound rather than passing it silently.
kind: functional
verify_method: test
breaks_if_removed: A rule that cannot fire looks exactly like a rule that never found a violation. The corpus reads as governed and is not, which is worse than an admitted gap because nobody goes looking.
breaks_how_badly: crippling
refines:
  - uc-bind-a-rule-to-what-it-governs
source_refs:
  - uc-bind-a-rule-to-what-it-governs extension 4a
  - note-8355729c239a
  - req-a-check-binds-without-engine-code
priority: must
---

## Detail

A GREEN CHECK MEANS ONE OF TWO THINGS, and today they are the same
bytes.

- NOTHING VIOLATED THE RULE.
- THE RULE NEVER RAN.

The second is the dangerous one, because it strengthens with time.
Nobody re-examines a check that has been passing for months.

## Two ways a rule ends up unbound

IT NAMES A NODE THAT DOES NOT EXIST. A typo, or a node deleted after the
rule was written. The rule sits in the corpus pointing at nothing.

IT BINDS TO SOMETHING NO WRITE TOUCHES. The node exists but nothing ever
writes to it, so the rule is armed over dead ground.

BOTH ARE REPORTED, and the report says which. They have different fixes:
the first is a broken reference, the second is a rule aimed at the wrong
subject.

## Why report rather than refuse

THE SUBJECT PREDATES ANY ONE WRITE, so
`req-a-standing-break-reports-and-lands` applies. An unbound rule is a
property of the corpus, not of the edit that happened to run past it.

AND REFUSING WOULD BE CIRCULAR. A rule that binds to a node somebody is
about to write would refuse the write that fixes it — exactly the trap
`req-a-check-names-its-way-forward` exists to prevent.

## The same shape one level up

THIS ROW IS THE COUNTERPART of the coverage question the corpus already
asks about the register and its folder. A register entry with no file,
and a rule with no subject, are the same defect at two grains — a truth
derived from one side only.

## Behaviour

NO MODEL WANTED. It is a reachability question over a static corpus,
answered once per sweep.
