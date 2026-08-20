---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: raid-iss-a-must-value-prop-is-served-only-by-coulds
type: "[[raid]]"
kind: issue
statement: vp-vendoring is graded must, and every node refining it — the use case and all four requirements — is graded should or could, so the grades disagree about how much this matters.
owner: the owner
trigger: the next time priorities are cut, or the next grade sweep over the corpus
status: open
breaks_how_badly: abrasive
how_likely: expected
impact: "A must served only by coulds is invisible to any check that reads grades. A priority cut looking for coulds would take the entire mechanism serving a must, and nothing would refuse it. It is present tense rather than a risk: the grades stand that way in the corpus today."
source_refs:
  - vp-vendoring
  - uc-vendor-and-overlay
  - req-overlay-resolution
  - req-nothing-a-copy-does-reaches-its-source
  - req-setup-serves-shipped-method
  - req-second-product-reuses-install
---

## The grades, read this session

- vp-vendoring — `priority: must`
- uc-vendor-and-overlay — `priority: could`
- req-overlay-resolution — `priority: should`
- req-nothing-a-copy-does-reaches-its-source — `priority: must`, minted i16, which is the first row serving this proposition at the proposition's own grade
- req-setup-serves-shipped-method — `priority: could`
- req-second-product-reuses-install — `priority: could`

## Why it is an issue and not a risk

IT IS TRUE NOW rather than something that might become true. The nodes carry
those values today and a grade query over the corpus reports them.

## Why it matters more than a tidy-up

vp-vendoring's own reason for being a must is recorded on the node: quackitect
goes open source while company-specific guidance must stay inside the company,
and without vendoring those two facts cannot both hold. That is a constraint on
the product's future, not a preference.

A CUT THAT TRUSTED THE GRADES would drop the coulds and leave the must standing
with nothing under it. Nothing in the corpus refuses that today.

## Why this iteration raises it rather than fixing it

RE-GRADING SIX STANDING NODES IS THE OWNER'S CALL, and doing it from inside the
iteration that benefits would be marking my own work. i16's kickoff raised it in
its red team round for the same reason and left it open.
