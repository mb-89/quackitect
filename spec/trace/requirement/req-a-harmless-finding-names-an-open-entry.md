---
minted_in: i11-the-engine-fix-bundle-about-twenty-named
id: req-a-harmless-finding-names-an-open-entry
type: "[[requirement]]"
statement: While a form carries an owed item, the engine shall refuse the submit unless that item names an open register entry carrying an owner.
kind: functional
verify_method: test
breaks_if_removed: An owed item becomes a way to tick a box nobody has to answer for, and the iteration ships known defects with nothing recording who accepted them.
breaks_how_badly: fatal
refines:
  - uc-take-a-step
source_refs:
  - sty-carry-a-finding-without-stopping
  - uc-take-a-step extension 4d
  - raid-risk-an-owed-item-without-a-guard-ships-a-known-defect
  - req-a-harmless-finding-is-carried-not-stopped-on
  - req-close-refuses-loose-ends
priority: must
---

## Detail

THIS IS THE GUARD HALF, and it is written as its own row because the pair is
easy to split and fatal when split. The permission and the guard are one
feature: carrying a finding is safe only where somebody agreed to carry it.

THE WORD THE PRECEDENT TURNS ON IS "AGREED". NASA NPR 7123.1 closes a review
on the agreed DISPOSITION of every finding rather than on every finding being
fixed. A disposition somebody asserted is not one somebody agreed.

## Why an OPEN entry with an OWNER, and not just any reference

AN ENTRY NOBODY OWNS IS AN ENTRY NOBODY WATCHES. The register's own item
template already refuses an owner field carrying a placeholder, for exactly
this reason.

OPEN IS WHAT MAKES THE CLOSE ABLE TO SEE IT. req-close-refuses-loose-ends
blocks while a loose end stands; an owed item pointing at a closed entry would
read as handled and block nothing.

## The failure this prevents, in its own words

WITHOUT THIS ROW the owed state is strictly weaker than the unchecked box it
replaces: `- [ ]` at least reads as unfinished, while `- [owed]` reads as
dispositioned. A mechanism that makes an open defect LOOK handled is worse
than no mechanism.

## Behaviour

No model wanted. One invariant: a form carrying an owed item whose reference
resolves to nothing, or to a closed entry, or to an entry with no owner, does
not stamp — and the refusal names which.
