---
id: req-two-options-beyond-the-obvious
type: "[[requirement]]"
statement: While the standing options number fewer than two, or every standing option restates the recorded incumbent, the engine shall keep the choosing step closed.
kind: functional
verify_method: test
verified_by:
  - "tests/pugh.test.ts :: fewer than two candidates is a named problem, never a winner"
breaks_if_removed: The obvious answer passes with a token rival, and the choice was never checked against a real alternative.
breaks_how_badly: crippling
refines:
  - uc-diverge-before-deciding
source_refs:
  - uc-diverge-before-deciding step 3
  - ".se/req-mine-v1.md: method and rigor — at least two viable alternatives"
priority: must
---

## Detail

## Detail

- The trigger's obvious answer is recorded as the incumbent. It counts as at most one of the standing options.
- A restatement of the incumbent is not a second option.
