---
minted_in: i44-the-corpus-resolves-duplicate-headings-a
id: raid-asm-the-corpus-stays-small-enough-for-the-sweeps-to-fit-in-boot
type: "[[raid]]"
kind: assumption
statement: "The corpus stays near its present size, so five more sweep passes fit inside boot's exit check without anybody noticing the wait."
owner: the maintainer of the machine
trigger: the first boot whose exit check is visibly slower, or the corpus passing five thousand nodes
status: open
probe: "Measure boot's exit check before and after the last lint is armed, on the same tree, three runs each. Compare the medians against the 892 to 1,178 millisecond baseline recorded on 2026-08-28. A combined exit check past about five seconds falsifies it."
probed: "unprobed 2026-08-28, and the reason is that the thing it is about does not exist. The five lints are unwritten, so the cost of five more passes cannot be measured. The probe runs at verification, against the baseline above."
impact: "Every session pays the exit check before it can work. A sweep set that outgrows the budget taxes every boot for the life of the product, and the cost is invisible because it is spread over everybody."
breaks_how_badly: abrasive
how_likely: plausible
source_refs:
  - req-a-reference-key-resolves-or-is-marked
  - req-a-heading-appears-once-in-a-node
weighs_with: none
weighs_against: none
---

## Where it comes from

THE SET CRITERIA CALLED THE SET AFFORDABLE, and the number behind that word is
one measurement: the conformance sweep read 2,549 nodes in 892 to 1,178
milliseconds, on this box on 2026-08-28.

FIVE MORE PASSES ARE ASSUMED TO BE CHEAP RELATIVE TO THAT. Nobody has measured
them, because they do not exist yet.

## Why it is an assumption and not a decision

THE CORPUS SIZE IS NOT OURS TO SET. It grows with every record, and no rule
caps it. We are relying on it staying in the same order of magnitude.

## Probe

Measure boot's exit check before and after the last lint is armed, on the same
tree, three runs each. Compare the medians against the 892 to 1,178 millisecond
baseline recorded above.

A COMBINED EXIT CHECK PAST ABOUT FIVE SECONDS falsifies it, because that is the
point at which a person waits rather than reads.
