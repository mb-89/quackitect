---
minted_in: i1
id: opt-answer-carries-a-reference
type: "[[option]]"
statement: write the whole record to disk and return a reference to it, so the answer stays small however large the thing it names
cluster: cluster-the-account
found_by: contradiction
source: "TRIZ separation IN SPACE, via meth-triz — the record in one place, the answer in another"
---

## Mechanism

THE CONTRADICTION. Recording everything makes the account complete. It also
makes the answer enormous, and a large answer is moved to disk by the host,
which hands back a preview — so the completeness destroys the readability.

Improving is 24, Loss of information, improved by removing the loss.
Degrading is 9, Speed.

THE SEPARATION IS IN SPACE. Both demands were assumed to apply to one
artifact. They need not. The complete thing lives on disk. The answer carries
a reference and the few lines that decide what to do next.

WHAT IT WOULD COST HERE. `se_run` already does exactly this and calls it a
ref. Nothing else does, and the cost was measured today: four gate forms came
back at 170KB each, the host truncated every one, and the verdict had to be
reconstructed from the evidence files instead of read.

The price is one more hop when the whole thing IS wanted. The refusals
guidance already rules on where the important part goes — at the top, where a
truncating host still shows it — so the two work together.
