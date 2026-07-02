---
id: req-kernel-selftest
type: requirement
refines: [uc-kernel-selftested]
statement: The quack selftest shall verify the trust kernel from baked deterministic corpora with no unseeded randomness — golden hash vectors for norm, h12, statement hash, and the full fold; exact suspect-cone sets on linear, diamond, and shared-subtree fixture DAGs; the gate state-machine walk open, bless, done, dependency change, suspect, re-bless; parser strictness rejections; and attest prev_hash chain verification including the migrated-null anchor and tamper detection.
depends_on: []
class: review
killer: true
---
